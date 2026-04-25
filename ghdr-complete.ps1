$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.ghdrcomplete1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# ===== STEP 1: Remove eia-grouped-header.js script tags (eliminates JS injection duplicate) =====
$pattern = '<script src="eia-grouped-header\.js\?v=\d+"></script>\s*'
$matches = ([regex]::Matches($h, $pattern)).Count
$h = [regex]::Replace($h, $pattern, '')
Write-Host "Removed $matches eia-grouped-header script tag(s)"

# ===== STEP 2: Replace the old group header div (1644px) with new 23-col grid-column:span version =====
# Old anchor: starts with the 510px 124px 280px 494px 106px 100px grid row
$oldStart = $h.IndexOf('<div style="display:grid;grid-template-columns:30px 510px 124px')
if ($oldStart -lt 0) {
    # Try alternate anchor (maybe 1522px or different widths from prior attempt)
    $oldStart = $h.IndexOf('<div style="display:grid;grid-template-columns:30px 430px 120px 276px 460px 106px 100px')
}
if ($oldStart -lt 0) {
    Write-Host "ABORT: No group header anchor found on disk"
    return
}
# Find end - the closing </div> after the 7th inner div (ACTIONS)
$actionsIdx = $h.IndexOf('>ACTIONS</div>', $oldStart)
if ($actionsIdx -lt 0) { Write-Host "ABORT: ACTIONS cell not found"; return }
$closingDivIdx = $h.IndexOf('</div>', $actionsIdx + 14) + 6
$oldLen = $closingDivIdx - $oldStart
Write-Host "Old group header: bytes $oldStart to $closingDivIdx ($oldLen chars)"
if ($oldLen -lt 500 -or $oldLen -gt 3000) { Write-Host "ABORT: sanity check failed on boundary"; return }

# NEW group header - uses IDENTICAL 23-col grid-template-columns as data rows
# grid-column:span N on each group label guarantees perfect alignment
$gridCols = '30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px'

$newHeader = @"
<div id="eia-group-header" style="display:grid;grid-template-columns:$gridCols;background:#0A1222;border-bottom:1px solid var(--border);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;width:max-content;">
            <div style="grid-column:span 1;padding:10px 4px;text-align:center;color:var(--t3);border-right:1px solid var(--border);">ID</div>
            <div style="grid-column:span 4;padding:10px 10px;text-align:center;color:#22C55E;background:rgba(34,197,94,.1);border-right:1px solid var(--border);">ASPECT IDENTIFICATION</div>
            <div style="grid-column:span 4;padding:10px 8px;text-align:center;color:#3B82F6;background:rgba(59,130,246,.1);border-right:1px solid var(--border);" title="Impact Criteria per ISO 14001 Cl.6.1.2">IMPACT CRITERIA</div>
            <div style="grid-column:span 7;padding:10px 8px;text-align:center;color:#EF4444;background:rgba(239,68,68,.1);border-right:1px solid var(--border);">INITIAL SIGNIFICANCE</div>
            <div style="grid-column:span 4;padding:10px 10px;text-align:center;color:#10B981;background:rgba(16,185,129,.1);border-right:1px solid var(--border);">CONTROL MEASURES</div>
            <div style="grid-column:span 2;padding:10px 8px;text-align:center;color:#8B5CF6;background:rgba(139,92,246,.1);border-right:1px solid var(--border);">RESIDUAL</div>
            <div style="grid-column:span 1;padding:10px 8px;text-align:center;color:var(--t3);">ACTIONS</div>
          </div>
"@

$h = $h.Substring(0, $oldStart) + $newHeader + $h.Substring($closingDivIdx)
Write-Host "Group header replaced with 23-col span-based grid"

# ===== STEP 3: Force sub-header row + data rows to use width:max-content so horizontal scroll works =====
# Find the 23-col sub-header (30px 130px 120px 130px...) and ensure it has width:max-content
$subHeaderAnchor = '<div style="display:grid;grid-template-columns:30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px;background:var(--raised)'
if ($h.IndexOf($subHeaderAnchor) -ge 0 -and $h.IndexOf('grid-template-columns:30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px;background:var(--raised);width:max-content') -lt 0) {
    $h = $h.Replace($subHeaderAnchor, $subHeaderAnchor.Replace('background:var(--raised)', 'background:var(--raised);width:max-content'))
    Write-Host "Added width:max-content to sub-header"
}

[System.IO.File]::WriteAllText($f, $h, $utf8)

# Verify
$h2 = [System.IO.File]::ReadAllText($f, $utf8)
Write-Host ""
Write-Host "Verification:"
Write-Host "  eia-grouped-header.js refs: $(([regex]::Matches($h2, 'eia-grouped-header\.js')).Count)"
Write-Host "  Old 510px grid present: $($h2.IndexOf('510px 124px') -ge 0)"
Write-Host "  Old 430px grid present: $($h2.IndexOf('430px 120px 276px') -ge 0)"
Write-Host "  New id eia-group-header: $($h2.IndexOf('id=\"eia-group-header\"') -ge 0)"
Write-Host "  New span 4 labels: $(([regex]::Matches($h2, 'grid-column:span 4')).Count)"
Write-Host "  Backup: $f.ghdrcomplete1.bak"
