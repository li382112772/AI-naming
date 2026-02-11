import React from 'react';
import { NameDetail } from '@/types';
import { cn } from '@/lib/utils';
import { NameScore } from './NameScore';
import { CharacterAnalysis } from './CharacterAnalysis';
import { YinyunAnalysis } from './YinyunAnalysis';
import { AIBadge } from '@/components/ui/ai-badge';
import { WuxingTag } from '@/components/ui/wuxing-tag';
import { ChevronLeft, Share2, Heart, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface NameDetailPageProps {
  name: NameDetail;
  onBack: () => void;
  className?: string;
}

export const NameDetailPage: React.FC<NameDetailPageProps> = ({ name, onBack, className }) => {
  const navigate = useNavigate();

  return (
    <div className={cn("bg-white min-h-screen pb-20", className)}>
      {/* Sticky Header */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 px-4 py-3 border-b flex justify-between items-center">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>
        <h1 className="text-lg font-bold text-gray-800 font-serif">{name.name}</h1>
        <div className="flex gap-2">
           <button 
             onClick={() => navigate('/')} 
             className="p-2 hover:bg-gray-100 rounded-full text-gray-600"
             title="回到首页"
           >
             <Home className="w-5 h-5" />
           </button>
           <button className="p-2 hover:bg-gray-100 rounded-full">
             <Heart className="w-5 h-5 text-gray-600" />
           </button>
           <button className="p-2 hover:bg-gray-100 rounded-full">
             <Share2 className="w-5 h-5 text-gray-600" />
           </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* 1. Score Card */}
        <NameScore 
          score={name.score} 
          uniqueness={name.uniqueness} 
          uniquenessCount={name.uniquenessCount} 
        />

        {/* 2. Main Meaning */}
        <section className="text-center space-y-4">
           <div className="flex justify-center gap-4">
              {name.characters.map((char, i) => (
                <div key={i} className="text-center">
                  <div className="text-5xl font-serif font-bold text-gray-800 mb-2">{char.char}</div>
                  <div className="text-sm text-gray-500">{char.pinyin}</div>
                  <WuxingTag wuxing={char.wuxing} size="sm" className="mt-1 mx-auto" />
                </div>
              ))}
           </div>
           
           <div className="bg-amber-50 rounded-xl p-4 text-amber-900 leading-relaxed relative overflow-hidden">
             <div className="absolute top-0 right-0 p-2 opacity-10">
               <span className="text-6xl font-serif">❝</span>
             </div>
             <p className="font-medium text-lg mb-2">{name.meaning}</p>
             <p className="text-sm opacity-80">—— {name.source}</p>
           </div>
        </section>

        {/* 3. AI Personalized Meaning */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
           <div className="flex items-center gap-2 mb-3">
             <AIBadge />
             <span className="font-bold text-blue-900">专属寓意解读</span>
           </div>
           <p className="text-sm text-blue-800 leading-relaxed">
             {name.personalizedMeaning}
           </p>
        </section>

        {/* 4. Character Analysis */}
        <section>
          <h3 className="font-bold text-gray-900 mb-3 border-l-4 border-amber-500 pl-3">汉字深度解析</h3>
          <CharacterAnalysis characters={name.characters} />
        </section>

        {/* 5. Yinyun Analysis */}
        <section>
          <h3 className="font-bold text-gray-900 mb-3 border-l-4 border-indigo-500 pl-3">音韵美学分析</h3>
          <YinyunAnalysis yinyun={name.yinyun} />
        </section>

         {/* 6. Bazi Match */}
        <section className="bg-gray-50 rounded-xl p-4 border border-gray-200">
           <h3 className="font-bold text-gray-900 mb-2">五行八字契合度</h3>
           <p className="text-sm text-gray-600 leading-relaxed">{name.baziMatch}</p>
        </section>
      </div>
    </div>
  );
};
