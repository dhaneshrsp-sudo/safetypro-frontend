const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let content = fs.readFileSync(path, 'utf8');

// Find the <script> tag for script #27 and the exact newlines before (function(){
// Replace \n<script>\n\n(function(){ with \n<script>\n(function(){
const patterns = [
  ['<script>\n\n(function(){', '<script>\n(function(){'],
  ['<script>\n\n\n(function(){', '<script>\n(function(){'],
];

let fixed = false;
patterns.forEach(function(p) {
  if (content.includes(p[0])) {
    content = content.replace(p[0], p[1]);
    console.log('Fixed: removed extra newlines before (function(){');
    fixed = true;
  }
});

if (!fixed) console.log('Pattern not found');

const buf = Buffer.from(content, 'utf8');
fs.writeFileSync(path, buf);
console.log('First 3 bytes:', buf[0], buf[1], buf[2]);
console.log('Size:', content.length);
