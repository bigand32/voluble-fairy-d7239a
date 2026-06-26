(function () {
    const sb = window.supabaseClient;
    const listEl = document.getElementById('inquiry-list');
    const badgeEl = document.getElementById('inquiry-badge');
    const filterEl = document.getElementById('inquiry-filter');
    if (!listEl) return;

    let filter = 'all';
    let tabsReady = false;

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    function formatDate(iso) {
        return new Date(iso).toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function toast(msg, isError) {
        const el = document.getElementById('admin-toast');
        if (!el) return;
        el.textContent = msg;
        el.classList.toggle('error', !!isError);
        el.classList.add('show');
        setTimeout(() => el.classList.remove('show'), 3000);
    }

    function updateBadge(count) {
        if (!badgeEl) return;
        if (count > 0) {
            badgeEl.textContent = count > 99 ? '99+' : String(count);
            badgeEl.classList.remove('admin-hidden');
        } else {
            badgeEl.classList.add('admin-hidden');
        }
    }

    async function loadUnreadCount() {
        if (!sb) return;
        const { count, error } = await sb
            .from('contact_inquiries')
            .select('*', { count: 'exact', head: true })
            .eq('is_read', false);
        if (!error) updateBadge(count || 0);
    }

    async function loadInquiries() {
        if (!sb) return;
        listEl.innerHTML = '<div class="admin-loading">불러오는 중...</div>';

        let query = sb
            .from('contact_inquiries')
            .select('*')
            .order('created_at', { ascending: false });

        if (filter === 'unread') query = query.eq('is_read', false);

        const { data: items, error } = await query;

        if (error) {
            listEl.innerHTML = `<div class="admin-empty">오류: ${escapeHtml(error.message)}</div>`;
            return;
        }

        loadUnreadCount();

        if (!items.length) {
            listEl.innerHTML = `<div class="admin-empty">${filter === 'unread' ? '읽지 않은 문의가 없습니다.' : '접수된 문의가 없습니다.'}</div>`;
            return;
        }

        listEl.innerHTML = `<div class="admin-inquiry-list">${items.map(item => `
            <article class="admin-inquiry-item${item.is_read ? '' : ' unread'}" data-id="${item.id}">
                <div class="admin-inquiry-head">
                    <div class="admin-inquiry-meta">
                        ${item.is_read ? '' : '<span class="admin-inquiry-new">NEW</span>'}
                        <span class="admin-inquiry-type">${escapeHtml(item.inquiry_type)}</span>
                        <time>${formatDate(item.created_at)}</time>
                    </div>
                    <div class="admin-inquiry-actions">
                        ${item.is_read ? '' : `<button type="button" class="admin-btn admin-btn-ghost admin-btn-sm" data-read="${item.id}">읽음</button>`}
                        <button type="button" class="admin-btn admin-btn-danger admin-btn-sm" data-delete-inquiry="${item.id}">삭제</button>
                    </div>
                </div>
                <div class="admin-inquiry-contact">
                    <strong>${escapeHtml(item.name)}</strong>
                    <a href="tel:${escapeHtml(item.phone.replace(/\s/g, ''))}">${escapeHtml(item.phone)}</a>
                    ${item.email ? `<a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a>` : '<span class="muted">이메일 미입력</span>'}
                </div>
                <p class="admin-inquiry-message">${escapeHtml(item.message)}</p>
            </article>
        `).join('')}</div>`;

        listEl.querySelectorAll('[data-read]').forEach(btn => {
            btn.addEventListener('click', () => markRead(btn.dataset.read));
        });
        listEl.querySelectorAll('[data-delete-inquiry]').forEach(btn => {
            btn.addEventListener('click', () => deleteInquiry(btn.dataset.deleteInquiry));
        });
    }

    async function markRead(id) {
        const { error } = await sb.from('contact_inquiries').update({ is_read: true }).eq('id', id);
        if (error) return toast(error.message, true);
        toast('읽음 처리했습니다.');
        loadInquiries();
    }

    async function deleteInquiry(id) {
        if (!confirm('이 문의를 삭제할까요?')) return;
        const { error } = await sb.from('contact_inquiries').delete().eq('id', id);
        if (error) return toast(error.message, true);
        toast('삭제되었습니다.');
        loadInquiries();
    }

    function setupTabs() {
        if (tabsReady) return;
        tabsReady = true;

        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === target));
                document.querySelectorAll('.admin-tab-panel').forEach(panel => {
                    panel.classList.toggle('admin-hidden', panel.dataset.tabPanel !== target);
                });
                if (target === 'inquiries') loadInquiries();
            });
        });

        filterEl?.addEventListener('change', () => {
            filter = filterEl.value;
            loadInquiries();
        });
    }

    window.AdminInquiries = {
        onLogin() {
            setupTabs();
            loadUnreadCount();
        },
        loadList: loadInquiries
    };
})();
