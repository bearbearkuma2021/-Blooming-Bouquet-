import React, { useState } from 'react';
import { 
  Sparkles, Check, Droplets, Info, PlusCircle, ArrowRight
} from 'lucide-react';
import { TimePeriod, WeatherEvent, GardenFlower, FlowerType } from '../../types';
import { PRESET_FLOWERS } from '../../data/presetFlowers';

interface GardenSceneProps {
  currentPeriod: TimePeriod;
  currentEvent: WeatherEvent;
  flowers: GardenFlower[];
  onHarvest: (flower: GardenFlower) => void;
  onPlantInSlot: (slotIndex: number, flowerType: FlowerType) => void;
  onInstantBloomSlot: (slotId: string) => void;
  harvestCount: number;
  onProceedToBouquet: () => void;
}

// 9 High-Definition Backgrounds mapping 1-to-1 to uploaded watercolor assets
const BACKGROUND_MAP: Record<string, string> = {
  'DAY_NONE': '/assets/backgrounds/bg_day_clear.png',
  'DAY_RAINBOW': '/assets/backgrounds/bg_day_rainbow.png',
  'DAY_RAIN': '/assets/backgrounds/bg_day_rain.png',
  'SUNSET_NONE': '/assets/backgrounds/bg_sunset_clear.png',
  'SUNSET_FOX': '/assets/backgrounds/bg_sunset_fox.png',
  'SUNSET_RAIN': '/assets/backgrounds/bg_day_rain.png',
  'DAWN_NONE': '/assets/backgrounds/bg_dawn_clear.png',
  'DAWN_RAIN': '/assets/backgrounds/bg_day_rain.png',
  'NIGHT_NONE': '/assets/backgrounds/bg_night_clear.png',
  'NIGHT_METEOR': '/assets/backgrounds/bg_night_meteor.png',
  'NIGHT_RAIN': '/assets/backgrounds/bg_night_rain.png',
};

