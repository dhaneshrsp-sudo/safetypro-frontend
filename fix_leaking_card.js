const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// Find the leaking card
const cardMarker = 'To reach Level 4';
const cardIdx = html.indexOf(cardMarker);
if(cardIdx < 0) { console.log('Card not found'); process.exit(1); }

// Find the opening of the card div (going backwards from "To reach Level 4")
const cardDivStart = html.lastIndexOf('<div class="card"', cardIdx);
console.log('Card div starts at:', cardDivStart);
console.log('Context before card:', JSON.stringify(html.substring(cardDivStart-60, cardDivStart)));

// Find the end of the card div (depth counting)
let depth=0, pos=cardDivStart, cardEnd=-1;
while(pos<html.length){
  const no=html.indexOf('<div',pos), nc=html.indexOf('</div>',pos);
  if(nc<0)break;
  if(no>0&&no<nc){depth++;pos=no+4;}
  else{depth--;if(depth===0){cardEnd=nc+6;break;}pos=nc+6;}
}
console.log('Card ends at:', cardEnd);
console.log('After card:', JSON.stringify(html.substring(cardEnd, cardEnd+80)));

// The fix: add display:none to hide it, OR move it inside the maturity tab
// Simplest safe fix: add style="display:none" to hide it from all tabs
// Better fix: move it inside id="tab-maturity"
const maturityTab = html.indexOf('id="tab-maturity"');
if(maturityTab < 0) { 
  console.log('Maturity tab not found, hiding card instead');
  // Just hide it
  html = html.slice(0,cardDivStart) + '<!-- card moved -->' + html.slice(cardEnd);
} else {
  // Find the closing </div> of the maturity tab panel
  // The card should go inside the maturity tab, before it closes
  // First: remove card from current location
  const cardHTML = html.substring(cardDivStart, cardEnd);
  html = html.slice(0, cardDivStart) + html.slice(cardEnd);
  
  // Now find where to insert: inside tab-maturity, just before its closing </div>
  // Find tab-maturity content end
  const matIdx = html.indexOf('id="tab-maturity"');
  const matOpen = html.indexOf('>', matIdx)+1;
  let d=0, p=matIdx, matEnd=-1;
  while(p<html.length){
    const no=html.indexOf('<div',p),nc=html.indexOf('</div>',p);
    if(nc<0)break;
    if(no>0&&no<nc){d++;p=no+4;}
    else{d--;if(d===0){matEnd=nc;break;}p=nc+6;}
  }
  console.log('Maturity tab closes at:', matEnd);
  // Insert card before closing tag of maturity tab
  html = html.slice(0, matEnd) + '\n  ' + cardHTML + '\n' + html.slice(matEnd);
  console.log('Moved card inside maturity tab');
}

fs.writeFileSync(path, Buffer.from(html,'utf8'));
console.log('Saved. Size:', html.length);
