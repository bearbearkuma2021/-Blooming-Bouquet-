import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { GardenScene } from './components/garden/GardenScene';
import { TestPeriodSwitcher } from './components/garden/TestPeriodSwitcher';
import { HarvestBasketPreview } from './components/garden/HarvestBasketPreview';
import { BouquetCanvas } from './components/bouquet/BouquetCanvas';
import { CardEditor } from './components/card/CardEditor';
import { DiyFlowerModal } from './components/diy/DiyFlowerModal';
import { ExportModal } from './components/export/ExportModal';
import { StartScreen } from './components/start/StartScreen';
import { FlowerTransitionOverlay } from './components/start/FlowerTransitionOverlay';
import { 
  TimePeriod, WeatherEvent, GardenFlower, HarvestedFlower, 
  BouquetItem, WrappingConfig, RibbonConfig, CardConfig, 
  AppPhase, FlowerType 
} from './types';
import { PRESET_FLOWERS } from './data/presetFlowers';

const TIME_SEQUENCE: TimePeriod[] = ['DAY', 'SUNSET', 'NIGHT', 'DAWN'];

const EVENT_POOL: Record<TimePeriod, WeatherEvent[]> = {
  DAY: ['RAIN', 'RAINBOW'],
  SUNSET: ['RAIN', 'FOX'],
  NIGHT: ['RAIN', 'METEOR'],
  DAWN: ['RAIN'],
};

const DEFAULT_GROWTH_DURATION = 120 * 1000; // 2 minutes (120 seconds) as requested

