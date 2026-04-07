/**
 * pull_from_live.js
 * Fetches all 11 pages from the live site and saves them locally.
 * Run: cd C:\safetypro_complete_frontend && node pull_from_live.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = 'https://www.safetyproworld.com';
const PAGES = [
  'safetypro_v2',
  'safetypro_operations',
  'safetypro_control',
  'safetypro_reports',
  'safetypro_audit_compliance',
  'safetypro_documents',
  'safetypro_field',
  'safetypro_hrm',
  'safetypro_ai',
  'safetypro_auditor',
  'safetypro_admin'
];

function fetch(slug) {
  return new Promise((resolve, reject) => {
    const url = BASE + '/' + slug;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function run() {
  console.log('Pulling live pages from safetyproworld.com...\n');
  for (const slug of PAGES) {
    try {
      const html = await fetch(slug);
      const file = slug + '.html';
      fs.writeFileSync(path.join(process.cwd(), file), html, 'utf8');
      console.log('✅ Saved:', file, '(' + Math.round(html.length/1024) + ' KB)');
    } catch (e) {
      console.log('❌ Failed:', slug, e.message);
    }
  }
  console.log('\nDone. Your local files now match the live site.');
  console.log('Run: npx wrangler pages deploy . --project-name safetypro-frontend');
  console.log('to confirm everything is in sync.');
}

run();
