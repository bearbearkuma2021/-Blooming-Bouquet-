export type TimePeriod = 'DAY' | 'SUNSET' | 'NIGHT' | 'DAWN';

export type WeatherEvent = 'NONE' | 'RAIN' | 'RAINBOW' | 'FOX' | 'METEOR';

export type GrowthState = 'SPROUT' | 'BUD' | 'BLOOMING';

export interface FlowerType {
  id: string;
  name: string;
  englishName: string;
  color: string;
  meaning: string;
  category: 'flower' | 'foliage' | 'diy';
  assetUrl: string; // SVG or image URL
  previewSvg?: string;
  isCustom?: boolean;
}

export interface GardenFlower {
  id: string;
  flowerTypeId: string;
  name: string;
  plantedAt: number; // timestamp
  growthDurationMs: number; // default ~120,000ms (2 minutes)
  isHarvested: boolean;
  slotIndex: number;
  xPercent: number; // 0-100 relative to field
  yPercent: number; // 0-100 relative to field
  scale: number;
  isBackground: boolean;
  customAssetUrl?: string;
}

export interface HarvestedFlower {
  id: string;
  flowerTypeId: string;
  name: string;
  assetUrl: string;
  color: string;
  meaning: string;
  harvestedAt: number;
}

export interface BouquetItem {
  id: string;
  flowerTypeId: string;
  name: string;
  assetUrl: string;
  x: number; // canvas relative px
  y: number;
  scale: number;
  rotation: number; // degrees
  zIndex: number;
  flipped: boolean;
  originalHarvestFlower?: HarvestedFlower;
}

export interface WrappingConfig {
  innerColor: string;
  innerOpacity: number;
  middleColor: string;
  middlePattern: 'solid' | 'kraft' | 'stripes' | 'dots' | 'grid' | 'custom';
  customPatternUrl?: string;
  outerColor: string;
  outerStyle: 'classic' | 'folded' | 'wave' | 'minimal';
}

export interface RibbonConfig {
  type: 'silk' | 'raffia' | 'lace' | 'velvet' | 'none';
  color: string;
  hasTag: boolean;
  tagText: string;
}

export interface CardConfig {
  enabled: boolean;
  style: 'kraft' | 'white' | 'pressed-flower' | 'parchment';
  title: string;
  message: string;
  font: 'serif' | 'display' | 'handwriting';
  fontSize: number;
  textColor: string;
  textAlign: 'left' | 'center' | 'right';
  doodleDataUrl?: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
}

export type AppPhase = 1 | 2 | 3; // 1: 花田採收, 2: 花束組裝, 3: 賀卡導出
