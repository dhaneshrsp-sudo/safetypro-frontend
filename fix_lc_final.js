const fs = require('fs');
let h = fs.readFileSync('safetypro_reports.html','utf8');

// Count existing lcRender functions
const count = (h.match(/function lcRender\(\)/g)||[]).length;
console.log('lcRender functions found:', count);

// Remove the OLD lcRender (first occurrence) — keep only the last one
if(count >= 1) {
  // Find first function lcRender() and remove it entirely
  const idx = h.indexOf('function lcRender()');
  // Find its end by brace counting
  let depth=0, i=idx, inFn=false, fnEnd=-1;
  while(i < h.length) {
    if(h[i]==='{'){depth++;inFn=true;}
    if(h[i]==='}'){depth--;if(inFn&&depth===0){fnEnd=i+1;break;}}
    i++;
  }
  if(fnEnd>0){
    h = h.substring(0,idx) + h.substring(fnEnd);
    console.log('Old lcRender removed');
  }
}

// Now inject the NEW smart lcRender with 90-day filter
const SCENARIO_FN = `function lcRender() {
  var rowsEl=document.getElementById('lc-rows');
  var summaryEl=document.getElementById('lc-summary');
  var sourceEl=document.getElementById('lc-source-badge');
  if(!rowsEl) return;
  var rorData=lcGetRorData();
  var regionFilter=(document.getElementById('lc-region-filter')||{}).value||'ALL';
  var statusFilter=(document.getElementById('lc-status-filter')||{}).value||'ALL';

  if(!rorData||!rorData.entries||!rorData.entries.length){
    if(summaryEl)summaryEl.innerHTML='';
    rowsEl.innerHTML='<div style="padding:40px 24px;text-align:center;"><div style="font-size:36px;margin-bottom:12px;">&#128197;</div><div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:6px;">No compliance register found</div><div style="font-size:12px;color:var(--t3);line-height:1.7;max-width:380px;margin:0 auto 16px;">Set up your Register of Regulations first. Choose your country and state, then this calendar will automatically track all upcoming renewal deadlines.</div><a href="/safetypro_audit_compliance.html" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:7px;color:var(--green);font-size:12px;font-weight:600;text-decoration:none;font-family:var(--fh);">Go to Legal &amp; Regulatory &#8594; Set Renewal Dates</a></div>';
    if(sourceEl)sourceEl.textContent='No ROR data — set up register first';
    return;
  }

  var entriesWithDates=rorData.entries.filter(function(e){return e.validity&&e.validity!=='';});
  if(!entriesWithDates.length){
    if(summaryEl)summaryEl.innerHTML='';
    rowsEl.innerHTML='<div style="padding:40px 24px;text-align:center;"><div style="font-size:36px;margin-bottom:12px;">&#128197;</div><div style="font-size:14px;font-weight:700;color:var(--t1);margin-bottom:6px;">'+rorData.entries.length+' acts loaded — no renewal dates set yet</div><div style="font-size:12px;color:var(--t3);line-height:1.7;max-width:420px;margin:0 auto 16px;">Your register has <strong style="color:var(--t2);">'+rorData.entries.length+' acts</strong> but none have validity dates entered. Click Edit on each act to add the expiry date — this calendar will then show only upcoming deadlines.</div><a href="/safetypro_audit_compliance.html" style="display:inline-flex;align-items:center;gap:6px;padding:8px 16px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:7px;color:var(--green);font-size:12px;font-weight:600;text-decoration:none;font-family:var(--fh);">Visit Legal &amp; Regulatory &#8594; Add Validity Dates</a></div>';
    if(sourceEl)sourceEl.textContent=rorData.entries.length+' acts in ROR · 0 have validity dates · action required';
    return;
  }

  var today=new Date();today.setHours(0,0,0,0);
  var ninetyDays=new Date(today);ninetyDays.setDate(ninetyDays.getDate()+90);
  var actionable=entriesWithDates.filter(function(e){
    if(e.status==='NA')return false;
    return new Date(e.validity)<=ninetyDays;
  });

  var filtered=actionable.filter(function(e){
    if(regionFilter!=='ALL'&&e.country!==regionFilter)return false;
    var badge=lcStatusBadge(e.status,e.validity);
    if(statusFilter!=='ALL'&&badge.key!==statusFilter)return false;
    return true;
  });

  var order={OVERDUE:0,DUE_SOON:1,PENDING:2,COMPLIED:3};
  filtered.sort(function(a,b){
    var ba=lcStatusBadge(a.status,a.validity),bb=lcStatusBadge(b.status,b.validity);
    var od=(order[ba.key]||2)-(order[bb.key]||2);
    return od!==0?od:new Date(a.validity)-new Date(b.validity);
  });

  var counts={OVERDUE:0,DUE_SOON:0,PENDING:0,COMPLIED:0};
  actionable.forEach(function(e){var b=lcStatusBadge(e.status,e.validity);if(counts[b.key]!==undefined)counts[b.key]++;});

  var hidden=rorData.entries.length-entriesWithDates.length;
  var futureHidden=entriesWithDates.filter(function(e){return new Date(e.validity)>ninetyDays&&e.status!=='NA';}).length;

  if(summaryEl)summaryEl.innerHTML=
    '<div class="card" style="padding:10px 12px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#EF4444;">'+counts.OVERDUE+'</div><div style="font-size:10px;color:var(--t3);">Overdue</div></div>'+
    '<div class="card" style="padding:10px 12px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#F59E0B;">'+counts.DUE_SOON+'</div><div style="font-size:10px;color:var(--t3);">Due within 30 days</div></div>'+
    '<div class="card" style="padding:10px 12px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#3B82F6;">'+counts.PENDING+'</div><div style="font-size:10px;color:var(--t3);">Due in 31-90 days</div></div>'+
    '<div class="card" style="padding:10px 12px;text-align:center;"><div style="font-size:18px;font-weight:800;color:#22C55E;">'+counts.COMPLIED+'</div><div style="font-size:10px;color:var(--t3);">Complied</div></div>';

  if(sourceEl)sourceEl.textContent='Showing '+actionable.length+' acts due in 90 days · '+(hidden+futureHidden)+' hidden';

  if(!filtered.length){rowsEl.innerHTML='<div style="padding:24px;text-align:center;color:var(--t3);font-size:12px;">No entries match the selected filter</div>';return;}

  rowsEl.innerHTML=filtered.map(function(e){
    var badge=lcStatusBadge(e.status,e.validity);
    var rowBg=badge.key==='OVERDUE'?'background:rgba(239,68,68,.04);border:1px solid rgba(239,68,68,.12);':badge.key==='DUE_SOON'?'background:rgba(245,158,11,.04);border:1px solid rgba(245,158,11,.12);':'background:var(--raised);border:1px solid var(--border);';
    var daysLeft=lcDaysUntil(e.validity);
    var dateLabel=e.validity?new Date(e.validity).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'}):'—';
    var daysLabel=daysLeft!==null?(daysLeft<0?Math.abs(daysLeft)+' days ago':'in '+daysLeft+' days'):'';
    return '<div style="display:grid;grid-template-columns:110px 1fr 110px 100px 100px;gap:12px;padding:10px 14px;border-radius:7px;align-items:center;'+rowBg+'">'+
      '<div><div style="font-size:11px;font-weight:700;color:'+(badge.key==='OVERDUE'?'#EF4444':badge.key==='DUE_SOON'?'#F59E0B':'var(--t2)')+';">'+dateLabel+'</div><div style="font-size:9px;color:var(--t3);margin-top:1px;">'+daysLabel+'</div></div>'+
      '<div><div style="font-size:11px;font-weight:600;color:var(--t1);line-height:1.4;">'+e.act+'</div><div style="font-size:10px;color:var(--t3);margin-top:1px;">'+lcGetCountryLabel(e.country)+(e.state&&e.state!=='ALL'?' · '+e.state:'')+(e.freq?' · '+e.freq:'')+(e.consent?' · '+e.consent:'')+'</div></div>'+
      '<div style="font-size:11px;color:var(--t2);">'+(e.auth||'—')+'</div>'+
      '<div style="font-size:11px;color:var(--t2);">'+(e.responsible||'—')+'</div>'+
      '<div><span style="background:'+badge.bg+';border:1px solid '+badge.border+';border-radius:4px;padding:2px 8px;font-size:9px;font-weight:700;color:'+badge.color+';">'+badge.label+'</span></div>'+
    '</div>';
  }).join('');
}

`;

// Insert before lcGetCountryLabel
const ANCHOR = 'function lcGetCountryLabel';
if(h.includes(ANCHOR)){
  h = h.replace(ANCHOR, SCENARIO_FN + ANCHOR);
  console.log('New lcRender injected');
}

fs.writeFileSync('safetypro_reports.html',h);
const finalCount = (h.match(/function lcRender\(\)/g)||[]).length;
console.log('Final lcRender count:',finalCount);
console.log('Has 90-day filter:',h.includes('ninetyDays'));
console.log('Has Scenario prompt:',h.includes('no renewal dates set yet'));
console.log('Size:',Math.round(h.length/1024)+'KB');
