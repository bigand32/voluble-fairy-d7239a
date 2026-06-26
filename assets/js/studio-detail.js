(function () {
    const params = new URLSearchParams(location.search);
    const pageKey = params.get('page') || params.get('id');

    const heroImg = document.getElementById('detail-hero-img');
    const heroSelect = document.getElementById('detail-studio-select');
    const titleEl = document.getElementById('detail-title');
    const leadEl = document.getElementById('detail-lead');
    const specsEl = document.getElementById('detail-specs');

    if (!pageKey) {
        location.replace('studio.html');
        return;
    }

    let items = [];
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
        const slug = item.slug || makeSlug(item.title);
        return {
            id: item.id || slug,
            slug,
            title: item.title || '',
            description: item.description || '',
            image_url: item.image_url || '',
            branch: item.branch || '일산',
            category: item.category || '',
            address: item.address || '',
            area: item.area || '',
            size_spec: item.size_spec || '',
            power: item.power || '',
            facilities: item.facilities || '',
            amenities: item.amenities || ''
        };
    }

    function makeSlug(title) {
        return String(title || '')
            .toLowerCase()
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, '');
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
        const { data, error } = await sb.from('studio_items').select('*').order('sort_order', { ascending: true });
        if (error) {
            console.warn('Studio detail fetch error:', error.message);
            return null;
        }
        return data?.length ? data.map(normalizeItem) : [];
    }

    function specRow(label, value) {
        if (!value) return '';
        return `<dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd>`;
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
                ${specRow('편의시설', item.amenities)}
            `;
        }
        if (heroSelect) heroSelect.value = itemKey(item);
    }

    function renderSelect() {
        if (!heroSelect) return;
        heroSelect.innerHTML = items.map(item =>
            `<option value="${escapeHtml(itemKey(item))}">${escapeHtml(item.title)}</option>`
        ).join('');
        if (!selectReady) {
            selectReady = true;
            heroSelect.addEventListener('change', () => {
                location.href = studioUrl(findItem(heroSelect.value));
            });
        }
    }

    async function init() {
        items = getFallback().map(normalizeItem);
        let current = findItem(pageKey);

        const remote = await fetchFromSupabase();
        if (remote?.length) {
            items = remote;
            current = findItem(pageKey);
        }

        if (!current && items.length) {
            location.replace(studioUrl(items[0]));
            return;
        }

        renderSelect();
        renderDetail(current);
    }

    init();
})();
