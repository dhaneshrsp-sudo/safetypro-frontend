$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.hzdid1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# 1. Header: <th ...>#</th> --> HAZARD ID (find the th with "#" rowspan=2)
# The th appears as: min-width:40px;" rowspan="2">#</th>
$oldHdr = ";min-width:40px;`" rowspan=`"2`">#</th>"
$newHdr = ";min-width:70px;`" rowspan=`"2`">HAZARD ID</th>"

if ($h.Contains($oldHdr)) {
  $h = $h.Replace($oldHdr, $newHdr)
  Write-Host "Header updated: # -> HAZARD ID (width 40->70)"
} else {
  Write-Host "Header pattern NOT matched - trying alt"
  # Alt pattern without min-width specified
  $altOld = 'rowspan="2">#</th>'
  $altNew = 'rowspan="2">HAZARD ID</th>'
  if ($h.Contains($altOld)) {
    $h = $h.Replace($altOld, $altNew)
    Write-Host "Header updated (alt path)"
  }
}

# 2. In hiraRender: '(i+1)+' --> '"HZD-" + String(i+1).padStart(3,"0") + '
# The render line looks like: '<td style="padding:6px 8px;color:var(--t2);">'+(i+1)+'</td>'
$oldCell = "'<td style=`"padding:6px 8px;color:var(--t2);`">'+(i+1)+'</td>'"
$newCell = "'<td style=`"padding:6px 8px;color:var(--t2);font-weight:600;white-space:nowrap;min-width:70px;`">HZD-'+String(i+1).padStart(3,'0')+'</td>'"

if ($h.Contains($oldCell)) {
  $h = $h.Replace($oldCell, $newCell)
  Write-Host "Cell format updated: i+1 -> HZD-NNN (padded)"
} else {
  Write-Host "Cell pattern NOT matched - inspect first render line"
}

[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "Saved. Backup: $f.hzdid1.bak"
