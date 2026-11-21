import React, { useState } from 'react';
import { AcademicProjectInfo } from '../../types/team';
import {
  GraduationCap,
  Building,
  UserCheck,
  BookOpen,
  Calendar,
  Layers,
  Github,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Flame,
  Award,
  Edit3,
  Save
} from 'lucide-react';

interface AboutProjectViewProps {
  academicInfo: AcademicProjectInfo;
  isAdmin: boolean;
  onUpdateAcademicInfo: (info: AcademicProjectInfo) => void;
  t: (en: string, bn: string) => string;
}

export const AboutProjectView: React.FC<AboutProjectViewProps> = ({
  academicInfo,
  isAdmin,
  onUpdateAcademicInfo,
  t
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<AcademicProjectInfo>(academicInfo);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAcademicInfo(formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Academic Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#070D1E] to-[#0A192F] border border-cyan-500/40 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>{academicInfo.courseTitle}</span>
              <span className="text-cyan-600">•</span>
              <span>{academicInfo.teamNumber || 'Team-01'}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {academicInfo.projectName}
            </h1>
            <p className="text-sm font-semibold text-cyan-300 font-mono">
              {academicInfo.projectTitle}
            </p>
            <p className="text-xs text-slate-300 italic">
              "{academicInfo.tagline}"
            </p>
          </div>

          {/* Academic Stamp */}
          <div className="p-4 bg-slate-900/90 border border-cyan-500/30 rounded-2xl space-y-2 text-xs min-w-[280px]">
            <div className="flex items-center gap-2 text-teal-400 font-bold font-mono">
              <Building className="w-4 h-4 shrink-0" />
              <span>{academicInfo.university}</span>
            </div>
            <div className="text-[11px] text-slate-300 pl-6">
              Department of {academicInfo.department}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center gap-2 text-slate-200">
              <UserCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Course Supervisor</span>
                <strong className="text-xs text-white font-mono">{academicInfo.supervisor}</strong>
              </div>
            </div>

            {isAdmin && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full mt-2 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-cyan-900/40 text-cyan-300 text-[11px] font-mono border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3 h-3" />
                <span>Edit Academic Info (Admin)</span>
              </button>
            )}
          </div>
        </div>

        {/* Admin Inline Editor */}
        {isEditing && (
          <form onSubmit={handleSave} className="mt-6 pt-6 border-t border-slate-800 space-y-4 text-xs">
            <h4 className="font-bold text-cyan-400 font-mono">Edit Academic Project Metadata</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Supervisor Name</label>
                <input
                  type="text"
                  value={formData.supervisor}
                  onChange={e => setFormData({ ...formData, supervisor: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Academic Session</label>
                <input
                  type="text"
                  value={formData.academicSession || ''}
                  onChange={e => setFormData({ ...formData, academicSession: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Submission Date</label>
                <input
                  type="text"
                  value={formData.submissionDate || ''}
                  onChange={e => setFormData({ ...formData, submissionDate: e.target.value })}
                  className="w-full p-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-cyan-600 text-white font-mono flex items-center gap-1.5"
              >
                <Save className="w-3 h-3" />
                <span>Save Info</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Problem Statement & Proposed Solution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-red-400">
            <Flame className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
              {t('Problem Statement', 'সমস্যার বিবরণ')}
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Bangladesh is one of the world's most disaster-vulnerable nations, facing regular riverine flash floods (Sylhet, Sunamganj, Kurigram), coastal cyclones (Chattogram, Cox's Bazar, Barishal), landslides, and urban fire disasters.
          </p>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Fragmented Communications:</strong> Victims call disparate phone numbers with no unified tracking or GIS verification.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Duplicate Overwhelm:</strong> Dispatch centers receive dozens of panicked calls for the same event, causing dispatch paralysis.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-red-500 font-bold">•</span>
              <span><strong>Resource Blindspots:</strong> Rescue boats, medical teams, and dry rations are frequently misallocated without real-time inventory visibility.</span>
            </li>
          </ul>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center gap-2 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
            <h3 className="text-sm font-bold uppercase tracking-wider font-mono">
              {t('The RESQ Solution', 'রেসকিউ সমাধান')}
            </h3>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            RESQ Bangladesh acts as a unified digital emergency nervous system. It bridges citizens in distress, registered field volunteers, professional rescue brigades, and district administrators via one coherent real-time platform.
          </p>
          <ul className="space-y-2 text-xs text-slate-400">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>One-Tap SOS with Auto-Triage:</strong> Citizens dispatch instant distress reports with GPS location, bilingual Bengali NLP categorization, and damage photos.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>Haversine Proximity Deduplication:</strong> Automated spatial clustering flags duplicates within &lt;1.5 km to prevent duplicate dispatches.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span>
              <span><strong>6-Stage Mission Lifecycle:</strong> Full audit trail from report receipt &rarr; verification &rarr; assignment &rarr; rescue &rarr; post-incident review.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Tech Stack Breakdown */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-cyan-400 font-mono flex items-center gap-2">
            <Cpu className="w-4 h-4" />
            {t('Production Technology Stack', 'প্রোডাকশন টেকনোলজি স্ট্যাক')}
          </h3>
          <span className="text-[11px] font-mono text-slate-400">Full-Stack Architecture</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
            <strong className="text-cyan-300 block font-mono">Frontend Client</strong>
            <p className="text-slate-400 text-[11px]">
              React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Leaflet OpenStreetMap GIS.
            </p>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
            <strong className="text-teal-300 block font-mono">Backend Engine</strong>
            <p className="text-slate-400 text-[11px]">
              Python & FastAPI, Uvicorn, RESTful API endpoints, WebSocket gateway for real-time dispatch, JWT auth.
            </p>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
            <strong className="text-indigo-300 block font-mono">Database & GIS</strong>
            <p className="text-slate-400 text-[11px]">
              PostgreSQL with PostGIS extension for spatial queries, Haversine geospatial proximity indexing.
            </p>
          </div>
          <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
            <strong className="text-purple-300 block font-mono">AI & Reliability</strong>
            <p className="text-slate-400 text-[11px]">
              Bilingual rule-based & NLP triage engine, offline emergency caching, audit trail verification.
            </p>
          </div>
        </div>
      </div>

      {/* Project Repository & Links */}
      <div className="bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <h4 className="font-bold text-white font-mono text-sm">
            RESQ Bangladesh Open Source Codebase
          </h4>
          <p className="text-slate-400 text-xs mt-0.5">
            Academic software project developed at BGC Trust University Bangladesh.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://github.com/SayemSamir/SafeBangla"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold font-mono border border-slate-700 shadow-md transition-colors"
          >
            <Github className="w-4 h-4 text-cyan-400" />
            <span>View GitHub Repository</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
};