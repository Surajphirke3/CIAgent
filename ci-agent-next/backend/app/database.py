from motor.motor_asyncio import AsyncIOMotorClient

from app.config import settings


client = AsyncIOMotorClient(settings.mongodb_uri)
db = client.ci_agent

users_col = db["users"]
competitors_col = db["competitors"]
reports_col = db["reports"]
snapshots_col = db["snapshots"]
scrape_jobs_col = db["scrape_jobs"]

