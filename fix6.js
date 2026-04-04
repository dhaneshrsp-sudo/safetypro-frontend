var fs = require('fs');
var f = 'C:/safetypro_complete_frontend/safetypro_field.html';
var c = fs.readFileSync(f, 'utf8');

// Replace the auto-reset block with camera OFF + tap-to-start shown
var old = "// Auto-reset camera after 3 seconds \u2014 ready for next worker\n      setTimeout(function() {\n        successCard.style.display = 'none';\n        window.saHasCaptured = false;\n        saCountingDown = false;\n        // Reset oval status\n        var oval = document.getElementById('sa-oval');\n        var status = document.getElementById('sa-auto-status');\n        if(oval) oval.className = 'sa-oval';\n        if(status) { status.textContent = 'ALIGN FACE'; status.style.color = 'rgba(34,197,94,0.8)'; }\n        // Restart detection for next worker\n        if(saStream) saStartAutoCapture();\n      }, 3000);";

var newReset = "// After 3 seconds: turn camera OFF, show tap-to-start for next worker\n      setTimeout(function() {\n        // Hide success card\n        successCard.style.display = 'none';\n        // Reset flags\n        window.saHasCaptured = false;\n        saCountingDown = false;\n        // STOP camera stream completely\n        saStopAutoCapture();\n        saStopCamera();\n        // Hide video, show tap-to-start prompt\n        var video = document.getElementById('sa-video');\n        var preview = document.getElementById('sa-photo-preview');\n        var retake = document.getElementById('sa-retake-overlay');\n        var prompt = document.getElementById('sa-start-prompt');\n        var guide = document.getElementById('sa-face-guide');\n        if(video) video.style.display = 'none';\n        if(preview) { preview.style.display = 'none'; preview.src = ''; }\n        if(retake) retake.style.display = 'none';\n        if(guide) guide.style.display = 'none';\n        // Show tap-to-start button for next worker\n        if(prompt) {\n          prompt.style.display = 'flex';\n          prompt.innerHTML = '<div style=\"font-size:52px;margin-bottom:12px;\">\\uD83D\\uDCF8</div>'\n            + '<div style=\"font-family:var(--fh);font-size:13px;font-weight:700;color:var(--t1);margin-bottom:6px;\">Tap to Start Camera</div>'\n            + '<div style=\"font-size:10px;color:var(--t3);\">Ready for next worker</div>'\n            + '<div style=\"margin-top:14px;padding:9px 24px;background:var(--green);border-radius:8px;color:#0B0F14;font-size:12px;font-weight:800;font-family:var(--fh);cursor:pointer;\" onclick=\"saStartCamera()\">Enable Camera</div>';\n        }\n        // Reset status text\n        var status = document.getElementById('sa-auto-status');\n        var oval = document.getElementById('sa-oval');\n        if(oval) oval.className = 'sa-oval';\n        if(status) { status.textContent = 'ALIGN FACE'; status.style.color = 'rgba(34,197,94,0.8)'; }\n      }, 3000);";

if(c.includes(old)) {
  c = c.replace(old, newReset);
  console.log('Reset block: REPLACED');
} else {
  // Find by shorter unique string
  var idx = c.indexOf('// Auto-reset camera after 3 seconds');
  var end = c.indexOf('}, 3000);', idx) + 9;
  console.log('Found at:', idx, 'end:', end);
  if(idx > 0) {
    c = c.substring(0, idx) + newReset + c.substring(end);
    console.log('Reset block: REPLACED via indexOf');
  } else {
    console.log('ERROR: could not find reset block');
  }
}

fs.writeFileSync(f, c, 'utf8');
console.log('Done. Size:', c.length);
console.log('CameraOff:', c.includes('saStopCamera()'));
console.log('TapToStart:', c.includes('Ready for next worker'));
