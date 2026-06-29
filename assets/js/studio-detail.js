(function () {
    const params = new URLSearchParams(location.search);
    const pageKey = params.get('page') || params.get('id');

    const heroImg = document.getElementById('detail-hero-img');
    const tabsEl = document.getElementById('studio-detail-tabs');
    const titleEl = document.getElementById('detail-title');
    const leadEl = document.getElementById('detail-lead');
    const specsEl = document.getElementById('detail-specs');
    const layoutImg = document.getElementById('detail-layout-img');
    const infoBox = document.getElementById('detail-info-box');
    const infoTitle = document.getElementById('detail-info-title');
    const infoImg = document.getElementById('detail-info-img');
    const galleryEl = document.getElementById('detail-gallery');
    const tagsEl = document.getElementById('detail-tags');
    const filtersEl = document.getElementById('studio-filters');
    const sliderEl = document.getElementById('studio-portfolio-slider');
    const lightbox = document.getElementById('studio-lightbox');

    if (!pageKey) {
        location.replace('studio.html');
        return;
    }

    const FILTER_CATS = ['뮤직비디오 세트', '광고 세트'];
    const DEFAULT_TAGS = [
        '#남양주종합촬영스튜디오',
        '#프로덕션촬영소',
        '#CF촬영',
        '#광고세트장',
        '#뮤직비디오세트장',
        '#소품제작'
    ];

    let items = [];
    let portfolioItems = [];
    let activeFilter = 'all';

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    function getFallback() {
        return typeof STUDIO_ITEMS !== 'undefined' ? STUDIO_ITEMS : [];
    }

    function makeSlug(title) {
        return String(title || '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
    }

    function normalizeSection(section) {
        const images = (section.studio_section_images || section.images || [])
            .slice()
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map(img => (typeof img === 'string' ? img : img.image_url))
            .filter(Boolean);

        return {
            title: section.title || '',
            floor_label: section.floor_label || '',
            images
        };
    }

    function normalizeItem(item) {
        const slug = item.slug || makeSlug(item.title);
        const sections = (item.studio_sections || item.sections || [])
            .slice()
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map(normalizeSection);

        return {
            id: item.id || slug,
            slug,
            title: item.title || '',
            description: item.description || '',
            image_url: item.image_url || '',
            layout_image_url: item.layout_image_url || item.image_url || '',
            branch: item.branch || '일산',
            category: item.category || '',
            address: item.address || '',
            area: item.area || '',
            size_spec: item.size_spec || '',
            power: item.power || '',
            facilities: item.facilities || '',
            amenities: item.amenities || '',
            sections
        };
    }

    function mergeFallback(item) {
        const fallback = getFallback().find(f => (f.slug || makeSlug(f.title)) === item.slug);
        if (!fallback) return item;

        if (!item.sections?.length && fallback.sections?.length) {
            item.sections = fallback.sections.map(normalizeSection);
        }
        if (!item.layout_image_url && fallback.layout_image_url) {
            item.layout_image_url = fallback.layout_image_url;
        }
        return item;
    }

    function itemKey(item) {
        return item.slug || item.id;
    }

    function findItem(key) {
        return items.find(i => itemKey(i) === key || i.id === key);
    }

    function studioUrl(item) {
        return `studio-detail.html?page=${encodeURIComponent(itemKey(item))}`;
    }

    async function fetchFromSupabase() {
        const sb = window.supabaseClient;
        if (!sb) return null;

        const { data, error } = await sb
            .from('studio_items')
            .select(`
                *,
                studio_sections (
                    id,
                    title,
                    floor_label,
                    sort_order,
                    studio_section_images (
                        image_url,
                        sort_order
                    )
                )
            `)
            .order('sort_order', { ascending: true });

        if (error) {
            console.warn('Studio detail fetch error:', error.message);
            return null;
        }

        return data?.length ? data.map(normalizeItem) : [];
    }

    function buildGallery(thumb, images) {
        const detail = (images || []).filter(url => url && url !== thumb);
        return thumb ? [thumb, ...detail] : detail;
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

    function specRow(label, value) {
        if (!value) return '';
        return `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`;
    }

    function renderTabs(current) {
        if (!tabsEl) return;
        const activeKey = itemKey(current);
        tabsEl.innerHTML = items.map(item => `
            <li>
                <a href="${studioUrl(item)}" class="studio-detail-tab${itemKey(item) === activeKey ? ' is-active' : ''}">${escapeHtml(item.title)}</a>
            </li>
        `).join('');
    }

    function renderGallerySections(item) {
        if (!galleryEl) return;

        const sections = item.sections || [];
        if (!sections.length) {
            galleryEl.innerHTML = '';
            return;
        }

        galleryEl.innerHTML = sections.map(section => {
            const imgs = section.images || [];
            const cells = imgs.length
                ? imgs.map(url => `
                    <button type="button" class="studio-gallery-cell" data-src="${escapeHtml(url)}" data-title="${escapeHtml(section.title)}">
                        <img src="${escapeHtml(url)}" alt="${escapeHtml(section.title)}" loading="lazy">
                    </button>
                `).join('')
                : '<p class="studio-gallery-empty">등록된 사진이 없습니다.</p>';

            const floorBadge = section.floor_label
                ? `<span class="studio-floor-badge">${escapeHtml(section.floor_label)}</span>`
                : '';

            return `
                <section class="studio-gallery-section">
                    <header class="studio-gallery-header">
                        <h2 class="studio-gallery-title">${escapeHtml(section.title)}</h2>
                        ${floorBadge}
                    </header>
                    <div class="studio-gallery-grid${imgs.length === 1 ? ' studio-gallery-grid--single' : ''}">
                        ${cells}
                    </div>
                </section>
            `;
        }).join('');

        galleryEl.querySelectorAll('.studio-gallery-cell').forEach(btn => {
            btn.addEventListener('click', () => {
                openImageLightbox(btn.dataset.src, btn.dataset.title);
            });
        });
    }

    function openImageLightbox(src, title) {
        if (!lightbox || !src) return;
        const img = lightbox.querySelector('img');
        const titleEl = lightbox.querySelector('.studio-lightbox-title');
        img.src = src;
        img.alt = title || '';
        titleEl.textContent = title || '';
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
    }

    function openPortfolioLightbox(item) {
        if (!lightbox || !item?.thumb) return;
        const img = lightbox.querySelector('img');
        const titleEl = lightbox.querySelector('.studio-lightbox-title');
        img.src = item.thumb;
        img.alt = item.title;
        titleEl.textContent = item.title;
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function getFilteredPortfolio() {
        if (activeFilter === 'all') return portfolioItems;
        return portfolioItems.filter(p => p.category === activeFilter);
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
        sliderEl.querySelector('.prev')?.addEventListener('click', () => {
            track.scrollBy({ left: -300, behavior: 'smooth' });
        });
        sliderEl.querySelector('.next')?.addEventListener('click', () => {
            track.scrollBy({ left: 300, behavior: 'smooth' });
        });
        track.querySelectorAll('.studio-slider-item').forEach(btn => {
            btn.addEventListener('click', () => {
                openPortfolioLightbox(filtered[Number(btn.dataset.idx)]);
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

    function renderDetail(item) {
        if (!item) {
            document.body.innerHTML = '<p style="padding:120px 24px;text-align:center">스튜디오를 찾을 수 없습니다. <a href="studio.html">목록으로</a></p>';
            return;
        }

        document.title = `${item.title} | ART CENTER ART HOUSE`;

        if (heroImg) {
            heroImg.src = item.image_url;
            heroImg.alt = item.title;
        }

        if (titleEl) {
            titleEl.innerHTML = `스튜디오 <em>${escapeHtml(item.title)}</em>`;
        }

        if (leadEl) {
            leadEl.textContent = item.description;
        }

        if (specsEl) {
            specsEl.innerHTML = `
                ${specRow('주소', item.address)}
                ${specRow('면적', item.area)}
                ${specRow('사이즈', item.size_spec)}
                ${specRow('전력', item.power)}
                ${specRow('시설', item.facilities)}
                ${specRow('부대시설', item.amenities)}
            `;
        }

        if (layoutImg) {
            layoutImg.src = item.layout_image_url || item.image_url;
            layoutImg.alt = `${item.title} 배치도`;
        }

        const showInfoBox = item.layout_image_url && item.layout_image_url !== item.image_url;
        if (infoBox) {
            infoBox.hidden = !showInfoBox;
            if (showInfoBox) {
                infoTitle.textContent = `${item.title} 바톤 정보`;
                infoImg.src = item.layout_image_url;
                infoImg.alt = `${item.title} 바톤 배치`;
            }
        }

        if (tagsEl) {
            tagsEl.textContent = DEFAULT_TAGS.join(' ');
        }

        renderTabs(item);
        renderGallerySections(item);
    }

    async function init() {
        items = getFallback().map(i => mergeFallback(normalizeItem(i)));
        let current = findItem(pageKey);

        renderFilters();
        renderPortfolioSlider();

        if (lightbox) {
            lightbox.querySelector('.studio-lightbox-close')?.addEventListener('click', closeLightbox);
            lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
        }

        const [remote, remotePortfolio] = await Promise.all([fetchFromSupabase(), fetchPortfolio()]);

        if (remote?.length) {
            items = remote.map(i => mergeFallback(normalizeItem(i)));
            current = findItem(pageKey);
        }

        portfolioItems = remotePortfolio;
        renderPortfolioSlider();

        if (!current && items.length) {
            location.replace(studioUrl(items[0]));
            return;
        }

        renderDetail(current);
    }

    init();
})();
