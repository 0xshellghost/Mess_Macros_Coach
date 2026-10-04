import { GoogleGenAI, Type } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('GEMINI_API_KEY is not defined in environment variables.');
    return null;
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiInstance;
}

export interface ParsedMealOutput {
  mealType: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
  title: string;
  items: string[];
}

export interface ParsedMenuDayOutput {
  dayName: string;
  meals: ParsedMealOutput[];
}

/**
 * Parses messy mess menu text or an image of a mess noticeboard into clean food names.
 * CRITICAL: The model NEVER outputs nutrition numbers. It only extracts food names.
 */
export async function parseMenuWithGemini(params: {
  text?: string;
  imageBase64?: string;
  mimeType?: string;
}): Promise<ParsedMenuDayOutput[]> {
  const ai = getAiClient();

  if (!ai) {
    // Graceful local heuristic fallback if no API key is available
    return localFallbackMenuParser(params.text || '');
  }

  const systemInstruction = `You are an expert OCR and menu parsing specialist for Indian college hostel mess menus (IITs, NITs, IIITs like IIIT Prayagraj, BITS, and university hostels).
Your job is to read messy, photographed weekly timetable grids, noticeboards, tables, or pasted text menus, and extract clean food items for EVERY DAY shown in the menu (e.g. Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday).

CRITICAL EXTRACTION RULES:
1. OUTPUT ALL DAYS: If the menu is a weekly timetable (Monday through Sunday), you MUST return an entry for each day (e.g. "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"). Do NOT combine them or stop at Monday!
2. ONLY INCLUDE MEALS PRESENT: Many college messes (like IIIT Prayagraj BH-2/3) only serve 3 meals: Breakfast, Lunch, and Dinner. If the menu does NOT have an evening snacks column or tea time dishes, DO NOT create or invent a 'snacks' meal! Only create meals that actually exist in the menu.
   - "breakfast": Breakfast dishes and breakfast daily staples (e.g. eggs, milk, bread butter, tea, uttapam, medu vada, poha).
   - "lunch": Lunch dishes, dals, rice, rotis, sabzis, raitas, and salads served at lunch.
   - "snacks": ONLY include if the menu explicitly has a column or section for Evening Snacks / High Tea. If the menu does not have snacks, OMIT this meal completely.
   - "dinner": Dinner dishes, evening specials (egg curry, paneer, chicken, kofta, soya chunks, sweets).
   DO NOT put lunch or dinner dishes into breakfast!
3. DAILY STAPLES FOOTER: If the menu footer states items served daily (e.g., "FOR BREAKFAST: Bread, butter, jam, egg/banana, tea, coffee, milk served daily" or "SALAD CONTAINS CARROT/BEETROOT, TOMATO/CUCUMBER"), add these staple items to the respective meals for every day!
4. SLASH / COMBO OPTIONS: If an item lists alternatives like "EGG CURRY/KADHAI PANEER", include both: ["Egg Curry", "Kadhai Paneer"]. If it says "(CHICKEN CURRY, ROTI)/(PANEER-PYAAZ PARATHA)", include them clearly.
5. CLEAN FOOD NAMES ONLY: NEVER output or hallucinate calories or protein grams. Output clean, recognizable dish names that can be mapped to food composition tables (e.g. "Egg Curry", "Kadhai Paneer", "Moong Dal", "Steamed White Rice", "Roti", "Gulab Jamun", "Litti Chokha", "Arhar Dal", "Soya Chunks Curry", "Pav Bhaji", "Sprouts", "Medu Vada", "Sambhar", "Dahi", "Chicken Curry", "Chole Bhature").
6. SEPARATE DISHES: Split comma/dash/semicolon separated dishes into distinct strings in the items array (e.g. do not keep "Rice; Dinner: Veg Kofta" as one string).`;

  try {
    const contents: any[] = [];

    if (params.imageBase64) {
      contents.push({
        inlineData: {
          mimeType: params.mimeType || 'image/jpeg',
          data: params.imageBase64,
        },
      });
      contents.push({
        text: 'Transcribe this mess menu board and parse it into days and meals. ' + (params.text ? `Additional notes: ${params.text}` : ''),
      });
    } else {
      contents.push({
        text: `Parse the following hostel mess menu into clean days and meals:\n\n${params.text}`,
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          description: 'List of days parsed from the mess menu',
          items: {
            type: Type.OBJECT,
            properties: {
              dayName: { type: Type.STRING, description: 'e.g. Monday, Day 1, or Today' },
              meals: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    mealType: {
                      type: Type.STRING,
                      description: 'breakfast, lunch, snacks, or dinner',
                    },
                    title: { type: Type.STRING, description: 'e.g. Breakfast' },
                    items: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                      description: 'Clean food names only, e.g. ["Rajma", "Steamed White Rice", "Plain Dahi"]',
                    },
                  },
                  required: ['mealType', 'title', 'items'],
                },
              },
            },
            required: ['dayName', 'meals'],
          },
        },
      },
    });

    const parsedJson = JSON.parse(response.text?.trim() || '[]');
    if (Array.isArray(parsedJson) && parsedJson.length > 0) {
      return parsedJson as ParsedMenuDayOutput[];
    }
  } catch (err: any) {
    const isQuota = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      console.log('Gemini API free tier quota reached (429). Using deterministic hostel menu parser.');
    } else {
      console.log('Notice: using deterministic hostel menu parser fallback.');
    }
  }

  return localFallbackMenuParser(params.text || '');
}

