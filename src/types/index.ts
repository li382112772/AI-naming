export type Gender = 'boy' | 'girl';
export type CalendarType = 'solar' | 'lunar';

export interface BabyInfo {
  lastName: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:mm
  birthCity: string;
  calendarType: CalendarType;
  isLeapMonth?: boolean; // For lunar
  nameLength?: 1 | 2 | 3; // Number of characters in the given name (excluding surname)
}

export interface BabySession {
  id: string;
  babyInfo: BabyInfo;
  createdAt: number;
  updatedAt: number;
  stylePreference?: string;
  baziAnalysis?: BaziAnalysis;
  names?: NameDetail[];
  unlockedSeries?: string[]; // Series IDs
  selectedNameId?: string; // The final chosen name
}

export interface StyleSuggestion {
  id: string;
  title: string;
  desc: string;
  longDesc: string;
  colorTheme: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'cyan';
  rationale: string;
}

export interface BaziAnalysis {
  // Four Pillars
  bazi: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    yearWuxing: string;
    monthWuxing: string;
    dayWuxing: string;
    hourWuxing: string;
    yearCanggan: string;
    monthCanggan: string;
    dayCanggan: string;
    hourCanggan: string;
    yearNayin: string;
    monthNayin: string;
    dayNayin: string;
    hourNayin: string;
    benming: string;
  };
  // Five Elements
  wuxing: {
    gold: number;
    wood: number;
    water: number;
    fire: number;
    earth: number;
    goldValue: number; // 0-100 strength
    woodValue: number;
    waterValue: number;
    fireValue: number;
    earthValue: number;
    xiyong: string[];
    jiyong: string[];
    rizhu: string;
    rizhuWuxing: string;
    tonglei: string[];
    yilei: string[];
    tongleiScore: number;
    yileiScore: number;
    wangshuai: string;
  };
  analysis: string;
  suggestion: string;
  suggestedStyles?: StyleSuggestion[];
}

export interface NameDetail {
  id?: string; // Generated on client or by AI
  name: string;
  pinyin: string;
  characters: CharacterInfo[];
  meaning: string;
  source: string;
  wuxing: string;
  baziMatch: string;
  score: number;
  uniqueness: string;
  uniquenessCount: string;
  yinyun: YinyunInfo;
  personalizedMeaning: string;
  hasFullDetail?: boolean; // true = characters[] populated with kangxi/etymology; false/undefined = summary only
  isLocked?: boolean; // UI state
  seriesId?: string; // Which series it belongs to
  style?: string; // e.g. '诗词雅韵'
}

export interface CharacterInfo {
  char: string;
  pinyin: string;
  wuxing: string;
  meaning: string;
  explanation: string;
  source: string;
  kangxi: {
    strokes: number;
    page: string;
    original: string;
  };
  etymology?: {
    oracle?: string;   // 甲骨文描述
    bronze?: string;   // 金文描述
    seal?: string;     // 小篆描述
    evolution?: string; // 字形演变说明
  };
}

export interface YinyunInfo {
  tone: string;
  initials: string;
  score: number;
  analysis: string;
}

export interface Order {
  id: string;
  sessionId: string;
  seriesId: string | 'all';
  amount: number;
  status: 'pending' | 'paid' | 'failed';
  createdAt: number;
  paidAt?: number;
}
