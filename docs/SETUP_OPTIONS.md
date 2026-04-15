# Setup Options for Feedback Write-back

The previewer reads posts from any published Google Sheet. For **writing feedback back** to the sheet (approvals, comments), there are three approaches with different privacy/convenience tradeoffs.

## Option 1: Google Apps Script (Current)

**Privacy:** Data stays with the contractor
**Setup effort:** ~5 minutes (one-time per sheet)
**Client experience:** No login required

### How it works

The contractor deploys a small script bound to their sheet. The script runs under their Google account, so no data leaves their control.

### Setup

1. Open your Google Sheet
2. Go to **Extensions > Apps Script**
3. Paste the code from `template/Code.gs`
4. Click **Deploy > New deployment**
5. Set type to **Web app**, execute as **Me**, access **Anyone**
6. Click **Deploy** and copy the URL
7. On the previewer landing page, switch to **"I'm a Contractor"**
8. Paste both the Sheet URL and Script URL
9. Click **Generate Client Link** and share it

### Pros
- Data never leaves the contractor's Google account
- No third-party credentials needed
- Works immediately

### Cons
- Contractor must deploy a script (one-time)
- Script URL changes if re-deployed

---

## Option 2: Google Service Account (Planned)

**Privacy:** App owner has read/write access to shared sheets
**Setup effort:** Contractor just shares the sheet with an email address
**Client experience:** No login required

### How it works

The app uses a Google Cloud service account. The contractor shares their sheet with the service account's email (like sharing with a colleague). The app server reads/writes via the Google Sheets API.

### Setup

1. App deployer creates a Google Cloud service account (one-time)
2. Sets `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_SERVICE_ACCOUNT_KEY` env vars
3. Contractor shares their sheet with the service account email (as Editor)
4. That's it

### Pros
- Simplest contractor experience (just share the sheet)
- No Apps Script deployment needed
- No "Publish to web" needed (API reads directly)

### Cons
- Contractor shares their data with the app owner's service account
- Requires Google Cloud project setup (app deployer, not contractor)
- Trust relationship required between contractor and app owner

---

## Option 3: Client-side OAuth (Planned)

**Privacy:** Data stays between Google and the user's browser
**Setup effort:** None for contractor
**Client experience:** Must sign in with Google once

### How it works

The client authenticates with their own Google account directly in the browser. Feedback is written using the client's own token — no server-side credentials, no data passes through the app server.

### Setup

1. App deployer creates OAuth credentials in Google Cloud (one-time)
2. Sets `NEXT_PUBLIC_GOOGLE_CLIENT_ID` env var
3. Contractor shares the sheet with the client (as Editor)
4. Client clicks "Sign in with Google" in the previewer to enable feedback

### Pros
- Best privacy — no server-side data access
- No Apps Script needed
- No service account needed

### Cons
- Client must have a Google account
- Client must sign in (one-time per session)
- Contractor must share the sheet with the client directly
- Requires Google Cloud OAuth setup (app deployer)

---

## Comparison

| | Apps Script | Service Account | Client OAuth |
|---|---|---|---|
| Data stays with contractor | Yes | No | Yes |
| Contractor setup | Deploy script | Share sheet | Share sheet |
| Client setup | None | None | Google sign-in |
| Requires Google Cloud | No | Yes | Yes |
| Server stores credentials | No | Yes | No |
| Currently implemented | Yes | No | No |

## Recommendation

- **For privacy-conscious contractors:** Use Apps Script (Option 1)
- **For maximum convenience:** Use Service Account (Option 2) — requires trust in the app owner
- **For zero-trust deployments:** Use Client OAuth (Option 3) — most secure but adds client friction
