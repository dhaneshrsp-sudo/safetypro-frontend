$ErrorActionPreference = "Stop"
$utf8 = [System.Text.UTF8Encoding]::new($false)
$f = "$PWD\safetypro_risk_management.html"
Copy-Item $f "$f.iconclick1.bak" -Force
$h = [System.IO.File]::ReadAllText($f, $utf8)

# Remove old override first, we will replace it
$oldStart = $h.IndexOf('<script id="hira-action-icons-override">')
if ($oldStart -ge 0) {
    $oldEnd = $h.IndexOf('</script>', $oldStart) + 9
    $h = $h.Substring(0, $oldStart) + $h.Substring($oldEnd)
    Write-Host "Removed old override"
}

# Build new override with click handlers
$newScript = '<script id="hira-action-icons-override">' + "`n"
$newScript += '(function(){' + "`n"
$newScript += '  function handleAction(type, rowIdx){' + "`n"
$newScript += '    var data = window.HIRA_DATA && window.HIRA_DATA[rowIdx];' + "`n"
$newScript += '    if(!data){ alert("No data for row " + (rowIdx+1)); return; }' + "`n"
$newScript += '    var hzdId = "HZD-" + String(rowIdx+1).padStart(3, "0");' + "`n"
$newScript += '    if(type === "view"){' + "`n"
$newScript += '      alert("VIEW: " + hzdId + "\n\nActivity: " + data.activity + "\nHazard: " + data.hazard + "\nCategory: " + data.cat + "\nPersons at Risk: " + data.persons + "\nInitial Risk: L=" + data.iL + ", S=" + data.iS + " (Score " + (data.iL*data.iS) + ")\nResidual Risk: L=" + data.rL + ", S=" + data.rS + " (Score " + (data.rL*data.rS) + ")\nControls: " + data.existing + "\nGap: " + data.gap + "\nAdditional: " + data.additional + "\nOwner: " + data.owner + "\nTarget: " + data.target + "\nStatus: " + data.status);' + "`n"
$newScript += '    } else if(type === "edit"){' + "`n"
$newScript += '      alert("EDIT: " + hzdId + "\n\nEdit modal coming soon. Will allow modifying all 25 fields with change-logging for ISO 19011 audit trail.");' + "`n"
$newScript += '    } else if(type === "photo"){' + "`n"
$newScript += '      alert("PHOTO ATTACHMENT: " + hzdId + "\n\nPhoto upload coming soon. Will accept site photos (JPG/PNG) stored securely with hazard record for audit evidence. Required for Intelex/Cority feature parity.");' + "`n"
$newScript += '    }' + "`n"
$newScript += '  }' + "`n"
$newScript += '  window.hiraActionHandler = handleAction;' + "`n"
$newScript += '  function patchActionCells(){' + "`n"
$newScript += '    var tbody = document.getElementById("hira-tbody");' + "`n"
$newScript += '    if(!tbody) return;' + "`n"
$newScript += '    var rows = tbody.querySelectorAll("tr");' + "`n"
$newScript += '    for(var i = 0; i < rows.length; i++){' + "`n"
$newScript += '      var cells = rows[i].cells;' + "`n"
$newScript += '      if(cells.length === 0) continue;' + "`n"
$newScript += '      var lastCell = cells[cells.length - 1];' + "`n"
$newScript += '      if(lastCell.getAttribute("data-patched") === "1") continue;' + "`n"
$newScript += '      var text = lastCell.textContent.trim();' + "`n"
$newScript += '      if(text === String.fromCharCode(0x270E) || lastCell.querySelectorAll("span").length === 3){' + "`n"
$newScript += '        lastCell.setAttribute("data-patched", "1");' + "`n"
$newScript += '        lastCell.style.cssText = "padding:6px 8px;text-align:center;white-space:nowrap;";' + "`n"
$newScript += '        lastCell.innerHTML = "";' + "`n"
$newScript += '        var rowIdx = i;' + "`n"
$newScript += '        var types = [{t:"view", icon:"&#128065;", color:"#3B82F6", title:"View details"}, {t:"edit", icon:"&#9998;", color:"#22C55E", title:"Edit hazard"}, {t:"photo", icon:"&#128206;", color:"#F59E0B", title:"Attach photo"}];' + "`n"
$newScript += '        types.forEach(function(cfg){' + "`n"
$newScript += '          var span = document.createElement("span");' + "`n"
$newScript += '          span.innerHTML = cfg.icon;' + "`n"
$newScript += '          span.title = cfg.title;' + "`n"
$newScript += '          span.style.cssText = "margin:0 4px;cursor:pointer;color:" + cfg.color + ";font-size:14px;";' + "`n"
$newScript += '          span.addEventListener("click", (function(t, ri){ return function(){ handleAction(t, ri); }; })(cfg.t, rowIdx));' + "`n"
$newScript += '          lastCell.appendChild(span);' + "`n"
$newScript += '        });' + "`n"
$newScript += '      }' + "`n"
$newScript += '    }' + "`n"
$newScript += '  }' + "`n"
$newScript += '  setInterval(patchActionCells, 1000);' + "`n"
$newScript += '  [500, 1500, 3000].forEach(function(ms){ setTimeout(patchActionCells, ms); });' + "`n"
$newScript += '  if(document.readyState === "loading"){' + "`n"
$newScript += '    document.addEventListener("DOMContentLoaded", function(){ setTimeout(patchActionCells, 100); });' + "`n"
$newScript += '  } else {' + "`n"
$newScript += '    setTimeout(patchActionCells, 100);' + "`n"
$newScript += '  }' + "`n"
$newScript += '})();' + "`n"
$newScript += '</script>'

$bodyClose = $h.LastIndexOf('</body>')
if ($bodyClose -lt 0) { Write-Host "No body close"; return }
$h = $h.Substring(0, $bodyClose) + $newScript + "`n" + $h.Substring($bodyClose)

[System.IO.File]::WriteAllText($f, $h, $utf8)
Write-Host "Updated override with click handlers"
