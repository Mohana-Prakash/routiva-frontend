# Frontend Requirements — Implementation Plan

## Phase 1 — Project Foundation

- Initialize Next.js TypeScript application
- Configure Tailwind
- Configure shadcn/ui
- Configure linting/formatting
- Configure environment variables
- Configure API client
- Configure TanStack Query
- Configure route protection
- Create base layout
- Create navigation

## Phase 2 — Authentication

Implement:

- Login
- Registration
- Forgot password
- Reset password
- Session restoration
- Logout
- Protected routes
- Auth error handling

## Phase 3 — Core Schedule

Implement:

- Categories
- Activities
- Daily schedule
- Activity creation/editing
- Activity deletion
- Recurrence
- Timeline
- Schedule exceptions
- Conflict detection UI

## Phase 4 — Daily Tracking

Implement:

- Start activity
- Complete activity
- Skip activity
- Actual timing
- Daily completion summary
- Planned vs actual display

## Phase 5 — Notifications

Implement:

- Notification settings
- Browser permission flow
- Service worker
- Push subscription
- Activity alarm UI
- Notification click routing
- Alarm status indicators

## Phase 6 — Ad-hoc Activities

Implement:

- Add one-time activity
- Date/time selection
- Conflict detection
- Exception handling
- Actual timing

## Phase 7 — Reports

Implement:

- Date range selector
- Summary cards
- Category charts
- Planned vs actual
- Consistency
- Daily trends
- Weekly report
- Monthly report
- Custom range report

## Phase 8 — PWA & Responsive Polish

Implement:

- Manifest
- Icons
- Install experience
- Mobile navigation
- Responsive timeline
- Responsive reports
- Offline shell
- Network state handling

## Phase 9 — Testing

Frontend testing should cover:

### Authentication

- Registration validation
- Login success/failure
- Protected routes
- Logout
- Session expiration

### Schedule

- Create activity
- Edit activity
- Delete activity
- Overlap detection
- Daily exception
- Recurring schedule

### Tracking

- Start
- Complete
- Skip
- Actual timing
- Daily summary

### Notifications

- Permission granted
- Permission denied
- Alarm enabled/disabled
- Push subscription
- Notification click

### Reports

- Today
- Week
- Month
- Custom range
- Empty state
- Planned vs actual

### Responsive

Verify:

- Desktop
- Tablet
- Mobile

## Phase 10 — Production Readiness

Before deployment verify:

- No hard-coded secrets
- No tokens exposed in UI
- No console errors
- No broken routes
- Proper error boundaries
- Proper loading states
- API errors handled
- Notification permissions handled
- PWA works
- Mobile layout works
- Production environment variables configured
