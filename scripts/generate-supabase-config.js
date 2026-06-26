const fs = require('fs');
const path = require('path');

const url = process.env.SUPABASE_URL || '';
const key = process.env.SUPABASE_ANON_KEY || '';
const out = path.join(__dirname, '../assets/js/supabase-config.js');

const content = `// Auto-generated at build time. Do not commit secrets manually.
window.SUPABASE_URL = ${JSON.stringify(url)};
window.SUPABASE_ANON_KEY = ${JSON.stringify(key)};
`;

fs.writeFileSync(out, content, 'utf8');

if (!url || !key || url.includes('YOUR_PROJECT')) {
    console.warn('[supabase-config] SUPABASE_URL / SUPABASE_ANON_KEY not set — Admin·문의·포트폴리오 DB 연동 비활성');
} else {
    console.log('[supabase-config] Generated assets/js/supabase-config.js');
}
