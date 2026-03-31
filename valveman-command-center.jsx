import { useState, useEffect, useCallback, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer, Area, AreaChart } from "recharts";

// ─── CONSTANTS & DATA ───────────────────────────────────────────────────────

const COLORS = {
  bg: "#0B0B0F",
  card: "#141419",
  cardHover: "#1A1A22",
  border: "#2A2A35",
  red: "#C41E24",
  redBright: "#E8323A",
  redDark: "#8B1519",
  redGlow: "rgba(196,30,36,0.15)",
  text: "#E4E4E8",
  textMuted: "#8A8A96",
  textDim: "#5A5A66",
  green: "#22C55E",
  greenDim: "#166534",
  yellow: "#F59E0B",
  yellowDim: "#92400E",
  blue: "#3B82F6",
  white: "#FFFFFF",
};

const TABS = [
  { id: "home", label: "Command Center" },
  { id: "scorecard", label: "Scorecard" },
  { id: "sales", label: "Direct Sales" },
  { id: "seo", label: "Organic SEO" },
  { id: "paid", label: "Paid Search" },
  { id: "email", label: "Email Marketing" },
  { id: "profitability", label: "Channel P&L" },
  { id: "calendar", label: "Calendar" },
  { id: "time", label: "Time Tracker" },
];

const SALES_REPS = ["Josh", "Cleon", "Amr"];
const SALES_MANAGER = "Kurt Hanusa";

const SALES_REP_KPIS = [
  { id: "bookings", label: "Bookings This Month", unit: "$", benchmark: 75000, cadence: "Monthly", source: "Pipedrive" },
  { id: "bookings_margin", label: "Avg Profit Margin (Bookings)", unit: "%", benchmark: 32, cadence: "Monthly", source: "QuickBooks + Pipedrive" },
  { id: "quotes_sent", label: "Quotes Sent This Month", unit: "#", benchmark: 40, cadence: "Monthly", source: "Pipedrive" },
  { id: "quotes_margin", label: "Avg Profit Margin (Quotes)", unit: "%", benchmark: 30, cadence: "Monthly", source: "Pipedrive" },
  { id: "close_rate_90", label: "Trailing 90-Day Close Rate", unit: "%", benchmark: 25, cadence: "Quarterly (rolling)", source: "Pipedrive" },
  { id: "calls_per_day", label: "Calls Made Per Day", unit: "#", benchmark: 25, cadence: "Daily", source: "Phone System / Pipedrive" },
  { id: "call_sentiment", label: "Call Sentiment Score", unit: "/10", benchmark: 7.5, cadence: "Weekly", source: "AI Call Analysis" },
  { id: "avg_deal_size", label: "Average Deal Size", unit: "$", benchmark: 2800, cadence: "Monthly", source: "Pipedrive" },
  { id: "pipeline_value", label: "Active Pipeline Value", unit: "$", benchmark: 150000, cadence: "Weekly", source: "Pipedrive" },
  { id: "quote_to_order_days", label: "Quote-to-Order Time", unit: "days", benchmark: 7, cadence: "Monthly", source: "Pipedrive" },
  { id: "new_accounts", label: "New Accounts Opened", unit: "#", benchmark: 5, cadence: "Monthly", source: "Pipedrive" },
  { id: "repeat_order_rate", label: "Repeat Order Rate", unit: "%", benchmark: 40, cadence: "Quarterly", source: "Pipedrive + BigCommerce" },
];

const MANAGER_EXTRA_KPIS = [
  { id: "coaching_sentiment", label: "Coaching Call Sentiment", unit: "/10", benchmark: 8.0, cadence: "Weekly", source: "AI Call Analysis (Fathom)" },
  { id: "coaching_prep", label: "1:1 Preparation Score", unit: "/10", benchmark: 8.0, cadence: "Weekly", source: "AI Analysis" },
  { id: "coaching_actionability", label: "Action Item Follow-Through", unit: "%", benchmark: 85, cadence: "Weekly", source: "AI Analysis" },
  { id: "team_pipeline_velocity", label: "Team Pipeline Velocity", unit: "$/day", benchmark: 5000, cadence: "Weekly", source: "Pipedrive" },
  { id: "team_retention", label: "Customer Retention Rate", unit: "%", benchmark: 80, cadence: "Quarterly", source: "Pipedrive + BigCommerce" },
];

const SEO_TECHNICAL_KPIS = [
  { id: "lcp_desktop", label: "LCP (Desktop)", unit: "s", benchmark: 2.5, direction: "lower", cadence: "Weekly", source: "Google PageSpeed / CrUX" },
  { id: "inp_desktop", label: "INP (Desktop)", unit: "ms", benchmark: 200, direction: "lower", cadence: "Weekly", source: "Google PageSpeed / CrUX" },
  { id: "cls_desktop", label: "CLS (Desktop)", unit: "", benchmark: 0.1, direction: "lower", cadence: "Weekly", source: "Google PageSpeed / CrUX" },
  { id: "lcp_mobile", label: "LCP (Mobile)", unit: "s", benchmark: 2.5, direction: "lower", cadence: "Weekly", source: "Google PageSpeed / CrUX" },
  { id: "inp_mobile", label: "INP (Mobile)", unit: "ms", benchmark: 200, direction: "lower", cadence: "Weekly", source: "Google PageSpeed / CrUX" },
  { id: "cls_mobile", label: "CLS (Mobile)", unit: "", benchmark: 0.1, direction: "lower", cadence: "Weekly", source: "Google PageSpeed / CrUX" },
  { id: "indexation_rate", label: "Indexation Rate", unit: "%", benchmark: 95, cadence: "Monthly", source: "Google Search Console" },
  { id: "crawl_errors", label: "Crawl Errors", unit: "#", benchmark: 0, direction: "lower", cadence: "Weekly", source: "Google Search Console" },
  { id: "site_speed_score", label: "PageSpeed Score (Mobile)", unit: "/100", benchmark: 75, cadence: "Weekly", source: "Google PageSpeed" },
];

const SEO_ONPAGE_KPIS = [
  { id: "title_optimization", label: "Title Tag Optimization Score", unit: "%", benchmark: 90, cadence: "Monthly", source: "Screaming Frog / Ahrefs" },
  { id: "meta_coverage", label: "Meta Description Coverage", unit: "%", benchmark: 95, cadence: "Monthly", source: "Screaming Frog" },
  { id: "h1_optimization", label: "H1 Tag Optimization", unit: "%", benchmark: 95, cadence: "Monthly", source: "Screaming Frog" },
  { id: "internal_linking_score", label: "Internal Linking Score", unit: "/10", benchmark: 7.5, cadence: "Monthly", source: "Ahrefs / Screaming Frog" },
  { id: "schema_coverage", label: "Schema Markup Coverage", unit: "%", benchmark: 80, cadence: "Monthly", source: "Google Search Console / Schema Validator" },
  { id: "image_alt_coverage", label: "Image Alt Text Coverage", unit: "%", benchmark: 95, cadence: "Monthly", source: "Screaming Frog" },
  { id: "keyword_rankings_top10", label: "Keywords in Top 10", unit: "#", benchmark: 150, cadence: "Weekly", source: "Ahrefs / SEMrush" },
  { id: "featured_snippets", label: "Featured Snippets Owned", unit: "#", benchmark: 10, cadence: "Monthly", source: "Ahrefs" },
];

const SEO_OFFPAGE_KPIS = [
  { id: "inbound_links", label: "Total Inbound Links", unit: "#", benchmark: 500, cadence: "Monthly", source: "Ahrefs" },
  { id: "avg_link_da", label: "Avg DA of Inbound Links", unit: "", benchmark: 35, cadence: "Monthly", source: "Ahrefs / Moz" },
  { id: "outreach_sent", label: "Link Outreach Sent", unit: "#", benchmark: 40, cadence: "Monthly", source: "Outreach Tool / Spreadsheet" },
  { id: "link_landing_rate", label: "Link Landing Rate", unit: "%", benchmark: 8, cadence: "Monthly", source: "Outreach Tool" },
  { id: "referring_domains", label: "Referring Domains", unit: "#", benchmark: 200, cadence: "Monthly", source: "Ahrefs" },
  { id: "toxic_links", label: "Toxic Backlinks", unit: "#", benchmark: 0, direction: "lower", cadence: "Quarterly", source: "Ahrefs / SEMrush" },
];

const SEO_CONTENT_KPIS = [
  { id: "new_content_pieces", label: "New Content Pieces (per writer)", unit: "#", benchmark: 4, cadence: "Monthly", source: "CMS / Editorial Calendar" },
  { id: "content_reviews", label: "Content Reviews (per writer)", unit: "#", benchmark: 8, cadence: "Monthly", source: "CMS / Editorial Calendar" },
  { id: "organic_ctr", label: "Avg Organic CTR", unit: "%", benchmark: 3.5, cadence: "Monthly", source: "Google Search Console" },
  { id: "content_conversion_rate", label: "Content Conversion Rate", unit: "%", benchmark: 2.0, cadence: "Monthly", source: "GA4" },
  { id: "avg_time_on_page", label: "Avg Time on Content Pages", unit: "min", benchmark: 3.0, cadence: "Monthly", source: "GA4" },
];

const SEO_OVERALL_KPIS = [
  { id: "domain_authority", label: "Domain Authority", unit: "", benchmark: 35, cadence: "Monthly", source: "Moz / Ahrefs" },
  { id: "llm_visibility", label: "LLM Visibility Score", unit: "/100", benchmark: 50, cadence: "Monthly", source: "Otterly.ai / Manual Testing" },
  { id: "organic_revenue", label: "Organic Revenue", unit: "$", benchmark: 80000, cadence: "Monthly", source: "GA4 + BigCommerce" },
  { id: "organic_sessions", label: "Organic Sessions", unit: "#", benchmark: 25000, cadence: "Monthly", source: "GA4" },
  { id: "organic_conversion_rate", label: "Organic Conversion Rate", unit: "%", benchmark: 2.5, cadence: "Monthly", source: "GA4" },
  { id: "branded_vs_nonbranded", label: "Non-Branded Traffic Share", unit: "%", benchmark: 70, cadence: "Monthly", source: "Google Search Console" },
];

const PAID_SEARCH_KPIS = [
  { id: "roas", label: "ROAS", unit: "x", benchmark: 5.0, cadence: "Weekly", source: "Google Ads" },
  { id: "cost_per_conversion", label: "Cost Per Conversion", unit: "$", benchmark: 35, direction: "lower", cadence: "Weekly", source: "Google Ads" },
  { id: "avg_revenue_per_conversion", label: "Avg Revenue Per Conversion", unit: "$", benchmark: 175, cadence: "Weekly", source: "Google Ads + GA4" },
  { id: "paid_revenue", label: "Channel Revenue", unit: "$", benchmark: 40000, cadence: "Monthly", source: "Google Ads + GA4" },
  { id: "top_brand_1", label: "Top Brand #1 Revenue", unit: "$", benchmark: 12000, cadence: "Monthly", source: "GA4 + BigCommerce" },
  { id: "top_brand_2", label: "Top Brand #2 Revenue", unit: "$", benchmark: 8000, cadence: "Monthly", source: "GA4 + BigCommerce" },
  { id: "top_brand_3", label: "Top Brand #3 Revenue", unit: "$", benchmark: 5000, cadence: "Monthly", source: "GA4 + BigCommerce" },
  { id: "ctr", label: "Click-Through Rate", unit: "%", benchmark: 4.5, cadence: "Weekly", source: "Google Ads" },
  { id: "avg_cpc", label: "Average CPC", unit: "$", benchmark: 2.50, direction: "lower", cadence: "Weekly", source: "Google Ads" },
  { id: "impression_share", label: "Search Impression Share", unit: "%", benchmark: 65, cadence: "Weekly", source: "Google Ads" },
  { id: "quality_score_avg", label: "Avg Quality Score", unit: "/10", benchmark: 7, cadence: "Monthly", source: "Google Ads" },
  { id: "budget_utilization", label: "Budget Utilization", unit: "%", benchmark: 90, cadence: "Weekly", source: "Google Ads" },
  { id: "new_vs_returning_rev", label: "New Customer Revenue %", unit: "%", benchmark: 45, cadence: "Monthly", source: "GA4" },
];

