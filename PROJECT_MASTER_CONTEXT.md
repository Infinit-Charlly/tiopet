# PROJECT_MASTER_CONTEXT.md

TioPet — Master Context File

Author: Charlly Acuña  
Purpose: Provide a complete high-level context of the TioPet platform so that AI assistants and developers can quickly understand the system architecture, goals, and development approach.

---

# 1. Project Overview

TioPet is a **pet care ecosystem platform** designed to connect pet owners with trusted caregivers and official TioPet locations.

The platform allows users to:

• register pets  
• create bookings for daycare or hostal services  
• track pet activities  
• receive updates from caregivers  
• purchase pet products  
• securely check-in and check-out pets using QR codes

The long-term vision is to build the **most trusted pet care network in Latin America.**

---

# 2. Core Concept

TioPet combines:

1. A mobile application for pet owners
2. A caregiver management platform
3. A digital operations system for pet care locations
4. A pet services marketplace
5. A pet product store
6. AI-assisted monitoring and safety systems

---

# 3. System Components

The ecosystem is composed of multiple systems.

### Mobile App

Primary interface used by pet owners.

Functions include:

• pet profile management  
• booking creation  
• booking tracking  
• viewing activity timeline  
• store purchases  
• receiving notifications

---

### Caregiver App

Application used by caregivers.

Functions include:

• view assigned pets  
• log care events  
• upload photos  
• perform check-in and check-out  
• manage availability

---

### Admin Panel

Operational dashboard used by administrators.

Functions include:

• manage bookings  
• manage users  
• manage caregivers  
• manage locations  
• view metrics and analytics

---

### Backend API

Handles all system logic.

Responsibilities include:

• authentication
• booking processing
• notifications
• store transactions
• QR validation

---

### AI Monitoring Systems

Future modules designed to improve safety and monitoring.

Possible capabilities:

• barking detection  
• abnormal noise detection  
• fight detection  
• stress analysis

---

# 4. Technology Stack

Current stack:

Frontend

• React Native
• Expo
• TypeScript

State Management

• Zustand

Backend (planned)

• Node.js
• Express or NestJS

Database (planned)

• PostgreSQL
• or Firebase Firestore

Notifications

• Firebase Cloud Messaging

AI (future)

• TensorFlow
• OpenCV
• cloud AI APIs

---

# 5. Core Features

The platform includes several core features.

### Pet Profiles

Users can register pets including:

• name  
• species  
• breed  
• age  
• medical notes  
• photos

---

### Booking System

Users can reserve pet care services.

Features include:

• daycare reservations  
• hostal reservations  
• add-ons  
• transport options  
• pricing calculation

---

### Care Timeline

Caregivers log activities during the pet stay.

Examples:

• feeding  
• walking  
• playing  
• resting  
• grooming

Owners can view these updates.

---

### QR Security System

Each booking generates a secure QR code.

Uses include:

• pet drop-off verification  
• pet pickup verification  
• caregiver validation

---

### Pet Store

Users can purchase items such as:

• food  
• snacks  
• toys  
• hygiene products

Items may be delivered during the booking.

---

# 6. Business Model

TioPet generates revenue through:

• booking commissions  
• store sales  
• premium services  
• future franchise licensing

---

# 7. Expansion Model

The platform supports two types of service providers.

### Official TioPet Locations

Physical facilities operating under the brand.

### Partner Caregivers

Independent caregivers operating through the platform.

---

# 8. Security Model

The platform includes security mechanisms such as:

• QR validation
• role-based access control
• activity logging
• secure authentication

Pet delivery safety is a top priority.

---

# 9. AI Vision

Artificial Intelligence will enhance the platform through:

• sound anomaly detection  
• behavior monitoring  
• activity analysis  
• smart alerts

AI will assist caregivers rather than replace them.

---

# 10. Development Methodology

TioPet is developed using **AI-assisted engineering**.

Human role:

• product vision  
• architecture design  
• quality control

AI role:

• code generation  
• architecture suggestions  
• debugging assistance  
• documentation support

---

# 11. Repository Structure Philosophy

The repository should contain clear documentation for all major systems.

Key documents include:

SYSTEM_ARCHITECTURE  
DATABASE_SCHEMA  
BACKEND_API  
ADMIN_PANEL_ARCHITECTURE  
CARE_GIVER_APP_ARCHITECTURE  
AI_SYSTEM  
PRODUCT_METRICS  
DEV_PLAYBOOK

These documents allow AI tools to understand the system context.

---

# 12. Long-Term Vision

TioPet aims to become:

• a trusted pet care network
• a digital pet services marketplace
• a technology platform for pet care operations

The goal is to expand across cities and eventually across countries.

---

# End of Document