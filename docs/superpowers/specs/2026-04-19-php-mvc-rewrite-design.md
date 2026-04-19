# HallBook PHP MVC Rewrite — Design

**Date:** 2026-04-19
**Status:** Approved (pending implementation plan)

## Problem

The current HallBook app is a single-file React SPA served from `/HallBook.html`. Every "screen" (home, discover, venue detail, booking, my bookings, check-in, auth) is swapped client-side via a `route` string persisted in `localStorage`. Consequences:

- The browser URL never changes — every screen lives at `/HallBook.html`.
- No deep-linking, no shareable URLs, no real navigation history.
- All seed data (venues, bookings) is hardcoded in JSX models.
- Auth is partially backed by PocketBase (`pocketbase.zahar.my`) but routing/protection is purely client-side.

## Goal

Rewrite HallBook as a PHP MVC application backed by PocketBase, with real RESTful URLs for every page.

## Non-goals

- No PHP framework (Laravel, Symfony). Plain PHP 8 with a tiny hand-rolled MVC.
- No client-side SPA reactivity. Pages reload on navigation; only minimal vanilla JS for sidebar toggle, filter buttons, etc.
- Not preserving anime.js animations from the landing page in this iteration. Visual styling stays via the existing `styles.css`.
- No automated test framework — manual smoke tests + a small cURL script.

## Constraints & decisions

- **Render strategy:** Full server-side `.phtml` templates. Each screen becomes a PHP view rendered inside a layout.
- **Auth:** PHP form posts → PocketBase REST `auth-with-password` → token + user record stored in `$_SESSION`. PHP middleware gates protected routes.
- **Runtime:** XAMPP / Laragon / WAMP (Apache + PHP 8). `.htaccess` rewrites all requests to `public/index.php`.
- **Data source:** PocketBase collections for everything (`venues`, `bookings`, built-in `users`). PHP fetches via cURL.
- **Interactivity:** Pure server-side + small vanilla JS sprinkles only.
- **URL scheme:** Clean, RESTful — `/discover`, `/venue/{id}`, `/book/{id}`, `/bookings`, `/bookings/{id}/checkin`.

## Directory layout

```
hall/
├── public/                 ← Apache document root
│   ├── index.php           ← front controller (only PHP-accessible file)
│   ├── .htaccess           ← rewrites every request → index.php
│   ├── styles.css          ← copied from current root
│   └── assets/             ← icons, images
├── app/
│   ├── Core/
│   │   ├── Router.php      ← route table + dispatch
│   │   ├── Controller.php  ← base class with render() helper
│   │   ├── PocketBase.php  ← REST client wrapper (cURL)
│   │   ├── Session.php     ← auth token + user storage
│   │   └── Auth.php        ← middleware: requireAuth(), currentUser()
│   ├── Models/
│   │   ├── Venue.php       ← all(), find($id), filter($key)
│   │   ├── Booking.php     ← forUser(), create(), find(), checkin()
│   │   └── User.php        ← login(), register(), logout()
│   ├── Controllers/
│   │   ├── HomeController.php
│   │   ├── DiscoverController.php
│   │   ├── VenueController.php
│   │   ├── BookController.php
│   │   ├── BookingsController.php
│   │   ├── CheckinController.php
│   │   └── AuthController.php
│   └── Views/
│       ├── layouts/
│       │   ├── landing.phtml   ← public pages (no sidebar)
│       │   └── app.phtml       ← logged-in (sidebar + topbar)
│       ├── partials/
│       │   ├── sidebar.phtml
│       │   ├── topbar.phtml
│       │   ├── landing-header.phtml
│       │   └── chat-fab.phtml
│       └── screens/
│           ├── home.phtml
│           ├── discover.phtml
│           ├── venue.phtml
│           ├── book.phtml
│           ├── confirm.phtml
│           ├── bookings.phtml
│           ├── checkin.phtml
│           ├── login.phtml
│           ├── register.phtml
│           └── 404.phtml
├── config/
│   └── config.php          ← PB_URL, session name, app name
├── tests/
│   └── smoke.php           ← cURL hits every route, asserts status code
├── tools/
│   └── seed_venues.php     ← one-off: POSTs the 6 venues to PocketBase as admin
└── docs/superpowers/specs/
    └── 2026-04-19-php-mvc-rewrite-design.md   ← this file
```

