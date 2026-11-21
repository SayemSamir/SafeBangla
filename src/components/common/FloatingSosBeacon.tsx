import React from 'react';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, PhoneCall } from 'lucide-react';

export const FloatingSosBeacon: React.FC = () => {
  const { setSosModalOpen, sosModalOpen, t } = useApp();

  if (sosModalOpen) return null;

  return (
    /* Mobile-only compact one-hand thumb dock (desktop already has sticky 999 + SOS HELP in Navbar) */
    <div className="sm:hidden fixed bottom-3 right-3 z-40 flex items-center gap-2 pointer-events-auto">
      <a
        href="tel:999"
        className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-900/95 border border-red-500/50 text-red-200 text-xs font-mono font-bold shadow-xl flex items-center gap-1.5"
      >
        <PhoneCall className="w-4 h-4 text-red-400" />
        <span>999</span>
      </a>

      <button
        type="button"
        onClick={() => setSosModalOpen(true)}
        aria-label="One-tap Emergency SOS"
        className="min-h-[44px] flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs shadow-2xl border border-red-300/60 active:scale-95 transition-transform cursor-pointer"
      >
        <ShieldAlert className="w-4 h-4 text-white" />
        <span>{t('SOS HELP', 'এসওএস')}</span>
      </button>
    </div>
  );
};
