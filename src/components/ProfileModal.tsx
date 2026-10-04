import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { UserProfile, DietPreference } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSaveProfile: (newProfile: UserProfile) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile,
}) => {
  const [friendName, setFriendName] = useState(profile.friendName);
  const [weightKg, setWeightKg] = useState(profile.weightKg);
  const [dietPreference, setDietPreference] = useState<DietPreference>(profile.dietPreference);
  const [proteinMultiplier, setProteinMultiplier] = useState(profile.proteinTargetPerKg);
  const [collegeName, setCollegeName] = useState(profile.collegeName || 'Hostel Mess');

  if (!isOpen) return null;

  const calculatedDailyTarget = Math.round(weightKg * proteinMultiplier);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      friendName: friendName.trim() || 'Rohan',
      weightKg: Number(weightKg) || 70,
      dietPreference,
      proteinTargetPerKg: proteinMultiplier,
      dailyProteinTarget: calculatedDailyTarget,
      collegeName,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-md rounded-2xl border border-[#D2E2CF] bg-white shadow-2xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#E8EFE6] mb-5">
          <div>
            <h2 className="text-base font-bold text-[#0E3E1E]">Friend's Profile & Target</h2>
            <p className="text-xs text-[#527056] mt-0.5">Calibrates daily protein target and canteen filter</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-[#527056] hover:bg-[#EEF5EC] hover:text-[#0E3E1E]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Friend Name & College */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-[#0E3E1E] mb-1">
                Friend's Name
              </label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="Rohan"
                className="w-full rounded-xl border border-[#CCE0CB] bg-[#F8FAF7] px-3.5 py-2 text-[#0E3E1E] focus:outline-none focus:border-[#0E3E1E]"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-[#0E3E1E] mb-1">
                Hostel / Mess
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="Hostel Mess"
                className="w-full rounded-xl border border-[#CCE0CB] bg-[#F8FAF7] px-3.5 py-2 text-[#0E3E1E] focus:outline-none focus:border-[#0E3E1E]"
              />
            </div>
          </div>

          {/* Weight */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-[#0E3E1E]">
                Body Weight: <span className="text-[#0E3E1E] font-black">{weightKg} kg</span>
              </label>
              <span className="text-[11px] text-[#527056]">45 - 110 kg</span>
            </div>
            <input
              type="range"
              min="45"
              max="110"
              step="1"
              value={weightKg}
              onChange={(e) => setWeightKg(Number(e.target.value))}
              className="w-full accent-[#0E3E1E] h-1.5 bg-[#DFECDD] rounded-lg cursor-pointer"
            />
            <div className="flex gap-1.5 mt-2">
              {[58, 65, 72, 80, 88].map((w) => (
                <button
                  type="button"
                  key={w}
                  onClick={() => setWeightKg(w)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors ${
                    weightKg === w
                      ? 'border-[#0E3E1E] bg-[#E9F2E7] text-[#0E3E1E]'
                      : 'border-[#DAE7D8] bg-[#F7FAF6] text-[#527056] hover:text-[#0E3E1E]'
                  }`}
                >
                  {w}kg
                </button>
              ))}
            </div>
          </div>

          {/* Lifting Goal & Factor */}
          <div>
            <label className="block font-bold text-[#0E3E1E] mb-1.5">
              Protein Intake Goal
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { factor: 1.6, label: 'Maintenance', sub: '1.6g / kg' },
                { factor: 2.0, label: 'Hypertrophy', sub: '2.0g / kg' },
                { factor: 2.2, label: 'Hardgainer', sub: '2.2g / kg' },
              ].map((goal) => (
                <button
                  type="button"
                  key={goal.factor}
                  onClick={() => setProteinMultiplier(goal.factor)}
                  className={`rounded-xl p-2.5 text-left border transition-colors ${
                    proteinMultiplier === goal.factor
                      ? 'border-[#0E3E1E] bg-[#E9F2E7] text-[#0E3E1E] shadow-2xs'
                      : 'border-[#DAE7D8] bg-[#F7FAF6] text-[#527056] hover:border-[#BACFBA]'
                  }`}
                >
                  <div className="font-extrabold text-[#0E3E1E]">{goal.sub}</div>
                  <div className="text-[10px] text-[#527056] mt-0.5 font-medium">{goal.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Diet Preference */}
          <div>
            <label className="block font-bold text-[#0E3E1E] mb-1.5">
              Dietary Preference
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'veg', label: 'Vegetarian', sub: 'Dairy & Soya' },
                { id: 'eggetarian', label: 'Eggetarian', sub: 'Eggs + Veg' },
                { id: 'non_veg', label: 'Non-Vegetarian', sub: 'Chicken, Fish, All' },
                { id: 'lacto_veg', label: 'Strict Lacto-Veg', sub: 'No Eggs' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setDietPreference(opt.id as DietPreference)}
                  className={`rounded-xl p-2 text-left border transition-colors ${
                    dietPreference === opt.id
                      ? 'border-[#0E3E1E] bg-[#E9F2E7] text-[#0E3E1E]'
                      : 'border-[#DAE7D8] bg-[#F7FAF6] text-[#527056] hover:border-[#BACFBA]'
                  }`}
                >
                  <div className="font-bold text-[#0E3E1E]">{opt.label}</div>
                  <div className="text-[10px] text-[#527056]">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Result Card */}
          <div className="rounded-xl border border-[#D2E2CF] bg-[#F5F9F4] p-3.5 flex items-center justify-between">
            <div>
              <div className="text-[#527056] uppercase tracking-wider text-[10px] font-bold">
                Calculated Daily Goal
              </div>
              <div className="text-[#527056] text-xs">
                {weightKg}kg × {proteinMultiplier}g/kg
              </div>
            </div>
            <div className="text-2xl font-black text-[#0E3E1E] font-mono">
              {calculatedDailyTarget}g <span className="text-xs text-[#527056] font-sans font-normal">/ day</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-[#D2E2CF] bg-white py-2.5 text-xs font-semibold text-[#527056] hover:bg-[#EEF5EC]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-xl bg-[#0E3E1E] py-2.5 text-xs font-bold text-white hover:bg-[#15532A] flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Apply Target</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
