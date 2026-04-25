# OpsLix — HSE Trend Chart color migration + tooltip + axes
# Targets only chart config strings (which use 'borderColor:' etc. unique syntax)
# Does NOT touch CSS variables or sidebar/topnav usage of same hex values.

cd C:\safetypro_complete_frontend

$path = "C:\safetypro_complete_frontend\safetypro_v2.html"
Copy-Item $path "$path.prechart.bak" -Force

$content = [System.IO.File]::ReadAllText($path)
$before = $content.Length

# ─── INCIDENTS LINE: red #EF4444 → OpsLix coral #C84F3E ───
$content = $content.Replace("borderColor:'#EF4444'",          "borderColor:'#C84F3E'")
$content = $content.Replace("pointBackgroundColor:'#EF4444'", "pointBackgroundColor:'#C84F3E'")
$content = $content.Replace("backgroundColor:'rgba(239,68,68,0.06)'", "backgroundColor:'rgba(200,79,62,0.06)'")

# ─── INCIDENTS FORECAST: semi-transparent ───
$content = $content.Replace("borderColor:'rgba(239,68,68,0.45)'",          "borderColor:'rgba(200,79,62,0.45)'")
$content = $content.Replace("pointBackgroundColor:'rgba(239,68,68,0.45)'", "pointBackgroundColor:'rgba(200,79,62,0.45)'")

# ─── NCRs LINE: amber #F59E0B → OpsLix gold #B8935C ───
$content = $content.Replace("borderColor:'#F59E0B'",          "borderColor:'#B8935C'")
$content = $content.Replace("pointBackgroundColor:'#F59E0B'", "pointBackgroundColor:'#B8935C'")
$content = $content.Replace("backgroundColor:'rgba(245,158,11,0.05)'", "backgroundColor:'rgba(184,147,92,0.06)'")

# ─── NCR FORECAST ───
$content = $content.Replace("borderColor:'rgba(245,158,11,0.45)'",          "borderColor:'rgba(184,147,92,0.45)'")
$content = $content.Replace("pointBackgroundColor:'rgba(245,158,11,0.45)'", "pointBackgroundColor:'rgba(184,147,92,0.45)'")

# ─── ACTIONS LINE: green #10B981 → OpsLix sage #7A8B6D ───
$content = $content.Replace("borderColor:'#10B981'",          "borderColor:'#7A8B6D'")
$content = $content.Replace("pointBackgroundColor:'#10B981'", "pointBackgroundColor:'#7A8B6D'")
$content = $content.Replace("backgroundColor:'rgba(16, 185, 129, 0.05)'", "backgroundColor:'rgba(122,139,109,0.06)'")

# ─── LEGEND label color: dark blue-grey → ink (was making text look struck-through) ───
$content = $content.Replace("color:'#7A9BBF'", "color:'#1F1B17'")

# ─── TOOLTIP: dark navy box → cream/ink ───
$content = $content.Replace("backgroundColor:'#0C1824'", "backgroundColor:'#FFFFFF'")
$content = $content.Replace("borderColor:'#162236'",     "borderColor:'#D8D2C4'")
$content = $content.Replace("titleColor:'#EBF4FF'",      "titleColor:'#1F1B17'")
$content = $content.Replace("bodyColor:'#7A9BBF'",       "bodyColor:'#5C544A'")

# ─── AXES: ticks were dark navy on transparent background ───
$content = $content.Replace("color:'#2E4A66'", "color:'#5C544A'")
$content = $content.Replace("color:'rgba(255,255,255,0.03)'", "color:'rgba(31,27,23,0.06)'")

# ─── DONUT (Root Cause) chart colors ───
$content = $content.Replace("'rgba(239,68,68,0.8)'",        "'rgba(200,79,62,0.8)'")
$content = $content.Replace("'rgba(245,158,11,0.8)'",       "'rgba(184,147,92,0.8)'")
$content = $content.Replace("'rgba(59,130,246,0.8)'",       "'rgba(91,123,159,0.8)'")
$content = $content.Replace("'rgba(16, 185, 129, 0.8)'",    "'rgba(122,139,109,0.8)'")
$content = $content.Replace("['#EF4444','#F59E0B','#3B82F6','#10B981']", "['#C84F3E','#B8935C','#5B7B9F','#7A8B6D']")

[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))

$after = $content.Length
"Bytes: $before -> $after  (delta=$($after - $before))"

# Verify replacements landed
"chart hex EF4444 remaining: $(([regex]::Matches((Get-Content $path -Raw), 'EF4444')).Count) (was many — CSS rules will keep using it; chart should be 0)"
"chart legend #7A9BBF in chart: $(([regex]::Matches((Get-Content $path -Raw), ""color:'#7A9BBF'"")).Count) (expected 0)"
"new coral #C84F3E count: $(([regex]::Matches((Get-Content $path -Raw), 'C84F3E')).Count) (expected ~8 in chart)"
"new sage #7A8B6D count: $(([regex]::Matches((Get-Content $path -Raw), '7A8B6D')).Count) (expected ~5 in chart)"

.\deploy.ps1
