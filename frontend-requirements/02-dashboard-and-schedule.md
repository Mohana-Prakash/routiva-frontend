# Frontend Requirements — Dashboard & Schedule

## 1. Dashboard

The Dashboard is the primary screen after login.

It must show:

- Current date
- Current time
- User's daily completion summary
- Current activity
- Next activity
- Full day's timeline
- Quick action to add an ad-hoc activity
- Quick access to today's report/summary

## 2. Current Activity Card

If an activity is currently active according to time or user action, display:

- Activity name
- Category
- Start time
- End time
- Remaining duration
- Alarm status
- Start/Complete/Skip action as appropriate

Example:

    Meditation
    18:00 – 18:30
    12 minutes remaining

    [Complete] [Skip]

## 3. Next Activity

Show the next scheduled activity prominently.

Example:

    Next
    Murli Revision
    Starts at 19:45
    in 18 minutes

If an alarm is configured, display an alarm icon.

## 4. Daily Timeline

Display activities chronologically.

Each timeline item should show:

- Start time
- End time
- Activity name
- Category
- Alarm indicator
- Status
- Actual duration when completed
- Conflict indicator when applicable

Statuses:

- Upcoming
- Current
- Completed
- Skipped
- Cancelled
- Adjusted

## 5. Timeline Interaction

Selecting an activity should open an activity detail view.

Actions:

- Start
- Complete
- Skip
- Edit
- Delete
- View actual timing

The user must be able to record an activity as completed even if the actual start/end time differs from the planned time.

## 6. Daily Schedule Management

The Schedule screen must allow the user to:

- View the complete 24-hour schedule
- Add activity
- Edit activity
- Delete activity
- Reorder/adjust activities
- Enable/disable alarms
- Change category
- Change time
- Configure recurrence

## 7. Schedule Creation

Activity form fields:

- Activity name
- Category
- Start time
- End time
- Alarm enabled
- Alarm timing
- Repeat pattern
- Notes (optional)
- Active/inactive

Default recurrence should be Daily when creating a base daily schedule.

## 8. Schedule Conflict Detection

When an activity overlaps another activity, show a clear warning.

Example:

    Schedule conflict

    Play: 20:00 – 22:30
    overlaps with:
    Dinner: 20:45 – 21:30
    Meditation: 21:30 – 22:00

The UI must not silently overwrite existing activities.

Give the user explicit choices:

- Keep both
- Shift affected activities
- Skip affected activities for this date
- Cancel

## 9. Base Schedule vs Daily Exception

The frontend must distinguish between:

### Base schedule

The user's normal recurring routine.

### Daily exception

A temporary change for a specific date.

Example:

Base:
- Meditation 21:30–22:00

Exception:
- Meditation 22:30–23:00 on August 25

Changing an exception must not permanently modify the base schedule unless the user explicitly chooses to update the recurring schedule.

## 10. Ad-hoc Activity

Provide:

    + Add Activity

The user can add activities that are not part of the normal schedule.

Examples:

- Play
- Doctor appointment
- Travel
- Meeting
- Family event

Ad-hoc activities should be associated with a specific date/time and should not automatically become recurring activities.

## 11. Daily Completion Summary

Show a compact summary such as:

- Completed: 12
- Upcoming: 4
- Skipped: 1
- Adjusted: 2
- Completion: 86%

Also show planned versus actual duration where data is available.
