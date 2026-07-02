# Afilo PitchKit Growth Report — Validation Sprint Execution Package

Updated 2026-07-02 to the current locked plan. Supersedes the earlier Stripe/manual-audit version — Stripe has been removed from this package entirely.
Files in this folder are paste-ready. Start with this file, then work the 7-day schedule.

---

## 1. Execution Verdict

The product and the app exist. Afilo PitchKit Growth Report is a software-assisted digital report product that turns a public website URL and customer-provided business context into a structured website growth and pitch report. It sells for USD 149 one-time through Paddle Billing, delivered digitally within 48 hours. The job this sprint is not to build more — it is to push paid requests through the existing app flow and fulfill them through the admin queue.

Sequence: verify the Paddle checkout → webhook → confirmation-email path end to end with a test transaction → send outreach starting with Automaly → expand to 20+ similar agencies → fulfill every PAID request through the admin queue within 48 hours → present PulseScout only as a future/optional follow-on. Judge against the validation gate on Day 14, not before.

---

## 2. Final Offer Definition — Afilo PitchKit Growth Report

**Name:** Afilo PitchKit Growth Report
**Company:** TechSci Inc.
**URL:** pitchkit.afilo.io
**Tagline:** Walk into every pitch with the growth report already done.

**One-liner:** Afilo PitchKit Growth Report is a software-assisted digital report product that turns a public website URL and customer-provided business context into a structured website growth and pitch report — delivered within 48 hours.

**Buyer:** Boutique B2B agencies (5–30 people), fractional consultants, and founders pitching high-value clients. First segment: automation/dev agencies like Automaly.

**What the customer submits (request form):** the public URL of the website the report should cover, plus short business context — what they offer and who the report is for.

**What they get in 48 hours (structured digital report):**

1. Positioning diagnosis of the submitted website
2. Improved headline and subheading recommendations
3. Conversion gaps, ranked by effort vs. impact
4. Lead magnet ideas matched to the site's audience
5. Outreach angle with supporting talking points
6. LinkedIn content idea built on the report's findings
7. SEO/content brief
8. Recommended next actions

Every report is prepared from publicly accessible website information and customer-provided context. Human involvement is limited to quality assurance, formatting, and fulfillment support. No guaranteed business results.

**Price:** USD 149, one-time payment via Paddle Billing checkout. No tiers, no subscriptions.
**Delivery:** within 48 hours of confirmed payment, by email, as a digital report.
**Refunds:** handled through Paddle per the published refund policy — if the report is not delivered as described, the customer gets a full refund.

**Product flow (the app, already built):**

landing page → request/intake form → Paddle checkout → Paddle webhook confirms payment → paid request stored in database → confirmation email (Resend) → Clerk-protected admin fulfillment queue → digital report delivery

**What this product is NOT (positioning boundary — hold it in every asset):** not consulting, not an advisory or professional service, not an agency service, not a human-prepared audit, not done-for-you marketing, not lead generation, not outbound campaigns, not social media automation. The thing being sold is the structured digital report generated through the Afilo PitchKit workflow.

**Upsell path:** PulseScout — future/optional only. Mention it after delivery as something in development; do not sell it as an active subscription in this sprint.

---

## 3. 7-Day Execution Schedule

| Day | Actions | Output |
|-----|---------|--------|
| **Day 1 (today)** | Run one real test transaction through the full flow: request form → Paddle checkout → webhook fires → request appears as PAID in admin queue → confirmation email arrives. Fix anything broken before outreach. Send the Automaly email. Send warm-network message to 5 RoyalSoft/CodeCraft contacts. | Payment path verified, 6 touches live |
| **Day 2** | Build prospect list: Automee, Brainpool, DevCommX + 17 similar (Clutch, LinkedIn, agency directories). Prepare a sample Growth Report (own or demo site) for the "View Sample Report" link. | List of 20, sample live |
| **Day 3** | Send Email 1 to 10 prospects (personalized first line each). Send LinkedIn DMs to 5 founders from the list. | 15 new touches |
| **Day 4** | Send Email 1 to remaining 10 prospects. Follow up warm-network non-responders. | Full list touched |
| **Day 5** | Email 2 (follow-up) to Day-3 batch. Fulfill any PAID requests same-day per the report preparation workflow (`04-fulfillment-sop.md`). | Follow-ups out |
| **Day 6** | Email 2 to Day-4 batch. LinkedIn second touch. Fulfill queue. | — |
| **Day 7** | Mid-sprint checkpoint against the validation gate. Email 3 (breakup) to earliest non-responders. If reply rate < 10%, rewrite Email 1's angle — change the email, not the offer. | Checkpoint done |

Days 8–14: continue follow-ups, fulfill the queue, send the delivery + optional PulseScout note. Final gate check Day 14.

**Out of scope this sprint:** customer dashboards, subscriptions, PDF automation, Firecrawl/Exa automation inside the app, new domains, paid ads, CRM setup, any Stripe integration.

---

## 4. Validation Metrics & Kill/Pivot Criteria

**Validation gate (unchanged):** within 14 days and ≤30 quality touches, **≥2 confirmed Paddle payments at USD 149+** OR **1 committed monthly follow-on engagement**.

Track daily — the admin queue is the source of truth for orders; a simple sheet covers outreach:

| Metric | Healthy | Warning |
|--------|---------|---------|
| Reply rate on Email 1 | ≥15% | <10% after 20 sends → rewrite Email 1 angle |
| Positive replies → Paddle payment | ≥50% | Interest but no payment ×3 → checkout friction or trust problem; add the sample report link earlier in the thread |
| Refunds (via Paddle) | 0 | Any refund → fix the report template before next sale |
| Delivery time (PAID → DELIVERED) | ≤48h | Miss once → tighten the workflow before selling more |

**Outcomes at Day 14:**

- **≥2 payments or 1 monthly commit → validated.** Raise price to USD 199, keep selling. Only then consider deepening automation.
- **1 payment → extend 7 days**, double down on whichever channel produced it. No new assets, no price change.
- **0 payments, ≥4 positive replies → offer problem, not demand problem.** Rework scope or price using the actual objections heard. One rework allowed.
- **0 payments, <4 positive replies from 30 touches → kill outbound for this offer.** Keep the app dormant, fold the report into future PulseScout conversations. Do not spend a second sprint.

**Hard rule:** no new features until the gate is passed. Fulfillment and outreach only.

---

## File Index

| File | Contents |
|------|----------|
| `01-landing-page-copy.md` | Full copy for pitchkit.afilo.io |
| `02-cold-email-sequence.md` | 3-email outbound sequence, Automaly-style agencies |
| `03-linkedin-and-warm-messages.md` | LinkedIn DM variants + warm-network message |
| `04-fulfillment-sop.md` | Report preparation workflow + admin queue statuses |
| `05-report-template.md` | The Growth Report deliverable template |
| `06-delivery-and-upsell-emails.md` | Delivery email + optional PulseScout note |
| `07-claude-code-prompt.md` | Constrained Claude Code prompt for the existing app |

**Next action today:** run the end-to-end Paddle test transaction, then send the Automaly email.
