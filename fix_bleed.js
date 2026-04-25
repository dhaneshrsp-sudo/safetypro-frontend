const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// The structure should be:
// <div class="body">
//   <div class="sidebar">...</div>
//   <div class="content">...</div>
// </div>

// Find where content div currently is
const contentIdx = html.indexOf('<div class="content">');
const bodyIdx = html.indexOf('<div class="body">') || html.indexOf('<div class="body "');
const sidebarEnd = html.indexOf('</div>', html.indexOf('<div class="sidebar">'));

// Check what's BEFORE <!-- CONTENT -->
const contentComment = html.indexOf('<!-- CONTENT -->');
console.log('body div at:', bodyIdx);
console.log('content div at:', contentIdx);
console.log('<!-- CONTENT --> at:', contentComment);

// Check context around the content div
if(contentIdx > 0) {
  console.log('30 chars before content div:');
  console.log(JSON.stringify(html.substring(contentIdx-100, contentIdx)));
}
