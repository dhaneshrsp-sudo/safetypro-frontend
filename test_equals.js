// Test how many = signs cause failure
for (let n = 60; n <= 67; n++) {
  const test = "(function(){\n'use strict';\n/* " + '='.repeat(n) + "\n";
  try { new Function(test); }
  catch(e) {
    if (!e.message.includes('end of input')) {
      console.log('n='+n+': ERR:', e.message);
    } else {
      console.log('n='+n+': OK (just unclosed)');
    }
  }
}
