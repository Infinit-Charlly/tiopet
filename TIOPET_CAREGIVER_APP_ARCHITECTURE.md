
# TIOPET_CAREGIVER_APP_ARCHITECTURE.md

TioPet — Caregiver App Architecture

Author: Charlly Acuña  
Purpose: Define the caregiver-facing application and operational flow inside the TioPet ecosystem.

---

# 1. Purpose of the Caregiver App

The Caregiver App is the operational tool used by TioPet staff to care for pets during their stay.

It should allow caregivers to:

- view assigned pets
- perform check-in and check-out
- record care events
- upload photos
- report incidents
- track walks, feeding, and activities
- support QR-based pickup and drop-off validation

The caregiver experience must be fast, simple, and mobile-first.

---

# 2. Main Caregiver Goals

The caregiver app should optimize for:

1. speed of operation
2. clear accountability
3. accurate care tracking
4. transparency for pet owners
5. operational safety

---

# 3. Core Modules

The Caregiver App should include the following modules.

---

# 4. Assigned Pets Dashboard

Shows pets currently assigned to the caregiver.

Each card may include:

- pet name
- pet photo
- owner name
- booking type
- current status
- location / room / zone
- special notes
- next required action

This screen should support filtering by:

- today
- active stays
- upcoming pickup
- needs attention

---

# 5. Pet Detail View

Each assigned pet should have a detail view.

The detail screen should show:

- pet profile
- behavioral notes
- food restrictions
- medication notes
- service plan
- selected add-ons
- booking timeline
- emergency contact

This view is the central working screen for the caregiver.

---

# 6. Check-in / Check-out Module

The caregiver should be able to:

- register pet arrival
- confirm start of stay
- register pet departure
- support QR validation for pickup and drop-off

Check-in fields may include:

- arrival confirmed
- visible pet condition
- notes
- received items

Check-out fields may include:

- owner verified
- pet delivered
- outgoing notes
- delivered store items

---

# 7. Care Timeline Events

The caregiver app should support structured care events.

Event types may include:

- feeding
- snack
- water
- playtime
- socialization
- nap
- walk
- grooming
- bath
- brushing
- massage
- medication
- photo_update
- incident
- potty
- rest

Each event should support:

- timestamp
- optional notes
- optional photo
- event metadata

These events become visible to the owner as part of the pet timeline.

---

# 8. Walk Tracking

If the service plan includes walking, the caregiver app should allow:

- walk started
- walk completed
- optional duration
- optional notes
- optional photo

Future expansion may include:

- location-aware walk route
- route summary for the owner

This should start simple and only evolve if operationally useful.

---

# 9. Photo Updates

Caregivers should be able to upload care photos.

Photo update flow:

1. choose pet
2. take or attach photo
3. add optional note
4. publish update

Photo updates should appear in:

- owner timeline
- booking history context
- admin monitoring tools

---

# 10. Incident Reporting

The caregiver must be able to report incidents.

Incident types may include:

- aggressive behavior
- excessive barking
- stress
- feeding issue
- medication issue
- injury concern
- pickup issue

Each report should include:

- timestamp
- severity
- notes
- optional photo
- escalation flag

Incident reports should also be visible to admin.

---

# 11. Store Fulfillment Support

The caregiver app may support order handling related to store products.

Examples:

- received pet food
- delivered snack
- delivered hygiene item at checkout

This is especially useful when store purchases are linked to bookings.

---

# 12. Notifications for Caregivers

The caregiver app should support operational notifications such as:

- new assigned pet
- upcoming pickup
- medication reminder
- pending timeline action
- incident escalation

These should be practical and action-oriented.

---

# 13. Offline and Reliability Considerations

The caregiver app should be resilient.

Important considerations:

- mobile-friendly UI
- minimal steps per action
- clear loading states
- eventual sync if network is unstable
- no complex workflows for basic logging

Operational staff should not fight the app to do their work.

---

# 14. Security Considerations

The caregiver app must include:

- authenticated access
- role-based permissions
- booking ownership / assignment validation
- secure QR validation
- auditability of care events

All logged events should be attributable to a specific caregiver.

---

# 15. Relationship with Other Systems

The caregiver app interacts with:

- booking system
- pet profiles
- admin panel
- notifications system
- QR validation system
- future AI monitoring layer

It is one of the most important operational surfaces in the TioPet platform.

---

# 16. MVP Scope for Caregiver App

Recommended first version:

- assigned pets list
- pet detail view
- check-in
- check-out
- feeding event
- snack event
- playtime event
- nap event
- walk event
- photo update
- incident report

This is enough to generate trust and create a meaningful care timeline.

---

# 17. Future Expansion

Later capabilities may include:

- caregiver schedules
- performance metrics
- smart reminders
- route-aware walks
- AI-assisted incident suggestions
- voice input for care updates

These should only be added when they reduce operational friction.

---

# End of Document
