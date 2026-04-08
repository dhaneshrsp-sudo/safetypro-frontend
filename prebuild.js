const fs = require('fs');
const https = require('https');
function dl(url, dest) {
  return new Promise((res, rej) => {
    const f = fs.createWriteStream(dest);
    https.get(url, r => { r.pipe(f); f.on('finish', () => { f.close(); res(); }); }).on('error', rej);
  });
}
dl('https://raw.githubusercontent.com/dhaneshrsp-sudo/safetypro-frontend/main/safetypro_reports.html', 'safetypro_reports.html.bak').then(() => console.log('Backed up'));
