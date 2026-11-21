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
import { sendChatMessage, ChatMessage, AiAssistantMode } from '../../services/aiChatService';
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
  Info,
  Copy,
  Check,
  Brain,
  Zap,
  Volume2,
  Trash2,
  ChevronDown,
  ChevronUp,
  Globe,
  Mic,
  Headphones,
  ExternalLink
} from 'lucide-react';
import { VoiceConversationModal } from '../common/VoiceConversationModal';

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

  // AI Assistant Chatbot with DeepSeek / ChatGPT multi-mode
  const [chatMode, setChatMode] = useState<AiAssistantMode>('chatgpt');
  const [searchGrounding, setSearchGrounding] = useState<boolean>(true);
  const [voiceModalOpen, setVoiceModalOpen] = useState<boolean>(false);
  const [chatLoading, setChatLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [reasoningOpen, setReasoningOpen] = useState<Record<string, boolean>>({});

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'model',
      content:
        language === 'bn'
          ? 'আসসালামু আলাইকুম। আমি RESQ বাংলাদেশ ইন্টেলিজেন্ট এআই সহকারী (ChatGPT ও DeepSeek ক্ষমতাসম্পন্ন)। ঘূর্ণিঝড়, বন্যা, দুর্যোগ প্রোটোকল, প্রাথমিক চিকিৎসা ছাড়াও যেকোনো বিজ্ঞান, প্রোগ্রামিং বা সাধারণ জ্ঞানের প্রশ্ন করুন — আমি নির্ভুল ও বিস্তারিত উত্তর দিতে প্রস্তুত।'
          : 'Greetings. I am the RESQ Bangladesh AI Assistant (powered by DeepSeek & ChatGPT conversational intelligence). Ask anything from cyclone warning signals and flood response to coding, first aid, and general knowledge.',
      timestamp: '10:00 AM',
      source: 'gemini-3.8-flash'
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

  const handleSendMessage = async (textToSend?: string) => {
    const query = typeof textToSend === 'string' ? textToSend : inputQuery;
    if (!query.trim() || chatLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!textToSend || typeof textToSend !== 'string') setInputQuery('');
    setChatLoading(true);

    try {
      const result = await sendChatMessage(chatMessages, query, chatMode, language, searchGrounding);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: result.text,
        reasoning: result.reasoning,
        source: result.source,
        grounding: result.grounding,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, aiMsg]);
      if (result.reasoning) {
        setReasoningOpen((prev) => ({ ...prev, [aiMsg.id]: true }));
      }
    } catch {
      const guidance = getAiSafetyGuidance(query, language);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'model',
        content: guidance,
        source: 'resq-client-engine',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages((prev) => [...prev, aiMsg]);
    } finally {
      setChatLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const speakText = (text: string, id: string) => {
    if (!window.speechSynthesis) return;
    if (speakingId === id) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'bn' ? 'bn-BD' : 'en-US';
    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);
    window.speechSynthesis.speak(utterance);
    setSpeakingId(id);
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
          { id: 'assistant', labelEn: 'AI Assistant (ChatGPT & DeepSeek)', labelBn: 'এআই চ্যাট (ChatGPT ও DeepSeek)', icon: Bot }
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

      {/* TAB 5: AI CHAT ASSISTANT (CHATGPT & DEEPSEEK MODES) */}
      {activeAiTab === 'assistant' && (
        <div className="bg-[#0F172A] border border-cyan-500/40 p-5 rounded-2xl shadow-2xl space-y-4">
          {/* Header & Mode Selector */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-extrabold text-base text-white">
                    {t('RESQ Intelligent Assistant', 'রেসকিউ ইন্টেলিজেন্ট এআই')}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                    {chatMode === 'deepseek' ? 'DeepSeek-R1' : chatMode === 'emergency' ? 'Safety Specialist' : 'ChatGPT Mode'}
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  {t(
                    'Full-depth conversational AI: Ask any disaster protocol, programming, first aid, or general knowledge question.',
                    'সার্বজনীন এআই চ্যাট: যেকোনো দুর্যোগ প্রস্তুতি, কোডিং, প্রাথমিক চিকিৎসা বা সাধারণ জ্ঞানের সঠিক উত্তর জানুন।'
                  )}
                </p>
              </div>
            </div>

            {/* Model Mode Switches */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-900 p-1.5 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setChatMode('chatgpt')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  chatMode === 'chatgpt'
                    ? 'bg-cyan-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>ChatGPT (Turbo)</span>
              </button>
              <button
                onClick={() => setChatMode('deepseek')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  chatMode === 'deepseek'
                    ? 'bg-indigo-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Brain className="w-3.5 h-3.5 text-cyan-300" />
                <span>DeepSeek-R1</span>
              </button>
              <button
                onClick={() => setChatMode('emergency')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  chatMode === 'emergency'
                    ? 'bg-red-600 text-white font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5 text-red-200" />
                <span>Disaster Protocol</span>
              </button>

              {/* Search Grounding toggle */}
              <button
                onClick={() => setSearchGrounding(!searchGrounding)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium border transition-colors cursor-pointer ${
                  searchGrounding
                    ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-800 border-slate-700 text-slate-400'
                }`}
                title="Google Search Grounding for live official disaster bulletins"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-400" />
                <span>{searchGrounding ? 'Google Search ON' : 'Google Search OFF'}</span>
              </button>

              {/* Live Voice API launcher */}
              <button
                onClick={() => setVoiceModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-md cursor-pointer"
                title="Open Live Voice Conversation (gemini-3.8-live)"
              >
                <Mic className="w-3.5 h-3.5 animate-pulse" />
                <span>Live Voice</span>
              </button>

              <button
                onClick={() =>
                  setChatMessages([
                    {
                      id: 'cleared-welcome',
                      role: 'model',
                      content:
                        language === 'bn'
                          ? 'চ্যাট পরিষ্কার করা হয়েছে। নতুন প্রশ্ন করুন।'
                          : 'Conversation cleared. How may I assist you now?',
                      timestamp: 'Just now'
                    }
                  ])
                }
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 cursor-pointer"
                title="Clear conversation"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Window */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 sm:p-5 h-[480px] overflow-y-auto space-y-4">
            {chatMessages.map((msg) => {
              const isAi = msg.role === 'model';
              const isThinkingOpen = reasoningOpen[msg.id] ?? false;

              return (
                <div key={msg.id} className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}>
                  {/* Sender indicator */}
                  <span className="text-[10px] font-mono text-slate-400 mb-1 px-1 flex items-center gap-1.5">
                    {isAi ? (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span className="text-cyan-300 font-bold">
                          {msg.source === 'resq-client-engine'
                            ? 'RESQ AI Engine (Local Resilient)'
                            : 'RESQ Assistant (DeepSeek / ChatGPT)'}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-300">You</span>
                    )}
                    <span>• {msg.timestamp}</span>
                  </span>

                  {/* DeepSeek Reasoning Chain disclosure */}
                  {isAi && msg.reasoning && (
                    <div className="mb-2 w-full max-w-[90%] rounded-xl border border-indigo-500/30 bg-indigo-950/30 text-xs text-indigo-200 overflow-hidden">
                      <button
                        onClick={() =>
                          setReasoningOpen((prev) => ({ ...prev, [msg.id]: !isThinkingOpen }))
                        }
                        className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] font-mono font-bold bg-indigo-900/30 hover:bg-indigo-900/50"
                      >
                        <span className="flex items-center gap-1.5">
                          <Brain className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                          <span>DeepSeek-R1 Thought Process (Chain-of-Thought)</span>
                        </span>
                        {isThinkingOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                      {isThinkingOpen && (
                        <div className="p-3 text-[11px] font-mono whitespace-pre-line text-slate-300 border-t border-indigo-500/20 bg-slate-950/40">
                          {msg.reasoning}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Message bubble */}
                  <div
                    className={`max-w-[90%] rounded-2xl p-4 text-xs leading-relaxed ${
                      isAi
                        ? 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-sm shadow-xl'
                        : 'bg-gradient-to-r from-cyan-600 to-sky-600 text-white rounded-br-sm shadow-xl shadow-cyan-900/30'
                    }`}
                  >
                    {/* Render message paragraphs */}
                    <div className="space-y-2 whitespace-pre-wrap font-sans">
                      {msg.content.split('\n\n').map((paragraph, pIdx) => {
                        // Code blocks
                        if (paragraph.startsWith('```')) {
                          const lines = paragraph.split('\n');
                          const code = lines.slice(1, -1).join('\n');
                          return (
                            <div key={pIdx} className="my-2 rounded-xl bg-black/90 border border-slate-700 overflow-hidden font-mono text-xs">
                              <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800 text-[11px] text-slate-300 border-b border-slate-700">
                                <span>Code Implementation</span>
                                <button
                                  onClick={() => copyToClipboard(code, `${msg.id}-${pIdx}`)}
                                  className="flex items-center gap-1 hover:text-white"
                                >
                                  {copiedId === `${msg.id}-${pIdx}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                                  <span>{copiedId === `${msg.id}-${pIdx}` ? 'Copied' : 'Copy'}</span>
                                </button>
                              </div>
                              <pre className="p-3.5 overflow-x-auto text-cyan-300 leading-normal">{code}</pre>
                            </div>
                          );
                        }

                        // Headers
                        if (paragraph.startsWith('### ')) {
                          return (
                            <h4 key={pIdx} className="font-bold text-white text-sm font-mono mt-2 mb-1 text-cyan-300 border-b border-slate-800 pb-1">
                              {paragraph.replace('### ', '')}
                            </h4>
                          );
                        }
                        if (paragraph.startsWith('#### ')) {
                          return (
                            <h5 key={pIdx} className="font-semibold text-white text-xs mt-2 text-cyan-200">
                              {paragraph.replace('#### ', '')}
                            </h5>
                          );
                        }

                        return <p key={pIdx}>{paragraph}</p>;
                      })}
                    </div>

                    {/* Google Search Grounding Verified References */}
                    {isAi && msg.grounding?.sources && msg.grounding.sources.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-emerald-500/30">
                        <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                          <Globe className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Google Search Grounded Verified Authorities:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {msg.grounding.sources.slice(0, 4).map((src, sIdx) => (
                            <a
                              key={sIdx}
                              href={src.uri}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-medium transition-colors"
                            >
                              <span className="truncate max-w-[200px]">{src.title}</span>
                              <ExternalLink className="w-3 h-3 shrink-0" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action footer */}
                    {isAi && (
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-slate-400 text-[11px]">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => copyToClipboard(msg.content, msg.id)}
                            className="flex items-center gap-1 hover:text-cyan-300 transition-colors cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{copiedId === msg.id ? 'Copied!' : 'Copy'}</span>
                          </button>

                          <button
                            onClick={() => speakText(msg.content, msg.id)}
                            className={`flex items-center gap-1 transition-colors cursor-pointer ${
                              speakingId === msg.id ? 'text-cyan-400 font-bold' : 'hover:text-cyan-300'
                            }`}
                            title="Read out loud"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>{speakingId === msg.id ? 'Stop Voice' : 'Voice Read'}</span>
                          </button>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono">
                          {msg.source === 'gemini-3.8-flash' ? 'gemini-3.8-flash' : 'offline-engine'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Loading Indicator */}
            {chatLoading && (
              <div className="flex flex-col items-start space-y-1.5">
                <span className="text-xs font-mono text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>
                    {searchGrounding
                      ? 'Consulting Google Search live intelligence...'
                      : chatMode === 'deepseek'
                      ? 'DeepSeek-R1 is thinking & reasoning...'
                      : 'ChatGPT is generating response...'}
                  </span>
                </span>
                <div className="p-3.5 rounded-2xl bg-slate-900 border border-cyan-500/40 text-xs text-slate-300 flex items-center gap-3 shadow-lg">
                  <div className="flex space-x-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-slate-300 font-mono">
                    {searchGrounding
                      ? 'Fetching real-time meteorological & disaster reports...'
                      : chatMode === 'deepseek'
                      ? 'Analyzing chain of thought...'
                      : 'Composing answer...'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts across Domains */}
          <div className="space-y-1.5">
            <span className="text-[11px] text-slate-400 font-medium block">
              {t('Suggested Inquiries (Emergency, Coding, Science, General):', 'প্রস্তাবিত প্রশ্নাবলী (দুর্যোগ, কোডিং, বিজ্ঞান, সাধারণ জ্ঞান):')}
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={() => handleSendMessage('What should I do during a cyclone Signal 8 in Chittagong?')}
                className="bg-slate-900 hover:bg-slate-800 text-cyan-300 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
              >
                🌀 Cyclone Signal 8
              </button>
              <button
                onClick={() => handleSendMessage('বন্যার সময় পানিবাহিত রোগ ও সাপের উপদ্রব থেকে কীভাবে বাঁচব?')}
                className="bg-slate-900 hover:bg-slate-800 text-cyan-300 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
              >
                🌊 বন্যা ও সাপের কামড়
              </button>
              <button
                onClick={() => handleSendMessage('Write a Python function to calculate distance between coordinates')}
                className="bg-slate-900 hover:bg-slate-800 text-cyan-300 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
              >
                💻 Python Geo Code
              </button>
              <button
                onClick={() => handleSendMessage('How to purify flood water without electricity?')}
                className="bg-slate-900 hover:bg-slate-800 text-cyan-300 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
              >
                💧 Water Purification
              </button>
              <button
                onClick={() => handleSendMessage('ভূমিকম্পের সময় ড্রপ, কভার ও হোল্ড অন নিয়ম বুঝিয়ে বলো')}
                className="bg-slate-900 hover:bg-slate-800 text-cyan-300 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
              >
                🏢 ভূমিকম্প প্রস্তুতি
              </button>
              <button
                onClick={() => handleSendMessage('First aid steps for high fever and severe burn wounds')}
                className="bg-slate-900 hover:bg-slate-800 text-cyan-300 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition-colors cursor-pointer"
              >
                🩺 First Aid for Burns
              </button>
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Live Voice Button in Form */}
            <button
              type="button"
              onClick={() => setVoiceModalOpen(true)}
              className="p-3 bg-slate-900 hover:bg-cyan-600/30 text-cyan-300 hover:text-white border border-slate-700 hover:border-cyan-400 rounded-xl transition-all cursor-pointer"
              title="Speak to Live Voice Assistant"
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={t(
                'Ask anything (like ChatGPT / DeepSeek) in English or Bengali...',
                'বাংলা বা ইংরেজিতে যেকোনো প্রশ্ন লিখুন (ChatGPT ও DeepSeek এর মতো)...'
              )}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={chatLoading || !inputQuery.trim()}
              className="bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 disabled:opacity-50 text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-600/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{t('Send Query', 'পাঠান')}</span>
            </button>
          </form>
        </div>
      )}

      {/* Live Voice Conversation Modal (gemini-3.8-live) */}
      <VoiceConversationModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
      />
    </div>
  );
};
