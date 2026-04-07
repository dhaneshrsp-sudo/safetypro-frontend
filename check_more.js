const fs = require('fs');
let h = fs.readFileSync('safetypro_documents.html','utf8');

// Find STATS section - div containing the 4 stat cards (Total Documents etc)
// Look for the div that directly contains card divs with "Total Documents"
const statsMarker = 'Total Documents';
const markerIdx = h.indexOf(statsMarker);

// Walk back to find the opening parent div of the cards
let searchIdx = markerIdx;
// Go back to find the <div class="card" that contains this
let cardStart = h.lastIndexOf('<div class="card"', markerIdx);
// Go back one more level to find the container div
let containerStart = h.lastIndexOf('<div', cardStart - 1);
let containerTagEnd = h.indexOf('>', containerStart) + 1;

console.log('Container tag:', h.substring(containerStart, containerTagEnd));
console.log('Context before:', h.substring(containerStart - 50, containerStart));
