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
  suggestedStyles: z.array(z.object({
    id: z.string(),
    title: z.string(),
    desc: z.string(),
    longDesc: z.string(),
    colorTheme: z.enum(['emerald', 'blue', 'amber', 'purple', 'rose', 'cyan']),
    rationale: z.string(),
  })).optional(),
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
  etymology: z.object({
    oracle: z.string().optional(),
    bronze: z.string().optional(),
    seal: z.string().optional(),
    evolution: z.string().optional(),
  }).optional(),
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

// Summary schema (no characters array — used for the 5 non-featured names)
export const NameSummarySchema = z.object({
  name: z.string(),
  pinyin: z.string(),
  meaning: z.string(),
  source: z.string(),
  wuxing: z.string(),
  baziMatch: z.string(),
  score: z.number(),
  uniqueness: z.string(),
  uniquenessCount: z.string(),
  yinyun: YinyunInfoSchema,
  personalizedMeaning: z.string(),
});

// Step 1 response: 1 featured name (full detail) + 5 summary-only names
export const NameListResponseSchema = z.object({
  featured: NameDetailSchema,
  others: z.array(NameSummarySchema),
});
