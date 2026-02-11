import React from 'react';
import { CharacterInfo } from '@/types';
import { cn } from '@/lib/utils';
import { WuxingTag } from '@/components/ui/wuxing-tag';

interface CharacterAnalysisProps {
  characters: CharacterInfo[];
  className?: string;
}

export const CharacterAnalysis: React.FC<CharacterAnalysisProps> = ({ characters, className }) => {
  return (
    <div className={cn("space-y-6", className)}>
      {characters.map((char, index) => (
        <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
          <div className="flex gap-4">
            {/* Big Char */}
            <div className="flex flex-col items-center shrink-0">
               <div className="w-16 h-16 bg-amber-50 rounded-lg flex items-center justify-center text-3xl font-serif font-bold text-gray-800 border border-amber-100">
                 {char.char}
               </div>
               <span className="text-sm font-medium text-gray-500 mt-2">{char.pinyin}</span>
               <WuxingTag wuxing={char.wuxing} size="sm" className="mt-1" />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-2">
              <div>
                <h4 className="text-sm font-bold text-gray-800 mb-1">字义解析</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{char.explanation}</p>
              </div>
              
              <div className="bg-gray-50 p-2 rounded text-xs text-gray-500">
                 <span className="font-semibold text-gray-700">出处：</span>{char.source}
              </div>

              <div className="flex gap-4 text-xs text-gray-400 border-t pt-2 border-gray-100">
                <span>康熙笔画：{char.kangxi.strokes}</span>
                <span>字典页码：{char.kangxi.page}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
