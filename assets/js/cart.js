// ==========================================
// Cart Logic - LocalStorage Implementation
// ==========================================

let cart = JSON.parse(localStorage.getItem('ezzat_cart')) || [];

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('ezzat_cart', JSON.stringify(cart));
    updateCartIcon();
}

// Add item to cart
function addToCart(product) {
    const existingIndex = cart.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    saveCart();
    
    // Tiny toast notification logic
    showToast(`تم إضافة ${product.name} إلى السلة!`);
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    if(typeof renderCartItems === 'function') renderCartItems(); // defined in checkout.js later
}

// Update quantity
function updateQuantity(productId, newQty) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity = parseInt(newQty);
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            if(typeof renderCartItems === 'function') renderCartItems();
        }
    }
}

// Get Total Price
function getCartTotal() {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update Cart Icon Badge in Header
function updateCartIcon() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.classList.remove('hidden');
        } else {
            badge.classList.add('hidden');
        }
    });
}

// Toast Notification System
function showToast(message) {
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'fixed bottom-24 right-4 md:right-10 z-[100] flex flex-col gap-2';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = 'bg-gray-900 text-white px-6 py-3 rounded-lg shadow-xl medical-shadow opacity-0 transition-opacity duration-300 flex items-center justify-between gap-4';
    toast.innerHTML = `
        <span><i class="fa-solid fa-check-circle text-medical-green mr-2"></i> ${message}</span>
        <button onclick="this.parentElement.remove()" class="text-gray-400 hover:text-white"><i class="fa-solid fa-xmark"></i></button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.style.opacity = '1', 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
    updateCartIcon();
});
