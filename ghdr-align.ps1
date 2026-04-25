$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.ghdralign1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Old group row - hardcoded widths that dont match data row
$oldStart = $h.IndexOf('<div style="display:grid;grid-template-columns:30px 510px 124px')
if ($oldStart -lt 0) { Write-Host "ABORT: old group row anchor not found"; return }
$oldEnd = $h.IndexOf('</div>', $h.IndexOf('ACTIONS</div>', $oldStart)) + 6
$oldLen = $oldEnd - $oldStart
Write-Host "Old group row: $oldStart to $oldEnd ($oldLen chars)"

# NEW group row - uses SAME 23-col grid as data rows, uses grid-column:span N for each group
# This guarantees perfect alignment
$newHeader = @"
<div style="display:grid;grid-template-columns:30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px;background:#0A1222;border-bottom:1px solid var(--border);font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">
            <div style="grid-column:span 1;padding:10px 4px;text-align:center;color:var(--t3);border-right:1px solid var(--border);">ID</div>
            <div style="grid-column:span 4;padding:10px 10px;text-align:center;color:#22C55E;background:rgba(34,197,94,.1);border-right:1px solid var(--border);">ASPECT IDENTIFICATION</div>
            <div style="grid-column:span 4;padding:10px 8px;text-align:center;color:#3B82F6;background:rgba(59,130,246,.1);border-right:1px solid var(--border);" title="Impact Criteria per ISO 14001 Cl.6.1.2">IMPACT CRITERIA</div>
            <div style="grid-column:span 7;padding:10px 8px;text-align:center;color:#EF4444;background:rgba(239,68,68,.1);border-right:1px solid var(--border);">INITIAL SIGNIFICANCE</div>
            <div style="grid-column:span 4;padding:10px 10px;text-align:center;color:#10B981;background:rgba(16,185,129,.1);border-right:1px solid var(--border);">CONTROL MEASURES</div>
            <div style="grid-column:span 2;padding:10px 8px;text-align:center;color:#8B5CF6;background:rgba(139,92,246,.1);border-right:1px solid var(--border);">RESIDUAL</div>
            <div style="grid-column:span 1;padding:10px 8px;text-align:center;color:var(--t3);">ACTIONS</div>
          </div>
"@

$h = $h.Substring(0, $oldStart) + $newHeader + $h.Substring($oldEnd)
[System.IO.File]::WriteAllText($f, $h, $utf8)

Write-Host "Group row replaced with 23-col grid using grid-column:span"
Write-Host "Verify:"
$h2 = [System.IO.File]::ReadAllText($f, $utf8)
Write-Host "  old 510px present (should be False): $($h2.IndexOf('510px 124px') -ge 0)"
Write-Host "  new 23-col grid present (should be True): $($h2.IndexOf('grid-column:span 4;padding:10px 10px;text-align:center;color:#22C55E') -ge 0)"
Write-Host "  Backup: $f.ghdralign1.bak"
