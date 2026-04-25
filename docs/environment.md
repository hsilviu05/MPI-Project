# Environment and Secrets

## Rules

- Commit only example files such as `.env.example`, `backend/.env.example`, and `frontend/.env.example`.
- Keep real values in untracked `.env` files locally or in your deployment platform's secret manager.
- If a secret was ever committed before this change, rotate it before using it again.

## Local development

### Docker Compose

1. Copy [`.env.example`](/Users/silviu/Desktop/Facultate/Sem_2/MPI/MPI-Project/.env.example) to `.env`.
2. Keep `APP_ENV=development` for local runs.
3. Set at least `SECRET_KEY` and `POSTGRES_PASSWORD` to local values.
4. Run `docker compose up --build`.

The Compose stack passes environment variables directly into the containers. The backend can use either:

- `DATABASE_URL`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST`, `POSTGRES_PORT`, and `POSTGRES_DB`

### Backend only

1. Copy [`backend/.env.example`](/Users/silviu/Desktop/Facultate/Sem_2/MPI/MPI-Project/backend/.env.example) to `backend/.env`.
2. Keep `APP_ENV=development` for local runs.
3. Set `DATABASE_URL`, or provide the `POSTGRES_*` variables instead.
4. Add `SECRET_KEY` and any optional provider credentials such as `PRICE_PROVIDER_API_KEY`.

### Frontend only

1. Copy [`frontend/.env.example`](/Users/silviu/Desktop/Facultate/Sem_2/MPI/MPI-Project/frontend/.env.example) to `frontend/.env`.
2. Set `VITE_API_BASE_URL` to the backend URL you want the browser app to call.

## Production deployment

Configure these values in the deployment platform rather than in the repository:

- `APP_ENV=production`
- `SECRET_KEY`
- `DATABASE_URL`, or the full `POSTGRES_*` set
- `PRICE_PROVIDER` and `PRICE_PROVIDER_API_KEY` when live market data is enabled
- `VITE_API_BASE_URL` during the frontend image build or deployment step

Recommended production defaults:

- `DEBUG=false`
- Strong, rotated values for `SECRET_KEY` and database credentials
- Secrets stored in platform-managed secret stores or CI/CD environment settings
- The backend fails fast on startup if `APP_ENV=production` and `SECRET_KEY`, `DATABASE_URL`, or `POSTGRES_*` are missing or insecure

## Test and CI

- Set `APP_ENV=test` in CI jobs that boot the backend
- Use non-production placeholder secrets such as `ci-test-secret-key-not-for-production`
- Keep test-only env values inside the workflow definition or CI environment settings, not in committed `.env` files

## Enforcement

- `.gitignore` blocks local `.env` files from being committed
- `backend/.dockerignore` and `frontend/.dockerignore` keep local env files out of Docker build contexts
- `.github/workflows/config-hygiene.yml` fails CI if a real `.env` file is tracked or if the environment docs/ignore rules are removed
