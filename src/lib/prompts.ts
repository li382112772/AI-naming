import { BabyInfo } from '@/types';

const JSON_INSTRUCTION = `You must output valid JSON only. Do not include any markdown formatting (like \`\`\`json), comments, or extra text.`;

export const getBaziAnalysisPrompt = (info: BabyInfo) => {
  const { birthDate, birthTime, birthCity, gender } = info;

  return {
    system: `You are an expert in traditional Chinese Bazi (Four Pillars of Destiny) and Wuxing (Five Elements).
${JSON_INSTRUCTION}
Your task is to analyze the birth chart based on the provided birth information and recommend naming styles.`,
    user: `Please analyze the Bazi for a ${gender === 'boy' ? 'boy' : 'girl'} born in ${birthCity || '未知'} on ${birthDate} at ${birthTime || '不详'}.

Return a JSON object with the following structure:
{
  "bazi": {
    "yearPillar": "string (e.g. 丙午)",
    "monthPillar": "string",
    "dayPillar": "string",
    "hourPillar": "string",
    "yearWuxing": "string (e.g. 火)",
    "monthWuxing": "string",
    "dayWuxing": "string",
    "hourWuxing": "string",
    "yearCanggan": "string (Hidden Stems, e.g. 己丁)",
    "monthCanggan": "string",
    "dayCanggan": "string",
    "hourCanggan": "string",
    "yearNayin": "string (Na Yin, e.g. 炉中火)",
    "monthNayin": "string",
    "dayNayin": "string",
    "hourNayin": "string",
    "benming": "string (zodiac animal, e.g. 龙)"
  },
  "wuxing": {
    "gold": number (count of gold element in 8 stems, 0-8),
    "wood": number,
    "water": number,
    "fire": number,
    "earth": number,
    "goldValue": number (overall strength 0-100),
    "woodValue": number,
    "waterValue": number,
    "fireValue": number,
    "earthValue": number,
    "xiyong": ["string", "string"] (Favorable/Useful Gods elements, e.g. ["火","土"]),
    "jiyong": ["string", "string"] (Unfavorable elements),
    "rizhu": "string" (Day Master heavenly stem, e.g. 戊),
    "rizhuWuxing": "string" (Day Master's element, e.g. 土),
    "tonglei": ["string"] (elements of same category as Day Master, supporting it),
    "yilei": ["string"] (elements of different category, opposing/restraining Day Master),
    "tongleiScore": number (combined strength of same-category elements, 0-100),
    "yileiScore": number (combined strength of opposing elements, 0-100),
    "wangshuai": "string" (Strength assessment: 身旺/身弱/身强/中和 etc.)
  },
  "analysis": "string (Brief summary of the Bazi chart in Chinese, approx 100 characters)",
  "suggestion": "string (Naming advice based on Bazi in Chinese, approx 50 characters)",
  "suggestedStyles": [
    {
      "id": "string (unique slug, e.g. shici_yayun)",
      "title": "string (style name in Chinese, 4-6 chars, e.g. 诗意天成)",
      "desc": "string (short description, within 20 chars)",
      "longDesc": "string (detailed description, within 40 chars)",
      "colorTheme": "string (one of: emerald, blue, amber, purple, rose, cyan)",
      "rationale": "string (why this style fits this baby's Bazi, within 30 chars)"
    }
  ]
}

For suggestedStyles: generate exactly 3 creative naming styles tailored to this baby's Bazi and xiyong elements. Each style should be distinct in aesthetic. Choose colorTheme based on the style's mood. Make styles feel personalized, not generic.`
  };
};

