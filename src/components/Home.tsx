import { FireExtinguisher, Flame, Zap, Play } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { GlassCard } from './shared/GlassCard';
import { UserProfile, PillarId } from '../types';

interface HomeProps {
  user: UserProfile;
  onNavigateToPillars: (pillar?: PillarId) => void;
  onNavigateToSection: (section: string) => void;
}

export const Home: React.FC<HomeProps> = ({ user, onNavigateToPillars, onNavigateToSection }) => {
  const isMilestone = user.stats.streak > 0 && (user.stats.streak % 7 === 0 || user.stats.streak % 10 === 0);

  return (
    <div className="space-y-8 fade-in">
      {!user.learningStyle && (
        <GlassCard className="p-1 items-center bg-gradient-to-r from-fox-orange/20 to-purple-500/20 border-fox-orange/30">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="w-16 h-16 bg-fox-orange/20 rounded-2xl flex items-center justify-center flex-shrink-0 animate-pulse">
              <span className="text-3xl">🧠</span>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h4 className="text-lg font-black tracking-tight">Unlock Your Maximum Learning Potential!</h4>
              <p className="text-sm text-gray-400">Take our 1-minute Learning Style Quiz to get a personalized study path tailored to how you think.</p>
            </div>
            <button 
              onClick={() => onNavigateToSection('learning-quiz')}
              className="bg-fox-orange px-8 py-3 rounded-xl font-bold hover:scale-105 active:scale-95 transition-all text-sm shadow-xl shadow-fox-orange/20"
            >
              Start Quiz
            </button>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="bg-gradient-to-br from-kawaii-pink/20 to-transparent p-8 flex flex-col justify-between border-kawaii-pink/10">
          <div>
            <h3 className="text-3xl font-bold mb-2">Continue Journey</h3>
            <p className="text-gray-400 mb-6">You were practicing <span className="text-kawaii-pink font-bold uppercase tracking-wider">Grammar</span>. Ready to resume?</p>
          </div>
          <button 
            onClick={() => onNavigateToPillars('grammar')}
            className="w-fit bg-gradient-to-r from-kawaii-pink to-purple-500 px-8 py-3 rounded-full font-bold shadow-lg shadow-kawaii-pink/20 hover:scale-105 transition-transform flex items-center gap-2"
          >
            <Play size={20} fill="currentColor" />
            Resume Now
          </button>
        </GlassCard>

        <div className="grid grid-cols-2 gap-4">
          <GlassCard className={`flex flex-col items-center justify-center text-center relative overflow-hidden ${isMilestone ? 'border-kawaii-pink/50 shadow-[0_0_30px_rgba(255,105,180,0.2)]' : ''}`}>
            {isMilestone && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0.1, 0.2, 0.1], scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 bg-kawaii-pink rounded-full blur-3xl -z-10"
              />
            )}
            <motion.div
              animate={isMilestone ? { 
                scale: [1, 1.2, 1],
                filter: ['drop-shadow(0 0 0px rgba(255,105,180,0))', 'drop-shadow(0 0 8px rgba(255,105,180,0.5))', 'drop-shadow(0 0 0px rgba(255,105,180,0))']
              } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Flame className={`${isMilestone ? 'text-kawaii-pink' : 'text-kawaii-rose/80'} transition-transform hover:scale-110`} size={32} />
            </motion.div>
            <p className="text-3xl font-black mt-2">{user.stats.streak}</p>
            <div className="flex flex-col items-center">
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Day Streak</p>
              {isMilestone && (
                <motion.span 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[8px] text-kawaii-pink font-black uppercase mt-1 tracking-tighter"
                >
                  Milestone Reached!
                </motion.span>
              )}
            </div>
          </GlassCard>
          <GlassCard className="flex flex-col items-center justify-center text-center">
            <Zap className="text-yellow-500 transition-transform hover:scale-110" size={32} />
            <p className="text-3xl font-black mt-2">{(user.stats.xp / 1000).toFixed(1)}k</p>
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">XP Points</p>
          </GlassCard>
        </div>
      </div>

      <section>
        <h3 className="font-bold text-xl mb-6 flex items-center gap-2">
          Core Pillars
          <div className="h-px flex-1 bg-white/5 ml-4" />
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {([
            { id: 'grammar', title: 'Grammar', desc: 'Interactive Rules', icon: '📖', color: 'text-fox-orange' },
            { id: 'reading', title: 'Reading', desc: 'Bilingual Stories', icon: '📰', color: 'text-green-400' },
            { id: 'speaking', title: 'Speaking', desc: 'AI Pronunciation', icon: '🎙️', color: 'text-blue-400' },
            { id: 'listening', title: 'Listening', desc: 'Audio Scenarios', icon: '🎧', color: 'text-purple-400' },
          ] as const).map((pillar) => (
            <GlassCard 
              key={pillar.id}
              hoverable
              onClick={() => onNavigateToPillars(pillar.id)}
              className="group"
            >
              <div className={`text-3xl mb-3 transition-transform group-hover:scale-110`}>
                {pillar.icon}
              </div>
              <h4 className="font-bold text-lg">{pillar.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{pillar.desc}</p>
            </GlassCard>
          ))}
        </div>
      </section>
    </div>
  );
};
