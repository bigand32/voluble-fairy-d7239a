(function () {
    const heroImg = document.getElementById('studio-hero-img');
    const heroSelect = document.getElementById('studio-hero-select');
    const gridEl = document.getElementById('studio-grid');
    const filtersEl = document.getElementById('studio-filters');
    const branchesEl = document.getElementById('studio-branches');
    const sliderEl = document.getElementById('studio-portfolio-slider');
    const lightbox = document.getElementById('studio-lightbox');

    if (!gridEl) return;

    const FILTER_CATS = ['뮤직비디오 세트', '광고 세트'];

    let items = [];
    let portfolioItems = [];
    let activeFilter = 'all';
    let previewIndex = 0;
    let selectReady = false;

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    function makeSlug(title) {
        return String(title || '').toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }

    function getFallback() {
        return typeof STUDIO_ITEMS !== 'undefined' ? STUDIO_ITEMS : [];
    }

    function normalizeStudio(item) {
        return {
            id: item.id || '',
            slug: item.slug || makeSlug(item.title),
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

    function studioUrl(item) {
        const key = item.slug || item.id;
        return `studio-detail.html?page=${encodeURIComponent(key)}`;
    }

    function buildGallery(thumb, images) {
        const detail = (images || []).filter(url => url && url !== thumb);
        return thumb ? [thumb, ...detail] : detail;
    }

    async function fetchStudios() {
        const sb = window.supabaseClient;
        if (!sb) return null;
        const { data, error } = await sb.from('studio_items').select('*').order('sort_order', { ascending: true });
        if (error) {
            console.warn('Studio fetch error:', error.message);
            return null;
        }
        return data?.length ? data.map(normalizeStudio) : [];
    }

    async function fetchPortfolio() {
        const sb = window.supabaseClient;
        if (!sb) return [];
        const { data, error } = await sb
            .from('portfolio_items')
            .select('id, title, thumb_url, category, portfolio_images(image_url, sort_order)')
            .order('sort_order', { ascending: false });
        if (error) {
            console.warn('Portfolio fetch error:', error.message);
            return [];
        }
        return (data || []).map(item => ({
            id: item.id,
            title: item.title,
            category: item.category || '',
            thumb: item.thumb_url,
            images: buildGallery(item.thumb_url, (item.portfolio_images || [])
                .sort((a, b) => a.sort_order - b.sort_order)
                .map(img => img.image_url))
        }));
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
                const idx = Number(heroSelect.value);
                location.href = studioUrl(items[idx]);
            });
        }
    }

    function specRow(label, value) {
        if (!value) return '';
        return `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`;
    }

    function renderGrid() {
        if (!items.length) {
            gridEl.innerHTML = '<p class="studio-empty">표시할 스튜디오가 없습니다.</p>';
            return;
        }

        gridEl.innerHTML = items.map((item, i) => `
            <a href="${studioUrl(item)}" class="studio-spec-card" id="studio-card-${i}">
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
            </a>
        `).join('');
    }

    function getFilteredPortfolio() {
        if (activeFilter === 'all') return portfolioItems;
        return portfolioItems.filter(p => p.category === activeFilter);
    }

    function openLightbox(item) {
        if (!lightbox) return;
        const img = lightbox.querySelector('img');
        const title = lightbox.querySelector('.studio-lightbox-title');
        img.src = item.thumb;
        img.alt = item.title;
        title.textContent = item.title;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    function renderPortfolioSlider() {
        if (!sliderEl) return;
        const filtered = getFilteredPortfolio();

        if (!filtered.length) {
            sliderEl.innerHTML = `<p class="studio-slider-empty">${activeFilter === 'all' ? '등록된 포트폴리오가 없습니다.' : '해당 카테고리 포트폴리오가 없습니다.'}</p>`;
            return;
        }

        sliderEl.innerHTML = `
            <div class="studio-slider-wrap">
                <button type="button" class="studio-slider-btn prev" aria-label="이전">‹</button>
                <div class="studio-slider" id="studio-slider-track">
                    ${filtered.map((item, i) => `
                        <button type="button" class="studio-slider-item" data-idx="${i}">
                            <img src="${escapeHtml(item.thumb)}" alt="${escapeHtml(item.title)}" loading="lazy">
                            <span>${escapeHtml(item.title)}</span>
                        </button>
                    `).join('')}
                </div>
                <button type="button" class="studio-slider-btn next" aria-label="다음">›</button>
            </div>
        `;

        const track = document.getElementById('studio-slider-track');
        const list = filtered;

        sliderEl.querySelector('.prev')?.addEventListener('click', () => {
            track.scrollBy({ left: -300, behavior: 'smooth' });
        });
        sliderEl.querySelector('.next')?.addEventListener('click', () => {
            track.scrollBy({ left: 300, behavior: 'smooth' });
        });

        track.querySelectorAll('.studio-slider-item').forEach(btn => {
            btn.addEventListener('click', () => {
                openLightbox(list[Number(btn.dataset.idx)]);
            });
        });
    }

    function renderFilters() {
        if (!filtersEl) return;
        const buttons = [
            `<button type="button" class="studio-filter-btn${activeFilter === 'all' ? ' active' : ''}" data-filter="all">전체</button>`,
            ...FILTER_CATS.map(cat => `
                <button type="button" class="studio-filter-btn${activeFilter === cat ? ' active' : ''}" data-filter="${escapeHtml(cat)}">${escapeHtml(cat)}</button>
            `)
        ];
        filtersEl.innerHTML = buttons.join('');
        filtersEl.querySelectorAll('.studio-filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                activeFilter = btn.dataset.filter;
                renderFilters();
                renderPortfolioSlider();
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
        items = getFallback().map(normalizeStudio);
        renderPreviewSelect();
        updatePreview(0);
        renderGrid();
        renderFilters();
        renderPortfolioSlider();
        renderBranches();

        if (lightbox) {
            lightbox.querySelector('.studio-lightbox-close')?.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
        }

        const [remoteStudios, remotePortfolio] = await Promise.all([fetchStudios(), fetchPortfolio()]);

        if (remoteStudios?.length) {
            items = remoteStudios;
            renderPreviewSelect();
            updatePreview(0);
            renderGrid();
            renderBranches();
        }

        portfolioItems = remotePortfolio;
        renderPortfolioSlider();
    }

    init();
})();
