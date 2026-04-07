const fs = require('fs');
['safetypro_ai.html','safetypro_hrm.html','safetypro_field.html'].forEach(f => {
  let h = fs.readFileSync(f,'utf8');
  const old = 'padding:8px 16px 16px 16px;scrollbar-width:thin';
  const upd = 'padding:8px 22px 16px 16px;scrollbar-width:thin';
  if(h.includes(old)){
    h = h.replace(old, upd);
    fs.writeFileSync(f, h, 'utf8');
    console.log('FIXED:', f);
  } else {
    console.log('SKIP (already fixed or different pattern):', f);
  }
});
