use anyhow::Context;
use base64::{Engine, prelude::BASE64_URL_SAFE_NO_PAD};
use reqwest::header;
use serde::Deserialize;
use tokio::sync::RwLock;

use crate::{
    db::keyvalue::KeyValueStore,
    error::DumbError,
    utils::{HTTP_CLIENT, get_current_timestamp_seconds_since_epoch},
};

const KEY_ACCESS_TOKEN: &str = "auth0_access_token";

const KEY_REFRESH_TOKEN: &str = "auth0_refresh_token";

#[derive(Debug, Deserialize)]
pub struct TokenClaims {
    pub uname: String,
    pub perms: u64,
    pub exp: u64,
}

pub fn get_claims_from_token(s: &str) -> anyhow::Result<TokenClaims> {
    let (payload, _signature) = s.rsplit_once('.').context("invalid token: missing '.'")?;

    let (_header, payload) = payload
        .rsplit_once('.')
        .context("invalid token: missing '.'")?;

    let payload = BASE64_URL_SAFE_NO_PAD.decode(&payload)?;

    let claims = serde_json::from_slice::<TokenClaims>(&payload)?;

    return Ok(claims);
}

pub struct FfiAuthHandler {
    key_value_store: KeyValueStore,

    fetching_token: RwLock<()>,

    client_id: String,
    auth_base_url: String,
}

impl FfiAuthHandler {
    pub fn new(key_value_store: KeyValueStore, client_id: String, auth_base_url: String) -> Self {
        Self {
            key_value_store,
            fetching_token: RwLock::new(()),
            client_id,
            auth_base_url,
        }
    }

    pub async fn get_access_token(&self) -> anyhow::Result<String> {
        {
            let _ = self.fetching_token.read().await;
            if let Ok(token) = self.key_value_store.get(KEY_ACCESS_TOKEN).await {
                let claims = get_claims_from_token(&token)?;

                if claims.exp > get_current_timestamp_seconds_since_epoch() {
                    return Ok(token);
                }
            }
        }

        {
            log::info!("fetching new access token");
            let _g = self.fetching_token.write().await;
            let refresh_token = self
                .key_value_store
                .get(KEY_REFRESH_TOKEN)
                .await
                .map_err(|_| anyhow::anyhow!("refresh token not found"))?;

            let body = serde_json::json!({
                "grant_type": "refresh_token",
                "client_id": self.client_id,
                "refresh_token": refresh_token,
            });

            let response = HTTP_CLIENT
                .post(format!("{}/oauth/token", self.auth_base_url))
                .header(header::CONTENT_TYPE, "application/json")
                .body(serde_json::to_string(&body)?)
                .send()
                .await?;

            if !response.status().is_success() {
                return Err(anyhow::anyhow!(
                    "failed to refresh token, unexpected status: [{}] {}",
                    response.status().as_u16(),
                    response.text().await?
                ));
            }
            let body = response.text().await?;

            let response = serde_json::from_str::<TokenResponse>(&body)?;

            log::info!("Received new access token '{}'", body);
            self.key_value_store
                .set(KEY_ACCESS_TOKEN, &response.access_token)
                .await?;

            self.key_value_store
                .set(KEY_REFRESH_TOKEN, &response.refresh_token)
                .await?;

            return Ok(response.access_token);
        }
    }
}

#[derive(Deserialize)]
pub struct TokenResponse {
    pub access_token: String,
    pub refresh_token: String,
}

impl FfiAuthHandler {
    pub async fn set_access_token(&self, access_token: String) -> Result<(), DumbError> {
        self.key_value_store
            .set(KEY_ACCESS_TOKEN, &access_token)
            .await
            .map_err(DumbError::from_anyhow)
    }

    pub async fn set_refresh_token(&self, refresh_token: String) -> Result<(), DumbError> {
        self.key_value_store
            .set(KEY_REFRESH_TOKEN, &refresh_token)
            .await
            .map_err(DumbError::from_anyhow)
    }

    /// Returns true if a non-expired access token OR a refresh token exists.
    /// Used to avoid hammering the API before the user has logged in.
    pub async fn has_token(&self) -> bool {
        // Check for a valid non-expired access token first
        if let Ok(token) = self.key_value_store.get(KEY_ACCESS_TOKEN).await {
            if let Ok(claims) = get_claims_from_token(&token) {
                if claims.exp > get_current_timestamp_seconds_since_epoch() {
                    return true;
                }
            }
        }
        // Fall back to checking if a refresh token exists
        self.key_value_store.get(KEY_REFRESH_TOKEN).await.is_ok()
    }
}
