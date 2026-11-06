import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  Flame,
  MapPin,
  Bot,
  Package,
  Building2,
  BookOpen,
  PhoneCall,
  Activity,
  HeartHandshake,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Radio,
  Users,
  Compass,
  Sparkles
} from 'lucide-react';

export const HeroSection: React.FC = () => {
  const {
    incidents,
    rescueTeams,
    shelters,
    setActiveTab,
    setSosModalOpen,
    setMarkSafeModalOpen,
    language,
    t
  } = useApp();

  const totalAffected = incidents.reduce((sum, i) => sum + i.affectedPeople, 0);
  const totalOccupancy = shelters.reduce((sum, s) => sum + s.currentOccupancy, 0);
  const activeMissions = incidents.filter(
    (i) => i.status === 'ASSIGNED' || i.status === 'IN_PROGRESS'
  ).length;

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#0F1E3D] via-[#0B132B] to-[#070D1E] border border-cyan-500/30 shadow-2xl p-6 sm:p-10 lg:p-14">
        {/* Subtle grid background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold backdrop-blur-md">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
            </span>
            <span>
              {t(
                'AI-Powered Smart Disaster & Emergency Response System for Bangladesh',
                'বাংলাদেশের প্রথম কৃত্রিম বুদ্ধিমত্তা চালিত সমন্বিত জরুরি দুর্যোগ সাড়া ব্যবস্থাপনা'
              )}
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            <span>RESQ BANGLADESH</span>
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 mt-2 font-mono text-2xl sm:text-4xl lg:text-5xl">
              {t(
                'Connecting People, Saving Lives During Emergencies',
                'মানুষের পাশে, দুর্যোগের প্রতিটি মুহূর্তে জীবনরক্ষায়'
              )}
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t(
              'A unified national emergency coordination platform connecting citizens, volunteers, Fire Service & Civil Defence, Red Crescent CPP, hospitals, and disaster operators with real-time GIS mapping and explainable AI triage.',
              'ঘূর্ণিঝড়, বন্যা, পাহাড়ি ঢল ও অগ্নিকাণ্ডে ক্ষতিগ্রস্ত নাগরিক, উদ্ধারকারী দল, হাসপাতাল ও প্রশাসনের মধ্যে তাৎক্ষণিক যোগাযোগ ও জীবনরক্ষাকারী সমন্বয়।'
            )}
          </p>

          {/* Main Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            {/* Primary SOS Button */}
            <button
              onClick={() => setSosModalOpen(true)}
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-extrabold text-base shadow-2xl shadow-red-600/50 border border-red-400/60 flex items-center justify-center gap-3 animate-emergency-pulse transition-colors"
            >
              <ShieldAlert className="w-6 h-6 text-white" />
              <span className="tracking-wider font-mono">
                {t('ONE-TAP EMERGENCY SOS', 'জরুরি এসওএস পাঠান')}
              </span>
            </button>

            {/* Live Map CTA */}
            <button
              onClick={() => setActiveTab('map')}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-white font-bold text-sm border border-cyan-500/40 flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>{t('Explore Live GIS Map', 'লাইভ বাংলাদেশ ম্যাপ দেখুন')}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            {/* Mark Safe CTA */}
            <button
              onClick={() => setMarkSafeModalOpen(true)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 hover:text-emerald-200 font-bold text-sm border border-emerald-500/40 flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
              <span>{t('Mark Myself Safe', 'নিরাপদ আছি জানান')}</span>
            </button>
          </div>

          {/* Verified Emergency Hotlines Callout */}
          <div className="pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-300">
            <span className="text-slate-400 uppercase tracking-wider font-sans font-semibold">
              {t('24/7 Verified Toll-Free Hotlines:', 'জরুরি সরকারি হেল্পলাইন:')}
            </span>
            <div className="flex items-center gap-2">
              <span className="bg-red-500/20 text-red-300 border border-red-500/40 px-2.5 py-1 rounded-lg font-bold">
                🚨 999 (National Emergency)
              </span>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-2.5 py-1 rounded-lg font-bold">
                🌀 1090 (Disaster Alert IVR)
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-lg font-bold">
                📦 333 (Relief & Public Help)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Crisis Operations Counter Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>ACTIVE INCIDENTS</span>
            <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>
          <div className="text-3xl font-black text-white font-mono">{incidents.length}</div>
          <p className="text-[11px] text-slate-400">
            {incidents.filter((i) => i.severity === 'Critical').length} Critical emergencies logged
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>DEPLOYED UNITS</span>
            <ShieldAlert className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-blue-400 font-mono">
            {activeMissions} Units
          </div>
          <p className="text-[11px] text-slate-400">
            FSCD Swiftwater & Red Crescent CPP
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>SAFE IN SHELTERS</span>
            <Building2 className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-black text-teal-300 font-mono">
            {totalOccupancy.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-400">
            Across {shelters.length} multi-purpose centers
          </p>
        </div>

        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono">
            <span>AVERAGE DISPATCH</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono">11.4 min</div>
          <p className="text-[11px] text-slate-400">
            Average time to field dispatch
          </p>
        </div>
      </div>

      {/* Core Platform Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {t('Comprehensive Disaster Response Ecosystem', 'সম্পূর্ণ জরুরি সাড়া ব্যবস্থাপনা ইকোসিস্টেম')}
            </h2>
            <p className="text-xs text-slate-400">
              {t(
                'Engineered for maximum reliability during network breakdown, severe weather, and mass casualty crises.',
                'দুর্যোগকালীন নেটওয়ার্ক বিচ্ছিন্নতা ও চরম পরিস্থিতিতে নিরবচ্ছিন্ন কার্যক্রম পরিচালনার নিশ্চয়তা।'
              )}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. GIS Mapping */}
          <div
            onClick={() => setActiveTab('map')}
            className="group bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <MapPin className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {t('Interactive GIS & Risk Layers', 'ইন্টারেক্টিভ জিআইএস ও ঝুঁকিপূর্ণ জোন')}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t(
                'Real-time visualization of flood zones, cyclone shelter occupancy, emergency hospitals, and rescue teams across all 64 districts.',
                'দেশের ৬৪ জেলার বন্যা প্লাবন এলাকা, সাইক্লোন আশ্রয়কেন্দ্রের ধারণক্ষমতা ও ফিল্ড রেসকিউ টিমের রিয়েল-টাইম অবস্থান।'
              )}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-400 font-semibold">
              <span>{t('Launch Live Map', 'ম্যাপ ওপেন করুন')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 2. AI Intelligence */}
          <div
            onClick={() => setActiveTab('ai-center')}
            className="group bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-xl bg-teal-600/20 text-teal-400 border border-teal-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors">
              {t('AI Triage & Computer Vision', 'এআই ট্রায়াজ ও ক্ষয়ক্ষতি নিরূপণ')}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t(
                'Explainable priority scoring (1-10) for incident text in English and Bengali, duplicate detection, and structural image assessment.',
                'ইংরেজি ও বাংলায় প্রাপ্ত রিপোর্টের তীব্রতা স্কোরিং, দ্বৈত রিপোর্ট শনাক্তকরণ এবং কৃত্রিম বুদ্ধিমত্তা দিয়ে ক্ষতি নিরূপণ।'
              )}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-teal-400 font-semibold">
              <span>{t('Explore AI Engine', 'এআই ইঞ্জিন দেখুন')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 3. Rescue Operations */}
          <div
            onClick={() => setActiveTab('operations')}
            className="group bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors">
              {t('Rescue Operations & Dispatch', 'উদ্ধার অভিযান ও দল সমন্বয়')}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t(
                'Lifecycle tracking from PENDING verification to team assignment, swiftwater boat dispatch, and completed evacuation reports.',
                'ঘটনা যাচাই থেকে শুরু করে টিম নিয়োজিত করা, বোট প্রেরণ এবং উদ্ধার সমাপ্তির পুরো জীবনচক্র ব্যবস্থাপনা।'
              )}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-400 font-semibold">
              <span>{t('Open Command Board', 'কমান্ড বোর্ড দেখুন')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 4. Hospitals & Shelters */}
          <div
            onClick={() => setActiveTab('medical')}
            className="group bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
              {t('Hospitals & Shelter Directory', 'হাসপাতাল ও সাইক্লোন শেল্টার')}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t(
                'Real-time available ICU and general beds, 24/7 ER numbers, drinking water, and female safe spaces across evacuation centers.',
                'আইসিইউ বেড সংখ্যা, জরুরি বিভাগ, সুপেয় খাবার পানি এবং আশ্রয়কেন্দ্রে নারীদের নিরাপদ স্থানের সুবিধা ট্র্যাক করুন।'
              )}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
              <span>{t('Browse Facilities', 'তালিকা দেখুন')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 5. Relief & Supplies */}
          <div
            onClick={() => setActiveTab('relief')}
            className="group bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Package className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors">
              {t('Relief Warehouses & Supplies', 'ত্রাণ সামগ্রী ও লজিস্টিকস')}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t(
                'Transparent warehouse inventory for drinking water, emergency food, water purification tablets, and citizen donation pledges.',
                'খাবার পানি, শুকনো খাবার, পানি বিশুদ্ধকরণ ট্যাবলেট এবং নাগরিক অনুদানের স্বচ্ছ হিসাব নিকাশ।'
              )}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-400 font-semibold">
              <span>{t('View Stockpile', 'মজুদ দেখুন')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* 6. Offline Safety Guides */}
          <div
            onClick={() => setActiveTab('guides')}
            className="group bg-[#0F172A] border border-slate-800 hover:border-cyan-500/50 p-6 rounded-2xl shadow-xl cursor-pointer transition-all hover:scale-[1.01]"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
              {t('Offline Safety Guides & Manuals', 'অফলাইন নিরাপত্তা গাইড')}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {t(
                'Official MoDMR/BMD action guides for Cyclone, Flood, Fire, and Earthquake stored locally for zero-internet access.',
                'ঘূর্ণিঝড়, বন্যা, আগুন ও ভূমিকম্পে জীবনরক্ষাকারী সরকারি নির্দেশিকা, যা ইন্টারনেট ছাড়াও পড়া যায়।'
              )}
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-400 font-semibold">
              <span>{t('Read Survival Manuals', 'নির্দেশিকা পড়ুন')}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
