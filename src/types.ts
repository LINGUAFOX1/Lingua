export type LanguageId = 'en' | 'fr' | 'de' | 'es' | 'ja' | 'ko';

export interface Language {
  id: LanguageId;
  name: string;
  flag: string;
  code: string;
  rtl?: boolean;
}

export type PillarId = 'grammar' | 'reading' | 'speaking' | 'listening';

export interface UserStats {
  streak: number;
  xp: number;
  level: number;
}

export interface UserProfile {
  name: string;
  avatar: string;
  avatarConfig?: {
    seed: string;
    backgroundColor: string;
    style: string;
  };
  stats: UserStats;
  preferredLanguage: LanguageId;
  learningStyle?: 'Visual' | 'Auditory' | 'Reading' | 'Kinesthetic';
}

export interface GrammarRule {
  rule: string;
  desc: string;
  example: string;
  details?: string;
  colorCoding?: {
    text: string;
    highlights: { word: string; color: string; label?: string }[];
  };
  interactive?: {
    prompt: string;
    options: string[];
    correct: number;
    explanation: string;
  };
}

export interface ReadingData {
  title: string;
  content: string;
  translation: string;
  quiz?: {
    question: string;
    options: string[];
    correct: number;
  }[];
}

export interface ListeningData {
  audio: string;
  options: string[];
  correct: number;
}

export interface Lesson {
  id: string;
  title: string;
  grammar: GrammarRule[];
  reading: ReadingData[];
  listening: ListeningData[];
}

export type PillarData = Lesson[];

export interface AppSettings {
  dailyGoal: number;
  notificationsEnabled: boolean;
  highContrast: boolean;
}
