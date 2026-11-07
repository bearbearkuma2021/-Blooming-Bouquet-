import React from 'react';
import { Flower, Sparkles, Wand2, Package, Mail } from 'lucide-react';
import { AppPhase } from '../types';

interface HeaderProps {
  currentPhase: AppPhase;
  onSelectPhase: (phase: AppPhase) => void;
  harvestCount: number;
  onOpenDiy: () => void;
  onReturnToStart?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPhase,
  onSelectPhase,
  harvestCount,
  onOpenDiy,
  onReturnToStart,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#F9F7F2]/90 backdrop-blur-md border-b border-[#E8E2D5] px-4 md:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand wordmark (Click to return to Start Page) */}
        <div 
          onClick={onReturnToStart}
          className={`flex items-center gap-2.5 shrink-0 ${onReturnToStart ? 'cursor-pointer group' : ''}`}
          title={onReturnToStart ? '返回開始頁面' : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-[#E5DCCB] group-hover:bg-[#DFD3BE] text-[#55694C] flex items-center justify-center shadow-xs transition-colors">
            <Flower className="w-4.5 h-4.5 group-hover:rotate-12 transition-transform" />
          </div>
          <span className="text-lg md:text-xl font-serif-tc font-semibold tracking-wide text-[#384335] whitespace-nowrap">
            靜綻花語 <span className="text-xs md:text-sm font-normal font-sans text-[#7E8B79] ml-1">Blooming Bouquet</span>
          </span>
        </div>

        {/* Zone 2: Navigation Steps / Progress */}
        <nav className="hidden sm:flex items-center gap-1 md:gap-3 text-xs md:text-sm font-medium">
          <button
            onClick={() => onSelectPhase(1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              currentPhase === 1
                ? 'bg-[#E3EBDD] text-[#344D2B] font-semibold shadow-xs'
                : 'text-[#6C7667] hover:text-[#2E3D29] hover:bg-[#F0ECE1]'
            }`}
          >
            <Flower className="w-3.5 h-3.5" />
            <span>1. 慢步花田</span>
            <span className="text-[11px] px-1.5 py-0.2 rounded-full bg-white/70 text-[#4D6344]">
              {harvestCount}/50
            </span>
          </button>

          <span className="text-[#C6BCAB]">·</span>

          <button
            onClick={() => {
              if (harvestCount >= 3) onSelectPhase(2);
            }}
            disabled={harvestCount < 3}
            title={harvestCount < 3 ? '需至少採收 3 朵花' : ''}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentPhase === 2
                ? 'bg-[#E3EBDD] text-[#344D2B] font-semibold shadow-xs'
                : harvestCount >= 3
                ? 'text-[#6C7667] hover:text-[#2E3D29] hover:bg-[#F0ECE1] cursor-pointer'
                : 'text-[#B0A798] opacity-60 cursor-not-allowed'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>2. 花束包裝</span>
          </button>

          <span className="text-[#C6BCAB]">·</span>

          <button
            onClick={() => {
              if (harvestCount >= 3) onSelectPhase(3);
            }}
            disabled={harvestCount < 3}
            title={harvestCount < 3 ? '需先採收花朵完成花束' : ''}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              currentPhase === 3
                ? 'bg-[#E3EBDD] text-[#344D2B] font-semibold shadow-xs'
                : harvestCount >= 3
                ? 'text-[#6C7667] hover:text-[#2E3D29] hover:bg-[#F0ECE1] cursor-pointer'
                : 'text-[#B0A798] opacity-60 cursor-not-allowed'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>3. 心意賀卡</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action / Quick Tool */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenDiy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFE8D8] hover:bg-[#E6DCC9] text-[#4A5744] text-xs font-medium border border-[#D8CEBA] transition-colors cursor-pointer whitespace-nowrap shadow-xs"
            title="開啟手繪花朵畫板"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#5F7552]" />
            <span className="hidden sm:inline">手繪專屬花朵</span>
            <span className="sm:hidden">手繪花</span>
          </button>

          {currentPhase === 1 && (
            <button
              onClick={() => {
                if (harvestCount >= 3) onSelectPhase(2);
              }}
              disabled={harvestCount < 3}
              className={`flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                harvestCount >= 3
                  ? 'bg-[#55694C] hover:bg-[#43533C] text-white shadow-xs cursor-pointer'
                  : 'bg-[#DFD9CB] text-[#8A8172] cursor-not-allowed opacity-75'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>去包裝花束 ({harvestCount}/3)</span>
            </button>
          )}

          {currentPhase === 2 && (
            <button
              onClick={() => onSelectPhase(3)}
              className="flex items-center gap-1 px-3.5 py-1.5 rounded-lg bg-[#55694C] hover:bg-[#43533C] text-white text-xs font-medium transition-all shadow-xs cursor-pointer whitespace-nowrap"
            >
              <span>下一步：寫賀卡</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
