import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GlassCard } from './shared/GlassCard';
import { 
  Eye, 
  Headphones, 
  PenTool, 
  Activity, 
  ChevronRight, 
  Sparkles,
  RefreshCw,
  Award
} from 'lucide-react';

interface LearningQuizProps {
  onComplete: (style: 'Visual' | 'Auditory' | 'Reading' | 'Kinesthetic') => void;
}

const QUESTIONS = [
  {
    id: 1,
    question: "When learning a new word in a foreign language, what helps you most?",
    options: [
      { text: "Seeing a picture or an icon of the object", type: "Visual" },
      { text: "Hearing someone pronounce it accurately", type: "Auditory" },
      { text: "Writing the word down several times", type: "Reading" },
      { text: "Using the word in a gesture or roleplay", type: "Kinesthetic" },
    ]
  },
  {
    id: 2,
    question: "How do you prefer to receive feedback on your pronunciation?",
    options: [
      { text: "Seeing a chart of your pitch accuracy", type: "Visual" },
      { text: "Listening to a comparison with a native speaker", type: "Auditory" },
      { text: "Reading a text description of what to change", type: "Reading" },
      { text: "Practicing the mouth movements with a mirror", type: "Kinesthetic" },
    ]
  },
  {
    id: 3,
    question: "What's your favorite way to study a long reading passage?",
    options: [
      { text: "Color-coding the different parts of speech", type: "Visual" },
      { text: "Reading the passage out loud to yourself", type: "Auditory" },
      { text: "Summarizing the passage in your own notes", type: "Reading" },
      { text: "Walking around while repeating the key points", type: "Kinesthetic" },
    ]
  },
  {
    id: 4,
    question: "In a busy classroom, what distracts you the most?",
    options: [
      { text: "People walking past or moving around", type: "Visual" },
      { text: "Loud noises or side conversations", type: "Auditory" },
      { text: "Grammar errors in a text you're reading", type: "Reading" },
      { text: "Being forced to sit still for too long", type: "Kinesthetic" },
    ]
  }
];

const STYLE_INFO = {
  Visual: {
    icon: Eye,
    color: "text-blue-400",
    bg: "bg-blue-400/20",
    desc: "You learn best by seeing. Charts, diagrams, and color-coded grammar rules are your best friends in LinguaFox!"
  },
  Auditory: {
    icon: Headphones,
    color: "text-purple-400",
    bg: "bg-purple-400/20",
    desc: "You have a natural ear for language. Focus on our Listening and Speaking pillars to excel in your journey."
  },
  Reading: {
    icon: PenTool,
    color: "text-fox-orange",
    bg: "bg-fox-orange/20",
    desc: "You process information through text. Detailed grammar explanations and reading transcriptions work wonders for you."
  },
  Kinesthetic: {
    icon: Activity,
    color: "text-green-400",
    bg: "bg-green-400/20",
    desc: "You learn through action. Interactive games and the Sentence Scramble challenge will keep your brain firing."
  }
};

export const LearningQuiz: React.FC<LearningQuizProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    Visual: 0,
    Auditory: 0,
    Reading: 0,
    Kinesthetic: 0
  });
  const [result, setResult] = useState<keyof typeof STYLE_INFO | null>(null);

  const handleAnswer = (type: string) => {
    const newScores = { ...scores, [type]: scores[type] + 1 };
    setScores(newScores);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Calculate winner
      let maxPoints = -1;
      let winner: keyof typeof STYLE_INFO = 'Visual';
      
      Object.entries(newScores).forEach(([style, points]) => {
        if (points > maxPoints) {
          maxPoints = points;
          winner = style as keyof typeof STYLE_INFO;
        }
      });
      
      setResult(winner);
    }
  };

  const reset = () => {
    setCurrentStep(0);
    setScores({ Visual: 0, Auditory: 0, Reading: 0, Kinesthetic: 0 });
    setResult(null);
  };

  if (result) {
    const info = STYLE_INFO[result];
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto"
      >
        <GlassCard className="p-12 text-center border-t-8 border-fox-orange/30">
          <div className={`w-24 h-24 ${info.bg} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl`}>
            <info.icon className={info.color} size={48} />
          </div>
          <h2 className="text-4xl font-black mb-4">You are a {result} Learner!</h2>
          <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg mx-auto">
            {info.desc}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
              <Sparkles className="text-yellow-400" size={20} />
              <span className="text-sm font-bold">Personalized Roadmap Unlocked</span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
              <Award className="text-fox-orange" size={20} />
              <span className="text-sm font-bold">+50 Study Bonus Points</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onComplete(result as any)}
              className="w-full bg-fox-orange py-4 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-fox-orange/20"
            >
              APPLY TO PROFILE
            </button>
            <button 
              onClick={reset}
              className="w-full bg-white/5 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
            >
              <RefreshCw size={18} />
              Retake Quiz
            </button>
          </div>
        </GlassCard>
      </motion.div>
    );
  }

  const currentQ = QUESTIONS[currentStep];
  const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-12">
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-3xl font-black mb-2">Learning Style Advisor</h2>
            <p className="text-gray-500 font-bold tracking-tight">Question {currentStep + 1} of {QUESTIONS.length}</p>
          </div>
          <div className="text-right">
            <span className="text-fox-orange font-black text-2xl">{Math.round(progress)}%</span>
            <p className="text-[10px] uppercase font-black text-gray-600 tracking-widest">Complete</p>
          </div>
        </div>
        <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-fox-orange"
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <GlassCard className="p-10 mb-8">
            <h3 className="text-2xl font-black mb-10 leading-tight">
              {currentQ.question}
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {currentQ.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(opt.type)}
                  className="group flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-fox-orange hover:bg-fox-orange/5 transition-all text-left"
                >
                  <span className="font-bold text-lg pr-8">{opt.text}</span>
                  <div className="w-10 h-10 rounded-full border-2 border-white/10 flex items-center justify-center group-hover:border-fox-orange group-hover:bg-fox-orange transition-colors">
                    <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
