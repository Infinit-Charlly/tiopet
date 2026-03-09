# MVP_ROADMAP.md

## Current Baseline

The repository is currently a working Expo / React Native app with:

- Expo Router navigation
- anonymous Firebase login
- local auth cache
- pet registration with local persistence
- booking creation with local persistence
- booking history and local status changes

The MVP is not yet backed by a real service layer or database model.
Most product behavior still lives in UI screens and local Zustand stores.

## What Is Already Real

Implemented now:

- login screen with anonymous path
- route guard into tabs
- pet CRUD flow
- booking wizard
- booking confirmation
- booking history
- profile screen with local reset actions in dev

Present but incomplete:

- Google sign-in
- Firebase auth persistence architecture
- transport screen
- shop screen
- address management

Not implemented:

- QR reservations
- payments
- notifications
- admin panel
- caregiver workflows
- backend API

## MVP Priorities

### Phase 1: Stabilize The Existing App

- make auth flow resilient without relying on Google OAuth
- clean up environment and project docs
- remove repo/documentation drift

### Phase 2: Extract Domain Logic From Screens

- move booking plans, cities, pricing rules, transport options, and date helpers into typed local modules
- reduce the size and responsibility of `app/(tabs)/bookings.tsx`
- prepare clean types that can later map to a backend model

### Phase 3: Tighten Local Data Models

- normalize pet and booking entities
- separate display labels from stored values
- define a clear booking input model vs persisted booking record

### Phase 4: Improve Persistence Boundaries

- keep Zustand stores
- add clearer repository/service boundaries
- make future Firebase or API migration possible without rewriting screens

### Phase 5: Finish The Real MVP Surface

- complete transport/address basics
- refine reservation confirmation and history behavior
- improve empty states, validation, and user feedback

## Known Risks

- Google OAuth remains a blocker and should not gate unrelated MVP work
- booking rules are hardcoded inside a large screen component
- current booking data is UI-shaped, not domain-shaped
- there are no automated tests yet
- local state works for demo use, but not for multi-device or operational use

## Recommended Sequence

1. Extract booking domain data and rules into typed modules
2. Stabilize auth persistence without expanding OAuth scope
3. Normalize booking and pet models
4. Add a data access boundary
5. Then tackle QR, operations, and service expansion