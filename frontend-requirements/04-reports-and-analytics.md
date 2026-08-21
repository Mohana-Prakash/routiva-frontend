# Frontend Requirements — Reports & Analytics

## 1. Reports Screen

The Reports screen must support:

- Today
- Yesterday
- This week
- Last week
- This month
- Last month
- Custom date range

Date range selection must be easy on desktop and mobile.

## 2. Main Metrics

Display:

- Total planned time
- Total actual time
- Completion rate
- Number of completed activities
- Number of skipped activities
- Number of adjusted activities
- Planned vs actual difference

## 3. Category Report

Show time by category.

Example:

    Spiritual      4h 15m
    Work           4h 00m
    Study          2h 30m
    Sleep          7h 30m
    Personal       5h 45m

Allow the user to select a category to inspect its activities.

## 4. Planned vs Actual

For each major category show:

- Planned duration
- Actual duration
- Difference
- Completion percentage

Example:

    Meditation
    Planned: 17h 30m
    Actual: 16h 45m
    Achievement: 96%

## 5. Consistency

Track activity consistency separately from duration.

Example:

    Meditation
    13 / 14 sessions
    92.9%

This prevents a user from appearing successful merely because they accumulated time in fewer sessions.

## 6. Daily Trend

Show daily values over the selected date range.

Examples:

- Meditation minutes/day
- Study hours/day
- Sleep hours/day
- Office hours/day
- Overall completion percentage

## 7. Weekly Report

Weekly report should include:

- Summary cards
- Category distribution
- Planned vs actual chart
- Daily completion trend
- Most consistent activities
- Most skipped activities
- Schedule deviations

## 8. Monthly Report

Monthly report should include:

- Total activity time
- Category breakdown
- Consistency
- Planned vs actual
- Weekly trend
- Best day
- Lowest-completion day
- Most frequent ad-hoc activities
- Schedule deviation summary

## 9. Custom Date Range

User can choose:

    From: YYYY-MM-DD
    To: YYYY-MM-DD

The report must update based on that exact range.

Do not hard-code week/month assumptions into the report UI.

## 10. Report Empty States

If there is insufficient data:

    No activity data yet

    Complete a few activities and your report
    will appear here.

Do not display misleading zero-value charts when there is no data.

## 11. Export

Optional MVP enhancement:

- Export report as CSV
- Export summary as PDF

If export is not included in the first release, the UI should not expose broken controls.
