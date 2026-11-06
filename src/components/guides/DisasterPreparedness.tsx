import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PREPAREDNESS_GUIDES } from '../../data/bangladeshData';
import {
  BookOpen,
  Wind,
  Waves,
  Flame,
  Activity,
  CheckCircle2,
  Package,
  Shield,
  Download,
  WifiOff
} from 'lucide-react';

export const DisasterPreparedness: React.FC = () => {
  const { language, t } = useApp();

  const [selectedGuideId, setSelectedGuideId] = useState<string>('GUIDE-CYC');
  const [activeStepTab, setActiveStepTab] = useState<'before' | 'during' | 'after' | 'kit'>('before');

  const currentGuide =
    PREPAREDNESS_GUIDES.find((g) => g.id === selectedGuideId) || PREPAREDNESS_GUIDES[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[#0F172A] p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-extrabold text-white font-mono">
              {t('NATIONAL DISASTER PREPAREDNESS & SAFETY PROTOCOLS', 'জাতীয় দুর্যোগ প্রস্তুতি ও জীবনরক্ষা নির্দেশিকা')}
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t(
              'Verified standard operating procedures by Ministry of Disaster Management, BMD, and BDRCS Cyclone Preparedness Programme.',
              'দুর্যোগ ব্যবস্থাপনা মন্ত্রণালয়, আবহাওয়া অধিদপ্তর ও রেড ক্রিসেন্টের প্রমিত নিরাপত্তা নির্দেশিকা।'
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-emerald-300 text-xs">
          <WifiOff className="w-4 h-4 text-emerald-400" />
          <span>{t('Cached 100% Offline in PWA', 'সম্পূর্ণ অফলাইনে পাঠযোগ্য')}</span>
        </div>
      </div>

      {/* Guide Type Selector */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {PREPAREDNESS_GUIDES.map((guide) => {
          const isSelected = guide.id === selectedGuideId;
          return (
            <button
              key={guide.id}
              onClick={() => setSelectedGuideId(guide.id)}
              className={`p-3.5 rounded-xl border text-left transition-all flex items-center gap-3 ${
                isSelected
                  ? 'bg-cyan-600/30 border-cyan-400 text-white shadow-lg shadow-cyan-950/50 ring-1 ring-cyan-500'
                  : 'bg-[#0F172A] border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-cyan-400">
                {guide.disasterType === 'Cyclone' && <Wind className="w-5 h-5" />}
                {guide.disasterType === 'Flood' && <Waves className="w-5 h-5" />}
                {guide.disasterType === 'Fire' && <Flame className="w-5 h-5" />}
                {guide.disasterType === 'Earthquake' && <Activity className="w-5 h-5" />}
              </div>
              <div>
                <strong className="block text-xs font-bold text-white font-mono">
                  {guide.disasterType}
                </strong>
                <span className="text-[11px] text-slate-400">
                  {guide.disasterType === 'Cyclone'
                    ? 'ঘূর্ণিঝড়'
                    : guide.disasterType === 'Flood'
                    ? 'বন্যা'
                    : guide.disasterType === 'Fire'
                    ? 'অগ্নিকাণ্ড'
                    : 'ভূমিকম্প'}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Guide Container */}
      <div className="bg-[#0F172A] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 font-mono">
              OFFICIAL DISASTER MANUAL • {currentGuide.disasterType.toUpperCase()}
            </span>
            <h3 className="text-lg md:text-xl font-bold text-white mt-0.5">
              {language === 'bn' ? currentGuide.titleBn : currentGuide.titleEn}
            </h3>
          </div>

          {/* Sub-steps switcher */}
          <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-bold">
            <button
              onClick={() => setActiveStepTab('before')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeStepTab === 'before' ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('1. Before (আগে)', '১. দুর্যোগের আগে')}
            </button>
            <button
              onClick={() => setActiveStepTab('during')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeStepTab === 'during' ? 'bg-amber-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('2. During (চলাকালীন)', '২. দুর্যোগ চলাকালীন')}
            </button>
            <button
              onClick={() => setActiveStepTab('after')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeStepTab === 'after' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('3. After (পরবর্তী)', '৩. দুর্যোগ পরবর্তী')}
            </button>
            <button
              onClick={() => setActiveStepTab('kit')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                activeStepTab === 'kit' ? 'bg-rose-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              {t('Emergency Kit (জরুরি কিট)', 'জরুরি কিট')}
            </button>
          </div>
        </div>

        {/* Content based on sub-step */}
        <div className="space-y-4">
          {activeStepTab === 'before' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider block">
                {t('Preparation & Early Warnings Action Plan', 'দুর্যোগের পূর্বপ্রস্তুতি ও সতর্কতা')}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentGuide.before.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 text-xs text-slate-200 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 flex items-center justify-center font-bold font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{step.en}</p>
                      <p className="text-slate-400 mt-1">{step.bn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStepTab === 'during' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
                {t('Immediate Life-Saving Actions During Impact', 'দুর্যোগ চলাকালীন জীবনরক্ষাকারী পদক্ষেপ')}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentGuide.during.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900/90 rounded-xl border border-amber-900/40 text-xs text-slate-200 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-amber-600/30 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{step.en}</p>
                      <p className="text-slate-400 mt-1">{step.bn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStepTab === 'after' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                {t('Post-Disaster Recovery & Disease Prevention', 'দুর্যোগ পরবর্তী পুনরুদ্ধার ও রোগ প্রতিরোধ')}
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentGuide.after.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-900/90 rounded-xl border border-emerald-900/40 text-xs text-slate-200 flex items-start gap-3"
                  >
                    <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold font-mono shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-medium text-white">{step.en}</p>
                      <p className="text-slate-400 mt-1">{step.bn}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStepTab === 'kit' && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-rose-300 uppercase tracking-wider block">
                {t('Essential Disaster Grab-and-Go Bag Checklist', 'জরুরি দুর্যোগ ব্যাগের মালামাল তালিকা')}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {currentGuide.emergencyKitList.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-900/90 rounded-xl border border-rose-900/40 text-xs text-slate-200 flex items-center gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-rose-400 shrink-0" />
                    <div>
                      <strong className="block text-white">{item.en}</strong>
                      <span className="text-slate-400 text-[11px]">{item.bn}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
