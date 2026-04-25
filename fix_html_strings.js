const fs = require("fs");
let c = fs.readFileSync("C:/safetypro_complete_frontend/safetypro_audit_compliance.html","utf8");
const lines = c.split("\n");
let fixed = 0;

for(let i=9759; i<9850; i++) {
  const orig = lines[i];
  let L = orig;
  
  // Fix missing > after style closing quote before HTML tag
  L = L.replace(/"([A-Za-z])/g, function(m,ch) {
    // Only fix if this looks like a CSS value ending (not inside JS logic)
    if(m === '"<' || m === '">' || m === '"/' ) return '">'+ch;
    return m;
  });
  
  // Fix '"style= or '"class= etc (single+double quote before attribute)
  L = L.replace(/'"([a-z-]+)=/g, "' $1=");
  
  // Fix type="text"value= (missing space)
  L = L.replace(/type="([^"]+)"([a-z])/g, 'type="$1" $2');
  L = L.replace(/id="([^"]+)"([a-z])/g, 'id="$1" $2');
  
  // Fix "</canvas> missing closing >
  L = L.replace(/"<\/canvas>/g, '"></canvas>');
  L = L.replace(/"([a-z])/g, function(m, ch) {
    if(['s','c','w','b','p','m','d','f','h','i','o','t','r','a','n','l','g','u','v','j'].includes(ch)) {
      return '">' + ch;
    }
    return m;
  });
  
  if(L !== orig) { lines[i] = L; fixed++; }
}

c = lines.join("\n");
fs.writeFileSync("C:/safetypro_complete_frontend/safetypro_audit_compliance.html", Buffer.from(c,"utf8"));
console.log("Fixed:", fixed, "Size:", c.length);