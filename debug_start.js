const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const html = fs.readFileSync(path, 'utf8');
const lines = html.split('\n');

// Script starts at line 9681 (index 9680)
// Check first 5 chars of line 9681
const L9681 = lines[9680];
const codes = [];
for(let i=0;i<Math.min(L9681.length,10);i++) codes.push(L9681.charCodeAt(i));
console.log('L9681 length:', L9681.length, 'codes:', codes.join(','));

// Check if there is something BEFORE (function on the <script> line itself
const scriptTag = lines[9679];
console.log('Script tag line:', JSON.stringify(scriptTag));

// Test: empty first line + IIFE
const test1 = "\n(function(){\n'use strict';\nvar x=1;\n})();";
try { new Function(test1); console.log('T1: OK'); } catch(e) { console.log('T1 ERR:', e.message); }

// Is there content on the <script> line after the tag?
const scriptTagLine = lines[9679];
const afterTag = scriptTagLine.indexOf('<script>') + 8;
const afterContent = scriptTagLine.slice(afterTag);
console.log('After <script>:', JSON.stringify(afterContent));
