import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Mountain, Feather, BookOpen, ChevronLeft, ChevronRight, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StyleSuggestion } from '@/types';

interface StyleSelectionCarouselProps {
  onSelect: (style: string) => void;
  disabled?: boolean;
  styles?: StyleSuggestion[];
}

// Color theme mapping: AI-returned theme name → Tailwind classes
const COLOR_THEMES: Record<string, {
  color: string; border: string; bg: string; buttonGradient: string; titleColor: string; tagBg: string
}> = {
  emerald: {
    color: 'bg-emerald-500',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    buttonGradient: 'from-emerald-400 to-teal-500',
    titleColor: 'text-emerald-800',
    tagBg: 'bg-emerald-100 text-emerald-700',
  },
  blue: {
    color: 'bg-blue-500',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    buttonGradient: 'from-blue-400 to-cyan-500',
    titleColor: 'text-blue-800',
    tagBg: 'bg-blue-100 text-blue-700',
  },
  amber: {
    color: 'bg-amber-500',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    buttonGradient: 'from-amber-400 to-orange-500',
    titleColor: 'text-amber-800',
    tagBg: 'bg-amber-100 text-amber-700',
  },
  purple: {
    color: 'bg-purple-500',
    border: 'border-purple-200',
    bg: 'bg-purple-50',
    buttonGradient: 'from-purple-400 to-violet-500',
    titleColor: 'text-purple-800',
    tagBg: 'bg-purple-100 text-purple-700',
  },
  rose: {
    color: 'bg-rose-500',
    border: 'border-rose-200',
    bg: 'bg-rose-50',
    buttonGradient: 'from-rose-400 to-pink-500',
    titleColor: 'text-rose-800',
    tagBg: 'bg-rose-100 text-rose-700',
  },
  cyan: {
    color: 'bg-cyan-500',
    border: 'border-cyan-200',
    bg: 'bg-cyan-50',
    buttonGradient: 'from-cyan-400 to-teal-500',
    titleColor: 'text-cyan-800',
    tagBg: 'bg-cyan-100 text-cyan-700',
  },
}

// Default fallback styles if AI has not generated styles yet
const DEFAULT_STYLES: StyleSuggestion[] = [
  {
    id: '诗词雅韵',
    title: '诗词雅韵',
    desc: '取自《楚辞》《诗经》',
    longDesc: '经典诗词意境，文雅含蓄，底蕴深厚',
    colorTheme: 'emerald',
    rationale: '经典文学底蕴，意境深远',
  },
  {
    id: '山河大气',
    title: '山河大气',
    desc: '如山川壮丽，气宇轩昂',
    longDesc: '取自名山大川，气势磅礴，宏伟壮阔',
    colorTheme: 'blue',
    rationale: '气势磅礴，格局开阔',
  },
  {
    id: '现代简约',
    title: '现代简约',
    desc: '时尚好听，朗朗上口',
    longDesc: '符合现代审美，简洁清新，易记好听',
    colorTheme: 'amber',
    rationale: '清新自然，悦耳动听',
  },
]

// Icon cycle for dynamic styles
const ICONS = [BookOpen, Mountain, Feather, Sparkles, Palette]

export const StyleSelectionCarousel: React.FC<StyleSelectionCarouselProps> = ({ onSelect, disabled, styles }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeStyles = (styles && styles.length > 0) ? styles : DEFAULT_STYLES;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeStyles.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeStyles.length) % activeStyles.length);
  };

  const currentStyle = activeStyles[currentIndex];
  const theme = COLOR_THEMES[currentStyle.colorTheme] || COLOR_THEMES.amber;
  const Icon = ICONS[currentIndex % ICONS.length];
  const isAIGenerated = styles && styles.length > 0;

  return (
    <div className="w-full max-w-sm mx-auto">
      {isAIGenerated && (
        <div className="flex items-center gap-1.5 mb-2 px-1">
          <span className="text-xs text-purple-600 font-semibold">✨ AI 根据八字为您个性化推荐</span>
        </div>
      )}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative rounded-[32px] p-6 border-2 shadow-lg overflow-hidden min-h-[380px] flex flex-col items-center justify-between",
            theme.bg,
            theme.border
          )}
        >
          {/* Top Badge */}
          <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shadow-md mb-2 text-white", theme.color)}>
            <Icon className="w-7 h-7" />
          </div>

          {/* Title & Subtitle */}
          <div className="text-center space-y-2 mb-4">
            <h3 className={cn("text-xl font-bold tracking-wide", theme.titleColor)}>{currentStyle.title}</h3>
            <p className="text-xs text-gray-600 font-medium opacity-80">{currentStyle.desc}</p>
          </div>

          {/* Style Index Navigation */}
          <div className="flex items-center w-full justify-between gap-2 mb-4">
            <button
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Style indicator dots */}
            <div className="flex gap-2 justify-center">
              {activeStyles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={cn(
                    'w-2 h-2 rounded-full transition-all',
                    i === currentIndex ? cn('w-4', theme.color) : 'bg-gray-300'
                  )}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Bottom Section */}
          <div className="w-full space-y-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl py-2 px-4 text-center">
              <p className="text-xs text-gray-600 font-medium">{currentStyle.longDesc}</p>
            </div>

            {/* AI Rationale (only for AI-generated styles) */}
            {isAIGenerated && currentStyle.rationale && (
              <div className={cn('rounded-xl py-1.5 px-3 text-center text-xs', theme.tagBg)}>
                💡 {currentStyle.rationale}
              </div>
            )}

            <Button
              onClick={() => !disabled && onSelect(currentStyle.id)}
              disabled={disabled}
              className={cn(
                "w-full h-12 rounded-full text-white font-bold text-lg shadow-lg bg-gradient-to-r hover:opacity-90 transition-opacity",
                theme.buttonGradient
              )}
            >
              选择查看
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
