ALTER TABLE pitchkit_requests
    DROP CONSTRAINT pitchkit_requests_status_check;

ALTER TABLE pitchkit_requests
    ADD CONSTRAINT pitchkit_requests_status_check
    CHECK (status IN ('PENDING_PAYMENT', 'PAID', 'IN_PROGRESS', 'DELIVERED', 'REFUNDED', 'CANCELED'));
