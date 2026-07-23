# PM Tracker (zingnuts_brinda_vyas)

Project time tracking app with a Next.js frontend, Express API, and MySQL database.

## Run with Docker (recommended)

One command starts MySQL, the API, and the frontend:

```bash
cp .env.example .env
docker compose up --build
```

Open the app:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000/api/v1
- Health check: http://localhost:4000/api/health

Stop everything:

```bash
docker compose down
```

If ports `3000` or `4000` are already in use (e.g. local `npm run dev`), stop those processes first, or override ports:

```bash
FRONTEND_PORT=3001 BACKEND_PORT=4001 docker compose up --build
```

Then set `NEXT_PUBLIC_API_URL=http://localhost:4001/api/v1` and rebuild the frontend image so the browser calls the correct API port.

Remove database data as well:

```bash
docker compose down -v
```

### Default seeded users

Migrations run automatically when the backend starts. Demo accounts (see login page quick-fill):

| Role   | Email              | Password    |
|--------|--------------------|-------------|
| Admin  | admin@example.com  | Admin@123   |
| PM     | pm@example.com     | Pm@123456   |
| Member | member@example.com | Member@123  |

### Services

| Service  | Container           | Host port |
|----------|---------------------|-----------|
| MySQL    | pm-tracker-mysql    | internal only (optional 3307) |
| Backend  | pm-tracker-backend  | 4000      |
| Frontend | pm-tracker-frontend | 3000      |

Configure ports and secrets in `.env` (see `.env.example`).

## Local development (without Docker)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Set `NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1` in `frontend/.env.local`.
