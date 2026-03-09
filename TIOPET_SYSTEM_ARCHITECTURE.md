
# TIOPET_SYSTEM_ARCHITECTURE.md
TioPet — System Architecture & Technical Roadmap

Author: Charlly Acuña
Purpose: Technical blueprint for AI-assisted development (Claude Code or other agents)

---

# 1. System Overview

TioPet is designed as a **pet services ecosystem platform** combining:

1. Official TioPet locations (daycare / hostal / services)
2. External caregiver network
3. Digital booking and operations platform

The system must support **multi-city operations, franchise scaling, and service marketplaces.**

---

# 2. High Level Architecture

Client Layer

Mobile App (React Native / Expo)

Backend Layer

API Layer
Authentication Service
Booking Service
Pet Service
Location Service
Notification Service

Data Layer

Primary Database
File Storage
Cache Layer

External Integrations

Payments
WhatsApp API
Push notifications

---

# 3. Proposed Tech Stack

Frontend

React Native
Expo Router
TypeScript
Zustand (state)

Backend (recommended)

Node.js
Express or NestJS
REST API

Database

PostgreSQL (preferred)
or Firestore

Storage

Cloud storage for pet photos

Notifications

Firebase Cloud Messaging

---

# 4. Core Entities (Database Model)

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
notes
photo_url

Locations

id
city
name
type (TioPet location / partner caregiver)
capacity

Services

id
location_id
service_type (daycare / hostal / walk)
duration
price

Addons

id
service_id
name
price

Bookings

id
user_id
pet_id
service_id
start_date
end_date
status
qr_code

Reviews

id
booking_id
rating
comment

---

# 5. Booking Flow

Step 1
User selects pet

Step 2
User selects location or caregiver

Step 3
User selects service

Step 4
User selects addons

Step 5
Reservation confirmation

Step 6
QR code generated

Step 7
Check-in / Check-out

---

# 6. QR System

Each reservation generates a secure QR.

Uses:

Pet drop-off verification
Pet pickup verification
Staff validation

---

# 7. Location Model

Cities contain multiple locations.

Location types:

TioPet Official
Partner Caregiver

---

# 8. Admin System

Admin dashboard should allow:

Manage users
Manage pets
Manage locations
Manage services
View bookings
View analytics

---

# 9. Caregiver Dashboard

Caregivers can:

Set availability
Manage bookings
View earnings

---

# 10. Payment Architecture

Future integration with:

Stripe
MercadoPago

Payments should support:

Full payment
Deposit
Split payments

---

# 11. Notification System

Push notifications

Reservation confirmed
Pet checked-in
Pet ready for pickup

Future integration:

WhatsApp notifications

---

# 12. AI Integration (Future)

AI assistant may allow:

Booking through chat
Customer support
Smart reminders
Service recommendations

---

# 13. Security Considerations

User authentication
QR validation
Location verification
Data privacy

---

# 14. Development Phases

Phase 1 — MVP

Authentication
Pet profiles
Service catalog
Booking flow

Phase 2 — Operations

QR system
Admin panel
Notifications

Phase 3 — Marketplace

Caregiver network
Ratings
Payments

Phase 4 — Ecosystem

AI services
Store
Transport
Franchise scaling

---

# 15. Development Strategy

AI-assisted development

Human provides vision
AI executes architecture and coding

Claude Code should analyze the repository and extend it using this architecture as baseline.

---

# End of Document
