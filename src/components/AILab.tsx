import { Wand2, Loader2, Sparkles, Send } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GlassCard } from './shared/GlassCard';
import { analyzeText } from '../lib/gemini';
import { LanguageId } from '../types';
import { LANGUAGES } from '../constants';

interface AILabProps {
  languageId: LanguageId;
}

export const AILab: React.FC<AILabProps> = ({ languageId }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const lang = LANGUAGES.find(l => l.id === languageId) || LANGUAGES[0];

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setResult(null);
    try {
      const analysis = await analyzeText(input, lang.name);
      setResult(analysis);
    } catch (error) {
      setResult("### Error\nProfessor Fox encountered an issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-gradient-to-br from-fox-orange to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl relative">
          <Wand2 size={40} className="text-white" />
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-white rounded-3xl -z-10 blur-xl"
          />
        </div>
        <h2 className="text-4xl font-black">AI Linguistic Lab</h2>
        <p className="text-gray-400 max-w-xl mx-auto">
          Input any phrase in <span className="text-fox-orange font-bold uppercase tracking-widest">{lang.name}</span> for a deep architectural analysis of its grammar and cultural nuance.
        </p>
      </div>

      <GlassCard className="relative p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Enter ${lang.name} text to analyze...`}
          className="w-full h-48 bg-transparent border-none outline-none p-6 text-xl placeholder:text-gray-700 resize-none font-medium"
        />
        <div className="p-4 border-t border-white/5 flex justify-between items-center bg-white/[0.02] rounded-b-3xl">
          <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase font-black text-gray-500 flex items-center gap-2">
              <Sparkles size={10} />
              Powered by Gemini
            </span>
          </div>
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !input.trim()}
            className="flex items-center gap-2 bg-fox-orange px-6 py-2 rounded-xl font-bold shadow-lg shadow-fox-orange/20 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Analyzing
              </>
            ) : (
              <>
                <Send size={18} />
                Ask Prof. Fox
              </>
            )}
          </button>
        </div>
      </GlassCard>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="prose-invert"
          >
            <GlassCard className="p-10 border-fox-orange/20 overflow-hidden">
              <div className="markdown-body">
                <ReactMarkdown>{result}</ReactMarkdown>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
