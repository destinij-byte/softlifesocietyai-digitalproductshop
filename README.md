# Soft Life Society AI — Digital Product Shop

Monorepo for the Soft Life Society app. Currently contains **Soft Life Academy**,
a course/learning module that reuses the app's user accounts, auth, and
subscription infrastructure (no separate login system).

## Structure

```
backend/   FastAPI + MongoDB API (auth + academy module)
mobile/    Expo / React Native screens & components for the Academy tab
```

## Backend (`backend/`)

FastAPI service backed by MongoDB (via Motor). Implements:

- Minimal JWT auth (`/auth/register`, `/auth/login`) — a stand-in for the
  app's real existing auth system, which doesn't live in this repo yet.
  Swap `app/routers/auth.py` and `app/deps.py` for the real thing when
  integrating.
- `courses` / `modules` / `lessons` content collections + admin-only CRUD
  endpoints (`/academy/admin/...`, requires `is_admin` on the user).
- Stripe Checkout + webhook → `enrollments` creation.
- Progress tracking, lesson completion, auto-advance to the next lesson.
- Signed, time-limited workbook download URLs.
- Lifecycle emails (welcome, inactivity nudge, completion, upsell) logged
  to `email_triggers` so nothing double-sends, dispatched via SendGrid or
  Postmark (pick one with `EMAIL_PROVIDER`).

### Run it

```
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # fill in Mongo/Stripe/email credentials
uvicorn app.main:app --reload
```

Daily inactivity nudge (run via cron / celery beat):

```
python -m app.scripts.send_inactivity_nudges
```

### API surface

```
POST   /auth/register
POST   /auth/login

GET    /academy/courses                 storefront listing (published only)
GET    /academy/courses/{slug}          course + module/lesson outline (public)
POST   /academy/checkout                create a Stripe Checkout session (auth)
POST   /academy/webhook/stripe          Stripe webhook -> creates enrollment
GET    /academy/my-courses              the caller's enrollments + progress (auth)
GET    /academy/courses/{id}/progress   progress in one course (auth)
GET    /academy/lessons/{id}            lesson detail incl. video_url (auth + enrolled)
POST   /academy/lessons/{id}/complete   mark a lesson complete, advance progress (auth)
GET    /academy/courses/{id}/workbook   signed workbook download URL (auth + enrolled)

POST   /academy/admin/courses           create a course (admin)
PATCH  /academy/admin/courses/{id}      update a course (admin)
POST   /academy/admin/modules           create a module (admin)
POST   /academy/admin/lessons           create a lesson (admin)
```

`GET /academy/lessons/{id}` isn't in the original spec's endpoint list but
was added because the video player needs `video_url`/transcript/resources,
which the public course-detail endpoint deliberately omits.

## Mobile (`mobile/`)

Expo / React Native screens for the Academy tab, styled with the app's
brand tokens (`mobile/src/theme`) — swap the placeholder hex values there
for the app's real theme file if one already exists elsewhere.

- `screens/academy/CourseListScreen` — enrolled courses with progress bars
- `screens/academy/CourseDetailScreen` — module/lesson outline + workbook button
- `screens/academy/LessonPlayerScreen` — ink-background video player, auto-completes on finish
- `screens/academy/CourseCompleteScreen` — completion badge + "Recommended Next" upsell card
- `navigation/AcademyNavigator` — stack wiring the four screens together

It's a real, runnable Expo app (`App.tsx` + `app.json`), not just a
component library — it builds for iOS, Android, **and web** from the same
source.

### Typecheck

```
cd mobile
npm install
npm run typecheck
```

`src/api/client.ts` reads the auth token from AsyncStorage under
`sls_auth_token` — point that at wherever the app's real auth session is
stored, and `EXPO_PUBLIC_API_BASE_URL` at the deployed API.

### Run / build

```
npm start          # Expo dev server, scan the QR code with Expo Go
npm run web         # dev server in a browser
npm run build:web   # static export to mobile/dist/ - deployable anywhere
```

## First course

Per the spec, the first course to seed via the admin endpoints is
**Build Your Digital Empire** (7 modules), priced ~$149, with bundle/full-access
tiers to follow.

## Deploying to softlifesocietyai.com

Two independent pieces go live: the API (backend) and the browser version of
Academy (mobile's web export). Native iOS/Android builds are a separate track
(App Store/Play Store) and aren't part of the domain.

### 1. Database

Create a MongoDB Atlas cluster (or any reachable Mongo instance) and grab its
connection string for `MONGODB_URI`.

### 2. API → `api.softlifesocietyai.com`

1. Build/deploy `backend/` from its `Dockerfile` on whatever host you run —
   Render, Fly.io, Railway, DigitalOcean App Platform, or a plain VPS behind
   Caddy/Nginx all take a Dockerfile the same way.
2. Set the env vars from `backend/.env.example` on that host, in particular:
   - `MONGODB_URI` — from step 1
   - `JWT_SECRET`, `WORKBOOK_URL_SECRET` — long random strings, not the placeholders
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` — from your Stripe dashboard
   - `STRIPE_SUCCESS_URL` / `STRIPE_CANCEL_URL` — pointed at the web app, e.g.
     `https://academy.softlifesocietyai.com/checkout/success`
   - `CORS_ALLOWED_ORIGINS=https://academy.softlifesocietyai.com,https://softlifesocietyai.com`
   - `SENDGRID_API_KEY` or `POSTMARK_SERVER_TOKEN` depending on `EMAIL_PROVIDER`
3. In your DNS provider, add a record pointing `api.softlifesocietyai.com` at
   your host (a CNAME to the host's URL, or an A record to its IP — your
   host's docs will say which). Most PaaS hosts also want you to add the
   custom domain in their dashboard so they can issue a TLS cert for it.
4. In the Stripe dashboard, add a webhook endpoint at
   `https://api.softlifesocietyai.com/academy/webhook/stripe` listening for
   `checkout.session.completed`, then copy its signing secret into
   `STRIPE_WEBHOOK_SECRET`.
5. Promote your own account to admin so you can create courses: register via
   `/auth/register`, then flip `is_admin: true` on that user document directly
   in Mongo (there's intentionally no self-serve admin-promotion endpoint).

### 3. Web app → `academy.softlifesocietyai.com`

1. Build the static site with the production API URL baked in:
   ```
   cd mobile
   EXPO_PUBLIC_API_BASE_URL=https://api.softlifesocietyai.com npm run build:web
   ```
2. Deploy the resulting `mobile/dist/` folder to any static host — Cloudflare
   Pages, Netlify, Vercel, or an S3 bucket behind CloudFront all work, and all
   let you attach a custom domain.
3. Point `academy.softlifesocietyai.com` at that host per its custom-domain
   instructions (usually a CNAME).

### DNS summary

| Record | Type | Points to |
|---|---|---|
| `api.softlifesocietyai.com` | CNAME (or A) | your backend host |
| `academy.softlifesocietyai.com` | CNAME | your static host |

Neither of these touches the bare `softlifesocietyai.com` record itself — so
whatever's already serving that root domain is untouched.
