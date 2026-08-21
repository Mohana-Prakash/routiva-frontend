# Frontend Requirements — API Integration Boundary

## 1. General Rule

The frontend must consume backend APIs through a centralized API client.

Do not scatter raw fetch/axios calls across components.

Recommended structure:

    src/
      lib/
        api/
          client.ts
          auth.ts
          schedules.ts
          activities.ts
          reports.ts
          notifications.ts

## 2. Authentication API Requirements

Frontend expects APIs conceptually equivalent to:

- POST /auth/register
- POST /auth/login
- POST /auth/logout
- POST /auth/refresh
- POST /auth/forgot-password
- POST /auth/reset-password
- GET /auth/me

Exact backend routes may differ, but frontend integration must remain centralized.

## 3. Schedule API Requirements

Conceptually:

- GET /schedules
- POST /schedules
- PATCH /schedules/:id
- DELETE /schedules/:id
- GET /schedules/today
- GET /schedules/date/:date
- POST /schedules/exceptions
- PATCH /schedules/exceptions/:id
- DELETE /schedules/exceptions/:id

## 4. Activity API Requirements

Conceptually:

- GET /activities
- POST /activities
- PATCH /activities/:id
- DELETE /activities/:id
- POST /activities/:id/start
- POST /activities/:id/complete
- POST /activities/:id/skip
- GET /activity-logs
- GET /activity-logs/:id

## 5. Category API Requirements

Conceptually:

- GET /categories
- POST /categories
- PATCH /categories/:id
- DELETE /categories/:id

## 6. Reports API Requirements

Conceptually:

- GET /reports/summary
- GET /reports/category
- GET /reports/daily
- GET /reports/planned-vs-actual

Each report request should accept:

- from
- to
- timezone where required

## 7. Notification API Requirements

Conceptually:

- GET /notifications/preferences
- PATCH /notifications/preferences
- POST /notifications/push/subscribe
- DELETE /notifications/push/subscribe

## 8. Query Keys

Use predictable TanStack Query keys.

Examples:

    ['me']

    ['schedule', 'today']

    ['schedule', date]

    ['activities']

    ['activity-logs', from, to]

    ['reports', 'summary', from, to]

Mutations must invalidate only the relevant queries.

## 9. API Response Handling

The frontend must have a consistent response parsing strategy.

Do not let individual components implement different API response formats.

## 10. Authentication Token Handling

Prefer secure HTTP-only cookies for authentication where the backend architecture supports them.

Do not store sensitive authentication tokens in localStorage unless there is a deliberate architecture decision requiring it.

## 11. Ownership

The frontend may display only resources returned for the authenticated user.

The backend remains responsible for enforcing ownership and authorization.

## 12. API Types

All API request/response types should be strongly typed.

Avoid `any`.

Use generated types if the backend exposes OpenAPI/Swagger and generation is practical.

## 13. Date and Time Serialization

Use a consistent format for API communication.

Dates should use ISO-compatible representations.

Times such as daily schedule start/end may be represented separately from dates depending on backend contract.

Do not perform implicit locale-dependent parsing.

## 14. Optimistic Updates

Use optimistic updates only where safe and easy to roll back.

Good candidates:

- Mark activity complete
- Mark activity skipped
- Toggle alarm

Avoid optimistic updates for complex schedule changes unless rollback behavior is implemented correctly.
