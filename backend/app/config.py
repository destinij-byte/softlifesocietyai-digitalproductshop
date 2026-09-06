from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db_name: str = "soft_life_society"

    jwt_secret: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 10080

    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_success_url: str = "https://app.softlifesociety.ai/academy/checkout/success"
    stripe_cancel_url: str = "https://app.softlifesociety.ai/academy/checkout/cancelled"

    email_provider: str = "sendgrid"
    sendgrid_api_key: str = ""
    postmark_server_token: str = ""
    email_from_address: str = "hello@softlifesociety.ai"
    email_from_name: str = "Soft Life Society"

    workbook_url_secret: str = "change-me-too"
    workbook_url_expire_seconds: int = 900

    inactivity_nudge_days: int = 5


settings = Settings()
