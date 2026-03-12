// ==========================================
// Local Database (LocalStorage Fallback)
// ==========================================

const DEFAULT_PRODUCTS = [
    {
        id: "p1",
        name: "جهاز قياس السكر بشريط",
        brand: "كليفر تشيك (Clever Chek)",
        description: "جهاز دقيق وسريع لقياس نسبة السكر في الدم بالمنزل مع سهولة الاستخدام للمرضى وكبار السن.",
        price: 550,
        icon: "fa-droplet"
    },
    {
        id: "p2",
        name: "جهاز قياس ضغط الدم",
        brand: "روسماكس (Rossmax)",
        description: "جهاز آلي لقياس ضغط الدم بدقة عالية والنبض، موثوق ومناسب للاستخدام المنزلي واليومي.",
        price: 1850,
        icon: "fa-heart-pulse"
    },
    {
        id: "p3",
        name: "ترمومتر رقمي (مقياس حرارة)",
        brand: "Thermometer",
        description: "ترمومتر ديجيتال دقيق وسريع لقياس درجة حرارة الجسم للكبار والأطفال مع شاشة واضحة.",
        price: 120,
        icon: "fa-temperature-half"
    },
    {
        id: "p4",
        name: "جهاز استنشاق البخار",
        brand: "نيبولايزر (Nebulizer)",
        description: "جهاز فعّال لعلاج أزمات الربو والجهاز التنفسي وتحويل الدواء السائل إلى رذاذ للاستنشاق.",
        price: 850,
        icon: "fa-mask-ventilator"
    },
    {
        id: "p5",
        name: "جهاز قياس أكسجين الدم",
        brand: "Pulse Oximeter",
        description: "مقياس صغير يُوضع في الإصبع لمتابعة نسبة الأكسجين في الدم ومعدل ضربات القلب بدقة.",
        price: 450,
        icon: "fa-lungs"
    },
    {
        id: "p6",
        name: "ميزان وزن رقمي",
        brand: "Digital Scale",
        description: "ميزان حمام رقمي دقيق لمتابعة الوزن بانتظام، مزود بشاشة إلكترونية واضحة وتصميم عصري.",
        price: 350,
        icon: "fa-scale-balanced"
    }
];

// Initialize Database
function initDB() {
    if (!localStorage.getItem('ezzat_products')) {
        localStorage.setItem('ezzat_products', JSON.stringify(DEFAULT_PRODUCTS));
    }
    if (!localStorage.getItem('ezzat_settings')) {
        localStorage.setItem('ezzat_settings', JSON.stringify(PHARMACY_DEFAULTS));
    }
}

// Get All Products
function getProducts() {
    return JSON.parse(localStorage.getItem('ezzat_products')) || [];
}

// Get Settings
function getSettings() {
    return JSON.parse(localStorage.getItem('ezzat_settings')) || PHARMACY_DEFAULTS;
}

// Run init immediately
initDB();
