# deploy.ps1 — USE THIS INSTEAD OF raw wrangler deploy
# It validates first and blocks deploy if any page is broken
Write-Host "Running pre-deploy validation..." -ForegroundColor Cyan
& .\pre_deploy_check.ps1
if ($LASTEXITCODE -ne 0) { Write-Host "DEPLOY ABORTED." -ForegroundColor Red; exit 1 }
Write-Host ""
Write-Host "Deploying to Cloudflare..." -ForegroundColor Cyan
npx wrangler pages deploy . --project-name safetypro-frontend --commit-dirty=true
