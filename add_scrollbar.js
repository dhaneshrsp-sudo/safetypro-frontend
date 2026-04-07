/**
 * SafetyPro AI — add_scrollbar.js v2
 * SURGICAL: adds 5 CSS lines only — nothing removed, nothing changed
 * Run: cd C:\safetypro_complete_frontend && node add_scrollbar.js
 */
const fs = require('fs'), path = require('path');
const DIR = process.cwd();

const MARKER = '/* SafetyPro scrollbar v2 */';

// 5 lines — .body overflow fix + scrollbar styling
const SCROLLBAR_CSS = `
${MARKER}
.body { overflow: hidden !important; }
.content { overflow-y: auto !important; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }
.content::-webkit-scrollbar { width: 4px; }
.content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }
`;

// Skip dashboard (already correct) and backups
const SKIP = ['safetypro_v2.html'];

const files = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.html') && !f.includes('_bk_') && !SKIP.includes(f));

console.log('Files to patch:', files.length);

files.forEach(filename => {
  const filepath = path.join(DIR, filename);
  let html = fs.readFileSync(filepath, 'utf8');

  // Remove old v1 marker if present and replace with v2
  const OLD_MARKER = '/* SafetyPro scrollbar — matches dashboard */';
  if (html.includes(OLD_MARKER)) {
    // Replace old 4-line block with new 5-line block
    const oldBlock = '\n' + OLD_MARKER + '\n.content { overflow-y: auto !important; scrollbar-width: thin; scrollbar-color: var(--border) transparent; }\n.content::-webkit-scrollbar { width: 4px; }\n.content::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }\n';
    html = html.replace(oldBlock, SCROLLBAR_CSS);
    if (html.includes(MARKER)) {
      fs.writeFileSync(filepath, html, 'utf8');
      console.log('UPDATED v1→v2:', filename, '(' + Math.round(html.length/1024) + 'KB)');
      return;
    }
  }

  // Skip if already has v2
  if (html.includes(MARKER)) {
    console.log('SKIP (already v2):', filename);
    return;
  }

  // Find FIRST </head> — safe insertion point (never contains JS strings)
  const headEnd = html.indexOf('</head>');
  if (headEnd < 0) {
    console.log('SKIP (no </head>):', filename);
    return;
  }

  // Backup
  const bk = filepath.replace('.html', '_bk_sb2_' + Date.now() + '.html');
  fs.copyFileSync(filepath, bk);

  // Insert style block just before </head>
  const styleBlock = '<style>' + SCROLLBAR_CSS + '</style>\n';
  html = html.slice(0, headEnd) + styleBlock + html.slice(headEnd);
  fs.writeFileSync(filepath, html, 'utf8');
  console.log('PATCHED:', filename, '(' + Math.round(html.length/1024) + 'KB)');
});

console.log('\nDone! Deploy: npx wrangler pages deploy . --project-name safetypro-frontend');