export const getNameGenerationPrompt = (
  info: BabyInfo,
  baziSummary: string,
  stylePreference: string,
  count: number = 6
) => {
  const nameLength = info.nameLength ?? 2;
  const nameLengthDesc = nameLength === 1 ? '一个字（不含姓氏）' : nameLength === 2 ? '两个字（不含姓氏）' : '三个字（不含姓氏）';

  return {
    system: `You are a professional Chinese Naming Master with deep knowledge of Shijing, Chuci, Tang Poems, Song Lyrics, and classical Chinese literature.
${JSON_INSTRUCTION}
You need to generate ${count} names for a ${info.gender === 'boy' ? 'boy' : 'girl'} based on their Bazi and the user's preference.
IMPORTANT: Each name must be exactly ${nameLength} Chinese character(s) long (excluding surname). Do not generate names of other lengths.`,
    user: `Baby Info:
Gender: ${info.gender === 'boy' ? '男' : '女'}
Birth: ${info.birthDate} ${info.birthTime}
Bazi Summary: ${baziSummary}
Style Preference: ${stylePreference}
Required name length: ${nameLengthDesc}

Generate ${count} unique Chinese names, each exactly ${nameLength} character(s) (excluding surname).
Return a JSON array where each object has this structure:
{
  "name": "string (The given name only, exactly ${nameLength} character(s), excluding surname)",
  "pinyin": "string (space-separated pinyin, e.g. mù zé)",
  "meaning": "string (Overall meaning of the name in Chinese)",
  "source": "string (Classical source of the name, e.g. 《诗经·关雎》)",
  "wuxing": "string (Five elements of name characters, e.g. 水木)",
  "baziMatch": "string (How it matches Bazi xiyong elements)",
  "score": number (0-100, overall rating),
  "uniqueness": "string (重名度: 极低/低/较低/中/较高/高)",
  "uniquenessCount": "string (Estimated same-name count, e.g. 1000+)",
  "personalizedMeaning": "string (Personalized meaning tailored to this baby in Chinese)",
  "yinyun": {
    "tone": "string (tone pattern e.g. 仄平)",
    "initials": "string (initials combination e.g. mz)",
    "score": number (phonetic beauty score 0-100),
    "analysis": "string (phonetic analysis in Chinese)"
  },
  "characters": [
    {
      "char": "string (single character)",
      "pinyin": "string (pinyin with tone mark)",
      "wuxing": "string (this character's element)",
      "meaning": "string (core meaning in Chinese, 10-20 chars)",
      "explanation": "string (rich character explanation: include (1) original meaning and composition/structure 字形结构, (2) cultural connotations 文化内涵, (3) classical usage example with quote. Total 60-100 chars in Chinese.)",
      "source": "string (specific classical source, e.g. 《诗经·大雅·文王》)",
      "kangxi": {
        "strokes": number (stroke count per Kangxi dictionary),
        "page": "string (Kangxi dictionary page, e.g. 第523页)",
        "original": "string (Kangxi dictionary original text. Provide the authentic classical Chinese definition. Format: '【字】《说文》...' followed by classical commentary. 50-120 chars.)"
      },
      "etymology": {
        "oracle": "string (甲骨文字形描述: describe how this character looked in oracle bone script, what pictograph or ideograph it represented, 20-40 chars)",
        "bronze": "string (金文字形描述: describe the bronze script form and any changes, 20-40 chars)",
        "seal": "string (小篆字形描述: describe the small seal script standardized form, 20-40 chars)",
        "evolution": "string (字形演变简述: brief summary of how the character evolved from ancient to modern, 20-50 chars)"
      }
    }
  ]
}`
  };
};

/**
 * Step 1 prompt: Generate 1 featured name (full detail) + 5 summary-only names
 */
export const getNameListPrompt = (
  info: BabyInfo,
  baziSummary: string,
  stylePreference: string,
) => {
  const nameLength = info.nameLength ?? 2
  const nameLengthDesc =
    nameLength === 1
      ? '一个字（不含姓氏）'
      : nameLength === 2
        ? '两个字（不含姓氏）'
        : '三个字（不含姓氏）'

  return {
    system: `You are a professional Chinese Naming Master with deep knowledge of Shijing, Chuci, Tang Poems, Song Lyrics, and classical Chinese literature.
${JSON_INSTRUCTION}
You need to generate 6 names for a ${info.gender === 'boy' ? 'boy' : 'girl'} based on their Bazi and the user's preference.
IMPORTANT: Each name must be exactly ${nameLength} Chinese character(s) long (excluding surname). Do not generate names of other lengths.
The first (featured) name must include full character analysis. The remaining 5 names only need summary information.`,
    user: `Baby Info:
Gender: ${info.gender === 'boy' ? '男' : '女'}
Birth: ${info.birthDate} ${info.birthTime}
Bazi Summary: ${baziSummary}
Style Preference: ${stylePreference}
Required name length: ${nameLengthDesc}

Generate 6 unique Chinese names, each exactly ${nameLength} character(s) (excluding surname).
Return a JSON object with this structure:
{
  "featured": {
    "name": "string (exactly ${nameLength} character(s), excluding surname)",
    "pinyin": "string (space-separated pinyin, e.g. mù zé)",
    "meaning": "string (Overall meaning in Chinese)",
    "source": "string (Classical source, e.g. 《诗经·关雎》)",
    "wuxing": "string (Five elements of name characters, e.g. 水木)",
    "baziMatch": "string (How it matches Bazi xiyong elements)",
    "score": number (0-100),
    "uniqueness": "string (重名度: 极低/低/较低/中/较高/高)",
    "uniquenessCount": "string (Estimated same-name count, e.g. 1000+)",
    "personalizedMeaning": "string (Personalized meaning in Chinese)",
    "yinyun": {
      "tone": "string (tone pattern e.g. 仄平)",
      "initials": "string (initials combination e.g. mz)",
      "score": number (phonetic beauty score 0-100),
      "analysis": "string (phonetic analysis in Chinese)"
    },
    "characters": [
      {
        "char": "string (single character)",
        "pinyin": "string (pinyin with tone mark)",
        "wuxing": "string (this character's element)",
        "meaning": "string (core meaning in Chinese, 10-20 chars)",
        "explanation": "string (rich character explanation: include (1) original meaning and composition/structure 字形结构, (2) cultural connotations 文化内涵, (3) classical usage example with quote. Total 60-100 chars in Chinese.)",
        "source": "string (specific classical source, e.g. 《诗经·大雅·文王》)",
        "kangxi": {
          "strokes": number (stroke count per Kangxi dictionary),
          "page": "string (Kangxi dictionary page, e.g. 第523页)",
          "original": "string (Kangxi dictionary original text. Format: '【字】《说文》...' 50-120 chars.)"
        },
        "etymology": {
          "oracle": "string (甲骨文字形描述, 20-40 chars)",
          "bronze": "string (金文字形描述, 20-40 chars)",
          "seal": "string (小篆字形描述, 20-40 chars)",
          "evolution": "string (字形演变简述, 20-50 chars)"
        }
      }
    ]
  },
  "others": [
    {
      "name": "string (exactly ${nameLength} character(s), excluding surname)",
      "pinyin": "string",
      "meaning": "string (Overall meaning in Chinese)",
      "source": "string (Classical source)",
      "wuxing": "string (Five elements)",
      "baziMatch": "string (Bazi match explanation)",
      "score": number (0-100),
      "uniqueness": "string (重名度)",
      "uniquenessCount": "string",
      "personalizedMeaning": "string",
      "yinyun": {
        "tone": "string",
        "initials": "string",
        "score": number,
        "analysis": "string"
      }
    }
  ]
}

IMPORTANT:
- "featured" must contain ONE name with COMPLETE character analysis including kangxi and etymology.
- "others" must contain exactly 5 names with ONLY summary fields (no "characters" array).
- All 6 names must be unique and distinct.
- The featured name should be your top recommendation.`
  }
}

