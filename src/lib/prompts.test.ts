import { describe, it, expect } from 'vitest';
import { getBaziAnalysisPrompt, getNameGenerationPrompt, getNameAnalysisPrompt } from './prompts';
import { BabyInfo } from '@/types';

const mockBabyInfo: BabyInfo = {
  lastName: 'Li',
  gender: 'boy',
  birthDate: '2024-01-01',
  birthTime: '12:00',
  birthCity: 'Beijing',
  calendarType: 'solar'
};

describe('Prompts', () => {
  it('getBaziAnalysisPrompt should return system and user prompts', () => {
    const prompt = getBaziAnalysisPrompt(mockBabyInfo);
    expect(prompt.system).toContain('JSON');
    expect(prompt.user).toContain('Beijing');
    expect(prompt.user).toContain('2024-01-01');
  });

  it('getNameGenerationPrompt should return prompts with correct counts', () => {
    const prompt = getNameGenerationPrompt(mockBabyInfo, 'Summary', 'Poetic', 6);
    expect(prompt.system).toContain('JSON');
    expect(prompt.user).toContain('Poetic');
    expect(prompt.user).toContain('6 unique Chinese names');
  });

  it('getNameAnalysisPrompt should return prompts for specific name', () => {
    const prompt = getNameAnalysisPrompt('TestName', mockBabyInfo);
    expect(prompt.system).toContain('JSON');
    expect(prompt.user).toContain('TestName');
  });
});
