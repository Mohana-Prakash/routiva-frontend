# Personal Schedule & Activity Tracker — Frontend Requirements

## 1. Product Overview

Build a multi-user web application that allows users to:

- Register and authenticate securely.
- Create a fully customized 24-hour daily schedule.
- Assign activities to categories.
- Configure alarms/reminders for selected activities only.
- Track planned versus actual activity time.
- Mark activities as completed, skipped, or adjusted.
- Add ad-hoc activities such as Play, Travel, Events, etc.
- Handle schedule conflicts without permanently changing the base schedule.
- View daily, weekly, monthly, and custom-date reports.
- Use the application comfortably on desktop and mobile.
- Install/use the application as a PWA.
- Receive browser/push notifications for configured reminders.

The application must be user-specific. One user's schedules, activities, logs, and reports must never be visible to another user.

## 2. Frontend Stack

Use:

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- React Query / TanStack Query
- React Hook Form
- Zod
- Lucide React icons
- Recharts or another lightweight charting library
- PWA support
- Web Push notification support

Do not introduce additional frontend libraries unless there is a clear requirement.

## 3. Frontend Principles

### 3.1 Responsive-first

The application must work well on:

- Desktop
- Tablet
- Mobile

The daily timeline is the primary mobile experience.

### 3.2 Accessibility

Use:

- Semantic HTML
- Keyboard-accessible controls
- Visible focus states
- Accessible labels
- Appropriate ARIA attributes where required
- Sufficient contrast
- Clear validation/error messages

### 3.3 Consistent state handling

Use server state through TanStack Query.

Use local component state only for UI concerns.

Do not duplicate server data unnecessarily into global state.

### 3.4 Time handling

All schedule-related UI must handle:

- User timezone
- 24-hour time
- Midnight boundaries
- Activities crossing midnight
- Daylight-saving changes where applicable

The frontend should receive/use the user's configured timezone rather than assuming a fixed timezone.

## 4. Primary Navigation

Authenticated users should have:

1. Dashboard
2. Schedule
3. Activities
4. Reports
5. Settings

Mobile navigation can use a bottom navigation bar or responsive menu.

## 5. Authentication Screens

Required screens:

- Login
- Registration
- Forgot Password
- Reset Password
- Session-expired handling

Authentication forms must have:

- Client-side validation
- Loading state
- Disabled submit while submitting
- Field-level errors
- Server error display
- Success feedback

After successful login, navigate to Dashboard.

Unauthenticated users must not access authenticated routes.

## 6. Global UI

Provide:

- Global toast/notification system
- Confirmation dialog
- Loading skeletons
- Empty states
- Error states
- Offline/network feedback where practical
- Global error boundary
- Responsive modal/drawer behavior

## 7. Visual Direction

The UI should feel:

- Calm
- Minimal
- Focused
- Personal
- Easy to scan quickly

The dashboard should prioritize the next/current activity rather than overwhelming the user with analytics.

Use category icons/colors consistently, but do not rely on color alone to communicate status.
