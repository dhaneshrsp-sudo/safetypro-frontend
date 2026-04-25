/**
 * patch_reorder_sidebar.js
 * Reorders #sb-more-items to canonical sequence on every page.
 * Preserves each item's full HTML (SVG icons, classes, styles).
 * Run from HTML folder: node patch_reorder_sidebar.js
 */
const fs = require('fs');

const FILES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_admin.html','safetypro_audit_compliance.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_documents.html','safetypro_auditor.html','safetypro_risk_management.html',
];

// Canonical order — match by href fragment (partial match)
const CANONICAL = [
  'audit_compliance',
  'risk_management',
  'safetypro_field',
  'safetypro_hrm',
  'safetypro_ai',
  'safetypro_auditor',
  'safetypro_document',
  'safetypro_esg',
  'safetypro_admin',
];

// Extract all <a> tags from a block (direct children style)
function extractAllATags(block) {
  const tags = [];
  let pos = 0;
  while (pos < block.length) {
    const aStart = block.indexOf('<a', pos);
    if (aStart === -1) break;
    const aEnd = block.indexOf('</a>', aStart);
    if (aEnd === -1) break;
    tags.push({ html: block.slice(aStart, aEnd + 4), start: aStart, end: aEnd + 4 });
    pos = aEnd + 4;
  }
  return tags;
}

// Get #sb-more-items div bounds
function getSbMoreBounds(html) {
  const markerIdx = html.indexOf('id="sb-more-items"');
  if (markerIdx === -1) return null;
  const divStart = html.lastIndexOf('<div', markerIdx);
  const openEnd = html.indexOf('>', divStart) + 1;
  let depth = 0, i = divStart;
  while (i < html.length) {
    if (html.startsWith('<div', i) && /[\s>]/.test(html[i + 4])) { depth++; i += 4; continue; }
    if (html.startsWith('</div>', i)) { depth--; if (depth === 0) return { openEnd, closeStart: i }; i += 6; continue; }
    i++;
  }
  return null;
}

// Match a tag to a canonical fragment
function matchFragment(tagHtml, frag) {
  return tagHtml.includes(frag);
}

let patched = 0, skipped = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) { console.log(`MISSING: ${filename}`); continue; }
  let html = fs.readFileSync(filename, 'utf8');
  const orig = html;
  const log = [];

  const bounds = getSbMoreBounds(html);
  if (!bounds) { log.push('⚠️  #sb-more-items not found'); console.log(`\nFILE: ${filename}`); log.forEach(l => console.log(`   ${l}`)); continue; }

  const innerBlock = html.slice(bounds.openEnd, bounds.closeStart);
  const tags = extractAllATags(innerBlock);

  if (tags.length === 0) { log.push('⚠️  No sb-items found'); console.log(`\nFILE: ${filename}`); log.forEach(l => console.log(`   ${l}`)); continue; }

  // Build ordered list: slot each tag into canonical position
  const ordered = [];
  const used = new Set();

  for (const frag of CANONICAL) {
    const match = tags.find((t, i) => !used.has(i) && matchFragment(t.html, frag));
    if (match) {
      const idx = tags.indexOf(match);
      used.add(idx);
      ordered.push(match.html);
    }
    // If not found, this item is not on this page — skip (e.g. audit_compliance on its own page)
  }

  // Append any remaining tags not matched by canonical (safety net)
  tags.forEach((t, i) => { if (!used.has(i)) ordered.push(t.html); });

  // Build new inner content
  const indent = '\n      ';
  const newInner = indent + ordered.join(indent) + '\n    ';

  // Compare with existing — only write if order changed
  const existingOrder = tags.map(t => t.html);
  const orderChanged = ordered.some((h, i) => h !== existingOrder[i]);

  if (orderChanged) {
    html = html.slice(0, bounds.openEnd) + newInner + html.slice(bounds.closeStart);
    log.push(`✅ Sidebar reordered: ${ordered.length} items in canonical sequence`);
    log.push(`   Order: ${ordered.map(h => {
      for (const f of CANONICAL) if (h.includes(f)) return f.replace('safetypro_','');
      return '?';
    }).join(' → ')}`);
  } else {
    log.push('ℹ️  Sidebar already in correct order');
  }

  if (html !== orig) {
    fs.writeFileSync(filename, html, 'utf8');
    patched++;
  } else {
    skipped++;
  }

  console.log(`\nFILE: ${filename}`);
  log.forEach(l => console.log(`   ${l}`));
}

console.log('\n' + '='.repeat(60));
console.log(`Patched: ${patched}  |  Skipped: ${skipped}`);
console.log('='.repeat(60));
console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');
