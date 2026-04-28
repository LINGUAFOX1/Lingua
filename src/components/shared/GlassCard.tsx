import { motion } from 'motion/react';
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  hoverable?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  style,
  onClick,
  hoverable = false 
}) => {
  return (
    <motion.div
      style={style}
      whileHover={hoverable ? { scale: 1.02, borderColor: 'rgba(230, 126, 34, 0.4)' } : {}}
      onClick={onClick}
      className={`
        bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6
        transition-colors duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
};
