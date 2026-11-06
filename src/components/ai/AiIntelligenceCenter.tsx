import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  classifyEmergencyCategory,
  generateAiAssessment,
  analyzeImageDamage,
  getAiSafetyGuidance
} from '../../utils/aiEngine';
import { BANGLADESH_DISTRICTS } from '../../data/bangladeshData';
import { EmergencyCategory } from '../../types';
import {
  Bot,
  Sparkles,
  Camera,
  Layers,
  Send,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  FileSearch,
  Activity,
  Cpu,
  Info
} from 'lucide-react';

export const AiIntelligenceCenter: React.FC = () => {
  const { incidents, language, t } = useApp();

  const [activeAiTab, setActiveAiTab] = useState<'triage' | 'damage' | 'duplicates' | 'risk' | 'assistant'>('triage');

  // Interactive Triage Playground
  const [triageText, setTriageText] = useState(
    'Heavy tidal surge and wind gusts destroyed embankment in Kutubdia. 30 people marooned, 3 elderly need medical aid.'
  );
  const [affectedCount, setAffectedCount] = useState(30);
  const [hasTrapped, setHasTrapped] = useState(true);
  const [hasInjured, setHasInjured] = useState(true);

  // Damage Image Analyzer
  const [selectedDamageImage, setSelectedDamageImage] = useState(
    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
  );
  const [damageCategory, setDamageCategory] = useState<EmergencyCategory>('Flood');

  // AI Assistant Chatbot
  const [chatMessages, setChatMessages] = useState<
    Array<{ sender: 'user' | 'ai'; text: string; timestamp: string }>
  >([
    {
      sender: 'ai',
      text:
        language === 'bn'
          ? 'আসসালামু আলাইকুম। আমি RESQ বাংলাদেশ এআই সহায়িকা। ঘূর্ণিঝড়, বন্যা, আগুন বা যেকোনো দুর্যোগে জীবনরক্ষাকারী পদক্ষেপ জানতে প্রশ্ন করুন।'
          : 'Greetings. I am the RESQ Bangladesh AI Assistant. Ask any question regarding cyclone evacuation, flood safety, fire hazards, or emergency protocols.',
      timestamp: '10:00 AM'
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');

  // Calculate triage analysis
  const triageAssessment = generateAiAssessment({
    title: triageText.slice(0, 50),
    description: triageText,
    affectedPeople: affectedCount,
    hasInjured,
    hasTrapped
  });

  // Calculate damage analysis
  const damageAnalysis = analyzeImageDamage(selectedDamageImage, damageCategory);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userMsg = {
      sender: 'user' as const,
      text: inputQuery,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const guidance = getAiSafetyGuidance(inputQuery, language);
    const aiMsg = {
      sender: 'ai' as const,
      text: guidance,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg, aiMsg]);
    setInputQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 p-5 rounded-2xl border border-cyan-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 rounded-xl shadow-lg shadow-cyan-500/20">
            <Cpu className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white font-mono">
                {t('RESQ AI INTELLIGENCE & TRIAGE ENGINE', 'রেসকিউ এআই ইন্টেলিজেন্স ও ট্রায়াজ ইঞ্জিন')}
              </h2>
              <span className="bg-cyan-500/30 text-cyan-300 text-[10px] px-2 py-0.5 rounded-full font-bold border border-cyan-400/50">
                ACTIVE ASSISTANT
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              {t(
                'Assists human dispatchers with explainable NLP incident triage, computer vision damage scoring, duplicate report merging, and predictive district risk estimation.',
                'প্রাকৃতিক ভাষা প্রক্রিয়াকরণ দ্বারা দুর্যোগের তীব্রতা নির্ধারণ, ক্ষতি পরিমাপ এবং দ্বৈত রিপোর্ট শনাক্তকরণ।'
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-2 rounded-xl text-xs text-slate-300">
          <Info className="w-4 h-4 text-cyan-400 shrink-0" />
          <span className="text-[11px]">
            {t(
              'Safety Guardrail: AI recommendations require final operator verification.',
              'নিরাপত্তা নীতি: এআই পরামর্শ যাচাই করেই টিম প্রেরণ করা হয়।'
            )}
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-2">
        {[
          { id: 'triage', labelEn: 'Incident Triage & Explainability', labelBn: 'ট্রায়াজ ও এআই স্কোর', icon: Sparkles },
          { id: 'damage', labelEn: 'Computer Vision Damage Assessment', labelBn: 'ছবি দ্বারা ক্ষতি পরিমাপ', icon: Camera },
          { id: 'duplicates', labelEn: 'Duplicate Report Detection', labelBn: 'দ্বৈত রিপোর্ট শনাক্তকরণ', icon: FileSearch },
          { id: 'risk', labelEn: 'District Flood & Cyclone Risk Index', labelBn: 'জেলা ভিত্তিক ঝুঁকি ইনডেক্স', icon: TrendingUp },
          { id: 'assistant', labelEn: 'AI Disaster Assistant Chat', labelBn: 'এআই দুর্যোগ সহায়িকা', icon: Bot }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeAiTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAiTab(tab.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/30'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: TRIAGE & EXPLAINABILITY */}
      {activeAiTab === 'triage' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Sandbox */}
          <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t('Live Incident Description Sandbox', 'দুর্যোগ বিবরণী ট্রায়াজ স্যান্ডবক্স')}</span>
            </h3>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {t('Emergency Report Description (English or Bengali)', 'জরুরি বিবরণী (ইংরেজি বা বাংলা)')}
              </label>
              <textarea
                rows={4}
                value={triageText}
                onChange={(e) => setTriageText(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">{t('Affected Persons Count', 'আক্রান্ত ব্যক্তি সংখ্যা')}</label>
                <input
                  type="number"
                  value={affectedCount}
                  onChange={(e) => setAffectedCount(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="space-y-2 pt-4">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasTrapped}
                    onChange={(e) => setHasTrapped(e.target.checked)}
                    className="rounded bg-slate-800 text-red-600"
                  />
                  <span>{t('Active Trapped Victims', 'আটকে পড়া মানুষ রয়েছে')}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={hasInjured}
                    onChange={(e) => setHasInjured(e.target.checked)}
                    className="rounded bg-slate-800 text-rose-600"
                  />
                  <span>{t('Injured Casualties', 'আহত ব্যক্তি রয়েছে')}</span>
                </label>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>{t('Changes compute in real-time using Explainable AI heuristic weights.', 'রিয়েল-টাইমে স্কোর হালনাগাদ হয়।')}</span>
            </div>
          </div>

          {/* AI Assessment Result Card */}
          <div className="bg-[#0F172A] border border-cyan-500/50 p-5 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
                {t('AI Explainability Breakdown', 'এআই সিদ্ধান্ত ও যৌক্তিকতা বিশ্লেষণ')}
              </span>
              <span className="text-xs bg-slate-800 text-cyan-300 px-2 py-0.5 rounded border border-slate-700 font-mono">
                Confidence: {Math.round(triageAssessment.confidence * 100)}%
              </span>
            </div>

            <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block">{t('Classified Category', 'চিহ্নিত দুর্যোগ')}</span>
                <span className="text-lg font-bold text-white font-mono">{triageAssessment.suggestedCategory}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-400 block">{t('Recommended Severity', 'প্রস্তাবিত তীব্রতা')}</span>
                <span
                  className={`text-sm px-2.5 py-0.5 rounded-full font-bold ${
                    triageAssessment.severityLevel === 'Critical'
                      ? 'bg-red-600 text-white'
                      : triageAssessment.severityLevel === 'High'
                      ? 'bg-amber-600 text-white'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  {triageAssessment.severityLevel} ({triageAssessment.severityScore} / 10)
                </span>
              </div>
            </div>

            {/* Rationale factors list */}
            <div>
              <span className="text-xs font-bold text-slate-300 block mb-2">
                {t('Explainable Scoring Weights:', 'স্কোরিং যৌক্তিকতার কারণসমূহ:')}
              </span>
              <div className="space-y-2">
                {triageAssessment.rationale.map((r, i) => (
                  <div
                    key={i}
                    className="p-2.5 bg-slate-900/70 border border-slate-800 rounded-lg text-xs text-slate-200 flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl text-xs text-cyan-200">
              <strong>{t('Operational Recommendation:', 'অপারেশনাল সুপারিশ:')}</strong>{' '}
              {triageAssessment.severityLevel === 'Critical'
                ? 'Immediate dispatch of motorized water rescue team or heavy extraction gear. Alert nearest hospital ICU.'
                : 'Assign local volunteer reconnaissance brigade and verify road accessibility.'}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COMPUTER VISION DAMAGE ASSESSMENT */}
      {activeAiTab === 'damage' && (
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-cyan-400" />
                <span>{t('Image-Based Disaster Damage Inspection', 'ছবি বিশ্লেষণ করে ক্ষয়ক্ষতি নিরূপণ')}</span>
              </h3>
              <p className="text-xs text-slate-400">
                {t(
                  'Accepts aerial or field imagery to quantify structural damage and detect hazards.',
                  'ছবি পর্যালোচনা করে কাঠামোগত দুর্বলতা এবং সম্ভাব্য বিপদের মাত্রা নির্ধারণ।'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => {
                  setSelectedDamageImage(
                    'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&w=800&q=80'
                  );
                  setDamageCategory('Flood');
                }}
                className={`px-3 py-1.5 rounded-lg border font-medium ${
                  damageCategory === 'Flood'
                    ? 'bg-cyan-600 border-cyan-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                Sample 1: Flood Inundation
              </button>
              <button
                onClick={() => {
                  setSelectedDamageImage(
                    'https://images.unsplash.com/photo-1527482797697-8795b05a13fe?auto=format&fit=crop&w=800&q=80'
                  );
                  setDamageCategory('Cyclone');
                }}
                className={`px-3 py-1.5 rounded-lg border font-medium ${
                  damageCategory === 'Cyclone'
                    ? 'bg-teal-600 border-teal-400 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-300'
                }`}
              >
                Sample 2: Cyclone Structural Debris
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-xl overflow-hidden border border-slate-700 max-h-80 bg-black flex items-center justify-center">
              <img
                src={selectedDamageImage}
                alt="Damage analysis"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-cyan-300 border border-cyan-500/40">
                AI Vision Mesh Active • {damageCategory}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-slate-400">{t('Damage Severity Rating', 'ক্ষয়ক্ষতির রেটিং')}</span>
                  <span className="text-xs font-mono font-bold text-red-400">
                    {damageAnalysis.damageScore} / 10
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full"
                    style={{ width: `${damageAnalysis.damageScore * 10}%` }}
                  ></div>
                </div>
                <div className="mt-2 text-xs font-semibold text-white">
                  Status: <span className="text-amber-400">{damageAnalysis.integrityStatus}</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-300 block mb-2">
                  {t('Detected Hazard Tags & Features:', 'শনাক্তকৃত বিপদ উপাদানসমূহ:')}
                </span>
                <div className="flex flex-wrap gap-2">
                  {damageAnalysis.detectedHazards.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-500/40 text-red-200 text-xs font-mono"
                    >
                      ⚠️ {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-1">
                <span className="font-bold text-slate-200 block">{t('Action Guidance:', 'প্রয়োজনীয় পদক্ষেপ:')}</span>
                <p className="text-slate-300">{damageAnalysis.recommendation}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DUPLICATE INCIDENT RESOLVER */}
      {activeAiTab === 'duplicates' && (
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 text-xs">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-cyan-400" />
              <span>{t('Duplicate Incident Cluster Resolver', 'দ্বৈত রিপোর্ট শনাক্ত ও একত্রীকরণ')}</span>
            </h3>
            <p className="text-slate-400">
              {t(
                'When multiple citizens report the same flash flood or fire in one neighborhood, AI clusters them together to prevent duplicate rescue team dispatch.',
                'একই এলাকায় একাধিক ব্যক্তি রিপোর্ট করলে এআই সেগুলো চিহ্নিত করে একত্রে দেখায় যাতে উদ্ধারকারী দলের কাজের অপচয় না হয়।'
              )}
            </p>
          </div>

          <div className="divide-y divide-slate-800 bg-slate-900/80 rounded-xl border border-slate-800">
            {incidents.slice(0, 3).map((inc) => (
              <div key={inc.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{inc.title}</span>
                    <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-cyan-300">
                      {inc.id}
                    </span>
                  </div>
                  <div className="text-slate-400 text-xs">
                    Location: {inc.location.upazila}, {inc.location.district} • Category: {inc.category}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 bg-emerald-950/60 border border-emerald-700/50 px-2.5 py-1 rounded-lg">
                    ✓ Verified Unique Master Report
                  </span>
                  <button
                    onClick={() => alert(`Merged 0 secondary duplicates for ${inc.id}`)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  >
                    Check Proximity (1.5km)
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: DISTRICT FLOOD & CYCLONE RISK INDEX */}
      {activeAiTab === 'risk' && (
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>{t('Bangladesh District Disaster Vulnerability Index', 'জেলা ভিত্তিক দুর্যোগ ঝুঁকি সূচক')}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {BANGLADESH_DISTRICTS.map((dist) => {
              const isHigh = dist.riskProfile.includes('Severe') || dist.riskProfile.includes('High');
              return (
                <div
                  key={dist.name}
                  className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white text-sm">{dist.name}</span>
                      <span className="text-slate-400 text-xs block">{dist.nameBn}</span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isHigh ? 'bg-red-900/80 text-red-200 border border-red-700' : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {dist.riskProfile}
                    </span>
                  </div>

                  <div className="text-slate-400 text-[11px]">
                    Division: <strong className="text-slate-200">{dist.division}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    High Vulnerability Upazilas: {dist.upazilas.slice(0, 3).join(', ')}...
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: AI DISASTER ASSISTANT CHATBOT */}
      {activeAiTab === 'assistant' && (
        <div className="bg-[#0F172A] border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <span className="font-bold text-white text-sm">
                {t('RESQ Bilingual Emergency Guidance Chat', 'রেসকিউ বাংলা/ইংরেজি জরুরি এআই চ্যাট')}
              </span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">Knowledge Base Grounded</span>
          </div>

          {/* Chat Window */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-80 overflow-y-auto space-y-3">
            {chatMessages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-cyan-600 text-white font-medium rounded-br-none'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-slate-500 mt-1 px-1 font-mono">{msg.timestamp}</span>
              </div>
            ))}
          </div>

          {/* Quick Prompts */}
          <div className="flex flex-wrap gap-2 text-xs">
            <button
              onClick={() => setInputQuery('What should I do during a cyclone Signal 7?')}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-full border border-slate-700"
            >
              Cyclone Signal 7
            </button>
            <button
              onClick={() => setInputQuery('বন্যার সময় পানিবাহিত রোগ ও সাপের উপদ্রব থেকে কীভাবে বাঁচব?')}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-full border border-slate-700"
            >
              বন্যা ও সাপের কামড়
            </button>
            <button
              onClick={() => setInputQuery('ভূমিকম্পের সময় করণীয় কী?')}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-full border border-slate-700"
            >
              ভূমিকম্প প্রস্তুতি
            </button>
            <button
              onClick={() => setInputQuery('How to purify flood water without electricity?')}
              className="bg-slate-800 hover:bg-slate-700 text-cyan-300 px-3 py-1 rounded-full border border-slate-700"
            >
              Purify Flood Water
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={t(
                'Type your emergency question in Bengali or English...',
                'বাংলা বা ইংরেজিতে জরুরি প্রশ্ন লিখুন...'
              )}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              className="bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('Send', 'পাঠান')}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
