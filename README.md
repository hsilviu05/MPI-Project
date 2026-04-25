# MPI-Project

> A modern stock & crypto tracking platform that provides real-time insights, portfolio management, and analytics for investors.

---

# 1. Description and Objectives

This application solves the problem of **fragmented financial tracking**. Most users use multiple platforms to monitor stocks, cryptocurrencies, and portfolios, which leads to inefficiency and lack of clarity.

Our app centralizes everything into a single dashboard where users can:
- Track stock and crypto prices
- Manage their portfolio
- Analyze performance
- Receive insights

### Objectives

- **Objective 1:** Provide real-time tracking for stocks and cryptocurrencies  
- **Objective 2:** Allow users to manage and visualize their portfolio  
- **Objective 3:** Deliver a clean, intuitive dashboard for financial insights  
- **Objective 4:** Ensure scalability and performance using modern DevOps practices  

### Target Audience

- Beginner investors  
- Crypto traders  
- Stock market enthusiasts  
- Students learning financial markets  

---

# 2. Team and Roles

| Name        | Main Role  | GitHub Username |
|------------|-----------|----------------|
| Iftime Razvan | Backend   | @IftimeRazvan      |
| Hermeneanu Ionut-Silviu | DevOps & Team Lead | @hsilviu05 |
| Dragomir Cezar-Andrei  | Frontend  | @Cezar-Andreii      |
| Ionita Petru Adrian  | QA Engineer  | @AdryanI20     |

---

# 3. Architecture and Technologies

- **Backend:** FastAPI (Python)  
- **Database:** PostgreSQL  
- **Frontend:** React (Vite)  
- **DevOps:** Docker, Docker Compose, GitHub Actions (CI/CD)  

### Architecture Overview

- REST API built with FastAPI  
- PostgreSQL for persistent storage  
- React frontend consuming API endpoints  
- Dockerized environment for consistency across all developers  
- CI pipeline for automated testing and validation  

---

# 4. Local Setup

```bash
git clone <repo-url>
cd MPI-Project
cp .env.example .env
docker compose up --build
```

If you want to run the services individually instead of the full stack:

- Copy `backend/.env.example` to `backend/.env` for backend-only runs
- Copy `frontend/.env.example` to `frontend/.env` for frontend-only runs

Environment and secret handling for local and production deployments is documented in [docs/environment.md](/Users/silviu/Desktop/Facultate/Sem_2/MPI/MPI-Project/docs/environment.md).

---

# 5. Deployment (Render)

The project auto-deploys to [Render](https://render.com) on every merge to `main`, gated by the full test suite (backend + E2E).

### One-time setup

1. **Create a Render account** at https://render.com and connect your GitHub repository.

2. **Apply the Blueprint** — in the Render dashboard click *New → Blueprint* and select this repository. Render reads `render.yaml` and creates:
   - `mpi-project-db` — PostgreSQL 15 (free tier)
   - `mpi-backend` — FastAPI container (runs Alembic migrations on startup)
   - `mpi-frontend` — React/nginx container

3. **Set manual environment variables** in the Render dashboard after the Blueprint is applied:

   | Service | Key | Value |
   |---------|-----|-------|
   | `mpi-backend` | `PRICE_PROVIDER_API_KEY` | Your Alpha Vantage key |
   | `mpi-frontend` | `VITE_API_BASE_URL` | `https://mpi-backend.onrender.com` |

   > `VITE_API_BASE_URL` is baked into the frontend at build time, so it must be set before the first deploy.

4. **Copy deploy hooks** — in Render go to each service → *Settings → Deploy Hook* and add the URLs as GitHub repository secrets:

   | Secret name | Render service |
   |-------------|----------------|
   | `RENDER_BACKEND_DEPLOY_HOOK` | `mpi-backend` |
   | `RENDER_FRONTEND_DEPLOY_HOOK` | `mpi-frontend` |

5. **Add a `production` environment** in GitHub (*Settings → Environments*) and optionally add protection rules (required reviewers, etc.).

### How it works

```
merge to main
     │
     ▼
GitHub Actions: deploy.yml
     ├─ backend-tests  (pytest)
     ├─ e2e-tests      (Playwright / Chromium)  [needs backend-tests]
     └─ deploy         [needs both]
          ├─ curl RENDER_BACKEND_DEPLOY_HOOK  → triggers mpi-backend rebuild
          └─ curl RENDER_FRONTEND_DEPLOY_HOOK → triggers mpi-frontend rebuild
```

Render rebuilds the Docker image, runs migrations (`alembic upgrade head`), and swaps to the new container with zero downtime.
