
# TIOPET_DATABASE_SCHEMA.md
TioPet — Database Schema (Conceptual Model)

Author: Charlly Acuña
Purpose: Define the core database entities for the TioPet platform.

---

# 1. Users

id
name
email
phone
role
created_at

Roles:
- owner
- caregiver
- admin

---

# 2. Pets

id
owner_id
name
species
breed
age
weight
notes
photo_url
created_at

Relationships:
- owner_id -> Users.id

---

# 3. Locations

id
city
name
type
capacity
created_at

Types:
- tiopet_center
- partner_caregiver

---

# 4. Caregivers

id
user_id
location_id
bio
rating
active
created_at

Relationships:
- user_id -> Users.id
- location_id -> Locations.id

---

# 5. Services

id
location_id
service_type
duration_hours
price
active

Examples:
- daycare
- hostal
- walk

---

# 6. Addons

id
service_id
name
description
price
active

Examples:
- snack
- grooming
- brushing
- massage
- vet_check

---

# 7. Bookings

id
user_id
pet_id
service_id
location_id
start_date
end_date
status
qr_code
created_at

Status:
- pending
- confirmed
- cancelled
- completed

---

# 8. Care Events

id
booking_id
caregiver_id
event_type
notes
photo_url
created_at

Examples:
- feeding
- snack
- playtime
- walk
- nap
- grooming
- medication
- incident
- photo_update

---

# 9. Store Products

id
name
category
description
price
stock
active
created_at

Categories:
- food
- snack
- toys
- hygiene

---

# 10. Orders

id
user_id
booking_id
status
total_amount
created_at

Status:
- pending
- paid
- cancelled
- delivered

---

# 11. Order Items

id
order_id
product_id
quantity
unit_price

Relationships:
- order_id -> Orders.id
- product_id -> StoreProducts.id

---

# 12. Payments

id
order_id
payment_provider
payment_status
amount
transaction_reference
created_at

Providers:
- stripe
- mercadopago
- transfer

Status:
- pending
- paid
- failed

---

# 13. Notifications

id
user_id
type
title
message
read
created_at

Examples:
- booking_confirmed
- pet_checked_in
- photo_uploaded
- pet_ready

---

# End of Document
