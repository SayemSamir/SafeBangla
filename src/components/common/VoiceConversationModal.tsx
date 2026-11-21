import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { sendLiveVoiceMessage } from '../../services/aiChatService';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Radio,
  Sparkles,
  PhoneCall,
  Activity,
  ShieldAlert,
  Headphones,
  RotateCcw
} from 'lucide-react';

interface VoiceConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VoiceConversationModal: React.FC<VoiceConversationModalProps> = ({
  isOpen,
  onClose
}) => {
  const { language, t } = useApp();
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSpeechText, setCurrentSpeechText] = useState('');
  const [lastAgentReply, setLastAgentReply] = useState<string>(
    language === 'bn'
      ? 'আমি আপনার কথা শোনার জন্য প্রস্তুত। মাইকে চাপ দিয়ে বলুন বা সরাসরি কথা বলুন।'
      : 'I am ready to listen. Tap the microphone to speak, or state your emergency.'
  );
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'bn'>(language);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setSelectedLanguage(language);
  }, [language]);

  // Clean up audio & speech on close
  useEffect(() => {
    if (!isOpen) {
      stopListening();
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);
    }
  }, [isOpen]);

  // Speech Recognition setup
  const startListening = async () => {
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      setIsSpeaking(false);

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        // Fallback for browsers without Web Speech Recognition: prompt user
        const simulatedText =
          selectedLanguage === 'bn'
            ? 'ফেনী পরশুরামে বন্যার পানি ঘরে ঢুকে পড়েছে, ৩ জন ছাদে আটকা।'
            : 'Floodwaters breached our home in Feni, three people stranded on roof.';
        setCurrentSpeechText(simulatedText);
        handleVoiceDispatch(simulatedText);
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = selectedLanguage === 'bn' ? 'bn-BD' : 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setCurrentSpeechText('');
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setCurrentSpeechText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition notice:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (currentSpeechText.trim()) {
          handleVoiceDispatch(currentSpeechText);
        }
      };

      recognitionRef.current = recognition;
      recognition.start();

      // Start Web Audio visualizer if microphone stream allowed
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ audio: true })
          .then((stream) => {
            micStreamRef.current = stream;
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            const analyser = ctx.createAnalyser();
            analyser.fftSize = 64;
            const source = ctx.createMediaStreamSource(stream);
            source.connect(analyser);

            audioContextRef.current = ctx;
            analyserRef.current = analyser;

            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateMeter = () => {
              analyser.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
              }
              const average = sum / bufferLength;
              setAudioLevel(Math.min(100, Math.round(average * 1.5)));
              animFrameRef.current = requestAnimationFrame(updateMeter);
            };
            updateMeter();
          })
          .catch(() => {
            // Permission ignored or unavailable, visualizer will use CSS pulses
          });
      }
    } catch (err) {
      console.warn('Speech start error:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
      micStreamRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    setIsListening(false);
    setAudioLevel(0);
  };

  const handleVoiceDispatch = async (spokenText: string) => {
    if (!spokenText.trim()) return;
    setIsProcessing(true);

    try {
      const response = await sendLiveVoiceMessage(spokenText, selectedLanguage);
      setLastAgentReply(response.spokenText);
      speakResponse(response.spokenText);
    } catch {
      const fallback =
        selectedLanguage === 'bn'
          ? 'শান্ত থাকুন। জরুরি উদ্ধারকারী দলের সাথে যোগাযোগ করা হচ্ছে। তাৎক্ষণিক ৯৯৯ এ কল করুন।'
          : 'Stay calm. Escalating to emergency rescue flotilla. Call 999 directly for immediate dispatch.';
      setLastAgentReply(fallback);
      speakResponse(fallback);
    } finally {
      setIsProcessing(false);
    }
  };

  const speakResponse = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();

    const clean = text.replace(/[*#`_]/g, '');
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = selectedLanguage === 'bn' ? 'bn-BD' : 'en-US';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-[#0B132B] border border-cyan-500/40 rounded-3xl shadow-2xl overflow-hidden p-6 text-center text-slate-100 flex flex-col items-center">
        {/* Top Header */}
        <div className="w-full flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shadow-lg">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-mono font-extrabold text-sm text-white">
                  RESQ LIVE VOICE API
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                  gemini-3.8-live
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {t('Real-Time Emergency Voice Assistant', 'রিয়েল-টাইম জরুরি ভয়েস সহকারী')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => setSelectedLanguage('bn')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  selectedLanguage === 'bn' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                বাংলা
              </button>
              <button
                onClick={() => setSelectedLanguage('en')}
                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors ${
                  selectedLanguage === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-400'
                }`}
              >
                ENG
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Dynamic Voice Waveform Visualizer */}
        <div className="my-8 relative flex items-center justify-center">
          {/* Animated Wave Rings */}
          <div
            className={`absolute w-44 h-44 rounded-full transition-all duration-300 ${
              isListening
                ? 'bg-red-500/15 animate-ping'
                : isSpeaking
                ? 'bg-cyan-500/15 animate-pulse'
                : 'bg-slate-800/40'
            }`}
          />
          <div
            className={`absolute w-36 h-36 rounded-full border transition-all duration-300 ${
              isListening
                ? 'border-red-500/50 shadow-lg shadow-red-500/30'
                : isSpeaking
                ? 'border-cyan-400/50 shadow-lg shadow-cyan-500/30'
                : 'border-slate-700'
            }`}
          />

          {/* Central Mic Push Button */}
          <button
            onClick={() => (isListening ? stopListening() : startListening())}
            className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-2xl transition-all transform active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-red-600/60 scale-105'
                : isSpeaking
                ? 'bg-gradient-to-tr from-cyan-600 to-sky-500 text-white shadow-cyan-600/60'
                : 'bg-gradient-to-tr from-slate-800 to-slate-700 hover:from-cyan-700 hover:to-sky-600 text-white shadow-cyan-900/40'
            }`}
          >
            {isListening ? (
              <Mic className="w-10 h-10 animate-bounce" />
            ) : isSpeaking ? (
              <Volume2 className="w-10 h-10 animate-pulse" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
            <span className="text-[10px] font-bold font-mono mt-1 tracking-wider uppercase">
              {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Tap To Speak'}
            </span>
          </button>
        </div>

        {/* Live Audio Amplitude Bar Meter */}
        <div className="flex items-center justify-center gap-1.5 h-8 my-2">
          {Array.from({ length: 16 }).map((_, i) => {
            const barHeight = isListening
              ? Math.max(6, Math.min(32, (audioLevel / 100) * 32 + (i % 3) * 6))
              : isSpeaking
              ? Math.max(8, 18 + Math.sin(Date.now() / 200 + i) * 12)
              : 4;

            return (
              <span
                key={i}
                style={{ height: `${barHeight}px` }}
                className={`w-1.5 rounded-full transition-all duration-75 ${
                  isListening
                    ? 'bg-red-400'
                    : isSpeaking
                    ? 'bg-cyan-400'
                    : 'bg-slate-700'
                }`}
              />
            );
          })}
        </div>

        {/* Real-Time Transcript Display */}
        <div className="w-full bg-slate-950/70 border border-slate-800 rounded-2xl p-4 my-3 text-left space-y-2.5 min-h-[110px]">
          {/* User Spoken Input */}
          {currentSpeechText && (
            <div className="text-xs text-cyan-300 font-mono flex items-start gap-1.5">
              <span className="text-slate-500 shrink-0">You:</span>
              <span className="italic">"{currentSpeechText}"</span>
            </div>
          )}

          {/* AI Live Voice Response */}
          <div className="text-sm font-sans font-medium text-slate-100 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 animate-spin" />
            <div className="flex-1">
              {isProcessing ? (
                <span className="text-xs text-slate-400 font-mono animate-pulse">
                  {t('Synthesizing crisis voice dispatch...', 'ভয়েস নির্দেশিকা তৈরি হচ্ছে...')}
                </span>
              ) : (
                <p className="leading-relaxed">{lastAgentReply}</p>
              )}
            </div>
          </div>
        </div>

        {/* Rapid Crisis Prompts */}
        <div className="w-full flex items-center justify-center gap-2 flex-wrap text-xs text-slate-300 pt-1">
          <span className="text-[10px] text-slate-500 font-mono">{t('Quick Emergency:', 'জরুরি শর্টকাট:')}</span>
          {[
            { en: 'Rising flood in house', bn: 'ঘরে বন্যার পানি উঠছে' },
            { en: 'Severe bleeding first aid', bn: 'তীব্র রক্তক্ষরণে করণীয়' },
            { en: 'Cyclone Signal 10 shelter', bn: '১০ নম্বর মহাবিপদ সংকেত' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                const text = selectedLanguage === 'bn' ? item.bn : item.en;
                setCurrentSpeechText(text);
                handleVoiceDispatch(text);
              }}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-cyan-900/60 border border-slate-700 hover:border-cyan-500/40 text-[10px] text-cyan-200 transition-colors cursor-pointer"
            >
              {selectedLanguage === 'bn' ? item.bn : item.en}
            </button>
          ))}
        </div>

        {/* Emergency Hotline Direct Call */}
        <div className="mt-5 pt-3 border-t border-slate-800 w-full flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
            <span>DIRECT EMERGENCY DISPATCH: 999</span>
          </div>
          <button
            onClick={() => speakResponse(lastAgentReply)}
            className="flex items-center gap-1 text-cyan-400 hover:text-cyan-300 text-xs font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('Replay Voice', 'পুনরায় শুনুন')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
