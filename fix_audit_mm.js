const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let html = fs.readFileSync(path, 'utf8');

// Find the top nav More button and its dropdown container
// Search for common More dropdown patterns
const patterns = [
  'mm-dropdown', 'mm-menu', 'mm-wrap', 'more-menu', 'more-dropdown',
  'id="more-', 'class="more-', 'toggleMore', 'showMore'
];
patterns.forEach(p => {
  const idx = html.indexOf(p);
  if(idx > 0) console.log('Found "'+p+'" at:', idx, '| ctx:', JSON.stringify(html.substring(idx-20,idx+80)));
});

// Find top nav area - look for the nav links (Dashboard, Operations, Control, Reports, More)
console.log('\n--- Top nav More button area ---');
const topNavMore = html.indexOf('"More"') > 0 ? html.indexOf('"More"') : html.indexOf('>More<');
console.log('Top nav "More" text at:', topNavMore);
if(topNavMore > 0) {
  // Find enclosing div/button
  const ctx = html.substring(topNavMore - 300, topNavMore + 400);
  console.log(ctx);
}