const EMAIL_KPIS = [
  { id: "open_rate", label: "Open Rate", unit: "%", benchmark: 25, cadence: "Per Send / Monthly", source: "Klaviyo" },
  { id: "revenue_per_send", label: "Revenue Per Send", unit: "$", benchmark: 450, cadence: "Per Send", source: "Klaviyo" },
  { id: "email_revenue", label: "Overall Email Revenue", unit: "$", benchmark: 15000, cadence: "Monthly", source: "Klaviyo" },
  { id: "list_growth", label: "List Growth Rate", unit: "%", benchmark: 3, cadence: "Monthly", source: "Klaviyo" },
  { id: "click_through_rate", label: "Click-Through Rate", unit: "%", benchmark: 3.5, cadence: "Per Send / Monthly", source: "Klaviyo" },
  { id: "unsubscribe_rate", label: "Unsubscribe Rate", unit: "%", benchmark: 0.3, direction: "lower", cadence: "Monthly", source: "Klaviyo" },
  { id: "bounce_rate", label: "Bounce Rate", unit: "%", benchmark: 1.0, direction: "lower", cadence: "Monthly", source: "Klaviyo" },
  { id: "revenue_per_subscriber", label: "Revenue Per Subscriber", unit: "$", benchmark: 1.50, cadence: "Monthly", source: "Klaviyo" },
  { id: "deliverability_rate", label: "Deliverability Rate", unit: "%", benchmark: 98, cadence: "Monthly", source: "Klaviyo" },
  { id: "automation_revenue_pct", label: "Automation Revenue %", unit: "%", benchmark: 40, cadence: "Monthly", source: "Klaviyo" },
  { id: "repeat_purchase_from_email", label: "Repeat Purchase Rate (Email)", unit: "%", benchmark: 25, cadence: "Quarterly", source: "Klaviyo + BigCommerce" },
  { id: "list_size", label: "Total List Size", unit: "#", benchmark: 10000, cadence: "Monthly", source: "Klaviyo" },
];

const CHANNEL_PROFITABILITY = [
  { channel: "Direct Sales", revenue: null, cost: null, benchmark_margin: 35 },
  { channel: "Organic SEO", revenue: null, cost: null, benchmark_margin: 75 },
  { channel: "Paid Search", revenue: null, cost: null, benchmark_margin: 45 },
  { channel: "Email Marketing", revenue: null, cost: null, benchmark_margin: 85 },
];

const AI_SUGGESTIONS = {
  sales: [
    { type: "ai", title: "Analyze call recordings for coaching insights", desc: "Deploy AI to listen to this week's sales calls, score sentiment, identify objection patterns, and generate rep-specific coaching plans.", prompt: "You are a B2B industrial sales coach. Analyze the following call transcripts from ValveMan sales reps. For each rep, provide: 1) Overall sentiment score (1-10), 2) Top 3 objections encountered and how they handled them, 3) Specific coaching recommendations, 4) Talk-to-listen ratio, 5) Discovery question quality score. Format as an actionable coaching brief for sales manager Kurt Hanusa." },
    { type: "ai", title: "Generate targeted prospect lists by territory", desc: "AI researches OEM system builders in PA territory where valves are BOM components.", prompt: "You are a B2B industrial market researcher. Research and compile a prospect list of OEM system builders in the greater Pennsylvania territory who use industrial valves as BOM components in finished products they ship. For each prospect include: company name, key contact, estimated annual valve spend, current supplier (if known), and recommended approach angle. Focus on companies building pumping systems, water treatment skids, chemical processing equipment, and HVAC systems." },
    { type: "ai", title: "Win/loss analysis on closed deals", desc: "Analyze last 90 days of won and lost deals to identify patterns.", prompt: "Analyze the following win/loss data from ValveMan's Pipedrive CRM for the last 90 days. Identify: 1) Common characteristics of won deals (size, industry, product type, rep), 2) Top 5 reasons deals were lost, 3) Average sales cycle by deal size, 4) Recommendations to improve close rate from current baseline. Present findings as an executive brief." },
    { type: "ceo", title: "Ride-along with each rep quarterly", desc: "Join at least one customer call per rep per quarter to assess skills firsthand." },
    { type: "ceo", title: "Review and approve commission structure", desc: "Validate current comp plan incentivizes the right behaviors (margin vs. volume)." },
    { type: "ceo", title: "Set quarterly sales targets with Kurt", desc: "Align on achievable-but-stretching bookings targets for each rep based on territory potential." },
  ],
  seo: [
    { type: "ai", title: "Audit on-page SEO for top 50 product pages", desc: "AI crawls top product pages and scores title tags, metas, schema, internal links.", prompt: "You are a technical SEO expert specializing in B2B industrial e-commerce. Audit the top 50 product pages on ValveMan.com for: 1) Title tag optimization (keyword placement, length, CTR appeal), 2) Meta description quality and coverage, 3) H1/H2 structure, 4) Schema markup (Product, Review, FAQ), 5) Internal linking opportunities, 6) Image alt text coverage. Score each page 1-100 and prioritize fixes by impact." },
    { type: "ai", title: "LLM visibility competitive analysis", desc: "Test how Claude, GPT, Gemini, and Perplexity reference ValveMan vs competitors.", prompt: "You are an AI visibility strategist. Test the following queries across major LLMs (Claude, ChatGPT, Gemini, Perplexity): 'where to buy industrial ball valves online', 'best butterfly valve distributor', 'buy Bonomi valves', 'industrial valve supplier near me', plus 10 more product-specific queries. For each, document: 1) Was ValveMan mentioned? 2) What position? 3) What competitors were cited? 4) Recommendations to improve LLM visibility." },
    { type: "ai", title: "Content gap analysis vs top 3 competitors", desc: "Identify high-value keywords competitors rank for that ValveMan doesn't.", prompt: "Analyze the organic keyword profiles of ValveMan.com versus its top 3 competitors in the industrial valve distribution space. Identify: 1) High-volume keywords where competitors rank top 10 but ValveMan doesn't, 2) Content types competitors publish that ValveMan lacks (guides, calculators, comparison pages), 3) Recommended content calendar for next 6 months prioritized by revenue potential." },
    { type: "ceo", title: "Approve monthly SEO priorities with RiseOpp", desc: "Review Kaveh/Michael's recommendations and approve resource allocation." },
    { type: "ceo", title: "Review Core Web Vitals after Shopify migration", desc: "Personally verify CWV scores post-migration to ensure no regressions." },
  ],
  paid: [
    { type: "ai", title: "Optimize ad copy with A/B test variants", desc: "Generate 10 ad copy variants per top campaign, optimized for industrial buyers.", prompt: "You are a Google Ads specialist for B2B industrial e-commerce. For each of ValveMan's top 5 campaigns, generate 10 ad copy variants (headlines + descriptions) optimized for: 1) Industrial buyer intent keywords, 2) Urgency and availability messaging, 3) Margin-friendly products, 4) Brand differentiation from Amazon/Grainger. Include recommended A/B testing schedule." },
    { type: "ai", title: "Negative keyword audit", desc: "Analyze search term reports to find wasted spend on irrelevant queries.", prompt: "Analyze ValveMan's Google Ads search term reports for the last 90 days. Identify: 1) Irrelevant search terms consuming budget (residential, DIY, plumbing supply, etc.), 2) Recommended negative keyword list by campaign, 3) Estimated monthly savings, 4) New keyword opportunities discovered from search terms." },
    { type: "ai", title: "Brand performance deep-dive", desc: "Analyze which valve brands drive highest ROAS and margin.", prompt: "Analyze ValveMan's paid search performance by brand/manufacturer for the last 6 months. For each brand, calculate: ROAS, average order value, cost per conversion, estimated margin, and lifetime value of customers acquired. Recommend budget reallocation strategy to maximize profitable revenue." },
    { type: "ceo", title: "Set monthly paid search budget", desc: "Review ROAS targets and approve budget based on cash flow and growth goals." },
    { type: "ceo", title: "Approve new campaign launches", desc: "Review and greenlight any new campaign types (Shopping, Performance Max, etc.)." },
  ],
  email: [
    { type: "ai", title: "Segment analysis and cleanup", desc: "AI analyzes list health, identifies dead subscribers, and recommends segments.", prompt: "You are an email marketing strategist for B2B industrial e-commerce using Klaviyo. Analyze ValveMan's email list and recommend: 1) Segment definitions for key buyer personas (facility managers, contractors, OEMs, purchasing agents), 2) Re-engagement campaign for subscribers inactive 90+ days, 3) Sunset policy for truly dead contacts, 4) List hygiene recommendations, 5) Predicted impact on deliverability and revenue." },
    { type: "ai", title: "Build automated flow recommendations", desc: "Design email automation flows (welcome, abandoned cart, post-purchase, win-back).", prompt: "Design a complete email automation strategy for ValveMan.com in Klaviyo. Include: 1) Welcome series (3-5 emails for new B2B subscribers), 2) Abandoned cart flow optimized for high-AOV industrial purchases, 3) Post-purchase flow with cross-sell/upsell based on product category, 4) Win-back flow for customers who haven't ordered in 90/180/365 days, 5) Reorder reminder flow based on typical product lifecycle. Include subject lines, timing, and content briefs for each email." },
    { type: "ceo", title: "Approve monthly email calendar", desc: "Review campaign themes, promotions, and send frequency for the month." },
    { type: "ceo", title: "Review unsubscribe trends quarterly", desc: "Ensure send frequency and content aren't eroding the list." },
  ],
};

const CALENDAR_ITEMS = [
  { cadence: "Weekly", items: [
    { title: "Review daily standup notes from Kurt", type: "ceo", day: "Monday" },
    { title: "Check pipeline movement in Pipedrive", type: "ceo", day: "Monday" },
    { title: "Review AI call analysis reports", type: "ai", day: "Tuesday" },
    { title: "Check CWV scores", type: "ai", day: "Wednesday" },
    { title: "Review paid search spend pacing", type: "ceo", day: "Wednesday" },
    { title: "Email campaign performance review", type: "ai", day: "Thursday" },
    { title: "Friday CEO scorecard review", type: "ceo", day: "Friday" },
  ]},
  { cadence: "Monthly", items: [
    { title: "Monthly P&L review by channel", type: "ceo", week: "Week 1" },
    { title: "SEO priority review with RiseOpp (Kaveh)", type: "ceo", week: "Week 1" },
    { title: "Sales team 1-on-1s with Kurt (review coaching)", type: "ceo", week: "Week 2" },
    { title: "Content calendar approval", type: "ceo", week: "Week 2" },
    { title: "Email marketing calendar approval", type: "ceo", week: "Week 2" },
    { title: "Paid search budget & ROAS review", type: "ceo", week: "Week 3" },
    { title: "AI competitor analysis refresh", type: "ai", week: "Week 3" },
    { title: "Domain authority & link building progress check", type: "ai", week: "Week 4" },
    { title: "LLM visibility test", type: "ai", week: "Week 4" },
    { title: "Monthly close — review bookings vs target", type: "ceo", week: "Week 4" },
  ]},
  { cadence: "Quarterly", items: [
    { title: "Quarterly business review (all channels)", type: "ceo" },
    { title: "Sales comp plan review", type: "ceo" },
    { title: "Customer retention analysis", type: "ai" },
    { title: "Full technical SEO audit", type: "ai" },
    { title: "Rep ride-alongs (1 per rep)", type: "ceo" },
    { title: "Competitive landscape analysis", type: "ai" },
    { title: "Email list health audit", type: "ai" },
    { title: "Paid search account structure review", type: "ceo" },
    { title: "Pricing and margin analysis by product category", type: "ai" },
    { title: "Review and update sales playbook", type: "ceo" },
  ]},
  { cadence: "Annual", items: [
    { title: "Annual strategic plan & budget setting", type: "ceo" },
    { title: "Sales territory realignment", type: "ceo" },
    { title: "Full website UX audit", type: "ai" },
    { title: "Annual SEO strategy reset with RiseOpp", type: "ceo" },
    { title: "Vendor/supplier agreement reviews", type: "ceo" },
    { title: "Tech stack audit (tools, subscriptions, integrations)", type: "ai" },
    { title: "Customer satisfaction survey & NPS", type: "ai" },
    { title: "Insurance and compliance review", type: "ceo" },
  ]},
];

