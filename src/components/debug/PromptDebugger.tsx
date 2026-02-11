import React, { useState } from 'react';
import { getBaziAnalysisPrompt, getNameGenerationPrompt } from '@/lib/prompts';
import { validateAIResponse } from '@/utils/ai-validation';
import { BaziAnalysisSchema } from '@/lib/schemas';
import { BabyInfo } from '@/types';

export const PromptDebugger: React.FC = () => {
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string>('');

  const mockInfo: BabyInfo = {
    lastName: '李',
    gender: 'boy',
    birthDate: '2024-02-04',
    birthTime: '12:00',
    birthCity: '北京',
    calendarType: 'solar'
  };

  const showBaziPrompt = () => {
    try {
      const prompt = getBaziAnalysisPrompt(mockInfo);
      setOutput(JSON.stringify(prompt, null, 2));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const showNamePrompt = () => {
    try {
      const prompt = getNameGenerationPrompt(mockInfo, "八字喜火...", "诗词雅韵", 6);
      setOutput(JSON.stringify(prompt, null, 2));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  const testValidation = () => {
    try {
      // Mock AI response
      const mockAIResponse = `
      \`\`\`json
      {
        "bazi": {
          "yearPillar": "甲辰",
          "monthPillar": "丙寅",
          "dayPillar": "戊午",
          "hourPillar": "壬子",
          "yearWuxing": "木土",
          "monthWuxing": "火木",
          "dayWuxing": "土火",
          "hourWuxing": "水水",
          "yearCanggan": "乙戊癸",
          "monthCanggan": "甲丙戊",
          "dayCanggan": "丁己",
          "hourCanggan": "癸",
          "yearNayin": "覆灯火",
          "monthNayin": "炉中火",
          "dayNayin": "天上火",
          "hourNayin": "桑松木",
          "benming": "龙"
        },
        "wuxing": {
          "gold": 0,
          "wood": 3,
          "water": 2,
          "fire": 2,
          "earth": 1,
          "goldValue": 0,
          "woodValue": 35,
          "waterValue": 25,
          "fireValue": 30,
          "earthValue": 10,
          "xiyong": ["火", "土"],
          "jiyong": ["金", "水"],
          "rizhu": "戊",
          "rizhuWuxing": "土",
          "tonglei": ["土", "火"],
          "yilei": ["金", "水", "木"],
          "tongleiScore": 40,
          "yileiScore": 60,
          "wangshuai": "身弱"
        },
        "analysis": "此命造...",
        "suggestion": "建议..."
      }
      \`\`\`
      `;
      
      const result = validateAIResponse(mockAIResponse, BaziAnalysisSchema);
      setOutput("Validation Success!\nParsed Data:\n" + JSON.stringify(result, null, 2));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setOutput('');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold">Phase 3: Schema & Prompt Debugger</h2>
      
      <div className="flex gap-4">
        <button 
          onClick={showBaziPrompt}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Generate Bazi Prompt
        </button>
        <button 
          onClick={showNamePrompt}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Generate Name Prompt
        </button>
        <button 
          onClick={testValidation}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Test Validation
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded border border-red-200">
          Error: {error}
        </div>
      )}

      {output && (
        <pre className="p-4 bg-gray-100 rounded border border-gray-200 overflow-auto max-h-[500px] text-sm font-mono">
          {output}
        </pre>
      )}
    </div>
  );
};
