$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"

Copy-Item $f "$f.finalfix1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# ===== Fix 1: Header "#" -> "HAZARD ID", widen to 70px =====
$old1 = 'min-width:40px;" rowspan="2">#</th>'
$new1 = 'min-width:70px;" rowspan="2">HAZARD ID</th>'
if ($h.Contains($old1)) {
    $h = $h.Replace($old1, $new1)
    Write-Host "[OK] Header: # -> HAZARD ID (width 40->70)"
} else {
    Write-Host "[SKIP] Header pattern not matched"
}

# ===== Fix 2: Last header (blank) -> "ACTIONS" =====
# Look for: rowspan="2"></th>   (the blank one at the end)
$old2 = '<th style="border-bottom:1px solid var(--border);" rowspan="2"></th>'
$new2 = '<th style="padding:5px 10px;text-align:center;font-size:8px;font-weight:700;color:var(--t3);text-transform:uppercase;border-bottom:1px solid var(--border);min-width:90px;" rowspan="2">ACTIONS</th>'
if ($h.Contains($old2)) {
    $h = $h.Replace($old2, $new2)
    Write-Host "[OK] Last header: blank -> ACTIONS"
} else {
    Write-Host "[SKIP] Last header pattern not matched"
}

# ===== Fix 3: hiraRender - change (i+1) to "HZD-" + zero-padded =====
$old3 = "'<td style=`"padding:6px 8px;color:var(--t2);`">'+(i+1)+'</td>'"
$new3 = "'<td style=`"padding:6px 8px;color:var(--t2);font-weight:600;white-space:nowrap;`">HZD-'+String(i+1).padStart(3,'0')+'</td>'"
if ($h.Contains($old3)) {
    $h = $h.Replace($old3, $new3)
    Write-Host "[OK] Cell: 1,2,3 -> HZD-001, HZD-002..."
} else {
    Write-Host "[SKIP] Cell pattern not matched"
}

# ===== Fix 4: hiraRender - last cell (single pencil) -> 3 icons =====
$old4 = "'<td style=`"padding:6px 8px;text-align:center;color:var(--t3);cursor:pointer;`">&#9998;</td>'"
$new4 = "'<td style=`"padding:6px 8px;text-align:center;white-space:nowrap;`"><span title=`"View details`" onclick=`"alert(`'Row `'+(i+1)+`' view - coming soon`')`" style=`"margin:0 4px;cursor:pointer;color:#3B82F6;font-size:14px;`">&#128065;</span><span title=`"Edit hazard`" onclick=`"alert(`'Row `'+(i+1)+`' edit - coming soon`')`" style=`"margin:0 4px;cursor:pointer;color:var(--green);font-size:14px;`">&#9998;</span><span title=`"Attach photo`" onclick=`"alert(`'Row `'+(i+1)+`' photo upload - coming soon`')`" style=`"margin:0 4px;cursor:pointer;color:#F59E0B;font-size:14px;`">&#128206;</span></td>'"
if ($h.Contains($old4)) {
    $h = $h.Replace($old4, $new4)
    Write-Host "[OK] Last cell: pencil -> 3 icons (View/Edit/Photo)"
} else {
    Write-Host "[SKIP] Last cell pattern not matched"
}

[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host ""
Write-Host "Saved. Backup: $f.finalfix1.bak"
