const fs = require('fs');

// Fix Documents page — reduce stat card grid size directly in HTML
['safetypro_documents.html', 'safetypro_auditor.html'].forEach(p => {
  let h = fs.readFileSync(p, 'utf8');
  
  // Fix grid inline style
  h = h.replace(
    /grid-template-columns:repeat\(auto-fill,minmax\(140px,1fr\)\);gap:12px;margin-bottom:18px/g,
    'grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:8px;margin-bottom:10px'
  );
  
  // Fix card padding
  h = h.replace(
    /"card" style="text-align:center;padding:14px;"/g,
    '"card" style="text-align:center;padding:8px 10px;"'
  );
  
  // Fix large font size in stat numbers
  h = h.replace(/font-size:26px;/g, 'font-size:20px;');
  
  fs.writeFileSync(p, h, 'utf8');
  console.log('PATCHED:', p);
});
