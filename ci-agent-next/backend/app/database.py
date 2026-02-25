from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


client = AsyncIOMotorClient(
    settings.mongodb_uri,
    serverSelectionTimeoutMS=5000,
    connectTimeoutMS=5000,
    socketTimeoutMS=10000,
)
db = client.ci_agent

users_col = db["users"]
competitors_col = db["competitors"]
reports_col = db["reports"]
snapshots_col = db["snapshots"]
scrape_jobs_col = db["scrape_jobs"]
signals_col = db["signals"]
scan_logs_col = db["scan_logs"]
alert_preferences_col = db["alert_preferences"]

