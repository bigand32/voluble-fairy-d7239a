(function () {
    const heroImg = document.getElementById('studio-hero-img');
    const heroSelect = document.getElementById('studio-hero-select');
    const gridEl = document.getElementById('studio-grid');
    const filtersEl = document.getElementById('studio-filters');
    const branchesEl = document.getElementById('studio-branches');

    if (!gridEl) return;

    let items = [];
    let activeFilter = 'all';
    let previewIndex = 0;
    let selectReady = false;

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    function getFallback() {
        return typeof STUDIO_ITEMS !== 'undefined' ? STUDIO_ITEMS : [];
    }

    function normalizeItem(item) {
        return {
            title: item.title || '',
            description: item.description || '',
            image_url: item.image_url || '',
            branch: item.branch || '일산',
            category: item.category || '',
            address: item.address || '경기도 고양시 일산동구 고봉로814번길 50-7',
            area: item.area || '',
            size_spec: item.size_spec || '',
            power: item.power || '',
            facilities: item.facilities || item.description || '',
            amenities: item.amenities || ''
        };
    }

    async function fetchFromSupabase() {
        const sb = window.supabaseClient;
        if (!sb) return null;

        const { data, error } = await sb
            .from('studio_items')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.warn('Studio page fetch error:', error.message);
            return null;
        }
        return data?.length ? data.map(normalizeItem) : [];
    }

    function getCategories() {
        const cats = new Set(items.map(i => i.category).filter(Boolean));
        return Array.from(cats);
    }

    function getFilteredItems() {
        if (activeFilter === 'all') return items;
        return items.filter(i => i.category === activeFilter);
    }

    function updatePreview(index) {
        if (!items.length) return;
        previewIndex = Math.max(0, Math.min(index, items.length - 1));
        const item = items[previewIndex];
        if (heroImg) {
            heroImg.src = item.image_url;
            heroImg.alt = item.title;
        }
        if (heroSelect) heroSelect.value = String(previewIndex);
    }

    function renderPreviewSelect() {
        if (!heroSelect) return;
        heroSelect.innerHTML = items.map((item, i) =>
            `<option value="${i}">${escapeHtml(item.title)}</option>`
        ).join('');
        if (!selectReady) {
            selectReady = true;
            heroSelect.addEventListener('change', () => {
                updatePreview(Number(heroSelect.value));
                const card = document.getElementById(`studio-card-${previewIndex}`);
                card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        }
    }

    function specRow(label, value) {
        if (!value) return '';
        return `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`;
    }

    function renderGrid() {
        const filtered = getFilteredItems();
        if (!filtered.length) {
            gridEl.innerHTML = '<p class="studio-empty">표시할 스튜디오가 없습니다.</p>';
            return;
        }

        gridEl.innerHTML = filtered.map((item, i) => {
            const globalIndex = items.indexOf(item);
            return `
            <article class="studio-spec-card" id="studio-card-${globalIndex}">
                <div class="studio-spec-card__image studio-img-wrapper">
                    <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)}" class="studio-img" loading="lazy">
                    <span class="studio-spec-card__badge">${escapeHtml(item.title)}</span>
                </div>
                <dl class="studio-spec-list">
                    ${specRow('주소', item.address)}
                    ${specRow('면적', item.area)}
                    ${specRow('사이즈', item.size_spec)}
                    ${specRow('전력', item.power)}
                    ${specRow('시설', item.facilities)}
                    ${specRow('편의시설', item.amenities)}
                </dl>
            </article>`;
        }).join('');

        gridEl.querySelectorAll('.studio-spec-card').forEach(card => {
            card.addEventListener('click', () => {
                const id = card.id.replace('studio-card-', '');
                updatePreview(Number(id));
            });
        });
    }

    function renderFilters() {
        if (!filtersEl) return;
        const cats = getCategories();
        const buttons = [
            `<button type="button" class="studio-filter-btn${activeFilter === 'all' ? ' active' : ''}" data-filter="all">전체</button>`,
            ...cats.map(cat => `
                <button type="button" class="studio-filter-btn${activeFilter === cat ? ' active' : ''}" data-filter="${escapeHtml(cat)}">${escapeHtml(cat)}</button>
            `)
        ];
        filtersEl.innerHTML = buttons.join('');
        filtersEl.querySelectorAll('.studio-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeFilter = btn.dataset.filter;
                renderFilters();
                renderGrid();
            });
        });
    }

    function renderBranches() {
        if (!branchesEl) return;
        const branchMap = new Map();
        items.forEach(item => {
            const key = item.branch || '일산';
            if (!branchMap.has(key)) {
                branchMap.set(key, { name: `${key}점`, address: item.address, studios: [] });
            }
            branchMap.get(key).studios.push(item.title);
        });

        branchesEl.innerHTML = Array.from(branchMap.values()).map(branch => `
            <div class="studio-branch-card">
                <h3>${escapeHtml(branch.name)}</h3>
                <p>${escapeHtml(branch.address)}</p>
                <p style="margin-top:8px;color:#999;font-size:12px;">${escapeHtml(branch.studios.join(' · '))}</p>
                <a href="https://map.naver.com/v5/search/${encodeURIComponent(branch.address)}" target="_blank" rel="noopener noreferrer">지도에서 보기</a>
            </div>
        `).join('');
    }

    async function init() {
        items = getFallback().map(normalizeItem);
        renderPreviewSelect();
        updatePreview(0);
        renderFilters();
        renderGrid();
        renderBranches();

        const remote = await fetchFromSupabase();
        if (remote === null) return;
        if (remote.length) {
            items = remote;
            renderPreviewSelect();
            updatePreview(0);
            renderFilters();
            renderGrid();
            renderBranches();
        }
    }

    init();
})();
