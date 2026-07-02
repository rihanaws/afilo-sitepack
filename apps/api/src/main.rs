use axum::{
    body::Bytes,
    extract::{Path, Query, State},
    http::{header, HeaderMap, HeaderValue, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, patch, post},
    Json, Router,
};
use chrono::{DateTime, Utc};
use hmac::{Hmac, Mac};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use sha2::Sha256;
use sqlx::{postgres::PgPoolOptions, PgPool};
use std::{env, net::SocketAddr, sync::Arc};
use thiserror::Error;
use tower_http::{cors::CorsLayer, trace::TraceLayer};
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};
use uuid::Uuid;

type HmacSha256 = Hmac<Sha256>;

#[derive(Clone)]
struct AppState {
    pool: PgPool,
    config: Arc<Config>,
    http: reqwest::Client,
}

#[derive(Clone)]
struct Config {
    frontend_origin: HeaderValue,
    paddle_webhook_secret: String,
    paddle_price_id: Option<String>,
    admin_access_token: String,
    resend_api_key: Option<String>,
    internal_notify_email: Option<String>,
}

#[derive(Debug, Error)]
enum ApiError {
    #[error("{0}")]
    BadRequest(String),
    #[error("Unauthorized")]
    Unauthorized,
    #[error("Not found")]
    NotFound,
    #[error("Database error")]
    Database(#[from] sqlx::Error),
    #[error("Webhook signature verification failed")]
    WebhookSignature,
    #[error("Internal server error")]
    Internal,
}

#[derive(Serialize)]
struct ErrorBody {
    error: String,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        let status = match self {
            ApiError::BadRequest(_) => StatusCode::BAD_REQUEST,
            ApiError::Unauthorized => StatusCode::UNAUTHORIZED,
            ApiError::NotFound => StatusCode::NOT_FOUND,
            ApiError::Database(_) | ApiError::Internal => StatusCode::INTERNAL_SERVER_ERROR,
            ApiError::WebhookSignature => StatusCode::BAD_REQUEST,
        };

        (
            status,
            Json(ErrorBody {
                error: self.to_string(),
            }),
        )
            .into_response()
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct CreatePitchKitRequest {
    customer_email: String,
    customer_name: String,
    company_name: Option<String>,
    website_url: String,
    target_audience: Option<String>,
    goal: String,
    notes: Option<String>,
}

#[derive(Debug, Deserialize)]
struct AdminListQuery {
    status: Option<PitchKitStatus>,
}

#[derive(Debug, Deserialize)]
struct UpdateStatusRequest {
    status: PitchKitStatus,
    internal_notes: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, Copy, PartialEq, Eq)]
#[serde(rename_all = "SCREAMING_SNAKE_CASE")]
enum PitchKitStatus {
    PendingPayment,
    Paid,
    InProgress,
    Delivered,
    Refunded,
    Canceled,
}

impl PitchKitStatus {
    fn as_str(self) -> &'static str {
        match self {
            PitchKitStatus::PendingPayment => "PENDING_PAYMENT",
            PitchKitStatus::Paid => "PAID",
            PitchKitStatus::InProgress => "IN_PROGRESS",
            PitchKitStatus::Delivered => "DELIVERED",
            PitchKitStatus::Refunded => "REFUNDED",
            PitchKitStatus::Canceled => "CANCELED",
        }
    }

    /// Admin-driven transitions allowed from the fulfillment queue.
    fn allowed_admin_transition(from: &str, to: PitchKitStatus) -> bool {
        matches!(
            (from, to),
            ("PAID", PitchKitStatus::InProgress)
                | ("IN_PROGRESS", PitchKitStatus::Delivered)
                | ("PENDING_PAYMENT", PitchKitStatus::Canceled)
                | ("PAID", PitchKitStatus::Refunded)
                | ("IN_PROGRESS", PitchKitStatus::Refunded)
                | ("DELIVERED", PitchKitStatus::Refunded)
        )
    }
}

