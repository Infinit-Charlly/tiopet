
# TIOPET_ADMIN_PANEL_ARCHITECTURE.md

TioPet — Admin Panel Architecture

Author: Charlly Acuña
Purpose: Define the operational control center for the TioPet platform.

---

# 1. Purpose of the Admin Panel

The Admin Panel is the **operational brain** of the TioPet ecosystem.

It allows administrators and staff to:

- manage reservations
- manage pets and owners
- manage caregivers
- manage store inventory
- monitor operations
- analyze business performance

The Admin Panel ensures that TioPet can operate efficiently as the platform scales.

---

# 2. Admin Roles

The system should support different admin roles:

Admin Role | Permissions
-----------|-------------
Super Admin | Full system control
Operations Manager | Manage bookings, caregivers, events
Care Staff | View assignments and update care events
Store Manager | Manage products and orders

---

# 3. Core Modules

The Admin Panel should contain the following modules.

---

# 4. Bookings Module

Allows staff to manage reservations.

Features:

- View all bookings
- Filter by date
- Filter by status
- Filter by location
- Assign caregiver
- Confirm booking
- Cancel booking
- View timeline of pet stay

Key Data:

- pet
- owner
- plan
- addons
- booking status
- timeline events

---

# 5. Pets Module

Manage pet profiles.

Features:

- View pet profiles
- View owner details
- View pet history
- View behavioral notes
- Upload pet photos

---

# 6. Care Timeline Module

Shows care events for pets currently in the center.

Example events:

- feeding
- snack
- walk
- playtime
- nap
- grooming
- bath
- brushing
- medication
- incident report
- photo update

Staff can log events which become visible to the pet owner.

---

# 7. QR Operations Module

Handles check-in and check-out verification.

Functions:

- scan QR code
- validate booking
- confirm drop-off
- confirm pickup
- detect invalid or expired QR

This prevents unauthorized pet pickup.

---

# 8. Caregiver Management

Manage staff responsible for pet care.

Features:

- caregiver profiles
- caregiver schedules
- assigned pets
- workload visibility
- caregiver performance metrics

---

# 9. Store Management

Manages the integrated pet store.

Features:

- product catalog
- pricing
- stock levels
- product availability
- store orders

Products include:

- food
- snacks
- toys
- hygiene products

Orders may be associated with bookings.

---

# 10. Orders Module

Handles store purchases.

Features:

- view orders
- link orders to bookings
- track delivery stage
- manage order fulfillment

---

# 11. Notifications Center

Manage platform notifications.

Examples:

- booking confirmed
- pet checked in
- photo uploaded
- pet ready for pickup

Admin can trigger manual notifications if needed.

---

# 12. Analytics Dashboard

Displays operational metrics.

Key metrics:

Metric | Meaning
-------|--------
Bookings per day | demand
Center occupancy | capacity usage
Add-on usage | upsell performance
Store revenue | retail performance
Returning customers | loyalty indicator

Charts should show trends by day/week/month.

---

# 13. Multi‑Location Support

When TioPet grows to multiple centers the admin panel must support:

- multiple cities
- multiple locations
- location-specific staff
- location-specific services
- location-specific reports

---

# 14. Security Considerations

The admin system must include:

- role-based access control
- audit logging
- secure authentication
- activity logs

All operational changes should be traceable.

---

# 15. Future Expansion

Future admin capabilities may include:

- franchise management
- AI monitoring dashboards
- camera monitoring integration
- automated incident alerts
- predictive occupancy analytics

---

# End of Document
