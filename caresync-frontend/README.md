# CareSync Frontend

Week 1: **Authentication** connected to FastAPI backend.

## Environment

Copy the example env file for local development:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## Backend endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Returns `access_token`, `refresh_token`, `token_type` |
| POST | `/auth/logout` | Body: `{ refresh_token }` |
| POST | `/auth/refresh` | Body: `{ refresh_token }` |

There is **no public registration endpoint**. The `/register` page directs users to contact their administrator.

## Structure

```
app/
├── (auth)/login/page.tsx
├── (auth)/register/page.tsx   # admin-managed access message
└── dashboard/page.tsx
components/auth/
├── AuthLayout.tsx
└── LoginForm.tsx
hooks/useAuth.ts
lib/
├── api.ts
├── services/auth.ts
└── types/auth.ts
stores/auth-store.ts
proxy.ts
```

## Getting started

```bash
npm install
npm run dev
```

Ensure FastAPI is running at `http://localhost:8000`.

## Auth flow

1. **Login** → `POST /auth/login` → stores tokens → redirects to `/dashboard`
2. **Logout** → `POST /auth/logout` → clears tokens → redirects to `/login`
3. **401** → attempts token refresh → otherwise clears session and redirects to `/login`
