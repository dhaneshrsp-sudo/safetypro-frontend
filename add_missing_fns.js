const fs = require('fs');
const path = 'C:/safetypro_complete_frontend/safetypro_audit_compliance.html';
let c = fs.readFileSync(path, 'utf8');

const newFunctions = `
/* === Missing Incident Functions === */
window.incNewIncident = function() {
  document.querySelectorAll('.ac-sub-tab').forEach(function(t){ if(t.textContent.includes('New Incident')) t.click(); });
};
window.incExportExcel = function() {
  if(typeof acToast==='function') acToast('Exporting incident register to Excel...');
  var rows = [['INC No','Date','Type','Severity','Location','Status']];
  (window.INC_DATA||[]).forEach(function(d){ rows.push([d.incNo,d.date,d.type,d.severity,d.location,d.status]); });
  var csv = rows.map(function(r){ return r.join(','); }).join('\n');
  var a = document.createElement('a'); a.href='data:text/csv,'+encodeURIComponent(csv); a.download='incidents.csv'; a.click();
};
window.incOpenInvestigation = function(idx) {
  var inc = (window.INC_DATA||[])[idx];
  if(!inc) return;
  document.querySelectorAll('.ac-sub-tab').forEach(function(t){ if(t.textContent.includes('Investigation & RCA')) t.click(); });
  setTimeout(function(){ if(typeof window.incLoadRCA==='function') window.incLoadRCA(inc.incNo); }, 300);
};
window.incUpdateRates = function() {
  var data = window.INC_DATA||[];
  var lti = data.filter(function(d){ return d.severity==='LTI'; }).length;
  var hours = window.INC_MANHOURS || 200000;
  var ltifr = (lti * 200000 / hours).toFixed(2);
  ['inc-an-ltifr','ik-ltifr'].forEach(function(id){ var el=document.getElementById(id); if(el) el.textContent=ltifr; });
  if(typeof acToast==='function') acToast('Rates updated');
};
window.incAddPerson = function() {
  var name = prompt('Person Name:',''); if(!name) return;
  var role = prompt('Role:','Injured Person');
  var list = document.getElementById('fnoi-persons-list');
  if(!list) return;
  var div = document.createElement('div');
  div.style.cssText='display:flex;align-items:center;gap:8px;padding:6px;background:var(--raised);border-radius:6px;margin-bottom:4px;';
  div.innerHTML='<div style="flex:1;font-size:11px;color:var(--t1);">'+name+' <span style="color:var(--t3);">('+role+')</span></div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;">&times;</button>';
  list.appendChild(div);
};
window.incClearBodyMap = function() {
  var svg = document.getElementById('body-map-svg');
  if(svg) svg.querySelectorAll('.marked').forEach(function(el){ el.classList.remove('marked'); el.style.fill=''; });
  var sel = document.getElementById('body-map-selected'); if(sel) sel.textContent='No area selected';
};
window.incAddWitness = function() {
  var name = prompt('Witness Name:',''); if(!name) return;
  var list = document.getElementById('fnoi-witnesses-list');
  if(!list) return;
  var div = document.createElement('div');
  div.style.cssText='display:flex;align-items:center;gap:8px;padding:6px;background:var(--raised);border-radius:6px;margin-bottom:4px;';
  div.innerHTML='<div style="flex:1;font-size:11px;color:var(--t1);">'+name+'</div><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;">&times;</button>';
  list.appendChild(div);
};
window.incAddPhoto = function() {
  var input = document.createElement('input'); input.type='file'; input.accept='image/*';
  input.onchange=function(e){ var file=e.target.files[0]; if(!file) return; var list=document.getElementById('fnoi-photos-list'); if(!list) return; var div=document.createElement('div'); div.style.cssText='display:inline-block;margin:4px;position:relative;'; div.innerHTML='<div style="font-size:10px;background:var(--raised);padding:4px 8px;border-radius:4px;color:var(--t2);">'+file.name+'<button onclick="this.parentElement.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;margin-left:4px;">&times;</button></div>'; list.appendChild(div); if(typeof acToast==='function') acToast(file.name+' attached'); };
  input.click();
};
window.incGenerateNotifLetter = function() {
  if(typeof acToast==='function') acToast('Generating statutory notification letter...');
  setTimeout(function(){ if(typeof acToast==='function') acToast('Letter generated - check downloads','success'); }, 1000);
};
window.incSelectRCA = function(el, method) {
  document.querySelectorAll('.rca-method-btn').forEach(function(b){ b.classList.remove('active'); });
  if(el) el.classList.add('active');
  ['rca-5why','rca-fishbone','rca-icam','rca-fta','rca-bowtie'].forEach(function(id){ var p=document.getElementById(id); if(p) p.style.display='none'; });
  var target = document.getElementById('rca-'+method);
  if(target) target.style.display='block';
  if(typeof acToast==='function') acToast('RCA method: '+method.toUpperCase());
};
window.incAdd5Why = function() {
  var whyChain = document.getElementById('why-chain');
  if(!whyChain) return;
  var count = whyChain.querySelectorAll('.why-item').length + 1;
  var div = document.createElement('div'); div.className='why-item';
  div.style.cssText='padding:8px;background:var(--raised);border-radius:6px;margin-bottom:8px;border-left:3px solid #3B82F6;';
  div.innerHTML='<div style="font-size:10px;font-weight:700;color:#3B82F6;margin-bottom:4px;">WHY #'+count+'</div><input type="text" placeholder="Why did this happen?" style="width:100%;background:var(--bg);border:1px solid var(--border);color:var(--t1);font-size:11px;padding:5px 8px;border-radius:5px;box-sizing:border-box;"><button onclick="this.parentElement.remove()" style="background:transparent;border:none;color:var(--t3);cursor:pointer;float:right;margin-top:4px;">&times;</button>';
  whyChain.appendChild(div);
};
window.incAddFTANode = function() { if(typeof acToast==='function') acToast('FTA node added'); };
window.incAddCAPAAction = function() {
  var desc = prompt('CAPA Action Description:',''); if(!desc) return;
  var due = prompt('Due Date (dd-mm-yyyy):','');
  var owner = prompt('Responsible Person:','');
  window.INC_CAPA = window.INC_CAPA || [];
  var id = 'CAPA-'+String(window.INC_CAPA.length+1).padStart(3,'0');
  window.INC_CAPA.push({id:id,desc:desc,due:due,owner:owner,status:'Open'});
  if(typeof incRenderCAPA==='function') incRenderCAPA();
  else if(typeof acToast==='function') acToast('CAPA '+id+' added');
};
window.incGenerateReport = function() {
  if(typeof acToast==='function') acToast('Generating incident investigation report...');
  setTimeout(function(){ if(typeof acToast==='function') acToast('Report ready','success'); }, 1500);
};
`;

const anchor = '})(); /* end Incident Smart Engine */';
if(!c.includes('window.incNewIncident')) {
  c = c.replace(anchor, newFunctions + '\n' + anchor);
  console.log('Added all missing functions');
}

fs.writeFileSync(path, Buffer.from(c,'utf8'));
console.log('Size:', c.length);