#[derive(Debug, Serialize, sqlx::FromRow)]
#[serde(rename_all = "camelCase")]
struct PitchKitRequestRow {
    id: Uuid,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    status: String,
    customer_email: String,
    customer_name: String,
    company_name: Option<String>,
    website_url: String,
    target_audience: Option<String>,
    goal: String,
    notes: Option<String>,
    paddle_transaction_id: Option<String>,
    paddle_customer_id: Option<String>,
    paddle_price_id: Option<String>,
    amount: Option<i32>,
    currency: Option<String>,
    delivered_at: Option<DateTime<Utc>>,
    internal_notes: Option<String>,
}

#[derive(Serialize)]
struct CreateResponse {
    request: PitchKitRequestRow,
}

#[derive(Serialize)]
struct ListResponse {
    requests: Vec<PitchKitRequestRow>,
}

#[tokio::main]
async fn main() -> Result<(), ApiError> {
    tracing_subscriber::registry()
        .with(
            tracing_subscriber::EnvFilter::try_from_default_env()
                .unwrap_or_else(|_| "afilo_pitchkit_api=info,tower_http=info".into()),
        )
        .with(tracing_subscriber::fmt::layer())
        .init();

    let database_url = required_env("DATABASE_URL");
    let config = Arc::new(Config {
        frontend_origin: allowed_origin_header(
            &env::var("FRONTEND_ORIGIN").unwrap_or_else(|_| "http://localhost:3000".to_string()),
        )?,
        paddle_webhook_secret: required_env("PADDLE_WEBHOOK_SECRET"),
        paddle_price_id: env::var("PADDLE_PRICE_ID_PITCHKIT_AUDIT")
            .ok()
            .filter(|value| !value.is_empty()),
        admin_access_token: required_env("ADMIN_ACCESS_TOKEN"),
        resend_api_key: env::var("RESEND_API_KEY")
            .ok()
            .filter(|value| !value.is_empty()),
        internal_notify_email: env::var("INTERNAL_NOTIFY_EMAIL")
            .ok()
            .filter(|value| !value.is_empty()),
    });

    let pool = PgPoolOptions::new()
        .max_connections(8)
        .connect(&database_url)
        .await?;

    let state = AppState {
        pool,
        config,
        http: reqwest::Client::new(),
    };

    let cors = CorsLayer::new()
        .allow_origin(state.config.frontend_origin.clone())
        .allow_methods([Method::GET, Method::POST, Method::PATCH, Method::OPTIONS])
        .allow_headers([header::CONTENT_TYPE, header::AUTHORIZATION]);

    let app = Router::new()
        .route("/health", get(health))
        .route("/api/pitchkit/requests", post(create_request))
        .route("/api/pitchkit/requests/:id", get(get_request))
        .route("/api/admin/requests", get(list_admin_requests))
        .route("/api/admin/requests/:id/status", patch(update_admin_status))
        .route("/api/webhooks/paddle", post(paddle_webhook))
        .layer(TraceLayer::new_for_http())
        .layer(cors)
        .with_state(state);

    let port = env::var("PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(4000);
    let addr = SocketAddr::from(([0, 0, 0, 0], port));
    tracing::info!(%addr, "starting Afilo PitchKit API");
    let listener = tokio::net::TcpListener::bind(addr)
        .await
        .map_err(|_| ApiError::Internal)?;
    axum::serve(listener, app)
        .await
        .map_err(|_| ApiError::Internal)
}

async fn health() -> Json<Value> {
    Json(serde_json::json!({ "status": "ok", "service": "afilo-pitchkit-api" }))
}

async fn create_request(
    State(state): State<AppState>,
    Json(payload): Json<CreatePitchKitRequest>,
) -> Result<Json<CreateResponse>, ApiError> {
    validate_create_request(&payload)?;

    let row = sqlx::query_as::<_, PitchKitRequestRow>(
        r#"
        INSERT INTO pitchkit_requests (
            customer_email, customer_name, company_name, website_url, target_audience, goal, notes
        )
        VALUES ($1, $2, NULLIF($3, ''), $4, NULLIF($5, ''), $6, NULLIF($7, ''))
        RETURNING *
        "#,
    )
    .bind(payload.customer_email.trim().to_lowercase())
    .bind(payload.customer_name.trim())
    .bind(payload.company_name.unwrap_or_default().trim().to_string())
    .bind(payload.website_url.trim())
    .bind(
        payload
            .target_audience
            .unwrap_or_default()
            .trim()
            .to_string(),
    )
    .bind(payload.goal.trim())
    .bind(payload.notes.unwrap_or_default().trim().to_string())
    .fetch_one(&state.pool)
    .await?;

    Ok(Json(CreateResponse { request: row }))
}

async fn get_request(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<CreateResponse>, ApiError> {
    require_admin(&state, &headers)?;
    let row =
        sqlx::query_as::<_, PitchKitRequestRow>("SELECT * FROM pitchkit_requests WHERE id = $1")
            .bind(id)
            .fetch_optional(&state.pool)
            .await?
            .ok_or(ApiError::NotFound)?;

    Ok(Json(CreateResponse { request: row }))
}

async fn list_admin_requests(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(query): Query<AdminListQuery>,
) -> Result<Json<ListResponse>, ApiError> {
    require_admin(&state, &headers)?;

    let requests = if let Some(status) = query.status {
        sqlx::query_as::<_, PitchKitRequestRow>(
            "SELECT * FROM pitchkit_requests WHERE status = $1 ORDER BY created_at DESC LIMIT 200",
        )
        .bind(status.as_str())
        .fetch_all(&state.pool)
        .await?
    } else {
        sqlx::query_as::<_, PitchKitRequestRow>(
            "SELECT * FROM pitchkit_requests ORDER BY created_at DESC LIMIT 200",
        )
        .fetch_all(&state.pool)
        .await?
    };

    Ok(Json(ListResponse { requests }))
}

async fn update_admin_status(
    State(state): State<AppState>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
    Json(payload): Json<UpdateStatusRequest>,
) -> Result<Json<CreateResponse>, ApiError> {
    require_admin(&state, &headers)?;

    let current_status: (String,) =
        sqlx::query_as("SELECT status FROM pitchkit_requests WHERE id = $1")
            .bind(id)
            .fetch_optional(&state.pool)
            .await?
            .ok_or(ApiError::NotFound)?;

    if !PitchKitStatus::allowed_admin_transition(&current_status.0, payload.status) {
        return Err(ApiError::BadRequest(format!(
            "Cannot transition from {} to {}.",
            current_status.0,
            payload.status.as_str()
        )));
    }

    let delivered_at_expr = if payload.status == PitchKitStatus::Delivered {
        "now()"
    } else {
        "delivered_at"
    };

    let sql = format!(
        "UPDATE pitchkit_requests SET status = $1, internal_notes = COALESCE(NULLIF($2, ''), internal_notes), delivered_at = {delivered_at_expr} WHERE id = $3 RETURNING *"
    );

    let row = sqlx::query_as::<_, PitchKitRequestRow>(&sql)
        .bind(payload.status.as_str())
        .bind(
            payload
                .internal_notes
                .unwrap_or_default()
                .trim()
                .to_string(),
        )
        .bind(id)
        .fetch_optional(&state.pool)
        .await?
        .ok_or(ApiError::NotFound)?;

    Ok(Json(CreateResponse { request: row }))
}

async fn paddle_webhook(
    State(state): State<AppState>,
    headers: HeaderMap,
    body: Bytes,
) -> Result<Json<Value>, ApiError> {
    verify_paddle_signature(&state.config.paddle_webhook_secret, &headers, &body)?;

    let event: PaddleEvent = serde_json::from_slice(&body)
        .map_err(|_| ApiError::BadRequest("Invalid Paddle payload.".to_string()))?;

    let processed_at = sqlx::query_scalar::<_, Option<DateTime<Utc>>>("INSERT INTO paddle_webhook_events (event_id, event_type) VALUES ($1, $2) ON CONFLICT (event_id) DO UPDATE SET event_type = EXCLUDED.event_type RETURNING processed_at")
        .bind(&event.event_id)
        .bind(&event.event_type)
        .fetch_one(&state.pool)
        .await?
        ;

    if processed_at.is_some() {
        return Ok(Json(
            serde_json::json!({ "received": true, "duplicate": true }),
        ));
    }

    let result = if event.event_type == "transaction.completed" {
        handle_transaction_completed(&state, event.data).await
    } else if event.event_type == "adjustment.updated" {
        handle_adjustment_updated(&state, event.data).await
    } else {
        Ok(())
    };

    match result {
        Ok(()) => {
            sqlx::query(
                "UPDATE paddle_webhook_events SET processed_at = now(), error = NULL WHERE event_id = $1",
            )
            .bind(&event.event_id)
            .execute(&state.pool)
            .await?;
        }
        Err(error) => {
            sqlx::query("UPDATE paddle_webhook_events SET error = $2 WHERE event_id = $1")
                .bind(&event.event_id)
                .bind(error.to_string())
                .execute(&state.pool)
                .await?;
            return Err(error);
        }
    }

    Ok(Json(serde_json::json!({ "received": true })))
}

async fn handle_transaction_completed(state: &AppState, data: Value) -> Result<(), ApiError> {
    let transaction_id = data
        .get("id")
        .and_then(Value::as_str)
        .ok_or_else(|| ApiError::BadRequest("Missing Paddle transaction id.".to_string()))?;
    let custom_data = data
        .get("custom_data")
        .and_then(Value::as_object)
        .ok_or_else(|| ApiError::BadRequest("Missing Paddle custom data.".to_string()))?;
    let request_id = custom_data
        .get("pitchkit_request_id")
        .and_then(Value::as_str)
        .and_then(|value| Uuid::parse_str(value).ok())
        .ok_or_else(|| {
            ApiError::BadRequest("Missing pitchkit_request_id custom data.".to_string())
        })?;
    let customer_id = data.get("customer_id").and_then(Value::as_str);
    let currency = data
        .pointer("/details/totals/currency_code")
        .and_then(Value::as_str)
        .or_else(|| data.get("currency_code").and_then(Value::as_str));
    let amount = data
        .pointer("/details/totals/grand_total")
        .and_then(Value::as_str)
        .and_then(|value| value.parse::<i32>().ok());
    let price_id = data
        .pointer("/items/0/price/id")
        .and_then(Value::as_str)
        .or_else(|| data.get("price_id").and_then(Value::as_str));
    if let Some(expected_price_id) = &state.config.paddle_price_id {
        if price_id != Some(expected_price_id.as_str()) {
            return Err(ApiError::BadRequest(
                "Paddle transaction price does not match the PitchKit audit price.".to_string(),
            ));
        }
    }

    let updated = sqlx::query_as::<_, PitchKitRequestRow>(
        r#"
        UPDATE pitchkit_requests
        SET status = 'PAID',
            paddle_transaction_id = $1,
            paddle_customer_id = $2,
            paddle_price_id = $3,
            amount = $4,
            currency = $5
        WHERE id = $6 AND status = 'PENDING_PAYMENT'
        RETURNING *
        "#,
    )
    .bind(transaction_id)
    .bind(customer_id)
    .bind(price_id)
    .bind(amount)
    .bind(currency)
    .bind(request_id)
    .fetch_optional(&state.pool)
    .await?;

    let row = match updated {
        Some(row) => row,
        None => {
            sqlx::query_as::<_, PitchKitRequestRow>("SELECT * FROM pitchkit_requests WHERE id = $1")
                .bind(request_id)
                .fetch_optional(&state.pool)
                .await?
                .ok_or(ApiError::NotFound)?
        }
    };

    notify_internal(state, &row).await;
    notify_customer(state, &row).await;
    Ok(())
}

async fn handle_adjustment_updated(state: &AppState, data: Value) -> Result<(), ApiError> {
    let action = data.get("action").and_then(Value::as_str).unwrap_or("");
    let status = data.get("status").and_then(Value::as_str).unwrap_or("");

    if action != "refund" || !matches!(status, "approved" | "succeeded") {
        return Ok(());
    }

    let transaction_id = data
        .get("transaction_id")
        .and_then(Value::as_str)
        .ok_or_else(|| ApiError::BadRequest("Missing Paddle transaction id.".to_string()))?;

    sqlx::query(
        "UPDATE pitchkit_requests SET status = 'REFUNDED' WHERE paddle_transaction_id = $1",
    )
    .bind(transaction_id)
    .execute(&state.pool)
    .await?;

    Ok(())
}

async fn notify_internal(state: &AppState, row: &PitchKitRequestRow) {
    let (Some(api_key), Some(to_email)) = (
        &state.config.resend_api_key,
        &state.config.internal_notify_email,
    ) else {
        return;
    };

    let payload = serde_json::json!({
        "from": "Afilo PitchKit <pitchkit@afilo.io>",
        "to": [to_email],
        "subject": format!("New paid PitchKit: {}", row.customer_name),
        "text": format!(
            "A new paid PitchKit request is ready.\n\nCustomer: {} <{}>\nWebsite: {}\nGoal: {}\nRequest ID: {}",
            row.customer_name, row.customer_email, row.website_url, row.goal, row.id
        )
    });

    let result = state
        .http
        .post("https://api.resend.com/emails")
        .bearer_auth(api_key)
        .json(&payload)
        .send()
        .await;

    if let Err(error) = result {
        tracing::warn!(%error, request_id = %row.id, "failed to send internal notification");
    }
}

async fn notify_customer(state: &AppState, row: &PitchKitRequestRow) {
    let Some(api_key) = &state.config.resend_api_key else {
        return;
    };

    let payload = serde_json::json!({
        "from": "Afilo PitchKit <pitchkit@afilo.io>",
        "to": [row.customer_email],
        "subject": "Your Afilo PitchKit Growth Report is confirmed",
        "text": format!(
            "Hi {name},\n\n\
            Your order is confirmed. Your Afilo PitchKit Growth Report for {website} is now in progress.\n\n\
            Your report will include:\n\
            - Positioning diagnosis\n\
            - Headline & subheading improvements\n\
            - Conversion gaps\n\
            - Lead magnet ideas\n\
            - Outreach angle\n\
            - LinkedIn content idea\n\
            - SEO/content brief\n\
            - Recommended next actions\n\n\
            It will arrive in your inbox within 48 hours of payment confirmation.\n\n\
            Questions? Reach us at support@afilo.io.\n\n\
            — Afilo PitchKit",
            name = row.customer_name,
            website = row.website_url,
        )
    });

    let result = state
        .http
        .post("https://api.resend.com/emails")
        .bearer_auth(api_key)
        .json(&payload)
        .send()
        .await;

    if let Err(error) = result {
        tracing::warn!(%error, request_id = %row.id, "failed to send customer confirmation email");
    }
}

#[derive(Debug, Deserialize)]
struct PaddleEvent {
    event_id: String,
    event_type: String,
    data: Value,
}

fn verify_paddle_signature(
    secret: &str,
    headers: &HeaderMap,
    body: &Bytes,
) -> Result<(), ApiError> {
    let signature = headers
        .get("Paddle-Signature")
        .and_then(|value| value.to_str().ok())
        .ok_or(ApiError::WebhookSignature)?;

    let timestamp = signature_part(signature, "ts").ok_or(ApiError::WebhookSignature)?;
    let expected_h1 = signature_part(signature, "h1").ok_or(ApiError::WebhookSignature)?;
    let signed_payload = format!("{}:{}", timestamp, String::from_utf8_lossy(body));
    let mut mac =
        HmacSha256::new_from_slice(secret.as_bytes()).map_err(|_| ApiError::WebhookSignature)?;
    mac.update(signed_payload.as_bytes());
    let actual = hex::encode(mac.finalize().into_bytes());

    if constant_time_eq(actual.as_bytes(), expected_h1.as_bytes()) {
        Ok(())
    } else {
        Err(ApiError::WebhookSignature)
    }
}

fn signature_part<'a>(signature: &'a str, key: &str) -> Option<&'a str> {
    signature
        .split(';')
        .filter_map(|part| part.split_once('='))
        .find_map(|(part_key, value)| (part_key.trim() == key).then_some(value.trim()))
}

