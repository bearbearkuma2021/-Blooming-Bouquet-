import React, { useRef, useState, useEffect } from 'react';
import { 
  Heart, Sparkles, Star, Stamp, Paintbrush, 
  Eraser, RotateCcw, Trash2, ArrowLeft, Download, 
  Check, Share2, Move, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { CardConfig } from '../../types';

interface CardEditorProps {
  card: CardConfig;
  onChangeCard: (card: CardConfig) => void;
  onOpenExport: () => void;
  onBackToBouquet: () => void;
}

export const CardEditor: React.FC<CardEditorProps> = ({
  card,
  onChangeCard,
  onOpenExport,
  onBackToBouquet,
}) => {
  const doodleCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDoodling, setIsDoodling] = useState(false);
  const [doodleTool, setDoodleTool] = useState<'pen' | 'eraser' | 'stamp'>('pen');
  const [penColor, setPenColor] = useState('#6A4C3D'); // Warm sepia ink
  const [activeStamp, setActiveStamp] = useState<'heart' | 'star' | 'sparkle' | 'seal'>('heart');
  const [doodleHistory, setDoodleHistory] = useState<ImageData[]>([]);

  // Paper card themes
  const paperThemes = [
    {
      id: 'kraft',
      name: '復古牛皮厚卡',
      bgClass: 'bg-kraft-texture text-[#4A3B2C]',
      border: 'border-[#BCA78E]',
      desc: '質樸溫潤的手作牛皮質感',
    },
    {
      id: 'white',
      name: '法式棉麻純白',
      bgClass: 'bg-[#FCFAF7] text-[#2C382A]',
      border: 'border-[#E2DDD3]',
      desc: '優雅純淨的棉絮纖維質地',
    },
    {
      id: 'pressed-flower',
      name: '押花草木揉紙',
      bgClass: 'bg-[#F4EFE6] text-[#3D4738]',
      border: 'border-[#D1C8B6]',
      desc: '隱約透著淡綠花草紋理',
    },
    {
      id: 'parchment',
      name: '中世紀古舊羊皮',
      bgClass: 'bg-[#EDE2CD] text-[#403324]',
      border: 'border-[#C2B193]',
      desc: '古典典雅的琥珀古箋',
    },
  ];

  // Presets of heartfelt messages
  const messagePresets = [
    {
      title: '致最珍貴的你',
      msg: '願生活如繁花，安靜盛開，明媚向陽。\n每一朵花，都藏著我最真切的祝福與牽掛。',
    },
    {
      title: '生日快樂',
      msg: '願你的每一歲都奔走在自己的熱愛裡。\n綻放屬於你的光彩，平安喜樂，萬事勝意。',
    },
    {
      title: '感謝有你相伴',
      msg: '謝謝你一路以來的溫暖與陪伴。\n把這束親手採摘組裝的花朵，送給最特別的你。',
    },
    {
      title: '悄悄說句想你',
      msg: '晨光微熹，微風拂面。\n摘下花田最美的花，只想讓你知道我想你了。',
    },
  ];

  // Doodle Canvas handlers
  useEffect(() => {
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (card.doodleDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        saveDoodleState();
      };
      img.src = card.doodleDataUrl;
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      saveDoodleState();
    }
  }, []);

  const saveDoodleState = () => {
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setDoodleHistory((prev) => [...prev.slice(-10), imgData]);

    const url = canvas.toDataURL('image/png');
    onChangeCard({ ...card, doodleDataUrl: url });
  };

  const handleUndoDoodle = () => {
    if (doodleHistory.length <= 1) return;
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...doodleHistory];
    newHistory.pop();
    const prev = newHistory[newHistory.length - 1];
    ctx.putImageData(prev, 0, 0);
    setDoodleHistory(newHistory);
    onChangeCard({ ...card, doodleDataUrl: canvas.toDataURL('image/png') });
  };

  const handleClearDoodle = () => {
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveDoodleState();
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = doodleCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDoodling = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);

    if (doodleTool === 'stamp') {
      // Stamp drawing directly
      ctx.fillStyle = penColor;
      ctx.strokeStyle = penColor;
      if (activeStamp === 'heart') {
        ctx.beginPath();
        const topCurveHeight = 6;
        ctx.moveTo(x, y + topCurveHeight);
        ctx.bezierCurveTo(x, y, x - 10, y, x - 10, y + 6);
        ctx.bezierCurveTo(x - 10, y + 12, x, y + 18, x, y + 20);
        ctx.bezierCurveTo(x, y + 18, x + 10, y + 12, x + 10, y + 6);
        ctx.bezierCurveTo(x + 10, y, x, y, x, y + topCurveHeight);
        ctx.fill();
      } else if (activeStamp === 'star') {
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          ctx.lineTo(
            Math.cos(((18 + i * 72) * Math.PI) / 180) * 10 + x,
            -Math.sin(((18 + i * 72) * Math.PI) / 180) * 10 + y
          );
          ctx.lineTo(
            Math.cos(((54 + i * 72) * Math.PI) / 180) * 4.5 + x,
            -Math.sin(((54 + i * 72) * Math.PI) / 180) * 4.5 + y
          );
        }
        ctx.closePath();
        ctx.fill();
      } else if (activeStamp === 'sparkle') {
        ctx.beginPath();
        ctx.moveTo(x, y - 10);
        ctx.quadraticCurveTo(x, y, x + 10, y);
        ctx.quadraticCurveTo(x, y, x, y + 10);
        ctx.quadraticCurveTo(x, y, x - 10, y);
        ctx.quadraticCurveTo(x, y, x, y - 10);
        ctx.fill();
      } else if (activeStamp === 'seal') {
        ctx.beginPath();
        ctx.arc(x, y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      saveDoodleState();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);

    if (doodleTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = 14;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 3;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDoodling(true);
  };

  const doodleMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDoodling || doodleTool === 'stamp') return;
    const canvas = doodleCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCanvasCoords(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDoodling = () => {
    if (!isDoodling) return;
    setIsDoodling(false);
    saveDoodleState();
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-4">
      {/* Top action row */}
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#DFD7C7] shadow-xs">
        <button
          onClick={onBackToBouquet}
          className="flex items-center gap-1.5 text-xs text-[#586650] hover:text-[#2E3A2A] px-3 py-1.5 rounded-lg hover:bg-[#F2ECE1] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>返回花束調整</span>
        </button>

        <span className="text-xs text-[#6B7963] font-medium hidden sm:block">
          💌 撰寫溫暖心意、添加親筆手繪簽名或復古封蠟印章
        </span>

        <button
          onClick={onOpenExport}
          className="flex items-center gap-1.5 text-xs font-semibold bg-[#55694C] hover:bg-[#43533C] text-white px-4 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>完成並匯出圖片</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Card Visual Real-Time Preview with Doodle Layer */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-[420px] aspect-[4/5] rounded-3xl p-6 shadow-xl border flex flex-col justify-between overflow-hidden select-none transition-all duration-300">
            {/* Card Background Paper Texture & Border */}
            {(() => {
              const currentTheme = paperThemes.find((t) => t.id === card.style) || paperThemes[0];
              return (
                <div
                  className={`absolute inset-0 rounded-3xl ${currentTheme.bgClass} border-2 ${currentTheme.border} pointer-events-none`}
                />
              );
            })()}

            {/* Subtle vintage inner frame border */}
            <div className="absolute inset-3 border border-[#8C7A64]/20 rounded-2xl pointer-events-none" />

            {/* Card Content Layer */}
            <div className="relative z-10 space-y-3 pt-2">
              {/* Card Header / Title */}
              <div
                className={`font-serif-tc font-bold text-xl md:text-2xl tracking-wide ${
                  card.textAlign === 'center'
                    ? 'text-center'
                    : card.textAlign === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
                style={{ color: card.textColor }}
              >
                {card.title || '致最珍貴的你'}
              </div>

              {/* Decorative botanical divider */}
              <div className="flex items-center justify-center gap-2 opacity-50 py-1">
                <div className="w-12 h-[1px] bg-current" />
                <Sparkles className="w-3 h-3" />
                <div className="w-12 h-[1px] bg-current" />
              </div>

              {/* Card Message Body */}
              <p
                className={`text-sm md:text-base leading-relaxed whitespace-pre-wrap ${
                  card.font === 'serif'
                    ? 'font-serif-tc'
                    : card.font === 'display'
                    ? 'font-display'
                    : 'font-sans'
                } ${
                  card.textAlign === 'center'
                    ? 'text-center'
                    : card.textAlign === 'right'
                    ? 'text-right'
                    : 'text-left'
                }`}
                style={{ color: card.textColor }}
              >
                {card.message || '願生活如繁花，安靜盛開，明媚向陽。'}
              </p>
            </div>

            {/* Hand-Drawn Doodle / Stamps / Signature Overlay Canvas */}
            <div className="relative z-20 w-full h-[140px] mt-2 rounded-xl border border-dashed border-[#8C7A64]/30 bg-black/5 overflow-hidden">
              <canvas
                ref={doodleCanvasRef}
                width={380}
                height={140}
                onMouseDown={startDoodling}
                onMouseMove={doodleMove}
                onMouseUp={stopDoodling}
                onMouseLeave={stopDoodling}
                onTouchStart={startDoodling}
                onTouchMove={doodleMove}
                onTouchEnd={stopDoodling}
                className="w-full h-full cursor-crosshair touch-none"
              />
              <div className="absolute bottom-1 right-2 pointer-events-none text-[10px] text-[#8C7A64]/70">
                ✏️ 手寫簽名與塗鴉區域
              </div>
            </div>

            {/* Doodle Toolbar under preview */}
            <div className="relative z-30 flex items-center justify-between pt-2 border-t border-[#8C7A64]/20 text-xs">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDoodleTool('pen')}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    doodleTool === 'pen'
                      ? 'bg-[#55694C] text-white border-[#55694C]'
                      : 'bg-white text-[#52634C] border-[#DDD]'
                  }`}
                  title="手寫簽名筆"
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDoodleTool('stamp')}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    doodleTool === 'stamp'
                      ? 'bg-[#55694C] text-white border-[#55694C]'
                      : 'bg-white text-[#52634C] border-[#DDD]'
                  }`}
                  title="心意印章"
                >
                  <Stamp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setDoodleTool('eraser')}
                  className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                    doodleTool === 'eraser'
                      ? 'bg-[#55694C] text-white border-[#55694C]'
                      : 'bg-white text-[#52634C] border-[#DDD]'
                  }`}
                  title="橡皮擦"
                >
                  <Eraser className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Active Stamps */}
              {doodleTool === 'stamp' && (
                <div className="flex items-center gap-1 bg-white/80 px-2 py-0.5 rounded-lg border border-[#DDD]">
                  {[
                    { id: 'heart', icon: '❤️' },
                    { id: 'star', icon: '⭐' },
                    { id: 'sparkle', icon: '✨' },
                    { id: 'seal', icon: '🔴' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setActiveStamp(s.id as any)}
                      className={`px-1.5 py-0.5 rounded text-xs cursor-pointer ${
                        activeStamp === s.id ? 'bg-[#55694C]/20 scale-110' : ''
                      }`}
                    >
                      {s.icon}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-1">
                <button
                  onClick={handleUndoDoodle}
                  className="p-1.5 rounded-lg hover:bg-black/10 text-[#55634F] cursor-pointer"
                  title="復原塗鴉"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleClearDoodle}
                  className="p-1.5 rounded-lg hover:bg-red-100 text-red-600 cursor-pointer"
                  title="清空手寫"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Card Configuration Form & Presets */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Paper Texture Selector */}
          <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="font-serif-tc text-xs font-semibold text-[#3D4C38]">
              選擇手作紙質
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {paperThemes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onChangeCard({ ...card, style: theme.id as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    card.style === theme.id
                      ? 'border-[#4E6344] bg-white ring-2 ring-[#4E6344]/30 shadow-xs'
                      : 'border-[#E2D8C6] bg-white/70 hover:bg-white'
                  }`}
                >
                  <span className="text-xs font-semibold text-[#3D4C38] block">
                    {theme.name}
                  </span>
                  <span className="text-[10px] text-[#7A8A73]">{theme.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Warm Preset Messages */}
          <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-2xl p-4 shadow-xs space-y-2">
            <h3 className="font-serif-tc text-xs font-semibold text-[#3D4C38]">
              精選暖心字句快速套用
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {messagePresets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    onChangeCard({
                      ...card,
                      title: p.title,
                      message: p.msg,
                    })
                  }
                  className="p-2 rounded-xl bg-white hover:bg-[#F2ECE1] border border-[#E0D8C8] text-left transition-all cursor-pointer text-xs"
                >
                  <span className="font-semibold text-[#3D4C38] block truncate">
                    {p.title}
                  </span>
                  <span className="text-[10px] text-[#7A8A73] line-clamp-1">
                    {p.msg}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Text Editing Inputs */}
          <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-2xl p-4 shadow-xs space-y-3">
            <div>
              <label className="text-xs font-semibold text-[#3D4C38] block mb-1">
                卡片標題
              </label>
              <input
                type="text"
                value={card.title}
                onChange={(e) => onChangeCard({ ...card, title: e.target.value })}
                maxLength={18}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5CDBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#55694C]"
                placeholder="例如：致最珍貴的你"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#3D4C38] block mb-1">
                祝福內文
              </label>
              <textarea
                value={card.message}
                onChange={(e) => onChangeCard({ ...card, message: e.target.value })}
                rows={4}
                maxLength={120}
                className="w-full text-xs px-3 py-2 rounded-xl border border-[#D5CDBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#55694C] resize-none"
                placeholder="寫下你的心意或悄悄話..."
              />
              <span className="text-[10px] text-[#7A8A73] block text-right">
                {card.message.length}/120 字
              </span>
            </div>

            {/* Typography & Alignment Controls */}
            <div className="flex items-center justify-between pt-2 border-t border-[#ECE5D8]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-[#5D6B57]">字體：</span>
                <select
                  value={card.font}
                  onChange={(e) =>
                    onChangeCard({ ...card, font: e.target.value as any })
                  }
                  className="text-xs bg-white border border-[#D5CDBC] rounded-lg px-2 py-1 text-[#3D4C38]"
                >
                  <option value="serif">經典典雅宋體</option>
                  <option value="display">復古藝術體</option>
                  <option value="handwriting">自然手寫體</option>
                </select>
              </div>

              {/* Alignments */}
              <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#D5CDBC]">
                <button
                  onClick={() => onChangeCard({ ...card, textAlign: 'left' })}
                  className={`p-1 rounded cursor-pointer ${
                    card.textAlign === 'left' ? 'bg-[#55694C] text-white' : 'text-[#666]'
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onChangeCard({ ...card, textAlign: 'center' })}
                  className={`p-1 rounded cursor-pointer ${
                    card.textAlign === 'center' ? 'bg-[#55694C] text-white' : 'text-[#666]'
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onChangeCard({ ...card, textAlign: 'right' })}
                  className={`p-1 rounded cursor-pointer ${
                    card.textAlign === 'right' ? 'bg-[#55694C] text-white' : 'text-[#666]'
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