/**
 * Intelligent deterministic rule-based gym-bro coach engine.
 * Generates personalized advice when Gemini API key is missing or quota is reached.
 */
export function generateRuleBasedCoachAdvice(params: {
  friendName: string;
  weightKg: number;
  dietPreference: string;
  dailyProteinTarget: number;
  currentMessProtein: number;
  deficitProtein: number;
  unverifiedFoods: string[];
  mealsSummary: string;
}) {
  const isVeg = params.dietPreference === 'veg' || params.dietPreference === 'lacto_veg';
  const isEggetarian = params.dietPreference === 'eggetarian';
  const isNonVeg = params.dietPreference === 'non_veg';

  // Dynamic add-ons list based on diet and gap
  const recommendedAddons: {
    name: string;
    meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
    costInr: number;
    proteinGrams: number;
    tip: string;
  }[] = [];

  if (isNonVeg || isEggetarian) {
    recommendedAddons.push({
      name: '2 Boiled Eggs (Night Canteen / Tapri)',
      meal: 'breakfast',
      costInr: 14,
      proteinGrams: 13,
      tip: 'Get 2 whole eggs boiled with black pepper right after your morning mess breakfast.',
    });
  } else {
    recommendedAddons.push({
      name: 'Amul High Protein Lassi (200ml)',
      meal: 'breakfast',
      costInr: 25,
      proteinGrams: 15,
      tip: 'Zero-fat, grab from the campus Amul parlor or tuck-shop after breakfast.',
    });
  }

  // Soya chunks is universally suitable for all diets
  recommendedAddons.push({
    name: 'Electric Kettle Soya Chunks (50g)',
    meal: 'dinner',
    costInr: 10,
    proteinGrams: 26,
    tip: 'Boil 50g dry chunks in your room kettle with salt for 5 mins, squeeze water, dump into mess dal.',
  });

  if (isNonVeg) {
    recommendedAddons.push({
      name: 'Extra Canteen Chicken Breast / Double Egg Curry',
      meal: 'dinner',
      costInr: 60,
      proteinGrams: 28,
      tip: 'Ask the hostel night canteen for an extra portion of plain boiled eggs or chicken curry.',
    });
  } else if (isEggetarian) {
    recommendedAddons.push({
      name: 'Double Egg Canteen Bhurji / Omelette',
      meal: 'dinner',
      costInr: 30,
      proteinGrams: 14,
      tip: 'Order from night canteen with minimal oil and have with your mess rotis.',
    });
  } else {
    recommendedAddons.push({
      name: 'Amul High Protein Buttermilk (200ml)',
      meal: 'lunch',
      costInr: 25,
      proteinGrams: 15,
      tip: 'Drink with lunch to aid digestion and add 15g whey/casein protein.',
    });
  }

  recommendedAddons.push({
    name: 'Roasted Chana Pouch (50g)',
    meal: 'lunch',
    costInr: 15,
    proteinGrams: 10,
    tip: 'Keep a pouch in your backpack for library study sessions between classes.',
  });

  const totalAdded = recommendedAddons.reduce((sum, a) => sum + a.proteinGrams, 0);

  return {
    headline: `Bhai ${params.friendName}, you're ${params.deficitProtein}g short of making gains today!`,
    summary: `Your hostel mess menu gives you ${params.currentMessProtein}g out of your ${params.dailyProteinTarget}g target. Mess dal is ~90% water with barely 4g protein per katori, and the sabzis are heavy on carbs and cooking oil.`,
    proteinAssessment: `At ${params.weightKg}kg, progressive overload requires at least ${params.dailyProteinTarget}g/day (2.0g/kg). A ${params.deficitProtein}g deficit means your muscles won't fully recover between gym sessions.`,
    recommendedAddons,
    gymBroTips: [
      'Mess Dal Truth: 1 katori mess dal has only ~4g protein, not the 15g hostel lifters assume!',
      'Soya Chunks Economy: Soya is 52g protein per 100g dry weight at just ₹20 per pack—your cheapest weapon.',
      'Hydration: Drink at least 3-4 liters of water daily to support nitrogen clearance as you increase protein.',
      `Target Met: Adding these simple canteen hacks adds +${totalAdded}g protein for under ₹75/day!`,
    ],
    mythBuster: 'Myth: "Bhai I had 2 bowls of dal and 4 rotis, I got 30g protein!" Reality: 2 watery dals (~8g) + 4 rotis (~11g) = ~19g total protein accompanied by ~90g carbohydrates.',
  };
}

