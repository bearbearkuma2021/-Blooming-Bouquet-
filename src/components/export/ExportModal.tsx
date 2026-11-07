import React, { useRef, useState, useEffect } from 'react';
import { 
  X, Download, Share2, Sparkles, RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  BouquetItem, WrappingConfig, RibbonConfig, CardConfig 
} from '../../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  bouquetItems: BouquetItem[];
  wrapping: WrappingConfig;
  ribbon: RibbonConfig;
  card: CardConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  bouquetItems,
  wrapping,
  ribbon,
  card,
}) => {
  const exportCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '4:5'>('4:5');
  const [fileFormat, setFileFormat] = useState<'png' | 'jpeg'>('png');
  const [isRendering, setIsRendering] = useState(true);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [shareSuccess, setShareSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F48C9A', '#8A7BB3', '#84A98C', '#FBBF24', '#FAF6E9'],
      });
      renderFinalComposite();
    }
  }, [isOpen, aspectRatio, fileFormat, bouquetItems, wrapping, ribbon, card]);

  const renderFinalComposite = async () => {
    setIsRendering(true);
    const canvas = exportCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High resolution canvas dimensions
    const width = 1200;
    const height = aspectRatio === '1:1' ? 1200 : 1500;
    canvas.width = width;
    canvas.height = height;

    // 1. Draw elegant handmade paper background
    ctx.fillStyle = '#F8F6F0';
    ctx.fillRect(0, 0, width, height);

    // Subtle paper gradient / vignette
    const grad = ctx.createRadialGradient(
      width / 2,
      height / 2,
      width * 0.15,
      width / 2,
      height / 2,
      width * 0.75
    );
    grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    grad.addColorStop(1, 'rgba(235, 228, 217, 0.75)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // Subtle delicate borders
    ctx.strokeStyle = 'rgba(180, 165, 145, 0.4)';
    ctx.lineWidth = 4;
    ctx.strokeRect(30, 30, width - 60, height - 60);

    ctx.strokeStyle = 'rgba(180, 165, 145, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(42, 42, width - 84, height - 84);

    // 2. UNIFORM BOUQUET SCALING & POSITIONING
    // Editor canvas coordinate system is exactly 420px wide by 560px tall
    const BASE_W = 420;
    const BASE_H = 560;

    const isPortrait = aspectRatio === '4:5';
    // Scaling factor applied equally to X and Y (ZERO compression, ZERO distortion)
    const scaleFactor = isPortrait ? 1.95 : 1.72;
    const scaledBouquetW = BASE_W * scaleFactor;
    const scaledBouquetH = BASE_H * scaleFactor;

    const bouquetStartX = (width - scaledBouquetW) / 2;
    const bouquetStartY = isPortrait ? 40 : 25;

    ctx.save();
    ctx.translate(bouquetStartX, bouquetStartY);
    ctx.scale(scaleFactor, scaleFactor);

    // --- A. INNER WRAPPING SHEET (Z-INDEX 2) ---
    // In BouquetCanvas: left: (420-310)/2 = 55, top: 560 - 64 - 360 = 136, w: 310, h: 360
    // clipPath: polygon(15% 0%, 85% 0%, 100% 85%, 65% 100%, 35% 100%, 0% 85%)
    ctx.save();
    ctx.globalAlpha = wrapping.innerOpacity;
    ctx.fillStyle = wrapping.innerColor;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
    ctx.shadowBlur = 12;
    ctx.shadowOffsetY = 6;

    ctx.beginPath();
    ctx.moveTo(55 + 310 * 0.15, 136);
    ctx.lineTo(55 + 310 * 0.85, 136);
    ctx.lineTo(55 + 310 * 1.00, 136 + 360 * 0.85);
    ctx.lineTo(55 + 310 * 0.65, 136 + 360 * 1.00);
    ctx.lineTo(55 + 310 * 0.35, 136 + 360 * 1.00);
    ctx.lineTo(55 + 310 * 0.00, 136 + 360 * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // --- B. MIDDLE WRAPPING PAPER STRUCTURE (Z-INDEX 4) ---
    // In BouquetCanvas: left: (420-280)/2 = 70, top: 560 - 48 - 320 = 192, w: 280, h: 320
    // clipPath: polygon(10% 0%, 90% 0%, 80% 90%, 60% 100%, 40% 100%, 20% 90%)
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 10;

    ctx.beginPath();
    ctx.moveTo(70 + 280 * 0.10, 192);
    ctx.lineTo(70 + 280 * 0.90, 192);
    ctx.lineTo(70 + 280 * 0.80, 192 + 320 * 0.90);
    ctx.lineTo(70 + 280 * 0.60, 192 + 320 * 1.00);
    ctx.lineTo(70 + 280 * 0.40, 192 + 320 * 1.00);
    ctx.lineTo(70 + 280 * 0.20, 192 + 320 * 0.90);
    ctx.closePath();

    ctx.fillStyle = wrapping.middleColor;
    ctx.fill();

    // Subtle pattern overlay on middle wrapping paper if selected
    if (wrapping.middlePattern === 'stripes') {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
      ctx.lineWidth = 6;
      for (let i = -100; i < 600; i += 22) {
        ctx.beginPath();
        ctx.moveTo(i, 150);
        ctx.lineTo(i + 300, 550);
        ctx.stroke();
      }
      ctx.restore();
    } else if (wrapping.middlePattern === 'dots') {
      ctx.save();
      ctx.clip();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
      for (let x = 60; x <= 360; x += 18) {
        for (let y = 180; y <= 520; y += 18) {
          ctx.beginPath();
          ctx.arc(x, y, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    } else if (wrapping.middlePattern === 'grid') {
      ctx.save();
      ctx.clip();
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1;
      for (let x = 60; x <= 360; x += 18) {
        ctx.beginPath();
        ctx.moveTo(x, 180);
        ctx.lineTo(x, 520);
        ctx.stroke();
      }
      for (let y = 180; y <= 520; y += 18) {
        ctx.beginPath();
        ctx.moveTo(60, y);
        ctx.lineTo(360, y);
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.restore();

    // --- C. FLOWERS OBJECTS (Z-INDEX 10-30) ---
    // Strict 2-phase pipeline to guarantee 100% exact layer order:
    // Phase 1: Preload all flower images asynchronously
    // Phase 2: Draw them strictly sequentially from back (lowest zIndex) to front (highest zIndex)
    const sortedFlowers = [...bouquetItems].sort((a, b) => a.zIndex - b.zIndex);
    const loadedFlowerAssets = await Promise.all(
      sortedFlowers.map((item) => {
        return new Promise<{ item: BouquetItem; img: HTMLImageElement | null }>((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve({ item, img });
          img.onerror = () => resolve({ item, img: null });
          img.src = item.assetUrl;
        });
      })
    );

    // Phase 2: Synchronous sequential drawing in exact layer order
    for (const { item, img } of loadedFlowerAssets) {
      if (!img || !img.naturalWidth) continue;
      ctx.save();
      ctx.translate(item.x, item.y);
      ctx.rotate((item.rotation * Math.PI) / 180);
      ctx.scale(
        item.scale * (item.flipped ? -1 : 1),
        item.scale
      );

      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 6;

      // In BouquetCanvas, the flower image container is w-28 (112px) by h-44 (176px) with object-contain
      const natW = img.naturalWidth || 512;
      const natH = img.naturalHeight || 512;
      const imgAspect = natW / natH;

      let dw = 112;
      let dh = dw / imgAspect;
      if (dh > 176) {
        dh = 176;
        dw = dh * imgAspect;
      }

      // Draw centered at (item.x, item.y) matching editor exactly
      ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
      ctx.restore();
    }

    // --- D. OUTER WRAPPING LAYER (Z-INDEX 40) ---
    // In BouquetCanvas: left: (420-240)/2 = 90, top: 560 - 24 - 230 = 306, w: 240, h: 230
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = -4;

    ctx.beginPath();
    if (wrapping.outerStyle === 'folded') {
      // polygon(0% 25%, 35% 0%, 50% 30%, 65% 0%, 100% 25%, 75% 100%, 25% 100%)
      ctx.moveTo(90, 306 + 230 * 0.25);
      ctx.lineTo(90 + 240 * 0.35, 306);
      ctx.lineTo(90 + 240 * 0.50, 306 + 230 * 0.30);
      ctx.lineTo(90 + 240 * 0.65, 306);
      ctx.lineTo(90 + 240, 306 + 230 * 0.25);
      ctx.lineTo(90 + 240 * 0.75, 306 + 230);
      ctx.lineTo(90 + 240 * 0.25, 306 + 230);
    } else if (wrapping.outerStyle === 'wave') {
      // polygon(0% 15%, 50% 35%, 100% 15%, 80% 100%, 20% 100%)
      ctx.moveTo(90, 306 + 230 * 0.15);
      ctx.lineTo(90 + 240 * 0.50, 306 + 230 * 0.35);
      ctx.lineTo(90 + 240, 306 + 230 * 0.15);
      ctx.lineTo(90 + 240 * 0.80, 306 + 230);
      ctx.lineTo(90 + 240 * 0.20, 306 + 230);
    } else {
      // classic: polygon(0% 20%, 50% 10%, 100% 20%, 70% 100%, 30% 100%)
      ctx.moveTo(90, 306 + 230 * 0.20);
      ctx.lineTo(90 + 240 * 0.50, 306 + 230 * 0.10);
      ctx.lineTo(90 + 240, 306 + 230 * 0.20);
      ctx.lineTo(90 + 240 * 0.70, 306 + 230);
      ctx.lineTo(90 + 240 * 0.30, 306 + 230);
    }
    ctx.closePath();
    ctx.fillStyle = wrapping.outerColor;
    ctx.fill();

    // Embossed paper fold shading
    ctx.save();
    ctx.clip();
    const foldGrad = ctx.createLinearGradient(0, 536, 0, 306);
    foldGrad.addColorStop(0, 'rgba(0, 0, 0, 0.12)');
    foldGrad.addColorStop(0.5, 'transparent');
    foldGrad.addColorStop(1, 'rgba(255, 255, 255, 0.25)');
    ctx.fillStyle = foldGrad;
    ctx.fillRect(90, 306, 240, 230);
    ctx.restore();

    ctx.restore();

    // --- E. RIBBON & BOW & TAG (Z-INDEX 45) ---
    // In BouquetCanvas: bottom: 112px, center X: 210, Y: 448
    if (ribbon.type !== 'none') {
      ctx.save();
      ctx.translate(210, 448);
      ctx.fillStyle = ribbon.color;
      ctx.strokeStyle = ribbon.color;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
      ctx.shadowBlur = 14;
      ctx.shadowOffsetY = 6;

      // Draw Bow Wings
      ctx.beginPath();
      ctx.ellipse(-26, -4, 28, 16, -0.3, 0, Math.PI * 2);
      ctx.ellipse(26, -4, 28, 16, 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Tails
      ctx.beginPath();
      ctx.moveTo(-10, 2);
      ctx.lineTo(-32, 42);
      ctx.lineTo(-14, 45);
      ctx.lineTo(0, 8);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, 2);
      ctx.lineTo(32, 42);
      ctx.lineTo(14, 45);
      ctx.lineTo(0, 8);
      ctx.fill();

      // Knot
      ctx.beginPath();
      ctx.arc(0, 0, 10, 0, Math.PI * 2);
      ctx.fill();

      // Hanging Kraft Tag
      if (ribbon.hasTag) {
        ctx.save();
        ctx.translate(16, 22);
        ctx.rotate((-8 * Math.PI) / 180);
        ctx.fillStyle = '#DFCFB9';
        ctx.strokeStyle = '#B39878';
        ctx.lineWidth = 1.5;
        const tagW = 95;
        const tagH = 28;
        ctx.fillRect(-tagW / 2, -tagH / 2, tagW, tagH);
        ctx.strokeRect(-tagW / 2, -tagH / 2, tagW, tagH);

        ctx.fillStyle = '#4A3B2C';
        ctx.font = 'bold 12px "Noto Serif TC", serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(ribbon.tagText || 'For You', 0, 1.5);
        ctx.restore();
      }
      ctx.restore();
    }

    ctx.restore(); // Restore from bouquet translation & scaling

    // 3. GREETING CARD COMPOSITE (PROPORTIONAL, UNCOMPRESSED)
    ctx.save();
    const cardWidth = isPortrait ? 940 : 880;
    const cardHeight = isPortrait ? 320 : 250;
    const cardX = (width - cardWidth) / 2;
    const cardY = isPortrait ? height - cardHeight - 65 : height - cardHeight - 45;

    // Card Paper shadow & background
    ctx.shadowColor = 'rgba(0, 0, 0, 0.16)';
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle =
      card.style === 'kraft'
        ? '#D8C3A8'
        : card.style === 'parchment'
        ? '#E9DFC9'
        : card.style === 'pressed-flower'
        ? '#F4EFE6'
        : '#FCFAF7';

    // Rounded card paper
    if (typeof (ctx as any).roundRect === 'function') {
      ctx.beginPath();
      (ctx as any).roundRect(cardX, cardY, cardWidth, cardHeight, 22);
      ctx.fill();
    } else {
      ctx.fillRect(cardX, cardY, cardWidth, cardHeight);
    }

    // Double decorative inner border
    ctx.strokeStyle = 'rgba(140, 122, 100, 0.35)';
    ctx.lineWidth = 2;
    if (typeof (ctx as any).roundRect === 'function') {
      ctx.beginPath();
      (ctx as any).roundRect(cardX + 12, cardY + 12, cardWidth - 24, cardHeight - 24, 16);
      ctx.stroke();
    } else {
      ctx.strokeRect(cardX + 12, cardY + 12, cardWidth - 24, cardHeight - 24);
    }

    // Typography
    const hasDoodle = !!card.doodleDataUrl;
    const contentAreaWidth = hasDoodle ? cardWidth - 360 : cardWidth - 80;
    const textTargetX =
      card.textAlign === 'center'
        ? cardX + (hasDoodle ? contentAreaWidth / 2 + 10 : cardWidth / 2)
        : card.textAlign === 'right'
        ? cardX + contentAreaWidth
        : cardX + 45;

    // Card Title
    ctx.fillStyle = card.textColor || '#333';
    ctx.font = 'bold 26px "Noto Serif TC", serif';
    ctx.textAlign = card.textAlign;
    ctx.fillText(card.title || '致最珍貴的你', textTargetX, cardY + 54);

    // Decorative divider line
    ctx.save();
    ctx.strokeStyle = card.textColor ? `${card.textColor}66` : 'rgba(120, 100, 80, 0.35)';
    ctx.lineWidth = 1;
    const lineW = Math.min(contentAreaWidth - 30, 420);
    ctx.beginPath();
    ctx.moveTo(textTargetX - lineW / 2, cardY + 72);
    ctx.lineTo(textTargetX + lineW / 2, cardY + 72);
    ctx.stroke();
    ctx.restore();

    // Card Message
    ctx.font = '19px "Noto Serif TC", serif';
    const lines = (card.message || '願生活如繁花，安靜盛開，明媚向陽。').split('\n');
    lines.forEach((line, i) => {
      ctx.fillText(line, textTargetX, cardY + 112 + i * 30);
    });

    // Card Doodle Image (Strictly maintain 380:140 natural aspect ratio without any squish)
    if (card.doodleDataUrl) {
      const doodleImg = new Image();
      await new Promise<void>((resolve) => {
        doodleImg.onload = () => {
          const natW = doodleImg.naturalWidth || 380;
          const natH = doodleImg.naturalHeight || 140;
          const doodleAspect = natW / natH;

          const maxW = 310;
          const maxH = cardHeight - 50;
          let dw = maxW;
          let dh = dw / doodleAspect;
          if (dh > maxH) {
            dh = maxH;
            dw = dh * doodleAspect;
          }

          const dx = cardX + cardWidth - dw - 35;
          const dy = cardY + (cardHeight - dh) / 2 + 6;
          ctx.drawImage(doodleImg, dx, dy, dw, dh);
          resolve();
        };
        doodleImg.onerror = () => resolve();
        doodleImg.src = card.doodleDataUrl!;
      });
    }

    ctx.restore();

    // 4. Elegant Brand Footnote
    ctx.save();
    ctx.fillStyle = '#8C9B86';
    ctx.font = '14px "Cinzel", "Noto Serif TC", serif';
    ctx.textAlign = 'center';
    ctx.fillText('BLOOMING BOUQUET · 靜綻花語', width / 2, height - 44);
    ctx.restore();

    // Generate output URL
    const finalUrl = canvas.toDataURL(
      fileFormat === 'png' ? 'image/png' : 'image/jpeg',
      0.95
    );
    setDownloadUrl(finalUrl);
    setIsRendering(false);
  };

  const handleDownload = () => {
    if (!downloadUrl) return;
    const link = document.createElement('a');
    link.download = `blooming_bouquet_${Date.now()}.${fileFormat === 'png' ? 'png' : 'jpg'}`;
    link.href = downloadUrl;
    link.click();
  };

  const handleShare = async () => {
    if (!downloadUrl) return;

    if (navigator.share) {
      try {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const file = new File([blob], 'blooming_bouquet.png', { type: 'image/png' });
        await navigator.share({
          title: '靜綻花語 Blooming Bouquet',
          text: `${card.title} - ${card.message}`,
          files: [file],
        });
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      } catch (err) {
        navigator.clipboard.writeText(window.location.href);
        setShareSuccess(true);
        setTimeout(() => setShareSuccess(false), 3000);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 3000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-3xl max-w-3xl w-full p-4 md:p-6 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE5D8] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#E3EBDD] text-[#4F6542] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-tc text-lg font-semibold text-[#323E2E]">
                花束與賀卡成品導出
              </h2>
              <p className="text-xs text-[#75846E]">
                高解析度渲染無雜質圖卡，適合社群分享與列印收藏
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EDE6D8] hover:bg-[#E2D8C6] text-[#55634F] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Output Setting Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-white/70 p-3 rounded-2xl border border-[#E0D8C8]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#485642]">輸出比例：</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setAspectRatio('4:5')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  aspectRatio === '4:5'
                    ? 'bg-[#55694C] text-white border-[#55694C] shadow-xs'
                    : 'bg-white text-[#52634C] border-[#DDD]'
                }`}
              >
                4:5 (長形明信片)
              </button>
              <button
                onClick={() => setAspectRatio('1:1')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  aspectRatio === '1:1'
                    ? 'bg-[#55694C] text-white border-[#55694C] shadow-xs'
                    : 'bg-white text-[#52634C] border-[#DDD]'
                }`}
              >
                1:1 (正方形拍立得)
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#485642]">檔案格式：</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => setFileFormat('png')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  fileFormat === 'png'
                    ? 'bg-[#55694C] text-white border-[#55694C] shadow-xs'
                    : 'bg-white text-[#52634C] border-[#DDD]'
                }`}
              >
                PNG (細緻無損)
              </button>
              <button
                onClick={() => setFileFormat('jpeg')}
                className={`px-3 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                  fileFormat === 'jpeg'
                    ? 'bg-[#55694C] text-white border-[#55694C] shadow-xs'
                    : 'bg-white text-[#52634C] border-[#DDD]'
                }`}
              >
                JPG (柔和紙質)
              </button>
            </div>
          </div>
        </div>

        {/* Canvas Render Preview Box */}
        <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#EDE7DA] border border-[#D5CBBA] min-h-[380px] max-h-[460px] overflow-hidden relative">
          {isRendering && (
            <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center z-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#485642]">
                <RefreshCw className="w-4 h-4 animate-spin text-[#55694C]" />
                <span>正在為您合成手作花束與賀卡...</span>
              </div>
            </div>
          )}

          <canvas
            ref={exportCanvasRef}
            className="max-h-[420px] max-w-full object-contain rounded-xl shadow-lg border border-[#CCC]"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-[#ECE5D8]">
          <div className="text-xs text-[#7A8A73]">
            🌸 感謝您的親手創作，願這份心意如繁花常開！
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-[#F2ECE1] border border-[#DDD5C5] text-xs font-semibold text-[#4A5743] transition-colors cursor-pointer shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareSuccess ? '已複製分享資訊！' : '分享成品'}</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={isRendering || !downloadUrl}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#55694C] hover:bg-[#43533C] text-white text-xs font-semibold transition-all shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載高畫質成品圖片</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
