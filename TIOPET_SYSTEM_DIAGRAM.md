
# TIOPET_SYSTEM_DIAGRAM.md

This file contains a **Mermaid architecture diagram** for the TioPet platform.
It can be opened in:

- GitHub
- VSCode Mermaid preview
- Mermaid Live Editor
- Notion
- Obsidian

---

```mermaid
flowchart TB

subgraph CLIENT["Client Layer"]
A[Mobile App
React Native / Expo]
end

subgraph BACKEND["Backend Layer (Future)"]
B1[API Gateway]
B2[Auth Service]
B3[Booking Service]
B4[Pet Service]
B5[Care Service]
B6[Store Service]
B7[Notification Service]
end

subgraph DATA["Data Layer"]
C1[(PostgreSQL Database)]
C2[(File Storage
Pet Photos)]
C3[(Cache Layer)]
end

subgraph EXTERNAL["External Integrations"]
D1[Payments
Stripe / MercadoPago]
D2[WhatsApp API]
D3[Push Notifications
Firebase]
end

subgraph OPERATIONS["Pet Care Operations"]
E1[Caregiver App]
E2[Care Timeline]
E3[QR Check-in / Check-out]
end

subgraph STORE["Pet Store"]
F1[Food]
F2[Snacks]
F3[Toys]
F4[Hygiene Products]
end

subgraph AI["Future AI Systems"]
G1[Bark Detection]
G2[Noise Monitoring]
G3[Behavior Analysis]
end

A --> B1
B1 --> B2
B1 --> B3
B1 --> B4
B1 --> B5
B1 --> B6
B1 --> B7

B3 --> C1
B4 --> C1
B5 --> C1
B6 --> C1

B5 --> E2
E1 --> E2
E2 --> E3

B6 --> F1
B6 --> F2
B6 --> F3
B6 --> F4

B7 --> D2
B7 --> D3

B3 --> D1

C2 --> B5
C3 --> B3

G1 --> B5
G2 --> B5
G3 --> B5

```
