/**
 * patch_all_final.js — Complete nav fix in one script
 * Fixes: HRM/ESG/Admin colors, Risk Management SVG+emoji, ESG in More dropdown,
 *        correct order, icons on all More dropdown items.
 * Run from HTML folder: node patch_all_final.js
 */
const fs = require('fs');

const FILES = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_admin.html','safetypro_audit_compliance.html',
  'safetypro_field.html','safetypro_hrm.html','safetypro_ai.html',
  'safetypro_documents.html','safetypro_auditor.html','safetypro_risk_management.html',
];

const RISK_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;

// ── Extract full <a>...</a> block containing a given string ─────────────────
function extractTag(html, marker, fromIdx = 0) {
  const idx = html.indexOf(marker, fromIdx);
  if (idx === -1) return null;
  const aStart = html.lastIndexOf('<a', idx);
  const aEnd = html.indexOf('</a>', idx);
  if (aStart === -1 || aEnd === -1) return null;
  return { start: aStart, end: aEnd + 4, html: html.slice(aStart, aEnd + 4) };
}

// ── Get SVG from an <a> tag ─────────────────────────────────────────────────
function getSvg(tagHtml) {
  const s = tagHtml.indexOf('<svg');
  const e = tagHtml.indexOf('</svg>');
  if (s === -1 || e === -1) return null;
  return tagHtml.slice(s, e + 6);
}

