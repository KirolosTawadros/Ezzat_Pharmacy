// Auth Check
const ADMIN_TOKEN = "ezzat_admin_logged_in";

function checkLogin() {
    const pwd = document.getElementById('admin-password').value;
    // For demo purposes, any string works.
    localStorage.setItem(ADMIN_TOKEN, "true");
    document.getElementById('login-modal').classList.add('hidden');
    document.getElementById('admin-wrapper').classList.remove('hidden');
    initAdmin();
}

function logout() {
    localStorage.removeItem(ADMIN_TOKEN);
    location.reload();
}

// Initial Check
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem(ADMIN_TOKEN) === "true") {
        document.getElementById('login-modal').classList.add('hidden');
        document.getElementById('admin-wrapper').classList.remove('hidden');
        initAdmin();
    }
});

// Admin Logic
function initAdmin() {
    switchTab('dashboard'); // default
    loadSettingsForm();
    
    // Attach event listener for settings
    document.getElementById('settings-form').addEventListener('submit', function(e) {
        e.preventDefault();
        saveSettings();
    });
}

function switchTab(tabId) {
    // Hide all contents
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    // Show target
    document.getElementById('tab-' + tabId).classList.remove('hidden');
    
    // Update active state of sidebar buttons
    document.querySelectorAll('.admin-tab').forEach(el => {
        el.classList.remove('bg-gray-800', 'text-white');
        el.classList.add('text-gray-300');
        if (el.dataset.tab === tabId) {
            el.classList.add('bg-gray-800', 'text-white');
            el.classList.remove('text-gray-300');
        }
    });

    // Refresh Data
    if(tabId === 'dashboard') renderDashboard();
    if(tabId === 'orders') renderOrders();
    if(tabId === 'products') renderAdminProducts();
}

// --- Dashboard ---
function renderDashboard() {
    let orders = JSON.parse(localStorage.getItem('ezzat_orders')) || [];
    let products = getProducts();
    
    document.getElementById('stat-orders').textContent = orders.length;
    document.getElementById('stat-products').textContent = products.length;
    
    let rev = orders.filter(o => o.status === 'Delivered').reduce((sum, o) => sum + parseInt(o.total), 0);
    document.getElementById('stat-revenue').textContent = rev;
    
    // Update badge 
    let pending = orders.filter(o => o.status === 'Pending').length;
    let badge = document.getElementById('nav-order-badge');
    if(pending > 0){
        badge.textContent = pending;
        badge.classList.remove('hidden');
    }else{
        badge.classList.add('hidden');
    }
}

