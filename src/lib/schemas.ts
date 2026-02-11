import { z } from 'zod';

// Bazi Analysis Schema
export const BaziAnalysisSchema = z.object({
  bazi: z.object({
    yearPillar: z.string(),
    monthPillar: z.string(),
    dayPillar: z.string(),
    hourPillar: z.string(),
    yearWuxing: z.string(),
    monthWuxing: z.string(),
    dayWuxing: z.string(),
    hourWuxing: z.string(),
    yearCanggan: z.string(),
    monthCanggan: z.string(),
    dayCanggan: z.string(),
    hourCanggan: z.string(),
    yearNayin: z.string(),
    monthNayin: z.string(),
    dayNayin: z.string(),
    hourNayin: z.string(),
    benming: z.string(),
  }),
  wuxing: z.object({
    gold: z.number(),
    wood: z.number(),
    water: z.number(),
    fire: z.number(),
    earth: z.number(),
    goldValue: z.number(),
    woodValue: z.number(),
    waterValue: z.number(),
    fireValue: z.number(),
    earthValue: z.number(),
    xiyong: z.array(z.string()),
    jiyong: z.array(z.string()),
    rizhu: z.string(),
    rizhuWuxing: z.string(),
    tonglei: z.array(z.string()),
    yilei: z.array(z.string()),
    tongleiScore: z.number(),
    yileiScore: z.number(),
    wangshuai: z.string(),
  }),
  analysis: z.string(),
  suggestion: z.string(),
});

// Character Info Schema
export const CharacterInfoSchema = z.object({
  char: z.string(),
  pinyin: z.string(),
  wuxing: z.string(),
  meaning: z.string(),
  explanation: z.string(),
  source: z.string(),
  kangxi: z.object({
    strokes: z.number(),
    page: z.string(),
    original: z.string(),
  }),
});

// Yinyun Info Schema
export const YinyunInfoSchema = z.object({
  tone: z.string(),
  initials: z.string(),
  score: z.number(),
  analysis: z.string(),
});

// Name Detail Schema
export const NameDetailSchema = z.object({
  name: z.string(),
  pinyin: z.string(),
  characters: z.array(CharacterInfoSchema),
  meaning: z.string(),
  source: z.string(),
  wuxing: z.string(),
  baziMatch: z.string(),
  score: z.number(),
  uniqueness: z.string(),
  uniquenessCount: z.string(),
  yinyun: YinyunInfoSchema,
  personalizedMeaning: z.string(),
  isLocked: z.boolean().optional(),
  seriesId: z.string().optional(),
  style: z.string().optional()
});

// For list of names
export const NameListSchema = z.array(NameDetailSchema);
