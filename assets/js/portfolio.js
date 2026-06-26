(function () {
    const grid = document.getElementById('portfolio-grid');
    const lightbox = document.getElementById('portfolio-lightbox');
    if (!grid || !lightbox || typeof PORTFOLIO_ITEMS === 'undefined') return;

    let currentImages = [];
    let currentIndex = 0;

    const lbImage = lightbox.querySelector('.lightbox-image');
    const lbTitle = lightbox.querySelector('.lightbox-title');
    const lbCounter = lightbox.querySelector('.lightbox-counter');
    const lbThumbs = lightbox.querySelector('.lightbox-thumbs');

    function renderGrid() {
        grid.innerHTML = PORTFOLIO_ITEMS.map((item, i) => `
            <button class="portfolio-item" data-index="${i}" aria-label="${item.title}">
                <div class="portfolio-thumb">
                    <img src="${item.thumb}" alt="${item.title}" loading="lazy">
                </div>
                <p class="portfolio-title">${item.title}</p>
            </button>
        `).join('');

        grid.querySelectorAll('.portfolio-item').forEach(btn => {
            btn.addEventListener('click', () => openLightbox(Number(btn.dataset.index)));
        });
    }

    function renderThumbs() {
        lbThumbs.innerHTML = currentImages.map((src, i) => `
            <button class="lightbox-thumb${i === currentIndex ? ' active' : ''}" data-idx="${i}">
                <img src="${src}" alt="">
            </button>
        `).join('');

        lbThumbs.querySelectorAll('.lightbox-thumb').forEach(btn => {
            btn.addEventListener('click', () => goTo(Number(btn.dataset.idx)));
        });
    }

    function updateSlide() {
        lbImage.src = currentImages[currentIndex];
        lbImage.alt = lbTitle.textContent;
        lbCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
        lbThumbs.querySelectorAll('.lightbox-thumb').forEach((t, i) => {
            t.classList.toggle('active', i === currentIndex);
        });
    }

    function goTo(index) {
        currentIndex = (index + currentImages.length) % currentImages.length;
        updateSlide();
    }

    function openLightbox(index) {
        const item = PORTFOLIO_ITEMS[index];
        currentImages = item.images;
        currentIndex = 0;
        lbTitle.textContent = item.title;
        renderThumbs();
        updateSlide();
        lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        document.body.style.overflow = '';
        lbImage.src = '';
    }

    lightbox.querySelector('.lightbox-close').addEventListener('click', closeLightbox);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', () => goTo(currentIndex - 1));
    lightbox.querySelector('.lightbox-next').addEventListener('click', () => goTo(currentIndex + 1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('open')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') goTo(currentIndex - 1);
        if (e.key === 'ArrowRight') goTo(currentIndex + 1);
    });

    renderGrid();
})();
