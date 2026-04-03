/* ─── Global Utilities for Ezzat Pharmacy ─────────────────────────────────── */

document.addEventListener('DOMContentLoaded', () => {

    // ─── Mobile menu toggle ───────────────────────────────────────────────────
    const btn = document.getElementById('mobile-menu-button');
    const menu = document.getElementById('mobile-menu');
    if (btn && menu) {
        btn.addEventListener('click', () => menu.classList.toggle('hidden'));
    }

    // ─── Active link highlighting ─────────────────────────────────────────────
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (href && currentPath.includes(href) && href !== 'index.html' && href !== '/') {
            link.classList.add('text-green-600', 'font-bold');
        } else if ((currentPath.endsWith('/') || currentPath.endsWith('index.html')) && (href === 'index.html' || href === '')) {
            link.classList.add('text-green-600', 'font-bold');
        }
    });

<<<<<<< HEAD
    // ─── Global Cart Badge ────────────────────────────────────────────────────
    updateCartBadge();

    // ─── Global Auth Nav (for pages that have #auth-nav and don't set it themselves) ─
    const authNav = document.getElementById('auth-nav');
    if (authNav && !authNav.dataset.managed) {
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        if (user) {
            authNav.innerHTML = `
                <a href="my-orders.html" class="text-gray-600 hover:text-medical-green text-sm font-medium transition">${user.name.split(' ')[0]}</a>
                <button onclick="logoutGlobal()" class="text-gray-400 hover:text-red-500 transition text-sm ml-1">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </button>
            `;
            if (user.role === 'admin') {
                authNav.innerHTML += `<a href="admin/dashboard.html" class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium hover:bg-purple-200 transition">لوحة التحكم</a>`;
            }
        }
=======
    // --- Dynamic Settings Update (WhatsApp Link Override) ---
    if (typeof getSettings === 'function') {
        const settings = getSettings();
        document.querySelectorAll('a[href^="https://wa.me/"]').forEach(link => {
            const currentHref = link.getAttribute('href');
            const newHref = currentHref.replace(/wa\.me\/\d+/, `wa.me/${settings.whatsapp}`);
            link.setAttribute('href', newHref);
        });
>>>>>>> 69b8cd380999f87aa4806063b697fca386582298
    }
});

// ─── Cart Badge ───────────────────────────────────────────────────────────────
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('ezzat_cart') || '[]');
    const count = cart.reduce((sum, i) => sum + i.quantity, 0);
    document.querySelectorAll('#cart-count').forEach(badge => {
        if (count > 0) { badge.textContent = count; badge.classList.remove('hidden'); }
        else { badge.classList.add('hidden'); }
    });
}

// ─── Global Logout ────────────────────────────────────────────────────────────
async function logoutGlobal() {
    try {
        await fetch('http://localhost:3000/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch (e) { /* ignore */ }
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}
