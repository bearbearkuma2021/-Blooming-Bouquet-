import React, { useState } from 'react';
import { ShoppingBag, Trash2, ArrowRight, Sparkles, X, Info } from 'lucide-react';
import { HarvestedFlower } from '../../types';

interface HarvestBasketPreviewProps {
  harvestedFlowers: HarvestedFlower[];
  onDeleteFlower: (flowerId: string) => void;
  onClearBasket: () => void;
  onProceedToBouquet: () => void;
}

export const HarvestBasketPreview: React.FC<HarvestBasketPreviewProps> = ({
  harvestedFlowers,
  onDeleteFlower,
  onClearBasket,
  onProceedToBouquet,
}) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const count = harvestedFlowers.length;
  const maxCount = 50;
  const canProceed = count >= 3;

  return (
    <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-[#E2DAD0] rounded-3xl p-4 md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#ECE5D9]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#E5DECD] text-[#4F6344] flex items-center justify-center shadow-2xs">
            <ShoppingBag className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif-tc text-base font-semibold text-[#344230]">
                採收花籃預覽
              </h3>
              <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-[#E8EFE5] text-[#344E29] border border-[#CCDBC8]">
                {count} / {maxCount} 朵
              </span>
            </div>
            <p className="text-xs text-[#73826C]">
              目前花籃中保存的花卉，可點擊個別花朵右上角「✕」刪除不要的花
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {count > 0 && (
            !showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="flex items-center gap-1 text-xs text-[#991B1B] hover:text-red-700 bg-red-50/80 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition-all cursor-pointer shadow-2xs"
                title="清空採收花籃"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空花籃</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-xl border border-red-200 animate-fade-in">
                <button
                  onClick={() => {
                    onClearBasket();
                    setShowClearConfirm(false);
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95"
                >
                  確認清空 ({count}朵)
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

          <button
            onClick={onProceedToBouquet}
            disabled={!canProceed}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
              canProceed
                ? 'bg-[#55694C] hover:bg-[#43533C] text-white cursor-pointer active:scale-95'
                : 'bg-[#DFD9CB] text-[#8C8373] cursor-not-allowed opacity-75'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {canProceed ? `開始包裝花束 (${count}朵)` : `尚需 ${3 - count} 朵方可組裝`}
            </span>
            {canProceed && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Capacity Progress Bar */}
      <div className="w-full bg-[#EAE2D3] h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-[#6B855D] h-full rounded-full transition-all duration-300"
          style={{ width: `${Math.min(100, (count / maxCount) * 100)}%` }}
        />
      </div>

      {/* Flower Cards Grid */}
      {count === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center space-y-2 border-2 border-dashed border-[#DDD5C5] rounded-2xl bg-white/50">
          <div className="w-12 h-12 rounded-full bg-[#F2ECE1] text-[#7A8A73] flex items-center justify-center mb-1">
            <ShoppingBag className="w-6 h-6 opacity-60" />
          </div>
          <p className="text-sm font-serif-tc font-medium text-[#4D5A47]">
            花籃目前還是空的
          </p>
          <p className="text-xs text-[#7E8E77] max-w-sm">
            請在上方花田點擊成熟的花朵採收，或點擊「一鍵採收」快速將花草收入花籃中吧！
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-[380px] overflow-y-auto p-1">
          {harvestedFlowers.map((flower) => (
            <div
              key={flower.id}
              className="relative group bg-white hover:bg-[#F9F7F2] border border-[#DDD5C5] hover:border-[#96A88E] rounded-2xl p-2.5 flex flex-col items-center justify-between shadow-2xs transition-all hover:shadow-xs"
            >
              {/* Delete button (top right) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteFlower(flower.id);
                }}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-[#FEE2E2]/80 hover:bg-red-500 hover:text-white text-red-600 flex items-center justify-center transition-all cursor-pointer shadow-xs z-10 opacity-80 group-hover:opacity-100"
                title={`刪除這朵「${flower.name}」`}
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Flower Image */}
              <div className="w-16 h-22 flex items-center justify-center my-1">
                <img
                  src={flower.assetUrl}
                  alt={flower.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform"
                />
              </div>

              {/* Flower Name & Meaning */}
              <div className="w-full text-center mt-1">
                <span className="text-[11px] font-semibold text-[#32402D] truncate block w-full">
                  {flower.name}
                </span>
                <span className="text-[9px] text-[#7B8B74] truncate block w-full mt-0.5" title={flower.meaning}>
                  {flower.meaning.split('・')[0] || flower.meaning}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
