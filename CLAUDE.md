# afilo-sitepack

Bun monorepo. Two apps:

- `apps/api` — Rust/Axum backend. PostgreSQL via SQLx (compile-time checked queries, offline mode). Paddle Billing webhooks (HMAC-SHA256 verified). Resend for transactional email.
- `apps/web` — Next.js 16 (React 19), TypeScript strict. Clerk auth (admin routes only, v0.1 uses a temporary `ADMIN_ACCESS_TOKEN` guard — do not migrate to Clerk JWT without explicit instruction). Tailwind v4 CSS-first tokens. Zod validation on forms.

Product: **Afilo PitchKit Growth Report** — USD 149 one-time via Paddle Billing, software-assisted digital report product by TechSci Inc. Not manual consulting/audit — copy must reflect that.

## Structure

- `apps/api/src/main.rs` — single-file Axum API: request creation, Paddle webhook handler, admin endpoints.
- `apps/api/migrations/` — SQLx migrations, plain SQL.
- `apps/web/lib/pitchkit.ts` — public API client + Zod schema + shared types.
- `apps/web/lib/pitchkit-admin.ts` — server-only admin API client (Bearer token).
- `apps/web/app/` — `page.tsx` (marketing), `start/` (intake form + Paddle checkout), `success/`, `admin/` (fulfillment queue, Clerk-protected).
- `pitchkit/` — product copy/spec source of truth (`01-landing-page-copy.md` etc.) — customer-facing copy must match this.

## Conventions

- Rust: `cargo fmt`, `cargo clippy`, `cargo sqlx prepare` must pass before considering a backend change done.
- TypeScript: strict mode, path alias `@/*`, no `any`.
- Request lifecycle: `PENDING_PAYMENT → PAID → IN_PROGRESS → DELIVERED`, plus `REFUNDED` and `CANCELED`. Paddle webhook sets `PAID`; admin queue drives the rest.
- No Stripe. Paddle Billing only. No tiered pricing — single $149 one-time price.
- Commit locally per logical task, conventional commit format. Never push without explicit instruction.

## Do not

- Add Stripe in any form.
- Revive old tiered pricing ($7/$19/$39/$79).
- Position the product as manual consulting/audit/human-delivered service in copy.
- Add subscriptions, customer dashboards, or customer login.
- Migrate admin auth to Clerk JWT without explicit instruction (leave the existing TODO).
