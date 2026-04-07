const fs = require('fs');
['safetypro_ai.html','safetypro_hrm.html','safetypro_field.html'].forEach(f => {
  let h = fs.readFileSync(f,'utf8');
  
  // Fix padding if not already 22px
  h = h.replace(/padding:8px 16px 16px 16px/g, 'padding:8px 22px 16px 16px');
  
  // Remove duplicate admin link - keep only first occurrence
  const start = h.indexOf('<div id="sb-more-items"');
  const end = h.indexOf('</div>', start) + 6;
  const firstAdmin = h.indexOf('safetypro_admin', start);
  const secondAdmin = h.indexOf('safetypro_admin', firstAdmin + 1);
  if(secondAdmin > -1 && secondAdmin < end) {
    const linkStart = h.lastIndexOf('<a ', secondAdmin);
    const linkEnd = h.indexOf('</a>', secondAdmin) + 4;
    h = h.substring(0, linkStart) + h.substring(linkEnd);
    console.log(f + ': duplicate admin removed');
  }
  fs.writeFileSync(f, h, 'utf8');
});
