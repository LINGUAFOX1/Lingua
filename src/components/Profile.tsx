import { 
  Trophy, 
  Target, 
  Clock, 
  Calendar,
  CloudLightning as Lightning,
  Edit2,
  Camera,
  Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import { GlassCard } from './shared/GlassCard';
import { UserProfile } from '../types';

interface ProfileProps {
  user: UserProfile;
  onUpdateUser: (updates: Partial<UserProfile>) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(user.name);
  const [showCustomizer, setShowCustomizer] = useState(false);
  const [avatarConfig, setAvatarConfig] = useState(user.avatarConfig || {
    seed: 'Miso',
    backgroundColor: 'b6e3f4',
    style: 'adventurer'
  });

  const STYLE_ICONS = {
    Visual: { icon: Brain, color: "text-blue-400" },
    Auditory: { icon: Brain, color: "text-purple-400" },
    Reading: { icon: Brain, color: "text-fox-orange" },
    Kinesthetic: { icon: Brain, color: "text-green-400" }
  };

  const handleSave = () => {
    const avatarUrl = `https://api.dicebear.com/7.x/${avatarConfig.style}/svg?seed=${avatarConfig.seed}&backgroundColor=${avatarConfig.backgroundColor}`;
    onUpdateUser({ 
      name: tempName,
      avatar: avatarUrl,
      avatarConfig
    });
    setIsEditing(false);
    setShowCustomizer(false);
  };

  const updateAvatar = (updates: Partial<typeof avatarConfig>) => {
    setAvatarConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Card */}
      <GlassCard className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-kawaii-pink/30 to-purple-600/30 blur-2xl -z-10" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 py-4">
          <div className="relative group">
            <div className="relative">
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="w-32 h-32 rounded-3xl object-cover ring-4 ring-kawaii-pink/20 shadow-2xl transition-transform group-hover:scale-105 bg-white/5"
              />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-1 border-2 border-dashed border-kawaii-pink/30 rounded-3xl -z-10"
              />
            </div>
            <button 
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="absolute -bottom-2 -right-2 p-2 bg-kawaii-pink rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Camera size={16} />
            </button>
          </div>

          <div className="flex-1 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 outline-none focus:border-kawaii-pink text-2xl font-bold"
                  />
                  <button 
                    onClick={handleSave}
                    className="bg-kawaii-pink px-4 py-1 rounded-lg text-sm font-bold"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <h2 className="text-4xl font-extrabold">{user.name}</h2>
                  <button 
                    onClick={() => setIsEditing(true)}
                    className="p-2 hover:bg-white/5 rounded-lg transition-colors text-gray-400 hover:text-white"
                  >
                    <Edit2 size={18} />
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center justify-center md:justify-start gap-4 text-gray-400">
              <p className="flex items-center gap-2">
                <Lightning size={14} className="text-kawaii-pink" />
                Advanced Scholar
              </p>
              {user.learningStyle && (
                <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded-full border border-white/5 text-[10px] font-black uppercase tracking-widest text-fox-orange">
                  <Brain size={12} className={STYLE_ICONS[user.learningStyle].color} />
                  {user.learningStyle} Learner
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <p className="text-3xl font-black text-kawaii-pink">{user.stats.level}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Level</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-3xl font-black">{user.stats.streak}</p>
              <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500">Streak</p>
            </div>
          </div>
        </div>
      </GlassCard>

      <AnimatePresence>
        {showCustomizer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <GlassCard className="border-kawaii-pink/30 bg-kawaii-pink/5">
              <h3 className="font-bold text-lg mb-6">Customize Your Avatar</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-500 mb-3 tracking-widest">Select Character Style</p>
                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                      {['adventurer', 'bottts', 'pixel-art', 'notionists', 'lorelei'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateAvatar({ style: s })}
                          className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all whitespace-nowrap ${avatarConfig.style === s ? 'bg-kawaii-pink border-kawaii-pink text-white shadow-lg' : 'border-white/10 hover:border-white/30 bg-white/5 text-gray-400'}`}
                        >
                          {s.replace('-', ' ').toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs uppercase font-bold text-gray-500 mb-3 tracking-widest">Base Seed (Name)</p>
                    <div className="grid grid-cols-3 gap-2">
                      {['Miso', 'Sasha', 'Bear', 'Fox', 'Luna', 'Kobi'].map(s => (
                        <button
                          key={s}
                          onClick={() => updateAvatar({ seed: s })}
                          className={`p-2 rounded-lg text-xs border transition-all ${avatarConfig.seed === s ? 'bg-white/10 border-kawaii-pink text-kawaii-pink' : 'border-white/5 bg-white/5 text-gray-500'}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-xs uppercase font-bold text-gray-500 mb-3 tracking-widest">Background Aura</p>
                    <div className="flex flex-wrap gap-3">
                      {['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf', '0a060d'].map(c => (
                        <button
                          key={c}
                          onClick={() => updateAvatar({ backgroundColor: c })}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${avatarConfig.backgroundColor === c ? 'border-white scale-110 shadow-lg' : 'border-transparent'}`}
                          style={{ backgroundColor: `#${c}` }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      onClick={handleSave}
                      className="flex-1 bg-kawaii-pink text-white font-bold py-3 rounded-2xl shadow-xl shadow-kawaii-pink/20 hover:scale-[1.02] transition-transform"
                    >
                      Apply Changes
                    </button>
                    <button 
                      onClick={() => setShowCustomizer(false)}
                      className="px-6 border border-white/10 rounded-2xl text-gray-400 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Achievements */}
        <GlassCard className="md:col-span-2">
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            Recent Achievements
          </h3>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: '7 Day Streak', icon: '🔥', date: 'Yesterday' },
              { title: 'Grammar Pro', icon: '✍️', date: '2 days ago' },
              { title: 'Word Master', icon: '📚', date: 'Last week' },
              { title: 'Voice Expert', icon: '🎙️', date: '2 weeks ago' },
            ].map((ach, i) => (
              <div key={i} className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center transition-all hover:bg-white/10 hover:border-white/10">
                <div className="text-2xl mb-2">{ach.icon}</div>
                <p className="text-sm font-bold truncate">{ach.title}</p>
                <p className="text-[10px] text-gray-500">{ach.date}</p>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Goals */}
        <GlassCard>
          <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
            <Target size={20} className="text-fox-orange" />
            Daily Goal
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">XP Progress</span>
                <span className="font-bold">450 / 500</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '90%' }}
                  className="h-full bg-fox-orange"
                />
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <Clock size={16} />
              <p>Estimated 5 mins to finish</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Activity Timeline */}
      <GlassCard>
        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
          <Calendar size={20} className="text-blue-400" />
          Learning History
        </h3>
        <div className="space-y-4">
          {[
            { action: 'Completed French Grammar', time: '2 hours ago', xp: '+50' },
            { action: 'Read "The Urban Fox"', time: 'Yesterday', xp: '+120' },
            { action: 'Practice Speaking Module', time: '2 days ago', xp: '+80' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-fox-orange" />
                <div>
                  <p className="font-semibold">{item.action}</p>
                  <p className="text-xs text-gray-500">{item.time}</p>
                </div>
              </div>
              <span className="text-fox-orange font-bold text-sm tracking-widest">{item.xp} XP</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
};
