import React from 'react';
import { BaziAnalysis, BabyInfo } from '@/types';
import { cn } from '@/lib/utils';
import { AIBadge } from '@/components/ui/ai-badge';
import { BaziPillarCard } from './BaziPillarCard';
import { WuxingStats } from './WuxingStats';
import { WuxingChart } from './WuxingChart';
import { XiyongAnalysis } from './XiyongAnalysis';
import { solarToLunar, formatSolarDate, getShichen } from '@/lib/lunarUtils';

interface BaziAnalysisCardProps {
  data: BaziAnalysis;
  babyInfo?: BabyInfo;
  className?: string;
}

const WUXING_COLORS: Record<string, string> = {
  金: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  木: 'bg-green-100 text-green-800 border-green-200',
  水: 'bg-blue-100 text-blue-800 border-blue-200',
  火: 'bg-red-100 text-red-800 border-red-200',
  土: 'bg-amber-100 text-amber-800 border-amber-200',
}

export const BaziAnalysisCard: React.FC<BaziAnalysisCardProps> = ({ data, babyInfo, className }) => {
  const lunarDate = babyInfo?.birthDate ? solarToLunar(babyInfo.birthDate) : null;
  const solarDate = babyInfo?.birthDate ? formatSolarDate(babyInfo.birthDate) : null;
  const shichen = babyInfo?.birthTime ? getShichen(babyInfo.birthTime) : null;

  const { tonglei, yilei, tongleiScore, yileiScore, wangshuai } = data.wuxing;
  const isStrong = wangshuai.includes('旺') || wangshuai.includes('强');

  return (
    <div className={cn("bg-white rounded-2xl shadow-sm border border-amber-100 overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 border-b border-amber-100 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-2xl">📜</span>
          <h3 className="font-bold text-amber-900">八字命理分析</h3>
        </div>
        <AIBadge />
      </div>

      <div className="p-4 space-y-5">

        {/* 0. Date Information */}
        {(solarDate || lunarDate) && (
          <section className="bg-amber-50/60 rounded-xl p-3 border border-amber-100">
            <h4 className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1">
              <span>🗓️</span> 出生日期
            </h4>
            <div className="space-y-1.5 text-sm">
              {solarDate && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12 shrink-0">公历</span>
                  <span className="font-medium text-gray-800">{solarDate}</span>
                  {babyInfo?.birthTime && (
                    <span className="text-gray-600">{babyInfo.birthTime}</span>
                  )}
                </div>
              )}
              {lunarDate && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12 shrink-0">农历</span>
                  <span className="font-medium text-gray-800">{lunarDate.fullText}</span>
                  {lunarDate.isLeapMonth && (
                    <span className="text-xs bg-amber-200 text-amber-700 px-1.5 py-0.5 rounded">闰月</span>
                  )}
                </div>
              )}
              {shichen && (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500 w-12 shrink-0">时辰</span>
                  <span className="font-medium text-gray-700">{shichen}</span>
                </div>
              )}
            </div>
          </section>
        )}

        {/* 1. Four Pillars */}
        <section>
          <BaziPillarCard bazi={data.bazi} />
          <div className="mt-3 text-center">
             <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
               本命：{data.bazi.benming} · 日主：{data.wuxing.rizhu}（{data.wuxing.rizhuWuxing}）· {data.wuxing.wangshuai}
             </span>
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* 2. Wuxing Stats */}
        <section>
          <WuxingStats wuxing={data.wuxing} />
        </section>

        {/* 3. Wuxing Radar Chart */}
        <section>
          <WuxingChart wuxing={data.wuxing} />
        </section>

        <div className="h-px bg-gray-100" />

        {/* 4. Tonglei / Yilei Analysis */}
        <section>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <span>⚖️</span> 八字力量分析
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Tonglei */}
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
              <div className="text-xs text-orange-600 font-semibold mb-2">同类（生扶）</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {tonglei.map((w) => (
                  <span key={w} className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', WUXING_COLORS[w] || 'bg-gray-100 text-gray-700 border-gray-200')}>
                    {w}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full transition-all"
                    style={{ width: `${Math.min(tongleiScore, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-orange-700 w-7 text-right">{tongleiScore}</span>
              </div>
            </div>

            {/* Yilei */}
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div className="text-xs text-blue-600 font-semibold mb-2">异类（克泄）</div>
              <div className="flex flex-wrap gap-1 mb-2">
                {yilei.map((w) => (
                  <span key={w} className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', WUXING_COLORS[w] || 'bg-gray-100 text-gray-700 border-gray-200')}>
                    {w}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 rounded-full transition-all"
                    style={{ width: `${Math.min(yileiScore, 100)}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-blue-700 w-7 text-right">{yileiScore}</span>
              </div>
            </div>
          </div>

          {/* Strength Verdict */}
          <div className={cn(
            'flex items-center justify-between rounded-xl px-4 py-2.5 border',
            isStrong
              ? 'bg-orange-50 border-orange-200'
              : 'bg-blue-50 border-blue-200'
          )}>
            <span className="text-xs text-gray-600">
              同类得分 <strong>{tongleiScore}</strong> vs 异类得分 <strong>{yileiScore}</strong>
            </span>
            <span className={cn(
              'text-sm font-bold px-3 py-1 rounded-full',
              isStrong ? 'bg-orange-500 text-white' : 'bg-blue-500 text-white'
            )}>
              {wangshuai}
            </span>
          </div>
        </section>

        <div className="h-px bg-gray-100" />

        {/* 5. Xiyong Analysis */}
        <section>
          <XiyongAnalysis wuxing={data.wuxing} />
        </section>

        {/* 6. AI Analysis Text */}
        <section className="bg-blue-50/50 rounded-xl p-3 text-sm text-blue-900 leading-relaxed border border-blue-100">
          <p className="mb-2 font-semibold flex items-center gap-1">
            <span className="text-lg">🤖</span> AI 大师解读
          </p>
          <p className="opacity-90">{data.analysis}</p>
          <p className="mt-2 pt-2 border-t border-blue-200/50 font-medium text-amber-700">
            💡 建议：{data.suggestion}
          </p>
        </section>
      </div>
    </div>
  );
};
