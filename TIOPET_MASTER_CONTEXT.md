
# TioPet — Master Context & Handoff Document

Version: 1.0
Owner: Charlly Acuña
Purpose: Full context handoff for AI-assisted development (Claude Code / other agents)

---

## Vision

TioPet is not just a pet sitter marketplace.

TioPet is designed as a **pet services brand and franchise platform** that can operate:

1. Official TioPet locations (daycare / hostal / services)
2. A complementary network of external caregivers

The core of the business is **the TioPet brand experience**.

External caregivers are an **expansion layer**, not the main product.

---

## Core Product Concept

TioPet combines three layers:

### 1 — TioPet Official Services

Operated by the brand.

Examples:

• Daycare  
• Hostal / Hotel for pets  
• Grooming  
• Transport  
• Training  
• Store products

These are operated from **TioPet locations or partners**.

---

### 2 — Caregiver Network

Independent caregivers can join the ecosystem.

This provides:

• geographic expansion
• additional capacity
• special services

But always under **TioPet brand supervision**.

---

### 3 — Digital Platform

The mobile app enables:

• pet registration
• booking services
• notifications
• payments
• QR check-in/out
• messaging

---

## Key Features Planned

### User Features

Register pets  
Browse services  
Book daycare or hostal  
Choose city/location  
Receive QR check-in  
Track history  
Notifications  

---

### Caregiver Features

Create profile  
Define services  
Manage availability  
Receive bookings  

---

### Admin Features

Manage cities  
Manage locations  
Approve caregivers  
View reservations  
View payments  

---

## Important Innovation Ideas

### QR System

Every reservation generates a **QR code**.

Uses:

• pet drop-off validation
• pet pickup validation
• location check-in
• fraud prevention

---

### WhatsApp + AI Integration

Future idea:

Users can:

• request bookings via WhatsApp
• receive reservation reminders
• receive QR code
• chat with AI assistant

---

## Current Tech Stack

Frontend

React Native  
Expo  
Expo Router  
TypeScript  

State

Zustand

Backend

Firebase (planned)

Auth

Firebase Auth (partial)

---

## Current Development Status

The project already includes:

• working UI foundation
• tabs navigation
• booking history
• pet management (store)
• booking management (store)
• reusable UI components
• Firebase connection attempt

---

## Current Blocker

Google Login OAuth configuration in Expo.

Errors encountered:

Error 400  
redirect_uri mismatch  
invalid_request  

Decision: may temporarily skip Google login and continue MVP.

---

## MVP Development Roadmap

Phase 1

Authentication stable  
Pet profiles  
Service catalog  
Reservation flow  

Phase 2

Admin dashboard  
QR system  
Notifications  

Phase 3

Payments  
Caregiver marketplace  
Ratings  

Phase 4

AI features  
WhatsApp integration  
Store & ecosystem

---

## Strategic Model

TioPet grows like:

City → Location → Services → Platform

Example:

Quito
• TioPet Daycare Center
• Hostal

Latacunga
• Partner caregiver network

Guayaquil
• Future franchise location

---

## Long Term Vision

TioPet becomes a **pet services ecosystem** including:

Daycare
Hostal
Training
Products
Transportation
Vet partnerships

---

## Instructions for AI Developers

The AI agent should:

1. analyze the repository
2. stabilize authentication
3. implement persistence layer
4. refine service models
5. implement QR booking system
6. prepare admin architecture

The objective is to reach a **real MVP capable of operating the business**.