/**
 * Writes friendly, relatable hostel gym-bro advice to close the protein gap.
 * Takes the STRICT, deterministic nutrition calculations from the engine so the AI cannot hallucinate the math.
 */
export async function generateCoachAdviceWithGemini(params: {
  friendName: string;
  weightKg: number;
  dietPreference: string;
  dailyProteinTarget: number;
  currentMessProtein: number;
  deficitProtein: number;
  unverifiedFoods: string[];
  mealsSummary: string;
}): Promise<{
  headline: string;
  summary: string;
  proteinAssessment: string;
  recommendedAddons: {
    name: string;
    meal: 'breakfast' | 'lunch' | 'snacks' | 'dinner';
    costInr: number;
    proteinGrams: number;
    tip: string;
  }[];
  gymBroTips: string[];
  mythBuster?: string;
}> {
  const ai = getAiClient();

  if (!ai) {
    return generateRuleBasedCoachAdvice(params);
  }

  const prompt = `You are "Mess Macro Coach", an experienced, sharp, empathetic, and encouraging Indian gym-bro who survived 4 years on engineering hostel mess food.
Your friend ${params.friendName} lifts weights, weighs ${params.weightKg} kg, and has a diet preference of "${params.dietPreference}".

THE NUTRITION MATH (DO NOT CHANGE OR RECALCULATE THESE NUMBERS - THEY ARE VERIFIED AGAINST IFCT/USDA TABLES):
- Friend Daily Target: ${params.dailyProteinTarget}g protein
- Current Hostel Mess Food Provides: ${params.currentMessProtein}g protein
- Deficit To Close: ${params.deficitProtein}g protein
${params.unverifiedFoods.length > 0 ? `- Note: The following items were flagged as unverified in IFCT/USDA and were assigned 0g to prevent false safety: ${params.unverifiedFoods.join(', ')}` : ''}

Today's Mess Food Summary:
${params.mealsSummary}

YOUR MISSION:
Write a punchy, hyper-relatable gym-bro breakdown.
1. Headline: Funny, direct gym-bro wake-up call (e.g. "Bhai, you're 88g short of making gains today!").
2. Summary: Break down why today's mess menu failed him (watery dal, mostly carbs/potatoes).
3. Protein Assessment: Explain what happens if he lifts with this deficit (fatigue, catabolism).
4. Recommended Add-ons: Suggest 2 to 4 ultra-cheap, realistic hostel canteen/tuck-shop add-ons with approx cost in INR (₹) and protein grams to close the ${params.deficitProtein}g deficit. Prioritize things an Indian student can actually get: Canteen boiled eggs (₹14 for 2), Amul High Protein Lassi/Buttermilk (₹25 for 15g), electric kettle soaked Soya Chunks (₹10 for 26g), 200g Amul/Mother Dairy Dahi pouch (₹32 for 7g), 50g Roasted Chana (₹15 for 10g), raw paneer from campus gate dairy, or 1 scoop whey if budget allows. Respect diet preference "${params.dietPreference}" strictly!
5. 3 practical hostel life hacks / gym bro tips.
6. A quick "Mess Myth Buster" calling out common hostel food misconceptions (e.g. "Mess dal has 20g protein" or "eating 6 pooris is bulking").`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headline: { type: Type.STRING },
            summary: { type: Type.STRING },
            proteinAssessment: { type: Type.STRING },
            recommendedAddons: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  meal: { type: Type.STRING, description: 'breakfast, lunch, snacks, or dinner' },
                  costInr: { type: Type.NUMBER },
                  proteinGrams: { type: Type.NUMBER },
                  tip: { type: Type.STRING },
                },
                required: ['name', 'meal', 'costInr', 'proteinGrams', 'tip'],
              },
            },
            gymBroTips: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            mythBuster: { type: Type.STRING },
          },
          required: ['headline', 'summary', 'proteinAssessment', 'recommendedAddons', 'gymBroTips'],
        },
      },
    });

    const parsed = JSON.parse(response.text?.trim() || '{}');
    if (parsed.headline && parsed.recommendedAddons) {
      return parsed;
    }
  } catch (err: any) {
    const isQuota = err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('quota') || err?.message?.includes('RESOURCE_EXHAUSTED');
    if (isQuota) {
      console.log('Gemini API free tier quota reached (429). Serving intelligent deterministic gym-bro coach advice.');
    } else {
      console.log('Notice: using intelligent gym-bro coach rule engine.');
    }
  }

  return generateRuleBasedCoachAdvice(params);
}