fn constant_time_eq(left: &[u8], right: &[u8]) -> bool {
    if left.len() != right.len() {
        return false;
    }
    left.iter()
        .zip(right)
        .fold(0_u8, |acc, (a, b)| acc | (a ^ b))
        == 0
}

fn validate_create_request(payload: &CreatePitchKitRequest) -> Result<(), ApiError> {
    validate_len("customerName", payload.customer_name.trim(), 2, 120)?;
    validate_len("customerEmail", payload.customer_email.trim(), 5, 254)?;
    validate_len("websiteUrl", payload.website_url.trim(), 8, 2048)?;
    validate_len("goal", payload.goal.trim(), 8, 600)?;
    validate_optional_len("companyName", payload.company_name.as_deref(), 120)?;
    validate_optional_len("targetAudience", payload.target_audience.as_deref(), 240)?;
    validate_optional_len("notes", payload.notes.as_deref(), 1200)?;

    if !payload.customer_email.contains('@') {
        return Err(ApiError::BadRequest(
            "Enter a valid email address.".to_string(),
        ));
    }

    let url = reqwest::Url::parse(payload.website_url.trim()).map_err(|_| {
        ApiError::BadRequest("Website URL must be a valid HTTP or HTTPS URL.".to_string())
    })?;
    if (url.scheme() != "http" && url.scheme() != "https")
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
    {
        return Err(ApiError::BadRequest(
            "Website URL must be public HTTP or HTTPS without credentials.".to_string(),
        ));
    }

    Ok(())
}

