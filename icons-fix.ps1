$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.actionicons1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Find any instance of the pencil-only last cell pattern
# Simpler pattern without complex onclick injection
$needle = '<td style=\"padding:6px 8px;text-align:center;color:var(--t3);cursor:pointer;\">&#9998;</td>'

$count = ([regex]::Matches($h, [regex]::Escape($needle))).Count
Write-Host "Found single-pencil pattern: $count times"

if ($count -gt 0) {
    # Replace with 3-icon version - no inline alerts, just icons with titles
    $replacement = '<td style=\"padding:6px 8px;text-align:center;white-space:nowrap;\"><span title=\"View details\" style=\"margin:0 4px;cursor:pointer;color:#3B82F6;font-size:14px;\">&#128065;</span><span title=\"Edit hazard\" style=\"margin:0 4px;cursor:pointer;color:#22C55E;font-size:14px;\">&#9998;</span><span title=\"Attach photo\" style=\"margin:0 4px;cursor:pointer;color:#F59E0B;font-size:14px;\">&#128206;</span></td>'
    
    $h = $h.Replace($needle, $replacement)
    [System.IO.File]::WriteAllText($f, $h, $utf8)
    Write-Host "Replaced with 3-icon set"
} else {
    # Try finding what pattern actually exists
    Write-Host "Pattern not found. Searching for alternate..."
    $idx = $h.IndexOf('>&#9998;</td>')
    if ($idx -ge 0) {
        $start = [Math]::Max(0, $idx - 100)
        Write-Host "Context around pencil emoji:"
        Write-Host $h.Substring($start, 120)
    }
}
