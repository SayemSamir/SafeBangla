# RESQ BANGLADESH — Smart Disaster & Emergency Response System
> **"Connecting People, Saving Lives During Emergencies."**

An intelligent, multi-agency disaster coordination MIS uniting citizens, registered volunteers, Fire Service & Civil Defence, hospitals, and district administrators across Bangladesh.

---

## Academic Project Information

- **Institution:** BGC Trust University Bangladesh
- **Department:** Department of Computer Science & Engineering (CSE)
- **Course:** Software Development Project -1
- **Course Supervisor:** Ferdous Ara
- **Team Identifier:** Team-01
- **GitHub Repository:** [https://github.com/SayemSamir/ResQ-Bangladesh](https://github.com/SayemSamir/SafeBangla)
- **Live Demo:** [SafeBangla Live](https://resq-bangladesh-smart-disaster-emergency-response.ai.studio/)
---

## Team Members (Five Minds. One Mission.)

1. **Gazi Sayem Uddin Samir** — Undergraduate Student, Dept. of CSE
2. **Antunia Das** — Undergraduate Student, Dept. of CSE
3. **Ovin Paul** — Undergraduate Student, Dept. of CSE
4. **Montashir Nabil** — Undergraduate Student, Dept. of CSE
5. **Sadman Samir** — Undergraduate Student, Dept. of CSE

*(Team member details, technical skills, and assigned responsibilities are manageable via the built-in Admin Team Management portal).*

---

## Core System Architecture & Features

### 1. Citizen Emergency Portal (SOS Triage)
- **One-Tap SOS Dispatch:** Captures GPS coordinates, Division / District / Upazila, trapped & injured flags, casualty counts, and damage photos.
- **Bilingual NLP Classifier:** Detects disaster category (Flood, Cyclone, Fire, Earthquake, Landslide, Road Accident) in both English and Bengali.
- **Automated Severity Scoring:** Scores incident urgency from 1 to 10 based on trapped victims and life hazards.

### 2. Geospatial Intelligence & Deduplication
- **Haversine Distance Clustering:** Automatically detects potential duplicate panic reports within `< 1.5 km` radius to prevent emergency dispatch overload.
- **Shelter & Hospital Finder:** Spherical distance sorting locates the nearest cyclone shelters and district hospitals with live ICU bed capacity.

### 3. Rescue Operations & Mission Dispatch
- **6-Stage Mission Lifecycle:** `PENDING` &rarr; `VERIFIED` &rarr; `ASSIGNED` &rarr; `ACCEPTED` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`.
- **Kanban Dispatch Board:** Real-time assignment to Bangladesh Fire Service, Red Crescent, Volunteer Brigades, and Medical Teams.

### 4. Relief & Resource Inventory
- District-level tracking of dry food packets, water purification tablets, life jackets, rescue boats, and emergency tents.

### 5. Academic Team & Project Profile Hub
- **Meet Our Team:** Responsive profile grid featuring all 5 members with neutral initial avatars, biographies, skills, and contribution breakdowns.
- **About the Project:** Problem statement, proposed solution, supervisor information, and architecture blueprint.
- **Project Journey:** 9-stage development timeline (Research, Requirements, UI/UX, Frontend, Backend, Database, AI/GIS, Testing, Deployment).
- **Engineering Docs:** Interactive viewer for PRD, SRS, System Architecture, Database ER Model, and Security Threat Model.
- **Admin Management:** In-app editing of member profiles, photo uploads, skill tags, contributions, and academic project metadata.

---

## Technology Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Leaflet / OpenStreetMap
- **Backend:** Python & FastAPI, Uvicorn, REST API, WebSocket event feed, JWT authentication
- **Database:** PostgreSQL with PostGIS geospatial extension
- **Testing:** Node.js native test runner (`node:test`, `node:assert`)

---

## Running Locally

```bash
# Clone the repository
git clone https://github.com/SayemSamir/SafeBangla.git
cd SafeBangla

# Install dependencies
npm install

# Run unit tests
npm test

# Start development server
npm run dev
```

The application runs on `http://localhost:3000`.
