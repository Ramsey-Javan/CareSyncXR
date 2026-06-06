# CareSync Backend - Week 1

## Setup

1. Copy `.env.example` to `.env` and fill in your keys (especially JWT_SECRET_KEY).
2. Run `docker-compose up --build`
3. API runs at `http://localhost:8000`
4. Docs at `http://localhost:8000/docs`

## Testing

```bash
docker compose exec api pytest