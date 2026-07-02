# Claude Code Prompt — Afilo PitchKit Growth Report App (existing build)

Paste everything below the line into Claude Code from the repo root of the existing PitchKit app. This prompt is for working on the already-built application — it is not a landing-page-only or Stripe-based task.

---

You are working on the existing Afilo PitchKit Growth Report application. The app is already built; your job is to complete, fix, or polish the specific task I give you within the established architecture. Read the SCOPE RESTRICTIONS before writing any code and comply with all of them.

## Product context (do not deviate)

Afilo PitchKit Growth Report is a software-assisted digital report product by TechSci Inc. It turns a public website URL and customer-provided business context into a structured website growth and pitch report, sold for USD 149 one-time via Paddle Billing. Positioning in all copy: digital report product. Never describe it as consulting, an audit service, advisory, agency service, or done-for-you marketing. Human involvement is described only as quality assurance, formatting, and fulfillment support.

## Architecture (existing — work within it)

- **Frontend:** Next.js App Router, Tailwind CSS v4 CSS-first (`@theme {}` in `globals.css`)
- **Backend:** Rust/Axum service
- **Database:** PostgreSQL via SQLx
- **Auth:** Clerk — admin routes only; customers do not log in
- **Payments:** Paddle Billing — hosted/overlay checkout for the one-time USD 149 transaction, webhook (`transaction.completed`, refund events) as the source of truth for payment state, with webhook signature verification
- **Email:** Resend — payment confirmation and report delivery
- **Design:** follow `DESIGN.md` and the Claude Design files (`PitchKit Landing.dc.html`, `PitchKit Request.dc.html`, `PitchKit Success.dc.html`, `PitchKit Admin.dc.html`, `PitchKit Components.dc.html`) exactly — near-black canvas `#010102`, charcoal panels `#0f1011`, hairline borders, ink `#f7f8f8`, single lavender-blue accent `#5e6ad2`. Do not invent a different visual style.

## Application flow (existing — preserve it)

landing page → request/intake form (public website URL + business context) → Paddle checkout → Paddle webhook confirms payment → paid request stored in PostgreSQL → confirmation email via Resend → Clerk-protected admin fulfillment queue → digital report delivery

Request statuses: `PENDING_PAYMENT` → `PAID` → `IN_PROGRESS` → `DELIVERED`, plus `REFUNDED` and `CANCELED`.

## SCOPE RESTRICTIONS (hard rules, no exceptions)

- Do NOT add Stripe in any form. Do NOT use Stripe Payment Links. Paddle Billing is the only payment provider.
- Do NOT revive the old $7/$19/$39/$79 SitePack pricing or any tiered pricing. The only price is USD 149 one-time.
- Do NOT position the product as manual consulting, an audit service, or any human-delivered service in any copy you touch.
- Do NOT add subscriptions or recurring billing.
- Do NOT add Firecrawl/Exa automation or any automated crawling/research pipeline into the app.
- Do NOT add PDF automation or automated report generation.
- Do NOT add a customer dashboard, customer accounts, or customer login. Clerk protects the admin queue only.
- Do NOT touch unrelated files — modify only what the task requires.
- Do NOT introduce unnecessary abstractions, new frameworks, or new services.
- Do NOT push to git. Do not run `git push`. Local commits only if asked.
- If a change appears to require anything on this list, stop and say so instead of building it.

## Quality bar

- Webhook handler: verify Paddle signatures, idempotent processing, never trust client-side success redirects for payment state
- SQLx queries checked/compile-verified; no raw string interpolation into SQL
- Admin queue: Clerk-guarded at the route level, statuses rendered per DESIGN.md
- Frontend: semantic HTML, responsive to 360px, contrast-safe muted text on the near-black canvas, no layout shift
- Landing/request/success page copy must match `pitchkit/01-landing-page-copy.md`, including the public-data note and the no-guaranteed-results disclaimer

When done: run the app locally, verify the full flow with a Paddle sandbox transaction (form → checkout → webhook → `PAID` in admin queue → confirmation email), then stop. Do not deploy, do not push, do not add anything beyond the task's scope.