## Routes

| Method | URL | Controller@action | Auth |
|---|---|---|---|
| GET  | `/` | `HomeController@index` | public |
| GET  | `/discover` | `DiscoverController@index` | public |
| GET  | `/discover?filter=available\|small\|large` | `DiscoverController@index` | public |
| GET  | `/venue/{id}` | `VenueController@show` | public |
| GET  | `/login` | `AuthController@loginForm` | public |
| POST | `/login` | `AuthController@login` | public |
| GET  | `/register` | `AuthController@registerForm` | public |
| POST | `/register` | `AuthController@register` | public |
| POST | `/logout` | `AuthController@logout` | required |
| GET  | `/book/{venueId}` | `BookController@form` | required |
| POST | `/book/{venueId}` | `BookController@create` | required |
| GET  | `/bookings/{id}/confirm` | `BookController@confirm` | required |
| GET  | `/bookings` | `BookingsController@index` | required |
| GET  | `/bookings/{id}/checkin` | `CheckinController@show` | required |
| POST | `/bookings/{id}/checkin` | `CheckinController@verify` | required |

A request to a protected route without a valid session redirects to `/login?next=<original-url>`. After successful login, redirect to `next` (defaulting to `/`).

## PocketBase schema

Created via the PocketBase admin UI at `https://pocketbase.zahar.my/_/`.

### `venues` collection
- API rules: `listRule = ""` (public), `viewRule = ""` (public), create/update/delete = admin only.

| field | type | notes |
|---|---|---|
| name | text | required |
| district | text | |
| capacity | number | |
| priceHour | number | |
| rating | number | |
| reviews | number | |
| tags | json | array of strings |
| available | select (single) | options: `now`, `soon`, `booked` |
| nextGap | text | |
| size | text | e.g. `4,200 sqft` |
| ceiling | text | |
| addons | json | array of strings |
| hero | select (single) | options: `warm`, `cool`, `sage`, `ink`, `amber`, `stone` |
| coord | json | `[x, y]` percentages |

The 6 records from `models/venues.model.jsx` are seeded by hand or via a one-off PHP `tools/seed_venues.php` script (using an admin token).

### `bookings` collection
- API rules:
  - `listRule = "user = @request.auth.id"` (only own bookings)
  - `viewRule = "user = @request.auth.id"`
  - `createRule = "@request.auth.id != \"\""` (any authed user)
  - `updateRule = "user = @request.auth.id"` (for check-in status update)
  - `deleteRule = ""` (none — no delete from app)

| field | type | notes |
|---|---|---|
| user | relation → users | required, indexed, single |
| venue | relation → venues | required, single |
| dateISO | date | |
| timeStart | text | `18:00` |
| timeEnd | text | `23:00` |
| guests | number | |
| status | select (single) | `upcoming`, `active`, `completed`, `cancelled` |
| pin | text | 4-digit check-in code |
| confirm | text | `HB-XXXXXX` |
| total | number | |

### `users` collection
PocketBase built-in. No schema changes.

## Request flow examples

### `GET /bookings` (protected list)
1. Apache rewrites → `public/index.php`
2. `Router::dispatch()` matches `/bookings` → `BookingsController@index`
3. `Auth::requireAuth()` checks `$_SESSION['pb_token']`. Missing → 302 to `/login?next=/bookings`.
4. Controller calls `Booking::forUser($user->id)` which calls `PocketBase::get('/api/collections/bookings/records', ['filter' => "user='{$id}'", 'expand' => 'venue', 'sort' => '-dateISO'])` with `Authorization: <token>`.
5. Controller renders `views/screens/bookings.phtml` inside `layouts/app.phtml`, passing `$bookings`.

