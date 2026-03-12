// ==========================================
// Product Rendering Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    const productsGrid = document.getElementById('products-grid');
    const featuredProductsGrid = document.getElementById('featured-products-grid');
    
    // Fetch from Local DB
    const products = getProducts();

    if (productsGrid) {
        renderProducts(products, productsGrid);
    }
    
    if (featuredProductsGrid) {
        // Render only the first 3 for home page
        renderProducts(products.slice(0, 3), featuredProductsGrid);
    }
});

function renderProducts(productsArray, container) {
    container.innerHTML = ''; // clear loading state
    
    productsArray.forEach(product => {
        const cardHTML = `
            <div class="bg-white rounded-2xl p-6 border border-gray-100 medical-shadow hover-medical-shadow transition-all group text-center flex flex-col h-full relative">
                <div class="absolute top-4 right-4 bg-medical-light text-medical-green font-bold px-3 py-1 rounded-full text-sm">
                    ${product.price} ج.م
                </div>
                <!-- Determine if we have image_url or fallback to icon -->
                ${product.image_url ? 
                    `<div class="h-48 rounded-xl mb-6 overflow-hidden flex items-center justify-center">
                        <img src="${product.image_url}" alt="${product.name}" class="object-cover h-full w-full hover:scale-105 transition duration-300">
                    </div>` : 
                    `<div class="bg-gray-50 h-48 rounded-xl flex items-center justify-center mb-6 group-hover:bg-medical-light transition p-4">
                        <i class="fa-solid ${product.icon || 'fa-box'} text-6xl text-gray-400 group-hover:text-medical-green transition"></i>
                    </div>`
                }
                
                <h3 class="text-xl font-bold text-gray-900 mb-2">${product.name}</h3>
                <p class="text-gray-500 mb-4 text-sm font-medium">${product.brand || product.category || ''}</p>
                <p class="text-gray-600 text-sm mb-6 flex-grow line-clamp-3">${product.description}</p>
                <button onclick='addToCart(${JSON.stringify(product).replace(/'/g, "&apos;")})' class="block w-full py-3 rounded-xl bg-medical-green text-white font-bold hover:bg-medical-dark shadow-md transition outline-none">
                    <i class="fa-solid fa-cart-plus ml-2"></i> أضف إلى السلة
                </button>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', cardHTML);
    });
}
