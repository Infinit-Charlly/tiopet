# NEXT_TASK.md

## Next Safe Task

Extract booking domain data and booking rules from `app/(tabs)/bookings.tsx` into typed local modules without changing app behavior.

## Why This First

- It avoids the Google OAuth blocker completely.
- It improves maintainability in the app's biggest MVP screen.
- It creates a clean base for later persistence and backend work.
- It is low-risk because it can preserve the current UI and flow.

## Scope

Create local typed modules for booking domain concerns such as:

- service plans
- cities
- care time options
- transport options
- price calculation rules
- date helper logic
- booking-related types used by the screen

Suggested location:

- `src/features/bookings/` or `src/domain/bookings/`

## Expected Refactor Shape

Move hardcoded logic out of the screen:

- `PLANS`
- city type/options
- transport type/options
- date helper functions
- pricing calculation logic
- reusable booking labels/types

Keep inside the screen for now:

- view state
- navigation
- UI rendering
- local component composition

## Non-Goals

- do not change auth
- do not add backend code
- do not redesign the booking UX
- do not change visual design, copy, or navigation flow unless required to preserve current behavior
- do not change store persistence yet
- do not implement QR, payments, or notifications

## Acceptance Criteria

- `app/(tabs)/bookings.tsx` becomes materially smaller and more focused on UI
- booking rules live in typed reusable modules under `src/`
- current booking flow behavior stays the same
- current labels and prices remain unchanged unless a bug is intentionally fixed
- the extracted modules are ready to be reused by confirmation/history flows later

## Likely Files To Touch In That Task

- `app/(tabs)/bookings.tsx`
- new files under `src/` for booking domain data and helpers

## Suggested Order

1. Define booking domain types
2. Extract constants and options
3. Extract pure helper functions
4. Replace in-screen hardcoded rules with imports
5. Verify no behavior change
