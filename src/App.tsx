/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Sidebar } from './components/Sidebar';
import { Home } from './components/Home';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { Pillars } from './components/Pillars';
import { AILab } from './components/AILab';
import { Games } from './components/Games';
import { LearningQuiz } from './components/LearningQuiz';
import { UserProfile, AppSettings, LanguageId, PillarId } from './types';
import { LANGUAGES } from './constants';
import { Bell } from 'lucide-react';

const STORAGE_KEY_USER = 'foxmind_user';
const STORAGE_KEY_SETTINGS = 'foxmind_settings';

const DEFAULT_USER: UserProfile = {
  name: 'Miso',
  avatar: '/regenerated_image_1777389089033.png',
  avatarConfig: {
    seed: 'Miso',
    backgroundColor: 'b6e3f4',
    style: 'adventurer'
  },
  preferredLanguage: 'en',
  stats: {
    streak: 7,
    xp: 1200,
    level: 12
  }
};

const DEFAULT_SETTINGS: AppSettings = {
  dailyGoal: 500,
  notificationsEnabled: true,
  highContrast: false,
};

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  const [activePillar, setActivePillar] = useState<PillarId | undefined>(undefined);
  const [user, setUser] = useState<UserProfile>(DEFAULT_USER);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [toast, setToast] = useState<{ message: string; type?: 'info' | 'success' } | null>(null);

  // Load from local storage
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    const savedSettings = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser({
          ...DEFAULT_USER,
          ...parsed,
          stats: { ...DEFAULT_USER.stats, ...(parsed.stats || {}) }
        });
      } catch (e) {
        console.error('Failed to parse saved user', e);
      }
    }
    if (savedSettings) {
      try {
        setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
      } catch (e) {
        console.error('Failed to parse saved settings', e);
      }
    }
  }, []);

  // Save to local storage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  }, [user, settings]);

  const showToast = (message: string) => {
    setToast({ message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleNavigateToPillars = (pillar?: PillarId) => {
    setActivePillar(pillar);
    setActiveSection('pillars');
  };

  const handleUpdateUser = (updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
    showToast('Profile updated!');
  };

  const handleUpdateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    showToast('Settings saved!');
  };

  const handleLanguageChange = (lang: LanguageId) => {
    setUser(prev => ({ ...prev, preferredLanguage: lang }));
    const languageName = LANGUAGES.find(l => l.id === lang)?.name;
    showToast(`Path switched to ${languageName}`);
  };

  const currentLang = LANGUAGES.find(l => l.id === user.preferredLanguage) || LANGUAGES[0];

  return (
    <div className={`min-h-screen flex selection:bg-fox-orange selection:text-white ${settings.highContrast ? 'contrast-125 saturate-150' : ''}`}>
      <Sidebar 
        activeSection={activeSection} 
        onSectionChange={setActiveSection} 
        user={user}
      />

      <main className="flex-1 ml-20 md:ml-64 p-4 md:p-12 relative overflow-x-hidden">
        {/* Header decoration */}
        <div className="absolute top-0 right-0 w-1/2 h-64 bg-kawaii-pink/10 blur-3xl -z-10 rounded-full" />

        {/* Top bar */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.div 
              initial={{ rotate: -10 }}
              animate={{ rotate: 10 }}
              transition={{ repeat: Infinity, duration: 4, repeatType: 'reverse' }}
              className="w-16 h-16 rounded-2xl overflow-hidden shadow-2xl shadow-fox-orange/20 ring-2 ring-fox-orange/20 bg-fox-orange/10"
            >
              <img src={user.avatar} alt="Fox Mascot" className="w-full h-full object-cover" />
            </motion.div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Bonjour, {user.name.split(' ')[0]}!</h1>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Mastering <span className="text-fox-orange">{currentLang.name} {currentLang.flag}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar">
            {LANGUAGES.map(l => (
              <button
                key={l.id}
                onClick={() => handleLanguageChange(l.id)}
                className={`
                  w-10 h-10 rounded-xl flex items-center justify-center transition-all text-xl
                  ${user.preferredLanguage === l.id 
                    ? 'bg-fox-orange text-white shadow-lg' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'}
                `}
                title={l.name}
              >
                {l.flag}
              </button>
            ))}
          </div>
        </header>

        {/* Content area */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection + user.preferredLanguage}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {activeSection === 'home' && (
                <Home 
                  user={user} 
                  onNavigateToPillars={handleNavigateToPillars} 
                  onNavigateToSection={setActiveSection}
                />
              )}
              {activeSection === 'pillars' && (
                <Pillars 
                  initialPillar={activePillar} 
                  languageId={user.preferredLanguage} 
                  onGrantPoints={(p) => setUser(prev => ({ 
                    ...prev, 
                    stats: { ...prev.stats, xp: prev.stats.xp + p } 
                  }))}
                />
              )}
              {activeSection === 'games' && (
                <Games 
                  languageId={user.preferredLanguage} 
                  onGrantPoints={(p) => setUser(prev => ({ 
                    ...prev, 
                    stats: { ...prev.stats, xp: prev.stats.xp + p } 
                  }))} 
                />
              )}
              {activeSection === 'ai-lab' && (
                <AILab languageId={user.preferredLanguage} />
              )}
              {activeSection === 'profile' && (
                <Profile user={user} onUpdateUser={handleUpdateUser} />
              )}
              {activeSection === 'learning-quiz' && (
                <LearningQuiz 
                  onComplete={(style) => {
                    handleUpdateUser({ learningStyle: style });
                    setUser(prev => ({ 
                      ...prev, 
                      stats: { ...prev.stats, xp: prev.stats.xp + 50 } 
                    }));
                    setActiveSection('home');
                  }} 
                />
              )}
              {activeSection === 'settings' && (
                <Settings 
                  settings={settings} 
                  onUpdateSettings={handleUpdateSettings}
                  preferredLanguage={user.preferredLanguage}
                  onLanguageChange={handleLanguageChange}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              className="fixed bottom-8 right-8 z-[100]"
            >
              <div className="bg-fox-orange text-white px-6 py-3 rounded-2xl shadow-2xl shadow-fox-orange/30 font-bold flex items-center gap-3">
                <Bell size={18} />
                {toast.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
