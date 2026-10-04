export type MealType = 'breakfast' | 'lunch' | 'snacks' | 'dinner';

export type DietPreference = 'veg' | 'lacto_veg' | 'eggetarian' | 'non_veg';

export interface NutritionalInfo {
  calories: number; // kcal
  protein: number;  // grams
  carbs: number;    // grams
  fat: number;      // grams
  fiber?: number;   // grams
}

export interface MessFoodItem extends NutritionalInfo {
  id: string;
  name: string;
  hindiName?: string;
  category: 'dal' | 'paneer_dairy' | 'egg_nonveg' | 'bread_grain' | 'sabzi' | 'breakfast' | 'snack_sweet';
  standardServing: string; // e.g. "1 katori (150g)", "1 roti", "2 eggs"
  servingWeightGrams: number;
  source: 'IFCT 2017 (ICMR-NIN)' | 'USDA FoodData Central';
  isCommonMessItem: boolean;
  notes?: string;
  aliases: string[];
}

export interface LoggedFoodItem {
  id: string;
  foodId?: string;
  name: string;
  portionMultiplier: number; // 1 = 1 standard serving, 0.5 = half, 2 = double
  servingDescription: string;
  isVerified: boolean;
  unverifiedNote?: string;
  nutrition: NutritionalInfo;
}

export interface Meal {
  type: MealType;
  title: string;
  items: LoggedFoodItem[];
  totalNutrition: NutritionalInfo;
}

export interface DayPlan {
  dayName: string; // e.g. "Monday", "Day 1"
  date?: string;
  meals: Record<MealType, Meal>;
  totalNutrition: NutritionalInfo;
  unverifiedCount: number;
}

export interface CanteenAddOn {
  id: string;
  name: string;
  portion: string;
  protein: number; // grams
  calories: number;
  carbs: number;
  fat: number;
  costInr: number; // approx cost in Indian Rupees
  isVeg: boolean;
  isEggetarian: boolean;
  isNonVeg: boolean;
  prepMethod: 'ready_to_eat' | 'canteen_order' | 'kettle_hack' | 'grocery_stash';
  description: string;
}

export interface UserProfile {
  friendName: string;
  weightKg: number;
  dietPreference: DietPreference;
  proteinTargetPerKg: number; // typically 1.6 to 2.2 g/kg
  dailyProteinTarget: number; // weightKg * proteinTargetPerKg
  collegeName?: string;
  monthlyAddonBudgetInr?: number;
}

export interface CoachAdviceResult {
  headline: string;
  summary: string;
  proteinAssessment: string;
  recommendedAddons: {
    addonId?: string;
    name: string;
    meal: MealType;
    costInr: number;
    proteinGrams: number;
    tip: string;
  }[];
  totalAddedProtein?: number;
  totalEstimatedCostInr?: number;
  gymBroTips: string[];
  mythBuster?: string;
}

export interface DayProteinLog {
  dayNumber: number; // 1, 2, 3
  dateStr: string;
  proteinGrams: number;
  calories: number;
  notes?: string;
  addonCostInr?: number;
}

export interface BeforeAfterExperiment {
  friendName: string;
  targetProtein: number;
  beforeDays: [DayProteinLog, DayProteinLog, DayProteinLog];
  afterDays: [DayProteinLog, DayProteinLog, DayProteinLog];
  notes?: string;
}
