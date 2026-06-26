(function () {
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
        console.warn('Supabase config missing. Copy supabase-config.example.js → supabase-config.js');
        window.supabaseClient = null;
        return;
    }
    if (window.SUPABASE_URL.includes('YOUR_PROJECT')) {
        console.warn('Supabase config not configured yet.');
        window.supabaseClient = null;
        return;
    }
    window.supabaseClient = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
})();
