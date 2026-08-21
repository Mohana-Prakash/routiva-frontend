# My Day Tracker — Frontend

Personal Schedule & Activity Tracker — a multi-user web app for building a daily
schedule, tracking what actually happened, and reviewing progress over time.

This is the frontend only. It talks to a separate Node.js + Express backend
(`my_day_tracker_service`) over a versioned REST API; see
`frontend-requirements/06-api-contracts-frontend-boundary.md` for the contract
this app was built against.

## Stack

Next.js (App Router, static export) · TypeScript (strict) · Tailwind CSS ·
shadcn/ui (Base UI primitives) · TanStack Query · React Hook Form + Zod ·
Recharts · axios · next-pwa (`@ducanh2912/next-pwa`) · Vitest + Testing Library

## Architecture notes

- **Static SPA, no server runtime.** `next.config.ts` sets `output: "export"`.
  There is no Next.js middleware and no API routes — the browser talks
  directly to the Express API (`NEXT_PUBLIC_API_URL`) with axios and
  `withCredentials: true`. Auth is an httpOnly cookie set by the backend.
  Route protection is a client-side guard (`RequireAuth`/`RedirectIfAuthenticated`
  in `src/features/auth/RequireAuth.tsx`) that runs after session restoration —
  the backend remains the real authorization boundary for every request.
- **Domain model.** Category → Activity (reusable template) → ScheduleEntry
  (recurring base schedule) → ScheduleException (date-specific MOVE/SKIP/ADD/
  REPLACE) → ActivityLog (immutable historical record). `GET /schedules/date/:date`
  is the single source of truth for a day's rendered timeline; the Dashboard and
  Schedule screens both consume it rather than re-deriving it client-side.
- **Feature-first structure.** `src/features/<domain>/{hooks,components,lib}`;
  cross-feature UI in `src/components/{ui,shared,layout}`; the API layer is
  centralized in `src/lib/api/*` (one file per resource, all typed, all going
  through `src/lib/api/client.ts`'s axios instance).

## Getting started

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL to your backend
npm run dev                   # http://localhost:3000
```

`npm run dev` and `npm run build` both pass `--webpack` explicitly — the PWA
plugin's Workbox integration is webpack-based and isn't compatible with
Turbopack (Next 16's default) yet.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server (webpack) |
| `npm run build` | Production build → static export in `out/` |
| `npm run start` | Serve the build with `next start` (local verification only — the real deploy target is a static host) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test` | Vitest (single run) |
| `npm run test:watch` | Vitest (watch mode) |

## Environment variables

See `.env.example`. All variables are `NEXT_PUBLIC_*` and baked in at build
time — there's no server runtime to hold anything secret, which is fine here
because the frontend never holds a secret; the backend does.

- `NEXT_PUBLIC_API_URL` — Express API base URL, including the version prefix.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — Web Push public key; must match the
  backend's key pair.

## PWA / service worker

`worker/index.js` holds the custom `push` and `notificationclick` handlers;
`@ducanh2912/next-pwa` merges it into the generated Workbox service worker at
build time (`customWorkerSrc`/`customWorkerDest` in `next.config.ts`). The
generated `public/sw.js`, `public/workbox-*.js`, and `public/worker-*.js` are
build output — gitignored, regenerated every build.

## Known gaps against the requirement docs

A few things in `frontend-requirements/` don't have a corresponding field or
endpoint in the reviewed backend contract. Each is called out with a comment
at its point of use; summary:

- **Daily completion summary** (`02-dashboard-and-schedule.md` §11) has no
  dedicated endpoint in `08-api-contracts-and-validation.md` — computed
  client-side from `GET /schedules/date/:date` instead
  (`src/features/schedule/lib/computeDailySummary.ts`).
- **Week start day** and **default schedule behavior**
  (`05-settings-and-error-states.md` §1) have no backend field — week start day
  is stored per-device in `localStorage`
  (`src/features/settings/hooks/useWeekStartPreference.ts`); "default schedule
  behavior" has no concrete spec anywhere and was left out rather than guessed.
- **Most frequent ad-hoc activities** and **schedule deviation summary**
  (`04-reports-and-analytics.md` §7-8) aren't covered by any of the four
  `/reports/*` endpoints — omitted from the Reports screen rather than backed
  by an invented endpoint.
- **Report export** (CSV/PDF) is explicitly optional in the requirements and
  was not built — no control for it is shown, per "don't expose broken
  controls for unbuilt features."
- **ONE_TIME schedule entries** need an anchor date that isn't listed among
  `schedule_entries`' fields in the backend data model doc — `Recurrence.date`
  was added on the frontend as an assumption (see the comment in
  `src/types/schedule.ts`).
- **VAPID public key delivery** and **conflict-resolution wire shape**
  (the `resolution` field sent back after a 409) are both frontend
  assumptions pending the published OpenAPI contract — see the comments in
  `src/lib/api/schedules.ts` and `.env.example`.

None of these block the app from working; they're the seams to revisit once
the backend's real OpenAPI spec exists.
