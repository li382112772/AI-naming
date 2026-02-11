import React, { useState } from 'react';
import { AIGenerating } from '@/components/ui/ai-generating';
import { AIBadge } from '@/components/ui/ai-badge';
import { ChatBubble } from '@/components/ui/chat-bubble';
import { LockOverlay } from '@/components/ui/lock-overlay';
import { WuxingTag } from '@/components/ui/wuxing-tag';
import { BaziAnalysisCard } from '@/components/bazi/BaziAnalysisCard';
import { NameList } from '@/components/naming/NameList';
import { NameDetailPage } from '@/components/naming/NameDetailPage';
import { BaziAnalysis, NameDetail } from '@/types';

const mockBaziData: BaziAnalysis = {
  bazi: {
    yearPillar: '甲辰',
    monthPillar: '丙寅',
    dayPillar: '戊午',
    hourPillar: '壬子',
    yearWuxing: '木土',
    monthWuxing: '火木',
    dayWuxing: '土火',
    hourWuxing: '水水',
    yearCanggan: '乙戊癸',
    monthCanggan: '甲丙戊',
    dayCanggan: '丁己',
    hourCanggan: '癸',
    yearNayin: '覆灯火',
    monthNayin: '炉中火',
    dayNayin: '天上火',
    hourNayin: '桑松木',
    benming: '龙',
  },
  wuxing: {
    gold: 0,
    wood: 3,
    water: 2,
    fire: 2,
    earth: 1,
    goldValue: 0,
    woodValue: 35,
    waterValue: 25,
    fireValue: 30,
    earthValue: 10,
    xiyong: ['火', '土'],
    jiyong: ['金', '水'],
    rizhu: '戊',
    rizhuWuxing: '土',
    tonglei: ['土', '火'],
    yilei: ['金', '水', '木'],
    tongleiScore: 40,
    yileiScore: 60,
    wangshuai: '身弱',
  },
  analysis: '此命造日主戊土生于寅月，不得月令。虽坐下午火帝旺，年支辰土帮身，但月干丙火坐长生，年干甲木透出克身，时柱壬子水耗身。综合判定身弱。',
  suggestion: '建议起名时多选用五行属火、土的字，以补益日主，增强运势。避免金水过旺加重日主负担。',
};

const mockNames: NameDetail[] = [
  {
    name: '沐泽',
    pinyin: 'mù zé',
    characters: [
      {
        char: '沐',
        pinyin: 'mù',
        wuxing: '水',
        meaning: '润泽，洗涤，如沐春风。',
        explanation: '沐字五行属水，本义为洗头，引申为润泽、受润泽之意。用于人名意指爽朗、有神采、洁身自好之义。',
        source: '《诗经·大雅》：“既沾既足，如沐如濯。”',
        kangxi: { strokes: 8, page: '624', original: '洗头发。' }
      },
      {
        char: '泽',
        pinyin: 'zé',
        wuxing: '水',
        meaning: '恩泽，恩惠，仁慈。',
        explanation: '泽字五行属水，指水聚集的地方，也指恩泽、恩惠。用于人名意指祥瑞、善良、仁慈之义。',
        source: '《易经》：“丽泽兑，君子以朋友讲习。”',
        kangxi: { strokes: 17, page: '629', original: '光润也。' }
      }
    ],
    meaning: '如沐春风，泽被四方。寓意孩子性格温润，心地善良，福泽深厚。',
    source: '《诗经·大雅》',
    wuxing: '水水',
    baziMatch: '宝宝八字喜水，沐泽二字五行均为水，强力补益八字之不足，平衡五行，大吉。',
    score: 95,
    uniqueness: '中等',
    uniquenessCount: '2000+',
    yinyun: {
      tone: '去声(4) + 阳平(2)',
      initials: 'm + z',
      score: 92,
      analysis: '声调仄平搭配，抑扬顿挫，读起来朗朗上口，响亮悦耳。'
    },
    personalizedMeaning: '结合宝宝八字身弱喜水，此名字如春雨润物，能滋养命局，助运一生。'
  },
  {
    name: '怀瑾',
    pinyin: 'huái jǐn',
    characters: [], // Simplified for list view
    meaning: '怀握瑾瑜，品德高尚。',
    source: '《楚辞·九章》',
    wuxing: '水火',
    baziMatch: '...',
    score: 88,
    uniqueness: '高',
    uniquenessCount: '500+',
    yinyun: { tone: '', initials: '', score: 0, analysis: '' },
    personalizedMeaning: '',
    isLocked: true
  }
];

export const ComponentShowcase: React.FC = () => {
  const [selectedName, setSelectedName] = useState<NameDetail | null>(null);

  if (selectedName) {
    return <NameDetailPage name={selectedName} onBack={() => setSelectedName(null)} />;
  }

  return (
    <div className="p-6 space-y-8 max-w-md mx-auto bg-gray-50">
      <h2 className="text-xl font-bold">Phase 4: UI Components</h2>

      {/* 7. Name List (Phase 4.3) */}
      <div className="space-y-2">
         <h3 className="text-sm font-semibold text-gray-500">NameList (Phase 4.3)</h3>
         <NameList 
           names={mockNames} 
           onNameClick={(name) => setSelectedName(name)} 
           onUnlock={() => alert('Unlock clicked')}
         />
         <p className="text-xs text-gray-400 mt-2">* 点击第一个名字查看详情页</p>
      </div>

      <div className="h-px bg-gray-200 my-8" />

      {/* 6. Bazi Analysis Card */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500">BaziAnalysisCard (Phase 4.2)</h3>
        <BaziAnalysisCard data={mockBaziData} />
      </div>

      <div className="h-px bg-gray-200 my-8" />

      {/* 1. AI Badge */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500">AIBadge</h3>
        <AIBadge />
      </div>

      {/* 2. Wuxing Tags */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500">WuxingTag</h3>
        <div className="flex gap-2">
          <WuxingTag wuxing="金" />
          <WuxingTag wuxing="木" />
          <WuxingTag wuxing="水" />
          <WuxingTag wuxing="火" />
          <WuxingTag wuxing="土" />
        </div>
      </div>

      {/* 3. Chat Bubbles */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500">ChatBubble</h3>
        <ChatBubble 
          role="assistant" 
          content={
            <div>
              <p>我是您的 AI 起名顾问。</p>
              <p className="mt-1">请告诉我宝宝的出生信息。</p>
            </div>
          } 
        />
        <ChatBubble 
          role="user" 
          content="宝宝姓李，男孩，2024年2月4日中午12点出生。" 
        />
      </div>

      {/* 4. Lock Overlay (Interactive) */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500">LockOverlay</h3>
        <div className="relative h-48 bg-white rounded-xl border border-gray-200 p-4 overflow-hidden">
          <p className="blur-sm">这里是隐藏的高级内容...</p>
          <LockOverlay onUnlock={() => alert('Unlock clicked!')} />
        </div>
      </div>

      {/* 5. AI Generating Animation */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-500">AIGenerating</h3>
        <div className="bg-white rounded-xl border border-gray-200">
          <AIGenerating message="AI 正在分析八字..." />
        </div>
      </div>
    </div>
  );
};
