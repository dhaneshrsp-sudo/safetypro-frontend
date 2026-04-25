const test = "(function(){\n'use strict';\n/* ================================================================\n";
try { new Function(test); console.log('OK'); }
catch(e) { console.log('ERR:', e.message); }

// Try without use strict
const test2 = "(function(){\n/* ================================================================\n";
try { new Function(test2); console.log('OK2'); }
catch(e) { console.log('ERR2:', e.message); }
