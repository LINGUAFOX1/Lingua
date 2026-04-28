import { 
  Home, 
  Layers, 
  Wand2, 
  User, 
  Settings, 
  LogOut,
  Gamepad2,
  Brain
} from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';
import { UserProfile } from '../types';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  user: UserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, user }) => {
  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'pillars', label: 'Pillars', icon: Layers },
    { id: 'games', label: 'Games', icon: Gamepad2 },
    { id: 'ai-lab', label: 'AI Lab', icon: Wand2 },
    { id: 'learning-quiz', label: 'Style Quiz', icon: Brain },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-20 md:w-64 bg-[#0a060d] border-r border-white/5 flex flex-col p-4 fixed h-full z-50">
      <div 
        className="flex items-center gap-3 px-2 mb-10 cursor-pointer"
        onClick={() => onSectionChange('home')}
      >
        <div className="w-10 h-10 bg-gradient-to-br from-fox-orange to-orange-500 rounded-xl flex items-center justify-center text-white text-2xl shadow-lg shadow-fox-orange/20">
          🦊
        </div>
        <span className="hidden md:block font-extrabold text-xl">
          Lingua<span className="text-fox-orange">Fox</span>
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`
                w-full flex items-center gap-4 p-3 rounded-xl transition-all
                ${isActive 
                  ? 'bg-fox-orange text-white shadow-lg shadow-fox-orange/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'}
              `}
            >
              <Icon size={24} className="min-w-[24px]" />
              <span className="hidden md:block font-semibold">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/5 pt-4">
        <div 
          className="flex items-center gap-3 p-2 bg-white/5 rounded-xl overflow-hidden cursor-pointer hover:bg-white/10 transition-colors"
          onClick={() => onSectionChange('profile')}
        >
          <img 
            src={user.avatar} 
            alt="Profile" 
            className="w-10 h-10 rounded-lg bg-fox-orange/20 object-cover"
          />
          <div className="hidden md:block text-xs truncate">
            <p className="font-bold">{user.name}</p>
            <p className="text-gray-500">Lvl {user.stats.level}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
