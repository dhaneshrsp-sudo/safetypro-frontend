$ErrorActionPreference = 'Stop'
try {
  $root = 'C:\safetypro_complete_frontend'
  $utf8 = [System.Text.UTF8Encoding]::new($false)

  # ----- STEP 1: Append unified fix block to sp-shell.css -----
  Write-Host '== STEP 1: sp-shell.css append V82 block ==' -ForegroundColor Cyan
  $cssPath = Join-Path $root 'sp-shell.css'
  $css = [System.IO.File]::ReadAllText($cssPath)
  if ($css.Contains('V82 UNIFIED SCROLL + DRAG FIX')) {
    Write-Host '  Already patched - skipping append'
  } else {
    $block = @'

/* === V82 UNIFIED SCROLL + DRAG FIX === */
/* Row 4 flex-overflow fix: filters pack left, actions pushed right with margin-auto. */
/* Prevents content from escaping to the UNREACHABLE left side of a flex-end container. */
.sp-row4 { justify-content: flex-start !important; }
.sp-row4-actions { margin-left: auto !important; flex-shrink: 0 !important; }
/* Horizontal padding on SCROLL_AREA so content does not touch sidebar line. */
body[data-page="audit"] #__SP_SCROLL_AREA__,
body[data-page="risk"] #__SP_SCROLL_AREA__ {
  padding-left: 16px !important;
  padding-right: 16px !important;
}
/* Drag-scroll visual cues (JS adds .is-dragging) */
.sp-scope-filters,
.sp-row4 {
  cursor: grab;
  -webkit-user-select: none;
  user-select: none;
}
.sp-scope-filters.is-dragging,
.sp-row4.is-dragging { cursor: grabbing; }
/* === END V82 === */
'@
    [System.IO.File]::WriteAllText($cssPath + '.v81.bak', $css, $utf8)
    [System.IO.File]::WriteAllText($cssPath, $css + $block, $utf8)
    Write-Host '  sp-shell.css patched (backup: sp-shell.css.v81.bak)' -ForegroundColor Green
  }

  # ----- STEP 2: Create sp-drag-scroll.js (shared unified helper) -----
  Write-Host '== STEP 2: Create sp-drag-scroll.js ==' -ForegroundColor Cyan
  $jsPath = Join-Path $root 'sp-drag-scroll.js'
  $js = @'
(function(){
  'use strict';
  function attach(el){
    if(!el || el.__sp_drag_attached__) return;
    el.__sp_drag_attached__ = true;
    var isDown=false, startX=0, startScroll=0, moved=0;
    el.addEventListener('mousedown', function(e){
      if(e.target.closest('select,input,textarea,button,a,[role="button"]')) return;
      isDown=true; startX=e.pageX; startScroll=el.scrollLeft; moved=0;
      el.classList.add('is-dragging');
    });
    document.addEventListener('mouseup', function(){
      if(!isDown) return;
      isDown=false;
      el.classList.remove('is-dragging');
    });
    document.addEventListener('mousemove', function(e){
      if(!isDown) return;
      var dx = e.pageX - startX;
      moved = Math.abs(dx);
      if(moved > 2) el.scrollLeft = startScroll - dx;
    });
    el.addEventListener('click', function(e){
      if(moved > 5){ e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);
    el.addEventListener('wheel', function(e){
      if(Math.abs(e.deltaY) > Math.abs(e.deltaX)){
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    }, {passive:false});
  }
  function initAll(){
    document.querySelectorAll('.sp-scope-filters, .sp-row4, [data-drag-scroll]').forEach(attach);
  }
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', initAll);
  } else { initAll(); }
  window.spInitDragScroll = initAll;
})();
'@
  [System.IO.File]::WriteAllText($jsPath, $js, $utf8)
  Write-Host "  Created: sp-drag-scroll.js ($($js.Length) bytes)" -ForegroundColor Green

  # ----- STEP 3: Patch audit HTML (script tag + css version bump) -----
  Write-Host '== STEP 3: Patch audit HTML ==' -ForegroundColor Cyan
  $htmlPath = Join-Path $root 'safetypro_audit_compliance.html'
  $html = [System.IO.File]::ReadAllText($htmlPath)
  [System.IO.File]::WriteAllText($htmlPath + '.v81.bak', $html, $utf8)

  if ($html.Contains('sp-shell.css?v=81')) {
    $html = $html.Replace('sp-shell.css?v=81', 'sp-shell.css?v=82')
    Write-Host '  Bumped sp-shell.css v81 -> v82'
  } else {
    Write-Host '  WARNING: sp-shell.css?v=81 not found in HTML'
  }

  if ($html.Contains('sp-drag-scroll.js')) {
    Write-Host '  drag-scroll script already present - skipping'
  } else {
    $scriptTag = "  <script src=`"sp-drag-scroll.js?v=1`"></script>`r`n"
    $bodyEnd = $html.LastIndexOf('</body>')
    if ($bodyEnd -lt 0) { throw '</body> not found' }
    $html = $html.Substring(0, $bodyEnd) + $scriptTag + $html.Substring($bodyEnd)
    Write-Host '  Added <script src="sp-drag-scroll.js?v=1"> before </body>'
  }
  [System.IO.File]::WriteAllText($htmlPath, $html, $utf8)
  Write-Host '  audit HTML patched (backup: safetypro_audit_compliance.html.v81.bak)' -ForegroundColor Green

  Write-Host ''
  Write-Host 'Next: run .\deploy.ps1' -ForegroundColor Yellow
}
catch {
  Write-Host ''
  Write-Host "ERROR: $_" -ForegroundColor Red
  Write-Host "At line: $($_.InvocationInfo.ScriptLineNumber)" -ForegroundColor Red
}
Read-Host 'Press Enter to close'
