import { MESS_FOODS_DATABASE, CANTEEN_ADDONS } from './messFoods';
import { MessFoodItem, LoggedFoodItem, NutritionalInfo, DayPlan, Meal, MealType, DietPreference, CanteenAddOn } from '../types';

/**
 * Normalizes food string for matching against IFCT/USDA lookup table.
 */
function cleanText(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts portion multiplier from strings like:
 * "4 rotis", "2 boiled eggs", "2 katori dal", "half plate rice", "3 chapatis"
 */
export function extractPortionMultiplier(rawName: string): { cleanName: string; multiplier: number; servingHint?: string } {
  const text = rawName.trim();
  let multiplier = 1;
  let clean = text;

  // Check leading numbers e.g. "4 rotis", "2 eggs", "3 puris", "2 katoris dal"
  const leadingNumMatch = text.match(/^(\d+(?:\.\d+)?)\s*(?:x\s*)?(?:katori|bowl|plate|rotis?|chapatis?|puris?|eggs?|pcs?|pieces?|slices?)?\s*(.*)$/i);
  if (leadingNumMatch && leadingNumMatch[1] && leadingNumMatch[2]) {
    const num = parseFloat(leadingNumMatch[1]);
    const remainder = leadingNumMatch[2].trim();
    if (!isNaN(num) && num > 0 && num <= 10 && remainder.length > 2) {
      // If the matched item is something like "2 boiled eggs" or "4 roti"
      if (!remainder.toLowerCase().startsWith('egg') || num !== 2) {
        multiplier = num;
        clean = remainder;
      }
    }
  }

  // Check words like "half", "double", "triple", "two", "three", "four"
  const lower = clean.toLowerCase();
  if (lower.startsWith('half ') || lower.includes(' half ')) {
    multiplier = 0.5;
    clean = clean.replace(/\bhalf\b/gi, '').trim();
  } else if (lower.startsWith('double ')) {
    multiplier = 2;
    clean = clean.replace(/\bdouble\b/gi, '').trim();
  } else if (lower.startsWith('4 ') || lower.startsWith('4x ')) {
    multiplier = 4;
    clean = clean.replace(/^4\s*(?:x\s*)?/i, '').trim();
  } else if (lower.startsWith('3 ') || lower.startsWith('3x ')) {
    multiplier = 3;
    clean = clean.replace(/^3\s*(?:x\s*)?/i, '').trim();
  } else if (lower.startsWith('2 ') || lower.startsWith('2x ')) {
    multiplier = 2;
    clean = clean.replace(/^2\s*(?:x\s*)?/i, '').trim();
  }

  return { cleanName: clean, multiplier };
}

/**
 * Look up a food string in the IFCT/USDA 65+ food database.
 * Strictest rule: Never guess numbers. If unverified, flag clearly with 0 macros.
 */
export function matchFoodToDatabase(rawInput: string): LoggedFoodItem {
  const { cleanName, multiplier } = extractPortionMultiplier(rawInput);
  const normalized = cleanText(cleanName);

  // Exact ID or Name match
  let found: MessFoodItem | undefined = MESS_FOODS_DATABASE.find(
    (item) => item.id === normalized || cleanText(item.name) === normalized
  );

  // Alias match (highest priority)
  if (!found) {
    found = MESS_FOODS_DATABASE.find((item) =>
      item.aliases.some((alias) => cleanText(alias) === normalized)
    );
  }

  // Substring match: e.g. "mess rajma" matches "rajma", "peeli toor dal" matches "toor dal"
  if (!found) {
    found = MESS_FOODS_DATABASE.find((item) =>
      item.aliases.some((alias) => {
        const cleanedAlias = cleanText(alias);
        return normalized.includes(cleanedAlias) || cleanedAlias.includes(normalized);
      })
    );
  }

  // Word-boundary match for multi-item strings like "rajma chawal" -> returns Rajma or split
  if (!found) {
    const words = normalized.split(' ');
    for (const item of MESS_FOODS_DATABASE) {
      if (item.aliases.some((alias) => words.includes(cleanText(alias)))) {
        found = item;
        break;
      }
    }
  }

  if (found) {
    const mult = multiplier || 1;
    return {
      id: `${found.id}_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      foodId: found.id,
      name: found.name,
      portionMultiplier: mult,
      servingDescription: mult === 1 ? found.standardServing : `${mult} × ${found.standardServing}`,
      isVerified: true,
      nutrition: {
        calories: Math.round(found.calories * mult),
        protein: Math.round(found.protein * mult * 10) / 10,
        carbs: Math.round(found.carbs * mult * 10) / 10,
        fat: Math.round(found.fat * mult * 10) / 10,
        fiber: found.fiber !== undefined ? Math.round(found.fiber * mult * 10) / 10 : undefined,
      },
    };
  }

  // UNVERIFIED FOOD: Strictly do NOT invent numbers!
  return {
    id: `unverified_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    name: rawInput.trim(),
    portionMultiplier: multiplier || 1,
    servingDescription: '1 standard mess serving (unverified)',
    isVerified: false,
    unverifiedNote: 'Not found in IFCT/USDA lookup table. Zero macro estimation applied to prevent hallucination.',
    nutrition: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
  };
}

/**
 * Deterministically recalculates a logged food item when the user tweaks portion multiplier.
 */
export function recalculateItemNutrition(item: LoggedFoodItem, newMultiplier: number): LoggedFoodItem {
  if (!item.isVerified || !item.foodId) {
    return {
      ...item,
      portionMultiplier: newMultiplier,
      servingDescription: `${newMultiplier} × custom portion`,
    };
  }

  const base = MESS_FOODS_DATABASE.find((f) => f.id === item.foodId);
  if (!base) return { ...item, portionMultiplier: newMultiplier };

  return {
    ...item,
    portionMultiplier: newMultiplier,
    servingDescription: newMultiplier === 1 ? base.standardServing : `${newMultiplier} × ${base.standardServing}`,
    nutrition: {
      calories: Math.round(base.calories * newMultiplier),
      protein: Math.round(base.protein * newMultiplier * 10) / 10,
      carbs: Math.round(base.carbs * newMultiplier * 10) / 10,
      fat: Math.round(base.fat * newMultiplier * 10) / 10,
      fiber: base.fiber !== undefined ? Math.round(base.fiber * newMultiplier * 10) / 10 : undefined,
    },
  };
}

/**
 * Sums up nutritional values for a list of items.
 */
export function sumNutrition(items: LoggedFoodItem[]): NutritionalInfo {
  let cal = 0;
  let pro = 0;
  let carb = 0;
  let fat = 0;
  let fib = 0;

  for (const item of items) {
    cal += item.nutrition.calories || 0;
    pro += item.nutrition.protein || 0;
    carb += item.nutrition.carbs || 0;
    fat += item.nutrition.fat || 0;
    fib += item.nutrition.fiber || 0;
  }

  return {
    calories: Math.round(cal),
    protein: Math.round(pro * 10) / 10,
    carbs: Math.round(carb * 10) / 10,
    fat: Math.round(fat * 10) / 10,
    fiber: Math.round(fib * 10) / 10,
  };
}

/**
 * Builds or recalculates a full day's nutrition.
 */
export function buildDayPlan(
  dayName: string,
  mealsInput: Partial<Record<MealType, { title?: string; rawItems: string[] }>>
): DayPlan {
  const mealTypes: MealType[] = ['breakfast', 'lunch', 'snacks', 'dinner'];
  const meals: Record<MealType, Meal> = {
    breakfast: { type: 'breakfast', title: mealsInput.breakfast?.title || 'Breakfast', items: [], totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
    lunch: { type: 'lunch', title: mealsInput.lunch?.title || 'Lunch', items: [], totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
    snacks: { type: 'snacks', title: mealsInput.snacks?.title || 'Evening Snacks', items: [], totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
    dinner: { type: 'dinner', title: mealsInput.dinner?.title || 'Dinner', items: [], totalNutrition: { calories: 0, protein: 0, carbs: 0, fat: 0 } },
  };

  let unverifiedCount = 0;
  const allItems: LoggedFoodItem[] = [];

  for (const mType of mealTypes) {
    const rawList = mealsInput[mType]?.rawItems || [];
    const loggedItems: LoggedFoodItem[] = [];

    for (const raw of rawList) {
      // Handle comma-separated or slash separated foods in a single string e.g. "Rajma, Chawal, Dahi"
      const subItems = raw.split(/[,/&]+/).map((s) => s.trim()).filter(Boolean);
      for (const sub of (subItems.length > 1 ? subItems : [raw])) {
        const item = matchFoodToDatabase(sub);
        if (!item.isVerified) unverifiedCount++;
        loggedItems.push(item);
        allItems.push(item);
      }
    }

    meals[mType] = {
      type: mType,
      title: mealsInput[mType]?.title || (mType.charAt(0).toUpperCase() + mType.slice(1)),
      items: loggedItems,
      totalNutrition: sumNutrition(loggedItems),
    };
  }

  return {
    dayName,
    meals,
    totalNutrition: sumNutrition(allItems),
    unverifiedCount,
  };
}

/**
 * Calculates protein gap and status.
 */
export function calculateProteinAssessment(currentProtein: number, targetProtein: number) {
  const deficit = Math.max(0, Math.round((targetProtein - currentProtein) * 10) / 10);
  const percentage = Math.min(200, Math.round((currentProtein / targetProtein) * 100));

  let statusText = 'High Deficit';
  let badgeColor = 'bg-red-500/20 text-red-300 border-red-500/40';

  if (percentage >= 100) {
    statusText = 'Target Met';
    badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
  } else if (percentage >= 80) {
    statusText = 'Close to Target';
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
  } else if (percentage >= 50) {
    statusText = 'Moderate Deficit';
    badgeColor = 'bg-orange-500/20 text-orange-300 border-orange-500/40';
  }

  return {
    deficit,
    percentage,
    statusText,
    badgeColor,
    isSurplus: currentProtein >= targetProtein,
  };
}

/**
 * Filter canteen add-ons based on diet preference.
 */
export function filterAddOnsForDiet(preference: DietPreference): CanteenAddOn[] {
  return CANTEEN_ADDONS.filter((addon) => {
    if (preference === 'veg' || preference === 'lacto_veg') return addon.isVeg;
    if (preference === 'eggetarian') return addon.isVeg || addon.isEggetarian;
    return true; // non_veg gets all
  });
}
