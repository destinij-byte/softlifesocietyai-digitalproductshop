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

The domain is on **Namecheap shared hosting** (cPanel, Jupiter theme, home
directory `/home/softzwqm`). That's genuinely good for static files and PHP,
but it has no persistent Python process host — no way to run Uvicorn as a
long-lived service, and no MongoDB. So the backend runs on **Render**
instead (no AWS, no IAM/CLI setup — it deploys straight from the Dockerfile
already in this repo), and cPanel's role is DNS plus hosting the static web
build:

- **API** → Render — runs `backend/` unmodified, as a real ASGI process,
  free tier to start
- **Web app** (mobile's browser build) → hosted directly in cPanel under
  `/home/softzwqm`, since it's just static files
- **cPanel's job**: DNS (Zone Editor) for the API's subdomain, and
  File Manager / FTP for the web app's files. Nothing on the domain's
  existing content changes.

### 1. Database — MongoDB Atlas

1. Create a free cluster at mongodb.com/cloud/atlas (any cloud
   provider/region works — this isn't tied to where the backend runs).
2. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) —
   Render's outbound IPs aren't static on the free tier.
3. Under **Database Access**, create a user/password.
4. Copy the connection string (`mongodb+srv://...`) for `MONGODB_URI` below.

### 2. API → Render → `api.softlifesocietyai.com`

1. Push this repo to GitHub if it isn't already (it is, on this branch).
2. On render.com: **New → Web Service**, connect the repo, set:
   - Root directory: `backend`
   - Render auto-detects the `Dockerfile` — leave runtime as Docker
3. Add environment variables (from `backend/.env.example`):
   - `MONGODB_URI` — from step 1
   - `JWT_SECRET`, `WORKBOOK_URL_SECRET` — long random strings, not the placeholders
   - `STRIPE_SECRET_KEY` — **test** secret key from the Softlifesocietyai
     Stripe account for now (switch to live once ready to charge real cards)
   - `STRIPE_WEBHOOK_SECRET` — filled in after step 4 below
   - `STRIPE_SUCCESS_URL=https://academy.softlifesocietyai.com/checkout/success`
   - `STRIPE_CANCEL_URL=https://academy.softlifesocietyai.com/checkout/cancelled`
   - `CORS_ALLOWED_ORIGINS=https://academy.softlifesocietyai.com,https://softlifesocietyai.com`
   - `SENDGRID_API_KEY` or `POSTMARK_SERVER_TOKEN`, matching `EMAIL_PROVIDER`
4. Deploy. Render gives you a `*.onrender.com` URL immediately — in Render's
   dashboard, add the custom domain `api.softlifesocietyai.com`; it'll show
   you the exact DNS target to use (usually a CNAME to
   `your-service.onrender.com`).
5. **In cPanel** → **Domains → Zone Editor** → pick `softlifesocietyai.com` →
   **Add Record**: type `CNAME`, name `api`, points to the target Render gave
   you. DNS propagation is usually minutes, occasionally longer.
6. Once the domain resolves, I can register the Stripe webhook directly
   (Stripe is connected here) — just say the word and I'll create the
   endpoint at `https://api.softlifesocietyai.com/academy/webhook/stripe`
   and hand you the signing secret to paste into Render's
   `STRIPE_WEBHOOK_SECRET`.
7. Promote your own account to admin so you can create courses: register
   via `/auth/register` against the live API, then flip `is_admin: true`
   on that user document in Atlas's web-based data browser (no shell
   needed). There's intentionally no self-serve admin-promotion endpoint.

### 3. Web app → cPanel (`/home/softzwqm`) → `academy.softlifesocietyai.com`

1. Build the static site with the production API URL baked in:
   ```
   cd mobile
   EXPO_PUBLIC_API_BASE_URL=https://api.softlifesocietyai.com npm run build:web
   ```
   This produces `mobile/dist/`. You can build and run this before the API
   is live — the URL is just baked into the JS bundle; API calls will start
   working once step 2 above is done.
2. **In cPanel** → **Domains** → create subdomain `academy` on
   `softlifesocietyai.com`. Note the document root it assigns (typically
   `/home/softzwqm/academy.softlifesocietyai.com` or
   `/home/softzwqm/public_html/academy` depending on the Jupiter theme's
   defaults — cPanel shows you the exact path when you create it).
3. Upload the site — two options, either works:
   - **File Manager (no extra tools)**: run `npm run package:web` in
     `mobile/` to produce `mobile/dist.zip`. In cPanel File Manager, navigate
     to the document root from step 2, upload `dist.zip`, right-click it →
     **Extract**, then delete the zip. `index.html` should end up directly
     in the document root, not nested in a subfolder.
   - **FTP script (repeatable)**: see `mobile/scripts/deploy_ftp.py` below —
     good for re-deploying after every rebuild without re-zipping by hand.
4. Visit `https://academy.softlifesocietyai.com` — cPanel issues a free
   AutoSSL certificate for new subdomains automatically (may take a few
   minutes on first creation).

#### FTP deploy script

`mobile/scripts/deploy_ftp.py` uploads `mobile/dist/` to your cPanel
document root over FTPS, using Python's standard library only (no `lftp` or
other install required).

1. **In cPanel → FTP Accounts**, create an FTP account scoped to just the
   `academy` subdomain's document root (not the full cPanel login) — least
   privilege, so a leaked credential can't touch the rest of the account.
2. Run it with credentials passed as environment variables (never hardcode
   them in a file that gets committed):
   ```
   cd mobile
   npm run build:web
   FTP_HOST=softlifesocietyai.com \
   FTP_USER=academy@softlifesocietyai.com \
   FTP_PASSWORD='...' \
   FTP_REMOTE_DIR=/ \
   python3 scripts/deploy_ftp.py
   ```
   (`FTP_REMOTE_DIR=/` because the FTP account above is already scoped/jailed
   to the subdomain's document root — adjust if your account isn't scoped
   that way.)
3. Add `--delete` to also remove remote files that no longer exist locally
   (off by default — the script only adds/overwrites unless you pass this).
4. Add `--dry-run` to preview what would upload without actually doing it.

### DNS summary

| Record | Type | Points to | Where |
|---|---|---|---|
| `api.softlifesocietyai.com` | CNAME | Render's target for your service | cPanel Zone Editor |
| `academy.softlifesocietyai.com` | — (subdomain, not external) | cPanel's own document root under `/home/softzwqm` | cPanel Domains |

Neither touches the bare `softlifesocietyai.com` record — whatever's already
serving your root domain is untouched.

### Re-deploying after a change

- Backend: push to the connected GitHub branch — Render rebuilds from the
  Dockerfile and redeploys automatically.
- Web app: re-run `npm run build:web`, then either re-run
  `scripts/deploy_ftp.py` or re-zip/re-upload via File Manager.
