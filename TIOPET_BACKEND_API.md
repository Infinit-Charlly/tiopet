
# TIOPET_BACKEND_API.md

TioPet — Backend API Specification (Initial Version)

Author: Charlly Acuña
Purpose: Define the initial backend API surface for TioPet so the platform can evolve from local-first MVP into a scalable service architecture.

---

# 1. API Philosophy

The backend API should be:

- simple
- modular
- role-aware
- secure
- scalable

It should begin with a REST-first approach and later allow event-driven expansion for notifications, timeline events, AI, and operational workflows.

---

# 2. Base Conventions

## Base URL

/api/v1

## Response Format

Successful response example:

```json
{
  "success": true,
  "data": {}
}
```

Error response example:

```json
{
  "success": false,
  "error": {
    "code": "BOOKING_NOT_FOUND",
    "message": "Booking was not found"
  }
}
```

## Authentication

Preferred future approach:

- Firebase Auth token validation initially
- Later optional dedicated auth/session service

## Roles

Supported roles:

- owner
- caregiver
- admin

---

# 3. Users API

## GET /users/me

Returns the authenticated user profile.

## PATCH /users/me

Updates the authenticated user profile.

Request fields may include:

- name
- phone
- photo_url

---

# 4. Pets API

## GET /pets

Returns pets belonging to the authenticated owner.

## POST /pets

Creates a pet profile.

Request body:

- name
- species
- breed
- age
- weight
- notes
- photo_url

## GET /pets/:id

Returns a specific pet.

## PATCH /pets/:id

Updates a pet profile.

## DELETE /pets/:id

Soft delete or archive a pet.

---

# 5. Service Plans API

## GET /service-plans

Returns active TioPet service plans.

Response may include:

- id
- name
- description
- duration_hours
- price
- active

---

# 6. Add-ons API

## GET /addons

Returns active add-ons.

Optional filters:

- service_plan_id
- active

---

# 7. Locations API

## GET /locations

Returns official TioPet locations.

Optional filters:

- city
- active

## GET /locations/:id

Returns location details.

---

# 8. Bookings API

## GET /bookings

Returns bookings for the authenticated user.

Optional filters:

- status
- pet_id
- date_from
- date_to

## POST /bookings

Creates a booking.

Request body:

- pet_id
- location_id
- service_plan_id
- start_date
- end_date
- transport_type
- addons[]
- notes

Response should include:

- booking id
- status
- pricing breakdown
- qr token reference if applicable

## GET /bookings/:id

Returns booking details.

## PATCH /bookings/:id

Updates mutable booking fields before operational lock.

## POST /bookings/:id/confirm

Confirms a booking.

## POST /bookings/:id/cancel

Cancels a booking.

## POST /bookings/:id/check-in

Registers pet arrival.

## POST /bookings/:id/check-out

Registers pet departure.

---

# 9. Booking Timeline / Care Events API

## GET /bookings/:id/timeline

Returns care events for a booking.

## POST /bookings/:id/timeline

Creates a care event.

Request body:

- event_type
- notes
- photo_url
- metadata

Example event_type values:

- feeding
- snack
- playtime
- walk
- nap
- grooming
- brushing
- massage
- medication
- incident
- photo_update
- check_in
- check_out

---

# 10. QR API

## GET /bookings/:id/qr

Returns booking QR details.

## POST /qr/validate

Validates pickup or check-in QR token.

Request body:

- qr_code
- action_type

Possible action_type values:

- pickup
- dropoff
- checkin
- checkout

---

# 11. Store API

## GET /store/products

Returns active products.

Optional filters:

- category
- active
- location_id

## GET /store/products/:id

Returns product detail.

## POST /orders

Creates a store order.

Request body:

- booking_id (optional)
- items[]

Each item includes:

- product_id
- quantity

## GET /orders

Returns orders for the authenticated user.

## GET /orders/:id

Returns a specific order.

---

# 12. Payments API

## POST /payments

Creates a payment record or payment intent.

Request body:

- booking_id (optional)
- order_id (optional)
- amount
- payment_method

## GET /payments/:id

Returns payment status.

## POST /payments/:id/confirm

Confirms payment result after provider callback or reconciliation.

---

# 13. Notifications API

## GET /notifications

Returns notifications for the authenticated user.

## POST /notifications/test

Internal/admin endpoint for notification testing.

## PATCH /notifications/:id/read

Marks one notification as read.

## PATCH /notifications/read-all

Marks all notifications as read.

---

# 14. Caregiver API

## GET /caregiver/assignments

Returns bookings/pets assigned to the caregiver.

## GET /caregiver/bookings/:id

Returns caregiver view of a booking.

## POST /caregiver/bookings/:id/timeline

Creates a caregiver timeline event.

## POST /caregiver/bookings/:id/photo

Uploads or references a care photo update.

---

# 15. Admin API

## GET /admin/bookings

Returns bookings across the system.

## GET /admin/users

Returns users.

## GET /admin/caregivers

Returns caregivers.

## GET /admin/products

Returns store products.

## POST /admin/service-plans

Creates a plan.

## PATCH /admin/service-plans/:id

Updates a plan.

## POST /admin/addons

Creates an add-on.

## PATCH /admin/addons/:id

Updates an add-on.

## POST /admin/products

Creates a store product.

## PATCH /admin/products/:id

Updates a store product.

---

# 16. Security Notes

The backend should support:

- auth token validation
- role-based authorization
- resource ownership checks
- audit logging for sensitive actions
- QR validation with expiry or one-time usage where appropriate

---

# 17. Future API Expansion

Later versions may include:

- WhatsApp event triggers
- AI event ingestion
- bark/noise alerts
- franchise multi-location analytics
- external caregiver marketplace endpoints

---

# End of Document
