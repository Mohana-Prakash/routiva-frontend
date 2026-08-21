# Frontend Requirements — Activities, Alarms & PWA

## 1. Activity Management

The Activities screen should list the user's activities and categories.

Each activity should display:

- Name
- Category
- Default duration
- Alarm enabled/disabled
- Recurrence
- Active status

Actions:

- Create
- Edit
- Archive/deactivate
- Delete where permitted

## 2. Categories

Provide default categories such as:

- Spiritual
- Work
- Study
- Health
- Exercise
- Family
- Personal
- Sleep
- Travel
- Entertainment
- Other

Users can create custom categories.

Category fields:

- Name
- Icon
- Color
- Active status

The frontend must not assume that these are the only categories.

## 3. Alarm Configuration

Alarm configuration is per activity.

Fields:

- Alarm enabled
- Alarm timing

Supported reminder options:

- At start
- 5 minutes before
- 10 minutes before
- 15 minutes before
- Custom

The UI should clearly distinguish:

- Alarm configured
- Alarm disabled
- Browser notification permission not granted

## 4. Notification Permission

The application must explain why notification permission is needed.

Example:

    Enable reminders

    Allow notifications so the app can remind you about
    selected activities even when you are not actively viewing
    the dashboard.

Provide:

- Enable Notifications
- Notification permission status
- Retry permission where supported
- Link/instructions for browser settings when permission is blocked

Do not repeatedly request permission without user interaction.

## 5. PWA

The application should be installable as a PWA.

Requirements:

- Web app manifest
- App icons
- Installable experience
- Standalone display mode
- Service worker
- Offline-friendly shell where practical

The app should remain useful when temporarily offline for viewing cached schedule data.

Mutating actions while offline should not be silently lost. Either queue them safely or clearly inform the user that connectivity is required.

## 6. Push Notifications

Frontend requirements:

- Register service worker
- Request notification permission
- Create/manage push subscription
- Send subscription to backend
- Remove subscription when user disables notifications
- Handle notification click
- Navigate to the relevant activity/dashboard

Notification click should open the application at the appropriate activity/date where possible.

## 7. Alarm UX

When an alarm fires:

- Browser notification should contain activity name
- Include scheduled start time
- Clicking notification opens the dashboard
- The activity should be visually highlighted

Example:

    Meditation starts in 5 minutes.

## 8. Alarm Safety

The frontend must never assume that JavaScript timers alone are reliable for long-term reminders.

Reminder scheduling must be coordinated with backend push notification infrastructure.

## 9. Activity Details

Activity detail view should show:

- Planned time
- Actual time
- Duration
- Category
- Alarm settings
- Status
- Date
- Notes if present
- Whether it is base schedule or exception

## 10. Tracking Controls

For a current activity:

- Start
- Pause if supported
- Complete
- Skip

For completed activities:

- View details
- Correct actual timing if the user has permission
- Add note

Avoid requiring users to manually track every minute. The app should make one-tap tracking practical.
