$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.eiahdr1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Locate aspect-register table and find the header grid div (flat 23-col one)
$aspectReg = $h.IndexOf('id="aspect-register"')
if ($aspectReg -lt 0) { Write-Host "ABORT: aspect-register NF"; return }

# Anchor - the opening of the current flat header div
$oldHeaderStart = $h.IndexOf('<div style="display:grid;grid-template-columns:30px 130px', $aspectReg)
if ($oldHeaderStart -lt 0) { Write-Host "ABORT: EIA header anchor NF (layout changed?)"; return }

# Find the closing of the last header cell before <div id="eaia-tbody">
$tbodyOpen = $h.IndexOf('<div id="eaia-tbody"', $oldHeaderStart)
if ($tbodyOpen -lt 0) { Write-Host "ABORT: eaia-tbody not found after header"; return }

# The header div ends right before tbody opens. Walk back from tbody to find previous </div>
$headerClose = $h.LastIndexOf('</div>', $tbodyOpen) + 6
if ($headerClose -lt $oldHeaderStart) { Write-Host "ABORT: bad boundary calc"; return }

$oldLen = $headerClose - $oldHeaderStart
Write-Host "Existing flat header: $oldHeaderStart to $headerClose ($oldLen chars)"
if ($oldLen -lt 500 -or $oldLen -gt 5000) { Write-Host "ABORT: boundary sanity fail"; return }

# Build new 2-row grouped header matching HIRA aesthetic
$newHeader = @"
<!-- Grouped header Row 1 (group labels with colspans) -->
          <div style="display:grid;grid-template-columns:30px 510px 124px 280px 494px 106px 100px;background:#1B2A4A;border-bottom:0.5px solid var(--border);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.3px;">
            <div style="padding:6px 4px;text-align:center;color:var(--t3);border-right:0.5px solid var(--border);">ID</div>
            <div style="padding:6px 10px;text-align:center;color:#22C55E;border-right:0.5px solid var(--border);background:rgba(34,197,94,.08);">ASPECT IDENTIFICATION</div>
            <div style="padding:6px 8px;text-align:center;color:#3B82F6;border-right:0.5px solid var(--border);background:rgba(59,130,246,.08);" title="Impact Criteria per ISO 14001 Cl.6.1.2">IMPACT CRITERIA</div>
            <div style="padding:6px 8px;text-align:center;color:#EF4444;border-right:0.5px solid var(--border);background:rgba(239,68,68,.08);">INITIAL SIGNIFICANCE</div>
            <div style="padding:6px 10px;text-align:center;color:#10B981;border-right:0.5px solid var(--border);background:rgba(16,185,129,.08);">CONTROL MEASURES</div>
            <div style="padding:6px 8px;text-align:center;color:#8B5CF6;border-right:0.5px solid var(--border);background:rgba(139,92,246,.08);">RESIDUAL</div>
            <div style="padding:6px 8px;text-align:center;color:var(--t3);">ACTIONS</div>
          </div>
          <!-- Row 2 - individual column labels (23 cols matching data) -->
          <div style="display:grid;grid-template-columns:30px 130px 120px 130px 50px 30px 30px 30px 30px 34px 34px 34px 34px 34px 56px 50px 130px 80px 130px 120px 56px 50px 100px;background:var(--raised);border-bottom:0.5px solid var(--border);font-size:8px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.3px;">
            <div style="padding:6px 4px;border-right:0.5px solid var(--border);">#</div>
            <div style="padding:6px 6px;border-right:0.5px solid var(--border);">Activity</div>
            <div style="padding:6px 6px;border-right:0.5px solid var(--border);">Aspect</div>
            <div style="padding:6px 6px;border-right:0.5px solid var(--border);">Impact</div>
            <div style="padding:6px 4px;border-right:0.5px solid var(--border);text-align:center;">Cond.</div>
            <div style="padding:6px 2px;border-right:0.5px solid var(--border);text-align:center;" title="Legal Compliance">LC</div>
            <div style="padding:6px 2px;border-right:0.5px solid var(--border);text-align:center;" title="Interested Party Concern">IPC</div>
            <div style="padding:6px 2px;border-right:0.5px solid var(--border);text-align:center;" title="Binding Commitment">BC</div>
            <div style="padding:6px 2px;border-right:0.5px solid var(--border);text-align:center;" title="Regulatory Compliance Potential">RCP</div>
            <div style="padding:6px 2px;border-right:0.5px solid var(--border);text-align:center;" title="Scale">Sc</div>
            <div style="padding:6px 2px;border-right:0.5px solid var(--border);text-align:center;" title="Severity">Sv</div>
            <div style="padding:6px 2px;border-right:0.5px solid var(--border);text-align:center;" title="Probability">Pr</div>
            <div style="padding:6px 2px;border-right:0.5px solid var(--border);text-align:center;" title="Duration">Du</div>
            <div style="padding:6px 2px;border-right:0.5px solid var(--border);text-align:center;" title="Detection">De</div>
            <div style="padding:6px 4px;border-right:0.5px solid var(--border);text-align:center;">Score</div>
            <div style="padding:6px 4px;border-right:0.5px solid var(--border);text-align:center;">S/NS</div>
            <div style="padding:6px 6px;border-right:0.5px solid var(--border);">Existing Control</div>
            <div style="padding:6px 6px;border-right:0.5px solid var(--border);">Gap (if any)</div>
            <div style="padding:6px 6px;border-right:0.5px solid var(--border);">Control Measure</div>
            <div style="padding:6px 6px;border-right:0.5px solid var(--border);">Competent Authority</div>
            <div style="padding:6px 4px;border-right:0.5px solid var(--border);text-align:center;">Residual</div>
            <div style="padding:6px 4px;border-right:0.5px solid var(--border);text-align:center;">R-S/NS</div>
            <div style="padding:6px 6px;text-align:center;">&nbsp;</div>
          </div>
"@

$h = $h.Substring(0, $oldHeaderStart) + $newHeader + $h.Substring($headerClose)
[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "EIA header replaced with 2-row grouped layout"
Write-Host "Backup: $f.eiahdr1.bak"
