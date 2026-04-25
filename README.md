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

### QA Scenarios

- A dedicated QA scenario document is maintained in `QA_SCENARIOS.md`
- Scenarios cover valid and invalid user flows for authentication, portfolios, holdings, pricing, and valuation
- These scenarios are defined before implementation to validate development against clear expectations

### Quality Control & Release Process

To maintain high release quality, we enforce:
- **PRs validated against issue acceptance criteria** - All changes must fulfill defined AC
- **Bug issues with reproduction steps** - Every bug includes detailed, reproducible steps
- **Bugs linked to affected stories** - Traceability between bugs and features they impact

👉 **[See our Quality Control Guide](./.github/QUALITY_CONTROL.md)** for detailed process and workflow

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

# 4. Contributing

We follow strict quality control processes to maintain release quality. Please read our **[Contributing Guidelines](./.github/CONTRIBUTING.md)** before submitting PRs.

**Quick Start for Contributors:**
1. Create an issue using the appropriate template (Bug Report or Feature Request)
2. Define acceptance criteria or reproduction steps clearly
3. Create a PR that references the issue
4. Use the PR template to validate your changes against acceptance criteria
5. Link related issues (bugs to affected feature stories)

👉 **[Full Contributing Guide](./.github/CONTRIBUTING.md)** — Issue templates, PR process, code review checklist

---

# 5. Local Setup

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
