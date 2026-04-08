const fs = require('fs');
let h = fs.readFileSync('safetypro_audit_compliance.html','utf8');

// The pre-existing bug: MTG script has unclosed string +'</div>
// followed by blank lines then another <script> tag without a closing </script>
// Fix: add closing quote + semicolon to the broken line

// Find the exact broken line
const broken = "          +'</div>\n\n\n\n\n</script>";
const fixed  = "          +'</div>';\n        });\n      });\n    });\n  });\n})();\n</script>";

if(h.includes(broken)) {
  h = h.replace(broken, fixed);
  console.log('MTG script fixed');
} else {
  // Try alternate - find unclosed +'</div> before </script>
  const re = /(\s+\+\s*'<\/div>)(\s*\n\s*<\/script>)/;
  const m = h.match(re);
  if(m) {
    h = h.replace(re, "$1';\n});\n});\n});\n});\n})();\n</script>");
    console.log('Fixed with regex');
  } else {
    console.log('Pattern not found - checking file');
    // Find all unclosed +'</div> lines
    const lines = h.split('\n');
    for(let i=0;i<lines.length;i++){
      if(lines[i].match(/^\s+\+'<\/div>$/) && i+1 < lines.length && lines[i+1].trim()===''){
        console.log('Found at line', i+1, ':', JSON.stringify(lines[i]));
        lines[i] = lines[i] + "';";
        h = lines.join('\n');
        console.log('Fixed line', i+1);
        break;
      }
    }
  }
}

fs.writeFileSync('safetypro_audit_compliance.html', h);
console.log('ROR_DB in file:', h.includes('var ROR_DB'));
