# Afilo PitchKit

Production v0.1 workflow for the $149 Afilo PitchKit audit.

## Apps

- `apps/web`: Next.js 16 App Router frontend, Tailwind CSS v4 CSS-first tokens, Clerk-protected `/admin`.
- `apps/api`: Rust/Axum API with PostgreSQL persistence, Paddle webhook handling, and temporary token-protected admin APIs.

## Local Setup

1. Copy `.env.example` to `.env.local` for the web app and to the API process environment as needed.
2. Create the PostgreSQL database in `DATABASE_URL`.
3. Run SQLx migrations:

```bash
cd apps/api
cargo install sqlx-cli --no-default-features --features rustls,postgres
sqlx migrate run
```

4. Start the API:

```bash
cd apps/api
cargo run
```

5. Start the web app:

```bash
bun install
bun run dev
```

## Production Notes

- Run SQLx migrations against the target Postgres database before routing Paddle traffic to the API.
- Set both `NEXT_PUBLIC_API_BASE_URL` and server-only `API_BASE_URL`; the public value is used by the checkout form, while the server value is used by Clerk-protected admin pages.
- Paddle sandbox testing needs a public tunnel to `POST /api/webhooks/paddle`; configure `PADDLE_WEBHOOK_SECRET` from that endpoint and set `PADDLE_PRICE_ID_PITCHKIT_AUDIT` to the expected audit price.
- Vercel hosts `apps/web`; deploy `apps/api` as the Rust/Axum service with `DATABASE_URL`, `FRONTEND_ORIGIN`, `PADDLE_WEBHOOK_SECRET`, `PADDLE_PRICE_ID_PITCHKIT_AUDIT`, and `ADMIN_ACCESS_TOKEN`.
- `RESEND_API_KEY` and `INTERNAL_NOTIFY_EMAIL` are optional, but both must be set for internal notification delivery.

## v0.1 Boundaries

This version intentionally excludes PulseScout subscriptions, generated reports, Firecrawl/Exa automation, teams/workspaces, and customer dashboards. Admin API authorization uses `ADMIN_ACCESS_TOKEN` as a temporary v0.1 guard; Clerk JWT verification should replace it before expanding the internal surface.
