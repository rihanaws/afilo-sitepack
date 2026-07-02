# Report Preparation Workflow — Afilo PitchKit Growth Report

The product is the structured digital report generated through the Afilo PitchKit workflow. Human involvement is quality assurance, formatting, and fulfillment support. Target: ≤3 hours of QA/fulfillment time per report, delivered ≤48 hours after confirmed payment. All research uses publicly accessible pages only; respect robots.txt; no personal-data scraping; no accessing anything behind logins.

---

## Order lifecycle & statuses

Requests flow through the app and are tracked in the Clerk-protected admin queue with these statuses:

| Status | Meaning | Trigger |
|--------|---------|---------|
| `PENDING_PAYMENT` | Request form submitted, Paddle checkout not yet completed | Form submission |
| `PAID` | Paddle webhook confirmed the one-time payment; request stored in database; confirmation email sent via Resend | `transaction.completed` webhook |
| `IN_PROGRESS` | Report preparation workflow started | Admin action in queue |
| `DELIVERED` | Digital report sent to the customer | Admin action after delivery email |
| `REFUNDED` | Refund processed through Paddle | Paddle refund webhook / admin |
| `CANCELED` | Request withdrawn or abandoned pre-payment | Admin action / stale `PENDING_PAYMENT` cleanup |

**Rules:** never start preparation on `PENDING_PAYMENT` — only the webhook-confirmed `PAID` status starts the 48-hour clock. Check the admin queue at least twice daily during the sprint (morning and evening, Dhaka time).

## Inputs (from the request form, stored with the paid request)

- Public website URL the report should cover
- Customer-provided business context: what they offer, who the report is for
- Contact email (from checkout)

If context is too thin to produce a specific report, email the customer once for clarification within 12h of `PAID`. The 48h clock pauses until they reply; say so in the email.

## Report preparation workflow (per PAID request)

**Step 1 — Intake (10 min).** Set status `IN_PROGRESS`. Review the stored request: URL, context, customer email. Skim the target site manually for 5 minutes and note first impressions — these sharpen the QA pass later.

**Step 2 — Source gathering (15 min).** Collect public-page content for the target site (homepage, pricing, 1–2 product pages, about) and identify 2–3 direct competitors with their public pages. Public, robots.txt-respecting access only. Save sources — every claim in the report must trace to them.

**Step 3 — Report generation (30 min).** Run the PitchKit generation workflow over the gathered sources and customer context to produce the draft report covering all eight sections: positioning diagnosis, headline/subheading improvements, conversion gaps, lead magnet ideas, outreach angle, LinkedIn content idea, SEO/content brief, recommended next actions. Every claim must trace to something visible in the sources; inferences must be flagged as inferences.

**Step 4 — Quality assurance (45 min).** This is the human role: QA, not authorship. Cut anything generic. Verify every factual claim against the gathered sources. Confirm the conversion gaps and recommendations fit the customer-provided context. Delete or flag anything unverifiable as "worth verifying."

**Step 5 — Formatting (30 min).** Assemble into the report template (`05-report-template.md`). Formatting checklist:

- [ ] Customer and target-site names correct everywhere (search for leftover placeholders)
- [ ] All eight sections present and specific
- [ ] Every claim traceable to a public page; inferences flagged
- [ ] "Prepared from publicly accessible website information and customer-provided context" note present
- [ ] No compliance exposure: no scraped emails/phones, no claims about private data or revenue, no guaranteed-results language
- [ ] Clean render, branded cover per DESIGN.md, ≤12 pages

**Step 6 — Delivery.** Send the delivery email (`06-delivery-and-upsell-emails.md`) with the digital report. Set status `DELIVERED` and log the PAID→DELIVERED time. Schedule the +3 day optional PulseScout note.

## Cost & time budget per report

API/tooling usage for source gathering and generation: well under $5 per report at this volume. Human QA/formatting/fulfillment time: ~2–3h. At USD 149 one-time via Paddle, margin is acceptable at validation volume — do not optimize before the gate passes.

## Refund handling

All refunds go through Paddle. Any unhappy customer → refund same day via the Paddle dashboard, set status `REFUNDED`, thank them, and ask one question: "what would have made the report worth $149?" Log the answer. One refund = fix the template/workflow before the next sale. Note that as merchant of record, Paddle may also action refunds directly under its buyer policies — honor them without argument.
