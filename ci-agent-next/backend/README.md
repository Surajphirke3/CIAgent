# CI Agent – FastAPI Backend

This backend lives inside the `ci-agent-next/backend/` folder alongside the Next.js frontend.

## Requirements
- Python 3.11+
- MongoDB Atlas cluster (or local MongoDB 7+)
- Groq API key (for AI analysis)
- Gmail App Password (for email alerts)
- Slack Incoming Webhook URL (for Slack alerts)

## Setup

```powershell
# From the project root (ci-agent-next/)
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1          # Windows PowerShell
# source venv/bin/activate           # macOS / Linux

# Install dependencies
pip install -r requirements.txt

# Copy .env template and fill in your credentials
Copy-Item .env.example .env
# Then open .env and set all values
```

## Running the server

```powershell
# From inside ci-agent-next/backend/
uvicorn app.main:app --reload --port 8000
```

- API root:    http://localhost:8000
- Health:      http://localhost:8000/health
- Swagger UI:  http://localhost:8000/docs
- ReDoc:       http://localhost:8000/redoc

## Environment Variables

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for signing JWTs |
| `JWT_ALGORITHM` | Algorithm (default: `HS256`) |
| `JWT_EXPIRE_MINUTES` | Token lifetime in minutes (default: `1440`) |
| `GROQ_API_KEY` | Groq API key for AI-powered change analysis |
| `GMAIL_USER` | Gmail address used to send alert emails |
| `GMAIL_APP_PASSWORD` | Gmail App Password (not your regular password) |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL for Slack alerts |
| `FRONTEND_URL` | URL of the Next.js frontend (default: `http://localhost:3000`) |

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/health` | ❌ | Liveness check |
| POST | `/auth/register` | ❌ | Create account |
| POST | `/auth/login` | ❌ | Login (OAuth2 form) → JWT |
| GET | `/auth/me` | ✅ | Current user profile |
| GET | `/competitors/` | ✅ | List competitors |
| POST | `/competitors/` | ✅ | Add competitor |
| GET | `/competitors/{id}` | ✅ | Get competitor |
| PATCH | `/competitors/{id}` | ✅ | Update competitor |
| DELETE | `/competitors/{id}` | ✅ | Delete competitor |
| GET | `/reports/` | ✅ | List reports |
| GET | `/reports/{id}` | ✅ | Get report |
| POST | `/scrape/trigger/{id}` | ✅ | Queue scrape for one competitor |
| POST | `/scrape/trigger-all` | ✅ | Queue scrape for all active competitors |
| POST | `/notifications/test` | ✅ | Test auth wiring (stub) |

## Running alongside the frontend

Open two terminals:

```powershell
# Terminal 1 – Backend
cd ci-agent-next/backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000

# Terminal 2 – Frontend
cd ci-agent-next
npm run dev
```
