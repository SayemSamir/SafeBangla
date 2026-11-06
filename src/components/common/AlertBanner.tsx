import React from 'react';
import { useApp } from '../../context/AppContext';
import { AlertTriangle, Radio, ShieldAlert } from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { alerts, language, t } = useApp();
  const activeAlerts = alerts.filter((a) => a.isBroadcasting);

  if (activeAlerts.length === 0) return null;

  const currentAlert = activeAlerts[0];

  return (
    <div className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-amber-950/90 border-b border-red-500/40 text-white px-3 sm:px-4 py-2 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <div className="flex flex-wrap items-center gap-1.5 font-semibold tracking-wide text-red-200">
            <span className="bg-red-800/80 text-red-100 text-[10px] px-2 py-0.2 rounded font-mono uppercase tracking-wider border border-red-600/50">
              {currentAlert.warningLevel}
            </span>
            <span className="text-white font-bold text-xs sm:text-sm">
              {language === 'bn' ? currentAlert.titleBn : currentAlert.titleEn}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs md:text-sm text-slate-200">
          <span className="hidden lg:inline text-red-200/90 italic">
            {language === 'bn' ? currentAlert.instructionsBn : currentAlert.instructionsEn}
          </span>
          <div className="flex items-center gap-2 bg-black/40 px-2.5 py-1 rounded border border-red-500/30 text-amber-300 font-mono text-xs">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {t('Districts:', 'উপকূলীয় জেলাসমূহ:')}{' '}
              {currentAlert.affectedDistricts.slice(0, 4).join(', ')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
