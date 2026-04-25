const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
const content = fs.readFileSync(path, 'utf8');

// Extract script blocks and try to parse each one
const scriptRegex = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let match;
let scriptNum = 0;
while ((match = scriptRegex.exec(content)) !== null) {
  scriptNum++;
  const scriptContent = match[1];
  const startLine = content.slice(0, match.index).split('\n').length;
  try {
    new Function(scriptContent);
  } catch(e) {
    console.log('SCRIPT #' + scriptNum + ' starts at HTML line ' + startLine + ': ERROR: ' + e.message);
    // Find which line in the script has the error
    const errMatch = e.stack.match(/<anonymous>:(\d+)/);
    if (errMatch) {
      const scriptLine = parseInt(errMatch[1]);
      const scriptLines = scriptContent.split('\n');
      console.log('  At script line ' + scriptLine + ': ' + (scriptLines[scriptLine-1]||'').trim().substring(0,80));
      // Show surrounding context
      for (let i = Math.max(0,scriptLine-3); i < Math.min(scriptLines.length, scriptLine+2); i++) {
        console.log('  L'+(i+1)+': ' + scriptLines[i].substring(0,80));
      }
    }
  }
}
console.log('Total scripts checked:', scriptNum);
