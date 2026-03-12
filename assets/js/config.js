// ==========================================
// Ezzat Pharmacy - Configuration File
// ==========================================

// Supabase Configuration 
// REPLACE WITH YOUR ACTUAL SUPABASE URL AND KEY FROM supabase.com
const SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// EmailJS Configuration
// REPLACE WITH YOUR ACTUAL EMAILJS KEYS FROM emailjs.com
const EMAILJS_PUBLIC_KEY = 'YOUR_EMAILJS_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = 'YOUR_EMAILJS_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'YOUR_EMAILJS_TEMPLATE_ID';

// Pharmacy Default Settings (Fallback if DB fails)
const PHARMACY_DEFAULTS = {
    whatsapp: "201001816929",
    phone: "+201001816929",
    email: "info@ezzatpharmacy.com",
    address: "أم دومة – مركز طما – محافظة سوهاج – مصر"
};