fn validate_len(field: &str, value: &str, min: usize, max: usize) -> Result<(), ApiError> {
    let len = value.chars().count();
    if len < min || len > max {
        return Err(ApiError::BadRequest(format!(
            "{field} must be between {min} and {max} characters."
        )));
    }
    Ok(())
}

fn validate_optional_len(field: &str, value: Option<&str>, max: usize) -> Result<(), ApiError> {
    if let Some(value) = value {
        if value.chars().count() > max {
            return Err(ApiError::BadRequest(format!(
                "{field} must be {max} characters or fewer."
            )));
        }
    }
    Ok(())
}

fn allowed_origin_header(value: &str) -> Result<HeaderValue, ApiError> {
    let url = reqwest::Url::parse(value).map_err(|_| {
        ApiError::BadRequest("FRONTEND_ORIGIN must be a valid HTTP or HTTPS origin.".to_string())
    })?;
    if (url.scheme() != "http" && url.scheme() != "https")
        || url.host_str().is_none()
        || !url.username().is_empty()
        || url.password().is_some()
        || url.path() != "/"
        || url.query().is_some()
        || url.fragment().is_some()
    {
        return Err(ApiError::BadRequest(
            "FRONTEND_ORIGIN must be an HTTP(S) origin without path, query, credentials, or fragment."
                .to_string(),
        ));
    }

    HeaderValue::from_str(value).map_err(|_| {
        ApiError::BadRequest("FRONTEND_ORIGIN must be a valid HTTP header value.".to_string())
    })
}

fn require_admin(state: &AppState, headers: &HeaderMap) -> Result<(), ApiError> {
    let token = headers
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .ok_or(ApiError::Unauthorized)?;

    if constant_time_eq(token.as_bytes(), state.config.admin_access_token.as_bytes()) {
        Ok(())
    } else {
        Err(ApiError::Unauthorized)
    }
}

fn required_env(name: &str) -> String {
    env::var(name).unwrap_or_else(|_| panic!("{name} is required"))
}
