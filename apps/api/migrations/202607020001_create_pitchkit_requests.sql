CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE pitchkit_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT' CHECK (status IN ('PENDING_PAYMENT', 'IN_PROGRESS', 'DELIVERED', 'REFUNDED')),
    customer_email TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    company_name TEXT,
    website_url TEXT NOT NULL,
    target_audience TEXT,
    goal TEXT NOT NULL,
    notes TEXT,
    paddle_transaction_id TEXT UNIQUE,
    paddle_customer_id TEXT,
    paddle_price_id TEXT,
    amount INTEGER,
    currency TEXT,
    delivered_at TIMESTAMPTZ,
    internal_notes TEXT
);

CREATE INDEX pitchkit_requests_status_created_at_idx ON pitchkit_requests (status, created_at DESC);
CREATE INDEX pitchkit_requests_customer_email_idx ON pitchkit_requests (customer_email);

CREATE TABLE paddle_webhook_events (
    event_id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    received_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processed_at TIMESTAMPTZ,
    error TEXT
);

CREATE OR REPLACE FUNCTION set_pitchkit_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER pitchkit_requests_updated_at
BEFORE UPDATE ON pitchkit_requests
FOR EACH ROW
EXECUTE FUNCTION set_pitchkit_requests_updated_at();
