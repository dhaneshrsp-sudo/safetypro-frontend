\# OpsLix Frontend Cleanup â€” Master Plan



\*\*Started:\*\* April 30, 2026

\*\*Owner:\*\* Dhanesh CK

\*\*Repo:\*\* github.com/dhaneshrsp-sudo/safetypro-frontend



\## Why this exists



The frontend repo accumulated significant debt across many fix-and-ship sessions over months. As of April 30, 2026:

\- \*\*2,405 git-tracked files\*\* (should be \~80-100 for a project this size)

\- \*\*1,505 files\*\* in `backups/` folder (should never have been tracked)

\- \*\*373 files\*\* in `archive/` folder (should never have been tracked)

\- \*\*\~200 .bak files\*\* in root (per-page snapshots from each fix session)

\- \*\*\~400 one-off helper scripts\*\* in root (debug\_\*, fix\_\*, patch\_\*, check\_\*, etc.)

\- Multiple parallel HTML versions (safetypro\_audit\_compliance\_backup\_v2/v3/v3b)



This plan describes how we clean it up safely across 7 sessions.



\## Status



\- \[x] \*\*Session A\*\* â€” gitignore patterns + plan doc (this commit)

\- \[ ] \*\*Session B\*\* â€” identify orphans (read-only analysis)

\- \[x] \*\*Session C\*\* â€” delete all \*.bak files in root

\- \[x] \*\*Session D\*\* â€” delete orphan helper scripts

\- \[x] \*\*Session E\*\* â€” untrack backups/ and archive/ folders

\- \[ ] \*\*Session F\*\* â€” delete backup HTML versions

\- \[ ] \*\*Session G\*\* â€” final smoke test



\## Verified-live platform files (must NEVER delete)



These are the production platform files. Do not touch.



\- All `safetypro\_\*.html` (the live pages, \~25 of them)

\- `sp-shell.js`, `sp-shell.css`, `sp-charts.js`, `sp-dynamic-states.js`, `sp-drag-scroll.js`, `sp-methodology.js`

\- `safetypro\_api.js`, `safetypro\_exports.js`, `safetypro\_global.css`

\- `opslix-shell.css`

\- `sp-header-template.html`

\- `\_headers`, `\_redirects` (Cloudflare config)

\- `index.html`, `sw.js`

\- `HEADER-SPEC.md`

\- `deploy.ps1`, `pre\_deploy\_check.ps1`

\- `.gitignore`



\## Suspected-live files (verify in Session B before any deletion)



These look like they could be deletable but might be referenced by HTML pages.

Session B will grep all HTML files to confirm.



\- `eia-enhancements.js` (137 KB)

\- `eia-action-modal.js`

\- `ms\_engine.js`, `ms\_engine\_v2.js`

\- `hira-enhancements.js`, `hira-action-modal.js`

\- `rca\_patch.js`, `ims\_patch.js`

\- `layout\_ms\_fix.js`

\- `master\_rebuild.js`

\- `phase\_a.js`



\## Session B procedure (next session)



1\. `cd C:\\safetypro\_complete\_frontend`

2\. Create cleanup folder: `New-Item -ItemType Directory -Path cleanup\\lists -Force`

3\. Run audit script (created in Session B) that scans all `safetypro\_\*.html` files for `<script src="...">` references

4\. Output authoritative LIVE list to `cleanup/lists/LIVE.txt`

5\. Cross-reference with files on disk to build:

&#x20;  - `cleanup/lists/ORPHAN\_CONFIRMED.txt` â€” pattern-match junk (debug\_\*, fix\_\*, etc.) AND not referenced

&#x20;  - `cleanup/lists/ORPHAN\_SUSPECTED.txt` â€” not referenced but doesn't match obvious junk pattern

6\. Manually review SUSPECTED list, decide each

7\. Commit only the lists (no deletions)



\## Session C procedure (\~1 hour)



1\. List all `\*.bak` files in root: `Get-ChildItem -File | Where-Object { $\_.Name -like "\*.bak" }`

2\. Sanity check: NONE referenced in any HTML (`Select-String -Path \*.html -Pattern "\\.bak"`)

3\. Backup-of-backup: zip the .bak files to local archive disk first (NOT committed)

4\. Delete: `Remove-Item \*.bak`

5\. `deploy.ps1` to verify deploy still works

6\. Smoke test 5 random pages on opslix.com

7\. If pass: `git add -u; git commit -m "chore: remove .bak files from root"; git push`



\## Session D procedure (\~1.5 hours)



Delete orphan helper scripts in batches of \~30. Verify after each batch.



\*\*Batch 1:\*\* `debug\*.js`, `check\*.js`, `tmp\*.js`, `find\_\*.js`, `inspect\*.js` (\~80 files)

\*\*Batch 2:\*\* `fix\_\*.js` and `fix-\*.ps1` (\~170 files)

\*\*Batch 3:\*\* `patch\_\*.js` (\~50 files)

\*\*Batch 4:\*\* Other one-offs â€” `add\_\*.js`, `write\_\*.js`, `show\_\*.js`, `scan\_\*.js`, etc. (\~40 files)



After each batch:

1\. Deploy

2\. Smoke test 3 pages

3\. Commit batch

4\. Push



\## Session E procedure (\~45 min)



```powershell

