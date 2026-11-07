import React, { useState, useRef, useEffect } from 'react';
import { 
  Move, RotateCw, ZoomIn, ZoomOut, ArrowUp, ArrowDown, 
  Trash2, Copy, FlipHorizontal, Palette, Sparkles, 
  Layers, Upload, Tag, ArrowRight, ArrowLeft, RefreshCw,
  ChevronsUp, ChevronsDown
} from 'lucide-react';
import { 
  HarvestedFlower, BouquetItem, WrappingConfig, 
  RibbonConfig, CardConfig 
} from '../../types';

interface BouquetCanvasProps {
  harvestedFlowers: HarvestedFlower[];
  bouquetItems: BouquetItem[];
  wrapping: WrappingConfig;
  ribbon: RibbonConfig;
  card: CardConfig;
  onChangeBouquetItems: (items: BouquetItem[]) => void;
  onChangeWrapping: (wrapping: WrappingConfig) => void;
  onChangeRibbon: (ribbon: RibbonConfig) => void;
  onUseHarvestedFlower: (flower: HarvestedFlower) => void;
  onReturnFlowerToBasket: (flower: HarvestedFlower) => void;
  onClearAllBouquet: () => void;
  onProceedToCard: () => void;
  onBackToGarden: () => void;
}

export const BouquetCanvas: React.FC<BouquetCanvasProps> = ({
  harvestedFlowers,
  bouquetItems,
  wrapping,
  ribbon,
  card,
  onChangeBouquetItems,
  onChangeWrapping,
  onChangeRibbon,
  onUseHarvestedFlower,
  onReturnFlowerToBasket,
  onClearAllBouquet,
  onProceedToCard,
  onBackToGarden,
}) => {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flowers' | 'wrapping' | 'ribbon'>('flowers');
  const [isDragging, setIsDragging] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dragStartRef = useRef<{ x: number; y: number; itemX: number; itemY: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Automatically keep the last flower selected so the toolbar stays persistently visible
  useEffect(() => {
    if (bouquetItems.length > 0) {
      if (!selectedItemId || !bouquetItems.some((b) => b.id === selectedItemId)) {
        setSelectedItemId(bouquetItems[bouquetItems.length - 1].id);
      }
    } else {
      setSelectedItemId(null);
    }
  }, [bouquetItems, selectedItemId]);

  const selectedItem = bouquetItems.find((item) => item.id === selectedItemId);

  // Add flower from harvest tray to canvas (consumes 1 flower from basket)
  const handleAddFlowerToBouquet = (flower: HarvestedFlower) => {
    const newItem: BouquetItem = {
      id: `item_${flower.id}_${Date.now()}`,
      flowerTypeId: flower.flowerTypeId,
      name: flower.name,
      assetUrl: flower.assetUrl,
      originalHarvestFlower: flower,
      x: 180 + (Math.random() * 40 - 20),
      y: 200 + (Math.random() * 40 - 20),
      scale: 1.0,
      rotation: Math.round(Math.random() * 30 - 15),
      zIndex: bouquetItems.length > 0 ? Math.max(...bouquetItems.map((b) => b.zIndex)) + 1 : 10,
      flipped: false,
    };
    onChangeBouquetItems([...bouquetItems, newItem]);
    setSelectedItemId(newItem.id);
    onUseHarvestedFlower(flower);
  };

  // Dragging handlers for selected flower
  const handleMouseDown = (e: React.MouseEvent, itemId: string) => {
    e.stopPropagation();
    setSelectedItemId(itemId);
    const item = bouquetItems.find((b) => b.id === itemId);
    if (!item) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      itemX: item.x,
      itemY: item.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent, itemId: string) => {
    e.stopPropagation();
    setSelectedItemId(itemId);
    const item = bouquetItems.find((b) => b.id === itemId);
    if (!item || !e.touches[0]) return;

    setIsDragging(true);
    dragStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      itemX: item.x,
      itemY: item.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStartRef.current || !selectedItemId) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    onChangeBouquetItems(
      bouquetItems.map((item) =>
        item.id === selectedItemId
          ? {
              ...item,
              x: Math.round(dragStartRef.current!.itemX + deltaX),
              y: Math.round(dragStartRef.current!.itemY + deltaY),
            }
          : item
      )
    );
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !dragStartRef.current || !selectedItemId || !e.touches[0]) return;
    const deltaX = e.touches[0].clientX - dragStartRef.current.x;
    const deltaY = e.touches[0].clientY - dragStartRef.current.y;

    onChangeBouquetItems(
      bouquetItems.map((item) =>
        item.id === selectedItemId
          ? {
              ...item,
              x: Math.round(dragStartRef.current!.itemX + deltaX),
              y: Math.round(dragStartRef.current!.itemY + deltaY),
            }
          : item
      )
    );
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    dragStartRef.current = null;
  };

  // Transformation actions on selected flower
  const updateSelectedItem = (updater: (item: BouquetItem) => BouquetItem) => {
    if (!selectedItemId) return;
    onChangeBouquetItems(
      bouquetItems.map((b) => (b.id === selectedItemId ? updater(b) : b))
    );
  };

  const handleRotate = (delta: number) => {
    updateSelectedItem((item) => ({
      ...item,
      rotation: Math.max(-180, Math.min(180, item.rotation + delta)),
    }));
  };

  const handleScale = (delta: number) => {
    updateSelectedItem((item) => ({
      ...item,
      scale: Math.max(0.4, Math.min(2.2, parseFloat((item.scale + delta).toFixed(2)))),
    }));
  };

  const handleFlip = () => {
    updateSelectedItem((item) => ({
      ...item,
      flipped: !item.flipped,
    }));
  };

  // Re-index all bouquet items to guarantee sequential, clean zIndex (10, 11, 12, ...)
  const normalizeZIndexes = (items: BouquetItem[]): BouquetItem[] => {
    const sorted = [...items].sort((a, b) => a.zIndex - b.zIndex);
    return sorted.map((item, idx) => ({ ...item, zIndex: 10 + idx }));
  };

  // Delete specific flower from layer list or canvas
  const handleDeleteItem = (itemId: string) => {
    const itemToDelete = bouquetItems.find((b) => b.id === itemId);
    if (itemToDelete?.originalHarvestFlower) {
      onReturnFlowerToBasket(itemToDelete.originalHarvestFlower);
    }
    const remaining = bouquetItems.filter((b) => b.id !== itemId);
    onChangeBouquetItems(normalizeZIndexes(remaining));
    setSelectedItemId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
  };

  const handleDelete = () => {
    if (!selectedItemId) return;
    handleDeleteItem(selectedItemId);
  };

  // Move layer forward (towards front/top)
  const handleMoveLayerUp = (itemId: string) => {
    // In descending order: list[0] is top. Moving up means moving closer to index 0.
    const sorted = [...bouquetItems].sort((a, b) => b.zIndex - a.zIndex);
    const idx = sorted.findIndex((b) => b.id === itemId);
    if (idx > 0) {
      const temp = sorted[idx];
      sorted[idx] = sorted[idx - 1];
      sorted[idx - 1] = temp;
      const reindexed = sorted.reverse().map((item, i) => ({ ...item, zIndex: 10 + i }));
      onChangeBouquetItems(reindexed);
      setSelectedItemId(itemId);
    }
  };

  // Move layer backward (towards bottom/back)
  const handleMoveLayerDown = (itemId: string) => {
    const sorted = [...bouquetItems].sort((a, b) => b.zIndex - a.zIndex);
    const idx = sorted.findIndex((b) => b.id === itemId);
    if (idx >= 0 && idx < sorted.length - 1) {
      const temp = sorted[idx];
      sorted[idx] = sorted[idx + 1];
      sorted[idx + 1] = temp;
      const reindexed = sorted.reverse().map((item, i) => ({ ...item, zIndex: 10 + i }));
      onChangeBouquetItems(reindexed);
      setSelectedItemId(itemId);
    }
  };

  // Bring to Top (front-most)
  const handleBringToTop = (itemId: string) => {
    const item = bouquetItems.find((b) => b.id === itemId);
    if (!item) return;
    const others = bouquetItems.filter((b) => b.id !== itemId).sort((a, b) => a.zIndex - b.zIndex);
    const reindexed = [...others, item].map((b, i) => ({ ...b, zIndex: 10 + i }));
    onChangeBouquetItems(reindexed);
    setSelectedItemId(itemId);
  };

  // Send to Bottom (back-most)
  const handleSendToBottom = (itemId: string) => {
    const item = bouquetItems.find((b) => b.id === itemId);
    if (!item) return;
    const others = bouquetItems.filter((b) => b.id !== itemId).sort((a, b) => a.zIndex - b.zIndex);
    const reindexed = [item, ...others].map((b, i) => ({ ...b, zIndex: 10 + i }));
    onChangeBouquetItems(reindexed);
    setSelectedItemId(itemId);
  };

  const handleDuplicate = () => {
    if (!selectedItem) return;
    // Check if there is an unused flower of this type in harvestedFlowers
    const matchingAvailable = harvestedFlowers.find(
      (f) => f.flowerTypeId === selectedItem.flowerTypeId
    );
    if (!matchingAvailable) {
      showToast(`花籃中已無多餘的「${selectedItem.name}」囉！每朵採收的花朵僅能使用一次，請返回花田採收更多花朵。`);
      return;
    }
    handleAddFlowerToBouquet(matchingAvailable);
  };

  // Clear all design and return all flowers back to harvested basket
  const handleClearAllDesign = () => {
    if (bouquetItems.length === 0) return;
    onClearAllBouquet();
    setSelectedItemId(null);
    setShowClearConfirm(false);
    showToast('已刪除花束所有設計，花朵已全數退回採收花材庫！');
  };

  const handleBringToFront = () => {
    if (!selectedItemId) return;
    handleBringToTop(selectedItemId);
  };

  const handleSendToBack = () => {
    if (!selectedItemId) return;
    handleSendToBottom(selectedItemId);
  };

  // Custom pattern upload handler
  const handleCustomPatternUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('請上傳 JPG 或 PNG 圖檔喔！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChangeWrapping({
          ...wrapping,
          middlePattern: 'custom',
          customPatternUrl: result,
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Color options
  const wrappingPaperColors = [
    { name: '經典牛皮', hex: '#D2BBA0', outerHex: '#BFA487' },
    { name: '鼠尾草綠', hex: '#A3B899', outerHex: '#8E9F85' },
    { name: '法式奶油', hex: '#FAF6E9', outerHex: '#ECE5D0' },
    { name: '霧粉玫瑰', hex: '#EBB4BC', outerHex: '#DC9DA6' },
    { name: '靜謐深藍', hex: '#4A5B7A', outerHex: '#3A4861' },
    { name: '薰衣草紫', hex: '#C5BDD8', outerHex: '#ADA4C4' },
    { name: '復古磚紅', hex: '#C47070', outerHex: '#AD5959' },
  ];

  const ribbonColors = [
    { name: '香檳米白', hex: '#FAF3E0' },
    { name: '法式墨綠', hex: '#3B4D3C' },
    { name: '乾燥玫瑰', hex: '#D9828F' },
    { name: '優雅霧金', hex: '#D4AF37' },
    { name: '純白蕾絲', hex: '#FFFFFF' },
    { name: '深焙咖啡', hex: '#543D2B' },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#DFD7C7] shadow-xs">
        <button
          onClick={onBackToGarden}
          className="flex items-center gap-1.5 text-xs text-[#586650] hover:text-[#2E3A2A] px-3 py-1.5 rounded-lg hover:bg-[#F2ECE1] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回花田補採</span>
        </button>

        <div className="flex items-center gap-2">
          {bouquetItems.length > 0 && (
            !showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1.5 text-xs text-red-700 hover:text-red-800 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                title="清空目前花束上的所有花朵並全數退回採收籃"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>刪除所有設計</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-200 animate-fade-in">
                <button
                  onClick={handleClearAllDesign}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  確認刪除全花束
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="bg-white hover:bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-lg transition-colors cursor-pointer border border-gray-200"
                >
                  取消
                </button>
              </div>
            )
          )}

          <div className="text-xs text-[#6B7963] font-medium hidden md:block">
            💡 點選畫面中的花朵即可隨時調節旋轉、縮放與圖層前後
          </div>
        </div>

        <button
          onClick={onProceedToCard}
          className="flex items-center gap-1.5 text-xs font-semibold bg-[#55694C] hover:bg-[#43533C] text-white px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <span>下一步：撰寫心意賀卡</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* LEFT COLUMN (lg:col-span-3): Flower Layers Manager Panel */}
        <div className="lg:col-span-3 bg-[#FAF8F5] border border-[#DDD5C5] rounded-3xl p-3.5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#ECE5D8]">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#384831]">
              <Layers className="w-4 h-4 text-[#55694C]" />
              <span>花朵圖層清單 ({bouquetItems.length})</span>
            </div>
            <span className="text-[10px] text-[#7A8A73]">上層在前 · 下層在後</span>
          </div>

          {bouquetItems.length === 0 ? (
            <div className="text-center py-10 px-2 space-y-1.5 border border-dashed border-[#DCD5C5] rounded-2xl bg-white/50">
              <Layers className="w-6 h-6 mx-auto text-[#96A88E] opacity-60" />
              <p className="text-xs font-medium text-[#4B5E44]">尚未放入任何花材</p>
              <p className="text-[10px] text-[#7E8F77]">
                請從右側「採收花材庫」點擊花材加入花束，此處即可直接查看與調控圖層前後順序！
              </p>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-0.5">
              {[...bouquetItems]
                .sort((a, b) => b.zIndex - a.zIndex) // descending: top layer at the top
                .map((item, idx, arr) => {
                  const isSelected = item.id === selectedItemId;
                  const isTop = idx === 0;
                  const isBottom = idx === arr.length - 1;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedItemId(item.id)}
                      className={`group relative p-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-1.5 ${
                        isSelected
                          ? 'bg-[#EBF2E8] border-[#55694C] shadow-xs ring-1 ring-[#55694C]/40'
                          : 'bg-white hover:bg-[#F5EFE6] border-[#E2DAD0]'
                      }`}
                    >
                      {/* Left: Thumbnail & Name */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-[#E4DDCF] text-[#4A5B43]">
                          #{idx + 1}
                        </span>
                        <img
                          src={item.assetUrl}
                          alt={item.name}
                          className="w-8 h-10 object-contain drop-shadow-2xs flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-[#303E2B] truncate max-w-[70px]">
                            {item.name}
                          </p>
                          <p className="text-[9px] text-[#7A8B73]">
                            {isTop ? '頂層 (最前)' : isBottom ? '底層 (最後)' : `圖層 #${idx + 1}`}
                          </p>
                        </div>
                      </div>

                      {/* Right: Quick layer actions */}
                      <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleMoveLayerUp(item.id)}
                          disabled={isTop}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-[#E2DACB] disabled:opacity-25 disabled:cursor-not-allowed border border-[#D5CCBA] text-[#4F6048] flex items-center justify-center transition-colors cursor-pointer"
                          title="圖層向前移一層"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleMoveLayerDown(item.id)}
                          disabled={isBottom}
                          className="w-6 h-6 rounded-lg bg-white hover:bg-[#E2DACB] disabled:opacity-25 disabled:cursor-not-allowed border border-[#D5CCBA] text-[#4F6048] flex items-center justify-center transition-colors cursor-pointer"
                          title="圖層向後移一層"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="w-6 h-6 rounded-lg hover:bg-red-100 text-red-500 hover:text-red-700 flex items-center justify-center transition-colors cursor-pointer"
                          title="從花束中移除並退回花籃"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Main Bouquet Assembly Canvas (Center) */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            ref={canvasRef}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="relative w-[420px] max-w-full h-[560px] rounded-3xl bg-paper-texture border-2 border-[#D8CEBC] shadow-xl overflow-hidden select-none"
          >
            {/* Background Texture / Desk atmosphere */}
            <div className="absolute inset-0 bg-radial from-transparent via-[#F2ECE1]/50 to-[#E8E0D2] pointer-events-none" />

            {/* 1. LAYER 2: Inner Wrapping Sheet (Behind flowers) */}
            <div
              className="absolute bottom-16 left-1/2 -translate-x-1/2 w-[310px] h-[360px] pointer-events-none transition-all duration-300"
              style={{
                zIndex: 2,
                opacity: wrapping.innerOpacity,
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 85%, 65% 100%, 35% 100%, 0% 85%)',
                backgroundColor: wrapping.innerColor,
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.06))',
              }}
            />

            {/* 2. LAYER 4: Middle Wrapping Paper Structure (Main body contour) */}
            <div
              className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[280px] h-[320px] pointer-events-none transition-all duration-300"
              style={{
                zIndex: 4,
                clipPath: 'polygon(10% 0%, 90% 0%, 80% 90%, 60% 100%, 40% 100%, 20% 90%)',
                backgroundColor: wrapping.middleColor,
                backgroundImage:
                  wrapping.middlePattern === 'custom' && wrapping.customPatternUrl
                    ? `url(${wrapping.customPatternUrl})`
                    : wrapping.middlePattern === 'stripes'
                    ? 'repeating-linear-gradient(45deg, rgba(255,255,255,0.2) 0, rgba(255,255,255,0.2) 10px, transparent 10px, transparent 20px)'
                    : wrapping.middlePattern === 'dots'
                    ? 'radial-gradient(rgba(255,255,255,0.3) 2px, transparent 2px)'
                    : wrapping.middlePattern === 'grid'
                    ? 'linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)'
                    : undefined,
                backgroundSize:
                  wrapping.middlePattern === 'dots' ? '14px 14px' : wrapping.middlePattern === 'grid' ? '16px 16px' : 'cover',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.12))',
              }}
            />

            {/* 3. LAYER 5: Flowers Objects */}
            {[...bouquetItems]
              .sort((a, b) => a.zIndex - b.zIndex)
              .map((item) => {
                const isSelected = item.id === selectedItemId;
                return (
                  <div
                    key={item.id}
                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                    onTouchStart={(e) => handleTouchStart(e, item.id)}
                    className="absolute cursor-move transition-shadow"
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      transform: `translate(-50%, -50%) rotate(${item.rotation}deg) scale(${item.scale}) ${
                        item.flipped ? 'scaleX(-1)' : ''
                      }`,
                      zIndex: item.zIndex + 10,
                    }}
                  >
                    <div
                      className={`relative p-1 rounded-xl transition-all ${
                        isSelected
                          ? 'ring-2 ring-[#4B6140] ring-offset-2 ring-offset-transparent bg-white/20 shadow-md'
                          : 'hover:opacity-95'
                      }`}
                    >
                      <img
                        src={item.assetUrl}
                        alt={item.name}
                        draggable={false}
                        className="w-24 md:w-28 h-38 md:h-44 object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)] pointer-events-none"
                      />
                    </div>
                  </div>
                );
              })}

            {/* 4. LAYER 6: Outer Wrapping Paper (Folded lapels in front of flower stems) */}
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[240px] h-[230px] pointer-events-none transition-all duration-300"
              style={{
                zIndex: 40,
                clipPath:
                  wrapping.outerStyle === 'folded'
                    ? 'polygon(0% 25%, 35% 0%, 50% 30%, 65% 0%, 100% 25%, 75% 100%, 25% 100%)'
                    : wrapping.outerStyle === 'wave'
                    ? 'polygon(0% 15%, 50% 35%, 100% 15%, 80% 100%, 20% 100%)'
                    : 'polygon(0% 20%, 50% 10%, 100% 20%, 70% 100%, 30% 100%)',
                backgroundColor: wrapping.outerColor,
                filter: 'drop-shadow(0 -4px 12px rgba(0,0,0,0.15))',
              }}
            >
              {/* Embossed Paper Fold Lines */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/20" />
            </div>

            {/* 5. LAYER 7: Ribbon & Bow & Tag */}
            {ribbon.type !== 'none' && (
              <div
                className="absolute bottom-28 left-1/2 -translate-x-1/2 pointer-events-none flex flex-col items-center"
                style={{ zIndex: 45 }}
              >
                {/* Ribbon Bow SVG */}
                <div
                  className="w-28 h-20 filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.25)] flex items-center justify-center"
                  style={{ color: ribbon.color }}
                >
                  {ribbon.type === 'silk' && (
                    <svg viewBox="0 0 100 60" className="w-full h-full fill-current">
                      {/* Left wing */}
                      <ellipse cx="25" cy="25" rx="22" ry="14" transform="rotate(-20 25 25)" />
                      {/* Right wing */}
                      <ellipse cx="75" cy="25" rx="22" ry="14" transform="rotate(20 75 25)" />
                      {/* Tails */}
                      <path d="M 45 30 Q 30 55 20 60 Q 35 48 48 35 Z" opacity="0.9" />
                      <path d="M 55 30 Q 70 55 80 60 Q 65 48 52 35 Z" opacity="0.9" />
                      {/* Knot */}
                      <circle cx="50" cy="27" r="8" fill="#FBF7EE" opacity="0.2" />
                      <circle cx="50" cy="27" r="7" />
                    </svg>
                  )}
                  {ribbon.type === 'raffia' && (
                    <svg viewBox="0 0 100 60" className="w-full h-full stroke-current fill-none" strokeWidth="3">
                      <path d="M 20 25 Q 40 10 50 28 Q 60 10 80 25 Q 70 45 50 30 Q 30 45 20 25" />
                      <path d="M 48 30 Q 35 55 30 60" strokeWidth="2.5" />
                      <path d="M 52 30 Q 65 55 70 60" strokeWidth="2.5" />
                    </svg>
                  )}
                  {ribbon.type === 'lace' && (
                    <svg viewBox="0 0 100 60" className="w-full h-full fill-current opacity-90">
                      <ellipse cx="28" cy="26" rx="20" ry="12" stroke="#DDD" strokeWidth="1" strokeDasharray="2,2" />
                      <ellipse cx="72" cy="26" rx="20" ry="12" stroke="#DDD" strokeWidth="1" strokeDasharray="2,2" />
                      <circle cx="50" cy="26" r="6" />
                    </svg>
                  )}
                  {ribbon.type === 'velvet' && (
                    <svg viewBox="0 0 100 60" className="w-full h-full fill-current">
                      <rect x="15" y="18" width="70" height="14" rx="7" />
                      <path d="M 40 30 L 30 58 L 42 52 L 46 30 Z" />
                      <path d="M 60 30 L 70 58 L 58 52 L 54 30 Z" />
                      <circle cx="50" cy="25" r="9" />
                    </svg>
                  )}
                </div>

                {/* Kraft Hanging Tag */}
                {ribbon.hasTag && (
                  <div className="relative -mt-2 bg-kraft-texture border border-[#BFA487] text-[#4A3B2C] px-3 py-1 rounded-sm shadow-sm rotate-[-8deg] flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7D634C] mr-0.5" />
                    <span className="font-serif-tc text-[11px] font-semibold tracking-wider">
                      {ribbon.tagText || 'For You'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Canvas Floating Transform Toolbar (when a flower is selected) */}
          {selectedItem && (
            <div className="mt-3 bg-white/95 backdrop-blur-md border border-[#DDD5C5] rounded-2xl p-2.5 px-4 shadow-lg flex flex-wrap items-center gap-3 text-xs">
              <span className="font-semibold text-[#3D4C38] truncate max-w-[90px]">
                {selectedItem.name}
              </span>

              <div className="h-4 w-[1px] bg-[#DDD]" />

              {/* Rotate Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleRotate(-15)}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="逆時針旋轉"
                >
                  <RotateCw className="w-3.5 h-3.5 -scale-x-100" />
                </button>
                <span className="font-mono text-[11px] text-[#71806C] w-8 text-center">
                  {selectedItem.rotation}°
                </span>
                <button
                  onClick={() => handleRotate(15)}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="順時針旋轉"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-[#DDD]" />

              {/* Scale Controls */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleScale(-0.1)}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="縮小"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] text-[#71806C] w-7 text-center">
                  {selectedItem.scale}x
                </span>
                <button
                  onClick={() => handleScale(0.1)}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="放大"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="h-4 w-[1px] bg-[#DDD]" />

              {/* Layer & Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMoveLayerUp(selectedItem.id)}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="向前移一層 (圖層上移)"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMoveLayerDown(selectedItem.id)}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="向後移一層 (圖層下移)"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleBringToFront}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="置於最頂層"
                >
                  <ChevronsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleSendToBack}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="置於最底層"
                >
                  <ChevronsDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleFlip}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="水平翻轉"
                >
                  <FlipHorizontal className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDuplicate}
                  className="p-1.5 rounded-lg hover:bg-[#EFE9DD] text-[#55634F] cursor-pointer"
                  title="複製花朵"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg hover:bg-[#FEE2E2] text-red-600 cursor-pointer"
                  title="刪除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Side Controls & Materials Drawer (Right) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Tab Selector */}
          <div className="flex bg-[#EFE8DD] p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('flowers')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'flowers'
                  ? 'bg-white text-[#384831] shadow-xs'
                  : 'text-[#6A7863] hover:text-[#2F3D2A]'
              }`}
            >
              <span>🌸 採收花材庫</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-[#E2DACB] rounded-full">
                {harvestedFlowers.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('wrapping')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'wrapping'
                  ? 'bg-white text-[#384831] shadow-xs'
                  : 'text-[#6A7863] hover:text-[#2F3D2A]'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              <span>三層包裝紙</span>
            </button>
            <button
              onClick={() => setActiveTab('ribbon')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'ribbon'
                  ? 'bg-white text-[#384831] shadow-xs'
                  : 'text-[#6A7863] hover:text-[#2F3D2A]'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>緞帶與吊牌</span>
            </button>
          </div>

          {/* TAB 1: Harvested Flowers Tray */}
          {activeTab === 'flowers' && (
            <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#ECE5D8]">
                <h3 className="font-serif-tc text-sm font-semibold text-[#384831]">
                  點擊花材加入花束
                </h3>
                <span className="text-xs text-[#7B8B74]">
                  剩餘可使用 {harvestedFlowers.length} 朵（已插 {bouquetItems.length} 朵）
                </span>
              </div>

              {harvestedFlowers.length === 0 ? (
                <div className="text-center py-8 text-xs text-[#8E9B87] space-y-1.5">
                  <p className="font-medium text-[#55694C]">花籃中的花材已全數放入花束囉！</p>
                  <p className="text-[11px] text-[#7A8A73]">
                    每朵採收的花材僅能使用一次。若想加入更多花朵，請點擊上方「返回花田補採」採收！
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2.5 max-h-[360px] overflow-y-auto p-1">
                  {harvestedFlowers.map((flower) => (
                    <button
                      key={flower.id}
                      onClick={() => handleAddFlowerToBouquet(flower)}
                      className="flex flex-col items-center p-2.5 rounded-xl bg-white hover:bg-[#F2ECE1] border border-[#E0D8C8] hover:border-[#96A88E] transition-all cursor-pointer shadow-2xs group"
                    >
                      <img
                        src={flower.assetUrl}
                        alt={flower.name}
                        className="w-14 h-20 object-contain group-hover:scale-105 transition-transform"
                      />
                      <span className="text-xs font-semibold text-[#384831] truncate w-full text-center mt-1">
                        {flower.name}
                      </span>
                      <span className="text-[10px] text-[#7A8A73] truncate w-full text-center">
                        {flower.meaning}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 3-Layer Wrapping Paper */}
          {activeTab === 'wrapping' && (
            <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-2xl p-4 shadow-xs space-y-4">
              {/* Outer Layer Color Presets */}
              <div>
                <label className="text-xs font-semibold text-[#3D4C38] block mb-2">
                  包裝紙主色調（外層立體摺角）
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {wrappingPaperColors.map((p) => (
                    <button
                      key={p.name}
                      onClick={() =>
                        onChangeWrapping({
                          ...wrapping,
                          middleColor: p.hex,
                          outerColor: p.outerHex,
                        })
                      }
                      className={`flex flex-col items-center p-2 rounded-xl border text-xs transition-all cursor-pointer ${
                        wrapping.middleColor === p.hex
                          ? 'border-[#4E6344] bg-white ring-2 ring-[#4E6344]/30 font-semibold shadow-xs'
                          : 'border-[#E2D8C6] bg-white/70 hover:bg-white text-[#55634F]'
                      }`}
                    >
                      <div
                        className="w-7 h-7 rounded-full border border-black/10 shadow-inner mb-1"
                        style={{ backgroundColor: p.hex }}
                      />
                      <span className="text-[11px] truncate">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Middle Layer Patterns & Custom Pattern Upload */}
              <div className="pt-2 border-t border-[#ECE5D8]">
                <label className="text-xs font-semibold text-[#3D4C38] block mb-2">
                  包裝紙圖樣紋理（中層主體）
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { id: 'solid', label: '素色純粹' },
                    { id: 'stripes', label: '法式細條紋' },
                    { id: 'dots', label: '輕盈波點' },
                    { id: 'grid', label: '文藝格紋' },
                  ].map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() =>
                        onChangeWrapping({
                          ...wrapping,
                          middlePattern: pat.id as any,
                        })
                      }
                      className={`px-3 py-1.5 rounded-lg text-xs border transition-all cursor-pointer ${
                        wrapping.middlePattern === pat.id
                          ? 'bg-[#55694C] text-white border-[#55694C] font-medium shadow-xs'
                          : 'bg-white text-[#52634C] border-[#DDD3C2] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      {pat.label}
                    </button>
                  ))}
                </div>

                {/* Custom Upload Button */}
                <div className="p-3 rounded-xl bg-white border border-dashed border-[#CFC5B2] flex flex-col items-center text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg"
                    onChange={handleCustomPatternUpload}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#485941] bg-[#EFE8DD] hover:bg-[#E4DCCF] px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer mb-1 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>上傳自訂包裝圖樣 (JPG / PNG)</span>
                  </button>
                  <p className="text-[10px] text-[#7E8F77]">
                    建議使用正方形平鋪花紋圖片，獲得最佳包裝效果
                  </p>
                  {wrapping.customPatternUrl && (
                    <div className="flex items-center gap-2 mt-2">
                      <img
                        src={wrapping.customPatternUrl}
                        alt="自訂圖樣預覽"
                        className="w-8 h-8 rounded object-cover border border-[#C5BBA7]"
                      />
                      <span className="text-xs text-[#4F6047]">已套用自訂圖樣</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Outer Style selection */}
              <div className="pt-2 border-t border-[#ECE5D8]">
                <label className="text-xs font-semibold text-[#3D4C38] block mb-2">
                  外層立體摺法造型
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'folded', label: '雙翼立體摺角' },
                    { id: 'classic', label: '經典法式包覆' },
                    { id: 'wave', label: '柔和弧度波浪' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() =>
                        onChangeWrapping({
                          ...wrapping,
                          outerStyle: s.id as any,
                        })
                      }
                      className={`p-2 rounded-xl text-xs text-center border transition-all cursor-pointer ${
                        wrapping.outerStyle === s.id
                          ? 'bg-[#E3EBDD] text-[#32452A] border-[#69825F] font-semibold shadow-xs'
                          : 'bg-white text-[#52634C] border-[#DDD3C2] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Ribbon & Accessories */}
          {activeTab === 'ribbon' && (
            <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-2xl p-4 shadow-xs space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#3D4C38] block mb-2">
                  緞帶與繫繩風格
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'silk', label: '法式雙蝶絲帶' },
                    { id: 'raffia', label: '手作天然麻繩' },
                    { id: 'lace', label: '浪漫鏤空蕾絲' },
                    { id: 'velvet', label: '復古暖絨繫帶' },
                    { id: 'none', label: '不加緞帶 (簡約)' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() =>
                        onChangeRibbon({
                          ...ribbon,
                          type: r.id as any,
                        })
                      }
                      className={`p-2.5 rounded-xl text-xs border transition-all cursor-pointer text-center ${
                        ribbon.type === r.id
                          ? 'bg-[#E3EBDD] text-[#32452A] border-[#69825F] font-semibold shadow-xs'
                          : 'bg-white text-[#52634C] border-[#DDD3C2] hover:bg-[#F3EDE2]'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {ribbon.type !== 'none' && (
                <>
                  {/* Ribbon Color */}
                  <div className="pt-2 border-t border-[#ECE5D8]">
                    <label className="text-xs font-semibold text-[#3D4C38] block mb-2">
                      緞帶色彩
                    </label>
                    <div className="grid grid-cols-6 gap-2">
                      {ribbonColors.map((rc) => (
                        <button
                          key={rc.name}
                          onClick={() =>
                            onChangeRibbon({
                              ...ribbon,
                              color: rc.hex,
                            })
                          }
                          title={rc.name}
                          className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                            ribbon.color === rc.hex
                              ? 'border-[#364830] scale-110 shadow-xs'
                              : 'border-white hover:scale-105'
                          }`}
                          style={{ backgroundColor: rc.hex }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Hanging Kraft Tag */}
                  <div className="pt-2 border-t border-[#ECE5D8]">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-semibold text-[#3D4C38]">
                        花束專屬牛皮吊牌
                      </label>
                      <input
                        type="checkbox"
                        checked={ribbon.hasTag}
                        onChange={(e) =>
                          onChangeRibbon({
                            ...ribbon,
                            hasTag: e.target.checked,
                          })
                        }
                        className="w-4 h-4 accent-[#55694C] cursor-pointer"
                      />
                    </div>
                    {ribbon.hasTag && (
                      <div>
                        <input
                          type="text"
                          value={ribbon.tagText}
                          onChange={(e) =>
                            onChangeRibbon({
                              ...ribbon,
                              tagText: e.target.value,
                            })
                          }
                          maxLength={12}
                          placeholder="例如: For You / 唯願安好"
                          className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5CDBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#55694C]"
                        />
                        <span className="text-[10px] text-[#7A8A73] mt-1 block">
                          可輸入 12 字以內的刻印心意
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D3A29]/95 backdrop-blur-md text-amber-100 px-4 py-2.5 rounded-2xl border border-[#74876C] text-xs font-semibold shadow-xl flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