// --- Orders ---
function renderOrders() {
    let orders = JSON.parse(localStorage.getItem('ezzat_orders')) || [];
    const tbody = document.getElementById('orders-table-body');
    
    if(orders.length === 0){
        tbody.innerHTML = `<tr><td colspan="6" class="p-8 text-center text-gray-500">لا توجد طلبات حالياً</td></tr>`;
        return;
    }

    // Sort by newest first
    orders.sort((a,b) => new Date(b.date) - new Date(a.date));

    let html = '';
    orders.forEach((o, index) => {
        const dateObj = new Date(o.date);
        
        let statusBadge = '';
        if(o.status === "Pending") {
            statusBadge = `<span class="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold w-full inline-block text-center cursor-pointer hover:bg-yellow-200" onclick="updateOrderStatus(${index}, 'Delivered')">قيد الانتظار <i class="fa-solid fa-arrows-rotate text-[10px] mr-1"></i></span>`;
        } else {
            statusBadge = `<span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold w-full inline-block text-center cursor-pointer hover:bg-green-200" onclick="updateOrderStatus(${index}, 'Pending')">مكتمل <i class="fa-solid fa-check text-[10px] mr-1"></i></span>`;
        }
        
        html += `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100">
                <td class="p-4 font-bold text-gray-900">${o.id}</td>
                <td class="p-4 text-sm text-gray-500">${dateObj.toLocaleDateString('ar-EG')} ${dateObj.toLocaleTimeString('ar-EG', {hour:'2-digit', minute:'2-digit'})}</td>
                <td class="p-4 font-bold text-medical-green">${o.customer_name} <br> <span class="text-xs text-gray-500 font-normal"><i class="fa-solid fa-phone"></i> ${o.customer_phone}</span></td>
                <td class="p-4 font-bold">${o.total} ج.م</td>
                <td class="p-4 text-sm text-gray-600">${o.payment_method === 'Cash' ? 'كاش' : o.payment_method === 'InstaPay' ? 'انستاباي' : 'أونلاين'}</td>
                <td class="p-4 flex flex-col items-center gap-2 relative group w-32">
                    ${statusBadge}
                    <button onclick="showOrderDetails(${index})" class="text-xs text-blue-500 hover:text-blue-700 underline mt-1">عرض التفاصيل</button>
                    <button onclick="deleteOrder(${index})" class="text-red-500 hover:text-red-700 mt-1 absolute right-2 top-4 opacity-0 group-hover:opacity-100 transition" title="حذف الطلب"><i class="fa-solid fa-trash"></i></button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function updateOrderStatus(index, newStatus) {
    let orders = JSON.parse(localStorage.getItem('ezzat_orders')) || [];
    orders.sort((a,b) => new Date(b.date) - new Date(a.date));
    orders[index].status = newStatus;
    localStorage.setItem('ezzat_orders', JSON.stringify(orders));
    renderOrders();
    renderDashboard();
}

function showOrderDetails(index) {
    let orders = JSON.parse(localStorage.getItem('ezzat_orders')) || [];
    orders.sort((a,b) => new Date(b.date) - new Date(a.date));
    const o = orders[index];
    
    // Populate Modal
    document.getElementById('modal-order-id').textContent = o.id;
    document.getElementById('modal-order-name').textContent = o.customer_name;
    document.getElementById('modal-order-phone').textContent = o.customer_phone;
    document.getElementById('modal-order-address').textContent = o.address;
    document.getElementById('modal-order-summary').textContent = o.summary;
    
    let paymentText = o.payment_method === 'Cash' ? 'كاش (عند الاستلام)' : o.payment_method === 'InstaPay' ? 'انستاباي' : 'أونلاين (بطاقة ائتمان)';
    document.getElementById('modal-order-payment').textContent = paymentText;
    
    document.getElementById('modal-order-total').textContent = o.total;

    // Prepare WhatsApp Message Link
    // Format the phone number (remove leading 0 and add +20 if needed, assuming Egypt numbers for now)
    let formattedPhone = o.customer_phone;
    if(formattedPhone.startsWith('0')) {
        formattedPhone = '20' + formattedPhone.substring(1);
    }
    const waText = encodeURIComponent(`أهلاً بك يا ${o.customer_name}، نتواصل معك من صيدلية عزت بخصوص طلبك رقم ${o.id}...`);
    document.getElementById('modal-order-whatsapp-btn').href = `https://wa.me/${formattedPhone}?text=${waText}`;

    // Show Modal
    document.getElementById('order-modal').classList.remove('hidden');
}

function closeOrderModal() {
    document.getElementById('order-modal').classList.add('hidden');
}

function deleteOrder(index) {
    if(confirm("هل أنت متأكد من حذف هذا الطلب نهائياً؟")) {
        let orders = JSON.parse(localStorage.getItem('ezzat_orders')) || [];
        orders.sort((a,b) => new Date(b.date) - new Date(a.date));
        orders.splice(index, 1);
        localStorage.setItem('ezzat_orders', JSON.stringify(orders));
        renderOrders();
        renderDashboard();
    }
}

// --- Products ---
function renderAdminProducts() {
    let products = getProducts();
    const grid = document.getElementById('admin-products-grid');
    
    let html = '';
    products.forEach((p, index) => {
        html += `
            <div class="bg-white p-5 rounded-2xl medical-shadow border border-gray-100 relative group text-center flex flex-col h-full bg-cover bg-center">
                <div class="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition z-10">
                    <button onclick="editProduct(${index})" class="w-8 h-8 rounded-full bg-blue-500 text-white hover:bg-blue-600 flex items-center justify-center shadow"><i class="fa-solid fa-pen text-xs"></i></button>
                    <button onclick="deleteProduct(${index})" class="w-8 h-8 rounded-full bg-red-500 text-white hover:bg-red-600 flex items-center justify-center shadow"><i class="fa-solid fa-trash text-xs"></i></button>
                </div>
                
                ${p.image_url ? 
                    `<div class="h-40 rounded-xl mb-4 overflow-hidden flex items-center justify-center bg-gray-50 border relative">
                        <img src="${p.image_url}" class="object-cover h-full w-full">
                    </div>` : 
                    `<div class="bg-gray-50 h-40 rounded-xl flex items-center justify-center mb-4 border p-2 text-center text-xs text-gray-400">
                        <i class="fa-solid ${p.icon || 'fa-box'} text-5xl mb-1 text-medical-green"></i> <br> لا توجد صورة
                    </div>`
                }
                
                <h3 class="font-bold text-gray-900 border-b pb-2 mb-2 line-clamp-1" title="${p.name}">${p.name}</h3>
                <div class="flex justify-between items-center text-sm mb-2 mt-auto">
                    <span class="text-gray-500 text-xs">${p.brand || '---'}</span>
                    <span class="font-bold text-medical-green bg-medical-light px-2 py-1 rounded-md">${p.price} ج.م</span>
                </div>
            </div>
        `;
    });
    grid.innerHTML = html;
}

function openProductModal() {
    document.getElementById('product-form').reset();
    document.getElementById('prod_id').value = ''; 
    document.getElementById('modal-title').textContent = "إضافة منتج جديد";
    document.getElementById('product-modal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('product-modal').classList.add('hidden');
}

window.saveProduct = function() {
    // Basic Validation
    const form = document.getElementById('product-form');
    if(!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const idVal = document.getElementById('prod_id').value;
    
    // Construct Object
    let p = {
        name: document.getElementById('prod_name').value,
        brand: document.getElementById('prod_brand').value,
        price: parseInt(document.getElementById('prod_price').value),
        description: document.getElementById('prod_desc').value,
        image_url: document.getElementById('prod_image').value
    };

    let products = getProducts();

    if(idVal !== "") {
        // Edit
        p.id = products[idVal].id;
        p.icon = products[idVal].icon; // keep icon if no image
        products[idVal] = p;
    } else {
        // Add New
        p.id = "p" + Date.now();
        p.icon = "fa-box"; // default icon if no image
        products.push(p);
    }

    localStorage.setItem('ezzat_products', JSON.stringify(products));
    closeProductModal();
    renderAdminProducts();
    renderDashboard();
};

window.editProduct = function(index) {
    let products = getProducts();
    let p = products[index];
    
    document.getElementById('modal-title').textContent = "تعديل المنتج";
    document.getElementById('prod_id').value = index;
    document.getElementById('prod_name').value = p.name;
    document.getElementById('prod_brand').value = p.brand || '';
    document.getElementById('prod_price').value = p.price;
    document.getElementById('prod_desc').value = p.description || '';
    document.getElementById('prod_image').value = p.image_url || '';
    
    document.getElementById('product-modal').classList.remove('hidden');
};

window.deleteProduct = function(index) {
    if(confirm("هل متأكد من حذف المنتج؟")) {
        let products = getProducts();
        products.splice(index, 1);
        localStorage.setItem('ezzat_products', JSON.stringify(products));
        renderAdminProducts();
        renderDashboard();
    }
};

// --- Settings ---
function loadSettingsForm() {
    let settings = getSettings();
    document.getElementById('set_whatsapp').value = settings.whatsapp;
    document.getElementById('set_phone').value = settings.phone;
    document.getElementById('set_address').value = settings.address;
}

function saveSettings() {
    let settings = {
        whatsapp: document.getElementById('set_whatsapp').value,
        phone: document.getElementById('set_phone').value,
        address: document.getElementById('set_address').value,
        email: getSettings().email // preserve email if not in UI
    };
    localStorage.setItem('ezzat_settings', JSON.stringify(settings));
    alert("تم حفظ الإعدادات بنجاح. ستنعكس على الموقع فوراً.");
}
