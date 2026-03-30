## Current Reality

- This is currently a mobile-first Expo app.
- Core state is local-first with Zustand + AsyncStorage.
- Firebase is present mainly for authentication and future integration paths.
- Real working user flows already exist for:
  - bookings
  - pets
  - history
  - local-first QR check-in / check-out
  - caregiver care-event registration
  - care timeline editing and deletion
  - event timestamp editing with temporal validation
- `booking-care.tsx` is now a critical operational surface and should be treated as a protected working flow.

## What Is Already Real

The following are already implemented in MVP form and must not be described as missing:

- booking creation / confirm / cancel
- local-first care timeline
- history timeline preview / expansion
- QR local-first flow
- caregiver event create / edit / delete
- event time editing
- temporal validation for caregiver events
- refined event selector / composer UX