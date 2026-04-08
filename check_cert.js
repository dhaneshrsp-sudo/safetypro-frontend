const fs = require('fs');
let h = fs.readFileSync('safetypro_field.html','utf8');

// Check what JS functions exist
console.log('toggleCertPanel exists:', h.includes('function toggleCertPanel'));
console.log('training-cert-v3:', h.includes('training-cert-v3'));
console.log('training-cert-generator:', h.includes('training-cert-generator'));
console.log('cert-toggle-btn exists:', h.includes('cert-toggle-btn'));
console.log('att-stats-grid exists:', h.includes('att-stats-grid'));
