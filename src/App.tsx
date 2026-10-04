import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  BookOpen
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { ProfileModal } from './components/ProfileModal';
import { MenuInputSection } from './components/MenuInputSection';
import { DayPlanView } from './components/DayPlanView';
import { CoachAdviceSection } from './components/CoachAdviceSection';
import { ThreeDayTracker } from './components/ThreeDayTracker';
import { WeeklyProteinOverview } from './components/WeeklyProteinOverview';
import { FoodLibraryModal } from './components/FoodLibraryModal';
import { UserProfile, DayPlan, CoachAdviceResult, MealType, LoggedFoodItem, BeforeAfterExperiment, DayProteinLog } from './types';
import { buildDayPlan } from './data/nutritionEngine';
import { getStoredItem, setStoredItem } from './utils/storage';

const DEFAULT_PROFILE: UserProfile = {
  friendName: 'Rohan',
  weightKg: 72,
  dietPreference: 'eggetarian',
  proteinTargetPerKg: 2.0,
  dailyProteinTarget: 144,
  collegeName: 'IIIT Prayagraj (BH-2/3)',
  monthlyAddonBudgetInr: 1500,
};

// Initial realistic 7-day mess week (matching IIIT Prayagraj / standard hostel menu without snacks)
const INITIAL_WEEKLY_PLANS: DayPlan[] = [
  buildDayPlan('Monday', {
    breakfast: { title: 'Breakfast', rawItems: ['Chana Samosa', 'Dalia', 'Milk', '2 Boiled Eggs'] },
    lunch: { title: 'Lunch', rawItems: ['Kadhi Pakora', 'Aloo Shimla Mirch', 'Pineapple Raita', 'Jeera Rice', '4 Roti'] },
    dinner: { title: 'Dinner', rawItems: ['Egg Curry', 'Kadhai Paneer', 'Moong Dal', 'Steamed White Rice', '4 Roti', 'Gulab Jamun'] },
  }),
  buildDayPlan('Tuesday', {
    breakfast: { title: 'Breakfast', rawItems: ['Uttapam', 'Sambhar', 'Coconut Chutney', 'Cornflakes with Milk'] },
    lunch: { title: 'Lunch', rawItems: ['Litti Chokha', 'Arhar Dal', 'Steamed White Rice', 'Lassi', 'Sambhar'] },
    dinner: { title: 'Dinner', rawItems: ['Veg Kofta Curry', 'Arhar Dal', 'Steamed White Rice', '4 Roti', 'Fruit Custard'] },
  }),
  buildDayPlan('Wednesday', {
    breakfast: { title: 'Breakfast', rawItems: ['Pav Bhaji', 'Dalia', 'Sprouted Moong Salad'] },
    lunch: { title: 'Lunch', rawItems: ['Kali Masoor Dal', 'Kaddu Sabzi', 'Plain Dahi', 'Steamed White Rice', 'Puri'] },
    dinner: { title: 'Dinner', rawItems: ['Chana Masala', 'Arhar Dal', 'Veg Fried Rice', '4 Roti', 'Suji Halwa'] },
  }),
  buildDayPlan('Thursday', {
    breakfast: { title: 'Breakfast', rawItems: ['Medu Vada', 'Sambhar', 'Coconut Chutney', 'Cornflakes with Milk', '2 Boiled Eggs'] },
    lunch: { title: 'Lunch', rawItems: ['Safed Matar Masala', 'Dal Makhni', 'Veg Pulao', 'Chaach', '4 Roti'] },
    dinner: { title: 'Dinner', rawItems: ['Aloo Pattagobhi', 'Rajma Curry', 'Steamed White Rice', '4 Roti', 'Milk Cake'] },
  }),
  buildDayPlan('Friday', {
    breakfast: { title: 'Breakfast', rawItems: ['Poha', 'Haldiram Bhujiya', 'Jalebi', 'Dalia', 'Milk'] },
    lunch: { title: 'Lunch', rawItems: ['Aloo Bhujiya Sabzi', 'Chana Dal Tadka', 'Steamed White Rice', '4 Roti', 'Plain Dahi'] },
    dinner: { title: 'Dinner', rawItems: ['Chicken Curry', 'Paneer Pyaaz Paratha', 'Moong Dal', 'Steamed White Rice', 'Kaju Katli'] },
  }),
  buildDayPlan('Saturday', {
    breakfast: { title: 'Breakfast', rawItems: ['Masala Dosa', 'Coconut Chutney', 'Sambhar', 'Cornflakes with Milk', '2 Boiled Eggs'] },
    lunch: { title: 'Lunch', rawItems: ['Chole Bhature', 'Steamed White Rice', 'Boondi Raita', 'Sambhar'] },
    dinner: { title: 'Dinner', rawItems: ['Soya Chunks Curry', 'Arhar Dal', 'Veg Pulao', '4 Roti', 'Ice Cream'] },
  }),
  buildDayPlan('Sunday', {
    breakfast: { title: 'Breakfast', rawItems: ['Aloo Pyaaz Paratha', 'Plain Dahi', 'Chutney', 'Cornflakes with Milk'] },
    lunch: { title: 'Lunch', rawItems: ['Aloo Jhol', 'Arhar Dal', 'Mix Veg Raita', 'Veg Biryani', '4 Roti'] },
    dinner: { title: 'Dinner', rawItems: ['Veg Chowmein', 'Veg Manchurian Gravy', 'Mix Dal', 'Steamed White Rice', '4 Roti', 'Sewai Kheer'] },
  }),
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    return getStoredItem<UserProfile>('mess_macro_profile', DEFAULT_PROFILE);
  });

  const [activeTab, setActiveTab] = useState<'menu' | 'tracker' | 'library'>('menu');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isFoodLibraryOpen, setIsFoodLibraryOpen] = useState(false);

  // Multi-day weekly plans
  const [weeklyPlans, setWeeklyPlans] = useState<DayPlan[]>(INITIAL_WEEKLY_PLANS);
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0);

  // Active current day plan
  const currentPlan = weeklyPlans[activeDayIndex] || weeklyPlans[0];

  // 3-Day before & after experiment state
  const [experiment, setExperiment] = useState<BeforeAfterExperiment>(() => {
    return {
      friendName: profile.friendName,
      targetProtein: profile.dailyProteinTarget,
      beforeDays: [
        {
          dayNumber: 1,
          dateStr: `Day 1 (${INITIAL_WEEKLY_PLANS[0].dayName})`,
          proteinGrams: INITIAL_WEEKLY_PLANS[0].totalNutrition.protein,
          calories: INITIAL_WEEKLY_PLANS[0].totalNutrition.calories,
          notes: 'Mess food as served',
          addonCostInr: 0,
        },
        {
          dayNumber: 2,
          dateStr: `Day 2 (${INITIAL_WEEKLY_PLANS[1].dayName})`,
          proteinGrams: INITIAL_WEEKLY_PLANS[1].totalNutrition.protein,
          calories: INITIAL_WEEKLY_PLANS[1].totalNutrition.calories,
          notes: 'Mess food as served',
          addonCostInr: 0,
        },
        {
          dayNumber: 3,
          dateStr: `Day 3 (${INITIAL_WEEKLY_PLANS[2].dayName})`,
          proteinGrams: INITIAL_WEEKLY_PLANS[2].totalNutrition.protein,
          calories: INITIAL_WEEKLY_PLANS[2].totalNutrition.calories,
          notes: 'Mess food as served',
          addonCostInr: 0,
        },
      ],
      afterDays: [
        {
          dayNumber: 1,
          dateStr: `Day 1 (+ Canteen Eggs & Kettle Soya)`,
          proteinGrams: INITIAL_WEEKLY_PLANS[0].totalNutrition.protein + 85,
          calories: INITIAL_WEEKLY_PLANS[0].totalNutrition.calories + 420,
          notes: '+2 boiled eggs (bfast) + 50g kettle soya chunks (dinner)',
          addonCostInr: 24,
        },
        {
          dayNumber: 2,
          dateStr: `Day 2 (+ Amul Protein Lassi & Peanuts)`,
          proteinGrams: INITIAL_WEEKLY_PLANS[1].totalNutrition.protein + 95,
          calories: INITIAL_WEEKLY_PLANS[1].totalNutrition.calories + 460,
          notes: '+Amul protein lassi (tuck shop) + 40g roasted peanuts',
          addonCostInr: 45,
        },
        {
          dayNumber: 3,
          dateStr: `Day 3 (+ Double Canteen Omelette & Chana)`,
          proteinGrams: INITIAL_WEEKLY_PLANS[2].totalNutrition.protein + 88,
          calories: INITIAL_WEEKLY_PLANS[2].totalNutrition.calories + 440,
          notes: '+Double canteen omelette + 50g roasted chana pouch',
          addonCostInr: 45,
        },
      ],
    };
  });

  const [coachAdvice, setCoachAdvice] = useState<CoachAdviceResult | null>(null);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setStoredItem('mess_macro_profile', profile);
  }, [profile]);

  useEffect(() => {
    generateAdviceForCurrentPlan(currentPlan, profile);
  }, [activeDayIndex]);

  const generateAdviceForCurrentPlan = async (activePlan: DayPlan, currentProfile: UserProfile) => {
    setIsLoadingAdvice(true);
    setApiError(null);

    const deficit = Math.max(0, currentProfile.dailyProteinTarget - activePlan.totalNutrition.protein);

    const unverified: string[] = [];
    Object.values(activePlan.meals).forEach((m) => {
      m.items.forEach((i) => {
        if (!i.isVerified) unverified.push(i.name);
      });
    });

    const mealsSummary = `Day: ${activePlan.dayName}
Breakfast: ${activePlan.meals.breakfast.items.map((i) => i.name).join(', ') || 'None'}
Lunch: ${activePlan.meals.lunch.items.map((i) => i.name).join(', ') || 'None'}
Snacks: ${activePlan.meals.snacks.items.map((i) => i.name).join(', ') || 'None'}
Dinner: ${activePlan.meals.dinner.items.map((i) => i.name).join(', ') || 'None'}`;

    try {
      const res = await fetch('/api/coach-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          friendName: currentProfile.friendName,
          weightKg: currentProfile.weightKg,
          dietPreference: currentProfile.dietPreference,
          dailyProteinTarget: currentProfile.dailyProteinTarget,
          currentMessProtein: activePlan.totalNutrition.protein,
          deficitProtein: deficit,
          unverifiedFoods: unverified,
          mealsSummary,
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to generate advice: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.advice) {
        setCoachAdvice(data.advice);
      }
    } catch (err: any) {
      console.warn('Using client fallback coach advice:', err);
      setCoachAdvice({
        headline: `${activePlan.dayName}: ${activePlan.totalNutrition.protein}g protein logged (${deficit}g deficit)`,
        summary: `On ${activePlan.dayName}, your mess menu gives you ${activePlan.totalNutrition.protein}g protein against your ${currentProfile.dailyProteinTarget}g goal.`,
        proteinAssessment: `At ${currentProfile.weightKg}kg, an intake of ${currentProfile.dailyProteinTarget}g/day is needed to avoid catabolism and support muscle recovery.`,
        recommendedAddons: [
          {
            name: currentProfile.dietPreference === 'veg' ? 'Amul High Protein Lassi (200ml)' : '2 Boiled Eggs (Night Canteen)',
            meal: 'breakfast',
            costInr: currentProfile.dietPreference === 'veg' ? 25 : 14,
            proteinGrams: currentProfile.dietPreference === 'veg' ? 15 : 13,
            tip: 'Take immediately after breakfast or morning gym.',
          },
          {
            name: 'Electric Kettle Soya Chunks (50g)',
            meal: 'dinner',
            costInr: 10,
            proteinGrams: 26,
            tip: 'Boil in room kettle with salt, squeeze excess water, mix into mess dal.',
          },
          {
            name: 'Roasted Chana (50g Pouch)',
            meal: 'snacks',
            costInr: 15,
            proteinGrams: 10,
            tip: 'Keep in backpack for late night study.',
          },
        ],
        gymBroTips: [
          'Mess Dal Truth: 1 katori of mess dal is mostly water and only has ~4g protein.',
          'Soya Chunks are the #1 student budget hack: 52g protein per 100g dry weight at ₹20.',
          'Drink at least 3-4 liters of water to support nitrogen clearance.',
        ],
        mythBuster: 'Myth: "Mess dal has 20g protein." Reality: 2 watery dals (~8g) + 4 rotis (~11g) = ~19g total with ~90g carbs.',
      });
    } finally {
      setIsLoadingAdvice(false);
    }
  };

  const handleAnalyzeMenu = async (input: { text?: string; imageBase64?: string; mimeType?: string }) => {
    setIsLoadingMenu(true);
    setApiError(null);

    try {
      const res = await fetch('/api/parse-menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        throw new Error(`Failed to parse menu: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.days && data.days.length > 0) {
        // Build DayPlan for EVERY parsed day in the menu!
        const parsedPlans: DayPlan[] = data.days.map((dayData: any) => {
          const mealsInput: Record<MealType, { title: string; rawItems: string[] }> = {
            breakfast: { title: 'Breakfast', rawItems: [] },
            lunch: { title: 'Lunch', rawItems: [] },
            snacks: { title: 'Evening Snacks', rawItems: [] },
            dinner: { title: 'Dinner', rawItems: [] },
          };

          dayData.meals.forEach((m: any) => {
            const type = (m.mealType || 'lunch').toLowerCase() as MealType;
            if (mealsInput[type]) {
              mealsInput[type].title = m.title || mealsInput[type].title;
              mealsInput[type].rawItems.push(...(m.items || []));
            }
          });

          return buildDayPlan(dayData.dayName || 'Day', mealsInput);
        });

        setWeeklyPlans(parsedPlans);
        setActiveDayIndex(0);
        await generateAdviceForCurrentPlan(parsedPlans[0], profile);
      }
    } catch (err: any) {
      console.error('Error analyzing menu:', err);
      setApiError(err.message || 'Could not parse mess menu. Please check the image resolution or text format.');
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const handleUpdateCurrentDayPlan = (updated: DayPlan) => {
    const updatedWeekly = [...weeklyPlans];
    updatedWeekly[activeDayIndex] = updated;
    setWeeklyPlans(updatedWeekly);
    generateAdviceForCurrentPlan(updated, profile);
  };

  const handleApplyAddonToPlan = (
    meal: MealType,
    addonName: string,
    protein: number,
    calories: number,
    costInr: number
  ) => {
    const loggedAddon: LoggedFoodItem = {
      id: `canteen_addon_${Date.now()}`,
      name: `${addonName} (Canteen Hack)`,
      portionMultiplier: 1,
      servingDescription: '1 portion',
      isVerified: true,
      nutrition: {
        calories,
        protein,
        carbs: Math.round(protein * 0.8),
        fat: Math.round(protein * 0.3),
      },
    };

    const targetMeal = currentPlan.meals[meal];
    const updatedItems = [...targetMeal.items, loggedAddon];

    const updatedMeals = {
      ...currentPlan.meals,
      [meal]: {
        ...targetMeal,
        items: updatedItems,
        totalNutrition: {
          calories: targetMeal.totalNutrition.calories + calories,
          protein: Math.round((targetMeal.totalNutrition.protein + protein) * 10) / 10,
          carbs: Math.round((targetMeal.totalNutrition.carbs + Math.round(protein * 0.8)) * 10) / 10,
          fat: Math.round((targetMeal.totalNutrition.fat + Math.round(protein * 0.3)) * 10) / 10,
          fiber: targetMeal.totalNutrition.fiber,
        },
      },
    };

    const allItems: LoggedFoodItem[] = [];
    (['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).forEach((m) => {
      allItems.push(...updatedMeals[m].items);
    });

    const dayTotal = allItems.reduce(
      (acc, curr) => ({
        calories: acc.calories + curr.nutrition.calories,
        protein: Math.round((acc.protein + curr.nutrition.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + curr.nutrition.carbs) * 10) / 10,
        fat: Math.round((acc.fat + curr.nutrition.fat) * 10) / 10,
        fiber: Math.round(((acc.fiber || 0) + (curr.nutrition.fiber || 0)) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    const updatedPlan: DayPlan = {
      ...currentPlan,
      meals: updatedMeals,
      totalNutrition: dayTotal,
    };

    handleUpdateCurrentDayPlan(updatedPlan);
  };

  const handleLoadWeeklyDaysIntoTracker = (daysToLoad: DayPlan[]) => {
    if (daysToLoad.length < 3) return;

    const newBeforeDays = daysToLoad.slice(0, 3).map((d, i) => ({
      dayNumber: (i + 1) as 1 | 2 | 3,
      dateStr: `Day ${i + 1} (${d.dayName})`,
      proteinGrams: d.totalNutrition.protein,
      calories: d.totalNutrition.calories,
      notes: `${d.dayName} Mess: ${d.meals.lunch.items.map((x) => x.name).slice(0, 2).join(', ')} + ${d.meals.dinner.items.map((x) => x.name).slice(0, 2).join(', ')}`,
      addonCostInr: 0,
    })) as [DayProteinLog, DayProteinLog, DayProteinLog];

    const newAfterDays = daysToLoad.slice(0, 3).map((d, i) => {
      const extraGrams = Math.max(35, profile.dailyProteinTarget - d.totalNutrition.protein);
      return {
        dayNumber: (i + 1) as 1 | 2 | 3,
        dateStr: `Day ${i + 1} (+ Canteen Hacks)`,
        proteinGrams: d.totalNutrition.protein + extraGrams,
        calories: d.totalNutrition.calories + extraGrams * 4 + 100,
        notes: `+ Canteen eggs / high-protein lassi & kettle soya`,
        addonCostInr: i === 0 ? 28 : i === 1 ? 45 : 35,
      };
    }) as [DayProteinLog, DayProteinLog, DayProteinLog];

    setExperiment({
      friendName: profile.friendName,
      targetProtein: profile.dailyProteinTarget,
      beforeDays: newBeforeDays,
      afterDays: newAfterDays,
      notes: `Populated directly from ${profile.friendName}'s uploaded mess menu.`,
    });

    setActiveTab('tracker');
  };

  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    setExperiment((prev) => ({
      ...prev,
      friendName: newProfile.friendName,
      targetProtein: newProfile.dailyProteinTarget,
    }));
    generateAdviceForCurrentPlan(currentPlan, newProfile);
  };

  return (
    <div className="min-h-screen bg-[#EEF4EC] text-[#0E3E1E] font-sans antialiased selection:bg-[#0E3E1E] selection:text-white">
      <Navbar
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenFoodLibrary={() => setIsFoodLibraryOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-6">
        {/* Context Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-3 border-b border-[#D2E2CF]">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-[#0E3E1E]">
              Hostel Food Macro Tracker
            </h1>
            <p className="text-xs text-[#527056] mt-0.5 font-medium">
              Daily protein intake calculation for each day of your mess menu with budget canteen hacks.
            </p>
          </div>
          <div className="text-xs text-[#527056]">
            {profile.friendName} · {profile.weightKg} kg · <span className="text-[#0E3E1E] font-bold">{profile.dailyProteinTarget}g protein target</span>
          </div>
        </div>

        {apiError && (
          <div className="rounded-xl border border-[#FFCDD2] bg-[#FFEBEE] p-3 text-xs text-[#B71C1C] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-[#B71C1C]" />
              <span>{apiError}</span>
            </div>
            <button
              onClick={() => setApiError(null)}
              className="text-xs font-bold text-[#B71C1C] hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab 1: Menu & Daily Plan */}
        {activeTab === 'menu' && (
          <div className="space-y-6">
            <MenuInputSection
              onAnalyzeMenu={handleAnalyzeMenu}
              isLoading={isLoadingMenu}
            />

            {/* Weekly Protein Intake Grid for Each Day */}
            <WeeklyProteinOverview
              plans={weeklyPlans}
              activeDayIndex={activeDayIndex}
              onSelectDay={(idx) => setActiveDayIndex(idx)}
              profile={profile}
              onLoadIntoTracker={handleLoadWeeklyDaysIntoTracker}
            />

            {/* Detailed Meal Plan for Selected Day */}
            <DayPlanView
              dayPlan={currentPlan}
              profile={profile}
              onUpdateDayPlan={handleUpdateCurrentDayPlan}
              onOpenAddonsDrawer={() => setIsFoodLibraryOpen(true)}
            />

            {/* Coach Advice for Selected Day */}
            <CoachAdviceSection
              advice={coachAdvice}
              isLoading={isLoadingAdvice}
              profile={profile}
              dayPlan={currentPlan}
              onApplyAddonToPlan={handleApplyAddonToPlan}
              onRegenerateAdvice={() => generateAdviceForCurrentPlan(currentPlan, profile)}
            />
          </div>
        )}

        {/* Tab 2: 3-Day Before & After Tracker */}
        {activeTab === 'tracker' && (
          <ThreeDayTracker 
            profile={profile} 
            experiment={experiment}
            onUpdateExperiment={setExperiment}
          />
        )}

        {/* Tab 3: Food Database Inline Trigger */}
        {activeTab === 'library' && (
          <div className="rounded-2xl border border-[#D2E2CF] bg-white p-8 text-center space-y-3 shadow-xs">
            <BookOpen className="h-9 w-9 text-[#0E3E1E] mx-auto" />
            <h3 className="text-base font-bold text-[#0E3E1E]">
              65+ Indian Mess Foods Database
            </h3>
            <p className="text-xs text-[#527056] max-w-md mx-auto">
              Inspect all lab-verified IFCT 2017 & USDA food profiles, serving sizes, and macro breakdowns.
            </p>
            <button
              onClick={() => setIsFoodLibraryOpen(true)}
              className="rounded-xl bg-[#0E3E1E] px-4 py-2 text-xs font-bold text-white hover:bg-[#15532A] transition-colors"
            >
              Open Database Explorer
            </button>
          </div>
        )}
      </main>

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        onSaveProfile={handleSaveProfile}
      />

      <FoodLibraryModal
        isOpen={isFoodLibraryOpen}
        onClose={() => setIsFoodLibraryOpen(false)}
      />
    </div>
  );
}
