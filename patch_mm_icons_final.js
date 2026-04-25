/**
 * patch_mm_icons_final.js
 * 1. Adds SVG icons to all mm-items (reads from #sb-more-items section only)
 * 2. Removes leftover "61983" / unicode junk from ESG sidebar item
 * Run from HTML folder: node patch_mm_icons_final.js
 */
const fs = require('fs');

const FILES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_admin.html','safetypro_audit_compliance.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_documents.html','safetypro_auditor.html','safetypro_risk_management.html',
];

// Map: mm-item href fragment → sb-item href fragment (for SVG lookup)
const ICON_MAP = [
  { mm: 'audit_compliance', sb: 'audit_compliance' },
  { mm: 'risk_management',  sb: 'risk_management'  },
  { mm: 'safetypro_field',  sb: 'safetypro_field'  },
  { mm: 'safetypro_hrm',    sb: 'safetypro_hrm'    },
  { mm: 'safetypro_ai',     sb: 'safetypro_ai'     },
  { mm: 'safetypro_auditor',sb: 'safetypro_auditor'},
  { mm: 'safetypro_documents',sb:'safetypro_documents'},
  { mm: 'safetypro_esg',    sb: 'safetypro_esg'    },
];

// Extract SVG from a tag string
function getSvgFromTag(tag) {
  const s = tag.indexOf('<svg'); const e = tag.indexOf('</svg>');
  return (s !== -1 && e !== -1) ? tag.slice(s, e + 6) : null;
}

// Find <a> tag containing hrefFrag, searching ONLY within the given block
function findTagInBlock(block, hrefFrag) {
  const idx = block.indexOf(hrefFrag);
  if (idx === -1) return null;
  const aStart = block.lastIndexOf('<a', idx);
  const aEnd   = block.indexOf('</a>', idx);
  if (aStart === -1 || aEnd === -1) return null;
  return block.slice(aStart, aEnd + 4);
}

// Extract #sb-more-items block from html
function getSbMoreBlock(html) {
  const start = html.indexOf('id="sb-more-items"');
  if (start === -1) return '';
  const divOpen = html.lastIndexOf('<div', start);
  let depth = 0, i = divOpen;
  while (i < html.length) {
    if (html.startsWith('<div', i) && /[\s>]/.test(html[i+4])) { depth++; i+=4; continue; }
    if (html.startsWith('</div>', i)) { depth--; if (depth===0) return html.slice(divOpen, i+6); i+=6; continue; }
    i++;
  }
  return html.slice(divOpen);
}

// Get more-menu div bounds
function getMoreMenuBounds(html) {
  const ci = html.indexOf('class="more-menu"');
  if (ci === -1) return null;
  const ds = html.lastIndexOf('<div', ci);
  const oe = html.indexOf('>', ds) + 1;
  let depth = 0, i = ds;
  while (i < html.length) {
    if (html.startsWith('<div', i) && /[\s>]/.test(html[i+4])) { depth++; i+=4; continue; }
    if (html.startsWith('</div>', i)) { depth--; if (depth===0) return {openEnd:oe, closeStart:i}; i+=6; continue; }
    i++;
  }
  return null;
}

let patched = 0, skipped = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) { console.log(`MISSING: ${filename}`); continue; }
  let html = fs.readFileSync(filename, 'utf8');
  const orig = html;
  const log = [];

  // ── FIX 1: Remove junk characters from ESG sb-item ────────────────────────
  // "61983" is \uF21F — a private use area char from icon font badge
  const esgSbRe = /<a[^>]*href="safetypro_esg(?:\.html)?"[^>]*>[\s\S]*?<\/a>/;
  const esgMatch = html.match(esgSbRe);
  if (esgMatch) {
    let fixed = esgMatch[0];
    // Remove any <span> children (New badge)
    fixed = fixed.replace(/<span[\s\S]*?<\/span>/g, '');
    // Remove private use area characters and stray numbers from ESG text
    fixed = fixed.replace(/[\uE000-\uF8FF]/g, '');
    // Remove isolated numbers at end of text node (like " 61983")
    fixed = fixed.replace(/\s+\d{4,6}(?=\s*<\/a>)/g, '');
    if (fixed !== esgMatch[0]) {
      html = html.replace(esgMatch[0], fixed);
      log.push('✅ ESG: junk characters / New badge fully removed');
    }
  }

  // ── FIX 2: Add SVG icons to mm-items ─────────────────────────────────────
  const mmBounds = getMoreMenuBounds(html);
  if (!mmBounds) { log.push('⚠️ more-menu not found'); goto_write: { } }
  else {
    const sbBlock = getSbMoreBlock(html);
    const mmBlock = html.slice(mmBounds.openEnd, mmBounds.closeStart);
    let newMmBlock = mmBlock;

    let iconsAdded = 0;
    for (const { mm, sb } of ICON_MAP) {
      // Find the mm-item for this page
      const mmTag = findTagInBlock(newMmBlock, mm);
      if (!mmTag) continue;
      if (mmTag.includes('<svg')) continue; // already has icon

      // Get SVG from sb-more-items block ONLY
      const sbTag = findTagInBlock(sbBlock, sb);
      const svg = sbTag ? getSvgFromTag(sbTag) : null;
      if (!svg) { log.push(`⚠️ No SVG found in sidebar for: ${mm}`); continue; }

      // Insert SVG into mm-item after opening <a...>
      const aGtIdx = mmTag.indexOf('>') + 1;
      const newMmTag = mmTag.slice(0, aGtIdx) + svg + mmTag.slice(aGtIdx);
      newMmBlock = newMmBlock.replace(mmTag, newMmTag);
      iconsAdded++;
    }

    if (iconsAdded > 0) {
      html = html.slice(0, mmBounds.openEnd) + newMmBlock + html.slice(mmBounds.closeStart);
      log.push(`✅ More dropdown: ${iconsAdded} SVG icons added`);
    } else {
      log.push('ℹ️  More dropdown: all icons already present or no SVGs found');
    }
  }

  // ── Write ──────────────────────────────────────────────────────────────────
  if (html !== orig) {
    fs.writeFileSync(filename, html, 'utf8');
    patched++;
  } else {
    skipped++;
    log.push('(no changes)');
  }

  console.log(`\nFILE: ${filename}`);
  log.forEach(l => console.log(`   ${l}`));
}

console.log('\n' + '='.repeat(60));
console.log(`Patched: ${patched}  |  Skipped: ${skipped}`);
console.log('='.repeat(60));
console.log('Deploy: npx wrangler pages deploy . --project-name=safetypro-frontend');
