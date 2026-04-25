const https = require('https');
const fs = require('fs');
const baseUrl = 'e143fb6b.safetypro-frontend.pages.dev';
const dir = 'C:/safetypro_complete_frontend';
const pages = [
  'safetypro_v2.html','safetypro_operations.html','safetypro_control.html',
  'safetypro_reports.html','safetypro_admin.html','safetypro_field.html',
  'safetypro_hrm.html','safetypro_ai.html','safetypro_documents.html',
  'safetypro_auditor.html','safetypro_risk_management.html'
];

function download(page) {
  return new Promise((resolve) => {
    const path = '/' + page.replace('.html','');
    const options = {hostname: baseUrl, path: path, method: 'GET',
      headers: {'User-Agent': 'Mozilla/5.0', 'Accept': 'text/html'}};
    const req = https.request(options, (res) => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        let buf = Buffer.concat(chunks);
        if (buf[0]===239 && buf[1]===187 && buf[2]===191) buf = buf.slice(3);
        fs.writeFileSync(dir + '/' + page, buf);
        console.log('OK: ' + page + ' (' + buf.length + ') status:' + res.statusCode);
        resolve(buf.length);
      });
    });
    req.on('error', e => { console.log('ERR: ' + page + ' ' + e.message); resolve(null); });
    req.end();
  });
}

(async () => { for (const p of pages) await download(p); })();
