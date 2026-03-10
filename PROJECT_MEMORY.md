# PROJECT_MEMORY.md

## Project Overview

TioPet is an Expo / React Native MVP application focused on pet care services such as daycare, boarding, and future caregiver services.

The project currently prioritizes a **local-first MVP approach** where core functionality works without requiring a full backend platform.

State is primarily managed with Zustand and AsyncStorage, while Firebase is currently used mainly for authentication.

The booking flow, pet registration, and booking history are the most developed areas of the application.

---

# Current Architecture Direction

The project follows an **incremental architecture strategy**:

1. Stabilize the working MVP
2. Extract domain logic from UI screens
3. Normalize local data models
4. Introduce clean persistence boundaries
5. Prepare for future backend/API integration

Large rewrites are intentionally avoided.

---

# Agent Development Model

The repository uses an **agent-assisted development workflow**.

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

# Known Blockers

## Google OAuth

Google authentication is currently unstable and should not block unrelated MVP work.

The current recommended approach is **anonymous-first authentication** until the rest of the MVP stabilizes.

---

# Confirmed Technical Decisions

- The app remains **Expo Router based**
- TypeScript strict mode should be preserved
- Zustand + AsyncStorage remain the primary local persistence layer
- Firebase usage should remain minimal until domain boundaries are cleaner
- Booking logic should not live directly inside large screen components

---

# Current MVP Capabilities

Working today:

- login screen
- anonymous authentication
- pet CRUD with local persistence
- booking creation flow
- booking confirmation
- booking history
- profile screen

Partially implemented:

- Google authentication
- transport screen
- shop screen

Not implemented yet:

- QR reservations
- payments
- notifications
- admin panel
- caregiver flows
- backend API

---

# Next Planned Task

The next architectural improvement is:

**Extract booking domain data and rules from `app/(tabs)/bookings.tsx` into reusable typed modules.**

Examples of items to extract:

- service plans
- cities
- care time options
- transport options
- pricing rules
- date helpers
- booking-related types

This change should **not modify user-facing behavior**.

---

# Development Philosophy

TioPet should evolve through **small, safe, incremental improvements**.

The priority is:

1. working product
2. maintainable code
3. clean domain boundaries
4. scalable architecture

Not speculative infrastructure.