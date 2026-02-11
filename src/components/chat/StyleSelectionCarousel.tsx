import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Mountain, Feather, BookOpen, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StyleSelectionCarouselProps {
  onSelect: (style: string) => void;
  disabled?: boolean;
}

const STYLES = [
  {
    id: '诗词雅韵',
    title: '诗词雅韵系列',
    desc: '取自《楚辞》《诗经》，文化底蕴深厚',
    longDesc: '取自经典诗词，意境优美，文雅含蓄',
    icon: BookOpen,
    color: 'bg-emerald-500',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    buttonGradient: 'from-emerald-400 to-teal-500',
    examples: [
      { char: '沐泽', locked: false }, // First item fully unlocked
      { char: '怀', locked: true },
      { char: '言', locked: true },
      { char: '景', locked: true },
      { char: '子', locked: true },
      { char: '清', locked: true }
    ]
  },
  {
    id: '山河大气',
    title: '山河大气系列',
    desc: '如山川壮丽，气宇轩昂，胸怀宽广',
    longDesc: '取自名山大川，气势磅礴，宏伟壮阔',
    icon: Mountain,
    color: 'bg-blue-500',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    buttonGradient: 'from-blue-400 to-cyan-500',
    examples: [
      { char: '浩宇', locked: false },
      { char: '星', locked: true },
      { char: '凌', locked: true },
      { char: '宇', locked: true },
      { char: '辰', locked: true },
      { char: '岳', locked: true }
    ]
  },
  {
    id: '现代简约',
    title: '现代简约系列',
    desc: '时尚好听，朗朗上口，清新自然',
    longDesc: '符合现代审美，简单易记，悦耳动听',
    icon: Feather,
    color: 'bg-amber-500',
    border: 'border-amber-200',
    bg: 'bg-amber-50',
    buttonGradient: 'from-amber-400 to-orange-500',
    examples: [
      { char: '安然', locked: false },
      { char: '乐', locked: true },
      { char: '知', locked: true },
      { char: '予', locked: true },
      { char: '然', locked: true },
      { char: '宁', locked: true }
    ]
  }
];

export const StyleSelectionCarousel: React.FC<StyleSelectionCarouselProps> = ({ onSelect, disabled }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % STYLES.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + STYLES.length) % STYLES.length);
  };

  const currentStyle = STYLES[currentIndex];
  const Icon = currentStyle.icon;

  return (
    <div className="w-full max-w-sm mx-auto">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            "relative rounded-[32px] p-6 border-2 shadow-lg overflow-hidden min-h-[420px] flex flex-col items-center justify-between",
            currentStyle.bg,
            currentStyle.border
          )}
        >
          {/* Top Badge */}
          <div className={cn("w-14 h-14 rounded-full flex items-center justify-center shadow-md mb-2 text-white", currentStyle.color)}>
            <Icon className="w-7 h-7" />
          </div>

          {/* Title & Subtitle */}
          <div className="text-center space-y-2 mb-6">
            <h3 className="text-xl font-bold text-gray-800 tracking-wide">{currentStyle.title}</h3>
            <p className="text-xs text-gray-600 font-medium opacity-80">{currentStyle.desc}</p>
          </div>

          {/* Examples Grid with Navigation */}
          <div className="flex items-center w-full justify-between gap-2 mb-6">
            <button 
              onClick={handlePrev}
              className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-2 justify-center">
              {currentStyle.examples.map((ex, i) => (
                <div 
                  key={i} 
                  className="w-10 h-12 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center border border-gray-100 relative overflow-hidden"
                >
                  {/* Handle full names vs masked chars */}
                  {!ex.locked ? (
                    <div className="flex flex-col items-center justify-center h-full py-1">
                      {ex.char.split('').map((c, idx) => (
                        <span key={idx} className="text-sm font-serif font-bold text-gray-800 leading-none my-0.5">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-1 gap-1">
                      <span className="text-xs text-gray-300 font-serif leading-none">*</span>
                      <span className="text-xs text-gray-300 font-serif leading-none">*</span>
                    </div>
                  )}
                </div>
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
          <div className="w-full space-y-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl py-2 px-4 text-center">
              <p className="text-xs text-gray-600 font-medium">{currentStyle.longDesc}</p>
            </div>

            <Button
              onClick={() => !disabled && onSelect(currentStyle.id)}
              disabled={disabled}
              className={cn(
                "w-full h-12 rounded-full text-white font-bold text-lg shadow-lg bg-gradient-to-r hover:opacity-90 transition-opacity",
                currentStyle.buttonGradient
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
