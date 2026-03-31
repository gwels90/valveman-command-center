# ValveMan Command Center — Deployment Guide

## Prerequisites (Do These First)

Before opening Claude Code, complete these 3 setup steps:

### 1. Install Node.js (if not already installed)
Go to https://nodejs.org and install the LTS version.

### 2. Install Vercel CLI
Open your terminal and run:
```
npm install -g vercel
```
Then log in:
```
vercel login
```
Follow the prompts — use your email. Free account is fine.

### 3. Create a GitHub Repo
Go to https://github.com/new and create a repo called `valveman-command-center` (private is fine). Don't initialize with a README.

---

## Phase 1: Deploy the Dashboard (Copy-Paste This Into Claude Code)

Open Claude Code in your terminal and paste this entire prompt:

---

```
I need you to scaffold and deploy a Next.js dashboard app called "ValveMan Command Center." Here is exactly what to do:

## Step 1: Create the Next.js project

Run:
npx create-next-app@latest valveman-command-center --typescript --tailwind --eslint --app --src-dir --no-import-alias

cd valveman-command-center

## Step 2: Install dependencies

npm install recharts

## Step 3: Set up the main page

Replace the contents of src/app/page.tsx with:

```tsx
import dynamic from 'next/dynamic';

const Dashboard = dynamic(() => import('@/components/Dashboard'), { ssr: false });

export default function Home() {
  return <Dashboard />;
}
```

## Step 4: Create the dashboard component

Create the file src/components/Dashboard.tsx

Paste the ENTIRE contents of the ValveMan Command Center React component into this file. The component file is located at ./valveman-command-center.jsx in my current directory. Read that file and copy its full contents into src/components/Dashboard.tsx.

If you can't find the file, ask me to provide it.

## Step 5: Update the layout

Replace src/app/layout.tsx with:

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ValveMan Command Center',
  description: 'CEO Dashboard for ValveMan - FSW Group',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
```

## Step 6: Update globals.css

Replace src/app/globals.css with:

```css
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  background: #0B0B0F;
  color: #E4E4E8;
  overflow-x: hidden;
}
```

## Step 7: Fix any TypeScript issues

The component was written in JSX. You may need to:
- Add `'use client';` at the top of Dashboard.tsx
- Add type annotations where TypeScript complains
- Change the file extension to .tsx if not already
- Fix any type errors with minimal changes (use `any` types if needed to unblock, we'll clean up later)

## Step 8: Test locally

npm run dev

Open http://localhost:3000 and verify the dashboard renders. Fix any errors.

## Step 9: Initialize git and push

git init
git add .
git commit -m "Initial ValveMan Command Center"
git branch -M main
git remote add origin https://github.com/[MY_GITHUB_USERNAME]/valveman-command-center.git
git push -u origin main

Ask me for my GitHub username if you need it.

## Step 10: Deploy to Vercel

vercel --prod

Follow the prompts. Use the defaults. This will give me a live URL.

## Important notes:
- Do NOT skip any steps
- Do NOT simplify the component — use the full 1900+ line version
- If the build fails, fix the errors and try again
- The Anthropic API calls in the component will work as-is since they don't require an API key in the headers (it's handled by the Claude.ai environment). For the Vercel deployment, we'll add API key handling in Phase 2.
- Tell me the final deployed URL when done.
```

---

## Phase 2: Connect Google Sheets (After Phase 1 is Live)

Paste this into Claude Code after Phase 1 is deployed:

---

```
I need to connect my ValveMan Command Center dashboard to Google Sheets as the data source for KPI targets and actuals.

## What I have:
- A deployed Next.js app on Vercel (ValveMan Command Center)
- A Google Sheets spreadsheet called "ValveMan KPI Template" with tabs for each channel (Sales, SEO, Paid Search, Email, P&L)
- Each tab has columns: KPI name, Unit, Benchmark, Jan-Dec Targets, Jan-Dec Actuals, Cadence, Source

## What I need you to build:

### 1. Google Sheets API integration
- Create a Google Cloud project service account for read-only Sheets access
- Walk me through getting the credentials JSON file
- Store the credentials as a Vercel environment variable

