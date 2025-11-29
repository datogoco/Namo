# Namo Fullstack

Unified home for the backend (`backend/`) and React frontend (`frontend/`).

## Install
- `npm install` (installs root dev tools like concurrently)
- `npm --prefix backend install`
- `npm --prefix frontend install`

## Run in development
- `npm run dev` — starts backend dev stack and frontend Vite dev server together
- `npm run dev:backend` — backend only (webpack watch + nodemon)
- `npm run dev:frontend` — frontend only

## Other scripts
- `npm start` — backend only (production start command from backend package)
- `npm run build:frontend` — build React app
- `npm run lint:frontend` — lint React app

## Notes
- Backend env/config lives in `backend/.env` (fallback `backend/config.env`), see `backend/.env.example`.
- Frontend env values go in `frontend/.env`, see `frontend/.env.example` (`VITE_BACKEND_URL=http://localhost:5000`).
- Keep ports distinct (backend 5000, frontend 5173 by default). Update API URLs accordingly.
