# SyncWash

## Authentication

The Laravel API handles authentication with Sanctum personal access tokens.
The React login page posts the customer's phone number and password to
`POST /api/login`, saves the returned token in browser storage, then sends it
as a bearer token when requesting `GET /api/me` and `POST /api/logout`.

Run the backend from `backend` with `php artisan serve` (port 8000) and the
frontend from `frontend` with `npm run dev` (port 5173). Copy
`backend/.env.example` to `.env` and set `CORS_ALLOWED_ORIGINS` to the frontend
origin(s). Copy `frontend/.env.example` to `.env` and set
`VITE_API_BASE_URL` to the API base URL, ending in `/api`. The frontend defaults
to `http://127.0.0.1:8000/api`.

Sign-in expects a Philippine mobile number in `09XXXXXXXXX` format. A failed
sign-in displays the API error; the customer dashboard checks the saved token
on load and requires a valid session.