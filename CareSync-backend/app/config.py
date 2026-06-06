from pydantic_settings import BaseSettings
from pydantic import ConfigDict, Field
from typing import Optional

class Settings(BaseSettings):
    # Database 
    database_url: str 

    # JWT 
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # Email
    resend_api_key: Optional[str] = None
    sendgrid_api_key: Optional[str] = None
    email_provider: str = "resend"
    email_from: str = "noreply@caresync.com"

    # Environment
    environment: str = "development"

    # This tells Pydantic to look for a .env file
    model_config = ConfigDict(
        env_file=".env", 
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()