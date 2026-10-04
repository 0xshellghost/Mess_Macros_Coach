import React, { useState } from 'react';
import { 
  BarChart3, 
  Share2, 
  Check
} from 'lucide-react';
import { UserProfile, BeforeAfterExperiment, DayProteinLog } from '../types';

interface ThreeDayTrackerProps {
  profile: UserProfile;
  experiment: BeforeAfterExperiment;
  onUpdateExperiment: (exp: BeforeAfterExperiment) => void;
}

export const ThreeDayTracker: React.FC<ThreeDayTrackerProps> = ({ 
  profile,
  experiment,
  onUpdateExperiment,
}) => {
  const [activeTab, setActiveTab] = useState<'comparison' | 'log_inputs'>('comparison');
  const [copied, setCopied] = useState(false);

  const beforeAvgProtein = Math.round(
    experiment.beforeDays.reduce((acc, d) => acc + d.proteinGrams, 0) / 3
  );
  const afterAvgProtein = Math.round(
    experiment.afterDays.reduce((acc, d) => acc + d.proteinGrams, 0) / 3
  );

  const proteinGain = afterAvgProtein - beforeAvgProtein;
  const percentageIncrease = Math.round((proteinGain / (beforeAvgProtein || 1)) * 100);

  const beforeTargetHit = Math.round((beforeAvgProtein / experiment.targetProtein) * 100);
  const afterTargetHit = Math.round((afterAvgProtein / experiment.targetProtein) * 100);

  const avgDailyAddonCost = Math.round(
    experiment.afterDays.reduce((acc, d) => acc + (d.addonCostInr || 0), 0) / 3
  );

  const costPerExtraGram = Math.round((avgDailyAddonCost / (proteinGain || 1)) * 100) / 100;

  const handleUpdateBeforeDay = (index: number, grams: number, notes: string) => {
    const updated = [...experiment.beforeDays] as [DayProteinLog, DayProteinLog, DayProteinLog];
    updated[index] = { ...updated[index], proteinGrams: grams, notes };
    onUpdateExperiment({ ...experiment, beforeDays: updated });
  };

  const handleUpdateAfterDay = (index: number, grams: number, cost: number, notes: string) => {
    const updated = [...experiment.afterDays] as [DayProteinLog, DayProteinLog, DayProteinLog];
    updated[index] = { ...updated[index], proteinGrams: grams, addonCostInr: cost, notes };
    onUpdateExperiment({ ...experiment, afterDays: updated });
  };

  const handleCopyReport = () => {
    const textReport = `MESS MACRO COACH: 3-DAY IMPACT REPORT
Lifter: ${experiment.friendName} (${profile.weightKg}kg)
Daily Protein Target: ${experiment.targetProtein}g

BEFORE COACH (Baseline Mess Food):
• Day 1: ${experiment.beforeDays[0].proteinGrams}g
• Day 2: ${experiment.beforeDays[1].proteinGrams}g
• Day 3: ${experiment.beforeDays[2].proteinGrams}g
3-Day Baseline Average: ${beforeAvgProtein}g/day (${beforeTargetHit}% of target)

AFTER COACH (With Canteen Hacks):
• Day 1: ${experiment.afterDays[0].proteinGrams}g (+${experiment.afterDays[0].proteinGrams - experiment.beforeDays[0].proteinGrams}g)
• Day 2: ${experiment.afterDays[1].proteinGrams}g (+${experiment.afterDays[1].proteinGrams - experiment.beforeDays[1].proteinGrams}g)
• Day 3: ${experiment.afterDays[2].proteinGrams}g (+${experiment.afterDays[2].proteinGrams - experiment.beforeDays[2].proteinGrams}g)
3-Day Optimized Average: ${afterAvgProtein}g/day (${afterTargetHit}% of target)

MEASURABLE OUTCOMES:
Protein Increase: +${proteinGain}g/day (+${percentageIncrease}%)
Avg Daily Canteen Spend: ~₹${avgDailyAddonCost}/day (₹${costPerExtraGram}/extra g)
Verdict: Deficit resolved with budget college canteen add-ons.`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(textReport).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="rounded-2xl border border-[#D2E2CF] bg-white p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E8EFE6]">
        <div>
          <h2 className="text-base font-bold text-[#0E3E1E]">
            3-Day Before vs. After Impact Tracker
          </h2>
          <p className="text-xs text-[#527056] mt-0.5">
            Measurable reporting: Log 3 days of baseline mess food, then log 3 days with canteen hacks applied.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex rounded-xl bg-[#DFECDD] p-1 border border-[#D0E2CE]">
            <button
              onClick={() => setActiveTab('comparison')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'comparison'
                  ? 'bg-white text-[#0E3E1E] shadow-xs'
                  : 'text-[#4F6D54] hover:text-[#0E3E1E]'
              }`}
            >
              Report Card
            </button>
            <button
              onClick={() => setActiveTab('log_inputs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'log_inputs'
                  ? 'bg-white text-[#0E3E1E] shadow-xs'
                  : 'text-[#4F6D54] hover:text-[#0E3E1E]'
              }`}
            >
              Edit Logs
            </button>
          </div>

          <button
            onClick={handleCopyReport}
            className="flex items-center gap-1.5 rounded-xl border border-[#D2E2CF] bg-[#F7FAF6] px-3 py-1.5 text-xs font-semibold text-[#0E3E1E] hover:bg-[#EEF5EC] transition-colors"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#2E7D32]" />
                <span className="text-[#2E7D32]">Copied</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Export Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'comparison' ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-xl border border-[#D2E2CF] bg-[#F8FAF7] p-4">
              <div className="text-[11px] font-bold text-[#527056] uppercase tracking-wider">
                Daily Protein Increase
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#0E3E1E]">+{proteinGain}g</span>
                <span className="text-xs font-bold text-[#2E7D32]">+{percentageIncrease}%</span>
              </div>
              <p className="text-xs text-[#527056] mt-1 font-medium">
                {beforeAvgProtein}g &rarr; {afterAvgProtein}g daily average
              </p>
            </div>

            <div className="rounded-xl border border-[#D2E2CF] bg-[#F8FAF7] p-4">
              <div className="text-[11px] font-bold text-[#527056] uppercase tracking-wider">
                Target Hit Rate
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-[#0E3E1E]">{afterTargetHit}%</span>
                <span className="text-xs text-[#7A987E] line-through">{beforeTargetHit}%</span>
              </div>
              <p className="text-xs text-[#527056] mt-1 font-medium">
                Goal: {experiment.targetProtein}g / day
              </p>
            </div>

            <div className="rounded-xl border border-[#D2E2CF] bg-[#F8FAF7] p-4">
              <div className="text-[11px] font-bold text-[#527056] uppercase tracking-wider">
                Avg Canteen Spend
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-black text-[#0E3E1E]">₹{avgDailyAddonCost}</span>
                <span className="text-xs text-[#527056] font-medium">/ day</span>
              </div>
              <p className="text-xs text-[#527056] mt-1 font-medium">
                ₹{costPerExtraGram} per extra gram of protein
              </p>
            </div>

            <div className="rounded-xl border border-[#D2E2CF] bg-[#F8FAF7] p-4">
              <div className="text-[11px] font-bold text-[#527056] uppercase tracking-wider">
                Anabolic Status
              </div>
              <div className="mt-2 text-sm font-bold text-[#2E7D32]">
                Optimal Hypertrophy
              </div>
              <p className="text-xs text-[#527056] mt-1 font-medium">
                Before: Catabolic Deficit
              </p>
            </div>
          </div>

          {/* Clean Day-by-Day Visual Bars */}
          <div className="rounded-xl border border-[#D2E2CF] bg-[#F8FAF7] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E3E1E]">
                Day-by-Day Intake (g Protein)
              </h3>
              <div className="flex items-center gap-4 text-xs">
                <span className="text-[#7A987E] font-medium">Before Coach</span>
                <span className="text-[#0E3E1E] font-bold">After Coach</span>
              </div>
            </div>

            <div className="space-y-4 divide-y divide-[#E3EDE1]">
              {[0, 1, 2].map((idx) => {
                const before = experiment.beforeDays[idx];
                const after = experiment.afterDays[idx];
                const diff = after.proteinGrams - before.proteinGrams;

                const beforeWidth = Math.min(100, Math.round((before.proteinGrams / experiment.targetProtein) * 100));
                const afterWidth = Math.min(100, Math.round((after.proteinGrams / experiment.targetProtein) * 100));

                return (
                  <div key={idx} className="pt-3 first:pt-0">
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="font-bold text-[#0E3E1E]">Day 0{idx + 1}</span>
                      <span className="text-xs text-[#2E7D32] font-bold">
                        +{diff}g gained (₹{after.addonCostInr} spend)
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-14 text-[#7A987E] text-[11px] font-medium">Before</span>
                        <div className="flex-1 h-2.5 bg-[#E5EEE3] rounded-full overflow-hidden">
                          <div className="h-full bg-[#A3B8A5] rounded-full" style={{ width: `${beforeWidth}%` }} />
                        </div>
                        <span className="w-10 text-right text-[#527056] font-mono text-xs">{before.proteinGrams}g</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="w-14 text-[#0E3E1E] text-[11px] font-bold">After</span>
                        <div className="flex-1 h-2.5 bg-[#E5EEE3] rounded-full overflow-hidden">
                          <div className="h-full bg-[#0E3E1E] rounded-full" style={{ width: `${afterWidth}%` }} />
                        </div>
                        <span className="w-10 text-right text-[#0E3E1E] font-mono text-xs font-bold">{after.proteinGrams}g</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Data Table */}
          <div className="overflow-x-auto rounded-xl border border-[#D2E2CF]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#DFECDD] text-[#0E3E1E] border-b border-[#D0E2CE]">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Day</th>
                  <th className="py-2.5 px-4 font-bold">Baseline Mess Diet</th>
                  <th className="py-2.5 px-4 font-bold">Baseline</th>
                  <th className="py-2.5 px-4 font-bold">Optimized With Hacks</th>
                  <th className="py-2.5 px-4 font-bold">Optimized</th>
                  <th className="py-2.5 px-4 font-bold">Cost</th>
                  <th className="py-2.5 px-4 font-bold">Net Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E3EDE1] bg-white text-[#3C5740]">
                {experiment.beforeDays.map((before, i) => {
                  const after = experiment.afterDays[i];
                  return (
                    <tr key={i} className="hover:bg-[#F4F8F3]">
                      <td className="py-2.5 px-4 font-bold text-[#0E3E1E]">Day {i + 1}</td>
                      <td className="py-2.5 px-4 text-[#527056] max-w-[160px] truncate">{before.notes}</td>
                      <td className="py-2.5 px-4 text-[#527056] font-mono">{before.proteinGrams}g</td>
                      <td className="py-2.5 px-4 text-[#0E3E1E] font-medium max-w-[200px] truncate">{after.notes}</td>
                      <td className="py-2.5 px-4 font-bold text-[#0E3E1E] font-mono">{after.proteinGrams}g</td>
                      <td className="py-2.5 px-4 text-[#527056]">₹{after.addonCostInr}</td>
                      <td className="py-2.5 px-4 text-[#2E7D32] font-bold">
                        +{after.proteinGrams - before.proteinGrams}g
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Edit Logs Tab */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-[#D2E2CF] bg-[#F8FAF7] p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#527056]">
                Before Coach (Baseline Mess Intake)
              </h4>
              {experiment.beforeDays.map((day, idx) => (
                <div key={idx} className="space-y-1 pt-2 border-t border-[#E3EDE1]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0E3E1E]">Day {day.dayNumber}</span>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={day.proteinGrams}
                        onChange={(e) =>
                          handleUpdateBeforeDay(idx, Number(e.target.value), day.notes || '')
                        }
                        className="w-14 rounded-lg border border-[#CCE0CB] bg-white px-2 py-1 text-xs text-[#0E3E1E] text-right font-mono focus:outline-none"
                      />
                      <span className="text-[#527056]">g</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={day.notes || ''}
                    onChange={(e) =>
                      handleUpdateBeforeDay(idx, day.proteinGrams, e.target.value)
                    }
                    placeholder="Foods consumed"
                    className="w-full rounded-lg border border-[#CCE0CB] bg-white px-2.5 py-1 text-xs text-[#0E3E1E] placeholder-[#8BA48E] focus:outline-none"
                  />
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#D2E2CF] bg-[#F8FAF7] p-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0E3E1E]">
                After Coach (With Canteen Add-ons)
              </h4>
              {experiment.afterDays.map((day, idx) => (
                <div key={idx} className="space-y-1 pt-2 border-t border-[#E3EDE1]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#0E3E1E]">Day {day.dayNumber}</span>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[#527056] text-[11px]">Cost: ₹</span>
                        <input
                          type="number"
                          value={day.addonCostInr || 0}
                          onChange={(e) =>
                            handleUpdateAfterDay(
                              idx,
                              day.proteinGrams,
                              Number(e.target.value),
                              day.notes || ''
                            )
                          }
                          className="w-12 rounded-lg border border-[#CCE0CB] bg-white px-1.5 py-1 text-xs text-[#0E3E1E] text-right font-mono focus:outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={day.proteinGrams}
                          onChange={(e) =>
                            handleUpdateAfterDay(
                              idx,
                              Number(e.target.value),
                              day.addonCostInr || 0,
                              day.notes || ''
                            )
                          }
                          className="w-14 rounded-lg border border-[#CCE0CB] bg-white px-2 py-1 text-xs text-[#0E3E1E] font-bold text-right font-mono focus:outline-none"
                        />
                        <span className="text-[#527056]">g</span>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={day.notes || ''}
                    onChange={(e) =>
                      handleUpdateAfterDay(
                        idx,
                        day.proteinGrams,
                        day.addonCostInr || 0,
                        e.target.value
                      )
                    }
                    placeholder="Add-ons added"
                    className="w-full rounded-lg border border-[#CCE0CB] bg-white px-2.5 py-1 text-xs text-[#0E3E1E] placeholder-[#8BA48E] focus:outline-none"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={() => setActiveTab('comparison')}
              className="rounded-xl bg-[#0E3E1E] px-4 py-2 text-xs font-bold text-white hover:bg-[#15532A]"
            >
              Done & View Comparison
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
