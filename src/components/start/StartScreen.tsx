import React from 'react';
import { Flower, ArrowRight, Sparkles, Heart, Sun, Feather } from 'lucide-react';

interface StartScreenProps {
  onStartGame: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStartGame }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-hidden bg-[#F7F5EE]">
      {/* 1. Immersive Garden Landscape Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000 scale-105"
        style={{
          backgroundImage: "url('/assets/backgrounds/bg_day_clear.png')",
          filter: 'brightness(0.97) contrast(1.02)',
        }}
      />

      {/* 2. Soft Watercolor & Hand-made Paper Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#F9F7F2]/80 via-[#F9F7F2]/45 to-[#F9F7F2]/85 backdrop-blur-[1.5px]" />
      <div className="absolute inset-0 bg-paper-texture opacity-60 pointer-events-none" />

      {/* 3. Floating Ambient Petals */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[18%] left-[12%] animate-petal">
          <div className="w-4 h-6 rounded-full bg-[#F48C9A]/70 rotate-12 shadow-2xs" />
        </div>
        <div className="absolute top-[35%] right-[15%] animate-petal" style={{ animationDelay: '2.5s' }}>
          <div className="w-5 h-7 rounded-full bg-[#F59E0B]/60 -rotate-45 shadow-2xs" />
        </div>
        <div className="absolute bottom-[25%] left-[22%] animate-petal" style={{ animationDelay: '4.8s' }}>
          <div className="w-4 h-5 rounded-full bg-[#8A7BB3]/60 rotate-25 shadow-2xs" />
        </div>
        <div className="absolute top-[10%] right-[32%] animate-petal" style={{ animationDelay: '1.2s' }}>
          <div className="w-3.5 h-5 rounded-full bg-[#D9383A]/60 rotate-60 shadow-2xs" />
        </div>
      </div>

      {/* 4. Top Minimal Navigation Bar */}
      <header className="relative z-10 w-full px-6 md:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E5DCCB] text-[#55694C] flex items-center justify-center shadow-xs border border-[#D5CAB7]">
            <Flower className="w-4.5 h-4.5" />
          </div>
          <span className="text-base md:text-lg font-serif-tc font-semibold tracking-wide text-[#384335]">
            靜綻花語 <span className="text-xs font-normal font-sans text-[#7E8B79] ml-1">Blooming Bouquet</span>
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-[#6F7D68] bg-white/70 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-[#DFD7C7] shadow-2xs">
          <Sun className="w-3.5 h-3.5 text-[#C49A45]" />
          <span>慢步 · 採摘 · 手作</span>
        </div>
      </header>

      {/* 5. Center Hero & Main Action Area */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-6 md:py-10 flex flex-col items-center text-center my-auto">
        {/* Logo Medallion matching Header specification */}
        <div className="relative mb-4 md:mb-5">
          <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-[#E5DCCB] text-[#55694C] flex items-center justify-center shadow-lg border-2 border-[#D8CEBC] mx-auto animate-float">
            <Flower className="w-10 h-10 md:w-12 md:h-12 text-[#4E6244]" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FAF6E9] border border-[#D5CAB7] flex items-center justify-center text-[#9E8148] shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Standard Brand Typography */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif-tc font-semibold tracking-wide text-[#2D3A29] leading-tight drop-shadow-2xs">
          靜綻花語
        </h1>

        <div className="flex items-center gap-3 mt-1.5 mb-4">
          <span className="h-[1px] w-6 md:w-10 bg-[#B5A894]" />
          <span className="text-xs md:text-sm font-normal font-sans tracking-[0.25em] text-[#6A7864] uppercase font-medium">
            Blooming Bouquet
          </span>
          <span className="h-[1px] w-6 md:w-10 bg-[#B5A894]" />
        </div>

        {/* Atmosphere Subtitle */}
        <p className="text-sm md:text-base text-[#566551] max-w-lg leading-relaxed font-serif-tc font-normal mb-8">
          在時光漫漫的庭園中，採摘初綻的花朵，<br className="hidden sm:inline" />
          編織專屬於你的手作花束與溫暖心意。
        </p>

        {/* Start Game Action Button */}
        <div className="relative group">
          {/* Subtle glowing ring behind button */}
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#7B9272]/40 via-[#A3B899]/30 to-[#7B9272]/40 blur-md opacity-75 group-hover:opacity-100 transition duration-500 group-hover:duration-200 animate-pulse" />

          <button
            onClick={onStartGame}
            className="relative flex items-center gap-3 px-8 sm:px-11 py-4 sm:py-4.5 rounded-full bg-[#55694C] hover:bg-[#43533C] text-white font-serif-tc text-lg sm:text-xl font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform group-hover:-translate-y-0.5 active:translate-y-0 active:scale-95 cursor-pointer overflow-hidden border border-[#7D9173]/50"
          >
            {/* Ambient Shimmer sheen */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

            <Flower className="w-5 h-5 text-[#E6EFE2] group-hover:rotate-45 transition-transform duration-500" />
            <span className="tracking-wider">開始遊戲</span>
            <ArrowRight className="w-5 h-5 text-[#E6EFE2] group-hover:translate-x-1.5 transition-transform duration-300" />
          </button>
        </div>

        {/* 3 Step highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-5 mt-10 md:mt-12 w-full max-w-2xl text-left">
          <div className="bg-white/75 backdrop-blur-xs p-3.5 rounded-2xl border border-[#DFD7C7] shadow-2xs hover:bg-white/90 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#E5DCCB] text-[#55694C] text-[11px] font-bold flex items-center justify-center">
                1
              </span>
              <span className="font-serif-tc text-xs font-semibold text-[#323F2E]">慢步採收</span>
            </div>
            <p className="text-[11px] text-[#71806D] leading-normal">
              日夜四時花田循環，五處苗圃自然生長，採集純粹花材。
            </p>
          </div>

          <div className="bg-white/75 backdrop-blur-xs p-3.5 rounded-2xl border border-[#DFD7C7] shadow-2xs hover:bg-white/90 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#E5DCCB] text-[#55694C] text-[11px] font-bold flex items-center justify-center">
                2
              </span>
              <span className="font-serif-tc text-xs font-semibold text-[#323F2E]">手作包裝</span>
            </div>
            <p className="text-[11px] text-[#71806D] leading-normal">
              自由旋轉縮放與圖層排序，搭配三層質感包裝紙與絲帶。
            </p>
          </div>

          <div className="bg-white/75 backdrop-blur-xs p-3.5 rounded-2xl border border-[#DFD7C7] shadow-2xs hover:bg-white/90 transition-colors">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-5 h-5 rounded-full bg-[#E5DCCB] text-[#55694C] text-[11px] font-bold flex items-center justify-center">
                3
              </span>
              <span className="font-serif-tc text-xs font-semibold text-[#323F2E]">心意傳遞</span>
            </div>
            <p className="text-[11px] text-[#71806D] leading-normal">
              手寫祝福語與專屬手繪塗鴉，匯出高畫質心意成品圖卡。
            </p>
          </div>
        </div>
      </main>

      {/* 6. Subtle Footer */}
      <footer className="relative z-10 w-full py-4 px-6 text-center text-xs text-[#828F7C]">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-2 border-t border-[#DFD7C7]/60 pt-3">
          <span>靜綻花語 Blooming Bouquet · 療癒系 2D 互動花田</span>
          <div className="flex items-center gap-1.5 text-[11px] text-[#93A08E]">
            <Heart className="w-3 h-3 text-[#B0897A]" />
            <span>願每一朵花，溫暖你的日常</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
