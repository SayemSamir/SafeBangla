import React, { useState } from 'react';
import {
  FileText,
  Database,
  ShieldAlert,
  Server,
  Layers,
  CheckCircle2,
  Lock,
  Network,
  BookOpen
} from 'lucide-react';

interface ProjectDocsViewProps {
  t: (en: string, bn: string) => string;
}

export const ProjectDocsView: React.FC<ProjectDocsViewProps> = ({ t }) => {
  const [activeDoc, setActiveDoc] = useState<
    'prd' | 'srs' | 'architecture' | 'database' | 'security' | 'api'
  >('prd');

  return (
    <div className="space-y-6 text-slate-200">
      {/* Doc Selector Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-mono">
              {t('Project Engineering Documentation', 'প্রজেক্ট ইঞ্জিনিয়ারিং ডকুমেন্টেশন')}
            </h2>
          </div>
          <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-3 py-1 rounded-full">
            BGC Trust University Bangladesh • CSE
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'prd', label: '1. PRD Overview', icon: FileText },
            { id: 'srs', label: '2. Software Specs (SRS)', icon: Layers },
            { id: 'architecture', label: '3. System Architecture', icon: Server },
            { id: 'database', label: '4. Database ER Model', icon: Database },
            { id: 'security', label: '5. Security & Threat Model', icon: ShieldAlert },
            { id: 'api', label: '6. REST & WebSocket API', icon: Network }
          ].map(tab => {
            const Icon = tab.icon;
            const isSelected = activeDoc === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveDoc(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono transition-all ${
                  isSelected
                    ? 'bg-cyan-600 text-white font-bold shadow-lg shadow-cyan-900/40'
                    : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Doc Content Container */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl shadow-xl text-xs space-y-4">
        {activeDoc === 'prd' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono text-cyan-400">
                Product Requirements Document (PRD) — RESQ Bangladesh
              </h3>
              <span className="font-mono text-slate-500">Status: Approved</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Objective:</strong> Establish a unified national disaster management web platform designed specifically for Bangladesh's geographical vulnerabilities (cyclones, flash floods, monsoon river surges, fire disasters, building collapse).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white block font-mono text-cyan-300">Target Audiences & Roles</strong>
                <ul className="space-y-1 text-slate-400">
                  <li>• <strong>Citizens & Victims:</strong> Instant SOS dispatch, safe-check-in, shelter navigation.</li>
                  <li>• <strong>Volunteers:</strong> Registration, field dispatch notifications, casualty support.</li>
                  <li>• <strong>Rescue Teams & Fire Service:</strong> Real-time task acceptance, GPS routing, status updates.</li>
                  <li>• <strong>Hospitals & Shelters:</strong> Bed availability, blood bank supply, casualty intake.</li>
                  <li>• <strong>District & National Admins:</strong> Unified situation awareness, duplicate elimination.</li>
                </ul>
              </div>

              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-white block font-mono text-teal-300">Success Metrics (KPIs)</strong>
                <ul className="space-y-1 text-slate-400">
                  <li>• SOS acknowledgement time: &lt; 30 seconds</li>
                  <li>• Incident verification & duplicate detection: &lt; 2 minutes</li>
                  <li>• Geospatial dispatch accuracy: &lt; 1.5 km radius</li>
                  <li>• Offline cached guidance availability: 100%</li>
                  <li>• Bilingual accessibility (Bengali + English): Complete</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'srs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono text-cyan-400">
                Software Requirements Specification (SRS)
              </h3>
              <span className="font-mono text-slate-500">IEEE 830 Conformance</span>
            </div>
            <div className="space-y-3 text-slate-300">
              <p>
                <strong>Functional Requirements:</strong>
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-1">FR-1: SOS Triage</span>
                  <span className="text-slate-400">Capture GPS lat/lng, division/district/upazila, victim count, trapped/injured flags, and preview photo.</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-1">FR-2: Haversine Clustering</span>
                  <span className="text-slate-400">Automatically calculate spherical distance between new and existing reports to eliminate duplicate panic calls.</span>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                  <span className="font-bold text-white block mb-1">FR-3: Shelter Proximity</span>
                  <span className="text-slate-400">Search and sort verified cyclone shelters and district hospitals by geographical proximity.</span>
                </div>
              </div>

              <p className="pt-2">
                <strong>Non-Functional Requirements (NFRs):</strong>
              </p>
              <ul className="space-y-1 text-slate-400 pl-4 list-disc">
                <li><strong>NFR-1 (Availability):</strong> Graceful offline degradation for essential safety checklists and emergency contact numbers.</li>
                <li><strong>NFR-2 (Security):</strong> JWT bearer token authentication with role-based authorization matrix.</li>
                <li><strong>NFR-3 (Performance):</strong> Client-side map render latency under 150ms for 500+ simultaneous geo-markers.</li>
              </ul>
            </div>
          </div>
        )}

        {activeDoc === 'architecture' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono text-cyan-400">
                System Architecture & Data Flow
              </h3>
              <span className="font-mono text-slate-500">Client-Server & GIS Micro-Modules</span>
            </div>
            <p className="text-slate-300">
              The RESQ Bangladesh platform follows a modular layered architecture ensuring loose coupling between the presentation layer, the geospatial query engine, and the mission coordination backend:
            </p>

            <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
              <div className="text-cyan-400 font-bold">[Presentation Layer]</div>
              <div className="pl-4 text-slate-400">&bull; React 19 SPA + Tailwind CSS + Lucide Icons</div>
              <div className="pl-4 text-slate-400">&bull; OpenStreetMap Interactive Tiles via Leaflet</div>
              <div className="pl-4 text-slate-400">&bull; LocalStorage State Cache & Offline Queue</div>

              <div className="text-teal-400 font-bold pt-2">[Intelligence & Calculation Engine]</div>
              <div className="pl-4 text-slate-400">&bull; Haversine Spherical Distance Calculator (d = 2R &times; arcsin(&radic;h))</div>
              <div className="pl-4 text-slate-400">&bull; Bilingual Rule-Based NLP Emergency Classifier</div>
              <div className="pl-4 text-slate-400">&bull; Automated Severity Scoring (1 to 10 Scale)</div>

              <div className="text-indigo-400 font-bold pt-2">[Data & Backend Services]</div>
              <div className="pl-4 text-slate-400">&bull; FastAPI REST Controllers & WebSocket Event Bus</div>
              <div className="pl-4 text-slate-400">&bull; PostgreSQL with PostGIS Spatial Extensions</div>
            </div>
          </div>
        )}

        {activeDoc === 'database' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono text-cyan-400">
                Database Entity-Relationship (ER) Model
              </h3>
              <span className="font-mono text-slate-500">PostgreSQL Schema Design</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-cyan-300 block font-mono">1. incidents Table</strong>
                <p className="text-slate-400 text-[11px]">
                  Columns: id (UUID), tracking_id, category, severity, status, lat, lng, division, district, upazila, affected_people, trapped, injured, reporter_name, reporter_phone, created_at, updated_at.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-teal-300 block font-mono">2. rescue_teams Table</strong>
                <p className="text-slate-400 text-[11px]">
                  Columns: id, name, type (FireService, Volunteer, RedCrescent, Army, Medical), base_district, current_lat, current_lng, is_available, members_count, contact_phone.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-indigo-300 block font-mono">3. shelters & hospitals Tables</strong>
                <p className="text-slate-400 text-[11px]">
                  Columns: id, name, type, lat, lng, capacity, current_occupancy, contact_number, has_generator, has_clean_water, has_icu, ambulance_count.
                </p>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-purple-300 block font-mono">4. audit_logs Table</strong>
                <p className="text-slate-400 text-[11px]">
                  Columns: id, incident_id, stage, actor, role, notes, timestamp. Ensures non-repudiation and full operational traceability.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'security' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono text-cyan-400">
                Security Threat Model & Privacy Controls
              </h3>
              <span className="font-mono text-slate-500">STRIDE Matrix</span>
            </div>

            <div className="space-y-2 text-slate-300">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-white block font-mono text-red-300">Threat 1: Spoofed or Malicious SOS Reports</strong>
                <span className="text-slate-400">Mitigation: Automated phone format validation, GPS coordinate consistency checks, and mandatory human operator triage before responder vehicle dispatch.</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-white block font-mono text-amber-300">Threat 2: Victim Identity Exposure</strong>
                <span className="text-slate-400">Mitigation: Anonymous submission support, role-restricted phone number masking on public live maps, and zero public exposure of private medical notes.</span>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
                <strong className="text-white block font-mono text-cyan-300">Threat 3: Administrative Privilege Escalation</strong>
                <span className="text-slate-400">Mitigation: Strict Role-Based Access Control (RBAC), signed JWT authentication, and permanent immutable audit trail logging for all sensitive status changes.</span>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'api' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-mono text-cyan-400">
                RESTful API & WebSocket Specification
              </h3>
              <span className="font-mono text-slate-500">OpenAPI 3.1 Contract</span>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 mr-2 font-bold">POST</span>
                  <span className="text-white">/api/v1/incidents/sos</span>
                </div>
                <span className="text-slate-400 text-[11px]">Submit new citizen emergency report</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 mr-2 font-bold">GET</span>
                  <span className="text-white">/api/v1/incidents/active</span>
                </div>
                <span className="text-slate-400 text-[11px]">Fetch filtered incidents by division/severity</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 mr-2 font-bold">PATCH</span>
                  <span className="text-white">/api/v1/incidents/&#123;id&#125;/status</span>
                </div>
                <span className="text-slate-400 text-[11px]">Operator status update (Requires JWT Auth)</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 mr-2 font-bold">WSS</span>
                  <span className="text-white">/ws/dispatch-feed</span>
                </div>
                <span className="text-slate-400 text-[11px]">Live WebSocket event push for EOC and responders</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