const DEFAULT_BRIEFING_PROMPT = `You are a fractional CEO advisor for ValveMan, a ~$10M B2B industrial valve distributor with ecommerce + direct sales, 3 sales reps (Josh, Cleon, Amr), a fractional sales manager (Kurt Hanusa), migrating from BigCommerce to Shopify Plus, SEO agency RiseOpp ($4,600/mo), Klaviyo for email, Google Ads for paid search, and Pipedrive CRM.

Provide a weekly CEO briefing with exactly 5 insights. For each insight, identify:
1. The channel (Sales / SEO / Paid / Email / Operations)
2. A specific action item
3. Priority level (Critical / High / Medium)
4. Whether AI can help execute it

Consider trends like: seasonal patterns in industrial distribution, common cash flow timing issues, competitive dynamics, team performance patterns, and digital marketing optimization opportunities.

Format as JSON array with fields: channel, insight, action, priority (Critical/High/Medium), ai_actionable (boolean). Return ONLY valid JSON, no markdown.`;

const DEFAULT_CALENDAR_PROMPT = `You are a CEO operations consultant for a B2B industrial valve distribution company called ValveMan (~$10M revenue, ecommerce + direct sales, 3 sales reps, migrating from BigCommerce to Shopify Plus, SEO agency partnership with RiseOpp). Suggest 5 additional calendar items this CEO should be doing that are NOT already on their calendar. Format as JSON array with fields: title, cadence (Weekly/Monthly/Quarterly/Annual), type (ceo or ai), rationale. Return ONLY valid JSON, no markdown.`;

// ─── HELPER COMPONENTS ──────────────────────────────────────────────────────

const formatValue = (val, unit) => {
  if (val === null || val === undefined) return "—";
  if (unit === "$") return `$${val.toLocaleString()}`;
  if (unit === "%") return `${val}%`;
  if (unit === "x") return `${val}x`;
  if (unit === "#") return val.toLocaleString();
  if (unit === "s") return `${val}s`;
  if (unit === "ms") return `${val}ms`;
  if (unit === "days") return `${val}d`;
  if (unit === "/10") return `${val}/10`;
  if (unit === "/100") return `${val}/100`;
  if (unit === "$/day") return `$${val.toLocaleString()}/day`;
  if (unit === "min") return `${val} min`;
  return `${val}${unit}`;
};

const StatusDot = ({ status, actual, target, direction }) => {
  let computedStatus = status;
  if (actual !== null && actual !== undefined && target !== null && target !== undefined) {
    const isLower = direction === "lower";
    const ratio = isLower ? target / actual : actual / target;
    if (ratio >= 1) computedStatus = "good";
    else if (ratio >= 0.9) computedStatus = "warn";
    else computedStatus = "bad";
  }
  const color = computedStatus === "good" ? COLORS.green : computedStatus === "warn" ? COLORS.yellow : computedStatus === "na" ? COLORS.textDim : COLORS.redBright;
  return <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: "50%", background: color, marginRight: 8, boxShadow: computedStatus === "good" ? `0 0 6px ${COLORS.green}66` : computedStatus === "bad" ? `0 0 6px ${COLORS.redBright}66` : "none" }} />;
};

const Badge = ({ children, color = COLORS.red }) => (
  <span style={{
    display: "inline-block", fontSize: 10, fontWeight: 700, letterSpacing: 1,
    textTransform: "uppercase", padding: "2px 8px", borderRadius: 3,
    background: `${color}22`, color: color, border: `1px solid ${color}44`,
  }}>{children}</span>
);

