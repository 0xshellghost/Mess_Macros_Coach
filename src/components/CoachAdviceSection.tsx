import React, { useState } from 'react';
import { 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  Check, 
  RefreshCw
} from 'lucide-react';
import { CoachAdviceResult, MealType, UserProfile, DayPlan } from '../types';

interface CoachAdviceSectionProps {
  advice: CoachAdviceResult | null;
  isLoading: boolean;
  profile: UserProfile;
  dayPlan: DayPlan;
  onApplyAddonToPlan: (meal: MealType, addonName: string, protein: number, calories: number, costInr: number) => void;
  onRegenerateAdvice: () => void;
}

export const CoachAdviceSection: React.FC<CoachAdviceSectionProps> = ({
  advice,
  isLoading,
  profile,
  dayPlan,
  onApplyAddonToPlan,
  onRegenerateAdvice,
}) => {
  const [appliedAddons, setAppliedAddons] = useState<string[]>([]);

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-[#D2E2CF] bg-white p-8 text-center shadow-xs">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-[#DFECDD] text-[#0E3E1E] mb-3 animate-spin">
          <Sparkles className="h-5 w-5" />
        </div>
        <h3 className="text-sm font-bold text-[#0E3E1E]">Reviewing Mess Menu...</h3>
        <p className="text-xs text-[#527056] mt-1">
          Evaluating {dayPlan.totalNutrition.protein}g intake against {profile.dailyProteinTarget}g target to suggest cheap canteen add-ons.
        </p>
      </section>
    );
  }

  if (!advice) return null;

  const handleAddClick = (addon: { name: string; meal: MealType; proteinGrams: number; costInr: number }) => {
    onApplyAddonToPlan(
      addon.meal,
      addon.name,
      addon.proteinGrams,
      Math.round(addon.proteinGrams * 4 + 40),
      addon.costInr
    );
    setAppliedAddons((prev) => [...prev, `${addon.name}-${addon.meal}`]);
  };

  const totalExtraCost = advice.recommendedAddons.reduce((sum, item) => sum + item.costInr, 0);
  const totalExtraProtein = advice.recommendedAddons.reduce((sum, item) => sum + item.proteinGrams, 0);

  return (
    <section className="rounded-2xl border border-[#D2E2CF] bg-white p-6 shadow-xs space-y-6">
      {/* Coach Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-[#E8EFE6]">
        <div>
          <div className="text-[11px] font-bold text-[#35613A] uppercase tracking-wider mb-1">
            Coach Assessment
          </div>
          <h3 className="text-lg font-black text-[#0E3E1E]">
            {advice.headline}
          </h3>
          <p className="text-xs text-[#527056] mt-1 max-w-2xl leading-relaxed">
            {advice.summary}
          </p>
        </div>

        <button
          onClick={onRegenerateAdvice}
          className="flex items-center gap-1.5 self-start sm:self-auto rounded-xl border border-[#D2E2CF] bg-[#F7FAF6] px-3 py-1.5 text-xs font-semibold text-[#0E3E1E] hover:bg-[#EEF5EC] transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Recommended Canteen & Tuck-Shop Add-ons */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#0E3E1E]" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E3E1E]">
              Recommended Canteen & Tuck-Shop Add-Ons
            </h4>
          </div>
          <div className="text-xs text-[#527056] font-medium">
            Combined: <span className="text-[#0E3E1E] font-bold">+{totalExtraProtein}g protein</span> for <span className="text-[#0E3E1E] font-bold">~₹{totalExtraCost}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {advice.recommendedAddons.map((addon, idx) => {
            const isApplied = appliedAddons.includes(`${addon.name}-${addon.meal}`);

            return (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-xl border border-[#D2E2CF] bg-[#F8FAF7] p-4 transition-all hover:border-[#0E3E1E]"
              >
                <div>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-bold text-[#527056] uppercase tracking-wider text-[10px]">
                      {addon.meal}
                    </span>
                    <span className="font-extrabold text-[#0E3E1E]">
                      ₹{addon.costInr}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-[#0E3E1E] mt-1.5">
                    {addon.name}
                  </div>

                  <p className="text-[11px] text-[#527056] mt-1 leading-relaxed">
                    {addon.tip}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#E3EDE1] flex items-center justify-between">
                  <span className="text-xs font-black text-[#0E3E1E]">
                    +{addon.proteinGrams}g Protein
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddClick(addon)}
                    disabled={isApplied}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                      isApplied
                        ? 'bg-[#DFECDD] text-[#35613A] cursor-default'
                        : 'bg-[#0E3E1E] text-white hover:bg-[#16562B] shadow-2xs'
                    }`}
                  >
                    {isApplied ? (
                      <>
                        <Check className="h-3 w-3 stroke-[2.5]" />
                        <span>Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 stroke-[2.5]" />
                        <span>Add</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Practical Rules & Myth Buster */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
        <div className="lg:col-span-2 rounded-xl border border-[#D2E2CF] bg-[#F5F9F4] p-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#0E3E1E] mb-2">
            Hostel Nutrition Guidelines
          </div>
          <ul className="space-y-2">
            {advice.gymBroTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-2.5 text-xs text-[#3C5740] leading-relaxed">
                <span className="text-[#0E3E1E] font-bold text-[11px] mt-0.5">
                  0{i + 1}.
                </span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        {advice.mythBuster && (
          <div className="rounded-xl border border-[#F2C94C]/40 bg-[#FFFBEA] p-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8C6D1F] mb-1.5">
              Mess Myth Buster
            </div>
            <p className="text-xs text-[#6B500B] leading-relaxed italic">
              "{advice.mythBuster}"
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