### `POST /book/v1` (protected create)
1. Form posts `dateISO`, `timeStart`, `timeEnd`, `guests`, `csrf`.
2. `Auth::requireAuth()` + `Csrf::verify($_POST['csrf'])`.
3. `Booking::create($venueId, $user->id, $payload)` POSTs to PocketBase, returns `{id: 'bxx'}`.
4. Server-side compute: `total = (timeEnd - timeStart) * venue.priceHour`, `pin = random 4 digits`, `confirm = 'HB-' . strtoupper(bin2hex(random_bytes(3)))`.
5. Redirect (302) to `/bookings/{newId}/confirm` — Post-Redirect-Get pattern, no double-submit risk.

### Auth failure mid-session
- Any PocketBase call returning 401 → `PocketBase` wrapper throws → controller catches → calls `Session::clear()` → redirect to `/login`.

## Auth + sessions

- `POST /login` form: `email`, `password`, `csrf`.
- PHP calls `POST {PB_URL}/api/collections/users/auth-with-password` with `{identity, password}`.
- On 200: `$_SESSION['pb_token'] = $res->token; $_SESSION['pb_user'] = $res->record;`
- On error: re-render `login.phtml` with `$error = PocketBase::errorMessage($e)`.
- `POST /logout`: `session_destroy()`, redirect to `/`.
- Sessions use `session.cookie_httponly = 1`, `session.cookie_samesite = Lax`, secure flag if HTTPS.

## CSRF

- On session start, generate `$_SESSION['csrf'] = bin2hex(random_bytes(32))` if missing.
- Every form includes `<input type="hidden" name="csrf" value="<?= $csrf ?>">`.
- Every POST controller calls `Csrf::verify($_POST['csrf'] ?? '')` first. Mismatch → 403.

## Error handling

- `PocketBase` wrapper throws `PocketBaseException` on non-2xx with `message` extracted (mirroring the existing JS `errorMessage()` helper logic).
- Controllers catch and either:
  - Re-render the form view with `$error` (for 4xx user-input issues).
  - Render `500.phtml` for 5xx / unexpected.
- Unmatched route → render `404.phtml` inside the right layout (landing if not authed, app if authed).

## Migration of existing files

| Current file/dir | Action |
|---|---|
| `HallBook.html` | Delete (replaced by `public/index.php` + views) |
| `styles.css` | Move to `public/styles.css` unchanged |
| `app.init.jsx` | Delete |
| `components/` (browser-window.jsx) | Delete |
| `models/` (jsx) | Delete |
| `controllers/` (jsx) | Delete (PHP controllers go in `app/Controllers/`) |
| `views/` (jsx) | Delete (PHP views go in `app/Views/`) |

PHP `app/`, `public/`, `config/` directories are new.

## Testing strategy

- **Manual smoke test** through every route after each controller is built (browser).
- **`tests/smoke.php`** — small cURL script:
  - GETs every public route, asserts 200.
  - GETs every protected route, asserts 302 → `/login`.
  - Logs in via test user, GETs every protected route, asserts 200.
  - Run via `php tests/smoke.php` from repo root.
- **PocketBase verification:** after each create/update flow, verify the record appears in the admin UI.

## Out of scope (deferred)

- Editing/cancelling existing bookings.
- Admin UI for venue management (use PocketBase admin directly).
- Email confirmations.
- Search by date/time across venues.
- Real-time check-in status updates.
- Animations / anime.js port.
- Mobile responsive polish beyond what already exists in `styles.css`.

## Risks

- **PocketBase schema drift:** if collection rules aren't set correctly, listing other users' bookings could leak. Mitigation: explicit per-user `filter=` AND server-side `listRule`, both enforced.
- **Session fixation:** mitigated by `session_regenerate_id(true)` after successful login.
- **CSRF on POST forms:** explicit token verification on every POST controller.
- **PocketBase token expiry:** if the stored token expires mid-session, treat 401 as logout. (PocketBase tokens are long-lived by default but not infinite.)