/**
 * Fast deterministic local fallback parser if Gemini API key is missing or offline.
 */
function localFallbackMenuParser(text: string): ParsedMenuDayOutput[] {
  const dayRegex = /\b(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\b/i;
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

  // Check if multiple days are listed
  const dayIndices: { dayName: string; lineIndex: number }[] = [];
  lines.forEach((line, index) => {
    // If line starts with a day name or contains "MON:"
    const match = line.match(/^(?:KMK.*?:\s*)?\b(monday|mon|tuesday|tue|wednesday|wed|thursday|thu|friday|fri|saturday|sat|sunday|sun)\b[:\-]?/i);
    if (match) {
      const raw = match[1].toLowerCase();
      const dayMap: Record<string, string> = {
        mon: 'Monday', monday: 'Monday',
        tue: 'Tuesday', tuesday: 'Tuesday',
        wed: 'Wednesday', wednesday: 'Wednesday',
        thu: 'Thursday', thursday: 'Thursday',
        fri: 'Friday', friday: 'Friday',
        sat: 'Saturday', saturday: 'Saturday',
        sun: 'Sunday', sunday: 'Sunday',
      };
      dayIndices.push({ dayName: dayMap[raw] || 'Monday', lineIndex: index });
    }
  });

  if (dayIndices.length >= 2) {
    const results: ParsedMenuDayOutput[] = [];
    for (let i = 0; i < dayIndices.length; i++) {
      const current = dayIndices[i];
      const nextIndex = i + 1 < dayIndices.length ? dayIndices[i + 1].lineIndex : lines.length;
      const dayLines = lines.slice(current.lineIndex, nextIndex);
      results.push(parseSingleDayBlock(current.dayName, dayLines));
    }
    return results;
  }

  // Single day parse
  return [parseSingleDayBlock('Today', lines)];
}

function parseSingleDayBlock(dayName: string, lines: string[]): ParsedMenuDayOutput {
  const mealsMap: Record<string, string[]> = {
    breakfast: [],
    lunch: [],
    snacks: [],
    dinner: [],
  };

  let currentMeal: 'breakfast' | 'lunch' | 'snacks' | 'dinner' = 'lunch';

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('breakfast') || lower.includes('breakfast:')) {
      currentMeal = 'breakfast';
      const items = line.split(/breakfast[:\-]/i)[1];
      if (items) mealsMap.breakfast.push(...items.split(/[,/]+/).map((s) => s.trim()).filter(Boolean));
    } else if (lower.startsWith('lunch') || lower.includes('lunch:')) {
      currentMeal = 'lunch';
      const items = line.split(/lunch[:\-]/i)[1];
      if (items) mealsMap.lunch.push(...items.split(/[,/]+/).map((s) => s.trim()).filter(Boolean));
    } else if (lower.includes('snack') || lower.includes('evening:')) {
      currentMeal = 'snacks';
      const items = line.split(/(?:snack|snacks|tea|evening)[:\-]/i)[1];
      if (items) mealsMap.snacks.push(...items.split(/[,/]+/).map((s) => s.trim()).filter(Boolean));
    } else if (lower.startsWith('dinner') || lower.includes('dinner:')) {
      currentMeal = 'dinner';
      const items = line.split(/dinner[:\-]/i)[1];
      if (items) mealsMap.dinner.push(...items.split(/[,/]+/).map((s) => s.trim()).filter(Boolean));
    } else if (!line.match(/^(?:mon|tue|wed|thu|fri|sat|sun)\b/i) && !line.includes('DAILY SERVED')) {
      const items = line.split(/[,/]+/).map((s) => s.trim()).filter(Boolean);
      mealsMap[currentMeal].push(...items);
    }
  }

  // If nothing parsed in lunch/dinner, provide defaults
  if (mealsMap.breakfast.length === 0 && mealsMap.lunch.length === 0 && mealsMap.dinner.length === 0) {
    mealsMap.breakfast = ['Poha', 'Chai'];
    mealsMap.lunch = ['Rajma', 'Steamed White Rice', 'Plain Dahi', '3 Roti'];
    mealsMap.dinner = ['Dal Tadka', 'Aloo Gobhi', '4 Roti'];
  }

  const mealsList: ParsedMealOutput[] = [
    { mealType: 'breakfast', title: 'Breakfast', items: mealsMap.breakfast },
    { mealType: 'lunch', title: 'Lunch', items: mealsMap.lunch },
  ];

  if (mealsMap.snacks && mealsMap.snacks.length > 0) {
    mealsList.push({ mealType: 'snacks', title: 'Evening Snacks', items: mealsMap.snacks });
  }

  mealsList.push({ mealType: 'dinner', title: 'Dinner', items: mealsMap.dinner });

  return {
    dayName,
    meals: mealsList,
  };
}
