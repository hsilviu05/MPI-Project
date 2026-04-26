# Portfolio Tracker

> A full-stack web application for tracking stock and cryptocurrency portfolios with real-time price data, valuation charts, and P&L analytics.

**Live demo:** https://mpi-frontend-s4yg.onrender.com  
**Backend API:** https://mpi-backend-66d0.onrender.com/docs

---

## Table of Contents

1. [Description and Objectives](#1-description-and-objectives)
2. [Team and Roles](#2-team-and-roles)
3. [Architecture and Technologies](#3-architecture-and-technologies)
4. [Data Model](#4-data-model)
5. [API Reference](#5-api-reference)
6. [Features](#6-features)
7. [Local Setup](#7-local-setup)
8. [Deployment (Render)](#8-deployment-render)
9. [Testing](#9-testing)
10. [Contributing and Quality Control](#10-contributing-and-quality-control)

---

## 1. Description and Objectives

This application solves the problem of **fragmented financial tracking**. Most users rely on multiple platforms to monitor stocks, cryptocurrencies, and portfolios — leading to inefficiency and lack of clarity.

Portfolio Tracker centralises everything into a single dashboard where users can:

- Register and authenticate securely with JWT tokens
- Create and manage multiple investment portfolios
- Add holdings (asset + quantity + average cost)
- Fetch live market prices via Alpha Vantage
- View portfolio valuation broken down per asset
- Visualise allocation, value, and P&L with interactive charts

### Objectives

| # | Objective |
|---|-----------|
| 1 | Provide real-time price tracking for stocks and cryptocurrencies |
| 2 | Allow users to manage and visualise their investment portfolios |
| 3 | Deliver a modern, responsive dashboard with charts and analytics |
| 4 | Ensure correctness through automated backend and E2E tests |
| 5 | Apply DevOps best practices: CI/CD, Docker, secrets management, structured logging |

### Target Audience

- Beginner investors learning to track their positions
- Crypto and stock traders wanting a unified view
- Students studying financial markets or full-stack development

---

## 2. Team and Roles

| Name | Role | GitHub |
|------|------|--------|
| Hermeneanu Ionut-Silviu | Team Lead & DevOps | [@hsilviu05](https://github.com/hsilviu05) |
| Iftime Razvan | Backend Developer | [@IftimeRazvan](https://github.com/IftimeRazvan) |
| Dragomir Cezar-Andrei | Frontend Developer | [@Cezar-Andreii](https://github.com/Cezar-Andreii) |
| Ionita Petru Adrian | QA Engineer | [@AdryanI20](https://github.com/AdryanI20) |

---

## 3. Architecture and Technologies

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite 8, React Router 7, Recharts, Lucide React |
| Backend | FastAPI (Python 3.11), SQLAlchemy, Alembic, Pydantic v2 |
| Database | PostgreSQL 15 |
| Auth | JWT (python-jose), bcrypt password hashing |
| Prices | Alpha Vantage API (stocks + crypto) |
| DevOps | Docker, Docker Compose, GitHub Actions, Render |
| Testing | pytest, Playwright (E2E) |

### High-Level Architecture

```
Browser
  │
  │  HTTPS
  ▼
┌─────────────────────┐
│   React Frontend    │  Vite + React Router
│  (mpi-frontend)     │  Recharts charts
└──────────┬──────────┘
           │  REST API (JSON)
           ▼
┌─────────────────────┐
│  FastAPI Backend    │  JWT auth middleware
│  (mpi-backend)      │  Alembic migrations
└──────┬───────┬──────┘
       │       │
       ▼       ▼
┌──────────┐  ┌─────────────────────┐
│PostgreSQL│  │  Alpha Vantage API  │
│    DB    │  │  (market prices)    │
└──────────┘  └─────────────────────┘
```

### CI/CD Pipeline

```
Pull Request
     │
     ▼
GitHub Actions: ci.yml
     ├─ backend-tests  (pytest, 87 tests)
     └─ e2e-tests      (Playwright / Chromium)

Merge to main
     │
     ▼
GitHub Actions: deploy.yml
     ├─ backend-tests  ──┐
     ├─ e2e-tests     ──►├─ deploy
     │                   │    ├─ Render backend rebuild
     │                   │    └─ Render frontend rebuild
     └───────────────────┘
```

---

## 4. Data Model

```
users
├── id          (PK)
├── email       (unique)
├── hashed_password
├── created_at
└── updated_at

portfolios
├── id          (PK)
├── owner_id    (FK → users)
├── name
├── description
├── created_at
└── updated_at

assets
├── id          (PK)
├── symbol      (e.g. AAPL, BTC)
├── name
├── asset_type  (stock / crypto / etf)
├── created_at
└── updated_at

holdings
├── id          (PK)
├── portfolio_id (FK → portfolios)
├── asset_id    (FK → assets)
├── quantity
├── avg_cost    (average purchase price per unit)
├── created_at
└── updated_at

transactions
├── id          (PK)
├── holding_id  (FK → holdings)
├── type        (buy / sell)
├── quantity
├── price
├── timestamp
└── created_at

price_snapshots
├── id          (PK)
├── asset_id    (FK → assets)
├── price
├── source      (e.g. alpha_vantage)
└── timestamp
```

---

## 5. API Reference

All endpoints are documented interactively at `/docs` (Swagger UI).

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT access token |

### Portfolios

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolios/` | List all portfolios for current user |
| POST | `/portfolios/` | Create a new portfolio |
| GET | `/portfolios/{id}` | Get portfolio details + holdings list |
| PUT | `/portfolios/{id}` | Update portfolio name/description |
| DELETE | `/portfolios/{id}` | Delete portfolio |
| GET | `/portfolios/{id}/valuation` | Get portfolio valuation (total + per-asset breakdown) |
| POST | `/portfolios/{id}/refresh-prices` | Fetch live prices for all holdings |

### Assets

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assets/` | List all assets in the catalog |
| POST | `/assets/` | Create a new asset |
| GET | `/assets/{id}` | Get asset by ID |
| PUT | `/assets/{id}` | Update asset |
| DELETE | `/assets/{id}` | Delete asset |

### Holdings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolios/{pid}/holdings/` | List holdings for a portfolio |
| POST | `/portfolios/{pid}/holdings/` | Add a holding to a portfolio |
| PUT | `/portfolios/{pid}/holdings/{id}` | Update quantity / avg cost |
| DELETE | `/portfolios/{pid}/holdings/{id}` | Remove holding |

### Transactions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/portfolios/{pid}/holdings/{hid}/transactions/` | List transactions for a holding |
| POST | `/portfolios/{pid}/holdings/{hid}/transactions/` | Record a buy/sell transaction |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Backend health check |

---

## 6. Features

### Portfolio Management
- Create multiple portfolios (e.g. "Long Term", "Crypto", "Speculative")
- Add holdings by selecting from the asset catalog with quantity and average cost
- Edit or remove holdings at any time
- Real-time valuation from the latest price snapshot

### Price Provider
- Stocks and ETFs via Alpha Vantage `GLOBAL_QUOTE`
- Cryptocurrencies via Alpha Vantage `CURRENCY_EXCHANGE_RATE` (automatic fallback)
- Price snapshots stored in the database for fast valuation queries
- Per-asset refresh with full status reporting (success / provider_error / missing_symbol)

### Charts and Analytics
- **Allocation donut chart** — percentage of each asset in the portfolio
- **Value bar chart** — current market value per asset
- **P&L bar chart** — profit/loss per asset (green/red), requires avg_cost

### Dashboard
- Sticky sidebar with Lucide icons and active-page highlighting
- Dynamic page titles based on current route
- Responsive layout that collapses to horizontal nav on mobile
- Session expiry modal with automatic redirect to login

### Security
- Passwords hashed with bcrypt
- JWT tokens with configurable expiry
- Production startup validation (refuses to start with weak SECRET_KEY or DEBUG=true)
- CORS restricted to known origins + `*.onrender.com` pattern
- Non-root Docker user for backend container

---

## 7. Local Setup

### Prerequisites

- Docker and Docker Compose
- (Optional) Python 3.11+ and Node 20+ for running services directly

### With Docker Compose (recommended)

```bash
git clone https://github.com/hsilviu05/MPI-Project.git
cd MPI-Project
cp .env.example .env        # edit POSTGRES_PASSWORD, SECRET_KEY
docker compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

### Backend only

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env        # edit DATABASE_URL, SECRET_KEY
python -m alembic upgrade head
python -m uvicorn backend.main:app --reload
```

### Frontend only

```bash
cd frontend
npm install
cp .env.example .env        # set VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SECRET_KEY` | Yes (prod) | JWT signing secret — must be strong in production |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `APP_ENV` | No | `development` (default) or `production` |
| `DEBUG` | No | `false` in production (enforced) |
| `PRICE_PROVIDER` | No | `alpha_vantage` |
| `PRICE_PROVIDER_API_KEY` | No | Alpha Vantage API key |
| `CORS_ALLOWED_ORIGINS` | No | Extra allowed origins, comma-separated |
| `VITE_API_BASE_URL` | Yes (frontend) | Backend URL baked into the frontend at build time |

See [`docs/environment.md`](docs/environment.md) for full details.

---

## 8. Deployment (Render)

The project auto-deploys to [Render](https://render.com) on every merge to `main`, gated by the full test suite.

### One-time setup

1. **Connect repo** — Render dashboard → *New → Blueprint* → select this repo. Render reads `render.yaml` and creates:
   - `mpi-project-db` — PostgreSQL (free tier, Frankfurt)
   - `mpi-backend` — FastAPI Docker container
   - `mpi-frontend` — React/Nginx Docker container

2. **Set secrets** in the Render dashboard:

   | Service | Key | Value |
   |---------|-----|-------|
   | `mpi-backend` | `PRICE_PROVIDER_API_KEY` | Alpha Vantage key |
   | `mpi-frontend` | `VITE_API_BASE_URL` | Backend public URL |

3. **Add GitHub secrets** for deploy hooks:

   | GitHub Secret | Render service |
   |---------------|----------------|
   | `RENDER_BACKEND_DEPLOY_HOOK` | `mpi-backend` |
   | `RENDER_FRONTEND_DEPLOY_HOOK` | `mpi-frontend` |

4. **Add `production` environment** in GitHub → Settings → Environments.

### On every merge to `main`

1. GitHub Actions runs backend tests (pytest) and E2E tests (Playwright)
2. If all pass, deploy job triggers Render rebuild via webhook
3. Render builds Docker image, runs `alembic upgrade head`, swaps container

---

## 9. Testing

### Backend (pytest)

```bash
cd backend
python -m pytest
```

87 tests covering:
- Unit tests: price provider, config validation
- Integration tests: auth flows, portfolio CRUD, holdings, assets, valuation, price refresh

### End-to-end (Playwright)

```bash
cd frontend
npm run e2e          # headless
npm run e2e:headed   # visible browser
npm run e2e:ui       # Playwright UI
```

Covers: registration, login, session expiry, portfolio creation and navigation.

### QA Scenarios

Manual test scenarios are documented in [`QA_SCENARIOS.md`](QA_SCENARIOS.md) and cover all major user flows with valid and invalid inputs.

---

## 10. Contributing and Quality Control

We follow a structured process to maintain release quality:

- All changes go through a PR referencing an issue with acceptance criteria
- Bug reports include reproduction steps and are linked to the affected feature
- PRs are reviewed against acceptance criteria before merge

See [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) and [`QUALITY_CONTROL.md`](.github/QUALITY_CONTROL.md) for full details.
