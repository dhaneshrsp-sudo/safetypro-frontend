var fs = require('fs');
var f = 'C:/safetypro_complete_frontend/safetypro_field.html';
var c = fs.readFileSync(f, 'utf8');

// Find the success card display in saProcessAttendance
// After success is shown, add auto-reset to return camera to live view
var oldSuccess = "successCard.style.display = 'block';";

// Find which occurrence is in saProcessAttendance (not saAddToFeed)
var idx = c.indexOf('function saProcessAttendance');
var fnCode = c.substring(idx, idx + 2000);
var successIdx = fnCode.indexOf("successCard.style.display = 'block';");
console.log('Success card at offset:', successIdx);

// Replace with version that also adds auto-reset after 3 seconds
var newSuccess = "successCard.style.display = 'block';" +
  "\n      // Auto-reset camera after 3 seconds — ready for next worker" +
  "\n      setTimeout(function() {" +
  "\n        successCard.style.display = 'none';" +
  "\n        window.saHasCaptured = false;" +
  "\n        saCountingDown = false;" +
  "\n        // Reset oval status" +
  "\n        var oval = document.getElementById('sa-oval');" +
  "\n        var status = document.getElementById('sa-auto-status');" +
  "\n        if(oval) oval.className = 'sa-oval';" +
  "\n        if(status) { status.textContent = 'ALIGN FACE'; status.style.color = 'rgba(34,197,94,0.8)'; }" +
  "\n        // Restart detection for next worker" +
  "\n        if(saStream) saStartAutoCapture();" +
  "\n      }, 3000);";

// Do the replacement at the exact position in the full file
var absIdx = c.indexOf('function saProcessAttendance');
var fnPart = c.substring(absIdx, absIdx + 2000);
var newFnPart = fnPart.replace("successCard.style.display = 'block';", newSuccess);

if(fnPart !== newFnPart) {
  c = c.substring(0, absIdx) + newFnPart + c.substring(absIdx + 2000);
  console.log('Auto-reset: ADDED');
} else {
  console.log('Pattern not found - checking exact string...');
  var testIdx = c.indexOf("successCard.style.display = 'block'");
  console.log('Found at:', testIdx);
}

fs.writeFileSync(f, c, 'utf8');
console.log('Done. Size:', c.length);
console.log('AutoReset:', c.includes('Auto-reset camera after 3 seconds'));
