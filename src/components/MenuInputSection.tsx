import React, { useState, useRef } from 'react';
import { Camera, ClipboardPaste, ArrowRight, Loader2, Image as ImageIcon, X } from 'lucide-react';
import { SAMPLE_MENUS, SampleMenuPreset } from '../data/sampleMenus';

interface MenuInputSectionProps {
  onAnalyzeMenu: (input: { text?: string; imageBase64?: string; mimeType?: string }) => Promise<void>;
  isLoading: boolean;
}

export const MenuInputSection: React.FC<MenuInputSectionProps> = ({
  onAnalyzeMenu,
  isLoading,
}) => {
  const [activeMode, setActiveMode] = useState<'text' | 'image'>('text');
  const [menuText, setMenuText] = useState<string>(SAMPLE_MENUS[0].rawText);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>('image/jpeg');
  const [selectedPresetId, setSelectedPresetId] = useState<string>(SAMPLE_MENUS[0].id);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectPreset = (preset: SampleMenuPreset) => {
    setSelectedPresetId(preset.id);
    setMenuText(preset.rawText);
    setSelectedImage(null);
    setActiveMode('text');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageMimeType(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const base64Data = result.split(',')[1];
        setSelectedImage(base64Data);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeMode === 'image' && selectedImage) {
      await onAnalyzeMenu({
        imageBase64: selectedImage,
        mimeType: imageMimeType,
        text: menuText.trim() || undefined,
      });
    } else {
      if (!menuText.trim()) return;
      await onAnalyzeMenu({ text: menuText.trim() });
    }
  };

  return (
    <section className="rounded-2xl border border-[#D2E2CF] bg-white p-6 shadow-xs">
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E3EDE1] mb-5">
        <div>
          <h2 className="text-base font-bold text-[#0E3E1E]">Input Mess Menu</h2>
          <p className="text-xs text-[#527056] mt-0.5">
            Model reads dishes · Deterministic IFCT engine computes protein and macros
          </p>
        </div>

        <div className="flex items-center rounded-xl bg-[#DFECDD] p-1 border border-[#D0E2CE] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveMode('text')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeMode === 'text'
                ? 'bg-white text-[#0E3E1E] shadow-xs'
                : 'text-[#4F6D54] hover:text-[#0E3E1E]'
            }`}
          >
            <ClipboardPaste className="h-3.5 w-3.5" />
            <span>Text Menu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveMode('image')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
              activeMode === 'image'
                ? 'bg-white text-[#0E3E1E] shadow-xs'
                : 'text-[#4F6D54] hover:text-[#0E3E1E]'
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            <span>Noticeboard Photo</span>
          </button>
        </div>
      </div>

      {/* Preset Fast-Pick Row */}
      <div className="mb-5">
        <div className="text-[11px] font-bold text-[#527056] uppercase tracking-wider mb-2.5">
          Select Typical Hostel Menu
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {SAMPLE_MENUS.map((preset) => (
            <button
              type="button"
              key={preset.id}
              onClick={() => handleSelectPreset(preset)}
              className={`rounded-xl p-3 text-left border transition-all ${
                selectedPresetId === preset.id && activeMode === 'text'
                  ? 'border-[#0E3E1E] bg-[#E9F2E7] text-[#0E3E1E] shadow-xs'
                  : 'border-[#DAE7D8] bg-[#F7FAF6] text-[#527056] hover:border-[#B7D1B4] hover:text-[#0E3E1E]'
              }`}
            >
              <div className="text-[10px] font-bold text-[#35613A] uppercase tracking-wider">
                {preset.hostelTag}
              </div>
              <div className="text-xs font-bold text-[#0E3E1E] mt-1 truncate">
                {preset.title.split(':')[1]?.trim() || preset.title}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {activeMode === 'text' ? (
          <div>
            <div className="relative">
              <textarea
                value={menuText}
                onChange={(e) => {
                  setMenuText(e.target.value);
                  setSelectedPresetId('');
                }}
                rows={5}
                placeholder="Paste your daily mess menu here (e.g. Breakfast: Poha, chai; Lunch: Rajma chawal, dahi; Dinner: Dal tadka, aloo gobhi, 4 roti)"
                className="w-full rounded-xl border border-[#CCE0CB] bg-[#F8FAF7] px-4 py-3 text-xs text-[#0E3E1E] placeholder-[#8BA48E] font-mono leading-relaxed focus:border-[#0E3E1E] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0E3E1E]"
                required
              />
              {menuText && (
                <button
                  type="button"
                  onClick={() => setMenuText('')}
                  className="absolute top-3 right-3 text-xs font-medium text-[#7A987E] hover:text-[#0E3E1E]"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {!selectedImage ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#BCD4B9] bg-[#F7FAF6] p-8 text-center cursor-pointer hover:border-[#0E3E1E] hover:bg-[#EEF5EC] transition-all"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#DFECDD] text-[#0E3E1E] mb-2.5">
                  <Camera className="h-5 w-5" />
                </div>
                <div className="text-xs font-bold text-[#0E3E1E]">
                  Click to upload or photograph mess noticeboard
                </div>
                <p className="text-[11px] text-[#608064] mt-1">
                  Supports image files from camera or photo library
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#CCE0CB] bg-[#F8FAF7] p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#DFECDD] text-[#0E3E1E]">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0E3E1E]">Menu Board Image Attached</div>
                    <div className="text-[11px] text-[#426847]">Ready for Gemini Vision extraction</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#D2E2CF] text-[#0E3E1E] hover:bg-[#F2F7F0]"
                  >
                    Change
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedImage(null)}
                    className="p-1.5 rounded-lg text-[#7A987E] hover:text-[#0E3E1E] hover:bg-[#DFECDD]"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Row */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-[#608064]">
            Checked against official ICMR-NIN IFCT tables (no AI guessing)
          </span>

          <button
            type="submit"
            disabled={isLoading || (activeMode === 'image' && !selectedImage && !menuText)}
            className="flex items-center gap-2 rounded-xl bg-[#0E3E1E] px-5 py-2.5 text-xs font-bold text-white hover:bg-[#15532A] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Computing Verified Macros...</span>
              </>
            ) : (
              <>
                <span>Analyze Menu Nutrition</span>
                <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
