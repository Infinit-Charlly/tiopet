
# TIOPET_SYSTEM_ARCHITECTURE.md

TioPet — System Architecture & Technical Roadmap

Author: Charlly Acuña
Purpose: Technical blueprint for AI-assisted development (Claude Code / Codex / other agents)

---

# 1. System Vision

TioPet is a pet services ecosystem platform designed to provide safe, transparent, and high-quality care for pets.

The platform begins as a centralized pet care center system and evolves into a multi-service ecosystem for pet owners.

The platform will support:

- Official TioPet daycare / hostal centers
- Professional caregivers
- Service bookings
- Pet care activity tracking
- Pet store purchases
- Notifications and updates
- Secure pickup verification
- Future AI-assisted monitoring

The system must support multi-city operations, franchise expansion, and service marketplaces.

---

# 2. Architectural Philosophy

TioPet follows a layered architecture designed for gradual scaling.

Layers:

1. Presentation Layer
2. Domain Layer
3. State Layer
4. Infrastructure Layer
5. Intelligence Layer

---

# 3. High Level Architecture

## Client Layer
Mobile App (React Native + Expo)

## Backend Layer (future)
- API Gateway
- Authentication Service
- Booking Service
- Pet Service
- Care Service
- Store Service
- Notification Service

## Data Layer
- Primary Database
- File Storage
- Cache Layer

## External Integrations
- Payment Providers
- WhatsApp API
- Push Notifications

---

# 4. Current Frontend Architecture

Technologies:

- React Native
- Expo Router
- TypeScript
- Zustand
- AsyncStorage

Repository structure:

app/
  (tabs)/
    login.tsx
    confirm.tsx
    history.tsx
    profile.tsx

src/
  domain/
    bookings/
  store/
  lib/
  auth/

---

# 5. Domain Layer

Domain logic lives in:

src/domain/

Example:

src/domain/bookings/

Modules:

- pricing
- plans
- booking options
- labels
- types
- date calculations

---

# 6. State Layer

State uses Zustand.

Example:

src/store/bookingsStore.ts

Responsibilities:

- manage booking state
- synchronize with persistence
- expose actions to UI
- handle hydration

Persistence uses AsyncStorage.

---

# 7. Core Entities

Users

id
name
email
phone
role
created_at

Pets

id
owner_id
name
species
breed
age
weight
notes
photo_url

Locations

id
city
name
type
capacity

Bookings

id
user_id
pet_id
service_id
start_date
end_date
status
qr_code

Store Products

id
name
category
price
stock
description

Care Events

id
booking_id
caregiver_id
event_type
notes
photo_url
created_at

---

# 8. Booking Flow

1. User selects pet
2. User selects location
3. User selects service
4. User selects addons
5. Reservation confirmed
6. QR generated
7. Check-in
8. Care events
9. Check-out

---

# 9. Pet Care Timeline

Events may include:

- check-in
- feeding
- snack
- playtime
- nap
- walk
- grooming
- photo update
- check-out

Owners can review the full experience.

---

# 10. Caregiver System

Caregivers can:

- view assigned pets
- log activities
- upload photos
- record walks
- report incidents
- perform check-in / check-out

---

# 11. QR Pickup Verification

Each booking generates a secure QR code.

Flow:

1. Owner receives QR
2. Staff scans QR
3. System validates booking
4. Pet released

---

# 12. Integrated Pet Store

Products may include:

- food
- snacks
- bones
- toys
- hygiene products

Delivery options:

- check-in
- during stay
- check-out

---

# 13. Notification System

Events trigger notifications:

- booking confirmed
- pet checked-in
- photo uploaded
- pet ready for pickup

Channels:

- push
- email
- WhatsApp (future)

---

# 14. Payment Architecture

Future integrations:

- Stripe
- MercadoPago
- Ecuador local payment providers

Payments must support SRI-compatible processes.

---

# 15. AI Layer (Future)

Possible features:

- bark detection
- noise anomaly detection
- fight detection
- automated summaries

AI requires operational data first.

---

# 16. Marketplace Expansion (Future)

External caregivers may:

- register homes
- set availability
- define pricing
- accept bookings

Requires identity verification and ratings.

---

# 17. Development Strategy

Human role:
- define vision
- guide architecture

AI role:
- assist coding
- refactor
- analyze

Agents extend the system following this architecture.

---

# End of Document
