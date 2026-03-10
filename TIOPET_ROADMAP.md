
# TIOPET_ROADMAP.md

TioPet — Product, Operations, and Technical Roadmap

Author: Charlly Acuña  
Purpose: Define the staged evolution of TioPet from MVP to scalable ecosystem

---

# 1. Roadmap Philosophy

TioPet must evolve through **small, stable, high-value phases**.

The roadmap follows this principle:

1. Validate the core service
2. Strengthen operations
3. Improve transparency and trust
4. Add monetization layers
5. Expand intelligently
6. Introduce AI only when supported by real data

The roadmap prioritizes:

- product stability
- operational usefulness
- maintainable architecture
- scalable business growth

---

# 2. Phase 1 — Core MVP

## Objective

Deliver a usable product for the core TioPet service center.

## Functional Scope

### Authentication
- anonymous login
- future user account support
- optional Google login

### Pet Profiles
- create pet
- edit pet
- pet details
- pet photo

### Booking
- select pet
- select plan
- select date
- select transport
- select add-ons
- confirm reservation

### Booking History
- list bookings
- view status
- booking lifecycle visibility

### Initial Plans
- daycare
- hostal / boarding
- premium plan

### Initial Add-ons
- vet check
- snack
- grooming-related services
- configurable add-ons later

## Success Criteria

- user can register a pet
- user can create a booking
- booking is visible in history
- pricing remains consistent
- basic reservation experience works end-to-end

---

# 3. Phase 2 — Operational Core

## Objective

Convert TioPet from a reservation app into an operational pet care system.

## Functional Scope

### Caregiver / Staff Tools
- caregiver profile
- assigned pets list
- check-in
- check-out
- update stay status

### Care Timeline
- feeding
- snack
- playtime
- socialization
- walk
- nap
- grooming
- brushing
- massage
- medication
- incident report
- photo update

### Reservation Operations
- confirm booking
- cancel booking
- internal status changes
- operational notes

### QR Safety
- QR generation for booking
- QR check-in
- QR pickup validation

## Success Criteria

- staff can update pet stay events
- owners can see care timeline
- QR supports safe pickup flow
- operations become auditable

---

# 4. Phase 3 — Client Trust Layer

## Objective

Strengthen customer trust through visibility and communication.

## Functional Scope

### Timeline Visibility
- owners see care events
- owners see uploaded photos
- owners see booking progress

### Notifications
- booking confirmed
- pet checked in
- photo uploaded
- care update posted
- pet ready for pickup

### Channels
- push notifications
- email
- WhatsApp integration (future-ready)

## Success Criteria

- customer receives meaningful updates
- timeline becomes a differentiator
- operational actions create visible trust signals

---

# 5. Phase 4 — Store and Monetization Layer

## Objective

Introduce store revenue and convenience through the partner pet store.

## Functional Scope

### Product Catalog
- food
- snacks
- bones
- treats
- toys
- hygiene products
- grooming accessories

### Store Flows
- add product during booking
- add product before check-in
- add product for check-out delivery

### Admin Controls
- manage products
- pricing
- stock visibility
- product availability by location

## Success Criteria

- clients can purchase relevant products easily
- store becomes an upsell channel
- operational fulfillment remains simple

---

# 6. Phase 5 — Payments and Formality

## Objective

Enable professional payment flows compatible with Ecuadorian operations.

## Functional Scope

### Payments
- booking payment
- deposit / partial payment
- full payment
- payment status

### Ecuador Considerations
- local providers if needed
- reconciliation support
- invoice / tax workflow compatibility
- future SRI-compliant processes

## Success Criteria

- reservation and payment state align
- finance flow is operationally clear
- path to formal invoicing is defined

---

# 7. Phase 6 — Admin Platform

## Objective

Provide a real control layer for the business.

## Functional Scope

### Admin Panel
- manage bookings
- manage plans
- manage add-ons
- manage caregivers
- manage products
- manage cities / locations
- manage notifications
- review operational events

### Analytics
- bookings per day
- occupancy
- top services
- add-on usage
- store sales
- caregiver workload

## Success Criteria

- admin can operate the business without depending on app workarounds
- data becomes useful for decisions
- system supports scaling to multiple locations

---

# 8. Phase 7 — Scalable Multi-Location Model

## Objective

Prepare TioPet for franchise or multi-location growth.

## Functional Scope

### Multi-City
- multiple cities
- multiple official locations
- location-specific service rules
- capacity control

### Multi-Location Operations
- bookings assigned to location
- store inventory by location
- caregiver assignment by location
- reports by location

## Success Criteria

- system handles more than one center cleanly
- operations remain structured as the network grows

---

# 9. Phase 8 — Marketplace Expansion (Optional Future)

## Objective

Explore a second business line with external caregivers.

## Functional Scope

### External Caregiver Marketplace
- caregiver onboarding
- home-based availability
- pricing setup
- booking acceptance
- ratings and reputation
- identity verification

## Important Note

This is **not part of the core MVP**.

It will only be considered once:

- core center operations are stable
- safety processes are mature
- payment flows are defined
- trust mechanisms are ready

## Success Criteria

- external care can be offered safely
- platform can distinguish official center vs external host

---

# 10. Phase 9 — Intelligence Layer

## Objective

Introduce AI only when the platform has enough operational data.

## Possible AI Features

### Audio / Behavior Monitoring
- bark detection
- excessive noise alerts
- possible fight detection
- behavior anomaly detection

### Operational Intelligence
- automated daily summary
- care event summarization
- anomaly highlighting for staff

### Client Experience
- smart recommendations
- automated care recap
- contextual alerts

## Success Criteria

- AI solves real operational problems
- AI is supported by real data, not assumptions
- alerts reduce risk or improve care quality

---

# 11. Immediate Next Priorities

## Product / Technical Priorities

1. stabilize booking history actions
2. complete current booking flow edge cases
3. align confirm/history/store with shared booking domain modules
4. add `.env.example`
5. clean TypeScript validation issues
6. define caregiver event model
7. define admin MVP scope
8. define store MVP scope

---

# 12. Strategic Product Decisions

## Core Positioning

TioPet should begin as:

**a trusted official pet care center platform**

Not as a marketplace-first product.

## Why

Because the official center model gives:

- higher trust
- better control
- cleaner operations
- easier service quality management
- simpler MVP delivery

Marketplace expansion remains optional and later.

---

# 13. Guiding Principle

TioPet is being built:

- for operational excellence
- for client trust
- for animal well-being
- for sustainable business growth

Every phase should make the platform safer, clearer, and more valuable for pets and their humans.

---

# End of Document
