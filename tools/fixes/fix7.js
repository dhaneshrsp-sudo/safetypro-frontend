var fs = require('fs');
var f = 'C:/safetypro_complete_frontend/safetypro_field.html';
var c = fs.readFileSync(f, 'utf8');

// FIX 1: Remove the premature guard reset from saProcessAttendance
c = c.replace(
  'function saProcessAttendance(actionType, confidence) { window.saHasCaptured=false;',
  'function saProcessAttendance(actionType, confidence) {'
);
console.log('Fix1 - guard reset removed:', !c.includes('function saProcessAttendance(actionType, confidence) { window.saHasCaptured=false;'));

// FIX 2: Replace the 3-second reset block with camera OFF + show attendance
var oldReset = c.indexOf('// Auto-reset camera after 3 seconds');
var oldResetEnd = c.indexOf('}, 3000);', oldReset) + 9;
console.log('Reset block found:', oldReset > 0, 'end:', oldResetEnd);

var newReset = '// After 3s: stop camera, show confirmation\n' +
'      setTimeout(function() {\n' +
'        // Hide success card\n' +
'        successCard.style.display = "none";\n' +
'        // STOP camera completely\n' +
'        saStopAutoCapture();\n' +
'        saStopCamera();\n' +
'        // Hide video elements\n' +
'        var vid = document.getElementById("sa-video");\n' +
'        var prev = document.getElementById("sa-photo-preview");\n' +
'        var retake = document.getElementById("sa-retake-overlay");\n' +
'        var guide = document.getElementById("sa-face-guide");\n' +
'        if(vid) vid.style.display = "none";\n' +
'        if(prev){ prev.style.display="none"; prev.src=""; }\n' +
'        if(retake) retake.style.display = "none";\n' +
'        if(guide) guide.style.display = "none";\n' +
'        // Show confirmation screen with attendance details\n' +
'        var container = document.getElementById("sa-camera-container");\n' +
'        if(container){\n' +
'          var existing = document.getElementById("sa-confirmed-screen");\n' +
'          if(existing) existing.remove();\n' +
'          var screen = document.createElement("div");\n' +
'          screen.id = "sa-confirmed-screen";\n' +
'          screen.style.cssText = "position:absolute;inset:0;background:var(--card);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;border-radius:12px;padding:20px;text-align:center;";\n' +
'          var t = new Date();\n' +
'          var timeStr = t.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",hour12:true});\n' +
'          var workerName = document.getElementById("sa-worker-id") ? (document.getElementById("sa-worker-id").value||"Site Worker") : "Site Worker";\n' +
'          screen.innerHTML = \n' +
'            \'<div style="width:56px;height:56px;border-radius:50%;background:var(--green);display:flex;align-items:center;justify-content:center;font-size:28px;">\\u2713</div>\'\n' +
'            + \'<div style="font-family:var(--fh);font-size:15px;font-weight:800;color:var(--green);">Attendance Marked</div>\'\n' +
'            + \'<div style="font-size:13px;font-weight:600;color:var(--t1);">\' + workerName + \'</div>\'\n' +
'            + \'<div style="font-size:11px;color:var(--t3);">\\u2713 Checked IN &nbsp;\\u00B7&nbsp; Zone A &nbsp;\\u00B7&nbsp; \' + timeStr + \'</div>\'\n' +
'            + \'<div style="font-size:10px;color:var(--t3);padding:6px 14px;background:var(--raised);border-radius:20px;border:1px solid var(--border);">\\uD83D\\uDCCD GPS Captured &nbsp;\\u00B7&nbsp; \\uD83D\\uDCF8 Face Verified</div>\'\n' +
'            + \'<button onclick="document.getElementById(\\\'sa-confirmed-screen\\\').remove();document.getElementById(\\\'sa-video\\\').style.display=\\\'none\\\';document.getElementById(\\\'sa-start-prompt\\\').style.display=\\\'flex\\\';window.saHasCaptured=false;" style="margin-top:8px;padding:10px 24px;background:var(--blue);border:none;border-radius:8px;color:#fff;font-size:12px;font-weight:700;font-family:var(--fh);cursor:pointer;">Next Worker \\u2192</button>\';\n' +
'          container.appendChild(screen);\n' +
'        }\n' +
'      }, 3000);';

c = c.substring(0, oldReset) + newReset + c.substring(oldResetEnd);

fs.writeFileSync(f, c, 'utf8');
console.log('Done. Size:', c.length);
console.log('Fix1 guard:', !c.includes('saProcessAttendance(actionType, confidence) { window.saHasCaptured=false'));
console.log('Fix2 screen:', c.includes('sa-confirmed-screen'));
console.log('Fix2 nextWorker:', c.includes('Next Worker'));
