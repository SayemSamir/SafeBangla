# MASTER CONTEXT & ARCHITECTURAL LOG — RESQ BANGLADESH
**Smart Disaster & Emergency Response Management System**
*Institution:* BGC Trust University Bangladesh | Department of Computer Science & Engineering  
*Course:* Software Development Project -1 | *Supervisor:* Ferdous Ara  
*Repository:* https://github.com/SayemSamir/ResQ-Bangladesh  
*Last Updated:* 2026-11-06

---

## 1. Project Overview & Identity
- **Project Name:** RESQ BANGLADESH
- **Tagline:** Connecting People, Saving Lives During Emergencies.
- **Academic Context:** 5-Member Software Engineering Capstone Project.
- **Five Verified Team Members:**
  1. Gazi Sayem Uddin Samir
  2. Antunia Das
  3. Ovin Paul
  4. Montashir Nabil
  5. Sadman Samir

---

## 2. Completed Modules & Features

### Core Emergency Response Modules (Level 1 & Level 2):
1. **Public Emergency Portal & Hero Section:** One-tap SOS trigger, quick triage modal, live hotlines banner (999, 1090, 333), and safety guidelines.
2. **Interactive Bangladesh GIS Map:** Custom OpenStreetMap tiles rendered via Leaflet, markers for incidents, cyclone shelters, hospitals, and real-time division filters.
3. **Haversine Geospatial Duplicate Detection:** Spherical coordinate distance checking (`< 1.5 km`) flagging duplicate panic calls automatically.
4. **AI Triage & Severity Scoring:** Bilingual (EN/BN) classification engine for 11 disaster categories and 1–10 hazard scoring.
5. **Rescue Operations & Kanban Board:** 6-stage dispatch lifecycle (`PENDING` &rarr; `VERIFIED` &rarr; `ASSIGNED` &rarr; `ACCEPTED` &rarr; `IN_PROGRESS` &rarr; `COMPLETED`).
6. **Relief & Supply Chain Inventory:** District warehouse tracking of food packets, clean water tablets, life vests, and medical supplies.
7. **Hospital & Shelter Directory:** Verified bed capacity, ICU availability, ambulance fleet status, and emergency contacts.
8. **Disaster Preparedness Knowledge Base:** Downloadable safety checklists for floods, cyclones, fires, and earthquakes.
9. **Role-Based Access Control (RBAC):** Multi-role simulation across 8 operational roles with dedicated privileges.

### Team & Academic Project Profile Module:
10. **Meet Our Team Page:** Responsive grid displaying all 5 verified members with neutral initials avatars, academic affiliations, biographies, skills, and contribution summaries.
11. **Individual Member Profile View:** Modal inspection of member qualifications, assigned project responsibilities, specific contributions, and social links.
12. **About the Project Section:** Formal problem statement, proposed solution, BGC Trust University affiliation, supervisor Ferdous Ara attribution, and system tech stack.
13. **Project Journey & Timeline:** Visual 9-stage development lifecycle roadmap with milestone tracking and deliverable verification.
14. **Engineering Documentation Viewer:** Integrated reader for PRD, SRS, System Architecture, Database ER Model, Security Threat Model, and REST/WebSocket API specs.
15. **Admin Management System:** In-app editing of member details, client-side photo upload with format & size validation, public visibility toggle, reordering, and localStorage persistence.

---

## 3. Directory Structure
```
/
├── index.html
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
├── README.md
├── MASTER_CONTEXT.md
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── types/
    │   ├── index.ts               # Core emergency types (Incidents, Teams, Shelters)
    │   └── team.ts                # Academic team, project info, journey types
    ├── data/
    │   ├── bangladeshData.ts      # Verified geographic divisions, hotlines, shelters
    │   └── teamData.ts            # Initial 5 member profiles & academic metadata
    ├── context/
    │   └── AppContext.tsx         # Central application state & notification bus
    ├── utils/
    │   ├── geo.ts                 # Haversine distance, shelter proximity, deduplication
    │   ├── geo.test.ts            # Unit tests for geospatial logic
    │   ├── aiEngine.ts            # Rule-based NLP classifier & severity scoring
    │   ├── aiEngine.test.ts       # Unit tests for AI triage logic
    │   ├── teamValidation.ts      # Image upload validation, persistence, initials avatar
    │   └── team.test.ts           # Unit tests for team data integrity
    └── components/
        ├── common/                # Navbar, Footer, AlertBanner
        ├── home/                  # HeroSection, QuickStats
        ├── map/                   # BangladeshGisMap, Leaflet components
        ├── operations/            # RescueOperations, MissionKanban
        ├── ai/                    # AiIntelligenceCenter, TriageInspector
        ├── relief/                # ReliefManagement
        ├── medical/               # HospitalShelterDirectory
        ├── guides/                # DisasterPreparedness
        ├── analytics/             # AdminAnalytics
        ├── about/                 # ArchitectureDocs
        ├── sos/                   # SosModal, MarkSafeModal
        └── team/                  # TeamProjectHub, MemberCard, MemberDetailModal,
                                   # AdminEditModal, AboutProjectView, ProjectJourneyView,
                                   # ProjectDocsView
```

---

## 4. Test Results & Verification
- **Test Suite:** Native Node.js test runner (`node:test`, `node:assert`)
- **Executed Tests:**
  1. `src/utils/geo.test.ts`: 4/4 passed (Haversine distances, duplicate clusters, shelter search)
  2. `src/utils/aiEngine.test.ts`: 3/3 passed (Bilingual keyword triage, severity scoring)
  3. `src/utils/team.test.ts`: 6/6 passed (5 verified members, unsupplied fields check, academic info, 9 journey stages, URL validation, initial avatar generation)
- **Total:** 13/13 unit tests passed with 0 failures.
- **Compilation & Linting:** `tsc --noEmit` and Vite build succeeded with 0 errors.

---

## 5. Next Steps
1. Connect PostgreSQL / PostGIS database using Cloud SQL or Supabase.
2. Integrate Python / FastAPI backend for persistent WebSocket incident broadcasting.
3. Conduct pilot field evaluation with volunteer rescue squads in Chattogram and Sylhet.
