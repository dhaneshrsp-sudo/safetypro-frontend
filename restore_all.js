/**
 * EMERGENCY RESTORE — restore_all.js
 * Restores all pages from _bk_gfix_ backups
 * Run: cd C:\safetypro_complete_frontend && node restore_all.js
 */
const fs = require('fs'), path = require('path');
const DIR = process.cwd();

const files = fs.readdirSync(DIR);
const backups = files.filter(f => f.includes('_bk_gfix_') && f.endsWith('.html'));

if (!backups.length) {
  console.log('No _bk_gfix_ backups found!');
  console.log('Files in folder:', files.filter(f=>f.endsWith('.html')).join(', '));
  process.exit(1);
}

console.log('Found backups:', backups.length);
backups.forEach(bk => {
  // Get original filename: remove _bk_gfix_TIMESTAMP
  const orig = bk.replace(/_bk_gfix_\d+\.html$/, '.html');
  const bkPath = path.join(DIR, bk);
  const origPath = path.join(DIR, orig);
  fs.copyFileSync(bkPath, origPath);
  const size = Math.round(fs.statSync(origPath).size / 1024);
  console.log('RESTORED:', orig, '(' + size + ' KB) ← from', bk);
});

console.log('');
console.log('All pages restored!');
console.log('Deploy: npx wrangler pages deploy . --project-name safetypro-frontend');
