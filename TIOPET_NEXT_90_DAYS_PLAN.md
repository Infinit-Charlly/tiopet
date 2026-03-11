# TIOPET_NEXT_90_DAYS_PLAN.md

TioPet — 90 Day Execution Plan

Author: Charlly Acuña  
Purpose: Convert the TioPet vision and architecture into a realistic development plan.

> Nota: “90 días” es una referencia de ritmo. Los bloques pueden comprimirse o expandirse según tu disponibilidad.

---

# 1. Execution Philosophy

Principios:

- Construir en capas
- Cada bloque debe quedar **estable**
- No añadir complejidad prematura
- Medir progreso por **milestones**, no por horas

Orden de construcción:

Reservas → Timeline → QR → Tienda → Notificaciones → Admin

---

# 2. Block 1 — Booking System Stabilization

Objetivo: que el **sistema de reservas sea sólido**.

Duración estimada: 1–2 semanas

## Tasks

- revisar `bookingsStore`
- validar confirmación de reservas
- validar cancelación de reservas
- validar estados (`pending`, `confirmed`, `cancelled`)
- revisar cálculo de precios
- validar addons
- revisar edge cases

## Success Criteria

- reservas siempre visibles en historial
- estado de reserva consistente
- cálculo de precios estable

---

# 3. Block 2 — Care Timeline

Objetivo: generar confianza mostrando actividades de la mascota.

Duración estimada: 1–2 semanas

## Tasks

- modelo `care_events`
- UI timeline en historial
- registrar eventos:
  - feeding
  - snack
  - playtime
  - walk
  - nap
  - grooming
  - photo_update

## Success Criteria

- timeline visible para el dueño
- eventos ordenados cronológicamente
- fotos integradas en timeline

---

# 4. Block 3 — QR Check-in System

Objetivo: seguridad en entrega y retiro de mascotas.

Duración estimada: 1–2 semanas

## Tasks

- generar QR por reserva
- pantalla QR
- validación QR
- flujo check-in
- flujo check-out

## Success Criteria

- cada reserva tiene QR
- QR valida la reserva correcta
- check-in / check-out auditables

---

# 5. Block 4 — Store Integration

Objetivo: agregar **canal de monetización**.

Duración estimada: 1–2 semanas

## Tasks

- catálogo simple
- productos:
  - comida
  - snacks
  - juguetes
  - higiene

- añadir productos a reserva
- mostrar compra en historial

## Success Criteria

- productos visibles
- compra vinculada a reserva
- tienda funcional básica

---

# 6. Block 5 — Notifications

Objetivo: mantener al dueño informado.

Duración estimada: 1–2 semanas

## Tasks

- notificación reserva confirmada
- notificación check-in
- notificación foto subida
- notificación check-out

Tecnología sugerida:

- Firebase Push Notifications

## Success Criteria

- usuario recibe eventos importantes
- notificaciones claras

---

# 7. Block 6 — Admin Panel

Objetivo: crear centro de control operativo.

Duración estimada: 2–3 semanas

## Tasks

- ver reservas
- ver mascotas
- ver dueños
- ver timeline
- ver cuidadores
- ver productos tienda

## Success Criteria

- operaciones visibles
- control administrativo

---

# 8. Optional Block — Caregiver App

Puede desarrollarse paralelamente.

Funciones:

- ver mascotas asignadas
- registrar eventos
- subir fotos
- check-in
- check-out

---

# 9. Progress Tracking

El progreso se mide por **milestones completados**.

Milestone | Estado
---------|-------
Reservas estables | ⬜
Timeline | ⬜
QR | ⬜
Tienda | ⬜
Notificaciones | ⬜
Admin Panel | ⬜

---

# 10. Weekly Rhythm

Recomendación de ritmo personal:

- 1 hora diaria
- 2–3 horas fines de semana
- revisar progreso cada domingo

---

# 11. Guiding Rule

Si algo no ayuda directamente a:

- reservar
- cuidar
- informar al dueño

entonces **probablemente no pertenece al MVP**.

---

# End of Document