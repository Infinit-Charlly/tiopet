# PROJECT_MEMORY.md

## Project Overview

TioPet is an Expo / React Native MVP application focused on pet care services such as daycare, boarding, and future caregiver services.

The project currently prioritizes a local-first MVP approach where core functionality works without requiring a full backend platform.

State is primarily managed with Zustand and AsyncStorage, while Firebase is currently used mainly for authentication.

The booking flow, pet registration, and booking history are the most developed areas of the application.

---

## Current Architecture Direction

The project follows an incremental architecture strategy:

1. Stabilize the working MVP
2. Extract domain logic from UI screens
3. Normalize local data models
4. Introduce clean persistence boundaries
5. Prepare for future backend/API integration

Large rewrites are intentionally avoided.

---

## Agent Development Model

The repository uses an agent-assisted development workflow.

Agent roles are defined in the `skills/` directory:

- Architect Agent
- Programmer Agent
- Tester Agent
- Security Agent
- Product Agent

These agents collaborate under the rules defined in:

- `AGENTS.md`
- `MVP_ROADMAP.md`
- `NEXT_TASK.md`

---

## Known Blockers
- Some web interactions (date picker and hold/cancel UX) behave differently than on mobile and may need web-specific UX adjustments later
### Google OAuth

Google authentication is currently optional and should not block unrelated MVP work.

The current supported approach is anonymous-first authentication until the rest of the MVP stabilizes.

### Office Mobile QR / Expo Go

Expo Go QR access is currently unreliable in the office environment and appears to be affected by endpoint/network security controls.

This is considered an environment issue, not a core application logic blocker.

### TypeScript Validation Environment

Full typecheck is not yet clean because the repository still has pre-existing unrelated path-alias/type issues outside the recent booking refactor scope.

---

## Confirmed Technical Decisions

- The app remains Expo Router based
- TypeScript strict mode should be preserved
- Zustand + AsyncStorage remain the primary local persistence layer
- Firebase usage should remain minimal until domain boundaries are cleaner
- Booking logic should not live directly inside large screen components
- Google auth must not crash render when env configuration is missing
- Shared booking domain rules should be extracted into reusable typed modules under `src/domain/bookings/`

---

## Current MVP Capabilities

Working today:

- login screen
- anonymous authentication
- pet CRUD with local persistence
- booking creation flow
- booking confirmation
- booking history
- profile screen
- extracted booking domain modules reused by the booking screen

Partially implemented:

- Google authentication
- transport screen
- shop screen
- booking history actions (confirm / cancel) need review

Not implemented yet:

- QR reservations
- payments
- notifications
- admin panel
- caregiver flows
- backend API

---

## Recent Completed Steps

- Added `AGENTS.md`
- Added `MVP_ROADMAP.md`
- Added `NEXT_TASK.md`
- Added agent skill definitions in `skills/`
- Added repository project memory
- Configured Firebase environment variables through `.env`
- Fixed app startup so missing Google env configuration no longer crashes render
- Extracted booking domain logic from `app/(tabs)/bookings.tsx` into `src/domain/bookings/`
- Added reusable typed modules for booking plans, options, pricing, dates, labels, and types
- Hardened booking pricing fallbacks so invalid runtime values no longer produce `NaN`
- Manually validated the main booking flow in web:
  - anonymous login works
  - pet creation works
  - pet edit works
  - booking creation works
  - booking confirmation works
  - booking appears in history as pending
  - Implemented local-first Care Timeline system inside bookings
  - Added booking lifecycle timeline entries for created and cancelled bookings
  - Manually validated timeline rendering on web and mobile
  - Confirmed Expo mobile QR access is working again
  - Refined the booking timeline into a shared left-side vertical rail layout for a more premium mobile-first presentation
  - Implemented local-first QR booking flow with check-in and check-out phases
  - Added QR lifecycle integration with booking timeline
  - Added booking QR screen and local validation flow

---

## Next Planned Task

The next architectural/product improvement is:

**Analyze and fix why booking actions in the history tab (such as confirm or cancel) are not working as expected.**

Focus files:

- `app/(tabs)/history.tsx`
- `src/store/bookingsStore.ts`

The goal is to restore expected booking action behavior with the smallest safe fix.

---

## Development Philosophy

TioPet should evolve through small, safe, incremental improvements.

The priority is:

1. working product
2. maintainable code
3. clean domain boundaries
4. scalable architecture

Not speculative infrastructure.