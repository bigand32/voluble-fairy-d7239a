(function () {
    const track = document.getElementById('studio-track');
    if (!track) return;

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str ?? '';
        return div.innerHTML;
    }

    function getFallback() {
        return typeof STUDIO_ITEMS !== 'undefined' ? STUDIO_ITEMS : [];
    }

    async function fetchFromSupabase() {
        const sb = window.supabaseClient;
        if (!sb) return null;

        const { data, error } = await sb
            .from('studio_items')
            .select('title, description, image_url')
            .order('sort_order', { ascending: true });

        if (error) {
            console.warn('Studio fetch error:', error.message);
            return null;
        }
        return data?.length ? data : [];
    }

    function renderCard(item, duplicate) {
        return `
            <div class="studio-card relative group cursor-pointer studio-img-wrapper"${duplicate ? ' aria-hidden="true"' : ''}>
                <img src="${escapeHtml(item.image_url)}" alt="${escapeHtml(item.title)}" class="w-full h-[400px] md:h-[600px] object-cover studio-img brightness-90 group-hover:brightness-100" loading="lazy">
                <div class="absolute bottom-0 left-0 p-8 bg-gradient-to-t from-black/80 to-transparent w-full">
                    <h4 class="text-2xl font-bold mb-2">${escapeHtml(item.title)}</h4>
                    <p class="text-gray-300 text-sm">${escapeHtml(item.description)}</p>
                </div>
            </div>`;
    }

    function render(items) {
        if (!items.length) {
            track.innerHTML = '<p class="text-gray-500 text-sm px-6">스튜디오 정보를 불러오는 중...</p>';
            return;
        }
        const cards = items.map(item => renderCard(item, false)).join('');
        const dupes = items.map(item => renderCard(item, true)).join('');
        track.innerHTML = cards + dupes;
    }

    async function init() {
        render(getFallback());
        const remote = await fetchFromSupabase();
        if (remote === null) return;
        if (remote.length) render(remote);
    }

    init();
})();
