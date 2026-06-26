(function () {
    const sb = window.supabaseClient;
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const addForm = document.getElementById('add-form');
    const portfolioList = document.getElementById('portfolio-list');
    const configWarning = document.getElementById('config-warning');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');
    const formCard = document.getElementById('form-card');

    let pendingThumb = null;
    let pendingImages = [];
    let editingId = null;
    let existingThumbUrl = null;
    let existingImages = [];
    let removedImageIds = [];

    function toast(msg, isError) {
        const el = document.getElementById('admin-toast');
        el.textContent = msg;
        el.classList.toggle('error', !!isError);
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 3000);
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function showDashboard(show) {
        loginSection.classList.toggle('admin-hidden', show);
        dashboardSection.classList.toggle('admin-hidden', !show);
        logoutBtn.classList.toggle('admin-hidden', !show);
    }

    function setEditMode(isEdit) {
        document.getElementById('form-heading').textContent = isEdit ? '포트폴리오 수정' : '새 포트폴리오 등록';
        document.getElementById('submit-btn').textContent = isEdit ? '저장하기' : '등록하기';
        cancelEditBtn.classList.toggle('admin-hidden', !isEdit);
    }

    function resetForm() {
        editingId = null;
        existingThumbUrl = null;
        existingImages = [];
        removedImageIds = [];
        pendingThumb = null;
        pendingImages = [];
        addForm.reset();
        setEditMode(false);
        renderPreviews();
    }

    async function checkSession() {
        if (!sb) {
            configWarning.classList.remove('admin-hidden');
            return;
        }
        configWarning.classList.add('admin-hidden');
        const { data: { session } } = await sb.auth.getSession();
        showDashboard(!!session);
        if (session) {
            loadPortfolioList();
            window.AdminInquiries?.onLogin();
        }
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!sb) return toast('Supabase 설정이 필요합니다.', true);
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const btn = loginForm.querySelector('button[type=submit]');
        btn.disabled = true;
        const { error } = await sb.auth.signInWithPassword({ email, password });
        btn.disabled = false;
        if (error) return toast(error.message, true);
        toast('로그인되었습니다.');
        showDashboard(true);
        loadPortfolioList();
        window.AdminInquiries?.onLogin();
    });

    logoutBtn.addEventListener('click', async () => {
        await sb.auth.signOut();
        showDashboard(false);
        resetForm();
        toast('로그아웃되었습니다.');
    });

    cancelEditBtn.addEventListener('click', () => {
        resetForm();
        toast('수정을 취소했습니다.');
    });

    function sortOrderValue(offset = 0) {
        return Math.floor(Date.now() / 1000) - offset;
    }

    async function uploadFile(file, folder) {
        const ext = file.name.split('.').pop();
        const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await sb.storage.from('portfolio').upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = sb.storage.from('portfolio').getPublicUrl(path);
        return data.publicUrl;
    }

    function setupFileZone(zoneId, inputId, onFiles) {
        const zone = document.getElementById(zoneId);
        const input = document.getElementById(inputId);
        zone.addEventListener('click', () => input.click());
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            onFiles(Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/')));
        });
        input.addEventListener('change', () => {
            onFiles(Array.from(input.files));
            input.value = '';
        });
    }

    function getThumbPreviewSrc() {
        if (pendingThumb) return URL.createObjectURL(pendingThumb);
        if (existingThumbUrl) return existingThumbUrl;
        return null;
    }

    function renderPreviews() {
        const thumbGrid = document.getElementById('thumb-preview');
        const imagesGrid = document.getElementById('images-preview');
        const thumbSrc = getThumbPreviewSrc();

        thumbGrid.innerHTML = thumbSrc
            ? `<div class="admin-preview-item">
                <img src="${thumbSrc}" alt="">
                <span class="badge">썸네일</span>
                <button type="button" class="remove-btn" data-type="thumb">&times;</button>
               </div>`
            : '';

        const existingHtml = existingImages
            .filter(img => !removedImageIds.includes(img.id))
            .map(img => `
                <div class="admin-preview-item">
                    <img src="${img.url}" alt="">
                    <button type="button" class="remove-btn" data-existing="${img.id}">&times;</button>
                </div>
            `).join('');

        const newHtml = pendingImages.map((f, i) => `
            <div class="admin-preview-item">
                <img src="${URL.createObjectURL(f)}" alt="">
                <button type="button" class="remove-btn" data-idx="${i}">&times;</button>
            </div>
        `).join('');

        imagesGrid.innerHTML = existingHtml + newHtml;

        thumbGrid.querySelector('.remove-btn')?.addEventListener('click', () => {
            pendingThumb = null;
            existingThumbUrl = null;
            renderPreviews();
        });

        imagesGrid.querySelectorAll('[data-existing]').forEach(btn => {
            btn.addEventListener('click', () => {
                removedImageIds.push(btn.dataset.existing);
                renderPreviews();
            });
        });

        imagesGrid.querySelectorAll('[data-idx]').forEach(btn => {
            btn.addEventListener('click', () => {
                pendingImages.splice(Number(btn.dataset.idx), 1);
                renderPreviews();
            });
        });
    }

    setupFileZone('thumb-zone', 'thumb-input', (files) => {
        if (files[0]) {
            pendingThumb = files[0];
            existingThumbUrl = null;
            renderPreviews();
        }
    });

    setupFileZone('images-zone', 'images-input', (files) => {
        pendingImages.push(...files);
        renderPreviews();
    });

    function getRemainingDetailCount() {
        const keptExisting = existingImages.filter(img => !removedImageIds.includes(img.id)).length;
        return keptExisting + pendingImages.length;
    }

    addForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!sb) return;

        const title = document.getElementById('item-title').value.trim();
        if (!title) return toast('제목을 입력해 주세요.', true);

        const hasThumb = pendingThumb || existingThumbUrl;
        if (!hasThumb) return toast('썸네일 이미지를 선택해 주세요.', true);

        if (!editingId && getRemainingDetailCount() === 0) {
            return toast('상세 이미지를 1장 이상 선택해 주세요.', true);
        }

        const btn = document.getElementById('submit-btn');
        btn.disabled = true;
        const prevLabel = btn.textContent;
        btn.textContent = editingId ? '저장 중...' : '업로드 중...';

        try {
            if (editingId) {
                await updateItem(title);
            } else {
                await createItem(title);
            }
        } catch (err) {
            toast(err.message || (editingId ? '저장 실패' : '업로드 실패'), true);
        } finally {
            btn.disabled = false;
            btn.textContent = prevLabel;
        }
    });

    async function createItem(title) {
        const thumbUrl = await uploadFile(pendingThumb, 'thumbs');
        const imageUrls = [];
        for (const file of pendingImages) {
            imageUrls.push(await uploadFile(file, 'gallery'));
        }

        const { data: item, error: itemErr } = await sb.from('portfolio_items').insert({
            title,
            thumb_url: thumbUrl,
            category: document.getElementById('item-category').value || null,
            sort_order: sortOrderValue()
        }).select().single();

        if (itemErr) throw itemErr;

        if (imageUrls.length) {
            const rows = imageUrls.map((url, i) => ({
                portfolio_id: item.id,
                image_url: url,
                sort_order: i
            }));
            const { error: imgErr } = await sb.from('portfolio_images').insert(rows);
            if (imgErr) throw imgErr;
        }

        toast('포트폴리오가 등록되었습니다.');
        resetForm();
        loadPortfolioList();
    }

    async function updateItem(title) {
        let thumbUrl = existingThumbUrl;
        if (pendingThumb) {
            thumbUrl = await uploadFile(pendingThumb, 'thumbs');
        }

        const { error: itemErr } = await sb.from('portfolio_items').update({
            title,
            thumb_url: thumbUrl,
            category: document.getElementById('item-category').value || null
        }).eq('id', editingId);

        if (itemErr) throw itemErr;

        const keptUrls = existingImages
            .filter(img => !removedImageIds.includes(img.id))
            .map(img => img.url);

        for (const file of pendingImages) {
            keptUrls.push(await uploadFile(file, 'gallery'));
        }

        const { error: clearErr } = await sb.from('portfolio_images')
            .delete()
            .eq('portfolio_id', editingId);
        if (clearErr) throw clearErr;

        if (keptUrls.length) {
            const rows = keptUrls.map((url, i) => ({
                portfolio_id: editingId,
                image_url: url,
                sort_order: i
            }));
            const { error: imgErr } = await sb.from('portfolio_images').insert(rows);
            if (imgErr) throw imgErr;
        }

        toast('포트폴리오가 수정되었습니다.');
        resetForm();
        loadPortfolioList();
    }

    async function openEdit(id) {
        const { data: item, error } = await sb
            .from('portfolio_items')
            .select('*, portfolio_images(id, image_url, sort_order)')
            .eq('id', id)
            .single();

        if (error) return toast(error.message, true);

        editingId = item.id;
        existingThumbUrl = item.thumb_url;
        existingImages = (item.portfolio_images || [])
            .sort((a, b) => a.sort_order - b.sort_order)
            .map(img => ({ id: img.id, url: img.image_url }));
        removedImageIds = [];
        pendingThumb = null;
        pendingImages = [];

        document.getElementById('item-title').value = item.title;
        document.getElementById('item-category').value = item.category || '';
        setEditMode(true);
        renderPreviews();
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function loadPortfolioList() {
        portfolioList.innerHTML = '<div class="admin-loading">불러오는 중...</div>';
        const { data: items, error } = await sb
            .from('portfolio_items')
            .select('*, portfolio_images(id)')
            .order('sort_order', { ascending: false });

        if (error) {
            portfolioList.innerHTML = `<div class="admin-empty">오류: ${escapeHtml(error.message)}</div>`;
            return;
        }

        if (!items.length) {
            portfolioList.innerHTML = renderEmptyList();
            return;
        }

        portfolioList.innerHTML = `<div class="admin-list">${items.map(item => `
            <div class="admin-list-item" data-id="${item.id}">
                <img src="${item.thumb_url}" alt="">
                <div class="info">
                    <p class="title">${escapeHtml(item.title)}</p>
                    <p class="meta">${escapeHtml(item.category || '카테고리 없음')} · 이미지 ${(item.portfolio_images || []).length}장</p>
                </div>
                <div class="actions">
                    <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" data-edit="${item.id}">수정</button>
                    <button type="button" class="admin-btn admin-btn-danger" data-delete="${item.id}">삭제</button>
                </div>
            </div>`).join('')}</div>`;

        portfolioList.querySelectorAll('[data-edit]').forEach(btn => {
            btn.addEventListener('click', () => openEdit(btn.dataset.edit));
        });
        portfolioList.querySelectorAll('[data-delete]').forEach(btn => {
            btn.addEventListener('click', () => deleteItem(btn.dataset.delete));
        });
    }

    async function deleteItem(id) {
        if (!confirm('이 포트폴리오를 삭제할까요?')) return;
        if (editingId === id) resetForm();
        const { error } = await sb.from('portfolio_items').delete().eq('id', id);
        if (error) return toast(error.message, true);
        toast('삭제되었습니다.');
        loadPortfolioList();
    }

    function renderEmptyList() {
        return `<div class="admin-empty">
            <p>등록된 포트폴리오가 없습니다.</p>
            <p class="admin-empty-hint">썸네일 1장 + 상세 이미지 1장 이상을 업로드한 뒤 등록하기를 눌러주세요.</p>
        </div>`;
    }

    checkSession();
})();
