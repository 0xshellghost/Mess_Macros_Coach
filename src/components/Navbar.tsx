import React from 'react';
import { Dumbbell, SlidersHorizontal, BookOpen, BarChart3, UtensilsCrossed } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenFoodLibrary: () => void;
  activeTab: 'menu' | 'tracker' | 'library';
  setActiveTab: (tab: 'menu' | 'tracker' | 'library') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  onOpenProfile,
  onOpenFoodLibrary,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D2E2CF] bg-[#EEF4EC]/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0E3E1E] text-white shadow-sm">
            <Dumbbell className="h-4 w-4 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-[#0E3E1E]">
                Mess Macro Coach
              </span>
              <span className="text-[#8FA892] text-xs hidden sm:inline" aria-hidden="true">·</span>
              <span className="text-xs text-[#527056] font-medium hidden sm:inline">
                Clean Nutrition
              </span>
            </div>
          </div>
        </div>

        {/* Center Tabs - Matcha segmented control */}
        <nav className="flex items-center gap-1 rounded-xl bg-[#DFECDD] p-1 border border-[#D0E2CE]">
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'menu'
                ? 'bg-white text-[#0E3E1E] shadow-sm'
                : 'text-[#4F6D54] hover:text-[#0E3E1E]'
            }`}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            <span>Daily Log</span>
          </button>

          <button
            onClick={() => setActiveTab('tracker')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'tracker'
                ? 'bg-white text-[#0E3E1E] shadow-sm'
                : 'text-[#4F6D54] hover:text-[#0E3E1E]'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            <span>3-Day Results</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('library');
              onOpenFoodLibrary();
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeTab === 'library'
                ? 'bg-white text-[#0E3E1E] shadow-sm'
                : 'text-[#4F6D54] hover:text-[#0E3E1E]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Food Database</span>
          </button>
        </nav>

        {/* User Target & Profile Trigger */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-xs text-[#527056]">
            <span className="text-[#0E3E1E] font-semibold">{profile.friendName}</span>
            <span aria-hidden="true">·</span>
            <span>{profile.weightKg} kg</span>
            <span aria-hidden="true">·</span>
            <span className="text-[#0E3E1E] font-bold">{profile.dailyProteinTarget}g target</span>
          </div>

          <button
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 rounded-xl border border-[#D2E2CF] bg-white px-3 py-1.5 text-xs font-semibold text-[#0E3E1E] hover:bg-[#F4F8F3] hover:border-[#BED4BB] transition-colors shadow-2xs"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#4F6D54]" />
            <span>Targets</span>
          </button>
        </div>
      </div>
    </header>
  );
};
