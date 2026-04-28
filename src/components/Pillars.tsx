import { 
  Volume2, 
  Play, 
  CheckCircle2, 
  ArrowRight,
  BookOpen,
  Mic,
  Headphones,
  FileText,
  Timer,
  Zap,
  TrendingUp,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState, useEffect, useRef } from 'react';
import { GlassCard } from './shared/GlassCard';
import { PillarId, LanguageId, PillarData, GrammarRule } from '../types';
import { PILLAR_DATA, LANGUAGES } from '../constants';

interface PillarsProps {
  initialPillar?: PillarId;
  languageId: LanguageId;
  onGrantPoints: (points: number) => void;
}

export const Pillars: React.FC<PillarsProps> = ({ 
  initialPillar = 'grammar', 
  languageId,
  onGrantPoints 
}) => {
  const [activePillar, setActivePillar] = useState<PillarId>(initialPillar);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);
  const [activeReadingIndex, setActiveReadingIndex] = useState(0);
  const [activeListeningIndex, setActiveListeningIndex] = useState(0);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showResult, setShowResult] = useState<number | null>(null);
  const [readingQuizAnswers, setReadingQuizAnswers] = useState<Record<number, number>>({});
  const [grammarQuizAnswers, setGrammarQuizAnswers] = useState<Record<number, number>>({});
  
  // Speech Recognition States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingIndex, setRecordingIndex] = useState<number | null>(null);
  const [transcript, setTranscript] = useState("");
  const [speechAccuracy, setSpeechAccuracy] = useState<number | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Speaking Gamification States
  const [speakingStreak, setSpeakingStreak] = useState(0);
  const [bestAccuracy, setBestAccuracy] = useState(0);

  // Gamification states
  const [timeLeft, setTimeLeft] = useState(30);
  const [isQuizActive, setIsQuizActive] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [showBonus, setShowBonus] = useState<{ id: string; points: number } | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const pillars = [
    { id: 'grammar', label: 'Grammar', icon: BookOpen },
    { id: 'reading', label: 'Reading', icon: FileText },
    { id: 'speaking', label: 'Speaking', icon: Mic },
    { id: 'listening', label: 'Listening', icon: Headphones },
  ] as const;

  // Reset states when changing context
  useEffect(() => {
    setReadingQuizAnswers({});
    setGrammarQuizAnswers({});
    setShowResult(null);
    setIsTranslating(false);
    setActiveReadingIndex(0);
    setActiveListeningIndex(0);
    setIsQuizActive(false);
    setQuizScore(0);
    
    // Stop recording
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
    setRecordingIndex(null);
    setTranscript("");
    setSpeechAccuracy(null);
    setSpeechError(null);
  }, [activePillar, languageId, activeLessonIndex]);

  // Timer logic for Reading Quiz
  useEffect(() => {
    if (isQuizActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsQuizActive(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isQuizActive, timeLeft]);

  const startTimedQuiz = () => {
    setIsQuizActive(true);
    setTimeLeft(30);
    setReadingQuizAnswers({});
    setQuizScore(0);
    startTimeRef.current = Date.now();
  };

  const grantXP = (basePoints: number, bonusEligible = false) => {
    let finalPoints = basePoints;
    if (bonusEligible && isQuizActive) {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed < 10) finalPoints += 5; // Speed bonus
    }
    onGrantPoints(finalPoints);
    setShowBonus({ id: Math.random().toString(), points: finalPoints });
    setTimeout(() => setShowBonus(null), 1000);
  };

  const getSimilarity = (s1: string, s2: string): number => {
    const clean = (s: string) => s.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").trim();
    const a = clean(s1);
    const b = clean(s2);
    
    if (a === b) return 100;
    if (!a || !b) return 0;

    const wordsA = a.split(/\s+/);
    const wordsB = b.split(/\s+/);
    const matches = wordsA.filter(w => wordsB.includes(w)).length;
    
    return Math.round((matches / Math.max(wordsA.length, wordsB.length)) * 100);
  };

  const startListening = async (index: number, targetText: string) => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    setSpeechError(null);

    // Prompt for microphone access explicitly if possible
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        await navigator.mediaDevices.getUserMedia({ audio: true });
      }
    } catch (err: any) {
      console.error("Microphone access error:", err);
      if (err.name === 'NotFoundError' || err.message?.includes('Requested device not found') || err.message?.includes('device not found')) {
        setSpeechError("No microphone found. Please connect a microphone to practice speaking.");
      } else {
        setSpeechError("Microphone access was denied. Please click the Lock icon in your address bar and ensure 'Microphone' is allowed.");
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang.code;
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsRecording(true);
      setRecordingIndex(index);
      setTranscript("");
      setSpeechAccuracy(null);
      setSpeechError(null);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript;
      setTranscript(result);
      const acc = getSimilarity(result, targetText);
      setSpeechAccuracy(acc);
      if (acc > bestAccuracy) setBestAccuracy(acc);

      if (acc >= 75) {
        const isSpeedy = (Date.now() - startTimeRef.current) < 5000;
        const newStreak = speakingStreak + 1;
        setSpeakingStreak(newStreak);
        
        let points = Math.floor(acc / 5);
        if (newStreak >= 3) points += 5; // Streak bonus
        if (isSpeedy) points += 5; // Speed bonus
        
        grantXP(points, isSpeedy);
      } else {
        setSpeakingStreak(0);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
      setRecordingIndex(null);
      
      if (event.error === 'not-allowed') {
        setSpeechError("Microphone access was denied. If you don't see a prompt, try opening the app in a new tab or checking your browser's site settings.");
      } else if (event.error === 'service-not-allowed') {
        setSpeechError("Speech recognition is not allowed for this service/domain.");
      } else if (event.error === 'no-speech') {
        setSpeechError("No speech was detected. Please try again and speak clearly.");
      } else {
        setSpeechError("Something went wrong with the microphone. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      setRecordingIndex(null);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Speech recognition start error:", e);
      setSpeechError("Failed to start speech recognition. This is often due to browser security restrictions in iframes. Please click 'Try in New Tab' below.");
      setIsRecording(false);
      setRecordingIndex(null);
    }
  };

  const lessons = PILLAR_DATA[languageId] || PILLAR_DATA.en;
  const currentLesson = lessons[activeLessonIndex] || lessons[0];
  
  if (!currentLesson) return null;

  const currentReading = currentLesson.reading[activeReadingIndex] || currentLesson.reading[0];
  const currentListening = currentLesson.listening[activeListeningIndex] || currentLesson.listening[0];
  const lang = LANGUAGES.find(l => l.id === languageId) || LANGUAGES[0];

  const speak = (text: string, code: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = code;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Lesson Selector */}
      <div className="bg-white/5 p-2 rounded-2xl border border-white/5 mb-8">
        <div className="flex items-center justify-between px-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-fox-orange flex items-center justify-center font-black text-lg">
              {activeLessonIndex + 1}
            </div>
            <div>
              <h3 className="font-bold">{currentLesson.title}</h3>
              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Unit {activeLessonIndex + 1}</p>
            </div>
          </div>
          <div className="text-xs font-bold text-gray-500">
            {activeLessonIndex + 1} / {lessons.length}
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 px-2">
          {lessons.map((lesson, idx) => (
            <button
              key={lesson.id}
              onClick={() => setActiveLessonIndex(idx)}
              className={`
                flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold transition-all border
                ${activeLessonIndex === idx 
                  ? 'bg-fox-orange border-fox-orange text-white shadow-lg shadow-fox-orange/20' 
                  : 'bg-white/5 border-white/5 text-gray-400 hover:text-white hover:bg-white/10'}
              `}
            >
              Lesson {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Pillar Tabs */}
      <div className="flex gap-4 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar">
        {pillars.map((p) => {
          const Icon = p.icon;
          const isActive = activePillar === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActivePillar(p.id)}
              className={`
                px-6 py-3 font-bold whitespace-nowrap flex items-center gap-2 transition-all relative
                ${isActive ? 'text-fox-orange' : 'text-gray-500 hover:text-white'}
              `}
            >
              <Icon size={18} />
              {p.label}
              {isActive && (
                <motion.div 
                  layoutId="active-pillar-bar"
                  className="absolute bottom-0 left-0 w-full h-[3px] bg-fox-orange"
                />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activePillar + languageId + activeLessonIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {activePillar === 'grammar' && (
            <div className="grid grid-cols-1 gap-8">
              {currentLesson.grammar.map((g: GrammarRule, i: number) => (
                <GlassCard key={i} className="border-l-4 border-fox-orange overflow-hidden p-6 md:p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-fox-orange font-extrabold text-2xl mb-4 tracking-tight">{g.rule}</h4>
                      <p className="text-gray-300 mb-4 font-medium">{g.desc}</p>
                      
                      {g.details && (
                        <div className="text-sm text-gray-500 mb-6 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                          {g.details}
                        </div>
                      )}

                      {g.colorCoding && (
                        <div className="mb-6">
                          <p className={`text-[10px] uppercase font-bold text-gray-500 mb-3 tracking-widest ${lang.rtl ? 'text-right' : 'text-left'}`}>Visual Structure</p>
                          <div className={`bg-black/20 p-4 rounded-2xl border border-white/5 font-mono text-sm leading-relaxed ${lang.rtl ? 'text-right' : 'text-left'}`} dir={lang.rtl ? 'rtl' : 'ltr'}>
                            {g.colorCoding.text.split(/(\s+)/).map((part, idx) => {
                              const highlight = g.colorCoding?.highlights.find(h => part.includes(h.word));
                              if (highlight) {
                                return (
                                  <span key={idx} className="relative group/word">
                                    <span className={`${highlight.color} font-bold underline decoration-2 underline-offset-4`}>
                                      {part}
                                    </span>
                                    {highlight.label && (
                                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-[8px] px-1.5 py-0.5 rounded opacity-0 group-hover/word:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {highlight.label}
                                      </span>
                                    )}
                                  </span>
                                );
                              }
                              return <span key={idx}>{part}</span>;
                            })}
                          </div>
                        </div>
                      )}

                      <div className="bg-black/40 p-5 rounded-2xl text-lg italic relative group overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full bg-fox-orange/30" />
                        <span className="text-fox-orange/50 mr-2 font-black">“</span>
                        {g.example}
                        <span className="text-fox-orange/50 ml-2 font-black">”</span>
                        <button 
                          onClick={() => speak(g.example, lang.code)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 rounded-xl hover:bg-fox-orange hover:text-white transition-all shadow-xl"
                        >
                          <Volume2 size={16} />
                        </button>
                      </div>
                    </div>

                    {g.interactive && (
                      <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-2 h-2 rounded-full bg-fox-orange animate-pulse" />
                          <span className="text-[10px] uppercase font-black tracking-widest text-fox-orange">Interactive Practice</span>
                        </div>
                        <h5 className="font-bold text-lg mb-6">{g.interactive.prompt}</h5>
                        
                        <div className="space-y-3">
                          {g.interactive.options.map((opt: string, optIdx: number) => {
                            const userAnswer = grammarQuizAnswers[i];
                            const isCorrect = optIdx === g.interactive.correct;
                            const isSelected = userAnswer === optIdx;
                            const hasAnswered = userAnswer !== undefined;

                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  if (!hasAnswered) {
                                    setGrammarQuizAnswers(prev => ({ ...prev, [i]: optIdx }));
                                    if (isCorrect) grantXP(10);
                                  }
                                }}
                                className={`
                                  w-full p-4 rounded-xl border text-left transition-all text-sm font-semibold flex justify-between items-center
                                  ${hasAnswered 
                                    ? (isSelected 
                                        ? (isCorrect ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400')
                                        : (isCorrect ? 'border-green-500/30 text-green-400/50' : 'opacity-40 border-white/5'))
                                    : 'bg-white/5 border-white/5 hover:border-fox-orange/50 hover:bg-white/10'}
                                `}
                              >
                                {opt}
                                {hasAnswered && isSelected && (
                                  isCorrect ? <CheckCircle2 size={18} /> : <span>❌</span>
                                )}
                              </button>
                            );
                          })}
                        </div>

                        <AnimatePresence>
                          {grammarQuizAnswers[i] !== undefined && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="mt-6 pt-6 border-t border-white/5"
                            >
                              <p className="text-xs text-gray-400 italic">
                                <span className="text-fox-orange font-bold mr-2">Explanation:</span>
                                {g.interactive.explanation}
                              </p>
                              <button 
                                onClick={() => setGrammarQuizAnswers(prev => {
                                  const next = { ...prev };
                                  delete next[i];
                                  return next;
                                })}
                                className="mt-4 text-[10px] uppercase font-black text-gray-500 hover:text-fox-orange transition-colors"
                              >
                                Try Again
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {activePillar === 'reading' && currentReading && (
            <div className="space-y-6">
              {currentLesson.reading.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                  {currentLesson.reading.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveReadingIndex(idx);
                        setReadingQuizAnswers({});
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        activeReadingIndex === idx
                          ? 'bg-fox-orange border-fox-orange text-white'
                          : 'bg-white/5 border-white/5 text-gray-500'
                      }`}
                    >
                      Article {idx + 1}
                    </button>
                  ))}
                </div>
              )}
              <GlassCard className="p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <div className="text-[10px] uppercase font-black tracking-[0.3em] text-fox-orange mb-1">Original Story</div>
                    <h4 className="text-3xl font-black">{currentReading.title}</h4>
                  </div>
                  <button 
                    onClick={() => setIsTranslating(!isTranslating)}
                    className="px-6 py-2 rounded-full border border-fox-orange/30 hover:bg-fox-orange/10 transition-colors text-sm font-bold flex items-center gap-2"
                  >
                    <ArrowRight size={16} className={isTranslating ? 'rotate-180' : ''} />
                    {isTranslating ? 'Show Original' : 'Translate to Native'}
                  </button>
                </div>
                <p className={`text-xl leading-relaxed mb-8 font-medium ${lang.rtl ? 'rtl text-right' : ''}`}>
                  {isTranslating ? currentReading.translation : currentReading.content}
                </p>
                <div className="flex gap-4">
                  <button 
                    onClick={() => speak(isTranslating ? currentReading.translation : currentReading.content, isTranslating ? 'en-US' : lang.code)}
                    className="px-8 py-3 bg-fox-orange rounded-2xl text-sm font-bold flex items-center gap-3 shadow-xl shadow-fox-orange/20"
                  >
                    <Volume2 size={20} />
                    Audio Narrative
                  </button>
                </div>
              </GlassCard>

              {currentReading.quiz && currentReading.quiz.length > 0 && (
                <GlassCard className="p-10 border-t-8 border-fox-orange/20 relative overflow-hidden">
                  <AnimatePresence>
                    {showBonus && (
                      <motion.div
                        key={showBonus.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: -40 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 font-black text-fox-orange text-3xl pointer-events-none z-50"
                      >
                        +{showBonus.points} XP ✨
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                      <h3 className="text-2xl font-black flex items-center gap-3">
                        <CheckCircle2 className="text-fox-orange" />
                        Comprehension Challenge
                      </h3>
                      {isQuizActive && (
                        <div className="flex items-center gap-2 text-xs font-bold text-gray-500 mt-1 uppercase tracking-widest">
                          <Timer size={14} />
                          Time Left: {timeLeft}s
                        </div>
                      )}
                    </div>
                    
                    {!isQuizActive ? (
                      <button 
                        onClick={startTimedQuiz}
                        className="px-6 py-2 bg-fox-orange/10 border border-fox-orange text-fox-orange rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-fox-orange hover:text-white transition-all shadow-lg shadow-fox-orange/10"
                      >
                        <Zap size={14} />
                        START TIMED CHALLENGE
                      </button>
                    ) : (
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">Progress</p>
                          <p className="text-xs font-black text-fox-orange">
                            {Object.keys(readingQuizAnswers).length} / {currentReading.quiz.length}
                          </p>
                        </div>
                        <div className="h-10 w-px bg-white/10" />
                        <div className="text-right">
                          <p className="text-[10px] text-gray-500 font-bold uppercase">Timer</p>
                          <div className="w-24 h-2 bg-white/5 rounded-full mt-1 overflow-hidden">
                            <motion.div 
                              className="h-full bg-fox-orange"
                              animate={{ width: `${(timeLeft / 30) * 100}%` }}
                              transition={{ duration: 1, ease: "linear" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className={`space-y-10 transition-all ${!isQuizActive ? 'blur-sm pointer-events-none grayscale opacity-50' : ''}`}>
                    {currentReading.quiz.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="space-y-4">
                        <p className="text-lg font-bold text-gray-200">{qIdx + 1}. {q.question}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {q.options?.map((opt: string, optIdx: number) => {
                            const selectedAnswer = readingQuizAnswers[qIdx];
                            const isCorrect = optIdx === q.correct;
                            const isSelected = selectedAnswer === optIdx;
                            
                            return (
                              <button
                                key={optIdx}
                                onClick={() => {
                                  if (selectedAnswer === undefined && isQuizActive) {
                                    setReadingQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                    if (isCorrect) grantXP(15, true);
                                  }
                                }}
                                className={`
                                  p-4 rounded-xl border text-left transition-all text-sm font-semibold
                                  ${selectedAnswer !== undefined 
                                    ? (isSelected 
                                        ? (isCorrect ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400')
                                        : (isCorrect ? 'border-green-500/30 text-green-400/50' : 'opacity-40 border-white/5'))
                                    : 'bg-white/5 border-white/5 hover:border-fox-orange/50'}
                                `}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {activePillar === 'speaking' && (
            <div className="max-w-3xl mx-auto space-y-8">
              <div className="text-center mb-10 relative">
                <AnimatePresence>
                  {showBonus && (
                    <motion.div
                      key={showBonus.id}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      className="absolute top-0 left-1/2 -translate-x-1/2 font-black text-blue-400 text-3xl pointer-events-none z-50"
                    >
                      +{showBonus.points} XP 🎤
                    </motion.div>
                  )}
                </AnimatePresence>
                <div className="w-20 h-20 bg-blue-500/20 rounded-full mx-auto flex items-center justify-center mb-6 relative">
                  <Mic size={32} className={`transition-all ${isRecording ? 'text-red-500 scale-110' : 'text-blue-400'}`} />
                  {isRecording && (
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="absolute inset-0 rounded-full bg-red-500/30"
                    />
                  )}
                </div>
                <h4 className="text-3xl font-black mb-2">Pronunciation Lab</h4>
                <p className="text-gray-400 text-sm italic">"Practice makes perfect. Listen to the fox, then try it yourself!"</p>
                
                <div className="flex justify-center gap-4 mt-6">
                  <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5 text-center">
                    <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Max Accuracy</p>
                    <p className="text-xl font-black text-blue-400">{bestAccuracy}%</p>
                  </div>
                  {speakingStreak > 0 && (
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-orange-500/20 px-6 py-3 rounded-2xl border border-orange-500/30 text-center"
                    >
                      <p className="text-[10px] text-orange-400 font-black uppercase tracking-widest mb-1">Combo Streak</p>
                      <p className="text-xl font-black text-orange-400">x{speakingStreak} 🔥</p>
                    </motion.div>
                  )}
                </div>

                {speechError && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-6 p-6 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-400 text-sm font-bold max-w-lg mx-auto shadow-2xl shadow-red-500/10"
                  >
                    <p className="mb-4">{speechError}</p>
                    <div className="flex gap-3 justify-center">
                      <button 
                        onClick={() => window.open(window.location.href, '_blank')}
                        className="px-4 py-2 bg-red-500 text-white rounded-xl text-xs hover:bg-red-600 transition-colors"
                      >
                        Try in New Tab
                      </button>
                      <button 
                        onClick={() => setSpeechError(null)}
                        className="px-4 py-2 bg-white/10 text-white rounded-xl text-xs hover:bg-white/20 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                {currentLesson.grammar.map((g: any, i: number) => {
                  const isCurrentItem = recordingIndex === i;
                  const hasResults = speechAccuracy !== null && !isRecording && !isCurrentItem; // This is a bit tricky with shared state, let's refine
                  
                  return (
                    <GlassCard 
                      key={i} 
                      className={`
                        transition-all duration-300 overflow-hidden
                        ${isRecording && isCurrentItem ? 'border-red-500/50 bg-red-500/5 shadow-2xl shadow-red-500/10' : 'hover:border-blue-500/40'}
                      `}
                    >
                      <div className="p-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
                          <div className="flex items-center gap-6">
                            <button 
                              onClick={() => speak(g.example, lang.code)}
                              className="w-14 h-14 bg-blue-500/10 rounded-2xl text-blue-400 flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all shadow-lg active:scale-95"
                            >
                              <Play size={24} fill="currentColor" />
                            </button>
                            <div className="text-center md:text-left">
                              <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Repeat after me</p>
                              <span className="font-black text-2xl tracking-tight">{g.example}</span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => startListening(i, g.example)}
                            disabled={isRecording && !isCurrentItem}
                            className={`
                              px-8 py-3 rounded-2xl font-black text-sm flex items-center gap-3 transition-all active:scale-95
                              ${isRecording && isCurrentItem 
                                ? 'bg-red-500 text-white shadow-xl shadow-red-500/20' 
                                : 'bg-white/10 text-white hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/20'}
                              ${isRecording && !isCurrentItem ? 'opacity-20 cursor-not-allowed' : ''}
                            `}
                          >
                            <Mic size={18} className={isRecording && isCurrentItem ? 'animate-pulse' : ''} />
                            {isRecording && isCurrentItem ? 'RECORDING...' : 'RECORD ATTEMPT'}
                          </button>
                        </div>

                        {/* Speech Results Implementation - scoped to current item if possible */}
                        {/* Note: In a real app, I'd probably have an array of results. For simplicity, we show the last result here if the index matches */}
                        {transcript && !isRecording && recordingIndex === null && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-black/20 p-6 rounded-2xl border border-white/5"
                          >
                            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                              <div className="flex-1">
                                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-2">What we heard</p>
                                <p className="text-xl font-bold italic text-blue-300">"{transcript}"</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Accuracy</p>
                                  <p className={`text-3xl font-black ${speechAccuracy! >= 80 ? 'text-green-400' : speechAccuracy! >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                    {speechAccuracy}%
                                  </p>
                                </div>
                                <div className="p-3 bg-white/5 rounded-xl">
                                  {speechAccuracy! >= 80 ? <Award className="text-green-400" /> : <Zap className="text-yellow-400" />}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}

          {activePillar === 'listening' && currentListening && (
            <div className="space-y-6">
              {currentLesson.listening.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar">
                  {currentLesson.listening.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveListeningIndex(idx);
                        setShowResult(null);
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                        activeListeningIndex === idx
                          ? 'bg-purple-500 border-purple-500 text-white'
                          : 'bg-white/5 border-white/5 text-gray-500'
                      }`}
                    >
                      Audio {idx + 1}
                    </button>
                  ))}
                </div>
              )}
              <GlassCard className="max-w-xl mx-auto p-12 text-center">
                <div className="mb-10">
                  <button 
                    onClick={() => speak(currentListening.audio, lang.code)}
                    className="w-24 h-24 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-purple-500/40 group hover:scale-110 transition-transform"
                  >
                    <Volume2 size={40} className="text-white group-hover:animate-pulse" />
                  </button>
                  <div className="mt-6">
                    <h4 className="text-xl font-black mb-1">Aural Comprehension</h4>
                    <p className="text-sm text-gray-500">Listen carefully and identify the context.</p>
                  </div>
                </div>
                <div className="grid gap-3">
                  {currentListening.options?.map((opt: string, idx: number) => (
                    <button 
                      key={idx}
                      onClick={() => setShowResult(idx)}
                      className={`
                        w-full p-5 rounded-2xl border text-left transition-all flex justify-between items-center
                        ${showResult === idx 
                          ? (idx === currentListening.correct ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-red-500/20 border-red-500 text-red-400')
                          : 'bg-white/5 border-white/5 hover:border-purple-500/50 hover:bg-white/10'}
                      `}
                    >
                      <span className="font-bold">{opt}</span>
                      {showResult === idx && (
                        idx === currentListening.correct ? <CheckCircle2 size={24} /> : <div className="text-xl">❌</div>
                      )}
                    </button>
                  ))}
                </div>
                {showResult !== null && (
                  <button 
                    onClick={() => setShowResult(null)}
                    className="mt-8 text-xs font-bold text-gray-500 hover:text-white underline underline-offset-4"
                  >
                    Reset Challenge
                  </button>
                )}
              </GlassCard>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