### 2. API route: /api/kpis
Create an API route at src/app/api/kpis/route.ts that:
- Reads from the Google Sheet using the googleapis npm package
- Returns all KPI data organized by tab/channel
- Caches responses for 5 minutes (so we don't hit rate limits)
- Returns data in this format:
{
  "sales_team": [{ "label": "Bookings This Month", "unit": "$", "benchmark": 75000, "target": 80000, "actual": 72000, "prev_month": 68000, "prev_year": 55000 }],
  "seo_overall": [...],
  ...
}

### 3. Update the Dashboard component
- Add a useEffect that fetches from /api/kpis on mount
- Populate the KPI tables with real actuals
- Calculate MoM and YoY percentages from the data
- Make StatusDots compare actual vs target (green/yellow/red)
- Populate the "What's Broken" section with any red/yellow KPIs
- Update the Scorecard grades based on real data

### 4. Deploy
- Add the Google credentials to Vercel env vars
- Redeploy

Walk me through each step. Ask me questions if you need info like the Google Sheet ID.
```

---

## Phase 3: Connect Live APIs (After Phase 2)

### 3a. Pipedrive (Sales Data)

```
Connect Pipedrive CRM to my ValveMan Command Center.

I need an API route at /api/pipedrive that pulls:
- Deals won this month (bookings) by rep (Josh, Cleon, Amr)
- Deals in pipeline with values
- Quotes/proposals sent this month by rep
- Activities (calls) per rep per day
- Deal close rates (trailing 90 days) by rep
- Average deal size by rep
- New organizations created this month by rep

My Pipedrive API token will be stored as PIPEDRIVE_API_KEY in Vercel env vars.
The Pipedrive API base URL is https://api.pipedrive.com/v1

Cache results for 15 minutes. Return data organized by rep.
Update the Dashboard to use this data on the Sales tab.
```

### 3b. GA4 (Organic + Paid Traffic)

```
Connect Google Analytics 4 to my ValveMan Command Center.

I need an API route at /api/ga4 that pulls:
- Organic sessions, revenue, and conversion rate (this month + last month + same month last year)
- Paid search sessions, revenue, conversion rate
- Revenue by channel grouping
- Top landing pages by organic traffic

Use the Google Analytics Data API (v1beta) with the same service account from Phase 2.
My GA4 property ID will be stored as GA4_PROPERTY_ID in Vercel env vars.

Cache results for 30 minutes. Update the SEO and Paid Search tabs with this data.
```

### 3c. Klaviyo (Email)

```
Connect Klaviyo to my ValveMan Command Center.

I need an API route at /api/klaviyo that pulls:
- Campaign metrics: open rate, CTR, revenue per send, unsubscribe rate
- Flow (automation) revenue as percentage of total
- List size and growth rate (current vs 30 days ago)
- Deliverability rate
- Overall email revenue this month

Use Klaviyo's API v3 (revision 2024-10-15).
My Klaviyo private API key will be stored as KLAVIYO_API_KEY in Vercel env vars.

Cache results for 30 minutes. Update the Email Marketing tab.
```

### 3d. Google Ads (Paid Search)

```
Connect Google Ads to my ValveMan Command Center.

I need an API route at /api/google-ads that pulls:
- Campaign-level: impressions, clicks, cost, conversions, conversion value
- Calculate: ROAS, CPC, CTR, cost per conversion, impression share
- Top converting campaigns
- Budget utilization

Use the Google Ads API with the same Google Cloud project from Phase 2.
I'll need a Google Ads developer token and OAuth refresh token — walk me through getting these.

Store credentials as Vercel env vars. Cache results for 30 minutes.
Update the Paid Search tab.
```

---

## Phase 4: OpenClaw Alerts (After Phase 3)

```
I want to set up an OpenClaw agent that monitors my ValveMan Command Center KPIs and alerts me via WhatsApp when something needs attention.

Here's what I need:
1. A cron job that runs every morning at 7am ET
2. It hits my dashboard's /api/kpis endpoint
3. It compares actuals vs targets for all KPIs
4. If any KPI is red (>10% below target), it sends me a WhatsApp message with:
   - Which KPIs are red
   - Current value vs target
   - How long they've been red (if trackable)
   - Suggested action

Create an OpenClaw skill for this. The skill should:
- Be called "valveman-kpi-monitor"
- Have a SKILL.md with clear instructions
- Include the cron job configuration
- Format the WhatsApp message cleanly (not a wall of text)

Also create a weekly summary that runs every Monday at 7am:
- Overall scorecard grade per channel
- Top 3 wins this week
- Top 3 concerns
- Suggested CEO priorities for the week
```

---

## Phase 5: Add Anthropic API Key for AI Features (Do During Phase 1)

The dashboard has AI features (Deploy Agent, Weekly Briefing, Calendar Suggestions) that call the Anthropic API. For these to work on Vercel:

```
The ValveMan Command Center has features that call the Anthropic API directly from the browser. For the Vercel deployment, I need you to:

1. Create an API route at /api/claude that proxies requests to the Anthropic API
2. Store my ANTHROPIC_API_KEY as a Vercel environment variable
3. Update all fetch("https://api.anthropic.com/v1/messages") calls in the Dashboard component to instead call /api/claude
4. The proxy route should:
   - Accept the same request body as the Anthropic API
   - Add the x-api-key and anthropic-version headers server-side
   - Stream or return the response to the client
   - Have basic rate limiting (max 20 requests per hour)

This keeps the API key secret on the server side.
```

---

## Summary: Order of Operations

1. ✅ Do prerequisites (Node.js, Vercel CLI, GitHub repo)
2. ✅ Paste Phase 1 prompt into Claude Code → dashboard goes live
3. ✅ Paste Phase 5 prompt → AI features work on Vercel
4. ✅ Upload KPI template to Google Sheets → paste Phase 2 prompt
5. ✅ Paste Phase 3a-3d prompts one at a time → live data flows in
6. ✅ Paste Phase 4 prompt → alerts via WhatsApp

Total estimated time: ~2-3 hours across a week if you do one phase per sitting.
Total cost: $0/month (Vercel free tier + your existing Claude Max subscription)
