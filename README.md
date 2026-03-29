<div align="center">

# 🤖 CIAgent — Competitive Intelligence Agent

**AI-powered competitive intelligence platform that monitors competitors, surfaces actionable signals, and generates strategic reports — automatically.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![Version](https://img.shields.io/badge/version-0.1.0-brightgreen.svg)](./ci-agent-next/package.json)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)](https://www.typescriptlang.org)
[![Python](https://img.shields.io/badge/Python-3.11+-3776ab?logo=python)](https://python.org)

</div>

---

## 📖 Table of Contents

1. [About the Project](#-about-the-project)
2. [Features](#-features)
3. [Tech Stack](#-tech-stack)
4. [Prerequisites](#-prerequisites)
5. [Installation & Setup](#-installation--setup)
6. [Usage Guide](#-usage-guide)
7. [Screenshots](#-screenshots)
8. [API Documentation](#-api-documentation)
9. [Configuration & Environment Variables](#-configuration--environment-variables)
10. [Folder Structure](#-folder-structure)
11. [Roadmap](#-roadmap)
12. [Contributing](#-contributing)
13. [License](#-license)
14. [Acknowledgements](#-acknowledgements)

---

## 🔍 About the Project

Keeping tabs on competitors is time-consuming and fragmented. Teams manually check websites, scan social feeds, and piece together reports — all activities that eat hours of valuable time and produce stale insights.

**CIAgent** solves this by automating competitive monitoring end-to-end:

- 🕷️ **Scrapes** competitor websites automatically on a configurable schedule
- 🧠 **Analyses** detected changes using Groq's LLM to classify signal types (pricing shifts, product launches, new hires, tech patents, acquisitions)
- 📊 **Generates** structured intelligence reports ready for stakeholder review
- 🔔 **Notifies** your team via email and Slack the moment a meaningful signal is detected

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏢 **Competitor Tracking** | Add, manage, and categorise unlimited competitor profiles with threat-level scoring |
| 📡 **Real-time Signal Feed** | Live intelligence feed classified by signal type — pricing, hiring, product, IP, M&A |
| 🤖 **AI-Powered Analysis** | Groq LLM analyses raw diffs and extracts structured competitive insights |
| 📝 **Report Generation** | One-click strategic reports with historical comparison and trend analysis |
| 🔔 **Multi-channel Alerts** | Email (Gmail) and Slack notifications when high-priority signals are detected |
| 🗓️ **Scheduled Scraping** | APScheduler runs continuous, configurable scrape cycles without manual intervention |
| 🔐 **JWT Authentication** | Secure user accounts with token-based authentication and bcrypt password hashing |
| 🎨 **Immersive UI** | Canvas frame-sequence animations, frosted-glass components, and neon design system |

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| [Next.js](https://nextjs.org) | 16 | React framework (App Router) |
| [TypeScript](https://www.typescriptlang.org) | 5 | Type-safe JavaScript |
| [Tailwind CSS](https://tailwindcss.com) | 4 | Utility-first styling |
| [Framer Motion](https://www.framer.com/motion/) | 12 | UI animations |
| [Lucide React](https://lucide.dev) | 0.575 | Icon library |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| [FastAPI](https://fastapi.tiangolo.com) | 0.111 | Python web framework |
| [Uvicorn](https://www.uvicorn.org) | 0.30 | ASGI server |
| [MongoDB](https://www.mongodb.com) + [Motor](https://motor.readthedocs.io) | 3.4 | Async database |
| [Playwright](https://playwright.dev) | 1.48 | Headless web scraping |
| [BeautifulSoup4](https://www.crummy.com/software/BeautifulSoup/) | 4.12 | HTML parsing |
| [Groq](https://groq.com) | 0.9 | LLM for AI analysis |
| [APScheduler](https://apscheduler.readthedocs.io) | 3.10 | Job scheduling |
| [python-jose](https://python-jose.readthedocs.io) | 3.3 | JWT authentication |
| [aiosmtplib](https://aiosmtplib.readthedocs.io) | 3.0 | Async email delivery |
| [SlowAPI](https://slowapi.readthedocs.io) | 0.1.9 | Rate limiting |

---

## ✅ Prerequisites

- **Node.js** ≥ 18.x and **npm** ≥ 9.x
- **Python** ≥ 3.11
- **MongoDB Atlas** cluster (or local MongoDB 7+)
- **Groq API key** — [console.groq.com](https://console.groq.com)
- **Gmail account** with an [App Password](https://support.google.com/accounts/answer/185833) configured
- **Slack Incoming Webhook URL** (optional, for Slack alerts)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Surajphirke3/CIAgent.git
cd CIAgent
```

### 2. Frontend Setup

```bash
cd ci-agent-next

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at **http://localhost:3000**.

### 3. Backend Setup

```bash
cd ci-agent-next/backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# .\venv\Scripts\Activate.ps1  # Windows PowerShell

# Install Python dependencies
pip install -r requirements.txt

# Install Playwright browsers
playwright install chromium
```

### 4. Configure Environment Variables

```bash
# Copy the example env file and fill in your values
cp .env.example .env
```

See the [Configuration section](#-configuration--environment-variables) for all required variables.

### 5. Start the Backend

```bash
# From ci-agent-next/backend/ with venv activated
uvicorn app.main:app --reload --port 8000
```

The API will be available at **http://localhost:8000**.

### 6. Run Both Services Together

Open two terminal windows:

```bash
# Terminal 1 – Backend
cd ci-agent-next/backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2 – Frontend
cd ci-agent-next
npm run dev
```

---

## 📘 Usage Guide

### Adding a Competitor

1. Log in at **http://localhost:3000/login** (register first if needed)
2. Navigate to **Dashboard → Competitors**
3. Click the **+** FAB (floating action button) or "Add Competitor"
4. Enter the competitor's name and website URL
5. Save — the system will schedule the first scrape automatically

### Viewing Signals

Navigate to **Dashboard → Signals** to see the real-time intelligence feed. Each signal card shows:
- **Signal type** (Pricing Shift, Product Launch, New Hire, Tech Patent, Acquisition)
- **Competitor name** and detected change summary
- **Timestamp** and confidence score

### Generating a Report

1. Go to **Dashboard → Reports**
2. Select a competitor or choose "All Competitors"
3. Click **Generate Report**
4. The AI analyses recent signals and produces a structured strategic report

### Testing the API

```bash
# Health check
curl http://localhost:8000/health

# Register a new user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "you@example.com", "password": "your-password", "full_name": "Your Name"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -F "username=you@example.com" \
  -F "password=your-password"

# Add a competitor (replace TOKEN with your JWT)
curl -X POST http://localhost:8000/competitors/ \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "url": "https://acme.com"}'
```

---

## 📸 Screenshots

> Screenshots will be added as the UI is finalised. The sections below outline the primary views.

| Page | Description |
|------|-------------|
| **Landing** | Animated hero with frame-sequence canvas background |
| **Login / Sign Up** | Frosted-glass auth forms with animated background |
| **Dashboard Overview** | KPI cards, recent signals, and report summaries |
| **Competitors** | Competitor list with threat levels and trend graphs |
| **Signals Feed** | Classified intelligence cards with AI-generated summaries |
| **Reports** | Report history, templates, and one-click generation |

---

## 📡 API Documentation

Interactive documentation is auto-generated by FastAPI:

| UI | URL |
|----|-----|
| **Swagger UI** | http://localhost:8000/docs |
| **ReDoc** | http://localhost:8000/redoc |

### Endpoint Reference

| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| `GET` | `/health` | ❌ | Liveness check |
| `POST` | `/auth/register` | ❌ | Create a new user account |
| `POST` | `/auth/login` | ❌ | Login → returns JWT |
| `GET` | `/auth/me` | ✅ | Get current user profile |
| `GET` | `/competitors/` | ✅ | List all tracked competitors |
| `POST` | `/competitors/` | ✅ | Add a new competitor |
| `GET` | `/competitors/{id}` | ✅ | Get a competitor by ID |
| `PATCH` | `/competitors/{id}` | ✅ | Update a competitor |
| `DELETE` | `/competitors/{id}` | ✅ | Remove a competitor |
| `GET` | `/reports/` | ✅ | List all reports |
| `GET` | `/reports/{id}` | ✅ | Get a report by ID |
| `POST` | `/scrape/trigger/{id}` | ✅ | Queue a scrape for one competitor |
| `POST` | `/scrape/trigger-all` | ✅ | Queue scrapes for all active competitors |
| `POST` | `/notifications/test` | ✅ | Test notification routing |

> ✅ = requires `Authorization: Bearer <token>` header

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file inside `ci-agent-next/backend/` with the following variables:

```dotenv
# ── Database ────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/<database>

# ── Authentication ───────────────────────────────────────────────────────────
JWT_SECRET=your-very-secret-key-here
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440

# ── AI Analysis ──────────────────────────────────────────────────────────────
GROQ_API_KEY=gsk_...

# ── Email Alerts ─────────────────────────────────────────────────────────────
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=xxxx-xxxx-xxxx-xxxx

# ── Slack Alerts (optional) ──────────────────────────────────────────────────
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# ── Frontend ─────────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:3000
```

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `MONGODB_URI` | ✅ | — | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ | — | Secret used to sign JWT tokens |
| `JWT_ALGORITHM` | ❌ | `HS256` | JWT signing algorithm |
| `JWT_EXPIRE_MINUTES` | ❌ | `1440` | Token lifetime (minutes) |
| `GROQ_API_KEY` | ✅ | — | Groq LLM API key |
| `GMAIL_USER` | ✅ | — | Gmail address for outbound alerts |
| `GMAIL_APP_PASSWORD` | ✅ | — | Gmail App Password (not your login password) |
| `SLACK_WEBHOOK_URL` | ❌ | — | Slack Incoming Webhook for team alerts |
| `FRONTEND_URL` | ❌ | `http://localhost:3000` | Frontend URL (used in CORS and emails) |

---

## 📂 Folder Structure

```
CIAgent/
├── AGENT.md                        # 3-layer architecture specification
├── CONTRIBUTING.md                 # Contributor guide
├── LICENSE                         # MIT License
├── README.md                       # This file
├── structure.md                    # Detailed project structure docs
├── workflow.md                     # n8n integration strategy
│
├── directives/                     # Layer 1 – SOPs & constraints
│   └── project_architecture.md
│
├── skills/                         # Reusable logic frameworks
│   ├── brand-guidelines/
│   ├── frontend-design/
│   └── skill-creator/
│
└── ci-agent-next/                  # Layer 3 – Execution layer
    ├── package.json
    ├── tsconfig.json
    ├── next.config.ts
    ├── eslint.config.mjs
    │
    ├── public/                     # Static assets & animation videos
    │
    ├── src/
    │   ├── app/                    # Next.js App Router pages
    │   │   ├── page.tsx            # Landing page
    │   │   ├── login/
    │   │   ├── signup/
    │   │   ├── forgot-password/
    │   │   ├── reset-password/
    │   │   └── dashboard/          # Protected dashboard shell + sub-pages
    │   │       ├── competitors/
    │   │       ├── signals/
    │   │       ├── reports/
    │   │       └── profile/
    │   │
    │   ├── components/
    │   │   ├── layout/             # Navbar, Footer
    │   │   ├── sections/           # Hero, Problem, Workflow, Architecture, CTA
    │   │   └── ui/                 # Background animations, shared UI
    │   │
    │   └── lib/                    # Shared utilities (api, auth, time)
    │
    └── backend/                    # Python FastAPI backend
        ├── requirements.txt
        ├── app/
        │   ├── main.py             # FastAPI entry point
        │   ├── config.py
        │   ├── database.py
        │   ├── scheduler.py
        │   ├── middleware/         # JWT auth middleware
        │   ├── models/             # Pydantic data models
        │   ├── routers/            # API route handlers
        │   ├── services/           # Business logic (scraper, AI, notifier)
        │   └── utils/              # Email, JWT, hashing helpers
        └── tests/
```

---

## 🗺 Roadmap

- [x] User authentication (register, login, JWT)
- [x] Competitor CRUD management
- [x] Automated web scraping with Playwright
- [x] AI-powered signal detection via Groq
- [x] Email and Slack notifications
- [x] Report generation and history
- [x] Next.js dashboard UI with animated design system
- [ ] OAuth 2.0 social login (Google, GitHub)
- [ ] Competitor comparison view (side-by-side)
- [ ] Webhook outbound integrations (Zapier, Make)
- [ ] Custom scrape frequency per competitor
- [ ] Signals filtering and advanced search
- [ ] Exportable reports (PDF, CSV)
- [ ] Team workspaces and multi-user organisations
- [ ] Mobile-responsive PWA
- [ ] CI/CD pipeline with GitHub Actions

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to fork the repo, create branches, write commits, and open pull requests.

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](./LICENSE) file for details.

---

## 🙏 Acknowledgements

- [Groq](https://groq.com) — blazing-fast LLM inference
- [Playwright](https://playwright.dev) — reliable headless browser automation
- [FastAPI](https://fastapi.tiangolo.com) — modern Python API framework
- [Next.js](https://nextjs.org) — the React framework for production
- [MongoDB Atlas](https://www.mongodb.com/atlas) — managed cloud database
- [Tailwind CSS](https://tailwindcss.com) — utility-first CSS framework
- [Framer Motion](https://www.framer.com/motion/) — production-ready animations
- [Lucide](https://lucide.dev) — beautiful open-source icons

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/Surajphirke3">Surajphirke3</a>
</div>
