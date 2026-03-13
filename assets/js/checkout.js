// ==========================================
// Checkout Flow & Logic
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    // 1. Render Cart Items
    renderCartItems();

    // 2. Handle Payment Method Toggle Info Boxes
    const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
    const instapayInfo = document.getElementById('instapay-info');
    const onlineInfo = document.getElementById('online-info');

    paymentRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            instapayInfo.classList.add('hidden');
            onlineInfo.classList.add('hidden');
            
            if (e.target.value === 'InstaPay') {
                instapayInfo.classList.remove('hidden');
            } else if (e.target.value === 'Online') {
                onlineInfo.classList.remove('hidden');
            }
        });
    });

    // 3. Handle Form Submission (EmailJS / Order logic)
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (cart.length === 0) {
                alert("عذرًا، سلة المشتريات فارغة!");
                return;
            }

            const name = document.getElementById('customer_name').value;
            const phone = document.getElementById('customer_phone').value;
            const address = document.getElementById('customer_address').value;
            const paymentMethod = document.querySelector('input[name="payment_method"]:checked').value;
            const total = getCartTotal();
            
            // Format order summary
            let orderSummary = "";
            cart.forEach((item, index) => {
                orderSummary += `${index + 1}. ${item.name} (${item.quantity} قطعة) = ${item.price * item.quantity} ج.م\n`;
            });

            // If we had a real EmailJS Key, it would go here:
            // emailjs.init(EMAILJS_PUBLIC_KEY);
            // const templateParams = {
            //     to_name: "Dr. Ezzat",
            //     customer_name: name,
            //     customer_phone: phone,
            //     customer_address: address,
            //     payment_method: paymentMethod,
            //     order_summary: orderSummary,
            //     total_price: total
            // };

            // Show Loading
            document.getElementById('loading-overlay').classList.remove('hidden');

            // Simulate API Call delay 
            setTimeout(() => {
                
                // SAVE ORDER TO LOCAL DB FOR ADMIN PANEL TO SEE
                const orderId = saveOrderLocal(name, phone, address, paymentMethod, orderSummary, total);

                document.getElementById('loading-overlay').classList.add('hidden');
                
                // Show Success Modal
                document.getElementById('success-name').textContent = name;
                document.getElementById('success-order-id').textContent = orderId;
                document.getElementById('success-total').textContent = total;
                
                const modal = document.getElementById('success-modal');
                const modalContent = document.getElementById('success-modal-content');
                modal.classList.remove('hidden');
                
                // Small delay to trigger CSS transition
                setTimeout(() => {
                    modalContent.classList.remove('scale-95', 'opacity-0');
                    modalContent.classList.add('scale-100', 'opacity-100');
                }, 10);
                
                // Clear Cart
                cart = [];
                saveCart();
            }, 1500);
        });
    }
});

function renderCartItems() {
    const container = document.getElementById('cart-items-container');
    const totalEl = document.getElementById('cart-total-price');
    const submitBtn = document.getElementById('submit-order-btn');

    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = `<div class="text-center text-gray-400 py-8"><i class="fa-solid fa-basket-shopping text-5xl mb-4"></i><p>السلة فارغة حاليًا.</p></div>`;
        totalEl.parentElement.parentElement.classList.add('hidden');
        if(submitBtn) submitBtn.disabled = true;
        if(submitBtn) submitBtn.classList.add('opacity-50', 'cursor-not-allowed');
        return;
    }

    if(submitBtn) submitBtn.disabled = false;
    if(submitBtn) submitBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    totalEl.parentElement.parentElement.classList.remove('hidden');

    let html = '';
    cart.forEach(item => {
        html += `
            <div class="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div class="flex items-center gap-4">
                    <div class="w-16 h-16 bg-gray-50 rounded-lg flex items-center justify-center border">
                        ${item.image_url ? `<img src="${item.image_url}" class="w-12 h-12 object-contain">` : `<i class="fa-solid ${item.icon || 'fa-box'} text-gray-400 text-2xl"></i>`}
                    </div>
                    <div>
                        <h4 class="font-bold text-gray-900">${item.name}</h4>
                        <p class="text-medical-green font-bold text-sm">${item.price} ج.م</p>
                    </div>
                </div>
                
                <div class="flex flex-col items-center gap-2">
                    <div class="flex items-center gap-3 bg-gray-50 rounded-lg border px-2 py-1">
                        <button type="button" onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="text-gray-500 hover:text-medical-green"><i class="fa-solid fa-plus text-xs"></i></button>
                        <span class="font-bold text-sm">${item.quantity}</span>
                        <button type="button" onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="text-gray-500 hover:text-red-500"><i class="fa-solid fa-minus text-xs"></i></button>
                    </div>
                    <button type="button" onclick="removeFromCart('${item.id}')" class="text-red-500 hover:text-red-700 text-xs font-medium"><i class="fa-solid fa-trash mr-1"></i>حذف</button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    totalEl.textContent = getCartTotal();
}

function saveOrderLocal(name, phone, address, payment, summary, total) {
    let orders = JSON.parse(localStorage.getItem('ezzat_orders')) || [];
    const orderId = "ORD-" + Math.floor(Math.random() * 100000);
    orders.push({
        id: orderId,
        date: new Date().toISOString(),
        customer_name: name,
        customer_phone: phone,
        address: address,
        payment_method: payment,
        summary: summary,
        total: total,
        status: "Pending" // "Pending", "Confirmed", "Delivered"
    });
    localStorage.setItem('ezzat_orders', JSON.stringify(orders));
    return orderId;
}

function closeSuccessModal() {
    window.location.href = "index.html";
}
