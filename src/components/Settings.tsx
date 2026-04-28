import { 
  Globe, 
  Bell, 
  Eye, 
  Shield, 
  Trash2,
  ChevronRight,
  Monitor,
  Moon,
  Target
} from 'lucide-react';
import React from 'react';
import { GlassCard } from './shared/GlassCard';
import { AppSettings, LanguageId } from '../types';
import { LANGUAGES } from '../constants';

interface SettingsProps {
  settings: AppSettings;
  onUpdateSettings: (updates: Partial<AppSettings>) => void;
  preferredLanguage: LanguageId;
  onLanguageChange: (lang: LanguageId) => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  onUpdateSettings,
  preferredLanguage,
  onLanguageChange
}) => {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-extrabold mb-8">Settings</h2>

      {/* Language Preferences */}
      <GlassCard>
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-fox-orange/20 rounded-2xl text-fox-orange">
            <Globe size={24} />
          </div>
          <div>
            <h3 className="font-bold text-lg">Language Preferences</h3>
            <p className="text-xs text-gray-500">Choose your primary learning path</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.id}
              onClick={() => onLanguageChange(lang.id)}
              className={`
                p-4 rounded-2xl border text-center transition-all
                ${preferredLanguage === lang.id 
                  ? 'border-fox-orange bg-fox-orange/10 scale-105' 
                  : 'border-white/10 hover:border-white/20 hover:bg-white/5'}
              `}
            >
              <div className="text-2xl mb-2">{lang.flag}</div>
              <p className="text-xs font-bold">{lang.name}</p>
            </button>
          ))}
        </div>
      </GlassCard>

      {/* App Configuration */}
      <GlassCard className="divide-y divide-white/5">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-500/20 rounded-xl text-blue-400">
              <Bell size={20} />
            </div>
            <div>
              <p className="font-semibold">Daily Notifications</p>
              <p className="text-xs text-gray-500">Get reminders for your daily streak</p>
            </div>
          </div>
          <button 
            onClick={() => onUpdateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.notificationsEnabled ? 'bg-fox-orange' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-500/20 rounded-xl text-purple-400">
              <Eye size={20} />
            </div>
            <div>
              <p className="font-semibold">High Contrast</p>
              <p className="text-xs text-gray-500">Improve visibility for accessibility</p>
            </div>
          </div>
          <button 
            onClick={() => onUpdateSettings({ highContrast: !settings.highContrast })}
            className={`w-12 h-6 rounded-full transition-colors relative ${settings.highContrast ? 'bg-fox-orange' : 'bg-gray-700'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.highContrast ? 'translate-x-6' : ''}`} />
          </button>
        </div>

        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-yellow-500/20 rounded-xl text-yellow-400">
              <Target size={20} />
            </div>
            <div>
              <p className="font-semibold">Daily Goal (XP)</p>
              <p className="text-xs text-gray-500">Set your ambition level</p>
            </div>
          </div>
          <select 
            value={settings.dailyGoal}
            onChange={(e) => onUpdateSettings({ dailyGoal: Number(e.target.value) })}
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 outline-none text-sm font-bold"
          >
            <option value={100} className="bg-fox-dark text-white">Casual (100 XP)</option>
            <option value={500} className="bg-fox-dark text-white">Regular (500 XP)</option>
            <option value={1000} className="bg-fox-dark text-white">Serious (1000 XP)</option>
            <option value={2000} className="bg-fox-dark text-white">Insane (2000 XP)</option>
          </select>
        </div>
      </GlassCard>

      {/* Account Safety */}
      <GlassCard className="border-red-500/20 bg-red-500/5">
        <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2">
          <Shield size={18} />
          Account Safety
        </h3>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 rounded-xl border border-red-500/20 hover:bg-red-500/10 transition-colors group">
            <div className="flex items-center gap-3">
              <Trash2 size={18} className="text-red-400" />
              <div className="text-left">
                <p className="font-semibold text-red-200">Reset Learning Progress</p>
                <p className="text-[10px] text-red-400/60 uppercase">This action cannot be undone</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-red-500/40 group-hover:text-red-500 transition-colors" />
          </button>
        </div>
      </GlassCard>

      <div className="text-center pt-8">
        <p className="text-xs text-gray-600">FoxMind AI Version 2.0.4 • Made with ✨ Gemini</p>
      </div>
    </div>
  );
};
