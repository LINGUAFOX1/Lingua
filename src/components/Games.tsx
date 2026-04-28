import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './shared/GlassCard';
import { Gamepad2, Trophy, Star, RefreshCw, CheckCircle2, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { LanguageId } from '../types';
import { GAME_DATA } from '../data/GAME_DATA';
import { generateFlashcardInsight } from '../lib/gemini';


interface GamesProps {
  languageId: LanguageId;
  onGrantPoints: (points: number) => void;
}

export const Games: React.FC<GamesProps> = ({ languageId, onGrantPoints }) => {
  const [activeGame, setActiveGame] = useState<'match' | 'scramble' | 'flashcard' | null>(null);
  const [score, setScore] = useState(0);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [scrambledWords, setScrambledWords] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [showFlipped, setShowFlipped] = useState(false);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  
  // Flashcard AI states
  const [insightLoading, setInsightLoading] = useState(false);
  const [currentInsight, setCurrentInsight] = useState<string | null>(null);
  
  // DDA States
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [streak, setStreak] = useState(0);
  const [showDifficultyAlert, setShowDifficultyAlert] = useState(false);

  const allGames = (GAME_DATA as any)[languageId] || GAME_DATA.en;
  const games = activeGame ? allGames.filter((g: any) => 
    g.type === activeGame && (g.difficulty || 'easy') === difficulty
  ) : [];
  
  const currentGame = games[currentLevel % (games.length || 1)];

  useEffect(() => {
    if (activeGame === 'scramble' && currentGame) {
      setScrambledWords(currentGame.question.split(' ').sort(() => Math.random() - 0.5));
      setSelectedWords([]);
    }
    setShowFlipped(false);
    setFeedback(null);
    setCurrentInsight(null);
  }, [activeGame, currentLevel, languageId, currentGame, difficulty]);

  const handleCorrect = (points: number) => {
    setFeedback('correct');
    const newStreak = streak + 1;
    setStreak(newStreak);

    // Increase difficulty logic
    if (newStreak === 3 && difficulty === 'easy') {
      setDifficulty('medium');
      setShowDifficultyAlert(true);
      setTimeout(() => setShowDifficultyAlert(false), 3000);
      setStreak(0);
    } else if (newStreak === 3 && difficulty === 'medium') {
      setDifficulty('hard');
      setShowDifficultyAlert(true);
      setTimeout(() => setShowDifficultyAlert(false), 3000);
      setStreak(0);
    }

    setTimeout(() => {
      setScore(prev => prev + points);
      onGrantPoints(points);
      nextLevel();
    }, 600);
  };

  const handleMatch = (option: string) => {
    if (option === currentGame.answer) {
      handleCorrect(10);
    } else {
      setFeedback('wrong');
      setStreak(0); // Reset streak on mistake
      setTimeout(() => setFeedback(null), 600);
      setScore(prev => Math.max(0, prev - 5));
    }
  };

  const handleWordClick = (word: string, fromSelected: boolean) => {
    if (fromSelected) {
      setSelectedWords(prev => prev.filter(w => w !== word));
      setScrambledWords(prev => [...prev, word]);
    } else {
      setScrambledWords(prev => prev.filter(w => w !== word));
      setSelectedWords(prev => [...prev, word]);
    }
  };

  const checkScramble = () => {
    if (selectedWords.join(' ').toLowerCase() === currentGame.answer.toLowerCase()) {
      handleCorrect(15);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 600);
    }
  };

  const nextLevel = () => {
    if (currentLevel < games.length - 1) {
      setCurrentLevel(prev => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const restart = () => {
    setCurrentLevel(0);
    setScore(0);
    setIsGameOver(false);
    setActiveGame(null);
  };

  const handleGetInsight = async (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent flipping the card
    if (insightLoading || currentInsight) return;
    
    setInsightLoading(true);
    try {
      const resp = await generateFlashcardInsight(currentGame.question, languageId);
      setCurrentInsight(resp);
    } catch (err) {
      setCurrentInsight("Could not fetch AI insight. Try again!");
    } finally {
      setInsightLoading(false);
    }
  };

  if (!activeGame) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard 
          onClick={() => setActiveGame('match')}
          className="group cursor-pointer hover:border-kawaii-pink transition-all h-72 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-kawaii-pink/5 to-purple-500/5"
        >
          <div className="w-20 h-20 bg-kawaii-pink/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Star className="text-kawaii-pink" size={40} />
          </div>
          <h3 className="text-2xl font-black mb-2">Word Match</h3>
          <p className="text-gray-400 text-sm italic">Connect words with translations!</p>
        </GlassCard>

        <GlassCard 
          onClick={() => setActiveGame('scramble')}
          className="group cursor-pointer hover:border-blue-400 transition-all h-72 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-blue-400/5 to-indigo-500/5"
        >
          <div className="w-20 h-20 bg-blue-400/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <RefreshCw className="text-blue-400" size={40} />
          </div>
          <h3 className="text-2xl font-black mb-2">Sentence Scramble</h3>
          <p className="text-gray-400 text-sm italic">Master syntax by ordering words!</p>
        </GlassCard>

        <GlassCard 
          onClick={() => setActiveGame('flashcard')}
          className="group cursor-pointer hover:border-purple-400 transition-all h-72 flex flex-col items-center justify-center text-center p-8 bg-gradient-to-br from-purple-400/5 to-fuchsia-500/5"
        >
          <div className="w-20 h-20 bg-purple-400/20 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <Gamepad2 className="text-purple-400" size={40} />
          </div>
          <h3 className="text-2xl font-black mb-2">Flashcards</h3>
          <p className="text-gray-400 text-sm italic">Quick memorization drill!</p>
        </GlassCard>
      </div>
    );
  }

  if (isGameOver) {
    return (
      <GlassCard className="max-w-2xl mx-auto py-16 text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-8"
        >
          <Trophy className="text-yellow-500" size={48} />
        </motion.div>
        <h2 className="text-4xl font-black mb-4">Course Completed!</h2>
        <p className="text-xl text-gray-400 mb-8 font-medium">You dominated the <span className="text-kawaii-pink font-black">{activeGame}</span> challenge with <span className="text-fox-orange font-black">{score}</span> points!</p>
        <button 
          onClick={restart}
          className="bg-fox-orange px-12 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-fox-orange/20"
        >
            Play More Games
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
        <button onClick={() => setActiveGame(null)} className="text-gray-500 hover:text-white flex items-center gap-2 font-bold text-sm tracking-tight">
          ← BACK TO MENU
        </button>
        <div className="flex items-center gap-8 bg-white/5 px-8 py-3 rounded-2xl border border-white/5">
            <div className="text-center group">
                <p className="text-2xl font-black text-kawaii-pink group-hover:scale-110 transition-transform">{score}</p>
                <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest">Score</p>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
                <p className="text-2xl font-black text-blue-400 capitalize">{difficulty}</p>
                <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest">Difficulty</p>
            </div>
            <div className="w-px h-6 bg-white/10" />
            <div className="text-center">
                <p className="text-2xl font-black text-purple-400">{currentLevel + 1}/{games.length}</p>
                <p className="text-[9px] uppercase font-black text-gray-500 tracking-widest">Level</p>
            </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-white/5 rounded-full mb-12 overflow-hidden border border-white/5">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${((currentLevel + (feedback === 'correct' ? 1 : 0)) / games.length) * 100}%` }}
          className="h-full bg-gradient-to-r from-fox-orange to-kawaii-pink shadow-[0_0_15px_rgba(255,103,31,0.5)]"
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeGame + currentLevel + feedback}
          initial={{ opacity: 0, x: 20 }}
          animate={{ 
            opacity: 1, 
            x: feedback === 'wrong' ? [0, -10, 10, -10, 10, 0] : 0,
            scale: feedback === 'correct' ? [1, 1.02, 1] : 1
          }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: feedback === 'wrong' ? 0.4 : 0.3 }}
          className="relative"
        >
          <AnimatePresence>
            {showDifficultyAlert && (
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none"
              >
                <GlassCard className="bg-fox-orange/90 border-fox-orange p-8 text-center shadow-2xl shadow-fox-orange/50">
                  <TrendingUp className="text-white mx-auto mb-4" size={48} />
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter">DIFFICULTY INCREASED!</h2>
                  <p className="text-white/80 font-bold">The challenges are becoming more complex...</p>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {feedback === 'correct' && (
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 text-4xl font-black text-green-400 animate-bounce">
              + POINTS ✨
            </div>
          )}

          {activeGame === 'match' && currentGame ? (
            <GlassCard className={`p-12 text-center transition-colors duration-300 ${feedback === 'correct' ? 'border-green-500/50 bg-green-500/5' : feedback === 'wrong' ? 'border-red-500/50 bg-red-500/5' : ''}`}>
              <h2 className="text-6xl font-black mb-12 tracking-tighter">{currentGame.question}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentGame.options?.map((opt: string) => (
                  <button
                    key={opt}
                    onClick={() => !feedback && handleMatch(opt)}
                    className={`
                      p-6 rounded-2xl bg-white/5 border border-white/10 font-bold text-xl transition-all
                      ${!feedback && 'hover:border-kawaii-pink hover:bg-kawaii-pink/10 hover:scale-105 active:scale-95'}
                    `}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </GlassCard>
          ) : activeGame === 'scramble' && currentGame ? (
            <GlassCard className={`p-12 text-center transition-colors duration-300 ${feedback === 'correct' ? 'border-green-500/50 bg-green-500/5' : feedback === 'wrong' ? 'border-red-500/50 bg-red-500/5' : ''}`}>
              <h3 className="text-sm font-black text-gray-500 uppercase tracking-[0.3em] mb-12">RECONSTRUCT THE SENTENCE</h3>
              
              <div className="min-h-[100px] bg-black/40 rounded-3xl p-8 flex flex-wrap gap-4 items-center justify-center mb-12 border-2 border-dashed border-white/10 shadow-inner">
                {selectedWords.length === 0 && <span className="text-gray-600 font-bold italic">Click words to start...</span>}
                {selectedWords.map((word, i) => (
                  <motion.button
                    layoutId={`word-${word}`}
                    key={i}
                    onClick={() => !feedback && handleWordClick(word, true)}
                    className="bg-blue-600 px-6 py-3 rounded-xl font-bold shadow-xl border border-white/20 hover:scale-105 active:scale-95 transition-transform"
                  >
                    {word}
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-wrap gap-3 items-center justify-center mb-12">
                {scrambledWords.map((word, i) => (
                  <motion.button
                    layoutId={`word-${word}`}
                    key={i}
                    onClick={() => !feedback && handleWordClick(word, false)}
                    className="bg-white/10 px-5 py-3 rounded-xl font-bold hover:bg-white/20 hover:scale-105 active:scale-95 transition-transform border border-white/5"
                  >
                    {word}
                  </motion.button>
                ))}
              </div>

              <button
                disabled={selectedWords.length === 0 || feedback !== null}
                onClick={checkScramble}
                className="bg-blue-500 disabled:opacity-50 px-16 py-4 rounded-2xl font-black text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-500/20"
              >
                CHECK SOLUTION
              </button>
            </GlassCard>
          ) : activeGame === 'flashcard' && currentGame ? (
            <div className="max-w-xl mx-auto h-[400px] perspective-[1000px]">
                <motion.div
                    animate={{ rotateY: showFlipped ? 180 : 0 }}
                    transition={{ duration: 0.6, type: 'spring', stiffness: 260, damping: 20 }}
                    style={{ transformStyle: 'preserve-3d' }}
                    className="relative w-full h-full"
                >
                    {/* Front */}
                    <GlassCard 
                      style={{ backfaceVisibility: 'hidden' }}
                      className="absolute w-full h-full flex flex-col items-center justify-center p-12 cursor-pointer group"
                      onClick={() => !feedback && !insightLoading && setShowFlipped(true)}
                    >
                        <span className="text-gray-500 text-[10px] font-black tracking-widest mb-8 uppercase">Front Side</span>
                        <h2 className="text-5xl font-black text-center">{currentGame.question}</h2>
                        
                        {!currentInsight && (
                          <div className="mt-8">
                              <button
                                onClick={handleGetInsight}
                                disabled={insightLoading}
                                className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-6 py-2 rounded-xl font-black hover:bg-blue-500 hover:text-white transition-all flex items-center justify-center gap-2"
                              >
                                {insightLoading ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
                                {insightLoading ? "GETTING HINT..." : "NEED A HINT?"}
                              </button>
                          </div>
                        )}

                        {currentInsight && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 w-full max-h-32 overflow-y-auto text-sm text-blue-300 bg-blue-900/40 p-4 rounded-xl border border-blue-500/30 text-center"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-2 mb-2 font-bold text-blue-400">
                              <Sparkles size={14} /> AI Insight
                            </div>
                            {currentInsight}
                          </motion.div>
                        )}

                        <div className="absolute bottom-8 text-gray-600 text-xs animate-pulse font-bold">CLICK CARD TO VIEW ANSWER</div>
                    </GlassCard>

                    {/* Back */}
                    <GlassCard 
                      style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                      className="absolute w-full h-full flex flex-col items-center justify-center p-12 bg-purple-500/5 cursor-pointer border-purple-500/30"
                    >
                        <span className="text-purple-400 text-[10px] font-black tracking-widest mb-8 uppercase">Definition / Answer</span>
                        <h2 className="text-4xl font-black text-center text-purple-200">{currentGame.answer}</h2>
                        <p className="text-gray-400 mt-4 text-sm max-w-sm text-center">Did you remember it correctly?</p>
                        
                        <div className="flex gap-4 mt-8 w-full">
                            <button 
                                onClick={(e) => { 
                                  e.stopPropagation(); 
                                  setFeedback('wrong');
                                  setStreak(0);
                                  setTimeout(() => { setFeedback(null); nextLevel(); }, 600);
                                }}
                                className="flex-1 bg-red-500/20 text-red-500 border border-red-500/50 p-4 rounded-xl font-black hover:scale-105 active:scale-95 transition-transform"
                            >
                                FORGOT IT
                            </button>
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleCorrect(5); }}
                                className="flex-1 bg-green-500/80 text-white p-4 rounded-xl font-black hover:scale-105 active:scale-95 transition-transform"
                            >
                                I GOT IT!
                            </button>
                        </div>
                    </GlassCard>
                </motion.div>
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-gray-500">Wait, something went wrong. Let's try another game!</p>
              <button onClick={restart} className="mt-4 text-fox-orange font-bold">Restart</button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
