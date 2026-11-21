# MASTER CONTEXT & ARCHITECTURAL LOG — RESQ BANGLADESH
**Smart Disaster & Emergency Response Management System**  
*Tagline:* Connecting People, Saving Lives During Emergencies.  
*Institution:* BGC Trust University Bangladesh | Department of Computer Science & Engineering  
*Course:* Software Development Project - 1 | *Supervisor:* Ferdous Ara  

---

## 1. Team Identity (5 Verified Members)
1. Gazi Sayem Uddin Samir
2. Antunia Das
3. Ovin Paul
4. Montashir Nabil
5. Sadman Samir

---

## 2. Implemented Full-Stack Architecture

### Backend (`server.ts` & `server/store.ts`)
- **Runtime:** Express server on port `3000` (`0.0.0.0`) with Vite dev middleware (`"dev": "tsx server.ts"`) and static `dist/` production serving (`"start": "node server.ts"`).
- **Atomic Persistence (`server/store.ts`):** Serialized async transaction queue (`withTransaction`) writing atomically to `data/resq_db.json` (gitignored).
- **Security & Privacy Controls:**
  - Sliding-window rate limiting on `POST /api/emergencies` and `POST /api/uploads`.
  - Role-based phone number masking (`sanitizeIncidentForRole`) so citizen/public feeds do not expose victim phone numbers.
  - Secure guest tracking (`GET /api/emergencies/track`) requiring both Emergency ID and 6-character `trackingCode`.
  - Upload validation (MIME allowlist for JPEG/PNG/WEBP/MP4/WEBM/OGG/MP3 + 4 MB limit) and `path.resolve` confinement inside `uploads/`.
  - Server-side Nominatim reverse-geocoding & place-search proxy with 15-minute TTL cache, 1 req/s rate throttle, and local `BANGLADESH_DISTRICTS` fallback.
- **Honest Notification Logs:** Records real `delivered` status for `in_app` and `dashboard_alert` notifications, and explicitly reports `not_configured` when external `RESQ_SMS_GATEWAY_URL` or `RESQ_SMTP_URL` env vars are absent.

### Frontend (`src/`)
- **Clean 5-Tab Navigation:** `Home`, `Live Map`, `Operations`, `Track SOS`, `Meet The Team` (preserving Turn 1's uncluttered navigation bar).
- **Automatic GPS + 3-Method Location System (`src/hooks/useEmergencyLocation.ts`, `src/utils/geolocation.ts`, `src/components/map/LeafletLocationPicker.tsx`):**
  - Method A: Automatic browser `navigator.geolocation.getCurrentPosition()` with accuracy meters, timestamp, and reverse-geocoded address.
  - Method B: Manual Leaflet + OpenStreetMap pin selection.
  - Method C: Nearby Bangladesh landmark, road, district, and upazila input.
  - Never fabricates coordinates; never blocks SOS submission when GPS fails.
- **One-Tap Guest SOS (`src/components/sos/SosModal.tsx`):**
  - Submits immediately with zero required form fields and no login.
  - Returns Emergency ID + Tracking Code right away, then lets users optionally enrich with Voice Recording (`MediaRecorder`), Photo/Video upload, injured/trapped flags, victim count, and live GPS sharing (`watchPosition`).
- **Live GIS Map (`src/components/map/BangladeshGisMap.tsx`):**
  - OpenStreetMap + Leaflet primary engine with Bangladesh search, category/status/district filters, GPS accuracy circles, assigned rescue team routes (`L.polyline`), nearest shelter/hospital/responder calculation, and clear `Demo` labeling on seeded records.
- **Smart Rescue Dispatch (`src/components/operations/RescueOperations.tsx`, `src/utils/dispatch.ts`):**
  - Ranks responders by availability, Haversine distance, category skills, equipment keywords, and base district.
  - Enforces human operator verification and role-gated state machine (`PENDING -> VERIFIED -> ASSIGNED -> ACCEPTED -> IN_PROGRESS -> RESOLVED` + `REJECTED`/`CANCELLED`).

---

## 3. Automated Test Suites
- `src/utils/geo.test.ts`
- `src/utils/aiEngine.test.ts`
- `src/utils/team.test.ts`
- `src/utils/geolocation.test.ts`
- `src/utils/dispatch.test.ts`
- `src/utils/security.test.ts`
- `server/store.test.ts`
