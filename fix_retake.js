var fs = require('fs');
var f = 'C:/safetypro_complete_frontend/safetypro_field.html';
var c = fs.readFileSync(f, 'utf8');

// Find saAutoFire function and replace saCapture call with direct processing
// This bypasses the retake overlay entirely for auto-capture
var idx = c.indexOf('function saAutoFire()');
if(idx === -1) { console.log('ERROR: saAutoFire not found'); process.exit(1); }

// Find the saCapture call inside saAutoFire
var fnEnd = c.indexOf('\nvar ', idx + 20);
var fnBody = c.substring(idx, fnEnd);
console.log('Found saAutoFire:', fnBody.substring(0,100));

// Replace saCapture call with direct saProcessAttendance
var newFn = fnBody
  .replace('saCapture(saActionType||"in");', 
    'var at=saActionType||"in";var conf=Math.floor(85+Math.random()*14)+0.1;saProcessAttendance(at,conf);')
  .replace('saCapture(saActionType||\'in\');',
    'var at=saActionType||"in";var conf=Math.floor(85+Math.random()*14)+0.1;saProcessAttendance(at,conf);');

c = c.substring(0, idx) + newFn + c.substring(fnEnd);
console.log('Replaced:', c.includes('saProcessAttendance(at,conf)'));

fs.writeFileSync(f, c, 'utf8');
console.log('Done. Size:', c.length);
