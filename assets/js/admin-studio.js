(function () {
    const listEl = document.getElementById('studio-list');
    const form = document.getElementById('studio-form');
    const formCard = document.getElementById('studio-form-card');
    const cancelBtn = document.getElementById('studio-cancel-edit-btn');
    if (!listEl || !form) return;

    let editingId = null;
    let existingImageUrl = null;
    let pendingImage = null;

    function getClient() {
        return window.supabaseClient;
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    function toast(msg, isError) {
        const el = document.getElementById('admin-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.toggle('error', !!isError);
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 3000);
    }

    function sortOrderValue(offset = 0) {
        return Math.floor(Date.now() / 1000) - offset;
    }

    function makeSlug(title) {
        return String(title || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    function getFormData() {
        const title = document.getElementById('studio-title').value.trim();
        const slugInput = document.getElementById('studio-slug').value.trim();
        return {
            title,
            slug: slugInput || makeSlug(title) || null,
            description: document.getElementById('studio-description').value.trim(),
            branch: document.getElementById('studio-branch').value.trim() || null,
            category: document.getElementById('studio-category').value.trim() || null,
            address: document.getElementById('studio-address').value.trim() || null,
            area: document.getElementById('studio-area').value.trim() || null,
            size_spec: document.getElementById('studio-size').value.trim() || null,
            power: document.getElementById('studio-power').value.trim() || null,
            facilities: document.getElementById('studio-facilities').value.trim() || null,
            amenities: document.getElementById('studio-amenities').value.trim() || null
        };
    }

    function fillForm(item) {
        document.getElementById('studio-slug').value = item.slug || '';
        document.getElementById('studio-title').value = item.title || '';
        document.getElementById('studio-description').value = item.description || '';
        document.getElementById('studio-branch').value = item.branch || '';
        document.getElementById('studio-category').value = item.category || '';
        document.getElementById('studio-address').value = item.address || '';
        document.getElementById('studio-area').value = item.area || '';
        document.getElementById('studio-size').value = item.size_spec || '';
        document.getElementById('studio-power').value = item.power || '';
        document.getElementById('studio-facilities').value = item.facilities || '';
        document.getElementById('studio-amenities').value = item.amenities || '';
    }

    function setEditMode(isEdit) {
        document.getElementById('studio-form-heading').textContent = isEdit ? '스튜디오 수정' : '스튜디오 추가';
        document.getElementById('studio-submit-btn').textContent = isEdit ? '저장하기' : '등록하기';
        cancelBtn.classList.toggle('admin-hidden', !isEdit);
    }

    function resetForm() {
        editingId = null;
        existingImageUrl = null;
        pendingImage = null;
        form.reset();
        setEditMode(false);
        renderImagePreview();
    }

    async function uploadFile(file) {
        const sb = getClient();
        const ext = file.name.split('.').pop();
        const path = `studio/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const { error } = await sb.storage.from('portfolio').upload(path, file, { upsert: false });
        if (error) throw error;
        const { data } = sb.storage.from('portfolio').getPublicUrl(path);
        return data.publicUrl;
    }

    function renderImagePreview() {
        const grid = document.getElementById('studio-image-preview');
        const src = pendingImage
            ? URL.createObjectURL(pendingImage)
            : existingImageUrl;

        grid.innerHTML = src
            ? `<div class="admin-preview-item">
                <img src="${src}" alt="">
                <span class="badge">사진</span>
                <button type="button" class="remove-btn" id="studio-remove-image">&times;</button>
               </div>`
            : '';

        document.getElementById('studio-remove-image')?.addEventListener('click', () => {
            pendingImage = null;
            existingImageUrl = null;
            renderImagePreview();
        });
    }

    function setupFileZone() {
        const zone = document.getElementById('studio-image-zone');
        const input = document.getElementById('studio-image-input');
        if (!zone || !input) return;

        zone.addEventListener('click', () => input.click());
        zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('dragover'); });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            const file = Array.from(e.dataTransfer.files).find(f => f.type.startsWith('image/'));
            if (file) { pendingImage = file; existingImageUrl = null; renderImagePreview(); }
        });
        input.addEventListener('change', () => {
            if (input.files[0]) {
                pendingImage = input.files[0];
                existingImageUrl = null;
                renderImagePreview();
            }
            input.value = '';
        });
    }

    async function loadList() {
        const sb = getClient();
        if (!sb) {
            listEl.innerHTML = '<div class="admin-empty">Supabase 설정이 필요합니다.</div>';
            return;
        }

        listEl.innerHTML = '<div class="admin-loading">불러오는 중...</div>';
        const { data: items, error } = await sb
            .from('studio_items')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            listEl.innerHTML = `<div class="admin-empty">오류: ${escapeHtml(error.message)}</div>`;
            return;
        }

        if (!items.length) {
            listEl.innerHTML = `<div class="admin-empty">
                등록된 스튜디오가 없습니다.<br>
                <span class="admin-empty-hint">추가하지 않으면 홈 화면에 기본 스튜디오 4개가 표시됩니다.</span>
            </div>`;
            return;
        }

        listEl.innerHTML = `<div class="admin-list">${items.map(item => `
            <div class="admin-list-item" data-id="${item.id}">
                <img src="${item.image_url}" alt="">
                <div class="info">
                    <p class="title">${escapeHtml(item.title)}</p>
                    <p class="meta">${escapeHtml(item.description)}</p>
                </div>
                <div class="actions">
                    <button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" data-edit-studio="${item.id}">수정</button>
                    <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" data-delete-studio="${item.id}">삭제</button>
                </div>
            </div>
        `).join('')}</div>`;

        listEl.querySelectorAll('[data-edit-studio]').forEach(btn => {
            btn.addEventListener('click', () => openEdit(btn.dataset.editStudio));
        });
        listEl.querySelectorAll('[data-delete-studio]').forEach(btn => {
            btn.addEventListener('click', () => deleteItem(btn.dataset.deleteStudio));
        });
    }

    async function openEdit(id) {
        const sb = getClient();
        const { data: item, error } = await sb
            .from('studio_items')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return toast(error.message, true);

        editingId = item.id;
        existingImageUrl = item.image_url;
        pendingImage = null;
        fillForm(item);
        setEditMode(true);
        renderImagePreview();
        formCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    async function deleteItem(id) {
        const sb = getClient();
        if (!confirm('이 스튜디오 항목을 삭제할까요?')) return;
        if (editingId === id) resetForm();
        const { error } = await sb.from('studio_items').delete().eq('id', id);
        if (error) return toast(error.message, true);
        toast('삭제되었습니다.');
        loadList();
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const sb = getClient();
        if (!sb) return toast('Supabase 설정이 필요합니다.', true);

        const data = getFormData();
        if (!data.title) return toast('이름을 입력해 주세요.', true);
        if (!data.description) return toast('한 줄 설명을 입력해 주세요.', true);
        if (!pendingImage && !existingImageUrl) return toast('사진을 선택해 주세요.', true);

        const btn = document.getElementById('studio-submit-btn');
        btn.disabled = true;
        const prevLabel = btn.textContent;
        btn.textContent = editingId ? '저장 중...' : '업로드 중...';

        try {
            let imageUrl = existingImageUrl;
            if (pendingImage) imageUrl = await uploadFile(pendingImage);

            const payload = { ...data, image_url: imageUrl };

            if (editingId) {
                const { error } = await sb.from('studio_items').update(payload).eq('id', editingId);
                if (error) throw error;
                toast('스튜디오가 수정되었습니다.');
            } else {
                const { error } = await sb.from('studio_items').insert({
                    ...payload,
                    sort_order: sortOrderValue()
                });
                if (error) throw error;
                toast('스튜디오가 등록되었습니다.');
            }

            resetForm();
            loadList();
        } catch (err) {
            toast(err.message || '저장 실패', true);
        } finally {
            btn.disabled = false;
            btn.textContent = prevLabel;
        }
    });

    cancelBtn?.addEventListener('click', () => {
        resetForm();
        toast('수정을 취소했습니다.');
    });

    setupFileZone();

    window.AdminStudio = { loadList };
})();
