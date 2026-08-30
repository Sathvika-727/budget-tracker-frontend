# Budget Tracker

A full-stack personal finance web app for tracking income, expenses, categories, and monthly budgets — with JWT auth, live dashboard analytics, and independent CI/CD-deployed frontend/backend.

*Live app:* https://budget-tracker-frontend-alpha-ten.vercel.app
*Backend API:* https://budget-tracker-backend-j693.onrender.com/api/

> Note: the backend runs on a free-tier host that spins down after inactivity. The first request after idle time can take up to ~50 seconds to respond — please be patient on first load.

---

## Features

- User registration and login with JWT authentication
- Create, view, and delete income/expense categories
- Log transactions (amount, category, type, description, date)
- Set monthly budget limits per category with live progress tracking against actual spending
- Dashboard with income / expense / net summary cards
- Spending-by-category breakdown for the current month
- 6-month income/expense trend chart
- Protected routes — unauthenticated users are redirected to login
- Automatic JWT refresh — expired access tokens are silently renewed so users aren't logged out mid-session

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Django REST Framework |
| Auth | JWT (djangorestframework-simplejwt) with auto-refresh |
| Database | PostgreSQL |
| Frontend | React + Vite |
| Routing | React Router |
| Charts | Recharts |
| HTTP Client | Axios (with request/response interceptors) |
| Backend Hosting | Render (Web Service + managed PostgreSQL) |
| Frontend Hosting | Vercel |
| Static Files | WhiteNoise |

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/register/ | Register a new user |
| POST | /api/auth/login/ | Obtain JWT access + refresh tokens |
| POST | /api/auth/refresh/ | Exchange refresh token for a new access token |
| GET/POST | /api/categories/ | List / create categories |
| GET/POST | /api/transactions/ | List / create transactions |
| GET/POST | /api/budgets/ | List / create monthly budgets |
| GET | /api/summary/monthly/ | Income, expense, net totals for a given month |
| GET | /api/summary/trend/ | Income/expense trend over the last N months |

## Architecture

Frontend and backend are deployed independently and communicate over HTTPS, with CORS restricted to the production frontend origin. Both repos are connected to their hosting platform via GitHub — every push to main triggers an automatic redeploy.

- *Backend:* Django served via Gunicorn, static files via WhiteNoise, PostgreSQL via dj-database-url, migrations run automatically on deploy.
- *Frontend:* Vite build, API base URL injected via environment variable (.env.development / .env.production), with a vercel.json rewrite rule so client-side routes survive a page refresh.

## Notable Engineering Challenges

Building and deploying this surfaced several real production issues not visible in local development:

1. *Static files crash on deploy* — Django's collectstatic requires STATIC_ROOT, which isn't needed locally since runserver handles static files differently. Fixed by setting STATIC_ROOT and wiring in WhiteNoise's compressed manifest storage.
2. *SPA routes 404 on refresh* — Client-side routing works when navigating in-app, but refreshing on a deep link (e.g. /dashboard) hit Vercel's server directly, which returned 404 since only index.html physically exists. Fixed with a vercel.json rewrite rule.
3. *Silent logout on token expiry* — JWT access tokens expire quickly by design, but the app had no refresh logic, causing random 401 errors after time logged in. Fixed with an Axios response interceptor that auto-refreshes the access token and retries the failed request transparently.
4. *Case-sensitivity break (Windows → Linux build)* — An import referenced ./pages/Categories while the file was categories.jsx. Windows is case-insensitive so this passed locally; Vercel's Linux build correctly failed. Fixed by matching import casing to actual filenames.
5. *Router ordering bug* — The wildcard fallback route was declared before the /budgets route, silently intercepting all requests to it. Fixed by moving the wildcard route to the end, as required by React Router's top-to-bottom matching.

## Possible Improvements

- Automated tests (backend unit tests, frontend component tests)
- Move JWT storage from localStorage to httpOnly cookies to reduce XSS exposure
- Pagination/filtering for transaction and category lists at scale
- Paid or self-pinged hosting tier to avoid free-tier cold starts

## Local Setup

**Backend**
```bash
cd Backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

**Frontend**
```bash
cd budget-tracker-frontend
npm install
npm run dev
```

Built by [Sathvika Gajelli](https://github.com/Sathvika-727)


