# IOJH book lead reporting — near-live Google Sheets sync

This optional new feature supersedes *Gmail attachment delivery* as the primary way to view leads. The existing registration, Supabase table, duplicate phone constraint, Excel email report and Gmail-to-Drive automation remain unchanged.

## Architecture

Supabase (private master) -> existing Next.js private `/api/leads/sheet-sync` read-only route -> HR Google Apps Script polling every 5 minutes -> private Google Sheet. The daily `.xlsx` report still runs as a backup.

## Security

- Use a **separate** `IOJH_LEAD_SYNC_SECRET` (64 random hex chars) in Vercel Production and Google Apps Script project **Script Properties**. It is not `SUPABASE_SERVICE_ROLE_KEY` or `CRON_SECRET`.
- Do not expose the token via NEXT_PUBLIC_ variables, GitHub, query parameters, chat, Drive public sharing, or screenshots.
- Script reads only from the authenticated server route; no Supabase admin credentials are given to Google Apps Script.
- Keep your Google Sheet and Script project controlled by HR, and share only with authorized IOJH staff.
- A successful synchronization is normally reflected within about one five-minute trigger interval, but trigger execution can vary. It is not a guaranteed instant update.
- As currently implemented, **the sheet is a current snapshot**. Rows removed or expired in Supabase will also disappear from the synced and follow-up tabs. Existing Gmail attachments and Drive snapshots need a separate retention/deletion policy.

## Server installation

1. Start in `E:\IOJH\iojh-book-landing`; make sure `git status --short` is clean or preserve your unrelated changes first.
2. `git switch main` then `git pull --ff-only origin main`.
3. `git switch -c feature/live-leads-google-sheets`.
4. From the extracted ZIP, run `py -3 "<EXTRACTED_FOLDER>\install_upgrade.py" --repo . --dry-run` and then without `--dry-run`.
5. Generate a key locally: `node -p "require('node:crypto').randomBytes(32).toString('hex')"`.
6. Add `IOJH_LEAD_SYNC_SECRET=<generated key>` to `.env.local`, and to **Production** Vercel variables (Type **Secret**) for project `manuscript2pub`.
7. Run `npm run lint`, `npm run build`, `git diff --check`. You may see existing unrelated ESLint warnings.
8. Stage new files only: `git add -- src/app/api/leads/sheet-sync/route.ts docs/02_live_google_sheets_sync.md`.
9. Commit, push the feature branch, review Vercel preview, merge the PR, and verify a production deployment is Ready.

## API validation

- Without authorization, `GET https://book.iojh.com.bd/api/leads/sheet-sync` returns **HTTP 401**. That is correct.
- The Google Apps Script request includes `Authorization: Bearer <token>`. Success returns JSON with `ok:true`, `count`, `generated_at` and `leads`.
- An HTTP 200 is **not a public endpoint**: its response must never be exposed without a private token.

## Google Sheets installation

1. Sign into the Google account `hr.iojhltd@gmail.com`.
2. In the existing restricted `IOJH Book Leads` Drive folder, create a **new Google Sheets** spreadsheet named `IOJH Book Leads — LIVE`. The original `IOJH_book_leads_LATEST.xlsx` remains a daily backup, not the live sheet.
3. Copy the **spreadsheet ID** from `https://docs.google.com/spreadsheets/d/<ID>/edit`.
4. Open the existing `IOJH Book Leads Auto Sync` Apps Script project. Do not replace its old `Code.gs` (that runs the Gmail backup).
5. Click **+** beside Files -> **Script** -> name it `LiveSync`, then paste only the contents of `google-apps-script/LiveSync.gs` and save.
6. Under **Project Settings** -> **Script Properties**, add:
   - `IOJH_LEAD_SYNC_URL` = `https://book.iojh.com.bd/api/leads/sheet-sync`
   - `IOJH_LEAD_SYNC_TOKEN` = the exact same token as Vercel's `IOJH_LEAD_SYNC_SECRET`
   - `IOJH_LEAD_SHEET_ID` = your new Google Sheets spreadsheet ID
7. Select and **Run** `syncLeadsFromWebsite` once; approve only the permissions for the HR account. Do not share the token or full logs.
8. Open the new spreadsheet. Tabs **Registrations**, **Sales Follow-up**, **Sync Status** should appear and show the latest count (e.g., 7 if seven leads still exist).
9. If Step 8 passes, select and **Run** `installFiveMinuteLeadSyncTrigger` once. It installs a time-driven trigger, every five minutes, and avoids duplicates on repeat runs.
10. Check Apps Script -> **Triggers** for the new `syncLeadsFromWebsite` trigger. Keep the existing hourly `syncIojhBookLeads` trigger if you want daily Excel backups as before.

### Following up with prospective buyers

Edit **Sales Follow-up** columns C-G: `Sales status`, `Assigned to`, `Last contacted`, `Next follow-up`, `Follow-up notes`. The script preserves those cells on each refresh by matching the unique phone number. Do **not** edit columns A-B or the `Registrations` tab: they are regenerated from Supabase.

### Troubleshooting

- `Lead sync API HTTP 401`: Script Properties token differs from Vercel Production secret, or Production deployment is not updated.
- `Lead sync API HTTP 404`: latest route has not been merged/deployed to the Production site.
- `Lead sync API HTTP 503`: private server could not read Supabase; review Vercel request/runtime logs (do not disclose private keys).
- `Lead sync successful ... 7`: all current records were retrieved. If this differs from Supabase, check that this is the right Supabase project/environment.
- A new lead still doesn't appear after 5-10 minutes: open **Apps Script -> Executions** and the spreadsheet's **Sync Status** tab, then run `syncLeadsFromWebsite` manually to diagnose.

## Privacy and hosting

This copies identifiable contact information to a second platform; limit access to HR and your boss, account for it in your privacy/consent notice, and maintain deletion/retention practices for Sheets, Gmail and Drive backups. This book-sales website is commercial; ensure the hosting plan permits commercial use.