export const GardenScene: React.FC<GardenSceneProps> = ({
  currentPeriod,
  currentEvent,
  flowers,
  onHarvest,
  onPlantInSlot,
  onInstantBloomSlot,
  harvestCount,
  onProceedToBouquet,
}) => {
  const [selectedSlotForPlant, setSelectedSlotForPlant] = useState<number | null>(null);
  const [harvestNotification, setHarvestNotification] = useState<string | null>(null);

  const sceneKey = `${currentPeriod}_${currentEvent}`;
  const bgImageUrl = BACKGROUND_MAP[sceneKey] || BACKGROUND_MAP[`${currentPeriod}_NONE`] || '/assets/backgrounds/bg_day_clear.png';

  const periodDisplayName = {
    DAY: '明媚晴日 (Daytime)',
    SUNSET: '暖橘黃昏 (Sunset)',
    NIGHT: '靜謐深夜 (Night)',
    DAWN: '晨霧破曉 (Dawn)',
  }[currentPeriod];

  const handleHarvestClick = (flower: GardenFlower) => {
    if (flower.isHarvested) return;
    
    // Check if fully grown
    const elapsed = Date.now() - flower.plantedAt;
    const isMature = elapsed >= flower.growthDurationMs;
    
    if (!isMature) {
      const remainingSec = Math.ceil((flower.growthDurationMs - elapsed) / 1000);
      setHarvestNotification(`「${flower.name}」正在生長中（剩餘 ${remainingSec} 秒），請稍候或澆水加速！`);
      setTimeout(() => setHarvestNotification(null), 3000);
      return;
    }

    if (harvestCount >= 50) {
      setHarvestNotification('採收籃已滿 (上限 50 朵)！請先去編排花束或刪除花朵。');
      setTimeout(() => setHarvestNotification(null), 3000);
      return;
    }

    onHarvest(flower);
    setHarvestNotification(`已採收「${flower.name}」放入花籃！`);
    setTimeout(() => setHarvestNotification(null), 2500);
  };

  const isRaining = currentEvent === 'RAIN';
  const isNight = currentPeriod === 'NIGHT';

  return (
    <div className="relative w-full rounded-3xl overflow-hidden shadow-lg border border-[#DFD7C7] select-none bg-[#EDE8DC]">
      {/* 1. High-Resolution Watercolor Background Image Layer */}
      <div className="relative h-[560px] md:h-[620px] w-full overflow-hidden">
        <img
          key={bgImageUrl}
          src={bgImageUrl}
          alt={periodDisplayName}
          className="absolute inset-0 w-full h-full object-cover object-bottom transition-opacity duration-500 select-none pointer-events-none"
          style={{ imageRendering: 'auto' }}
        />

        {/* 2. Soft Ambient Lighting Overlay */}
        {currentPeriod === 'DAY' && (
          <div className="absolute inset-0 bg-amber-50/10 pointer-events-none" />
        )}
        {currentPeriod === 'SUNSET' && (
          <div className="absolute inset-0 bg-orange-500/10 pointer-events-none" />
        )}
        {currentPeriod === 'NIGHT' && (
          <div className="absolute inset-0 bg-indigo-950/15 pointer-events-none" />
        )}
        {currentPeriod === 'DAWN' && (
          <div className="absolute inset-0 bg-purple-400/10 pointer-events-none" />
        )}

        {/* 3. ANIMATION A: 雲朵輕微浮動 (Gentle watercolor cloud drift) */}
        <div className="absolute top-2 left-0 right-0 h-40 pointer-events-none overflow-hidden opacity-55 animate-cloud-drift">
          {/* Subtle translucent cloud wisps matching watercolor aesthetic */}
          <div className="absolute top-4 left-[8%] w-52 h-18 bg-white/25 rounded-full blur-[5px]" />
          <div className="absolute top-10 left-[18%] w-36 h-14 bg-white/20 rounded-full blur-[4px]" />
          <div className="absolute top-6 right-[12%] w-60 h-22 bg-white/20 rounded-full blur-[6px]" />
          <div className="absolute top-14 right-[25%] w-40 h-16 bg-white/15 rounded-full blur-[4px]" />
        </div>

        {/* 4. ANIMATION B: 雨滴飄落與水窪漣漪 (Raindrops falling & puddle ripples) */}
        {isRaining && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {/* Slanted rainfall streaks */}
            {[...Array(55)].map((_, i) => (
              <div
                key={i}
                className="absolute w-[1.5px] h-10 bg-gradient-to-b from-transparent via-blue-100 to-white/70"
                style={{
                  left: `${(i * 1.85) % 100}%`,
                  top: '-30px',
                  animation: `rain-fall ${0.55 + (i % 6) * 0.08}s linear infinite`,
                  animationDelay: `${(i * 0.07) % 1}s`,
                }}
              />
            ))}

            {/* Concentric ripples on puddle locations on the ground */}
            <div className="absolute bottom-28 left-[24%] pointer-events-none">
              <div className="w-16 h-6 border border-cyan-200/50 rounded-full animate-ripple" />
            </div>
            <div className="absolute bottom-24 right-[28%] pointer-events-none">
              <div className="w-20 h-8 border border-cyan-200/50 rounded-full animate-ripple" style={{ animationDelay: '0.8s' }} />
            </div>
            <div className="absolute bottom-20 left-[45%] pointer-events-none">
              <div className="w-14 h-5 border border-cyan-200/50 rounded-full animate-ripple" style={{ animationDelay: '1.4s' }} />
            </div>

            {/* Rain Toast Badge */}
            <div className="absolute top-4 left-5 bg-blue-900/50 backdrop-blur-md text-blue-100 text-xs px-3 py-1.5 rounded-full border border-blue-400/30 flex items-center gap-1.5 shadow-sm">
              <Droplets className="w-3.5 h-3.5 text-blue-300" />
              <span>花田細雨飄落，花草獲得了大自然的溫柔滋養</span>
            </div>
          </div>
        )}

        {/* 5. ANIMATION C: 流星雨劃過 (Shooting Star on Meteor event) */}
        {currentEvent === 'METEOR' && isNight && (
          <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="absolute w-36 h-[2px] bg-gradient-to-r from-transparent via-amber-100 to-white rounded-full animate-meteor"
                style={{
                  top: `${8 + i * 16}%`,
                  right: `${8 + i * 22}%`,
                  animationDelay: `${i * 1.2}s`,
                }}
              />
            ))}
            <div className="absolute top-4 left-5 bg-slate-900/70 backdrop-blur-md text-amber-200 text-xs px-3.5 py-1.5 rounded-full border border-amber-400/40 flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>幸運彩蛋：璀璨流星劃過花田夜空，向繁星許願吧！</span>
            </div>
          </div>
        )}

        {/* 6. ANIMATION D: 微風花瓣飄落 (Gentle drifting flower petals) */}
        {!isRaining && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-5">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2 rounded-full bg-pink-200/70 animate-petal"
                style={{
                  top: `${12 + (i * 9)}%`,
                  left: `${(i * 12) + 5}%`,
                  animationDuration: `${6 + (i % 4) * 1.5}s`,
                  animationDelay: `${i * 0.9}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* 7. ANIMATION E: Foreground Wildflowers Swaying */}
        {/* Subtle watercolor wild grass and daisy stalks on lower left and right edges */}
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none opacity-80 animate-sway-slow">
          <div className="w-12 h-20 rounded-t-full bg-emerald-800/20 blur-[1px]" />
        </div>
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none opacity-80 animate-sway-medium">
          <div className="w-14 h-22 rounded-t-full bg-emerald-800/20 blur-[1px]" />
        </div>

        {/* 8. Interactive 5 Flower Slots Grid (Natural Plant Placement) */}
        <div className="absolute bottom-0 left-0 right-0 h-64 z-20">
          <div className="relative max-w-4xl mx-auto h-full px-4 pb-4 flex flex-col justify-end">
            <div className="grid grid-cols-5 gap-2 md:gap-5 items-end pb-3">
              {flowers.map((flower, idx) => {
                const elapsed = Date.now() - flower.plantedAt;
                const progress = Math.min(1, elapsed / flower.growthDurationMs);
                const isMature = progress >= 1;
                const remainingSec = Math.max(0, Math.ceil((flower.growthDurationMs - elapsed) / 1000));
                
                const stage: 'sprout' | 'bud' | 'blooming' = 
                  progress < 0.35 ? 'sprout' : progress < 0.75 ? 'bud' : 'blooming';

                // Staggered sway duration for natural organic rhythm
                const swayClass = idx % 2 === 0 ? 'animate-sway-slow' : 'animate-sway-medium';

                return (
                  <div
                    key={flower.id}
                    className="relative flex flex-col items-center justify-end group select-none"
                  >
                    {!flower.isHarvested ? (
                      <div
                        onClick={() => handleHarvestClick(flower)}
                        className={`relative flex flex-col items-center justify-end cursor-pointer transition-transform duration-300 ${
                          isMature ? 'hover:scale-110 active:scale-95' : 'hover:scale-103'
                        }`}
                      >
                        {/* Sprout Stage */}
                        {stage === 'sprout' && (
                          <div className={`w-8 h-10 flex flex-col items-center justify-end mb-1 ${swayClass}`}>
                            <div className="flex gap-1">
                              <div className="w-2.5 h-3.5 bg-lime-400 rounded-tl-full rounded-tr-sm rotate-[-25deg] shadow-xs" />
                              <div className="w-2.5 h-3.5 bg-lime-400 rounded-tr-full rounded-tl-sm rotate-[25deg] shadow-xs" />
                            </div>
                            <div className="w-1.5 h-5 bg-lime-600 rounded-full" />
                          </div>
                        )}

                        {/* Bud Stage */}
                        {stage === 'bud' && (
                          <div className={`w-10 h-20 flex flex-col items-center justify-end mb-1 ${swayClass}`}>
                            <div 
                              className="w-5 h-7 rounded-full shadow-sm"
                              style={{ backgroundColor: PRESET_FLOWERS.find(f => f.id === flower.flowerTypeId)?.color || '#E87A84' }}
                            />
                            <div className="w-1.5 h-13 bg-emerald-600 rounded-full -mt-1" />
                          </div>
                        )}

                        {/* Blooming Stage (Crisp 1:1 Flower Asset with Organic Sway) */}
                        {stage === 'blooming' && (
                          <div className={`relative flex flex-col items-center justify-end ${swayClass}`}>
                            {isMature && (
                              <div className="absolute -top-3 w-18 h-18 rounded-full bg-amber-300/30 blur-md animate-pulse pointer-events-none" />
                            )}
                            <img
                              src={flower.customAssetUrl || PRESET_FLOWERS.find(f => f.id === flower.flowerTypeId)?.assetUrl || PRESET_FLOWERS[0].assetUrl}
                              alt={flower.name}
                              className="w-22 md:w-28 h-32 md:h-44 object-contain filter drop-shadow-[0_6px_10px_rgba(0,0,0,0.35)]"
                            />
                          </div>
                        )}

                        {/* Status Label */}
                        <div className="mt-1 flex flex-col items-center">
                          {isMature ? (
                            <div className="px-2.5 py-0.5 rounded-full bg-amber-100/95 text-amber-900 border border-amber-300 text-[10px] md:text-[11px] font-semibold flex items-center gap-1 shadow-sm group-hover:bg-amber-200 transition-colors">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                              <span>採收</span>
                            </div>
                          ) : (
                            <div className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-xs text-white/95 text-[10px] font-mono tabular-nums flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-ping" />
                              <span>{remainingSec}s</span>
                            </div>
                          )}
                          <span className="text-[10px] font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate max-w-[80px] mt-0.5">
                            {flower.name}
                          </span>
                        </div>
                      </div>
                    ) : (
                      /* Harvested Slot: soil mound + replant button */
                      <div className="flex flex-col items-center justify-end h-28 md:h-34 pb-1">
                        <div className="w-14 h-3.5 bg-black/45 rounded-full blur-[1px] mb-2" />
                        <button
                          onClick={() => setSelectedSlotForPlant(flower.slotIndex)}
                          className="px-2.5 py-1 rounded-xl bg-white/30 hover:bg-white/45 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1 border border-white/30 transition-all cursor-pointer shadow-xs active:scale-95"
                          title="在此泥土重新播種"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>播種</span>
                        </button>
                        <span className="text-[10px] text-white/60 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)] mt-1">
                          已採收
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating Harvest Notification Toast */}
        {harvestNotification && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 bg-[#2D3A29]/95 backdrop-blur-md text-amber-100 px-4 py-2 rounded-2xl border border-[#74876C] text-xs md:text-sm font-semibold shadow-xl animate-fade-in flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{harvestNotification}</span>
          </div>
        )}

        {/* Top Right Scene & Basket Counter Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          <div className="bg-white/85 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-[#DDD5C5] text-xs text-[#394833] flex items-center gap-2 shadow-sm">
            <span className="font-semibold">{periodDisplayName}</span>
            <span className="text-[#8B9884]">·</span>
            <span className="text-[11px] text-[#55674E]">
              採收籃: <strong className="text-[#2F3D29]">{harvestCount}</strong>/50 朵
              {harvestCount < 3 && ` (尚需 ${3 - harvestCount} 朵)`}
            </span>
          </div>

          {harvestCount >= 3 && (
            <button
              onClick={onProceedToBouquet}
              className="bg-[#485B3F] hover:bg-[#384831] text-white text-xs font-semibold px-4 py-1.5 rounded-2xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>開始包裝花束</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Replant Modal Drawer */}
      {selectedSlotForPlant !== null && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-xs z-30 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-3xl p-5 max-w-md w-full shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE5D8] mb-3">
              <h3 className="font-serif-tc text-base font-semibold text-[#374432]">
                選擇要播種的花卉種子
              </h3>
              <button
                onClick={() => setSelectedSlotForPlant(null)}
                className="text-xs text-[#7B8874] hover:text-[#2E3A2A] px-2.5 py-1 rounded-lg bg-[#EFE8DC] cursor-pointer"
              >
                取消
              </button>
            </div>
            <p className="text-xs text-[#5D6B57] mb-3">
              播種後花朵約需 2 分鐘自然成熟（可點擊澆水加速或一鍵採收）：
            </p>
            <div className="grid grid-cols-3 gap-2.5 max-h-64 overflow-y-auto p-1">
              {PRESET_FLOWERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    onPlantInSlot(selectedSlotForPlant, f);
                    setSelectedSlotForPlant(null);
                  }}
                  className="flex flex-col items-center p-2.5 rounded-2xl bg-white hover:bg-[#F3EFE6] border border-[#E0D8C8] hover:border-[#829676] transition-all cursor-pointer group shadow-2xs"
                >
                  <img src={f.assetUrl} alt={f.name} className="w-14 h-18 object-contain mb-1 group-hover:scale-105 transition-transform" />
                  <span className="text-xs font-semibold text-[#384533] text-center line-clamp-1">
                    {f.name}
                  </span>
                  <span className="text-[10px] text-[#7C8B76] text-center line-clamp-1">
                    {f.meaning}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