// ── Remove color from style attribute (regex-safe) ─────────────────────────
function stripColorFromStyle(tag) {
  return tag
    .replace(/;?\s*color\s*:\s*[^;}"']+/gi, '')
    .replace(/;?\s*font-weight\s*:\s*[^;}"']+/gi, '')
    .replace(/style="\s*;?\s*"/g, '')   // remove empty style=""
    .replace(/style='\s*;?\s*'/g, '');
}

// ── Get more-menu div bounds ────────────────────────────────────────────────
function getMoreMenuBounds(html) {
  const classIdx = html.indexOf('class="more-menu"');
  if (classIdx === -1) return null;
  const divStart = html.lastIndexOf('<div', classIdx);
  const openEnd = html.indexOf('>', divStart) + 1;
  let depth = 0, i = divStart;
  while (i < html.length) {
    if (html.startsWith('<div', i) && /[\s>]/.test(html[i + 4])) { depth++; i += 4; continue; }
    if (html.startsWith('</div>', i)) { depth--; if (depth === 0) return { openEnd, closeStart: i }; i += 6; continue; }
    i++;
  }
  return null;
}

// ── Canonical item order (href fragments to match) ─────────────────────────
const ORDER = [
  { frag: 'audit_compliance', label: 'Audit &amp; Compliance' },
  { frag: 'risk_management',  label: 'Risk Management' },
  { frag: 'safetypro_field',  label: 'Site &amp; Field Tools' },
  { frag: 'safetypro_hrm',    label: 'HRM &amp; Payroll' },
  { frag: 'safetypro_ai',     label: 'AI Intelligence' },
  { frag: 'safetypro_auditor',label: 'Client &amp; Auditor Portal' },
  { frag: 'safetypro_documents', label: 'Documents &amp; Records' },
  { frag: 'safetypro_esg',    label: 'Sustainability &amp; ESG' },
];

let patched = 0, skipped = 0;

for (const filename of FILES) {
  if (!fs.existsSync(filename)) { console.log(`MISSING: ${filename}`); continue; }
  let html = fs.readFileSync(filename, 'utf8');
  const orig = html;
  const log = [];

  // ═══════════════════════════════════════════════════════
  // PART 1 — Fix sb-item inline colors + Risk Mgmt SVG
  // ═══════════════════════════════════════════════════════

  // Find #sb-more-items bounds for safe context
  const sbStart = html.indexOf('id="sb-more-items"');
  const sbSearchFrom = sbStart !== -1 ? html.lastIndexOf('<div', sbStart) : 0;
  const sbSearchEnd = sbStart !== -1 ? html.indexOf('</div>', sbStart + 500) + 6 : html.length;
  let sbBlock = html.slice(sbSearchFrom, sbSearchEnd);

  // Fix HRM color in sb-item
  if (sbBlock.includes('safetypro_hrm') && sbBlock.includes('#8B5CF6')) {
    const fixed = stripColorFromStyle(sbBlock.match(/<a[^>]*safetypro_hrm[^>]*>[\s\S]*?<\/a>/)?.[0] || '');
    if (fixed) {
      const orig2 = sbBlock.match(/<a[^>]*safetypro_hrm[^>]*>[\s\S]*?<\/a>/)?.[0];
      if (orig2) { html = html.replace(orig2, fixed); log.push('✅ SB HRM: purple color removed'); }
    }
  }

  // Fix ESG color + remove New span in sb-item
  const esgSbMatch = html.match(/<a[^>]*safetypro_esg[^>]*>[\s\S]*?<\/a>/);
  if (esgSbMatch) {
    let fixed = esgSbMatch[0];
    fixed = stripColorFromStyle(fixed);
    fixed = fixed.replace(/<span[^>]*>\s*New\s*<\/span>/gi, '');
    if (fixed !== esgSbMatch[0]) { html = html.replace(esgSbMatch[0], fixed); log.push('✅ SB ESG: green color + New badge removed'); }
  }

  // Fix Admin sb-item color (var(--green) or #22C55E)
  // Find admin sb-item specifically in sb-more-items
  const adminSbRe = /<a[^>]*class="sb-item[^"]*"[^>]*href="safetypro_admin(?:\.html)?"[^>]*>[\s\S]*?<\/a>/g;
  const adminMatches = [...html.matchAll(adminSbRe)];
  for (const m of adminMatches) {
    if (m[0].includes('--green') || m[0].includes('#22C55E') || m[0].includes('#22c55e')) {
      const fixed = stripColorFromStyle(m[0]);
      html = html.replace(m[0], fixed);
      log.push('✅ SB Admin: green color removed');
      break;
    }
  }

  // Fix Risk Management sb-item: remove emoji + add SVG
  const riskSbRe = /<a[^>]*class="sb-item[^"]*"[^>]*href="safetypro_risk_management"[^>]*>[\s\S]*?<\/a>/;
  const riskSbMatch = html.match(riskSbRe);
  if (riskSbMatch) {
    const tag = riskSbMatch[0];
    if (!tag.includes('<svg') || tag.includes('⚠️')) {
      // Build clean replacement
      const clsMatch = tag.match(/class="([^"]+)"/);
      const cls = clsMatch ? clsMatch[1] : 'sb-item';
      const newTag = `<a class="${cls}" href="safetypro_risk_management">${RISK_SVG}Risk Management</a>`;
      html = html.replace(tag, newTag);
      log.push('✅ SB Risk Management: shield SVG added, emoji removed');
    }
  }

  // ═══════════════════════════════════════════════════════
  // PART 2 — Rebuild More dropdown with correct order + icons
  // ═══════════════════════════════════════════════════════
  const mmBounds = getMoreMenuBounds(html);
  if (mmBounds) {
    const currentBlock = html.slice(mmBounds.openEnd, mmBounds.closeStart);

    // Extract existing mm-items (preserving their SVGs)
    const existingItems = {};
    const mmRe = /<a[^>]*class="mm-item[^"]*"[\s\S]*?<\/a>/g;
    let m;
    while ((m = mmRe.exec(currentBlock)) !== null) {
      const tag = m[0];
      // Identify which page this item is for
      for (const { frag } of ORDER) {
        if (tag.includes(frag)) {
          existingItems[frag] = tag;
          break;
        }
      }
    }

    // Also capture admin item
    const adminRe = /<a[^>]*mm-admin[\s\S]*?<\/a>/;
    const adminMatch = currentBlock.match(adminRe);
    const adminItem = adminMatch ? adminMatch[0] : null;

    // Build canonical items in correct order
    const newMmItems = ORDER.map(({ frag, label }) => {
      let existing = existingItems[frag];
      if (!existing) {
        // Item doesn't exist yet (e.g. ESG missing) — try to get SVG from sb-item
        const sbSvgTag = extractTag(html, frag);
        const svg = sbSvgTag ? getSvg(sbSvgTag.html) : null;
        // Build href based on fragment
        const href = frag === 'safetypro_esg' ? 'safetypro_esg.html'
                   : frag === 'audit_compliance' ? 'safetypro_audit_compliance'
                   : frag === 'risk_management' ? 'safetypro_risk_management'
                   : frag;
        return `<a class="mm-item" href="${href}">${svg || ''}${label}</a>`;
      }
      // Fix existing item: remove emoji, ensure SVG, fix color
      let fixed = existing;
      fixed = fixed.replace(/⚠️\s*/g, '');
      fixed = stripColorFromStyle(fixed);
      // Add SVG if missing
      if (!fixed.includes('<svg')) {
        const sbTag = extractTag(html, frag === 'audit_compliance' ? 'audit_compliance'
                                       : frag === 'risk_management' ? 'risk_management'
                                       : frag);
        const svg = sbTag ? getSvg(sbTag.html) : null;
        if (svg) {
          // Insert SVG after the opening <a ...>
          const aEnd = fixed.indexOf('>') + 1;
          fixed = fixed.slice(0, aEnd) + svg + fixed.slice(aEnd);
        } else if (frag === 'risk_management') {
          const aEnd = fixed.indexOf('>') + 1;
          fixed = fixed.slice(0, aEnd) + RISK_SVG + fixed.slice(aEnd);
        }
      }
      return fixed;
    });

    // Also fix admin item color/style
    let adminFixed = adminItem || '';
    adminFixed = stripColorFromStyle(adminFixed);

    const indent = '\n        ';
    const newContent = indent + newMmItems.join(indent) +
      (adminFixed ? indent + adminFixed : '') + '\n      ';
    html = html.slice(0, mmBounds.openEnd) + newContent + '</div>' + html.slice(mmBounds.closeStart);
    log.push(`✅ More dropdown: rebuilt with correct order, all icons, ESG added, colors fixed`);
  } else {
    log.push('⚠️  more-menu not found');
  }

  // ── Write ──────────────────────────────────────────────
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
