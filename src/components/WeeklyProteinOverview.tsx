import React from 'react';
import { Calendar, TrendingDown, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DayPlan, UserProfile } from '../types';

interface WeeklyProteinOverviewProps {
  plans: DayPlan[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
  profile: UserProfile;
  onLoadIntoTracker?: (days: DayPlan[]) => void;
}

export const WeeklyProteinOverview: React.FC<WeeklyProteinOverviewProps> = ({
  plans,
  activeDayIndex,
  onSelectDay,
  profile,
  onLoadIntoTracker,
}) => {
  if (plans.length <= 1) return null;

  const totalProteinSum = plans.reduce((sum, p) => sum + p.totalNutrition.protein, 0);
  const avgProtein = Math.round((totalProteinSum / plans.length) * 10) / 10;
  const avgDeficit = Math.max(0, Math.round((profile.dailyProteinTarget - avgProtein) * 10) / 10);
  const avgTargetHit = Math.round((avgProtein / profile.dailyProteinTarget) * 100);

  // Find lowest and highest protein days
  let lowestDay = plans[0];
  let highestDay = plans[0];
  plans.forEach((p) => {
    if (p.totalNutrition.protein < lowestDay.totalNutrition.protein) lowestDay = p;
    if (p.totalNutrition.protein > highestDay.totalNutrition.protein) highestDay = p;
  });

  return (
    <section className="rounded-2xl border border-[#D2E2CF] bg-white p-6 shadow-xs space-y-5">
      {/* Header with Weekly Average */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E8EFE6]">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#DFECDD] text-[#0E3E1E]">
              <Calendar className="h-3.5 w-3.5 stroke-[2.5]" />
            </span>
            <h2 className="text-base font-bold text-[#0E3E1E]">
              Weekly Mess Protein Breakdown ({plans.length} Days Detected)
            </h2>
          </div>
          <p className="text-xs text-[#527056] mt-1 font-medium">
            Daily protein intake calculated from your hostel menu. Click any day to inspect meal details.
          </p>
        </div>

        {/* Weekly Metric Summary */}
        <div className="flex items-center gap-4 bg-[#F5F9F4] border border-[#D2E2CF] rounded-xl px-4 py-2 self-start lg:self-auto text-xs">
          <div>
            <span className="text-[10px] font-bold text-[#527056] uppercase tracking-wider block">
              7-Day Average
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-[#0E3E1E]">{avgProtein}g</span>
              <span className="text-[#527056]">/ day</span>
            </div>
          </div>

          <div className="h-6 w-px bg-[#D2E2CF]" />

          <div>
            <span className="text-[10px] font-bold text-[#527056] uppercase tracking-wider block">
              Avg Deficit
            </span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black text-[#B71C1C]">-{avgDeficit}g</span>
              <span className="text-xs text-[#7A987E]">({avgTargetHit}%)</span>
            </div>
          </div>

          {onLoadIntoTracker && plans.length >= 3 && (
            <>
              <div className="h-6 w-px bg-[#D2E2CF]" />
              <button
                type="button"
                onClick={() => onLoadIntoTracker(plans.slice(0, 3))}
                className="flex items-center gap-1.5 rounded-lg bg-[#0E3E1E] px-3 py-1.5 text-xs font-bold text-white hover:bg-[#15532A] transition-colors"
                title="Send the first 3 days to the before/after results tracker"
              >
                <span>Use for 3-Day Tracker</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Grid of Days with Daily Protein Intake */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
        {plans.map((plan, idx) => {
          const protein = Math.round(plan.totalNutrition.protein * 10) / 10;
          const target = profile.dailyProteinTarget;
          const percentage = Math.round((protein / target) * 100);
          const deficit = Math.max(0, Math.round((target - protein) * 10) / 10);
          const isSelected = activeDayIndex === idx;

          return (
            <button
              type="button"
              key={idx}
              onClick={() => onSelectDay(idx)}
              className={`rounded-xl p-3 text-left border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-[#0E3E1E] bg-[#E9F2E7] ring-1 ring-[#0E3E1E] shadow-xs'
                  : 'border-[#D2E2CF] bg-[#F8FAF7] hover:border-[#BED4BB] hover:bg-[#EEF5EC]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#0E3E1E]">
                    {plan.dayName.slice(0, 3).toUpperCase()}
                  </span>
                  {isSelected && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-[#0E3E1E]" />
                  )}
                </div>

                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-black text-[#0E3E1E] font-mono">
                    {protein}g
                  </span>
                  <span className="text-[10px] text-[#527056] font-bold">
                    P
                  </span>
                </div>

                <div className="text-[10px] font-medium text-[#7A987E] mt-0.5">
                  {percentage}% of goal
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-[#DFECDD] space-y-1.5">
                <div className="h-1.5 w-full bg-[#DFECDD] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      percentage >= 70 ? 'bg-[#1B5E20]' : percentage >= 40 ? 'bg-[#0E3E1E]' : 'bg-[#B71C1C]'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>

                <div className="text-[10px] font-bold text-[#B71C1C]">
                  -{deficit}g gap
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Insight Footnote */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#527056] pt-1">
        <div className="flex items-center gap-1.5">
          <TrendingDown className="h-3.5 w-3.5 text-[#B71C1C]" />
          <span>
            Lowest Day: <strong className="text-[#0E3E1E]">{lowestDay.dayName} ({lowestDay.totalNutrition.protein}g)</strong> · Highest Day: <strong className="text-[#0E3E1E]">{highestDay.dayName} ({highestDay.totalNutrition.protein}g)</strong>
          </span>
        </div>
        <span className="text-[11px] text-[#7A987E]">
          Active view: <strong>{plans[activeDayIndex]?.dayName}</strong>
        </span>
      </div>
    </section>
  );
};
