import { SocialPost } from './types';

export const SAMPLE_PROFILE = {
  name: 'QuantumFlow',
  handle: 'quantumflow',
  headline: 'AI-Powered Analytics Platform | Helping teams make faster, smarter decisions',
  avatar: '/placeholder-avatar.svg',
};

export const SAMPLE_POSTS: SocialPost[] = [
  // ── Q2 Product Launch ──────────────────────────────
  {
    id: 'POST-001',
    campaign: 'Q2 Product Launch',
    platform: 'linkedin',
    variant: 'A',
    text: `We're thrilled to announce the launch of QuantumFlow 3.0 — our most powerful analytics platform yet.

What's new:
→ AI-powered anomaly detection
→ Real-time collaborative dashboards
→ 10x faster query engine
→ Native integrations with 200+ tools

Our beta users saw a 47% reduction in time-to-insight. Now it's your turn.

#ProductLaunch #Analytics #AI #DataDriven`,
    scheduledDate: '2025-04-20',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
  {
    id: 'POST-002',
    campaign: 'Q2 Product Launch',
    platform: 'linkedin',
    variant: 'B',
    text: `"We used to spend 3 hours building reports. Now it takes 20 minutes."

That's what Sarah Chen, VP of Analytics at TechCorp, told us after beta testing QuantumFlow 3.0.

Today, we're making it available to everyone.

The new AI-powered engine doesn't just crunch numbers faster — it surfaces the insights you didn't know to look for.

Link in comments 👇

#CustomerSuccess #Analytics #AI`,
    scheduledDate: '2025-04-20',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
  {
    id: 'POST-003',
    campaign: 'Q2 Product Launch',
    platform: 'twitter',
    variant: 'A',
    text: `QuantumFlow 3.0 is here. 🚀

AI-powered anomaly detection. Real-time dashboards. 10x faster queries.

Our beta users cut time-to-insight by 47%.

The future of analytics just landed.`,
    scheduledDate: '2025-04-20',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
  {
    id: 'POST-004',
    campaign: 'Q2 Product Launch',
    platform: 'twitter',
    variant: 'B',
    text: `"We used to spend 3 hours on reports. Now? 20 minutes."

We built QuantumFlow 3.0 around one idea: you shouldn't need a data team to get answers.

AI anomaly detection × real-time dashboards × 200+ integrations.

Available today →`,
    scheduledDate: '2025-04-20',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
  {
    id: 'POST-005',
    campaign: 'Q2 Product Launch',
    platform: 'facebook',
    variant: 'A',
    text: `Big news! QuantumFlow 3.0 is officially live! 🎉

We've been working on this for months, and we can't wait for you to try it.

Here's what's inside:
✅ AI that spots anomalies before they become problems
✅ Dashboards you can build and share in real time
✅ A query engine that's 10x faster
✅ 200+ integrations with your favorite tools

Ready to see what your data has been trying to tell you?`,
    scheduledDate: '2025-04-20',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
  {
    id: 'POST-006',
    campaign: 'Q2 Product Launch',
    platform: 'instagram',
    variant: 'A',
    text: `The wait is over. QuantumFlow 3.0 is here — and it's a game changer. ✨

AI-powered insights. Real-time collaboration. Lightning-fast queries. Everything you need to turn raw data into real decisions.

Link in bio to get started.

#QuantumFlow #Analytics #AI #DataScience #TechLaunch #ProductLaunch #StartupLife`,
    imageUrl: 'gradient',
    scheduledDate: '2025-04-20',
    status: 'ready',
    approved: null,
    clientComment: '',
  },

  // ── Thought Leadership ─────────────────────────────
  {
    id: 'POST-007',
    campaign: 'Thought Leadership',
    platform: 'linkedin',
    variant: 'A',
    text: `Hot take: Most companies don't have a "data problem." They have a "question problem."

I've talked to 50+ analytics leaders this quarter. The pattern is always the same:

They have the data. They have the tools. They have the team.

But nobody is asking the right questions.

The best analytics cultures I've seen do three things differently:

1. They start with decisions, not dashboards
2. They measure outcomes, not outputs
3. They make data literacy everyone's job — not just the analysts'

The tools matter less than you think. The questions matter more than you realize.

What's the most impactful question your data team has answered this year?

#Analytics #DataCulture #Leadership`,
    scheduledDate: '2025-04-22',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
  {
    id: 'POST-008',
    campaign: 'Thought Leadership',
    platform: 'linkedin',
    variant: 'B',
    text: `We analyzed 10,000 dashboard sessions across our user base. Here's what surprised us:

📊 73% of dashboards are viewed less than once per month
📊 The average "time on dashboard" is 47 seconds
📊 Teams with fewer dashboards make faster decisions

The insight? More dashboards ≠ more data-driven.

The most effective teams we studied had 3-5 core dashboards that directly mapped to their top business questions.

Everything else was noise.

We're rethinking how we build QuantumFlow around this finding. Stay tuned.

#DataDriven #Analytics #ProductThinking`,
    scheduledDate: '2025-04-22',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
  {
    id: 'POST-009',
    campaign: 'Thought Leadership',
    platform: 'twitter',
    variant: 'A',
    text: `We analyzed 10,000 dashboard sessions.

73% of dashboards are viewed less than once/month.

Average time on dashboard: 47 seconds.

Teams with fewer dashboards make faster decisions.

More dashboards ≠ more data-driven. 🧵`,
    scheduledDate: '2025-04-22',
    status: 'ready',
    approved: null,
    clientComment: '',
  },

  // ── Customer Spotlight ─────────────────────────────
  {
    id: 'POST-010',
    campaign: 'Customer Spotlight',
    platform: 'linkedin',
    variant: 'A',
    text: `When NovaTech's data team was drowning in ad-hoc report requests, they made a bold decision: give every department self-serve analytics.

The results after 6 months with QuantumFlow:

📉 Report requests to the data team: down 68%
📈 Cross-team data adoption: up 3x
⏱️ Average time from question to answer: 4 minutes (was 2 days)

"The biggest win wasn't the efficiency," says Maria Rodriguez, Head of Data at NovaTech. "It was that product managers started asking better questions because they could see the answers themselves."

Read the full story →

#CustomerSuccess #Analytics #SelfServeAnalytics`,
    scheduledDate: '2025-04-25',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
  {
    id: 'POST-011',
    campaign: 'Customer Spotlight',
    platform: 'facebook',
    variant: 'A',
    text: `🌟 Customer Spotlight: NovaTech

When every department started asking for custom reports, NovaTech's data team knew something had to change.

They switched to QuantumFlow for self-serve analytics — and the results speak for themselves:

↓ 68% fewer report requests
↑ 3x more teams using data daily
⚡ Questions answered in minutes, not days

"Product managers started asking better questions because they could explore the data themselves." — Maria Rodriguez, Head of Data

Their full story is worth a read 👇`,
    scheduledDate: '2025-04-25',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
  {
    id: 'POST-012',
    campaign: 'Customer Spotlight',
    platform: 'instagram',
    variant: 'A',
    text: `"The biggest win wasn't the efficiency. It was that people started asking better questions." — Maria Rodriguez, Head of Data at NovaTech

NovaTech gave every team self-serve analytics with QuantumFlow. 6 months later: 68% fewer report requests, 3x more data adoption, and answers in minutes instead of days.

Full story at the link in bio.

#CustomerStory #Analytics #DataDriven #SelfServe #TechSuccess`,
    imageUrl: 'gradient',
    scheduledDate: '2025-04-25',
    status: 'ready',
    approved: null,
    clientComment: '',
  },
];
