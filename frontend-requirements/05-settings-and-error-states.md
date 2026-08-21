# Frontend Requirements — Settings, States & UX Rules

## 1. Settings

Settings should include:

### Profile

- Name
- Email
- Timezone

### Notifications

- Notifications enabled/disabled
- Default reminder preference
- Push subscription status

### Appearance

- Light
- Dark
- System

### Schedule

- Default schedule behavior
- Week start day
- Default activity duration if supported

## 2. Timezone

The user timezone must be visible in settings.

The frontend must use the configured timezone for displaying schedule times.

Do not use the browser timezone blindly if the backend has a user-configured timezone.

## 3. Loading States

Use skeletons for major content.

Avoid full-page spinners for small actions.

Buttons should show a loading state while mutations are executing.

## 4. Error States

Every API-backed screen must have:

- Loading state
- Success state
- Empty state
- Error state

Example:

    Unable to load today's schedule.

    [Try Again]

## 5. Form Validation

Use Zod schemas.

Validate:

- Required fields
- Valid time format
- Start/end consistency
- Activity name length
- Category selection
- Alarm values

Display errors next to the relevant field.

## 6. Destructive Actions

Deleting an activity/category should require confirmation where the action cannot be undone.

Example:

    Delete "Meditation"?

    Existing historical activity records will be preserved.

    [Cancel] [Delete]

Historical records should not disappear simply because a recurring activity is deleted.

## 7. Empty States

Examples:

### No schedule

    Your day is empty.

    Create your first activity to build your schedule.

    [Create Activity]

### No reports

    No completed activities yet.

    Start tracking your day to see reports.

## 8. Mobile UX

On mobile:

- Timeline must be vertically scrollable
- Primary actions must be easy to tap
- Avoid dense tables
- Convert tables into cards where necessary
- Date picker must work well on touch devices
- Reports should use horizontally scrollable charts where appropriate

## 9. Desktop UX

Desktop can use:

- Sidebar navigation
- Wider timeline
- Two-column dashboard
- Side panel for activity details

## 10. Confirmation Rules

Do not show confirmation for every minor action.

Use confirmation for:

- Delete
- Permanent schedule changes
- Logout if unsaved work exists
- Removing notification permissions/subscriptions where appropriate

## 11. Unsaved Changes

If a form has unsaved changes and the user navigates away, warn where browser behavior allows.

## 12. Security UX

Never display:

- Password values
- Access tokens
- Refresh tokens
- Sensitive authentication information

The frontend should never trust user IDs or ownership values returned from URL parameters to authorize actions. Authorization belongs to the backend.

## 13. API Error Mapping

Common backend errors should map to useful messages.

Examples:

- 401 → Session expired
- 403 → You do not have permission
- 404 → Resource not found
- 409 → Schedule conflict
- 422 → Validation error
- 429 → Too many requests
- 500 → Something went wrong

## 14. Performance

The dashboard should load quickly.

Requirements:

- Avoid unnecessary API requests
- Cache appropriate queries
- Refetch today's schedule after mutations
- Paginate historical activity data
- Lazy-load heavy report/chart sections where useful
- Avoid rendering thousands of timeline entries at once

## 15. Data Freshness

Today's schedule should refresh when:

- User completes an activity
- User skips an activity
- User adds an ad-hoc activity
- User changes a schedule exception
- Relevant notification state changes

Do not require a full browser refresh after normal actions.
