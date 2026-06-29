(function () {
    const container = document.getElementById('studio-hero-slides');
    if (!container) return;

    const slides = (typeof STUDIO_ITEMS !== 'undefined' ? STUDIO_ITEMS : [])
        .filter(item => item.image_url)
        .map(item => ({
            url: item.image_url,
            title: item.title || ''
        }));

    if (!slides.length) return;

    const SECONDS_PER_SLIDE = 3;
    const count = slides.length;
    const duration = count * SECONDS_PER_SLIDE;

    container.style.setProperty('--hero-duration', duration + 's');

    if (count === 1) {
        container.innerHTML = `<img class="studio-hero-slide studio-hero-slide--single" src="${slides[0].url}" alt="${slides[0].title}">`;
        return;
    }

    container.innerHTML = slides.map((slide, index) => `
        <img
            class="studio-hero-slide"
            src="${slide.url}"
            alt="${slide.title}"
            style="animation-delay: ${index * SECONDS_PER_SLIDE}s"
        >
    `).join('');
})();
