import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { MESS_FOODS_DATABASE, CANTEEN_ADDONS } from '../data/messFoods';

interface FoodLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoodLibraryModal: React.FC<FoodLibraryModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [viewType, setViewType] = useState<'mess_foods' | 'canteen_addons'>('mess_foods');

  if (!isOpen) return null;

  const categories = [
    { id: 'all', label: 'All Items' },
    { id: 'dal', label: 'Dals & Curries' },
    { id: 'paneer_dairy', label: 'Paneer & Dairy' },
    { id: 'egg_nonveg', label: 'Eggs & Non-Veg' },
    { id: 'bread_grain', label: 'Roti & Rice' },
    { id: 'breakfast', label: 'Breakfast' },
    { id: 'sabzi', label: 'Sabzis' },
    { id: 'snack_sweet', label: 'Snacks' },
  ];

  const filteredFoods = MESS_FOODS_DATABASE.filter((food) => {
    const matchesCategory = activeCategory === 'all' || food.category === activeCategory;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      food.name.toLowerCase().includes(term) ||
      (food.hindiName && food.hindiName.toLowerCase().includes(term)) ||
      food.aliases.some((a) => a.toLowerCase().includes(term));
    return matchesCategory && matchesSearch;
  });

  const filteredAddons = CANTEEN_ADDONS.filter((addon) => {
    const term = searchTerm.toLowerCase().trim();
    return !term || addon.name.toLowerCase().includes(term) || addon.description.toLowerCase().includes(term);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative flex flex-col h-[85vh] w-full max-w-4xl rounded-2xl border border-[#D2E2CF] bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E8EFE6] px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#0E3E1E]">
                65+ Verified Indian Mess Foods Database
              </h2>
              <span className="text-[#8FA892] text-xs" aria-hidden="true">·</span>
              <span className="text-xs text-[#527056] font-medium">
                IFCT 2017 & USDA FoodData
              </span>
            </div>
            <p className="text-xs text-[#527056] mt-0.5">
              Standard laboratory values calibrated for Indian hostel cooking and water dilutions.
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#527056] hover:bg-[#EEF5EC] hover:text-[#0E3E1E]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="p-4 border-b border-[#E8EFE6] bg-[#F7FAF6] space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex rounded-xl bg-[#DFECDD] p-1 border border-[#D0E2CE] self-start sm:self-auto">
              <button
                onClick={() => setViewType('mess_foods')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewType === 'mess_foods'
                    ? 'bg-white text-[#0E3E1E] shadow-xs'
                    : 'text-[#4F6D54] hover:text-[#0E3E1E]'
                }`}
              >
                Hostel Foods ({MESS_FOODS_DATABASE.length})
              </button>
              <button
                onClick={() => setViewType('canteen_addons')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  viewType === 'canteen_addons'
                    ? 'bg-white text-[#0E3E1E] shadow-xs'
                    : 'text-[#4F6D54] hover:text-[#0E3E1E]'
                }`}
              >
                Canteen Hacks ({CANTEEN_ADDONS.length})
              </button>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#7A987E]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search food or dish..."
                className="w-full rounded-xl border border-[#CCE0CB] bg-white pl-8 pr-3 py-1.5 text-xs text-[#0E3E1E] placeholder-[#8BA48E] focus:outline-none focus:border-[#0E3E1E]"
              />
            </div>
          </div>

          {viewType === 'mess_foods' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap border ${
                    activeCategory === cat.id
                      ? 'border-[#0E3E1E] bg-[#E9F2E7] text-[#0E3E1E]'
                      : 'border-transparent text-[#527056] hover:text-[#0E3E1E] hover:bg-[#EEF5EC]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content Table / Cards */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-[#FCFDFC]">
          {viewType === 'mess_foods' ? (
            filteredFoods.length === 0 ? (
              <div className="text-center py-12 text-[#7A987E] text-xs">
                No verified mess foods match "{searchTerm}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    className="rounded-xl border border-[#D2E2CF] bg-white p-4 flex flex-col justify-between shadow-2xs hover:border-[#0E3E1E] transition-colors"
                  >
                    <div>
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-xs font-bold text-[#0E3E1E]">
                          {food.name}
                        </div>
                        <span className="text-[10px] text-[#527056] font-medium">
                          {food.source.split(' ')[0]}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#527056] mt-0.5">
                        Serving: {food.standardServing}
                      </div>

                      {food.notes && (
                        <p className="text-[11px] text-[#527056] mt-2 leading-relaxed bg-[#F7FAF6] rounded-lg p-2 border border-[#E3EDE1]">
                          {food.notes}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-[#E8EFE6] grid grid-cols-4 gap-1 text-center text-xs">
                      <div>
                        <span className="text-[9px] text-[#527056] block font-bold">PROTEIN</span>
                        <span className="font-extrabold text-[#0E3E1E] font-mono">{food.protein}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#527056] block font-bold">CALORIES</span>
                        <span className="font-mono text-[#0E3E1E]">{food.calories}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#527056] block font-bold">CARBS</span>
                        <span className="font-mono text-[#527056]">{food.carbs}g</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#527056] block font-bold">FAT</span>
                        <span className="font-mono text-[#527056]">{food.fat}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredAddons.map((addon) => (
                <div
                  key={addon.id}
                  className="rounded-xl border border-[#D2E2CF] bg-white p-4 flex flex-col justify-between shadow-2xs hover:border-[#0E3E1E] transition-colors"
                >
                  <div>
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="text-xs font-bold text-[#0E3E1E]">
                        {addon.name}
                      </div>
                      <span className="text-xs font-extrabold text-[#0E3E1E]">
                        ₹{addon.costInr}
                      </span>
                    </div>

                    <div className="text-[11px] text-[#527056] mt-0.5">
                      Portion: {addon.portion}
                    </div>

                    <p className="text-[11px] text-[#527056] mt-2 leading-relaxed bg-[#F7FAF6] rounded-lg p-2 border border-[#E3EDE1]">
                      {addon.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-[#E8EFE6] flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[9px] text-[#527056] block font-bold">PROTEIN</span>
                      <span className="font-extrabold text-[#0E3E1E] font-mono">+{addon.protein}g</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#527056] block font-bold">CALORIES</span>
                      <span className="font-mono text-[#527056]">{addon.calories} kcal</span>
                    </div>
                    <span className="text-[10px] text-[#527056] font-bold uppercase tracking-wider bg-[#DFECDD] px-2 py-0.5 rounded-md">
                      {addon.prepMethod.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E8EFE6] px-6 py-3 text-xs text-[#527056] flex items-center justify-between bg-[#F7FAF6]">
          <span>Checked against ICMR-NIN Indian Food Composition Tables 2017</span>
          <button
            onClick={onClose}
            className="rounded-lg bg-[#DFECDD] px-3.5 py-1.5 text-xs font-bold text-[#0E3E1E] hover:bg-[#CCE0CB]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
