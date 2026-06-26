// Navbar scroll effect
const navbar = document.getElementById('navbar');
if (navbar) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('bg-black/90', 'backdrop-blur-sm', 'border-gray-800', 'py-4');
            navbar.classList.remove('border-transparent', 'py-6');
        } else {
            navbar.classList.remove('bg-black/90', 'backdrop-blur-sm', 'border-gray-800', 'py-4');
            navbar.classList.add('border-transparent', 'py-6');
        }
    });
}

function toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    if (menu.classList.contains('opacity-0')) {
        menu.classList.remove('opacity-0', 'pointer-events-none');
        menu.classList.add('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = 'hidden';
    } else {
        menu.classList.add('opacity-0', 'pointer-events-none');
        menu.classList.remove('opacity-100', 'pointer-events-auto');
        document.body.style.overflow = 'auto';
    }
}

// Active nav: page-based
const currentPage = document.body.dataset.page;
if (currentPage) {
    document.querySelectorAll('.nav-link[data-nav]').forEach(link => {
        if (link.dataset.nav === currentPage) link.classList.add('active');
    });
}

// Active nav: scroll-based (home only)
if (currentPage === 'home') {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link[data-nav="home"]');

    function updateActiveNav() {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 120;
            if (window.scrollY >= top) current = section.getAttribute('id');
        });
        navLinks.forEach(link => {
            const href = link.getAttribute('href') || '';
            const hash = href.includes('#') ? href.split('#')[1] : '';
            link.classList.toggle('active', hash === current);
        });
    }

    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav();
}

// Contact form → assets/js/contact.js (contact.html)
