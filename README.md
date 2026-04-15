# Social Posts Previewer

Preview and approve social media posts from a Google Sheet. Contractors work in Sheets, clients review realistic platform previews and leave feedback.

## Features

- **Realistic previews** for LinkedIn, X (Twitter), Facebook, and Instagram
- **Variant switching** — compare A/B/C copy side by side
- **Cross-platform preview** — see how LinkedIn copy looks as a tweet
- **Approve / Reject** with comments — feedback syncs to the sheet
- **Zero client setup** — open a link and start reviewing
- **Demo mode** — try it with sample data, no sheet needed

## Quick Start

```bash
npm install
npm run dev    # starts on port 5301
```

Open `http://localhost:5301` and click **"Try with sample data"**.

## How It Works

1. **Contractor** fills a Google Sheet with post copy using the [template columns](#sheet-template)
2. **Contractor** publishes the sheet to web and generates a client link
3. **Client** opens the link, sees realistic previews, approves or leaves comments
4. **Feedback** appears in the contractor's sheet

See [docs/SETUP_OPTIONS.md](docs/SETUP_OPTIONS.md) for detailed setup instructions.

## Sheet Template

| Column | Purpose | Who writes |
|--------|---------|-----------|
| A | Post ID | Contractor |
| B | Campaign | Contractor |
| C | Platform (LinkedIn/Twitter/Facebook/Instagram) | Contractor |
| D | Variant (A, B, C) | Contractor |
| E | Post Text | Contractor |
| F | Image URL (optional) | Contractor |
| G | Link URL (optional) | Contractor |
| H | Scheduled Date | Contractor |
| I | Status (Draft / Ready for Review) | Contractor |
| J | Approved | Tool |
| K | Client Comment | Tool |
| L | Reviewed At | Tool |

A CSV template is included at `template/social-posts-template.csv`.

## Deploy

Push to GitHub and connect to [Vercel](https://vercel.com) — zero config.

## Tech Stack

- Next.js 16 (App Router)
- React 19, TypeScript
- Tailwind CSS 4
