import React, { useState } from 'react';
import {
  FileText,
  Database,
  ShieldAlert,
  Server,
  Layers,
  Network,
  BookOpen,
  GitBranch,
  CheckSquare
} from 'lucide-react';

interface ProjectDocsViewProps {
  t: (en: string, bn: string) => string;
}

type DocTab =
  | 'prd'
  | 'architecture'
  | 'usecase'
  | 'dfd'
  | 'sequence'
  | 'activity'
  | 'database'
  | 'api'
  | 'tests';

export const ProjectDocsView: React.FC<ProjectDocsViewProps> = ({ t }) => {
  const [activeDoc, setActiveDoc] = useState<DocTab>('prd');

  const tabs: { id: DocTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'prd', label: '1. PRD & SRS', icon: FileText },
    { id: 'architecture', label: '2. Architecture', icon: Server },
    { id: 'usecase', label: '3. Use Case Diagram', icon: Layers },
    { id: 'dfd', label: '4. DFD L0 & L1', icon: Network },
    { id: 'sequence', label: '5. Sequence Diagram', icon: GitBranch },
    { id: 'activity', label: '6. SOS Activity Flow', icon: ShieldAlert },
    { id: 'database', label: '7. Database ER Model', icon: Database },
    { id: 'api', label: '8. Express REST API', icon: Network },
    { id: 'tests', label: '9. Acceptance Matrix', icon: CheckSquare }
  ];

  return (
    <div className="space-y-6 text-slate-200">
      {/* Doc Selector Header */}
      <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold text-white font-mono">
              {t('SDP Engineering & UML Documentation', 'এসডিপি ইঞ্জিনিয়ারিং ও ইউএমএল ডকুমেন্টেশন')}
            </h2>
          </div>
          <span className="text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 px-3 py-1 rounded">
            BGC Trust University Bangladesh • CSE SDP-1
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeDoc === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveDoc(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-mono transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-600 text-white font-bold'
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
      <div className="bg-[#0F172A] border border-slate-800 p-5 sm:p-6 rounded-2xl shadow-xl text-xs space-y-4">
        {activeDoc === 'prd' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold font-mono text-cyan-400">
                Product Requirements & SRS Overview — RESQ Bangladesh
              </h3>
              <span className="font-mono text-slate-400">IEEE 830 Aligned</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong>Core Philosophy:</strong> Every unnecessary step during an emergency can cost
              valuable time. Citizens in distress can press One-Tap SOS without creating an account,
              automatically detect GPS coordinates (or fall back to interactive map pin or nearby
              landmark), and receive an Emergency ID + 6-character Tracking Code.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-cyan-300 block font-mono">Functional Requirements</strong>
                <ul className="space-y-1 text-slate-300 list-disc pl-4">
                  <li>FR-1: One-Tap Guest SOS with zero mandatory form fields.</li>
                  <li>FR-2: 3-Method Location System (Auto GPS, Manual Map Pin, Landmark).</li>
                  <li>FR-3: Live `watchPosition` location updates scoped to active SOS.</li>
                  <li>FR-4: Smart responder ranking by availability, Haversine distance, skills, equipment.</li>
                  <li>FR-5: Operator-approved workflow (`PENDING` -&gt; `VERIFIED` -&gt; `ASSIGNED` -&gt; `ACCEPTED` -&gt; `IN_PROGRESS` -&gt; `RESOLVED`).</li>
                </ul>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
                <strong className="text-emerald-300 block font-mono">Security & Reliability Controls</strong>
                <ul className="space-y-1 text-slate-300 list-disc pl-4">
                  <li>Victim phone numbers masked on public/citizen feeds.</li>
                  <li>Guest tracking verified by Emergency ID + 6-character Tracking Code.</li>
                  <li>Sliding-window rate limiting on SOS creation & media uploads.</li>
                  <li>Server-side Nominatim reverse-geocode proxy with 15-min cache & throttle.</li>
                  <li>Honest notification logs (explicit `not_configured` when SMS/SMTP unset).</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'architecture' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-cyan-400 border-b border-slate-800 pb-3">
              Full-Stack System Architecture Diagram
            </h3>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 820 270" className="w-full min-w-[640px] bg-slate-950 rounded-xl border border-slate-800 p-3">
                <defs>
                  <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#22D3EE" />
                  </marker>
                </defs>
                <rect x="20" y="30" width="210" height="210" rx="10" fill="#0F172A" stroke="#0284C7" strokeWidth="1.5" />
                <text x="125" y="55" textAnchor="middle" fill="#38BDF8" fontSize="12" fontWeight="bold" fontFamily="monospace">REACT + LEAFLET SPA</text>
                <text x="35" y="85" fill="#E2E8F0" fontSize="11">• One-Tap SOS Modal</text>
                <text x="35" y="108" fill="#E2E8F0" fontSize="11">• Browser Geolocation API</text>
                <text x="35" y="131" fill="#E2E8F0" fontSize="11">• Leaflet + OpenStreetMap</text>
                <text x="35" y="154" fill="#E2E8F0" fontSize="11">• Guest SOS Tracker</text>
                <text x="35" y="177" fill="#E2E8F0" fontSize="11">• Dispatch Operations UI</text>
                <text x="35" y="200" fill="#94A3B8" fontSize="10">Offline localStorage Queue</text>

                <line x1="230" y1="135" x2="295" y2="135" stroke="#22D3EE" strokeWidth="2" markerEnd="url(#arrow)" />

                <rect x="295" y="30" width="230" height="210" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
                <text x="410" y="55" textAnchor="middle" fill="#34D399" fontSize="12" fontWeight="bold" fontFamily="monospace">EXPRESS API (PORT 3000)</text>
                <text x="310" y="85" fill="#E2E8F0" fontSize="11">• /api/emergencies (Rate Limited)</text>
                <text x="310" y="108" fill="#E2E8F0" fontSize="11">• /api/emergencies/track</text>
                <text x="310" y="131" fill="#E2E8F0" fontSize="11">• /api/emergencies/:id/assign</text>
                <text x="310" y="154" fill="#E2E8F0" fontSize="11">• /api/geocode/reverse & search</text>
                <text x="310" y="177" fill="#E2E8F0" fontSize="11">• /api/uploads (Path Confined)</text>
                <text x="310" y="200" fill="#94A3B8" fontSize="10">• Role-Based Phone Masking</text>

                <line x1="525" y1="90" x2="590" y2="90" stroke="#22D3EE" strokeWidth="2" />
                <line x1="525" y1="185" x2="590" y2="185" stroke="#F59E0B" strokeWidth="2" />

                <rect x="590" y="30" width="210" height="100" rx="10" fill="#0F172A" stroke="#6366F1" strokeWidth="1.5" />
                <text x="695" y="55" textAnchor="middle" fill="#A5B4FC" fontSize="12" fontWeight="bold" fontFamily="monospace">ATOMIC JSON STORE</text>
                <text x="605" y="80" fill="#CBD5E1" fontSize="11">• data/resq_db.json</text>
                <text x="605" y="100" fill="#CBD5E1" fontSize="11">• uploads/ Media Assets</text>
                <text x="605" y="118" fill="#94A3B8" fontSize="10">• Audit & Delivery Logs</text>

                <rect x="590" y="145" width="210" height="95" rx="10" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
                <text x="695" y="170" textAnchor="middle" fill="#FCD34D" fontSize="12" fontWeight="bold" fontFamily="monospace">EXTERNAL SERVICES</text>
                <text x="605" y="195" fill="#CBD5E1" fontSize="11">• OSM Nominatim (Throttled)</text>
                <text x="605" y="215" fill="#CBD5E1" fontSize="11">• Optional SMS/SMTP Webhook</text>
              </svg>
            </div>
          </div>
        )}

        {activeDoc === 'usecase' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-cyan-400 border-b border-slate-800 pb-3">
              Use Case Diagram (Actors & Emergency Interactions)
            </h3>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 820 300" className="w-full min-w-[640px] bg-slate-950 rounded-xl border border-slate-800 p-3">
                <rect x="190" y="20" width="440" height="260" rx="14" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
                <text x="410" y="44" textAnchor="middle" fill="#38BDF8" fontSize="12" fontWeight="bold" fontFamily="monospace">RESQ BANGLADESH SYSTEM BOUNDARY</text>

                <text x="40" y="95" fill="#F87171" fontSize="12" fontWeight="bold">Guest Victim</text>
                <text x="40" y="112" fill="#94A3B8" fontSize="10">(No Login Needed)</text>

                <text x="40" y="215" fill="#34D399" fontSize="12" fontWeight="bold">Family Member</text>

                <text x="670" y="95" fill="#38BDF8" fontSize="12" fontWeight="bold">Duty Operator</text>
                <text x="670" y="112" fill="#94A3B8" fontSize="10">/ District Admin</text>

                <text x="670" y="215" fill="#FBBF24" fontSize="12" fontWeight="bold">Rescue Unit</text>

                {[
                  { cy: 78, label: 'Trigger One-Tap SOS + Auto GPS' },
                  { cy: 122, label: 'Upload Voice / Photo & Landmark' },
                  { cy: 166, label: 'Track SOS via ID + 6-Char Code' },
                  { cy: 210, label: 'Verify & Recommend Responders' },
                  { cy: 254, label: 'Accept, Execute & Resolve Rescue' }
                ].map((uc, i) => (
                  <g key={i}>
                    <ellipse cx="410" cy={uc.cy} rx="165" ry="17" fill="#1E293B" stroke="#0284C7" />
                    <text x="410" y={uc.cy + 4} textAnchor="middle" fill="#F8FAFC" fontSize="11">{uc.label}</text>
                  </g>
                ))}

                <line x1="130" y1="95" x2="245" y2="78" stroke="#F87171" strokeWidth="1.2" />
                <line x1="130" y1="98" x2="245" y2="122" stroke="#F87171" strokeWidth="1.2" />
                <line x1="145" y1="210" x2="245" y2="166" stroke="#34D399" strokeWidth="1.2" />
                <line x1="660" y1="95" x2="575" y2="210" stroke="#38BDF8" strokeWidth="1.2" />
                <line x1="660" y1="212" x2="575" y2="254" stroke="#FBBF24" strokeWidth="1.2" />
              </svg>
            </div>
          </div>
        )}

        {activeDoc === 'dfd' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-cyan-400 border-b border-slate-800 pb-3">
              Data Flow Diagram (DFD Level 0 & Level 1)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-cyan-300 font-mono block">DFD Level 0 — Context Diagram</strong>
                <p className="text-slate-300 leading-relaxed">
                  <strong>Citizen</strong> sends GPS/Landmark/Category/Media -&gt; <strong>[0.0 RESQ Platform]</strong> -&gt; returns Emergency ID + Tracking Code + Nearest Shelter.
                  <br />
                  <strong>[0.0 RESQ Platform]</strong> sends Verified Incidents & Smart Recommendations -&gt; <strong>Operator & Rescue Teams</strong> -&gt; returns Status Transitions & Field Updates.
                </p>
              </div>
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-emerald-300 font-mono block">DFD Level 1 — Sub-Processes</strong>
                <ul className="space-y-1 text-slate-300 list-disc pl-4">
                  <li><strong>1.0 Location Acquisition:</strong> Geolocation API + Nominatim Proxy Cache + Map Pin/Landmark.</li>
                  <li><strong>2.0 SOS Ingestion & Triage:</strong> Rate Limit + Sanitize + AI Severity Score + Duplicate Check.</li>
                  <li><strong>3.0 Smart Dispatch Engine:</strong> Haversine Distance + Skills + Equipment Scoring.</li>
                  <li><strong>4.0 Secure Tracking & Audit:</strong> Code-verified status readout + Live `watchPosition` store.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'sequence' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-cyan-400 border-b border-slate-800 pb-3">
              Sequence Diagram — One-Tap SOS to Rescue Resolution
            </h3>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] space-y-2 text-slate-300 overflow-x-auto">
              <div>1. Citizen -&gt; SosModal: Press ONE-TAP EMERGENCY SOS</div>
              <div className="text-cyan-300">2. SosModal -&gt; Browser Geolocation: getCurrentPosition(highAccuracy: true)</div>
              <div>3. Browser -&gt; Express API: GET /api/geocode/reverse (or user picks Map Pin / Landmark)</div>
              <div className="text-emerald-300">4. SosModal -&gt; POST /api/emergencies: Create guest SOS (0 required fields)</div>
              <div>5. Express Store -&gt; SosModal: Return ID (RESQ-2026-XXXX) + Tracking Code (6 chars)</div>
              <div className="text-amber-300">6. Operator -&gt; POST /api/emergencies/:id/verify: Human approval (VERIFIED)</div>
              <div>7. Operator -&gt; dispatch.ts: Rank Rescue Teams (distance + skills + equipment)</div>
              <div className="text-cyan-300">8. Operator -&gt; POST /api/emergencies/:id/assign: Assign selected unit (ASSIGNED)</div>
              <div>9. Rescue Team -&gt; PATCH /api/emergencies/:id/status: ACCEPTED -&gt; IN_PROGRESS -&gt; RESOLVED</div>
            </div>
          </div>
        )}

        {activeDoc === 'activity' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-cyan-400 border-b border-slate-800 pb-3">
              Activity Diagram — Emergency SOS + 3-Method Location Fallback
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-slate-900 rounded-xl border border-red-500/40">
                <div className="font-mono font-bold text-red-400 mb-1">Step A: Trigger</div>
                <p className="text-slate-300">User taps SOS. Auto GPS starts immediately; Send SOS button is already unlocked.</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/40">
                <div className="font-mono font-bold text-cyan-400 mb-1">Step B: Location Branch</div>
                <p className="text-slate-300">GPS succeeds -&gt; Save lat/lng/accuracy. GPS fails/denied -&gt; Calm guidance lets user pick Map Pin or Landmark.</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-emerald-500/40">
                <div className="font-mono font-bold text-emerald-400 mb-1">Step C: Submit First</div>
                <p className="text-slate-300">Online -&gt; Express DB returns ID + Tracking Code. Offline -&gt; Saved to localStorage queue for sync.</p>
              </div>
              <div className="p-3 bg-slate-900 rounded-xl border border-amber-500/40">
                <div className="font-mono font-bold text-amber-300 mb-1">Step D: Optional Follow-up</div>
                <p className="text-slate-300">After SOS is sent, user may record voice, attach photo/video, add injured count, or share live GPS.</p>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'database' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-cyan-400 border-b border-slate-800 pb-3">
              Database Entity-Relationship (ER) Model
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-cyan-300 block font-mono">1. incidents</strong>
                <p className="text-slate-400">
                  id (PK), trackingCode, category, severity, status, location (lat, lng, accuracyMeters, locationSource, formattedAddress, landmark, district, upazila), isGuest, isDemo, isLiveTracking, assignedTeamId (FK), media[], updates[], auditLogs[].
                </p>
              </div>
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-emerald-300 block font-mono">2. rescueTeams</strong>
                <p className="text-slate-400">
                  id (PK), name, type, baseDistrict, division, skills[], equipment[], available, currentLocation (lat, lng), activeMissionId, memberCount, contactPhone.
                </p>
              </div>
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-sky-300 block font-mono">3. shelters & hospitals</strong>
                <p className="text-slate-400">
                  id (PK), name, district, upazila, lat, lng, capacity, currentOccupancy, availableIcuBeds, ambulanceAvailable, contactNumber / contactPhone.
                </p>
              </div>
              <div className="p-3.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <strong className="text-amber-300 block font-mono">4. deliveryLogs & safePeople</strong>
                <p className="text-slate-400">
                  deliveryLogs: id, incidentId (FK), channel (in_app | dashboard_alert | email | sms), status (delivered | not_configured), providerNote. safePeople: id, name, phone, location, timestamp.
                </p>
              </div>
            </div>
          </div>
        )}

        {activeDoc === 'api' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-cyan-400 border-b border-slate-800 pb-3">
              Implemented Express REST API Endpoints (`server.ts`)
            </h3>
            <div className="space-y-2 font-mono text-xs">
              {[
                { method: 'GET', path: '/api/bootstrap?role=...', desc: 'Role-masked incidents, teams, shelters, hospitals, alerts, deliveryLogs' },
                { method: 'POST', path: '/api/emergencies', desc: 'Rate-limited Guest One-Tap SOS creation -> returns ID + trackingCode' },
                { method: 'GET', path: '/api/emergencies/track?id=...&code=...', desc: 'Code-verified guest emergency status + assigned team + delivery logs' },
                { method: 'PATCH', path: '/api/emergencies/:id/details', desc: 'Post-SOS enrichment (victims, injured, voice/photo/video media, phone)' },
                { method: 'PATCH', path: '/api/emergencies/:id/location', desc: 'Active live GPS coordinate & accuracy stream update' },
                { method: 'POST', path: '/api/emergencies/:id/verify', desc: 'Operator verification (PENDING -> VERIFIED)' },
                { method: 'POST', path: '/api/emergencies/:id/assign', desc: 'Transactional responder assignment (VERIFIED -> ASSIGNED)' },
                { method: 'PATCH', path: '/api/emergencies/:id/status', desc: 'State-machine & role-checked workflow transitions' },
                { method: 'GET', path: '/api/geocode/reverse & /search', desc: 'Cached & throttled OpenStreetMap Nominatim proxy + district fallback' },
                { method: 'POST', path: '/api/uploads', desc: 'Validated MIME/size upload stored safely in /uploads' }
              ].map((ep, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 mr-2 font-bold">
                      {ep.method}
                    </span>
                    <span className="text-white">{ep.path}</span>
                  </div>
                  <span className="text-slate-400 font-sans text-[11px]">{ep.desc}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeDoc === 'tests' && (
          <div className="space-y-4">
            <h3 className="text-base font-bold font-mono text-cyan-400 border-b border-slate-800 pb-3">
              12-Point Acceptance Test Cases Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[11px]">
                <thead>
                  <tr className="border-b border-slate-800 text-cyan-300 font-mono">
                    <th className="py-2 pr-3">TC#</th>
                    <th className="py-2 pr-3">Scenario</th>
                    <th className="py-2">Expected Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70 text-slate-300">
                  <tr><td className="py-2 pr-3 font-mono">TC-01</td><td className="py-2 pr-3">Guest SOS with 0 form fields</td><td className="py-2">Creates PENDING SOS, returns ID + 6-char trackingCode</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-02</td><td className="py-2 pr-3">Auto GPS Permission Granted</td><td className="py-2">Captures lat, lng, ±accuracy, timestamp & reverse-geocoded address</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-03</td><td className="py-2 pr-3">GPS Denied / Unavailable</td><td className="py-2">Shows calm fallback guidance; allows Manual Map Pin & Landmark SOS</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-04</td><td className="py-2 pr-3">Post-SOS Evidence Enrichment</td><td className="py-2">Attaches voice/photo/video + injured/trapped details after SOS sent</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-05</td><td className="py-2 pr-3">Secure Guest Tracking</td><td className="py-2">Requires matching ID + code; rejects invalid tracking codes</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-06</td><td className="py-2 pr-3">Live Location Sharing</td><td className="py-2">Streams `watchPosition` updates and toggles off cleanly</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-07</td><td className="py-2 pr-3">Role-Gated Operator Verification</td><td className="py-2">Blocks citizen from verifying; Operator transitions PENDING -&gt; VERIFIED</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-08</td><td className="py-2 pr-3">Smart Responder Recommendation</td><td className="py-2">Ranks teams by availability, Haversine distance, skills, equipment</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-09</td><td className="py-2 pr-3">Full Dispatch Lifecycle</td><td className="py-2">ASSIGNED -&gt; ACCEPTED -&gt; IN_PROGRESS -&gt; RESOLVED + audit timeline</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-10</td><td className="py-2 pr-3">GIS Map Layers & Search</td><td className="py-2">Renders Leaflet OSM map, search, filters, accuracy rings & rescue routes</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-11</td><td className="py-2 pr-3">Privacy & Rate Limiting</td><td className="py-2">Masks reporter phone on citizen feed; rate-limits burst SOS posts</td></tr>
                  <tr><td className="py-2 pr-3 font-mono">TC-12</td><td className="py-2 pr-3">Bangla & Mobile Responsiveness</td><td className="py-2">Switches EN/বাং cleanly; 390px viewport fits with `tel:999` & 44px buttons</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
