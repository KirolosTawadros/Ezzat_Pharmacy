document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');

    if (btn && menu) {
        btn.addEventListener('click', () => {
            menu.classList.toggle('hidden');
        });
    }

    // Active link highlighting
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== 'index.html' && href !== '/') {
            link.classList.add('text-green-600', 'font-bold');
        } else if (currentPath.endsWith('/') || currentPath.endsWith('index.html')) {
            if (href === 'index.html' || href === '') {
                link.classList.add('text-green-600', 'font-bold');
            }
        }
    });

    // --- Dynamic Settings Update (WhatsApp Link Override) ---
    if (typeof getSettings === 'function') {
        const settings = getSettings();
        document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
            const currentHref = link.getAttribute('href');
            const newHref = currentHref.replace(/wa\.me\/\d+/, `wa.me/${settings.whatsapp}`);
            link.setAttribute('href', newHref);
        });
    }
});
