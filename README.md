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

### Typecheck

```
cd mobile
npm install
npm run typecheck
```

`src/api/client.ts` reads the auth token from AsyncStorage under
`sls_auth_token` — point that at wherever the app's real auth session is
stored, and `EXPO_PUBLIC_API_BASE_URL` at the deployed API.

## First course

Per the spec, the first course to seed via the admin endpoints is
**Build Your Digital Empire** (7 modules), priced ~$149, with bundle/full-access
tiers to follow.
