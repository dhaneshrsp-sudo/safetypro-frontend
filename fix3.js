var fs = require('fs');
var f = 'C:/safetypro_complete_frontend/safetypro_field.html';
var c = fs.readFileSync(f, 'utf8');

// FIX 1: Replace unreliable saStream polling with video 'play' event
var oldTrigger = 'var _oSC=saStartCamera;window.saStartCamera=function(){_oSC.call(this);var chk=setInterval(function(){if(saStream){clearInterval(chk);setTimeout(saStartAutoCapture,800);}},300);};';
var newTrigger = 'var _oSC=saStartCamera;window.saStartCamera=function(){_oSC.call(this);var vid=document.getElementById("sa-video");if(vid){vid.addEventListener("play",function onPlay(){vid.removeEventListener("play",onPlay);console.log("[PhaseA] Video playing - starting auto-detect");setTimeout(saStartAutoCapture,500);},{once:true});}};';

if(c.includes(oldTrigger)) {
  c = c.replace(oldTrigger, newTrigger);
  console.log('Trigger: replaced with video play event');
} else {
  console.log('Trigger pattern not found - trying indexOf');
  var idx = c.indexOf('var _oSC=saStartCamera');
  var end = c.indexOf('};', idx) + 2;
  console.log('Found at:', idx, 'to', end);
  console.log('Old:', c.substring(idx, end));
  c = c.substring(0, idx) + newTrigger + c.substring(end);
}

// FIX 2: Make brightness detection more robust
var oldDetect = 'faceFound=avg>20&&avg<240;';
var newDetect = 'faceFound=avg>15&&avg<245;console.log("[PhaseA] brightness="+Math.round(avg)+" face="+faceFound);';
c = c.replace(oldDetect, newDetect);

// FIX 3: Relax video readyState check
c = c.replace('if(!video||video.readyState<2||!saStream)return;', 
               'if(!video||video.readyState<1)return;');

fs.writeFileSync(f, c, 'utf8');
console.log('Done. Size:', c.length);
console.log('PlayEvent:', c.includes('addEventListener("play"'));
console.log('BrightnessLog:', c.includes('brightness='));
console.log('ReadyStateFixed:', c.includes('readyState<1'));
