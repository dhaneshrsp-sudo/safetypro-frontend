const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_reports.html';
let html = fs.readFileSync(path, 'utf8');

// The broken section: </div>\n    </div>\n  </div>\n\n<!-- CONTENT -->
// Should be:         </div>\n  </div>\n\n<!-- CONTENT -->
// (one extra </div> was added by our script)

const broken = '    </div>\n  </div>\n\n<!-- CONTENT -->';
const fixed  = '  </div>\n\n<!-- CONTENT -->';

const idx = html.indexOf(broken);
if(idx > 0) {
  // Check what's just before
  console.log('Context before fix:');
  console.log(JSON.stringify(html.substring(idx-50, idx+broken.length+20)));
  html = html.slice(0, idx) + fixed + html.slice(idx + broken.length);
  fs.writeFileSync(path, Buffer.from(html,'utf8'));
  console.log('FIXED. Size:', html.length);
} else {
  console.log('Pattern not found, trying alternate...');
  // Try the full pattern from diagnostic
  const broken2 = '</a>\n    </div>\n    </div>\n  </div>\n\n<!-- CONTENT -->';
  const fixed2  = '</a>\n    </div>\n  </div>\n\n<!-- CONTENT -->';
  const idx2 = html.indexOf(broken2);
  if(idx2 > 0) {
    html = html.slice(0, idx2) + fixed2 + html.slice(idx2 + broken2.length);
    fs.writeFileSync(path, Buffer.from(html,'utf8'));
    console.log('FIXED with alternate. Size:', html.length);
  } else {
    // Show what's around CONTENT comment
    const ci = html.indexOf('<!-- CONTENT -->');
    console.log('Around CONTENT:', JSON.stringify(html.substring(ci-150, ci+20)));
  }
}