export default function App() {
  // Start Screen & Flower Wave Transition State
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // App Phase: 1: Garden, 2: Bouquet, 3: Card
  const [currentPhase, setCurrentPhase] = useState<AppPhase>(1);

  // Time & Weather state with LocalStorage recovery
  const [currentPeriod, setCurrentPeriod] = useState<TimePeriod>(() => {
    const saved = localStorage.getItem('blooming_period');
    return (saved as TimePeriod) || 'DAY';
  });

  const [currentEvent, setCurrentEvent] = useState<WeatherEvent>(() => {
    const saved = localStorage.getItem('blooming_event');
    return (saved as WeatherEvent) || 'NONE';
  });

  // Cooldown setting: defaults to 5 minutes standard as explicitly requested
  const [cooldownMode, setCooldownMode] = useState<'test_5s' | 'normal_5m'>('normal_5m');
  const [nextRefreshAt, setNextRefreshAt] = useState<number>(() => {
    const saved = localStorage.getItem('blooming_next_refresh');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [remainingCooldown, setRemainingCooldown] = useState<number>(0);

  // Garden Flowers (Exactly 5 slots as requested)
  const [gardenFlowers, setGardenFlowers] = useState<GardenFlower[]>(() => {
    const now = Date.now();
    // Initialize 5 botanical plants in foreground
    return Array.from({ length: 5 }, (_, i) => {
      const preset = PRESET_FLOWERS[i % PRESET_FLOWERS.length];
      // First 2 mature immediately, remaining 3 growing
      const isInitialBloom = i < 2;
      return {
        id: `flower_${i}_${now}`,
        flowerTypeId: preset.id,
        name: preset.name,
        plantedAt: isInitialBloom ? now - DEFAULT_GROWTH_DURATION - 1000 : now - (i * 20000),
        growthDurationMs: DEFAULT_GROWTH_DURATION,
        isHarvested: false,
        slotIndex: i,
        xPercent: 12 + i * 19,
        yPercent: 75,
        scale: 1,
        isBackground: false,
      };
    });
  });

  // Harvest Basket (starts with 0, minimum 3 to proceed)
  const [harvestedFlowers, setHarvestedFlowers] = useState<HarvestedFlower[]>([]);

  // Bouquet Workspace State
  const [bouquetItems, setBouquetItems] = useState<BouquetItem[]>([]);
  const [wrapping, setWrapping] = useState<WrappingConfig>({
    innerColor: '#F7EDE2',
    innerOpacity: 0.85,
    middleColor: '#D2BBA0',
    middlePattern: 'solid',
    outerColor: '#BFA487',
    outerStyle: 'folded',
  });
  const [ribbon, setRibbon] = useState<RibbonConfig>({
    type: 'silk',
    color: '#FAF3E0',
    hasTag: true,
    tagText: 'For You',
  });

  // Card Configuration
  const [card, setCard] = useState<CardConfig>({
    enabled: true,
    style: 'kraft',
    title: '致最珍貴的你',
    message: '願生活如繁花，安靜盛開，明媚向陽。\n每一朵花，都藏著我最真切的祝福與牽掛。',
    font: 'serif',
    fontSize: 16,
    textColor: '#3A2E24',
    textAlign: 'center',
    x: 0,
    y: 0,
    rotation: 0,
    scale: 1,
  });

  // Modals
  const [isDiyOpen, setIsDiyOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Timer: Check cooldown countdown and flower growth tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (nextRefreshAt > now) {
        setRemainingCooldown(Math.ceil((nextRefreshAt - now) / 1000));
      } else {
        setRemainingCooldown(0);
      }
      // Force trigger re-render for flower growth progress
      setGardenFlowers((prev) => [...prev]);
    }, 1000);

    return () => clearInterval(timer);
  }, [nextRefreshAt]);

  // Persist period & cooldown
  useEffect(() => {
    localStorage.setItem('blooming_period', currentPeriod);
    localStorage.setItem('blooming_event', currentEvent);
  }, [currentPeriod, currentEvent]);

  // Manual refresh logic with 5-second cooldown
  const handleManualRefresh = () => {
    if (remainingCooldown > 0) return;

    // Advance to next period
    const currentIndex = TIME_SEQUENCE.indexOf(currentPeriod);
    const nextIndex = (currentIndex + 1) % TIME_SEQUENCE.length;
    const newPeriod = TIME_SEQUENCE[nextIndex];

    // Roll event (40% probability for delightful discovery)
    let newEvent: WeatherEvent = 'NONE';
    if (Math.random() < 0.5) {
      const pool = EVENT_POOL[newPeriod];
      if (pool && pool.length > 0) {
        newEvent = pool[Math.floor(Math.random() * pool.length)];
      }
    }

    // Set cooldown: 5s in test mode, 5m (300s) in normal mode
    const cooldownDuration = cooldownMode === 'test_5s' ? 5 * 1000 : 5 * 60 * 1000;
    const nextTime = Date.now() + cooldownDuration;
    localStorage.setItem('blooming_next_refresh', nextTime.toString());

    setCurrentPeriod(newPeriod);
    setCurrentEvent(newEvent);
    setNextRefreshAt(nextTime);
    setRemainingCooldown(cooldownDuration / 1000);
  };

  // Direct set scene (for testing inspection as requested)
  const handleDirectSetScene = (period: TimePeriod, event: WeatherEvent) => {
    setCurrentPeriod(period);
    setCurrentEvent(event);
  };

  // 一鍵採收：將當前花田中所有的花朵直接採收加入花籃（上限50朵），並自動播下新種子繼續生長
  const handleInstantHarvestAll = () => {
    if (harvestedFlowers.length >= 50) {
      return;
    }

    const availableSlots = 50 - harvestedFlowers.length;
    // Harvest all 5 flowers from garden
    const flowersToHarvest = gardenFlowers.slice(0, availableSlots);

    const newHarvestItems: HarvestedFlower[] = flowersToHarvest.map((f, idx) => {
      const preset = PRESET_FLOWERS.find((p) => p.id === f.flowerTypeId) || PRESET_FLOWERS[idx % PRESET_FLOWERS.length];
      return {
        id: `harvest_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        flowerTypeId: f.flowerTypeId,
        name: f.name,
        assetUrl: f.customAssetUrl || preset?.assetUrl || PRESET_FLOWERS[0].assetUrl,
        color: preset?.color || '#E87A84',
        meaning: preset?.meaning || '幸福安詳',
        harvestedAt: Date.now() + idx,
      };
    });

    setHarvestedFlowers((prev) => [...prev, ...newHarvestItems]);

    // Re-seed all 5 slots with fresh seeds
    const now = Date.now();
    setGardenFlowers(
      Array.from({ length: 5 }, (_, i) => {
        const preset = PRESET_FLOWERS[(i + Math.floor(Math.random() * PRESET_FLOWERS.length)) % PRESET_FLOWERS.length];
        return {
          id: `flower_${i}_${now}`,
          flowerTypeId: preset.id,
          name: preset.name,
          plantedAt: now,
          growthDurationMs: DEFAULT_GROWTH_DURATION,
          isHarvested: false,
          slotIndex: i,
          xPercent: 12 + i * 19,
          yPercent: 75,
          scale: 1,
          isBackground: false,
        };
      })
    );
  };

  const handleWaterFlowers = () => {
    // Accelerate growth by 30 seconds
    setGardenFlowers((prev) =>
      prev.map((f) => ({
        ...f,
        plantedAt: f.plantedAt - 30 * 1000,
      }))
    );
  };

  const handleReplantGarden = () => {
    const now = Date.now();
    setGardenFlowers(
      Array.from({ length: 5 }, (_, i) => {
        const preset = PRESET_FLOWERS[i % PRESET_FLOWERS.length];
        return {
          id: `flower_${i}_${now}`,
          flowerTypeId: preset.id,
          name: preset.name,
          plantedAt: now,
          growthDurationMs: DEFAULT_GROWTH_DURATION,
          isHarvested: false,
          slotIndex: i,
          xPercent: 12 + i * 19,
          yPercent: 75,
          scale: 1,
          isBackground: false,
        };
      })
    );
  };

  // Harvest individual flower into basket
  const handleHarvest = (flower: GardenFlower) => {
    if (harvestedFlowers.length >= 50) return;

    // Mark as harvested
    setGardenFlowers((prev) =>
      prev.map((f) => (f.id === flower.id ? { ...f, isHarvested: true } : f))
    );

    const preset = PRESET_FLOWERS.find((p) => p.id === flower.flowerTypeId);
    const newHarvest: HarvestedFlower = {
      id: `harvest_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      flowerTypeId: flower.flowerTypeId,
      name: flower.name,
      assetUrl: flower.customAssetUrl || preset?.assetUrl || PRESET_FLOWERS[0].assetUrl,
      color: preset?.color || '#E87A84',
      meaning: preset?.meaning || '幸福安詳',
      harvestedAt: Date.now(),
    };

    setHarvestedFlowers((prev) => [...prev, newHarvest]);
  };

  // Delete unwanted flower from basket
  const handleDeleteHarvestedFlower = (flowerId: string) => {
    setHarvestedFlowers((prev) => prev.filter((f) => f.id !== flowerId));
  };

  // Clear all flowers from basket
  const handleClearBasket = () => {
    setHarvestedFlowers([]);
  };

  // When a flower is used in the bouquet, remove from harvested list
  const handleUseHarvestedFlower = (flower: HarvestedFlower) => {
    setHarvestedFlowers((prev) => prev.filter((f) => f.id !== flower.id));
  };

  // When a flower is deleted from the bouquet, return to harvested list
  const handleReturnFlowerToBasket = (flower: HarvestedFlower) => {
    setHarvestedFlowers((prev) => [...prev, flower]);
  };

  // Clear all design in bouquet and return all flowers to harvested basket
  const handleClearAllBouquet = () => {
    const returned: HarvestedFlower[] = bouquetItems
      .map((item) => item.originalHarvestFlower)
      .filter((f): f is HarvestedFlower => !!f);
    setHarvestedFlowers((prev) => [...prev, ...returned]);
    setBouquetItems([]);
  };

  // Replant a specific slot
  const handlePlantInSlot = (slotIndex: number, flowerType: FlowerType) => {
    const now = Date.now();
    setGardenFlowers((prev) =>
      prev.map((f) =>
        f.slotIndex === slotIndex
          ? {
              ...f,
              id: `flower_${slotIndex}_${now}`,
              flowerTypeId: flowerType.id,
              name: flowerType.name,
              plantedAt: now,
              growthDurationMs: DEFAULT_GROWTH_DURATION,
              isHarvested: false,
              customAssetUrl: flowerType.isCustom ? flowerType.assetUrl : undefined,
            }
          : f
      )
    );
  };

  // Save DIY flower
  const handleSaveDiyFlower = (newFlower: FlowerType, targetAction: 'garden' | 'basket') => {
    if (targetAction === 'basket') {
      if (harvestedFlowers.length < 50) {
        const harvestItem: HarvestedFlower = {
          id: `harvest_diy_${Date.now()}`,
          flowerTypeId: newFlower.id,
          name: newFlower.name,
          assetUrl: newFlower.assetUrl,
          color: newFlower.color,
          meaning: newFlower.meaning,
          harvestedAt: Date.now(),
        };
        setHarvestedFlowers((prev) => [...prev, harvestItem]);
      }
    } else {
      // Find first empty slot or replant slot 0
      const emptySlot = gardenFlowers.find((f) => f.isHarvested);
      const targetSlot = emptySlot ? emptySlot.slotIndex : 0;
      handlePlantInSlot(targetSlot, newFlower);
    }
  };

  const handleStartGame = () => {
    setIsTransitioning(true);
  };

  const handleTransitionMidpoint = () => {
    setHasStarted(true);
    setCurrentPhase(1);
  };

  const handleTransitionComplete = () => {
    setIsTransitioning(false);
  };

  const handleReturnToStart = () => {
    setHasStarted(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F6F0] flex flex-col justify-between selection:bg-[#E3EBDD] selection:text-[#384831]">
      {/* Flower Swoosh Transition from Right to Left */}
      {isTransitioning && (
        <FlowerTransitionOverlay
          onMidpoint={handleTransitionMidpoint}
          onComplete={handleTransitionComplete}
        />
      )}

      {/* START SCREEN or MAIN GAMEPLAY */}
      {!hasStarted ? (
        <StartScreen onStartGame={handleStartGame} />
      ) : (
        <>
          {/* 1. Header with 3-zone contract */}
          <Header
            currentPhase={currentPhase}
            onSelectPhase={(phase) => setCurrentPhase(phase)}
            harvestCount={harvestedFlowers.length}
            onOpenDiy={() => setIsDiyOpen(true)}
            onReturnToStart={handleReturnToStart}
          />

          {/* 2. Main Body Content based on App Phase */}
          <main className="flex-1 max-w-7xl w-full mx-auto p-3 md:p-6 pb-12">
        {/* PHASE 1: Garden Scene & Harvesting */}
        {currentPhase === 1 && (
          <div className="space-y-4">
            {/* Developer / Testing Panel (Cooldown 5s & All Scenes Preview) */}
            <TestPeriodSwitcher
              currentPeriod={currentPeriod}
              currentEvent={currentEvent}
              cooldownSeconds={remainingCooldown}
              isCooldownActive={remainingCooldown > 0}
              onManualRefresh={handleManualRefresh}
              onDirectSetScene={handleDirectSetScene}
              onInstantHarvestAll={handleInstantHarvestAll}
              onWaterFlowers={handleWaterFlowers}
              onReplantGarden={handleReplantGarden}
              cooldownMode={cooldownMode}
              onToggleCooldownMode={() =>
                setCooldownMode((m) => (m === 'test_5s' ? 'normal_5m' : 'test_5s'))
              }
            />

            {/* Dynamic 2D Garden Scene (5 Slots) */}
            <GardenScene
              currentPeriod={currentPeriod}
              currentEvent={currentEvent}
              flowers={gardenFlowers}
              onHarvest={handleHarvest}
              onPlantInSlot={handlePlantInSlot}
              onInstantBloomSlot={(slotId) => {
                setGardenFlowers((prev) =>
                  prev.map((f) =>
                    f.id === slotId
                      ? { ...f, plantedAt: Date.now() - DEFAULT_GROWTH_DURATION }
                      : f
                  )
                );
              }}
              harvestCount={harvestedFlowers.length}
              onProceedToBouquet={() => setCurrentPhase(2)}
            />

            {/* Harvest Basket Preview under Garden Scene (Capacity 50 & Delete support) */}
            <HarvestBasketPreview
              harvestedFlowers={harvestedFlowers}
              onDeleteFlower={handleDeleteHarvestedFlower}
              onClearBasket={handleClearBasket}
              onProceedToBouquet={() => setCurrentPhase(2)}
            />
          </div>
        )}

        {/* PHASE 2: Bouquet Assembly & Packaging */}
        {currentPhase === 2 && (
          <BouquetCanvas
            harvestedFlowers={harvestedFlowers}
            bouquetItems={bouquetItems}
            wrapping={wrapping}
            ribbon={ribbon}
            card={card}
            onChangeBouquetItems={setBouquetItems}
            onChangeWrapping={setWrapping}
            onChangeRibbon={setRibbon}
            onUseHarvestedFlower={handleUseHarvestedFlower}
            onReturnFlowerToBasket={handleReturnFlowerToBasket}
            onClearAllBouquet={handleClearAllBouquet}
            onProceedToCard={() => setCurrentPhase(3)}
            onBackToGarden={() => setCurrentPhase(1)}
          />
        )}

        {/* PHASE 3: Greeting Card & Doodle */}
        {currentPhase === 3 && (
          <CardEditor
            card={card}
            onChangeCard={setCard}
            onOpenExport={() => setIsExportOpen(true)}
            onBackToBouquet={() => setCurrentPhase(2)}
          />
        )}
      </main>

      {/* Footer copyright */}
      <footer className="border-t border-[#ECE5D8] py-4 px-6 text-center text-xs text-[#828F7C] bg-[#F9F7F2]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <span>靜綻花語 Blooming Bouquet · 療癒系 2D 互動花田與花束工坊</span>
          <div className="flex items-center gap-3">
            <span>四大時段循環</span>
            <span>·</span>
            <span>手作紙感</span>
            <span>·</span>
            <span>心意傳遞</span>
          </div>
        </div>
      </footer>
        </>
      )}

      {/* Modals */}
      <DiyFlowerModal
        isOpen={isDiyOpen}
        onClose={() => setIsDiyOpen(false)}
        onSaveFlower={handleSaveDiyFlower}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        bouquetItems={bouquetItems}
        wrapping={wrapping}
        ribbon={ribbon}
        card={card}
      />
    </div>
  );
}
