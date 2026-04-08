const fs = require('fs');
let h = fs.readFileSync('safetypro_field.html','utf8');
const old = "data.validityYears+' Yr':'(data.validityYears*12)+'Months')+'</div></div>'";
const fix = "data.validityYears+' Yr':(data.validityYears*12)+' Months')+'</div></div>'";
if(h.includes(old)) {
  h = h.replace(old, fix);
  console.log('FIXED syntax error');
} else {
  console.log('NOT FOUND - trying alternate');
  h = h.replace("*12)+'Months')", "*12)+' Months')");
  console.log('Done');
}
fs.writeFileSync('safetypro_field.html',h,'utf8');
