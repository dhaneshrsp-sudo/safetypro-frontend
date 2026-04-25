$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.rowlines1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# In hiraRender, every TD without border-right should get one
# Pattern 1: <td style="padding:6px 8px;color:var(--t1);"> (no border-right)
# Pattern 2: <td style="padding:6px 8px;text-align:center;color:var(--t1);font-weight:600;"> etc.
# Simpler approach: find TDs inside hiraRender that DON'T already have border-right, add it

# Use regex to match <td style="padding:6px 8px;...(no border-right)...;"> and append border-right
$pattern = "(<td style=`"padding:6px 8px;[^`"]*?)(`">)"
$replacement = '$1;border-right:1px solid var(--border);$2'

$before = ([regex]::Matches($h, $pattern)).Count
Write-Host "Found $before TD tags in HIRA"

# Only update TDs that don't ALREADY have border-right
$h = [regex]::Replace($h, $pattern, {
  param($m)
  $styles = $m.Groups[1].Value
  if ($styles -like "*border-right*") {
    return $m.Value  # already has border-right, leave alone
  }
  return $m.Groups[1].Value + ";border-right:1px solid var(--border);" + $m.Groups[2].Value
})

[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "Applied border-right to TDs without one"
Write-Host "Backup: $f.rowlines1.bak"
