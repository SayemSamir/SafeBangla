import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  FileCode2,
  Database,
  ShieldAlert,
  Server,
  Layers,
  CheckCircle2,
  ExternalLink,
  BookOpen,
  Cpu,
  Lock,
  Network
} from 'lucide-react';

export const ArchitectureDocs: React.FC = () => {
  const { language, t } = useApp();

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header */}
      <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <FileCode2 className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white font-mono">
              {t('RESQ BANGLADESH – SYSTEM ARCHITECTURE & TECHNICAL BLUEPRINT', 'রেসকিউ বাংলাদেশ – সিস্টেম আর্কিটেকচার ও টেকনিক্যাল ব্লুপ্রিন্ট')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive engineering documentation, Entity-Relationship Models, Security Controls, and Research Grounding.
          </p>
        </div>
        <span className="text-xs bg-cyan-950 text-cyan-300 border border-cyan-800 px-3 py-1 rounded-full font-mono font-bold">
          v2.4 Production Spec
        </span>
      </div>

      {/* 1. Research & References */}
      <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-cyan-400 font-mono">
          <BookOpen className="w-4 h-4" />
          1. Research Grounding & Academic Citations
        </h3>
        <p className="text-slate-300">
          RESQ Bangladesh synthesizes learnings from IEEE disaster response architectures and field tested emergency MIS platforms:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block">IEEE Research Document #8538356</strong>
            <p className="text-slate-400 text-[11px]">
              "Smart Disaster Management Systems using IoT and Geospatial Analytics" – Informs our Haversine spatial indexing and automated duplicate incident radius clustering (&lt;1.5 km).
            </p>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-white block">Smart Disaster Response MIS & SDR-MIS</strong>
            <p className="text-slate-400 text-[11px]">
              Informs our 6-stage mission dispatch lifecycle: PENDING &rarr; VERIFIED &rarr; ASSIGNED &rarr; ACCEPTED &rarr; IN_PROGRESS &rarr; COMPLETED, with automated responder suitability checking.
            </p>
          </div>
        </div>
      </div>

      {/* 2. System Architecture & Tech Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-cyan-400 font-mono">
            <Layers className="w-4 h-4" />
            2. High-Level Technology Architecture
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
              <span><strong>Frontend Presentation:</strong> React 19, TypeScript, Tailwind CSS, Leaflet GIS with OpenStreetMap CartoDB Dark basemaps, Lucide Icons, and Framer Motion transitions.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
              <span><strong>Application Gateway:</strong> Express & Node.js backend with RESTful routers for /api/v1/sos, /api/v1/incidents, /api/v1/teams, /api/v1/shelters, /api/v1/hospitals.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
              <span><strong>Geospatial Intelligence:</strong> PostGIS spatial geometry for polygon risk zones, Haversine proximity calculations, and nearest shelter allocation.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0"></span>
              <span><strong>Offline-First & PWA:</strong> Service Worker cache with background sync queue for marooned citizens without active cellular internet.</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3 text-xs">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-cyan-400 font-mono">
            <Cpu className="w-4 h-4" />
            3. AI & Machine Learning Pipeline
          </h3>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
              <span><strong>Bilingual NLP Classifier:</strong> Parses natural language disaster reports in both English and Bengali (e.g., 'হাওরে বন্যা', 'পাহাড় ধস', 'আগুন') into structured categories.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
              <span><strong>Explainable Severity Scorer:</strong> Calculates priority on a 1-10 scale based on trapped victims (+2.2), casualties (+1.6), and population density, outputting clear rationale factors for human operators.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0"></span>
              <span><strong>Computer Vision Damage Assessor:</strong> Inspects disaster photography for structural spalling, roof detachment, and water inundation tags.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* 3. Entity-Relationship Model (ER Diagram) */}
      <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 text-xs font-mono">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-cyan-400">
          <Database className="w-4 h-4" />
          4. Relational Database Schema & Entity Relationships
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-cyan-400 block border-b border-slate-800 pb-1">TABLE: incidents</strong>
            <div>id (UUID, PK)</div>
            <div>category (VARCHAR)</div>
            <div>severity (ENUM: Low-Critical)</div>
            <div>status (ENUM: Pending-Resolved)</div>
            <div>lat / lng (FLOAT, GEOMETRY)</div>
            <div>district / upazila (VARCHAR)</div>
            <div>affected_people (INTEGER)</div>
            <div>has_trapped / has_injured (BOOLEAN)</div>
            <div>assigned_team_id (FK &rarr; teams.id)</div>
            <div>verified_by (FK &rarr; users.id)</div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-teal-400 block border-b border-slate-800 pb-1">TABLE: rescue_teams</strong>
            <div>id (UUID, PK)</div>
            <div>name (VARCHAR)</div>
            <div>base_district (VARCHAR)</div>
            <div>type (FSCD, BDRCS, CoastGuard)</div>
            <div>member_count (INTEGER)</div>
            <div>available (BOOLEAN)</div>
            <div>equipment_json (JSONB)</div>
            <div>current_lat / lng (FLOAT)</div>
            <div>active_mission_id (FK &rarr; missions.id)</div>
          </div>

          <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
            <strong className="text-emerald-400 block border-b border-slate-800 pb-1">TABLE: cyclone_shelters</strong>
            <div>id (UUID, PK)</div>
            <div>name (VARCHAR)</div>
            <div>district / upazila (VARCHAR)</div>
            <div>capacity / occupancy (INTEGER)</div>
            <div>has_drinking_water (BOOLEAN)</div>
            <div>has_solar_power (BOOLEAN)</div>
            <div>has_female_safe_space (BOOLEAN)</div>
            <div>contact_phone (VARCHAR)</div>
          </div>
        </div>
      </div>

      {/* 4. Security Architecture & RBAC */}
      <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2 uppercase tracking-wider text-cyan-400 font-mono">
          <Lock className="w-4 h-4" />
          5. Cybersecurity, Privacy & Role-Based Access Control (RBAC)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
          <div className="space-y-1.5">
            <strong className="text-white block font-semibold">Victim Privacy Protection:</strong>
            <p className="text-slate-400">
              Citizen phone numbers and vulnerable individual medical conditions are masked from the public view; only verified rescue dispatchers and hospital trauma staff have decrypt access.
            </p>
          </div>
          <div className="space-y-1.5">
            <strong className="text-white block font-semibold">Strict Role Boundaries:</strong>
            <p className="text-slate-400">
              Only 'operator' and 'district_admin' roles can transition an incident from PENDING to VERIFIED. Field 'rescue_team' responders can only update missions assigned to their squad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
