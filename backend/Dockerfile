FROM python:3.11-slim

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 appgroup && \
    adduser --system --uid 1001 --gid 1001 --no-create-home appuser

COPY requirements.txt ./backend/

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r backend/requirements.txt

COPY --chown=appuser:appgroup . ./backend

USER appuser

EXPOSE 8000

# Migrații la pornire (fără fișier .sh — evită CRLF pe Windows care rupe shebang-ul în Linux)
ENTRYPOINT ["sh", "-c", "set -e && cd /app && python -m alembic -c backend/alembic.ini upgrade head && exec python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000"]
