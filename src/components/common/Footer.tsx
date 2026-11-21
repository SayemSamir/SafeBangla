import React from 'react';
import { useApp } from '../../context/AppContext';
import { Flame, PhoneCall, ShieldCheck, ExternalLink, WifiOff } from 'lucide-react';
import { EMERGENCY_HOTLINES } from '../../data/bangladeshData';

export const Footer: React.FC = () => {
  const { setActiveTab, language, t } = useApp();

  return (
    <footer className="mt-16 bg-[#070D1E] border-t border-slate-800 text-slate-300 text-xs pb-16 sm:pb-0">
      {/* Verified Official Bangladesh Hotlines */}
      <div className="bg-[#050A17] border-b border-slate-800/80 py-6 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {EMERGENCY_HOTLINES.map((h) => (
            <a
              key={h.number}
              href={`tel:${h.number}`}
              className="p-3 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 rounded-xl transition-colors group block"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-white font-mono group-hover:text-cyan-400 transition-colors">
                  {h.number}
                </span>
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
              </div>
              <strong className="block text-[11px] text-slate-200 mt-1 line-clamp-1">
                {language === 'bn' ? h.titleBn : h.titleEn}
              </strong>
              <span className="text-[10px] text-slate-400 block line-clamp-1 mt-0.5">
                {language === 'bn' ? h.descBn : h.descEn}
              </span>
            </a>
          ))}
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 text-white font-bold">
              <Flame className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-lg text-white font-mono">RESQ BANGLADESH</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            {t(
              'Connecting People, Saving Lives During Emergencies. Community and responder coordination for floods, cyclones, fires, and medical crises.',
              'মানুষের পাশে, দুর্যোগের প্রতিটি মুহূর্তে জীবনরক্ষায় নিবেদিত বাংলাদেশের স্মার্ট জরুরি সাড়া প্ল্যাটফর্ম।'
            )}
          </p>
          <div className="pt-1 text-[11px] text-slate-400 flex items-start gap-1.5">
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <span>
              {t(
                'RESQ complements official Bangladesh emergency services (999 / 1090); it is not an official government dispatch replacement.',
                'RESQ সরকারি জরুরি সেবা (৯৯৯ / ১০৯০)-এর সহায়ক মাধ্যম; বিকল্প নয়।'
              )}
            </span>
          </div>
        </div>

        {/* Quick Nav */}
        <div className="space-y-2">
          <span className="font-bold uppercase tracking-wider block mb-2 font-mono text-[11px] text-cyan-400">
            {t('Quick Access', 'মূল বিভাগসমূহ')}
          </span>
          <ul className="space-y-2 text-slate-400">
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('map')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {t('Live Bangladesh GIS Map', 'লাইভ বাংলাদেশ জিআইএস ম্যাপ')}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('track')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {t('Track Guest Emergency (ID + Code)', 'জরুরি অবস্থা ট্র্যাক করুন')}
              </button>
            </li>
            <li>
              <button
                type="button"
                onClick={() => setActiveTab('operations')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                {t('Rescue Operations Dispatch Board', 'উদ্ধার অভিযান কমান্ড বোর্ড')}
              </button>
            </li>
            <li className="pt-1 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('team')}
                className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors cursor-pointer"
              >
                {t('Meet Our Team & SDP Docs', 'আমাদের টিম ও প্রজেক্ট ডক্স')}
              </button>
            </li>
          </ul>
        </div>

        {/* Official Agencies */}
        <div className="space-y-2">
          <span className="font-bold uppercase tracking-wider block mb-2 font-mono text-[11px] text-cyan-400">
            {t('Official Reference Agencies', 'সরকারি ও মানবিক সংস্থা')}
          </span>
          <ul className="space-y-1.5 text-slate-400 text-xs">
            <li>
              <a
                href="https://modmr.gov.bd"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1"
              >
                <span>Ministry of Disaster Management & Relief</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="https://bmd.gov.bd"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1"
              >
                <span>Bangladesh Meteorological Department (BMD)</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="http://ffwc.gov.bd"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1"
              >
                <span>Flood Forecasting & Warning Centre (FFWC)</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="https://fireservice.gov.bd"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1"
              >
                <span>Fire Service and Civil Defence (FSCD)</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
            <li>
              <a
                href="https://bdrcs.org"
                target="_blank"
                rel="noreferrer"
                className="hover:text-white flex items-center gap-1"
              >
                <span>Bangladesh Red Crescent Society (BDRCS)</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </li>
          </ul>
        </div>

        {/* Offline Disclaimer Notice */}
        <div className="space-y-2">
          <span className="font-bold uppercase tracking-wider block mb-2 font-mono text-[11px] text-amber-400 flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5" />
            {t('Offline Limitations & Safety', 'অফলাইন নীতিমালা ও সুরক্ষা')}
          </span>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            {t(
              'A web browser cannot transmit SOS alerts without mobile data or Wi-Fi. When offline, your report is saved on your device and queued for sync once connectivity returns. In immediate life-threatening emergencies, always call 999.',
              'ইন্টারনেট সংযোগ ছাড়া ব্রাউজার থেকে এসওএস পাঠানো সম্ভব নয়। অফলাইন থাকলে রিপোর্ট আপনার ডিভাইসে সংরক্ষিত থাকবে এবং নেটওয়ার্ক ফিরলে পাঠানো হবে। তাৎক্ষণিক বিপদে ৯৯৯ কল করুন।'
            )}
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800/80 px-4 py-4 text-center text-slate-500 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            &copy; {new Date().getFullYear()} RESQ Bangladesh • BGC Trust University Bangladesh (CSE SDP).
          </span>
          <span className="font-mono text-slate-400">
            Demo & Seed Records Clearly Labeled • Real GPS Browser Geolocation
          </span>
        </div>
      </div>
    </footer>
  );
};
