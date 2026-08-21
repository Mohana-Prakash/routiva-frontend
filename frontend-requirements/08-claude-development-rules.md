# Frontend Requirements — Claude Development Rules

This file is intended to guide Claude while implementing the frontend.

## 1. Do Not Invent Backend Behavior

Use only the agreed API contracts.

If an API contract is missing, identify the gap instead of silently inventing a different architecture.

## 2. Do Not Rewrite Unrelated Code

When implementing a feature:

- Modify only necessary files.
- Preserve existing behavior.
- Avoid broad refactors unless requested.
- Explain significant structural changes.

## 3. TypeScript

Use strict TypeScript.

Do not introduce `any` unless there is a documented unavoidable reason.

Prefer explicit domain types.

## 4. Components

Prefer reusable components.

Examples:

- ActivityCard
- TimelineItem
- ActivityForm
- AlarmSettings
- CategoryBadge
- DateRangePicker
- ReportCard
- EmptyState
- ErrorState
- LoadingSkeleton

Do not create one giant dashboard component.

## 5. Forms

Use React Hook Form + Zod.

Validation schemas should be reusable where appropriate.

## 6. Server State

Use TanStack Query.

Do not manually duplicate server state into Zustand/Redux unless there is a clear requirement.

## 7. UI State

Local state is preferred for:

- Modal open/close
- Form state
- Selected tab
- Temporary filters

## 8. API Calls

Use the centralized API layer.

Do not make direct API calls from presentation components.

## 9. Dates

Do not use fragile string manipulation for dates/times.

Use one agreed date/time utility strategy throughout the project.

## 10. Error Handling

Every mutation must provide:

- Loading state
- Success feedback where useful
- Error feedback

Do not silently swallow errors.

## 11. Accessibility

Every interactive element must be keyboard accessible.

Inputs require labels.

Icon-only buttons require accessible labels.

## 12. Mobile

Do not design desktop first and simply shrink it.

The dashboard timeline and activity actions must be deliberately designed for touch interaction.

## 13. Testing

After implementing a feature:

1. Type-check.
2. Lint.
3. Run relevant tests.
4. Verify affected pages.
5. Check responsive behavior.
6. Fix errors before continuing.

## 14. No Feature Creep

The initial MVP must focus on:

- Authentication
- Custom schedules
- Activities
- Alarms
- Daily tracking
- Ad-hoc activities
- Reports
- PWA

Do not add:

- Social network
- Chat
- AI assistant
- Payments
- Teams
- Public profiles
- Gamification
- Complex calendar integrations

unless explicitly requested.

## 15. Definition of Done

A frontend feature is complete only when:

- UI exists
- API integration works
- Loading state exists
- Error state exists
- Empty state exists where relevant
- Validation exists
- Responsive behavior is verified
- TypeScript passes
- Lint passes
- Tests are added where appropriate
- No unrelated regressions are introduced
