# Claude Code Prompt — v0.1 Gap Closure (pre-launch)

Paste everything below the line into Claude Code from the repo root. Prerequisite: claude-mem has already learned this codebase — recall it instead of re-reading everything.

---

You previously learned this codebase (claude-mem: afilo-sitepack — Bun monorepo, Rust/Axum API in `apps/api/src/main.rs`, Next.js 16 frontend in `apps/web`, PostgreSQL/SQLx, Paddle webhooks with HMAC-SHA256 verification, Clerk-protected admin queue). Recall that memory; do not re-scan files you already know.

The app is v0.1 of the **Afilo PitchKit Growth Report** — a software-assisted digital report product by TechSci Inc., USD 149 one-time via Paddle Billing. Three gaps exist between the current build and the locked product plan. Close exactly these three. Nothing else.

## Task 1 — Status lifecycle correction

Current: webhook sets `PENDING_PAYMENT → IN_PROGRESS` directly; `CANCELED` doesn't exist.
Target lifecycle: `PENDING_PAYMENT → PAID → IN_PROGRESS → DELIVERED`, plus `REFUNDED` and `CANCELED`.

- Add `PAID` and `CANCELED` to the status enum (Rust + SQL + TypeScript admin types).
- Paddle `transaction.completed` webhook sets status to `PAID` (not `IN_PROGRESS`).
- `IN_PROGRESS` becomes an admin-only transition from `PAID` in the admin queue.
- Add `CANCELED` as an admin-only transition from `PENDING_PAYMENT`.
- Verify Paddle refund events set `REFUNDED`; add handling if missing.
- Write the SQL migration; keep SQLx pre-compiled queries valid (`cargo sqlx prepare`).
- Update the admin queue UI to show and transition the new statuses per the existing DESIGN.md token system.

## Task 2 — Customer confirmation email

Currently Resend only sends an internal notification on payment. Add a customer-facing confirmation email sent when the webhook confirms payment (`PAID`):

- To: customer email from the request record. From: the existing Resend sender.
- Content: order confirmed, what the Growth Report includes (positioning diagnosis, headline improvements, conversion gaps, lead magnet ideas, outreach angle, LinkedIn content idea, SEO/content brief, next actions), delivery within 48 hours of payment confirmation, support contact support@afilo.io.
- Wording must describe a "structured digital report" — never "audit", "consulting", or "service".
- Send failures must not fail the webhook handler — log and continue (webhook must stay idempotent and return 200 to Paddle).

## Task 3 — Copy compliance pass

The landing page, intake form, and success page still carry "manual audit" positioning. Replace all customer-facing copy to match `pitchkit/01-landing-page-copy.md` in this repo:

- Product name everywhere: **Afilo PitchKit Growth Report**.
- Required one-liner: "Afilo PitchKit Growth Report is a software-assisted digital report product that turns a public website URL and customer-provided business context into a structured website growth and pitch report."
- Primary CTA: `Generate My Growth Report`. Secondary: `View Sample Report` (href can be a placeholder `/sample` link for now — do not build the sample page).
- Include the public-data note ("prepared from publicly accessible website information and customer-provided context"), the no-guaranteed-results disclaimer, and the support/refund line (refunds via Paddle).
- Grep all of `apps/web` for: `audit`, `manual`, `consulting`, `service`, `done-for-you`, `Stripe`, `SitePack`, `$7`, `$19`, `$39`, `$79` — and fix every customer-facing hit. Report any hits you intentionally leave (e.g. internal comments).

## SCOPE RESTRICTIONS (hard rules, no exceptions)

- Do NOT add Stripe in any form. Paddle Billing only.
- Do NOT revive $7/$19/$39/$79 or tiered pricing. USD 149 one-time only.
- Do NOT position the product as manual consulting, an audit, or a human-delivered service in any copy.
- Do NOT add subscriptions, customer dashboards, or customer login.
- Do NOT add Firecrawl/Exa automation or PDF/report generation automation.
- Do NOT migrate admin auth to Clerk JWT in this pass — the ADMIN_ACCESS_TOKEN stays for the validation sprint; leave the existing TODO.
- Do NOT touch unrelated files or introduce new abstractions/services.
- Do NOT push to git. Local commits only, one per task, conventional format.
- If a change appears to require anything on this list, stop and say so.

## Verification (do all before finishing)

1. `cargo fmt --check`, `cargo clippy`, `cargo sqlx prepare` pass; migration applies cleanly to a fresh dev database.
2. Bun build of `apps/web` passes with TypeScript strict mode.
3. Simulate a Paddle sandbox `transaction.completed` webhook: request transitions to `PAID`, customer confirmation email is dispatched (or logged in dev), internal notification still fires, handler is idempotent on replay.
4. Admin queue: `PAID → IN_PROGRESS → DELIVERED` transitions work; `CANCELED` available from `PENDING_PAYMENT`.
5. Re-run the copy grep from Task 3 and show the final (clean) result.

Then stop. Do not deploy, do not push, do not start the Clerk JWT migration.
