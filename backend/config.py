from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    port: int = 8000
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "postgres"
    db_user: str = "postgres"
    db_password: str = ""
    jwt_secret: str = "unsaid-page-2026"
    jwt_expires_in: str = "7d"
    cors_origin: str = "http://localhost:5173"
    node_env: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
