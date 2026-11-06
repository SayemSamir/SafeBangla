import React from 'react';
import { ProjectJourneyStage, JourneyStatus } from '../../types/team';
import {
  CheckCircle2,
  Clock,
  Code2,
  Layers,
  ArrowRight,
  Sparkles,
  Milestone
} from 'lucide-react';

interface ProjectJourneyViewProps {
  stages: ProjectJourneyStage[];
  t: (en: string, bn: string) => string;
}

export const ProjectJourneyView: React.FC<ProjectJourneyViewProps> = ({
  stages,
  t
}) => {
  const getStatusBadge = (status: JourneyStatus) => {
    switch (status) {
      case 'PRODUCTION_READY':
        return {
          label: 'Production Ready',
          style: 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
        };
      case 'TESTED':
        return {
          label: 'Tested & Verified',
          style: 'bg-teal-950/80 text-teal-300 border-teal-600/60'
        };
      case 'INTEGRATED':
        return {
          label: 'Integrated',
          style: 'bg-cyan-950/80 text-cyan-300 border-cyan-600/60'
        };
      case 'IN_DEVELOPMENT':
        return {
          label: 'In Development',
          style: 'bg-amber-950/80 text-amber-300 border-amber-600/60'
        };
      case 'PLANNED':
      default:
        return {
          label: 'Planned',
          style: 'bg-slate-800 text-slate-400 border-slate-700'
        };
    }
  };

  const completedCount = stages.filter(
    s => s.status === 'PRODUCTION_READY' || s.status === 'TESTED' || s.status === 'INTEGRATED'
  ).length;

  return (
    <div className="space-y-6 text-slate-200">
      {/* Header & Milestone Progress Bar */}
      <div className="bg-[#0F172A] border border-slate-800 p-6 rounded-2xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Milestone className="w-5 h-5 text-cyan-400" />
              <h2 className="text-xl font-bold text-white font-mono">
                {t('Project Journey & Development Roadmap', 'প্রজেক্ট অগ্রগতি ও ডেভেলপমেন্ট রোডম্যাপ')}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Phased development lifecycle for Software Development Project -1 (BGC Trust University Bangladesh).
            </p>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 font-mono text-xs text-cyan-300">
            {completedCount} of {stages.length} Milestones Active
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="space-y-1.5">
          <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-teal-400 transition-all duration-500"
              style={{ width: `${(completedCount / stages.length) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>Research & Architecture</span>
            <span>Core Implementation</span>
            <span>Final QA & Presentation</span>
          </div>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative pl-6 sm:pl-8 border-l-2 border-cyan-500/30 space-y-6 ml-3 sm:ml-4">
        {stages.map((stage) => {
          const badge = getStatusBadge(stage.status);

          return (
            <div key={stage.id} className="relative group">
              {/* Timeline marker icon */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-7 h-7 rounded-full bg-[#0B132B] border-2 border-cyan-500 flex items-center justify-center text-xs font-mono font-bold text-cyan-400 shadow-md">
                {stage.order}
              </div>

              {/* Card Container */}
              <div className="bg-[#0F172A] border border-slate-800 group-hover:border-cyan-500/40 rounded-2xl p-5 shadow-lg transition-all duration-300 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {stage.phaseLabel}
                    </span>
                    <h3 className="text-base font-bold text-white font-mono group-hover:text-cyan-300 transition-colors">
                      {stage.stageName}
                    </h3>
                  </div>

                  <span
                    className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border font-semibold ${badge.style}`}
                  >
                    {badge.label}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {stage.description}
                </p>

                {/* Key Deliverables */}
                <div className="pt-2 border-t border-slate-800/80">
                  <span className="block text-[10px] font-mono uppercase text-slate-400 mb-1.5 font-semibold">
                    {t('Key Technical Deliverables:', 'মূল টেকনিক্যাল ডেলিভারেবল:')}
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {stage.deliverables.map((deliv, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800/80 text-[11px] text-slate-300"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                        <span>{deliv}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
