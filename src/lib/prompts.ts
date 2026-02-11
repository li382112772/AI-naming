import { BabyInfo, Gender } from '@/types';

const JSON_INSTRUCTION = `You must output valid JSON only. Do not include any markdown formatting (like \`\`\`json), comments, or extra text.`;

export const getBaziAnalysisPrompt = (info: BabyInfo) => {
  const { birthDate, birthTime, birthCity, gender } = info;
  
  return {
    system: `You are an expert in traditional Chinese Bazi (Four Pillars of Destiny) and Wuxing (Five Elements).
${JSON_INSTRUCTION}
Your task is to analyze the birth chart based on the provided birth information.`,
    user: `Please analyze the Bazi for a ${gender === 'boy' ? 'boy' : 'girl'} born in ${birthCity} on ${birthDate} at ${birthTime}.

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
    "yearCanggan": "string (Hidden Stems)",
    "monthCanggan": "string",
    "dayCanggan": "string",
    "hourCanggan": "string",
    "yearNayin": "string (Na Yin)",
    "monthNayin": "string",
    "dayNayin": "string",
    "hourNayin": "string",
    "benming": "string (e.g. 炉中火)"
  },
  "wuxing": {
    "gold": number (count),
    "wood": number (count),
    "water": number (count),
    "fire": number (count),
    "earth": number (count),
    "goldValue": number (0-100 strength),
    "woodValue": number (0-100 strength),
    "waterValue": number (0-100 strength),
    "fireValue": number (0-100 strength),
    "earthValue": number (0-100 strength),
    "xiyong": ["string", "string"] (Useful Gods/Elements),
    "jiyong": ["string", "string"] (Unfavorable Elements),
    "rizhu": "string" (Day Master),
    "rizhuWuxing": "string",
    "tonglei": ["string"] (Same elements),
    "yilei": ["string"] (Different elements),
    "tongleiScore": number,
    "yileiScore": number,
    "wangshuai": "string" (Strength of Day Master, e.g. 身旺/身弱)
  },
  "analysis": "string (Brief summary of the Bazi chart, approx 100 words)",
  "suggestion": "string (Naming advice based on Bazi, approx 50 words)"
}`
  };
};

export const getNameGenerationPrompt = (
  info: BabyInfo,
  baziSummary: string,
  stylePreference: string,
  count: number = 6
) => {
  return {
    system: `You are a professional Chinese Naming Master with deep knowledge of Shijing, Chuci, Tang Poems, and Song Lyrics.
${JSON_INSTRUCTION}
You need to generate ${count} names for a ${info.gender === 'boy' ? 'boy' : 'girl'} based on their Bazi and the user's preference.`,
    user: `Baby Info:
Gender: ${info.gender}
Birth: ${info.birthDate} ${info.birthTime}
Bazi Summary: ${baziSummary}
Style Preference: ${stylePreference}

Generate ${count} unique Chinese names.
Return a JSON array where each object has this structure:
{
  "name": "string (The full name, excluding surname)",
  "pinyin": "string (e.g. mù zé)",
  "meaning": "string (Overall meaning of the name)",
  "source": "string (Source of the name, e.g. poem title)",
  "wuxing": "string (e.g. 水水)",
  "baziMatch": "string (How it matches Bazi)",
  "score": number (0-100),
  "uniqueness": "string (High/Medium/Low)",
  "uniquenessCount": "string (Estimated count)",
  "personalizedMeaning": "string (Meaning tailored to this baby)",
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
        "original": "string"
      }
    }
    // ... for each character in the name
  ]
}`
  };
};

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
        "original": "string"
      }
    }
  ]
}`
  };
};