/**
 * Step 2 prompt: Generate full detail for a single name on-demand
 */
export const getNameDetailPrompt = (
  name: string,
  info: BabyInfo,
  baziSummary: string,
) => {
  return {
    system: `You are a professional Chinese Naming Master with deep knowledge of classical Chinese literature, Kangxi Dictionary, and Chinese character etymology.
${JSON_INSTRUCTION}
Generate detailed character analysis for the given name.`,
    user: `Name to analyze: ${name}
Baby Info:
Gender: ${info.gender === 'boy' ? '男' : '女'}
Birth: ${info.birthDate} ${info.birthTime}
Bazi Summary: ${baziSummary}

This name was already recommended for this baby. Now provide the complete character-level analysis.
Return a JSON object with this structure:
{
  "name": "${name}",
  "pinyin": "string (space-separated pinyin with tone marks)",
  "meaning": "string (Overall meaning in Chinese)",
  "source": "string (Classical source)",
  "wuxing": "string (Five elements of name characters)",
  "baziMatch": "string (How it matches Bazi)",
  "score": number (0-100),
  "uniqueness": "string (重名度: 极低/低/较低/中/较高/高)",
  "uniquenessCount": "string",
  "personalizedMeaning": "string",
  "yinyun": {
    "tone": "string",
    "initials": "string",
    "score": number,
    "analysis": "string"
  },
  "characters": [
    {
      "char": "string (single character)",
      "pinyin": "string (pinyin with tone mark)",
      "wuxing": "string (this character's element)",
      "meaning": "string (core meaning in Chinese, 10-20 chars)",
      "explanation": "string (rich character explanation: (1) original meaning and 字形结构, (2) 文化内涵, (3) classical usage example with quote. 60-100 chars)",
      "source": "string (specific classical source)",
      "kangxi": {
        "strokes": number (stroke count per Kangxi dictionary),
        "page": "string (Kangxi dictionary page, e.g. 第523页)",
        "original": "string (Kangxi dictionary original text. Format: '【字】《说文》...' 50-120 chars.)"
      },
      "etymology": {
        "oracle": "string (甲骨文字形描述, 20-40 chars)",
        "bronze": "string (金文字形描述, 20-40 chars)",
        "seal": "string (小篆字形描述, 20-40 chars)",
        "evolution": "string (字形演变简述, 20-50 chars)"
      }
    }
  ]
}`
  }
}

export const getNameAnalysisPrompt = (name: string, info: BabyInfo) => {
  return {
    system: `You are a Chinese Naming Expert.
${JSON_INSTRUCTION}
Analyze the given name for a ${info.gender} born on ${info.birthDate}.`,
    user: `Name: ${name}
Baby Info: ${JSON.stringify(info)}

Provide a detailed analysis in the following JSON format:
{
  "name": "${name}",
  "pinyin": "string",
  "meaning": "string",
  "source": "string",
  "wuxing": "string",
  "baziMatch": "string",
  "score": number,
  "uniqueness": "string",
  "uniquenessCount": "string",
  "personalizedMeaning": "string",
  "yinyun": {
    "tone": "string",
    "initials": "string",
    "score": number,
    "analysis": "string"
  },
  "characters": [
    {
      "char": "string",
      "pinyin": "string",
      "wuxing": "string",
      "meaning": "string",
      "explanation": "string",
      "source": "string",
      "kangxi": {
        "strokes": number,
        "page": "string",
        "original": "string (Kangxi dictionary original text for this character)"
      }
    }
  ]
}`
  };
};
