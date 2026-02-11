import React from 'react';
import { NameDetail } from '@/types';
import { motion } from 'framer-motion';
import { Sparkles, RefreshCw, List, Heart, BookOpen, Wind, ChevronDown, Check } from 'lucide-react';
import { WuxingTag } from '@/components/ui/wuxing-tag';
import { cn } from '@/lib/utils';

interface InlineNamePreviewProps {
  name: NameDetail;
  onRefresh: () => void;
  onViewDetail: () => void;
  onViewList: () => void;
  onFavorite: () => void;
  onSelect: () => void;
  isFavorite?: boolean;
}

export const InlineNamePreview: React.FC<InlineNamePreviewProps> = ({ 
  name, 
  onRefresh, 
  onViewDetail,
  onViewList,
  onFavorite,
  onSelect,
  isFavorite 
}) => {
  const chars = name.name.split('');
  const pinyins = name.pinyin.split(' ');

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden max-w-sm mx-auto my-6"
    >
      {/* Top Gradient Area */}
      <div className="bg-gradient-to-b from-orange-50/50 to-white pt-6 px-6 pb-2">
        {/* Pinyin & Chars */}
        <div className="flex justify-center gap-4 mb-3">
          {chars.map((char, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xs text-gray-400 font-medium">{pinyins[i]}</span>
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-orange-100 flex items-center justify-center relative overflow-hidden">
                <span className="text-3xl font-serif font-bold text-gray-800 z-10">{char}</span>
                {/* Subtle decoration */}
                <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-orange-50 rounded-full opacity-50" />
              </div>
              {/* Tag for each char if we had data, for now using wuxing[i] if available */}
              {name.wuxing[i] && (
                <div className="mt-1">
                  <WuxingTag wuxing={name.wuxing[i]} size="xs" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Full Name & Rating */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <span className="text-lg font-bold text-gray-600 font-serif tracking-wide">{name.name}</span>
          <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-[10px] px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>综合评价：大吉</span>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="px-5 pb-5 space-y-4">
        {/* Meaning */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <BookOpen className="w-4 h-4 text-orange-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-orange-900 mb-1">寓意</h4>
            <p className="text-sm text-gray-700 leading-relaxed">{name.meaning.slice(0, 20)}...</p>
            <p className="text-xs text-orange-600 mt-1 font-medium">《诗经·大雅》</p>
          </div>
        </div>

        {/* Wuxing Analysis */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Wind className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-blue-900 mb-1">五行分析</h4>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span>{[...name.wuxing].join('')}组合</span>
              <span className="text-blue-600 font-medium">补{name.wuxing[0]}，完全符合八字喜用</span>
            </div>
          </div>
        </div>

        {/* Expand Link */}
        <button 
          onClick={onViewDetail}
          className="w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-gray-600 py-2 transition-colors"
        >
          <span>查看完整解析</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      {/* Bottom Action Bar */}
      <div className="p-4 pt-0 space-y-3">
        <div className="flex gap-3">
          <button 
            onClick={onFavorite}
            className={cn(
              "flex-1 h-11 rounded-xl border flex items-center justify-center gap-1.5 transition-all active:scale-95",
              isFavorite 
                ? "bg-red-50 border-red-200 text-red-500" 
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            <span className="text-sm font-medium">收藏</span>
          </button>

          <button 
            onClick={onRefresh}
            className="flex-1 h-11 rounded-xl border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm font-medium">换一个</span>
          </button>

          <button 
            onClick={onSelect}
            className="flex-[1.5] h-11 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-200 flex items-center justify-center gap-1.5 transition-all hover:opacity-90 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-bold">就选这个</span>
          </button>
        </div>
        
        <button 
          onClick={onViewList}
          className="w-full flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-orange-500 transition-colors py-1"
        >
          <List className="w-3 h-3" />
          <span>查看该系列全部名字</span>
        </button>
      </div>
    </motion.div>
  );
};
