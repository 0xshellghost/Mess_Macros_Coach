import React, { useState } from 'react';
import { 
  Plus, 
  Minus, 
  Trash2, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { DayPlan, MealType, LoggedFoodItem, UserProfile, CanteenAddOn } from '../types';
import { calculateProteinAssessment, recalculateItemNutrition, matchFoodToDatabase, filterAddOnsForDiet } from '../data/nutritionEngine';
import { MESS_FOODS_DATABASE } from '../data/messFoods';

interface DayPlanViewProps {
  dayPlan: DayPlan;
  profile: UserProfile;
  onUpdateDayPlan: (updated: DayPlan) => void;
  onOpenAddonsDrawer: () => void;
}

export const DayPlanView: React.FC<DayPlanViewProps> = ({
  dayPlan,
  profile,
  onUpdateDayPlan,
}) => {
  const [quickAddMeal, setQuickAddMeal] = useState<MealType | null>(null);
  const [customFoodName, setCustomFoodName] = useState('');
  const [editingUnverifiedItem, setEditingUnverifiedItem] = useState<{ mealType: MealType; item: LoggedFoodItem } | null>(null);

  const assessment = calculateProteinAssessment(
    dayPlan.totalNutrition.protein,
    profile.dailyProteinTarget
  );

  const handlePortionChange = (mealType: MealType, itemId: string, delta: number) => {
    const meal = dayPlan.meals[mealType];
    const updatedItems = meal.items.map((item) => {
      if (item.id === itemId) {
        const newMultiplier = Math.max(0.5, Math.round((item.portionMultiplier + delta) * 10) / 10);
        return recalculateItemNutrition(item, newMultiplier);
      }
      return item;
    });

    recalculateAndPropagate(mealType, updatedItems);
  };

  const handleRemoveItem = (mealType: MealType, itemId: string) => {
    const meal = dayPlan.meals[mealType];
    const updatedItems = meal.items.filter((item) => item.id !== itemId);
    recalculateAndPropagate(mealType, updatedItems);
  };

  const handleAddFoodToMeal = (mealType: MealType, foodName: string) => {
    if (!foodName.trim()) return;
    const newItem = matchFoodToDatabase(foodName.trim());
    const meal = dayPlan.meals[mealType];
    const updatedItems = [...meal.items, newItem];
    recalculateAndPropagate(mealType, updatedItems);
    setCustomFoodName('');
    setQuickAddMeal(null);
  };

  const handleAddCanteenAddon = (mealType: MealType, addon: CanteenAddOn) => {
    const loggedAddon: LoggedFoodItem = {
      id: `canteen_${addon.id}_${Date.now()}`,
      foodId: addon.id,
      name: `${addon.name} (Canteen Hack)`,
      portionMultiplier: 1,
      servingDescription: addon.portion,
      isVerified: true,
      nutrition: {
        calories: addon.calories,
        protein: addon.protein,
        carbs: addon.carbs,
        fat: addon.fat,
      },
    };

    const meal = dayPlan.meals[mealType];
    const updatedItems = [...meal.items, loggedAddon];
    recalculateAndPropagate(mealType, updatedItems);
  };

  const handleResolveUnverified = (mealType: MealType, oldItem: LoggedFoodItem, chosenFoodId: string) => {
    const base = MESS_FOODS_DATABASE.find((f) => f.id === chosenFoodId);
    if (!base) return;

    const resolvedItem: LoggedFoodItem = {
      ...oldItem,
      foodId: base.id,
      name: base.name,
      isVerified: true,
      unverifiedNote: undefined,
      servingDescription: oldItem.portionMultiplier === 1 ? base.standardServing : `${oldItem.portionMultiplier} × ${base.standardServing}`,
      nutrition: {
        calories: Math.round(base.calories * oldItem.portionMultiplier),
        protein: Math.round(base.protein * oldItem.portionMultiplier * 10) / 10,
        carbs: Math.round(base.carbs * oldItem.portionMultiplier * 10) / 10,
        fat: Math.round(base.fat * oldItem.portionMultiplier * 10) / 10,
        fiber: base.fiber !== undefined ? Math.round(base.fiber * oldItem.portionMultiplier * 10) / 10 : undefined,
      },
    };

    const meal = dayPlan.meals[mealType];
    const updatedItems = meal.items.map((i) => (i.id === oldItem.id ? resolvedItem : i));
    recalculateAndPropagate(mealType, updatedItems);
    setEditingUnverifiedItem(null);
  };

  const recalculateAndPropagate = (changedMealType: MealType, newItems: LoggedFoodItem[]) => {
    const updatedMeals = { ...dayPlan.meals };

    const mealNutrition = newItems.reduce(
      (acc, curr) => ({
        calories: acc.calories + curr.nutrition.calories,
        protein: Math.round((acc.protein + curr.nutrition.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + curr.nutrition.carbs) * 10) / 10,
        fat: Math.round((acc.fat + curr.nutrition.fat) * 10) / 10,
        fiber: Math.round(((acc.fiber || 0) + (curr.nutrition.fiber || 0)) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    updatedMeals[changedMealType] = {
      ...updatedMeals[changedMealType],
      items: newItems,
      totalNutrition: mealNutrition,
    };

    const allItems: LoggedFoodItem[] = [];
    let unverifiedCount = 0;
    (['breakfast', 'lunch', 'snacks', 'dinner'] as MealType[]).forEach((m) => {
      updatedMeals[m].items.forEach((item) => {
        allItems.push(item);
        if (!item.isVerified) unverifiedCount++;
      });
    });

    const dayNutrition = allItems.reduce(
      (acc, curr) => ({
        calories: acc.calories + curr.nutrition.calories,
        protein: Math.round((acc.protein + curr.nutrition.protein) * 10) / 10,
        carbs: Math.round((acc.carbs + curr.nutrition.carbs) * 10) / 10,
        fat: Math.round((acc.fat + curr.nutrition.fat) * 10) / 10,
        fiber: Math.round(((acc.fiber || 0) + (curr.nutrition.fiber || 0)) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    onUpdateDayPlan({
      ...dayPlan,
      meals: updatedMeals,
      totalNutrition: dayNutrition,
      unverifiedCount,
    });
  };

  const dietAddons = filterAddOnsForDiet(profile.dietPreference);

  return (
    <div className="space-y-6">
      {/* Daily Macro Summary Card */}
      <section className="rounded-2xl border border-[#D2E2CF] bg-white p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-5 border-b border-[#E8EFE6]">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#527056] mb-1 font-medium">
              <span>{profile.friendName}</span>
              <span aria-hidden="true">·</span>
              <span>{dayPlan.dayName} Mess Roster</span>
              <span aria-hidden="true">·</span>
              <span className="text-[#0E3E1E] font-bold">Target: {profile.dailyProteinTarget}g</span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-black text-[#0E3E1E] tracking-tight">
                {dayPlan.totalNutrition.protein}g
              </span>
              <span className="text-sm text-[#527056] font-semibold">
                Protein ({assessment.percentage}% of daily goal)
              </span>
            </div>

            <div className="mt-2 text-xs">
              {assessment.deficit > 0 ? (
                <span className="font-semibold text-[#B71C1C] bg-[#FFEBEE] px-2.5 py-1 rounded-md">
                  -{assessment.deficit}g protein deficit to close today
                </span>
              ) : (
                <span className="font-semibold text-[#1B5E20] bg-[#E8F5E9] px-2.5 py-1 rounded-md">
                  Target reached for muscle protein synthesis
                </span>
              )}
            </div>
          </div>

          {/* Secondary Macro Numbers */}
          <div className="flex items-center gap-6 text-sm">
            <div>
              <div className="text-[11px] font-bold text-[#527056] uppercase tracking-wider">Calories</div>
              <div className="font-bold text-[#0E3E1E] mt-0.5">{dayPlan.totalNutrition.calories} kcal</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#527056] uppercase tracking-wider">Carbs</div>
              <div className="font-bold text-[#0E3E1E] mt-0.5">{dayPlan.totalNutrition.carbs}g</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#527056] uppercase tracking-wider">Fats</div>
              <div className="font-bold text-[#0E3E1E] mt-0.5">{dayPlan.totalNutrition.fat}g</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-[#527056] uppercase tracking-wider">Fiber</div>
              <div className="font-bold text-[#0E3E1E] mt-0.5">{dayPlan.totalNutrition.fiber || 0}g</div>
            </div>
          </div>
        </div>

        {/* Progress Line */}
        <div className="mt-4">
          <div className="h-2 w-full bg-[#E5EEE3] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                assessment.percentage >= 100
                  ? 'bg-[#1B5E20]'
                  : assessment.percentage >= 60
                  ? 'bg-[#0E3E1E]'
                  : 'bg-[#B71C1C]'
              }`}
              style={{ width: `${Math.min(100, assessment.percentage)}%` }}
            />
          </div>
        </div>
      </section>

      {/* Unverified Food Banner */}
      {dayPlan.unverifiedCount > 0 && (
        <div className="rounded-xl border border-[#F2C94C] bg-[#FFFBEA] px-4 py-3 flex items-start gap-3 text-xs text-[#7A5B04]">
          <AlertTriangle className="h-4 w-4 text-[#F2994A] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[#7A5B04]">
              {dayPlan.unverifiedCount} unverified dish in IFCT/USDA tables:
            </span>{' '}
            To guarantee zero artificial nutrition hallucination, unverified items are given 0g protein until mapped. Use the "Resolve" button on flagged items to link to a verified food.
          </div>
        </div>
      )}

      {/* Meals Breakdown */}
      <div className="space-y-4">
        {((): MealType[] => {
          const list: MealType[] = ['breakfast', 'lunch'];
          if ((dayPlan.meals.snacks && dayPlan.meals.snacks.items.length > 0) || quickAddMeal === 'snacks') {
            list.push('snacks');
          }
          list.push('dinner');
          return list;
        })().map((mealType) => {
          const meal = dayPlan.meals[mealType];
          const isAdding = quickAddMeal === mealType;

          return (
            <div
              key={mealType}
              className="rounded-2xl border border-[#D2E2CF] bg-white p-5 shadow-xs"
            >
              {/* Meal Header Row */}
              <div className="flex items-center justify-between pb-3 border-b border-[#E8EFE6] mb-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#DFECDD] text-[#0E3E1E] font-bold text-xs">
                    {mealType === 'breakfast' && 'B'}
                    {mealType === 'lunch' && 'L'}
                    {mealType === 'snacks' && 'S'}
                    {mealType === 'dinner' && 'D'}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-[#0E3E1E] capitalize">{meal.title}</h3>
                    <span className="text-xs text-[#527056] font-medium">
                      {meal.totalNutrition.protein}g protein · {meal.totalNutrition.calories} kcal
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setQuickAddMeal(isAdding ? null : mealType)}
                  className="flex items-center gap-1 rounded-lg border border-[#D2E2CF] bg-[#F7FAF6] px-2.5 py-1 text-xs font-semibold text-[#0E3E1E] hover:bg-[#EEF5EC] hover:border-[#BACFBA] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              {/* Add Custom / Addon Drawer */}
              {isAdding && (
                <div className="rounded-xl border border-[#D2E2CF] bg-[#F7FAF6] p-3.5 mb-3 space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={customFoodName}
                      onChange={(e) => setCustomFoodName(e.target.value)}
                      placeholder="e.g. 2 Boiled Eggs, 4 Roti, 1 katori Rajma"
                      className="flex-1 rounded-lg border border-[#CCE0CB] bg-white px-3 py-1.5 text-xs text-[#0E3E1E] placeholder-[#8BA48E] focus:outline-none focus:border-[#0E3E1E]"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddFoodToMeal(mealType, customFoodName);
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => handleAddFoodToMeal(mealType, customFoodName)}
                      className="rounded-lg bg-[#0E3E1E] px-3.5 py-1.5 text-xs font-bold text-white hover:bg-[#15532A]"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickAddMeal(null)}
                      className="rounded-lg bg-white border border-[#D2E2CF] px-2.5 py-1.5 text-xs font-medium text-[#527056] hover:bg-[#EEF5EC]"
                    >
                      Cancel
                    </button>
                  </div>

                  {/* Fast Canteen Addons */}
                  <div className="pt-2 border-t border-[#DFECDD]">
                    <span className="text-[10px] font-bold text-[#527056] uppercase tracking-wider block mb-1.5">
                      Quick Canteen Add-ons
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {dietAddons.slice(0, 4).map((addon) => (
                        <button
                          key={addon.id}
                          type="button"
                          onClick={() => handleAddCanteenAddon(mealType, addon)}
                          className="flex items-center gap-1.5 rounded-lg border border-[#D2E2CF] bg-white px-2 py-1 text-xs text-[#0E3E1E] hover:border-[#0E3E1E] hover:bg-[#EEF5EC] transition-colors"
                        >
                          <ShoppingBag className="h-3 w-3 text-[#35613A]" />
                          <span className="font-medium">{addon.name}</span>
                          <span className="text-[#0E3E1E] font-bold">+{addon.protein}g</span>
                          <span className="text-[#608064]">₹{addon.costInr}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Items Table / Row List */}
              {meal.items.length === 0 ? (
                <div className="text-center py-4 text-xs text-[#7A987E]">
                  No food logged for this meal. Click "+ Add Item" above.
                </div>
              ) : (
                <div className="divide-y divide-[#EDF3EC]">
                  {meal.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-2.5"
                    >
                      {/* Left: Food name & status */}
                      <div className="flex items-center gap-2.5">
                        <div title={item.isVerified ? "Verified against IFCT/USDA" : "Unverified food"}>
                          {item.isVerified ? (
                            <ShieldCheck className="h-4 w-4 text-[#2E7D32]" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 text-[#F2994A]" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#0E3E1E]">
                              {item.name}
                            </span>
                            {!item.isVerified && (
                              <button
                                onClick={() => setEditingUnverifiedItem({ mealType, item })}
                                className="text-[11px] font-bold text-[#F2994A] hover:underline flex items-center gap-0.5"
                              >
                                <span>Resolve Match</span>
                                <ChevronRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                          <div className="text-[11px] text-[#527056]">
                            {item.servingDescription}
                          </div>
                        </div>
                      </div>

                      {/* Right: Portions & Macros */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 self-end sm:self-auto w-full sm:w-auto">
                        {/* Portions */}
                        <div className="flex items-center rounded-lg border border-[#D2E2CF] bg-[#F7FAF6] px-1 py-0.5 text-xs">
                          <button
                            onClick={() => handlePortionChange(mealType, item.id, -0.5)}
                            disabled={item.portionMultiplier <= 0.5}
                            className="p-1 text-[#527056] hover:text-[#0E3E1E] disabled:opacity-30"
                          >
                            <Minus className="h-3 w-3 stroke-[2.5]" />
                          </button>
                          <span className="px-2 font-mono font-bold text-[#0E3E1E]">
                            {item.portionMultiplier}x
                          </span>
                          <button
                            onClick={() => handlePortionChange(mealType, item.id, 0.5)}
                            className="p-1 text-[#527056] hover:text-[#0E3E1E]"
                          >
                            <Plus className="h-3 w-3 stroke-[2.5]" />
                          </button>
                        </div>

                        {/* Macros */}
                        <div className="text-right min-w-[70px]">
                          <span className="text-xs font-black text-[#0E3E1E]">
                            {item.nutrition.protein}g P
                          </span>
                          <div className="text-[10px] text-[#527056]">
                            {item.nutrition.calories} kcal
                          </div>
                        </div>

                        {/* Delete */}
                        <button
                          onClick={() => handleRemoveItem(mealType, item.id)}
                          className="p-1 text-[#8FA892] hover:text-[#B71C1C] transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {(!dayPlan.meals.snacks || dayPlan.meals.snacks.items.length === 0) && quickAddMeal !== 'snacks' && (
          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => setQuickAddMeal('snacks')}
              className="flex items-center gap-1.5 rounded-xl border border-dashed border-[#BCD4B9] bg-[#F7FAF6] px-4 py-2 text-xs font-semibold text-[#527056] hover:text-[#0E3E1E] hover:border-[#0E3E1E] hover:bg-[#EEF5EC] transition-all"
            >
              <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>+ Add Evening Snacks / Canteen Order (Optional)</span>
            </button>
          </div>
        )}
      </div>

      {/* Resolve Unverified Modal */}
      {editingUnverifiedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-[#D2E2CF] bg-white p-6 shadow-2xl">
            <h3 className="text-sm font-bold text-[#0E3E1E] mb-1">
              Select Verified Match for: "{editingUnverifiedItem.item.name}"
            </h3>
            <p className="text-xs text-[#527056] mb-4">
              Select the closest Indian mess food item from the verified database:
            </p>

            <div className="max-h-60 overflow-y-auto space-y-1.5 mb-4 pr-1">
              {MESS_FOODS_DATABASE.map((food) => (
                <button
                  key={food.id}
                  onClick={() =>
                    handleResolveUnverified(
                      editingUnverifiedItem.mealType,
                      editingUnverifiedItem.item,
                      food.id
                    )
                  }
                  className="w-full rounded-xl border border-[#D8E6D5] bg-[#F7FAF6] p-2.5 text-left hover:border-[#0E3E1E] hover:bg-[#EEF5EC] transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-[#0E3E1E]">{food.name}</div>
                    <div className="text-[11px] text-[#527056]">{food.standardServing}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#0E3E1E]">{food.protein}g P</span>
                    <span className="text-[10px] text-[#527056] block">{food.calories} kcal</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              onClick={() => setEditingUnverifiedItem(null)}
              className="w-full rounded-xl bg-[#DFECDD] py-2 text-xs font-bold text-[#0E3E1E] hover:bg-[#CCE0CB]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