// Sparkline mini-chart for homepage cards
const Sparkline = ({ data, color = COLORS.redBright, width = 100, height = 28 }) => {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data) * 0.9;
  const max = Math.max(...data) * 1.1;
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x},${y}`;
  }).join(" ");
  const areaPoints = `0,${height} ${points} ${width},${height}`;
  const trending = data[data.length - 1] >= data[0];
  const lineColor = color;
  return (
    <svg width={width} height={height} style={{ display: "block" }}>
      <defs>
        <linearGradient id={`spark-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
          <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace('#','')})`} />
      <polyline points={points} fill="none" stroke={lineColor} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * width} cy={height - ((data[data.length-1] - min) / range) * height} r={2.5} fill={lineColor} />
    </svg>
  );
};

// Generate sparkline data (deterministic based on seed string)
const genSparkData = (seed, count = 12, base = 50, volatility = 0.15, trendUp = true) => {
  const hash = seed.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = (i) => { const x = Math.sin(hash * 9301 + i * 49297) * 49297; return x - Math.floor(x); };
  const data = [];
  let val = base;
  for (let i = 0; i < count; i++) {
    const noise = (rng(i) - 0.5) * base * volatility;
    const trend = trendUp ? base * 0.01 : -base * 0.005;
    val = Math.max(val + noise + trend, base * 0.3);
    data.push(Math.round(val * 100) / 100);
  }
  return data;
};

// Animation CSS injected once
const AnimationStyles = () => (
  <style>{`
    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideInRight {
      from { opacity: 0; transform: translateX(12px); }
      to { opacity: 1; transform: translateX(0); }
    }
    @keyframes pulseGlow {
      0%, 100% { box-shadow: 0 0 0 0 rgba(196,30,36,0); }
      50% { box-shadow: 0 0 12px 2px rgba(196,30,36,0.15); }
    }
    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }
    .vm-card {
      animation: fadeInUp 0.4s ease-out both;
    }
    .vm-card:hover {
      border-color: ${COLORS.red}66 !important;
      box-shadow: 0 4px 24px rgba(0,0,0,0.3), 0 0 0 1px ${COLORS.red}22;
    }
    .vm-header {
      animation: fadeIn 0.3s ease-out;
    }
    .vm-section-title {
      animation: fadeIn 0.5s ease-out;
    }
    .vm-nav-btn:hover {
      background: ${COLORS.cardHover} !important;
    }
    .vm-suggestion:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }
    .vm-trend-btn:hover {
      border-color: ${COLORS.red} !important;
      color: ${COLORS.redBright} !important;
      background: ${COLORS.redGlow} !important;
    }
    .vm-summary-card {
      transition: all 0.25s ease;
    }
    .vm-summary-card:hover {
      border-color: ${COLORS.red} !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 0 20px ${COLORS.redGlow};
    }
    .vm-modal-overlay {
      animation: fadeIn 0.2s ease-out;
    }
    .vm-modal-content {
      animation: fadeInUp 0.3s ease-out;
    }
    .vm-awaiting {
      background: linear-gradient(90deg, ${COLORS.textDim}00, ${COLORS.textDim}33, ${COLORS.textDim}00);
      background-size: 200% 100%;
      animation: shimmer 3s ease-in-out infinite;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    /* Responsive */
    @media (max-width: 900px) {
      .vm-header-inner {
        flex-direction: column !important;
        gap: 12px !important;
        align-items: flex-start !important;
      }
      .vm-nav-scroll {
        width: 100% !important;
        overflow-x: auto !important;
        -webkit-overflow-scrolling: touch;
      }
      .vm-main-content {
        padding: 14px 12px !important;
      }
      .vm-grid-home {
        grid-template-columns: 1fr !important;
      }
      .vm-suggestion-grid {
        grid-template-columns: 1fr !important;
      }
      .vm-sub-tab-row {
        flex-wrap: wrap !important;
      }
      .vm-trend-stats {
        grid-template-columns: 1fr 1fr !important;
      }
      .vm-coaching-grid {
        grid-template-columns: 1fr !important;
      }
      .vm-cost-grid {
        grid-template-columns: 1fr !important;
      }
      .vm-profitability-table {
        display: block !important;
        overflow-x: auto !important;
      }
      .vm-cal-actions {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
      .vm-cal-add-form {
        flex-direction: column !important;
      }
    }
    @media (max-width: 600px) {
      .vm-kpi-table-wrap {
        display: block !important;
        overflow-x: auto !important;
      }
    }
    /* Scrollbar */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: ${COLORS.bg}; }
    ::-webkit-scrollbar-thumb { background: ${COLORS.border}; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: ${COLORS.textDim}; }
  `}</style>
);

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function ValveManCommandCenter() {
  const [activeTab, setActiveTab] = useState("home");
  const [agentModal, setAgentModal] = useState(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentResult, setAgentResult] = useState(null);
  const [calendarCustomItems, setCalendarCustomItems] = useState([]);
  const [newCalItem, setNewCalItem] = useState({ title: "", cadence: "Monthly", type: "ceo" });
  const [showAddCal, setShowAddCal] = useState(false);
  const [aiCalSuggestions, setAiCalSuggestions] = useState(null);
  const [aiCalLoading, setAiCalLoading] = useState(false);
  const [salesSubTab, setSalesSubTab] = useState("team");
  const [seoSubTab, setSeoSubTab] = useState("overview");
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [trendModal, setTrendModal] = useState(null);
  const [trendRange, setTrendRange] = useState("6mo");

  // ─── EDITABLE PROMPTS STATE ────────────────────────────────────────────
  const [customPrompts, setCustomPrompts] = useState(() => {
    const saved = {};
    Object.entries(AI_SUGGESTIONS).forEach(([seg, items]) => {
      items.filter(s => s.type === "ai").forEach(s => {
        saved[`${seg}:${s.title}`] = s.prompt;
      });
    });
    return saved;
  });
  const [editingPromptKey, setEditingPromptKey] = useState(null);
  const [editingPromptText, setEditingPromptText] = useState("");

  const startEditPrompt = (seg, suggestion) => {
    const key = `${seg}:${suggestion.title}`;
    setEditingPromptKey(key);
    setEditingPromptText(customPrompts[key] || suggestion.prompt);
  };
  const savePrompt = () => {
    if (editingPromptKey === "__briefing__") {
      setBriefingPrompt(editingPromptText);
    } else if (editingPromptKey === "__calendar__") {
      setCalendarPrompt(editingPromptText);
    } else if (editingPromptKey) {
      setCustomPrompts(prev => ({ ...prev, [editingPromptKey]: editingPromptText }));
    }
    setEditingPromptKey(null);
  };
  const getPrompt = (seg, suggestion) => customPrompts[`${seg}:${suggestion.title}`] || suggestion.prompt;

  // Editable system prompts (briefing + calendar)
  const [briefingPrompt, setBriefingPrompt] = useState(DEFAULT_BRIEFING_PROMPT);
  const [calendarPrompt, setCalendarPrompt] = useState(DEFAULT_CALENDAR_PROMPT);

  // ─── WEEKLY AUTO-INSIGHTS ──────────────────────────────────────────────
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [lastInsightsRun, setLastInsightsRun] = useState(null);

  const runInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: briefingPrompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "[]";
      const cleaned = text.replace(/```json|```/g, "").trim();
      setInsights(JSON.parse(cleaned));
      setLastInsightsRun(new Date().toISOString());
    } catch (err) {
      setInsights([{ channel: "System", insight: "Failed to generate insights", action: "Check API connection", priority: "High", ai_actionable: false }]);
    }
    setInsightsLoading(false);
  }, [briefingPrompt]);

  // Auto-run insights on mount if stale (7+ days or never run)
  useEffect(() => {
    if (!lastInsightsRun) {
      runInsights();
    } else {
      const daysSince = (Date.now() - new Date(lastInsightsRun).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince >= 7) runInsights();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── ACTION TRACKING ───────────────────────────────────────────────────
  const [actionStates, setActionStates] = useState({}); // key: "seg:title" => "done" | "snoozed" | "dismissed" | null
  const setActionState = (seg, title, state) => {
    setActionStates(prev => ({ ...prev, [`${seg}:${title}`]: state }));
  };
  const getActionState = (seg, title) => actionStates[`${seg}:${title}`] || null;

  // ─── KPI NOTES ─────────────────────────────────────────────────────────
  const [kpiNotes, setKpiNotes] = useState({}); // key: kpi.id => string
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editingNoteText, setEditingNoteText] = useState("");

  // ─── TIME TRACKING ─────────────────────────────────────────────────────
  const [timeEntries, setTimeEntries] = useState([]);
  const [newTimeEntry, setNewTimeEntry] = useState({ category: "Unique Ability", hours: "", description: "", date: new Date().toISOString().split("T")[0] });
  const TIME_CATEGORIES = ["Unique Ability", "Sales Management", "Marketing/SEO", "Operations", "Admin/Email", "Meetings", "Strategic Planning"];
  const WEEKLY_GOAL = 20;

  const currentWeekEntries = useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    return timeEntries.filter(e => new Date(e.date) >= startOfWeek);
  }, [timeEntries]);

  const totalHoursThisWeek = useMemo(() =>
    currentWeekEntries.reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0),
  [currentWeekEntries]);

  const uniqueAbilityHours = useMemo(() =>
    currentWeekEntries.filter(e => e.category === "Unique Ability").reduce((sum, e) => sum + (parseFloat(e.hours) || 0), 0),
  [currentWeekEntries]);

  const addTimeEntry = () => {
    if (newTimeEntry.hours && parseFloat(newTimeEntry.hours) > 0) {
      setTimeEntries(prev => [...prev, { ...newTimeEntry, id: Date.now() }]);
      setNewTimeEntry({ category: "Unique Ability", hours: "", description: "", date: new Date().toISOString().split("T")[0] });
    }
  };

  // ─── ALERTS CONFIG ─────────────────────────────────────────────────────
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  // ─── SCORECARD GRADING ─────────────────────────────────────────────────
  // When actuals are connected, this computes a grade per channel.
  // For now, shows the framework with placeholder grades.
  const getChannelGrade = (channelKpis) => {
    // With real data: compare each actual to target, compute % of KPIs hitting target
    // 90%+ = A, 80-89% = B, 70-79% = C, 60-69% = D, <60% = F
    // For now return placeholder
    return { grade: "—", pct: null, met: 0, total: channelKpis.length };
  };

  const gradeColor = (grade) => {
    if (grade === "A") return COLORS.green;
    if (grade === "B") return "#22D3EE";
    if (grade === "C") return COLORS.yellow;
    if (grade === "D") return "#F97316";
    if (grade === "F") return COLORS.redBright;
    return COLORS.textDim;
  };

  // Generate mock trend data based on cadence and benchmark
  const generateTrendData = useCallback((kpi, range) => {
    const seed = kpi.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (i) => {
      const x = Math.sin(seed * 9301 + i * 49297) * 49297;
      return x - Math.floor(x);
    };
    const isLower = kpi.direction === "lower";
    const bm = kpi.benchmark;
    const periods = range === "3mo" ? 12 : range === "6mo" ? 24 : range === "1yr" ? 12 : 4;
    const labels = [];
    const now = new Date(2026, 2, 29);
    
    for (let i = periods - 1; i >= 0; i--) {
      const d = new Date(now);
      if (range === "3mo") {
        d.setDate(d.getDate() - i * 7);
        labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
      } else if (range === "6mo") {
        d.setDate(d.getDate() - i * 7);
        labels.push(d.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
      } else if (range === "1yr") {
        d.setMonth(d.getMonth() - i);
        labels.push(d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }));
      } else {
        d.setMonth(d.getMonth() - i * 3);
        labels.push("Q" + (Math.floor(d.getMonth() / 3) + 1) + " " + d.getFullYear());
      }
    }

    return labels.map((label, i) => {
      const noise = (rng(i) - 0.5) * bm * 0.4;
      const trend = isLower ? bm * 1.15 - (i / periods) * bm * 0.25 : bm * 0.75 + (i / periods) * bm * 0.35;
      let val = trend + noise;
      if (kpi.unit === "%" && val > 100) val = 98;
      if (val < 0) val = Math.abs(val) * 0.3;
      val = kpi.unit === "$" || kpi.unit === "#" ? Math.round(val) : Math.round(val * 100) / 100;
      return { period: label, value: val, benchmark: bm };
    });
  }, []);

  const trendData = useMemo(() => {
    if (!trendModal) return [];
    return generateTrendData(trendModal, trendRange);
  }, [trendModal, trendRange, generateTrendData]);

  const deployAgent = async (suggestion) => {
    setAgentModal(suggestion);
    setAgentLoading(true);
    setAgentResult(null);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: suggestion.prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("\n") || "No response received.";
      setAgentResult(text);
    } catch (err) {
      setAgentResult("Error connecting to AI agent. Check API configuration.");
    }
    setAgentLoading(false);
  };

  const requestCalSuggestions = async () => {
    setAiCalLoading(true);
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: calendarPrompt }],
        }),
      });
      const data = await response.json();
      const text = data.content?.map(b => b.text || "").join("") || "[]";
      const cleaned = text.replace(/```json|```/g, "").trim();
      setAiCalSuggestions(JSON.parse(cleaned));
    } catch (err) {
      setAiCalSuggestions([{ title: "Error getting suggestions", cadence: "Monthly", type: "ai", rationale: "API error" }]);
    }
    setAiCalLoading(false);
  };

  const copyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const addCalItem = () => {
    if (newCalItem.title.trim()) {
      setCalendarCustomItems([...calendarCustomItems, { ...newCalItem }]);
      setNewCalItem({ title: "", cadence: "Monthly", type: "ceo" });
      setShowAddCal(false);
    }
  };

  const acceptCalSuggestion = (suggestion) => {
    setCalendarCustomItems([...calendarCustomItems, { title: suggestion.title, cadence: suggestion.cadence, type: suggestion.type }]);
    setAiCalSuggestions(aiCalSuggestions.filter(s => s.title !== suggestion.title));
  };

  // ─── STYLES ─────────────────────────────────────────────────────────────
  const styles = {
    app: {
      fontFamily: "'Barlow', 'Segoe UI', sans-serif",
      background: COLORS.bg,
      color: COLORS.text,
      minHeight: "100vh",
      width: "100%",
    },
    header: {
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 24px", borderBottom: `1px solid ${COLORS.border}`,
      background: "#0F0F14",
    },
    logo: {
      display: "flex", alignItems: "center", gap: 12,
    },
    logoMark: {
      width: 36, height: 36, borderRadius: 6,
      background: `linear-gradient(135deg, ${COLORS.red}, ${COLORS.redDark})`,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontWeight: 900, fontSize: 16, color: COLORS.white, letterSpacing: -1,
    },
    logoText: {
      fontSize: 18, fontWeight: 700, color: COLORS.white, letterSpacing: 1,
    },
    logoSub: {
      fontSize: 11, color: COLORS.textMuted, letterSpacing: 2, textTransform: "uppercase",
    },
    nav: {
      display: "flex", gap: 2, background: COLORS.card, borderRadius: 8, padding: 3,
      overflowX: "auto",
    },
    navBtn: (active) => ({
      padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer",
      fontSize: 12, fontWeight: active ? 700 : 500, letterSpacing: 0.5,
      fontFamily: "'Barlow', sans-serif",
      background: active ? COLORS.red : "transparent",
      color: active ? COLORS.white : COLORS.textMuted,
      transition: "all 0.2s",
      whiteSpace: "nowrap",
    }),
    main: { padding: "20px 24px", maxWidth: 1400, margin: "0 auto" },
    sectionTitle: {
      fontSize: 20, fontWeight: 700, color: COLORS.white, marginBottom: 4,
    },
    sectionSub: {
      fontSize: 13, color: COLORS.textMuted, marginBottom: 20,
    },
    grid4: {
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 24,
    },
    card: {
      background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 10,
      padding: 20, transition: "border-color 0.2s",
    },
    cardTitle: {
      fontSize: 11, fontWeight: 600, color: COLORS.textMuted, textTransform: "uppercase",
      letterSpacing: 1.5, marginBottom: 12,
    },
    kpiRow: {
      display: "flex", justifyContent: "space-between", alignItems: "center",
      padding: "8px 0", borderBottom: `1px solid ${COLORS.border}11`,
    },
    kpiLabel: { fontSize: 13, color: COLORS.textMuted, flex: 1 },
    kpiBenchmark: { fontSize: 11, color: COLORS.textDim, width: 80, textAlign: "center" },
    kpiActual: { fontSize: 14, fontWeight: 700, color: COLORS.white, width: 80, textAlign: "right" },
    suggestionCard: (type) => ({
      background: type === "ai" ? `${COLORS.blue}08` : `${COLORS.yellow}08`,
      border: `1px solid ${type === "ai" ? COLORS.blue : COLORS.yellow}22`,
      borderRadius: 10, padding: 16, marginBottom: 10,
    }),
    btn: (bg = COLORS.red) => ({
      padding: "8px 16px", borderRadius: 6, border: "none", cursor: "pointer",
      fontSize: 12, fontWeight: 600, fontFamily: "'Barlow', sans-serif",
      background: bg, color: COLORS.white, transition: "opacity 0.2s",
    }),
    btnOutline: {
      padding: "8px 16px", borderRadius: 6, border: `1px solid ${COLORS.border}`,
      background: "transparent", color: COLORS.textMuted, cursor: "pointer",
      fontSize: 12, fontWeight: 600, fontFamily: "'Barlow', sans-serif",
    },
    modal: {
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20,
    },
    modalContent: {
      background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12,
      padding: 28, maxWidth: 700, width: "100%", maxHeight: "80vh", overflowY: "auto",
    },
    table: {
      width: "100%", borderCollapse: "collapse", fontSize: 13,
    },
    th: {
      textAlign: "left", padding: "10px 12px", borderBottom: `2px solid ${COLORS.border}`,
      fontSize: 11, fontWeight: 700, color: COLORS.textMuted, textTransform: "uppercase",
      letterSpacing: 1,
    },
    td: {
      padding: "10px 12px", borderBottom: `1px solid ${COLORS.border}22`,
      color: COLORS.text,
    },
    subTabRow: {
      display: "flex", gap: 8, marginBottom: 20,
    },
    subTab: (active) => ({
      padding: "6px 14px", borderRadius: 20, border: `1px solid ${active ? COLORS.red : COLORS.border}`,
      background: active ? `${COLORS.red}22` : "transparent",
      color: active ? COLORS.redBright : COLORS.textMuted,
      cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Barlow', sans-serif",
    }),
    calItem: (type) => ({
      display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
      background: type === "ai" ? `${COLORS.blue}08` : `${COLORS.card}`,
      border: `1px solid ${COLORS.border}`,
      borderLeft: `3px solid ${type === "ai" ? COLORS.blue : COLORS.yellow}`,
      borderRadius: 6, marginBottom: 6, fontSize: 13,
    }),
  };

  // ─── KPI TABLE RENDERER ────────────────────────────────────────────────
  const renderKpiTable = (kpis, title) => (
    <div className="vm-card" style={styles.card}>
      <div style={styles.cardTitle}>{title}</div>
      <div className="vm-kpi-table-wrap" style={{ overflowX: "auto" }}>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>KPI</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Target</th>
            <th style={{ ...styles.th, textAlign: "right" }}>Actual</th>
            <th style={{ ...styles.th, textAlign: "center", fontSize: 10 }}>MoM</th>
            <th style={{ ...styles.th, textAlign: "center", fontSize: 10 }}>YoY</th>
            <th style={{ ...styles.th, textAlign: "center" }}>Cadence</th>
            <th style={{ ...styles.th, textAlign: "center", minWidth: 120 }}>Notes</th>
            <th style={{ ...styles.th, textAlign: "center", width: 50 }}>Trend</th>
          </tr>
        </thead>
        <tbody>
          {kpis.map(k => {
            const showTrend = k.cadence !== "Daily" && k.cadence !== "Per Send";
            const note = kpiNotes[k.id] || "";
            const isEditingNote = editingNoteId === k.id;
            return (
              <tr key={k.id}>
                <td style={styles.td}>
                  <StatusDot status="na" />
                  {k.label}
                  <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 1 }}>{k.source}</div>
                </td>
                <td style={{ ...styles.td, textAlign: "center", color: COLORS.textDim }}>
                  {formatValue(k.benchmark, k.unit)}
                </td>
                <td style={{ ...styles.td, textAlign: "right", fontWeight: 700 }}>
                  <span className="vm-awaiting">Awaiting</span>
                </td>
                <td style={{ ...styles.td, textAlign: "center", fontSize: 12, color: COLORS.textDim }}>—</td>
                <td style={{ ...styles.td, textAlign: "center", fontSize: 12, color: COLORS.textDim }}>—</td>
                <td style={{ ...styles.td, textAlign: "center", fontSize: 11, color: COLORS.textDim }}>
                  {k.cadence}
                </td>
                <td style={{ ...styles.td, textAlign: "left", padding: "6px 8px" }}>
                  {isEditingNote ? (
                    <div style={{ display: "flex", gap: 4 }}>
                      <input
                        autoFocus
                        value={editingNoteText}
                        onChange={e => setEditingNoteText(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") { setKpiNotes(prev => ({...prev, [k.id]: editingNoteText})); setEditingNoteId(null); } if (e.key === "Escape") setEditingNoteId(null); }}
                        style={{ flex: 1, padding: "4px 6px", borderRadius: 4, border: `1px solid ${COLORS.blue}`, background: COLORS.bg, color: COLORS.text, fontSize: 11, fontFamily: "'Barlow', sans-serif", minWidth: 80 }}
                      />
                      <button style={{ background: COLORS.green, border: "none", borderRadius: 3, color: "#fff", fontSize: 10, cursor: "pointer", padding: "2px 6px" }}
                        onClick={() => { setKpiNotes(prev => ({...prev, [k.id]: editingNoteText})); setEditingNoteId(null); }}>✓</button>
                    </div>
                  ) : (
                    <div style={{ cursor: "pointer", fontSize: 11, color: note ? COLORS.textMuted : COLORS.textDim, minHeight: 18 }}
                      onClick={() => { setEditingNoteId(k.id); setEditingNoteText(note); }}>
                      {note || <span style={{ fontStyle: "italic", opacity: 0.5 }}>+ add note</span>}
                    </div>
                  )}
                </td>
                <td style={{ ...styles.td, textAlign: "center" }}>
                  {showTrend && (
                    <button className="vm-trend-btn" onClick={() => setTrendModal(k)}
                      style={{ background: "transparent", border: `1px solid ${COLORS.border}`, borderRadius: 4, padding: "4px 8px", cursor: "pointer", color: COLORS.textMuted, fontSize: 12, fontFamily: "'Barlow', sans-serif", transition: "all 0.2s" }}>
                      📈
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      </div>
    </div>
  );

  // ─── SUGGESTIONS RENDERER ──────────────────────────────────────────────
  const renderSuggestions = (segment) => {
    const items = AI_SUGGESTIONS[segment] || [];
    const aiItems = items.filter(s => s.type === "ai");
    const ceoItems = items.filter(s => s.type === "ceo");

    const ActionBar = ({ seg, title }) => {
      const state = getActionState(seg, title);
      if (state === "done") return <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}><span style={{ fontSize: 11, color: COLORS.green, fontWeight: 600 }}>✓ Done</span><button style={{ fontSize: 10, color: COLORS.textDim, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => setActionState(seg, title, null)}>undo</button></div>;
      if (state === "snoozed") return <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}><span style={{ fontSize: 11, color: COLORS.yellow, fontWeight: 600 }}>⏸ Snoozed</span><button style={{ fontSize: 10, color: COLORS.textDim, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => setActionState(seg, title, null)}>undo</button></div>;
      if (state === "dismissed") return <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}><span style={{ fontSize: 11, color: COLORS.textDim, fontWeight: 600 }}>✗ Dismissed</span><button style={{ fontSize: 10, color: COLORS.textDim, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }} onClick={() => setActionState(seg, title, null)}>undo</button></div>;
      return (
        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
          <button onClick={() => setActionState(seg, title, "done")} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `1px solid ${COLORS.green}44`, background: `${COLORS.green}11`, color: COLORS.green, cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>✓ Done</button>
          <button onClick={() => setActionState(seg, title, "snoozed")} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `1px solid ${COLORS.yellow}44`, background: `${COLORS.yellow}11`, color: COLORS.yellow, cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>⏸ Snooze</button>
          <button onClick={() => setActionState(seg, title, "dismissed")} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 4, border: `1px solid ${COLORS.textDim}44`, background: "transparent", color: COLORS.textDim, cursor: "pointer", fontFamily: "'Barlow', sans-serif", fontWeight: 600 }}>✗ Dismiss</button>
        </div>
      );
    };

    return (
      <div className="vm-suggestion-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
        <div>
          <div style={{ ...styles.cardTitle, color: COLORS.blue, marginBottom: 16 }}>
            🤖 What AI Can Do For You
          </div>
          {aiItems.map((s, i) => {
            const state = getActionState(segment, s.title);
            return (
              <div key={i} className="vm-suggestion" style={{ ...styles.suggestionCard("ai"), transition: "all 0.2s ease", opacity: state === "dismissed" ? 0.4 : 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.white, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 10 }}>{s.desc}</div>
                {state !== "done" && state !== "dismissed" && (
                  <div style={{ display: "flex", gap: 6 }}>
                    <button style={styles.btn(COLORS.blue)} onClick={() => deployAgent({ ...s, prompt: getPrompt(segment, s) })}>
                      ⚡ Deploy Agent
                    </button>
                    <button style={{ ...styles.btnOutline, fontSize: 11 }} onClick={() => startEditPrompt(segment, s)}>
                      ✏️ Edit Prompt
                    </button>
                  </div>
                )}
                <ActionBar seg={segment} title={s.title} />
              </div>
            );
          })}
        </div>
        <div>
          <div style={{ ...styles.cardTitle, color: COLORS.yellow, marginBottom: 16 }}>
            👤 CEO Must-Do Actions
          </div>
          {ceoItems.map((s, i) => {
            const state = getActionState(segment, s.title);
            return (
              <div key={i} className="vm-suggestion" style={{ ...styles.suggestionCard("ceo"), transition: "all 0.2s ease", opacity: state === "dismissed" ? 0.4 : 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: COLORS.white, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{s.desc}</div>
                <ActionBar seg={segment} title={s.title} />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── HOME TAB ──────────────────────────────────────────────────────────
  const renderHome = () => (
    <>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <div>
          <div className="vm-section-title" style={styles.sectionTitle}>Command Center Overview</div>
          <div style={styles.sectionSub}>
            Headline KPIs across all channels • Data sources: GA4, Pipedrive, Klaviyo, Google Ads
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {lastInsightsRun && (
            <span style={{ fontSize: 10, color: COLORS.textDim }}>
              Last analysis: {new Date(lastInsightsRun).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
            </span>
          )}
          <button style={styles.btn(COLORS.blue)} onClick={runInsights} disabled={insightsLoading}>
            {insightsLoading ? "⏳ Analyzing..." : "🧠 Run Weekly Analysis"}
          </button>
        </div>
      </div>

      {/* 🚨 What's Broken — Alert Banner */}
      {alertsEnabled && (
        <div className="vm-card" style={{ ...styles.card, marginBottom: 24, borderColor: `${COLORS.redBright}33`, borderLeft: `3px solid ${COLORS.redBright}`, background: `${COLORS.redBright}06` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div style={{ ...styles.cardTitle, color: COLORS.redBright, marginBottom: 0 }}>
              🚨 What Needs Attention
            </div>
            <div style={{ fontSize: 10, color: COLORS.textDim }}>
              Alerts auto-populate when KPI actuals are connected. Configure thresholds in your Google Sheet.
            </div>
          </div>
          <div style={{ padding: 16, textAlign: "center", color: COLORS.textDim, fontSize: 13, border: `1px dashed ${COLORS.border}`, borderRadius: 8 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
            <div style={{ fontWeight: 600, color: COLORS.textMuted }}>Awaiting data connection</div>
            <div style={{ fontSize: 12, marginTop: 4 }}>When actuals flow in, any KPI that's red or yellow will surface here — sorted by severity. No news is good news.</div>
          </div>
        </div>
      )}

      {/* Weekly AI Insights */}
      {(insights || insightsLoading) && (
        <div className="vm-card" style={{ ...styles.card, marginBottom: 24, borderColor: `${COLORS.blue}33`, borderLeft: `3px solid ${COLORS.blue}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ ...styles.cardTitle, color: COLORS.blue, marginBottom: 0 }}>
              🧠 Weekly CEO Briefing — AI Insights
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button style={{ ...styles.btnOutline, fontSize: 11, padding: "4px 10px" }}
                onClick={() => { setEditingPromptKey("__briefing__"); setEditingPromptText(briefingPrompt); }}>
                ✏️ Edit Prompt
              </button>
              <Badge color={COLORS.blue}>Auto-generated</Badge>
            </div>
          </div>
          {insightsLoading ? (
            <div style={{ padding: 20, textAlign: "center", color: COLORS.textMuted }}>
              <div className="vm-awaiting" style={{ fontSize: 14 }}>Analyzing your business data and generating insights...</div>
            </div>
          ) : insights && insights.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 0",
              borderBottom: i < insights.length - 1 ? `1px solid ${COLORS.border}22` : "none",
            }}>
              <div style={{
                minWidth: 70, padding: "3px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700,
                textAlign: "center", letterSpacing: 0.5, textTransform: "uppercase",
                background: item.priority === "Critical" ? `${COLORS.redBright}22` : item.priority === "High" ? `${COLORS.yellow}22` : `${COLORS.green}22`,
                color: item.priority === "Critical" ? COLORS.redBright : item.priority === "High" ? COLORS.yellow : COLORS.green,
                border: `1px solid ${item.priority === "Critical" ? COLORS.redBright : item.priority === "High" ? COLORS.yellow : COLORS.green}33`,
              }}>
                {item.priority}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.white, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: COLORS.textDim, marginRight: 8, textTransform: "uppercase", letterSpacing: 1 }}>{item.channel}</span>
                  {item.insight}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted }}>{item.action}</div>
              </div>
              <div>
                {item.ai_actionable ? (
                  <Badge color={COLORS.blue}>AI Ready</Badge>
                ) : (
                  <Badge color={COLORS.yellow}>CEO</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Cards */}
      <div className="vm-grid-home" style={styles.grid4}>
        {[
          { title: "Direct Sales", icon: "💼", kpis: [
            { label: "Team Bookings", benchmark: "$225K/mo", spark: genSparkData("bookings", 12, 225000, 0.12, true) },
            { label: "Avg Margin", benchmark: "32%", spark: genSparkData("margin", 12, 32, 0.08, true) },
            { label: "90-Day Close Rate", benchmark: "25%", spark: genSparkData("close", 12, 25, 0.15, false) },
            { label: "Pipeline Value", benchmark: "$450K", spark: genSparkData("pipeline", 12, 450000, 0.1, true) },
          ], tab: "sales" },
          { title: "Organic SEO", icon: "🔍", kpis: [
            { label: "Organic Revenue", benchmark: "$80K/mo", spark: genSparkData("orgrev", 12, 80000, 0.1, true) },
            { label: "Domain Authority", benchmark: "35", spark: genSparkData("da", 12, 35, 0.03, true) },
            { label: "Keywords Top 10", benchmark: "150", spark: genSparkData("kw10", 12, 150, 0.1, true) },
            { label: "LLM Visibility", benchmark: "50/100", spark: genSparkData("llm", 12, 50, 0.15, true) },
          ], tab: "seo" },
          { title: "Paid Search", icon: "📣", kpis: [
            { label: "ROAS", benchmark: "5.0x", spark: genSparkData("roas", 12, 5, 0.12, true) },
            { label: "Channel Revenue", benchmark: "$40K/mo", spark: genSparkData("paidrev", 12, 40000, 0.15, true) },
            { label: "Cost/Conv", benchmark: "$35", spark: genSparkData("cpc", 12, 35, 0.1, false) },
            { label: "Impression Share", benchmark: "65%", spark: genSparkData("impr", 12, 65, 0.08, true) },
          ], tab: "paid" },
          { title: "Email Marketing", icon: "📧", kpis: [
            { label: "Email Revenue", benchmark: "$15K/mo", spark: genSparkData("emailrev", 12, 15000, 0.12, true) },
            { label: "Open Rate", benchmark: "25%", spark: genSparkData("open", 12, 25, 0.08, true) },
            { label: "Rev/Subscriber", benchmark: "$1.50", spark: genSparkData("revsub", 12, 1.5, 0.1, true) },
            { label: "List Growth", benchmark: "3%/mo", spark: genSparkData("listgr", 12, 3, 0.2, true) },
          ], tab: "email" },
        ].map((segment, si) => (
          <div key={segment.title} className="vm-card vm-summary-card"
            style={{ ...styles.card, cursor: "pointer", borderLeft: `3px solid ${COLORS.red}`, animationDelay: `${si * 0.08}s` }}
            onClick={() => setActiveTab(segment.tab)}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <div style={styles.cardTitle}>{segment.icon} {segment.title}</div>
              <div style={{ fontSize: 11, color: COLORS.red, fontWeight: 600 }}>View →</div>
            </div>
            {segment.kpis.map((kpi, j) => (
              <div key={j} style={{ ...styles.kpiRow, alignItems: "center" }}>
                <span style={{ ...styles.kpiLabel, flex: "1 1 auto" }}>
                  <StatusDot status="na" />{kpi.label}
                </span>
                <Sparkline data={kpi.spark} color={COLORS.redBright} width={72} height={22} />
                <span style={{ fontSize: 11, color: COLORS.textDim, marginLeft: 10, minWidth: 70, textAlign: "right" }}>{kpi.benchmark}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Channel Profitability Summary */}
      <div className="vm-card" style={{ ...styles.card, marginBottom: 24, overflowX: "auto" }}>
        <div style={styles.cardTitle}>Channel Profitability Summary</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Channel</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Revenue</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Channel Cost</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Gross Margin</th>
              <th style={{ ...styles.th, textAlign: "right" }}>Target Margin</th>
              <th style={{ ...styles.th, textAlign: "right" }}>CAC</th>
              <th style={{ ...styles.th, textAlign: "right" }}>LTV:CAC</th>
            </tr>
          </thead>
          <tbody>
            {CHANNEL_PROFITABILITY.map(ch => (
              <tr key={ch.channel}>
                <td style={styles.td}><StatusDot status="na" />{ch.channel}</td>
                <td style={{ ...styles.td, textAlign: "right", color: COLORS.textDim }}>—</td>
                <td style={{ ...styles.td, textAlign: "right", color: COLORS.textDim }}>—</td>
                <td style={{ ...styles.td, textAlign: "right", color: COLORS.textDim }}>—</td>
                <td style={{ ...styles.td, textAlign: "right", color: COLORS.textDim }}>{ch.benchmark_margin}%</td>
                <td style={{ ...styles.td, textAlign: "right", color: COLORS.textDim }}>—</td>
                <td style={{ ...styles.td, textAlign: "right", color: COLORS.textDim }}>—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* All Suggestions */}
      {["sales", "seo", "paid", "email"].map(seg => (
        <div key={seg} style={{ marginBottom: 30 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.white, marginBottom: 8, textTransform: "capitalize" }}>
            {seg === "sales" ? "Direct Sales" : seg === "seo" ? "Organic SEO" : seg === "paid" ? "Paid Search" : "Email Marketing"} — Suggestions
          </div>
          {renderSuggestions(seg)}
        </div>
      ))}
    </>
  );

  // ─── SALES TAB ─────────────────────────────────────────────────────────
  const renderSales = () => (
    <>
      <div style={styles.sectionTitle}>Direct Sales</div>
      <div style={styles.sectionSub}>Rep performance, pipeline health, and coaching quality • Source: Pipedrive, Phone System, Fathom AI</div>

      <div className="vm-sub-tab-row" style={styles.subTabRow}>
        {[
          { id: "team", label: "Team Overview" },
          ...SALES_REPS.map(r => ({ id: r.toLowerCase(), label: r })),
          { id: "manager", label: `Manager: ${SALES_MANAGER}` },
        ].map(t => (
          <button key={t.id} style={styles.subTab(salesSubTab === t.id)} onClick={() => setSalesSubTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {salesSubTab === "team" && (
        <>
          <div className="vm-card" style={{ ...styles.card, marginBottom: 20, overflowX: "auto" }}>
            <div style={styles.cardTitle}>Team Performance Matrix</div>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>KPI</th>
                  <th style={{ ...styles.th, textAlign: "center" }}>Benchmark</th>
                  {SALES_REPS.map(r => <th key={r} style={{ ...styles.th, textAlign: "center" }}>{r}</th>)}
                  <th style={{ ...styles.th, textAlign: "center", color: COLORS.red }}>Team Total</th>
                  <th style={{ ...styles.th, textAlign: "center", width: 60 }}>Trend</th>
                </tr>
              </thead>
              <tbody>
                {SALES_REP_KPIS.map(k => (
                  <tr key={k.id}>
                    <td style={styles.td}>{k.label}</td>
                    <td style={{ ...styles.td, textAlign: "center", color: COLORS.textDim }}>{formatValue(k.benchmark, k.unit)}</td>
                    {SALES_REPS.map(r => (
                      <td key={r} style={{ ...styles.td, textAlign: "center", color: COLORS.textDim }}>—</td>
                    ))}
                    <td style={{ ...styles.td, textAlign: "center", fontWeight: 700, color: COLORS.textDim }}>—</td>
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {k.cadence !== "Daily" && (
                        <button
                          onClick={() => setTrendModal(k)}
                          style={{
                            background: "transparent", border: `1px solid ${COLORS.border}`,
                            borderRadius: 4, padding: "4px 8px", cursor: "pointer",
                            color: COLORS.textMuted, fontSize: 12, fontFamily: "'Barlow', sans-serif",
                          }}
                          onMouseEnter={e => { e.target.style.borderColor = COLORS.red; e.target.style.color = COLORS.redBright; }}
                          onMouseLeave={e => { e.target.style.borderColor = COLORS.border; e.target.style.color = COLORS.textMuted; }}
                        >📈</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {renderSuggestions("sales")}
        </>
      )}

      {SALES_REPS.map(rep => salesSubTab === rep.toLowerCase() && (
        <div key={rep}>
          {renderKpiTable(SALES_REP_KPIS, `${rep} — Individual Performance`)}
        </div>
      ))}

      {salesSubTab === "manager" && (
        <>
          {renderKpiTable([...SALES_REP_KPIS.map(k => ({...k, label: `Team ${k.label}`})), ...MANAGER_EXTRA_KPIS], `${SALES_MANAGER} — Manager Dashboard`)}
          <div style={{ ...styles.card, marginTop: 16 }}>
            <div style={styles.cardTitle}>Coaching Quality Breakdown</div>
            <div className="vm-coaching-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {["Preparation & Agenda Setting", "Active Listening & Questioning", "Actionable Feedback Quality",
                "Rep Development Focus", "Data-Driven Coaching", "Follow-Up Consistency"].map(cat => (
                <div key={cat} style={{ padding: 14, background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
                  <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 6 }}>{cat}</div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textDim }}>—/10</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );

  // ─── SEO TAB ───────────────────────────────────────────────────────────
  const renderSEO = () => (
    <>
      <div style={styles.sectionTitle}>Organic SEO</div>
      <div style={styles.sectionSub}>Four pillars of SEO health + overall visibility • Sources: GA4, Search Console, Ahrefs, Screaming Frog, Otterly.ai</div>

      <div className="vm-sub-tab-row" style={styles.subTabRow}>
        {[
          { id: "overview", label: "Overall Metrics" },
          { id: "technical", label: "Technical SEO" },
          { id: "onpage", label: "On-Page SEO" },
          { id: "offpage", label: "Off-Page SEO" },
          { id: "content", label: "Content" },
        ].map(t => (
          <button key={t.id} style={styles.subTab(seoSubTab === t.id)} onClick={() => setSeoSubTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {seoSubTab === "overview" && (
        <>
          {renderKpiTable(SEO_OVERALL_KPIS, "Overall SEO Performance")}
          <div style={{ marginTop: 16 }}>{renderSuggestions("seo")}</div>
        </>
      )}
      {seoSubTab === "technical" && renderKpiTable(SEO_TECHNICAL_KPIS, "Technical SEO — Core Web Vitals & Infrastructure")}
      {seoSubTab === "onpage" && renderKpiTable(SEO_ONPAGE_KPIS, "On-Page SEO — Content Optimization")}
      {seoSubTab === "offpage" && renderKpiTable(SEO_OFFPAGE_KPIS, "Off-Page SEO — Link Building & Authority")}
      {seoSubTab === "content" && renderKpiTable(SEO_CONTENT_KPIS, "Content — Production & Performance")}
    </>
  );

  // ─── PAID SEARCH TAB ──────────────────────────────────────────────────
  const renderPaid = () => (
    <>
      <div style={styles.sectionTitle}>Paid Search</div>
      <div style={styles.sectionSub}>Google Ads performance, ROAS, and brand analysis • Source: Google Ads, GA4</div>
      {renderKpiTable(PAID_SEARCH_KPIS, "Paid Search KPIs")}
      <div style={{ marginTop: 16 }}>{renderSuggestions("paid")}</div>
    </>
  );

  // ─── EMAIL TAB ─────────────────────────────────────────────────────────
  const renderEmail = () => (
    <>
      <div style={styles.sectionTitle}>Email Marketing</div>
      <div style={styles.sectionSub}>Klaviyo performance, list health, and automation revenue • Source: Klaviyo</div>
      {renderKpiTable(EMAIL_KPIS, "Email Marketing KPIs")}
      <div style={{ marginTop: 16 }}>{renderSuggestions("email")}</div>
    </>
  );

  // ─── PROFITABILITY TAB ─────────────────────────────────────────────────
  const renderProfitability = () => (
    <>
      <div style={styles.sectionTitle}>Channel P&L</div>
      <div style={styles.sectionSub}>Profitability by channel including fully-loaded costs • Sources: QuickBooks, GA4, Pipedrive, Google Ads, Klaviyo</div>
      <div className="vm-card" style={{ ...styles.card, marginBottom: 20 }}>
        <div style={styles.cardTitle}>Monthly Channel Economics</div>
        <div className="vm-profitability-table" style={{ overflowX: "auto" }}>
        <table style={styles.table}>
          <thead>
            <tr>
              {["Channel", "Gross Revenue", "COGS", "Channel Costs", "Fully-Loaded Cost", "Net Margin", "Target Margin", "CAC", "LTV", "LTV:CAC", "Payback (mo)"].map(h => (
                <th key={h} style={{ ...styles.th, textAlign: h === "Channel" ? "left" : "right" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { ch: "Direct Sales", costs: "Rep comp, Pipedrive, phone, travel" },
              { ch: "Organic SEO", costs: "RiseOpp ($4.6K/mo), content writers, tools" },
              { ch: "Paid Search", costs: "Ad spend, management fee, landing pages" },
              { ch: "Email Marketing", costs: "Klaviyo subscription, content creation" },
            ].map(row => (
              <tr key={row.ch}>
                <td style={styles.td}>
                  <div>{row.ch}</div>
                  <div style={{ fontSize: 10, color: COLORS.textDim }}>{row.costs}</div>
                </td>
                {Array(10).fill(0).map((_, i) => (
                  <td key={i} style={{ ...styles.td, textAlign: "right", color: COLORS.textDim }}>—</td>
                ))}
              </tr>
            ))}
            <tr style={{ background: `${COLORS.red}11` }}>
              <td style={{ ...styles.td, fontWeight: 700, color: COLORS.white }}>TOTAL</td>
              {Array(10).fill(0).map((_, i) => (
                <td key={i} style={{ ...styles.td, textAlign: "right", fontWeight: 700, color: COLORS.textDim }}>—</td>
              ))}
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      <div className="vm-card" style={styles.card}>
        <div style={styles.cardTitle}>Channel Cost Definitions</div>
        <div className="vm-cost-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[
            { ch: "Direct Sales", items: ["Sales rep base salaries + commissions", "Sales manager (Kurt) fractional fee", "Pipedrive CRM subscription", "Phone system costs", "Travel & entertainment", "Sales collateral & samples"] },
            { ch: "Organic SEO", items: ["RiseOpp retainer ($4,600/mo)", "Content writer costs", "SEO tool subscriptions (Ahrefs, Screaming Frog)", "Otterly.ai for LLM tracking", "Technical SEO audit tools"] },
            { ch: "Paid Search", items: ["Google Ads spend", "Agency/management fee (if applicable)", "Landing page design & hosting", "Conversion tracking tools", "A/B testing tools"] },
            { ch: "Email Marketing", items: ["Klaviyo subscription", "Email template design", "Content creation for campaigns", "List management tools", "Deliverability monitoring"] },
          ].map(sec => (
            <div key={sec.ch} style={{ padding: 14, background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: COLORS.white, marginBottom: 8 }}>{sec.ch}</div>
              {sec.items.map(item => (
                <div key={item} style={{ fontSize: 12, color: COLORS.textMuted, padding: "3px 0" }}>• {item}</div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );

  // ─── CALENDAR TAB ──────────────────────────────────────────────────────
  const renderCalendar = () => {
    const allItems = CALENDAR_ITEMS.map(group => ({
      ...group,
      items: [
        ...group.items,
        ...calendarCustomItems.filter(c => c.cadence === group.cadence),
      ],
    }));

    return (
      <>
        <div className="vm-cal-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div className="vm-section-title" style={styles.sectionTitle}>CEO Operating Calendar</div>
            <div style={styles.sectionSub}>
              Your rhythm for running ValveMan — weekly, monthly, quarterly, and annual cadences
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button style={{ ...styles.btnOutline, fontSize: 11 }}
              onClick={() => { setEditingPromptKey("__calendar__"); setEditingPromptText(calendarPrompt); }}>
              ✏️ Edit Prompt
            </button>
            <button style={styles.btn(COLORS.blue)} onClick={requestCalSuggestions} disabled={aiCalLoading}>
              {aiCalLoading ? "⏳ Thinking..." : "🤖 Get AI Suggestions"}
            </button>
            <button style={styles.btn()} onClick={() => setShowAddCal(true)}>
              + Add Item
            </button>
          </div>
        </div>

        {/* AI Suggestions */}
        {aiCalSuggestions && aiCalSuggestions.length > 0 && (
          <div className="vm-card" style={{ ...styles.card, marginBottom: 20, borderColor: `${COLORS.blue}44` }}>
            <div style={{ ...styles.cardTitle, color: COLORS.blue }}>🤖 AI-Suggested Calendar Items</div>
            {aiCalSuggestions.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.border}22` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: COLORS.white, fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: 11, color: COLORS.textMuted }}>{s.cadence} • {s.rationale}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={styles.btn(COLORS.green)} onClick={() => acceptCalSuggestion(s)}>✓ Add</button>
                  <button style={styles.btnOutline} onClick={() => setAiCalSuggestions(aiCalSuggestions.filter((_, j) => j !== i))}>✗</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Item Modal */}
        {showAddCal && (
          <div className="vm-card" style={{ ...styles.card, marginBottom: 20, borderColor: `${COLORS.red}44` }}>
            <div style={{ ...styles.cardTitle, color: COLORS.red }}>Add Calendar Item</div>
            <div className="vm-cal-add-form" style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Title</div>
                <input
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, fontSize: 13, fontFamily: "'Barlow', sans-serif", boxSizing: "border-box" }}
                  value={newCalItem.title} onChange={e => setNewCalItem({ ...newCalItem, title: e.target.value })}
                  placeholder="e.g., Review quarterly vendor terms"
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Cadence</div>
                <select style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, fontSize: 13, fontFamily: "'Barlow', sans-serif" }}
                  value={newCalItem.cadence} onChange={e => setNewCalItem({ ...newCalItem, cadence: e.target.value })}>
                  {["Weekly", "Monthly", "Quarterly", "Annual"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Type</div>
                <select style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, fontSize: 13, fontFamily: "'Barlow', sans-serif" }}
                  value={newCalItem.type} onChange={e => setNewCalItem({ ...newCalItem, type: e.target.value })}>
                  <option value="ceo">CEO Action</option>
                  <option value="ai">AI Task</option>
                </select>
              </div>
              <button style={styles.btn()} onClick={addCalItem}>Add</button>
              <button style={styles.btnOutline} onClick={() => setShowAddCal(false)}>Cancel</button>
            </div>
          </div>
        )}

        {allItems.map(group => (
          <div key={group.cadence} className="vm-card" style={{ ...styles.card, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={styles.cardTitle}>{group.cadence}</div>
              <Badge color={COLORS.textMuted}>{group.items.length} items</Badge>
            </div>
            {group.items.map((item, i) => (
              <div key={i} style={styles.calItem(item.type)}>
                <Badge color={item.type === "ai" ? COLORS.blue : COLORS.yellow}>
                  {item.type === "ai" ? "AI" : "CEO"}
                </Badge>
                <span style={{ flex: 1, color: COLORS.text }}>{item.title}</span>
                {item.day && <span style={{ fontSize: 11, color: COLORS.textDim }}>{item.day}</span>}
                {item.week && <span style={{ fontSize: 11, color: COLORS.textDim }}>{item.week}</span>}
              </div>
            ))}
          </div>
        ))}
      </>
    );
  };

  // ─── SCORECARD TAB ─────────────────────────────────────────────────────
  const renderScorecard = () => {
    const channels = [
      { name: "Direct Sales", icon: "💼", kpis: SALES_REP_KPIS, color: COLORS.red, factors: ["Bookings vs target", "Close rate health", "Pipeline coverage", "New account growth", "Margin discipline"] },
      { name: "Organic SEO", icon: "🔍", kpis: [...SEO_OVERALL_KPIS, ...SEO_TECHNICAL_KPIS, ...SEO_ONPAGE_KPIS, ...SEO_OFFPAGE_KPIS, ...SEO_CONTENT_KPIS], color: "#22C55E", factors: ["Organic revenue growth", "CWV compliance", "Content velocity", "Link building progress", "LLM visibility"] },
      { name: "Paid Search", icon: "📣", kpis: PAID_SEARCH_KPIS, color: COLORS.blue, factors: ["ROAS above target", "Impression share", "Quality score health", "Budget efficiency", "New customer acquisition"] },
      { name: "Email Marketing", icon: "📧", kpis: EMAIL_KPIS, color: COLORS.yellow, factors: ["Revenue per subscriber", "List growth rate", "Automation revenue %", "Deliverability health", "Engagement trends"] },
    ];

    return (
      <>
        <div style={styles.sectionTitle}>Channel Scorecard</div>
        <div style={styles.sectionSub}>A single letter grade per channel — the simplest view of business health</div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 30 }}>
          {channels.map((ch, ci) => {
            const gradeInfo = getChannelGrade(ch.kpis);
            return (
              <div key={ch.name} className="vm-card" style={{ ...styles.card, textAlign: "center", animationDelay: `${ci * 0.1}s` }}>
                <div style={{ fontSize: 48, marginBottom: 4 }}>{ch.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.white, marginBottom: 12 }}>{ch.name}</div>
                <div style={{
                  fontSize: 72, fontWeight: 900, lineHeight: 1,
                  color: gradeColor(gradeInfo.grade),
                  textShadow: gradeInfo.grade !== "—" ? `0 0 30px ${gradeColor(gradeInfo.grade)}44` : "none",
                  marginBottom: 8,
                }}>
                  {gradeInfo.grade}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginBottom: 16 }}>
                  {gradeInfo.pct !== null ? `${gradeInfo.met}/${gradeInfo.total} KPIs on target (${gradeInfo.pct}%)` : `${gradeInfo.total} KPIs tracked — awaiting data`}
                </div>
                <div style={{ textAlign: "left", borderTop: `1px solid ${COLORS.border}`, paddingTop: 12 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Grading Factors</div>
                  {ch.factors.map((f, fi) => (
                    <div key={fi} style={{ fontSize: 12, color: COLORS.textMuted, padding: "3px 0", display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: COLORS.textDim, display: "inline-block" }} />
                      {f}
                    </div>
                  ))}
                </div>
                <button style={{ ...styles.btn(ch.color), marginTop: 14, width: "100%" }}
                  onClick={() => setActiveTab(ch.name === "Direct Sales" ? "sales" : ch.name === "Organic SEO" ? "seo" : ch.name === "Paid Search" ? "paid" : "email")}>
                  View Details
                </button>
              </div>
            );
          })}
        </div>

        <div className="vm-card" style={styles.card}>
          <div style={styles.cardTitle}>Grading Scale</div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { grade: "A", range: "90-100%", desc: "Exceeding targets" },
              { grade: "B", range: "80-89%", desc: "On track" },
              { grade: "C", range: "70-79%", desc: "Needs attention" },
              { grade: "D", range: "60-69%", desc: "Underperforming" },
              { grade: "F", range: "<60%", desc: "Critical" },
            ].map(g => (
              <div key={g.grade} style={{ textAlign: "center", padding: "10px 20px" }}>
                <div style={{ fontSize: 28, fontWeight: 900, color: gradeColor(g.grade) }}>{g.grade}</div>
                <div style={{ fontSize: 11, color: COLORS.textMuted }}>{g.range}</div>
                <div style={{ fontSize: 10, color: COLORS.textDim }}>{g.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ─── TIME TRACKER TAB ──────────────────────────────────────────────────
  const renderTimeTracker = () => {
    const pctUsed = Math.min((totalHoursThisWeek / WEEKLY_GOAL) * 100, 100);
    const pctUA = WEEKLY_GOAL > 0 ? (uniqueAbilityHours / WEEKLY_GOAL) * 100 : 0;
    const categoryBreakdown = (() => {
      const map = {};
      TIME_CATEGORIES.forEach(c => { map[c] = 0; });
      currentWeekEntries.forEach(e => { map[e.category] = (map[e.category] || 0) + parseFloat(e.hours || 0); });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    })();

    return (
      <>
        <div style={styles.sectionTitle}>Time Tracker</div>
        <div style={styles.sectionSub}>Track your hours against the 20hr/week unique ability goal</div>

        {/* Summary Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div className="vm-card" style={styles.card}>
            <div style={styles.cardTitle}>Total Hours This Week</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: totalHoursThisWeek > WEEKLY_GOAL ? COLORS.redBright : COLORS.white }}>
              {totalHoursThisWeek.toFixed(1)}
              <span style={{ fontSize: 16, fontWeight: 500, color: COLORS.textDim }}>/{WEEKLY_GOAL}h</span>
            </div>
            <div style={{ marginTop: 10, height: 6, borderRadius: 3, background: COLORS.border, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pctUsed}%`, borderRadius: 3, background: totalHoursThisWeek > WEEKLY_GOAL ? COLORS.redBright : COLORS.green, transition: "width 0.5s ease" }} />
            </div>
            {totalHoursThisWeek > WEEKLY_GOAL && (
              <div style={{ fontSize: 11, color: COLORS.redBright, marginTop: 6, fontWeight: 600 }}>
                ⚠ {(totalHoursThisWeek - WEEKLY_GOAL).toFixed(1)}h over your 20h goal
              </div>
            )}
          </div>

          <div className="vm-card" style={styles.card}>
            <div style={styles.cardTitle}>Unique Ability Hours</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.green }}>
              {uniqueAbilityHours.toFixed(1)}
              <span style={{ fontSize: 16, fontWeight: 500, color: COLORS.textDim }}>h</span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6 }}>
              {totalHoursThisWeek > 0 ? `${Math.round(pctUA / pctUsed * 100)}% of your time in unique ability` : "No entries yet this week"}
            </div>
          </div>

          <div className="vm-card" style={styles.card}>
            <div style={styles.cardTitle}>Hours Remaining</div>
            <div style={{ fontSize: 36, fontWeight: 900, color: COLORS.blue }}>
              {Math.max(WEEKLY_GOAL - totalHoursThisWeek, 0).toFixed(1)}
              <span style={{ fontSize: 16, fontWeight: 500, color: COLORS.textDim }}>h</span>
            </div>
            <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 6 }}>Budget remaining this week</div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="vm-card" style={{ ...styles.card, marginBottom: 20 }}>
          <div style={styles.cardTitle}>Time by Category</div>
          {categoryBreakdown.map(([cat, hrs]) => (
            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}11` }}>
              <span style={{ fontSize: 13, color: COLORS.text, flex: 1 }}>
                {cat === "Unique Ability" && "🎯 "}{cat}
              </span>
              <div style={{ width: 200, height: 6, borderRadius: 3, background: COLORS.border, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${totalHoursThisWeek > 0 ? (hrs / totalHoursThisWeek) * 100 : 0}%`, borderRadius: 3, background: cat === "Unique Ability" ? COLORS.green : cat === "Admin/Email" || cat === "Meetings" ? COLORS.yellow : COLORS.blue, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.white, minWidth: 40, textAlign: "right" }}>{hrs.toFixed(1)}h</span>
              <span style={{ fontSize: 11, color: COLORS.textDim, minWidth: 35, textAlign: "right" }}>{totalHoursThisWeek > 0 ? Math.round((hrs / totalHoursThisWeek) * 100) : 0}%</span>
            </div>
          ))}
        </div>

        {/* Add Entry */}
        <div className="vm-card" style={{ ...styles.card, marginBottom: 20 }}>
          <div style={styles.cardTitle}>Log Time</div>
          <div className="vm-cal-add-form" style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Date</div>
              <input type="date" value={newTimeEntry.date} onChange={e => setNewTimeEntry(prev => ({...prev, date: e.target.value}))}
                style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, fontSize: 13, fontFamily: "'Barlow', sans-serif" }} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Category</div>
              <select value={newTimeEntry.category} onChange={e => setNewTimeEntry(prev => ({...prev, category: e.target.value}))}
                style={{ padding: "8px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, fontSize: 13, fontFamily: "'Barlow', sans-serif" }}>
                {TIME_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>Hours</div>
              <input type="number" step="0.25" min="0.25" max="12" placeholder="1.5" value={newTimeEntry.hours}
                onChange={e => setNewTimeEntry(prev => ({...prev, hours: e.target.value}))}
                style={{ width: 70, padding: "8px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, fontSize: 13, fontFamily: "'Barlow', sans-serif" }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: COLORS.textMuted, marginBottom: 4 }}>What did you work on?</div>
              <input placeholder="e.g., Reviewed Q1 targets with Kurt" value={newTimeEntry.description}
                onChange={e => setNewTimeEntry(prev => ({...prev, description: e.target.value}))}
                onKeyDown={e => { if (e.key === "Enter") addTimeEntry(); }}
                style={{ width: "100%", padding: "8px 12px", borderRadius: 6, border: `1px solid ${COLORS.border}`, background: COLORS.bg, color: COLORS.text, fontSize: 13, fontFamily: "'Barlow', sans-serif", boxSizing: "border-box" }} />
            </div>
            <button style={styles.btn()} onClick={addTimeEntry}>+ Log</button>
          </div>
        </div>

        {/* Recent Entries */}
        {currentWeekEntries.length > 0 && (
          <div className="vm-card" style={styles.card}>
            <div style={styles.cardTitle}>This Week's Entries</div>
            {[...currentWeekEntries].reverse().map(entry => (
              <div key={entry.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: `1px solid ${COLORS.border}11` }}>
                <span style={{ fontSize: 11, color: COLORS.textDim, minWidth: 65 }}>{entry.date}</span>
                <Badge color={entry.category === "Unique Ability" ? COLORS.green : entry.category === "Admin/Email" || entry.category === "Meetings" ? COLORS.yellow : COLORS.blue}>{entry.category}</Badge>
                <span style={{ flex: 1, fontSize: 13, color: COLORS.text }}>{entry.description || "—"}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.white }}>{entry.hours}h</span>
                <button style={{ background: "none", border: "none", cursor: "pointer", color: COLORS.textDim, fontSize: 12 }}
                  onClick={() => setTimeEntries(prev => prev.filter(e => e.id !== entry.id))}>✕</button>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  // ─── AGENT MODAL ───────────────────────────────────────────────────────
  const renderAgentModal = () => {
    if (!agentModal) return null;
    return (
      <div className="vm-modal-overlay" style={styles.modal} onClick={() => { setAgentModal(null); setAgentResult(null); }}>
        <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.white }}>⚡ AI Agent: {agentModal.title}</div>
            <button style={{ ...styles.btnOutline, padding: "4px 10px" }} onClick={() => { setAgentModal(null); setAgentResult(null); }}>✕</button>
          </div>

          <div style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 16 }}>{agentModal.desc}</div>

          {/* Live Research Result */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Live Research
            </div>
            <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16, fontSize: 13, lineHeight: 1.6, color: COLORS.textMuted, maxHeight: 300, overflowY: "auto", whiteSpace: "pre-wrap" }}>
              {agentLoading ? "🔄 Agent is researching..." : agentResult || "Click Deploy Agent to start."}
            </div>
          </div>

          {/* Exportable Prompt */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: COLORS.yellow, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Claude Code Prompt
            </div>
            <div style={{ background: COLORS.bg, border: `1px solid ${COLORS.border}`, borderRadius: 8, padding: 16, fontSize: 12, lineHeight: 1.6, color: COLORS.textMuted, fontFamily: "monospace", maxHeight: 200, overflowY: "auto" }}>
              {agentModal.prompt}
            </div>
            <button
              style={{ ...styles.btn(COLORS.yellow), marginTop: 8, color: "#000" }}
              onClick={() => copyPrompt(agentModal.prompt)}
            >
              {copiedPrompt ? "✓ Copied!" : "📋 Copy Prompt for Claude Code"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ─── TREND MODAL ───────────────────────────────────────────────────────
  const renderTrendModal = () => {
    if (!trendModal) return null;
    const k = trendModal;
    const isLower = k.direction === "lower";
    const data = trendData;
    const minVal = Math.min(...data.map(d => Math.min(d.value, d.benchmark))) * 0.85;
    const maxVal = Math.max(...data.map(d => Math.max(d.value, d.benchmark))) * 1.15;
    const latest = data[data.length - 1]?.value;
    const first = data[0]?.value;
    const changePct = first ? (((latest - first) / first) * 100).toFixed(1) : 0;
    const isPositive = isLower ? changePct < 0 : changePct > 0;
    const vsBenchmark = isLower
      ? latest <= k.benchmark ? "At or below target" : `${((latest - k.benchmark) / k.benchmark * 100).toFixed(1)}% above target`
      : latest >= k.benchmark ? "At or above target" : `${((k.benchmark - latest) / k.benchmark * 100).toFixed(1)}% below target`;
    const vsBenchmarkGood = isLower ? latest <= k.benchmark : latest >= k.benchmark;

    return (
      <div className="vm-modal-overlay" style={styles.modal} onClick={() => setTrendModal(null)}>
        <div style={{ ...styles.modalContent, maxWidth: 800 }} onClick={e => e.stopPropagation()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: COLORS.white }}>{k.label}</div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                {k.cadence} • Source: {k.source}
              </div>
            </div>
            <button style={{ ...styles.btnOutline, padding: "4px 10px" }} onClick={() => setTrendModal(null)}>✕</button>
          </div>

          {/* Summary Cards */}
          <div className="vm-trend-stats" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
            <div style={{ padding: 14, background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Current</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.white }}>{formatValue(latest, k.unit)}</div>
            </div>
            <div style={{ padding: 14, background: COLORS.bg, borderRadius: 8, border: `1px solid ${COLORS.border}` }}>
              <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Benchmark</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: COLORS.textMuted }}>{formatValue(k.benchmark, k.unit)}</div>
            </div>
            <div style={{ padding: 14, background: COLORS.bg, borderRadius: 8, border: `1px solid ${isPositive ? COLORS.green : COLORS.red}33` }}>
              <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Period Change</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: isPositive ? COLORS.green : COLORS.redBright }}>
                {isPositive ? "+" : ""}{changePct}%
              </div>
            </div>
            <div style={{ padding: 14, background: COLORS.bg, borderRadius: 8, border: `1px solid ${vsBenchmarkGood ? COLORS.green : COLORS.yellow}33` }}>
              <div style={{ fontSize: 10, color: COLORS.textDim, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>vs Target</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: vsBenchmarkGood ? COLORS.green : COLORS.yellow }}>{vsBenchmark}</div>
            </div>
          </div>

          {/* Range Selector */}
          <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
            {[
              { id: "3mo", label: "3 Months" },
              { id: "6mo", label: "6 Months" },
              { id: "1yr", label: "1 Year" },
              { id: "2yr", label: "2 Years" },
            ].map(r => (
              <button key={r.id}
                style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                  fontFamily: "'Barlow', sans-serif", cursor: "pointer",
                  border: `1px solid ${trendRange === r.id ? COLORS.red : COLORS.border}`,
                  background: trendRange === r.id ? `${COLORS.red}22` : "transparent",
                  color: trendRange === r.id ? COLORS.redBright : COLORS.textMuted,
                }}
                onClick={() => setTrendRange(r.id)}
              >{r.label}</button>
            ))}
          </div>

          {/* Chart */}
          <div style={{ background: COLORS.bg, borderRadius: 10, border: `1px solid ${COLORS.border}`, padding: "20px 10px 10px 0" }}>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.red} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.red} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} vertical={false} />
                <XAxis
                  dataKey="period" tick={{ fill: COLORS.textDim, fontSize: 11 }}
                  axisLine={{ stroke: COLORS.border }} tickLine={false}
                />
                <YAxis
                  domain={[Math.floor(minVal), Math.ceil(maxVal)]}
                  tick={{ fill: COLORS.textDim, fontSize: 11 }}
                  axisLine={false} tickLine={false} width={60}
                  tickFormatter={v => k.unit === "$" ? `$${(v/1000).toFixed(0)}K` : v}
                />
                <Tooltip
                  contentStyle={{
                    background: COLORS.card, border: `1px solid ${COLORS.border}`,
                    borderRadius: 8, fontSize: 13, color: COLORS.text,
                  }}
                  formatter={(val) => [formatValue(val, k.unit), k.label]}
                  labelStyle={{ color: COLORS.textMuted }}
                />
                <ReferenceLine
                  y={k.benchmark} stroke={COLORS.yellow} strokeDasharray="6 4" strokeWidth={2}
                  label={{ value: `Target: ${formatValue(k.benchmark, k.unit)}`, fill: COLORS.yellow, fontSize: 11, position: "insideTopRight" }}
                />
                <Area
                  type="monotone" dataKey="value" stroke={COLORS.redBright}
                  strokeWidth={2.5} fill="url(#trendGradient)"
                  dot={{ fill: COLORS.red, stroke: COLORS.bg, strokeWidth: 2, r: 4 }}
                  activeDot={{ fill: COLORS.redBright, stroke: COLORS.white, strokeWidth: 2, r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: 14, fontSize: 11, color: COLORS.textDim, textAlign: "center" }}>
            ⓘ Displaying simulated trend data — connect live data sources to see actuals
          </div>
        </div>
      </div>
    );
  };

  // ─── RENDER ────────────────────────────────────────────────────────────
  return (
    <div style={styles.app}>
      <AnimationStyles />
      <link href="https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700;900&family=Barlow+Condensed:wght@600;700&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <div className="vm-header" style={styles.header}>
        <div className="vm-header-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <div style={styles.logo}>
            <div style={styles.logoMark}>VM</div>
            <div>
              <div style={styles.logoText}>VALVEMAN</div>
              <div style={styles.logoSub}>Command Center</div>
            </div>
          </div>
          <div className="vm-nav-scroll">
            <nav style={styles.nav}>
              {TABS.map(tab => (
                <button key={tab.id} className="vm-nav-btn" style={styles.navBtn(activeTab === tab.id)} onClick={() => setActiveTab(tab.id)}>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="vm-main-content" style={styles.main}>
        {activeTab === "home" && renderHome()}
        {activeTab === "scorecard" && renderScorecard()}
        {activeTab === "sales" && renderSales()}
        {activeTab === "seo" && renderSEO()}
        {activeTab === "paid" && renderPaid()}
        {activeTab === "email" && renderEmail()}
        {activeTab === "profitability" && renderProfitability()}
        {activeTab === "calendar" && renderCalendar()}
        {activeTab === "scorecard" && renderScorecard()}
        {activeTab === "time" && renderTimeTracker()}
        {activeTab === "time" && renderTimeTracker()}
      </div>

      {/* Agent Modal */}
      {renderAgentModal()}

      {/* Trend Modal */}
      {renderTrendModal()}

      {/* Prompt Editor Modal */}
      {editingPromptKey && (
        <div className="vm-modal-overlay" style={styles.modal} onClick={() => setEditingPromptKey(null)}>
          <div className="vm-modal-content" style={{ ...styles.modalContent, maxWidth: 650 }} onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: COLORS.white }}>
                  ✏️ {editingPromptKey === "__briefing__" ? "Edit Weekly Briefing Prompt" : editingPromptKey === "__calendar__" ? "Edit Calendar Suggestions Prompt" : "Edit AI Agent Prompt"}
                </div>
                <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 4 }}>
                  {editingPromptKey === "__briefing__" ? "Controls what the weekly CEO briefing analyzes and recommends"
                    : editingPromptKey === "__calendar__" ? "Controls what calendar items AI suggests for your operating rhythm"
                    : editingPromptKey.split(":").slice(1).join(":")}
                </div>
              </div>
              <button style={{ ...styles.btnOutline, padding: "4px 10px" }} onClick={() => setEditingPromptKey(null)}>✕</button>
            </div>
            <div style={{ fontSize: 11, color: COLORS.textDim, marginBottom: 6 }}>
              Customize this prompt to get better results. Changes persist for this session.
            </div>
            <textarea
              value={editingPromptText}
              onChange={e => setEditingPromptText(e.target.value)}
              style={{
                width: "100%", minHeight: 250, padding: 14, borderRadius: 8,
                border: `1px solid ${COLORS.border}`, background: COLORS.bg,
                color: COLORS.text, fontSize: 13, fontFamily: "monospace",
                lineHeight: 1.6, resize: "vertical", boxSizing: "border-box",
              }}
            />
            <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "space-between" }}>
              <button style={{ ...styles.btnOutline, fontSize: 11 }} onClick={() => {
                if (editingPromptKey === "__briefing__") setEditingPromptText(DEFAULT_BRIEFING_PROMPT);
                else if (editingPromptKey === "__calendar__") setEditingPromptText(DEFAULT_CALENDAR_PROMPT);
              }}>
                ↩ Reset to Default
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button style={styles.btnOutline} onClick={() => setEditingPromptKey(null)}>Cancel</button>
                <button style={styles.btn(COLORS.green)} onClick={savePrompt}>
                  ✓ Save Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
