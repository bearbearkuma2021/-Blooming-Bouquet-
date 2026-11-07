import React, { useRef, useState, useEffect } from 'react';
import { 
  Paintbrush, Eraser, RotateCcw, Trash2, Eye, EyeOff, 
  Check, X, Sparkles, Sprout, ShoppingBag
} from 'lucide-react';
import { FlowerType } from '../../types';

interface DiyFlowerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveFlower: (newFlower: FlowerType, action: 'garden' | 'basket') => void;
}

export const DiyFlowerModal: React.FC<DiyFlowerModalProps> = ({
  isOpen,
  onClose,
  onSaveFlower,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');
  const [color, setColor] = useState('#D9777F'); // Soft rose
  const [brushSize, setBrushSize] = useState(8);
  const [opacity, setOpacity] = useState(0.9);
  const [showGuides, setShowGuides] = useState(true);
  const [flowerName, setFlowerName] = useState('手繪幸運花');
  const [flowerMeaning, setFlowerMeaning] = useState('獨一無二的溫暖祝福');
  const [history, setHistory] = useState<ImageData[]>([]);

  // Palette of botanical watercolor tones
  const colorPalette = [
    { name: '晨曦粉', hex: '#E27D8C' },
    { name: '薰衣草紫', hex: '#8A7BB3' },
    { name: '向日葵黃', hex: '#FBBF24' },
    { name: '藍霧紫陽', hex: '#60A5FA' },
    { name: '鼠尾草綠', hex: '#84A98C' },
    { name: '深林枝綠', hex: '#4A6B3D' },
    { name: '法式奶油', hex: '#FDF6E2' },
    { name: '復古磚紅', hex: '#C25161' },
    { name: '暖橙夕陽', hex: '#F97316' },
    { name: '炭焙灰墨', hex: '#334155' },
  ];

  // Initialize canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  }, [isOpen]);

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-15), imgData]);
  };

  const handleUndo = () => {
    if (history.length <= 1) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...history];
    newHistory.pop(); // pop current
    const prevData = newHistory[newHistory.length - 1];
    ctx.putImageData(prevData, 0, 0);
    setHistory(newHistory);
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    saveState();
  };

  // Drawing event handlers
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
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

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize * 1.5;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = brushSize;
      ctx.globalAlpha = opacity;
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    saveState();
  };

  const handleSave = (targetAction: 'garden' | 'basket') => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check if user drew anything
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const hasPixels = imgData.data.some((channel, index) => index % 4 === 3 && channel > 0);

    if (!hasPixels) {
      alert('畫布上尚未繪製花朵，請先畫出你的花瓣與花莖喔！');
      return;
    }

    const dataUrl = canvas.toDataURL('image/png');
    const newFlower: FlowerType = {
      id: `custom_${Date.now()}`,
      name: flowerName.trim() || '手繪花卉',
      englishName: 'Hand-drawn Blossom',
      color: color,
      meaning: flowerMeaning.trim() || '專屬手作心意',
      category: 'diy',
      assetUrl: dataUrl,
      isCustom: true,
    };

    onSaveFlower(newFlower, targetAction);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-3xl max-w-2xl w-full p-4 md:p-6 shadow-2xl relative my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE5D8] mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#E5DCCB] text-[#55694C] flex items-center justify-center">
              <Paintbrush className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif-tc text-lg font-semibold text-[#323E2E]">
                DIY 手繪花朵畫板
              </h2>
              <p className="text-xs text-[#75846E]">
                自由揮灑線條，親手繪製一朵專屬於你的花朵
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

        {/* Workspace Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Canvas Area (left) */}
          <div className="md:col-span-7 flex flex-col items-center">
            <div className="relative w-[280px] h-[360px] rounded-2xl border-2 border-dashed border-[#D2C8B5] bg-paper-texture overflow-hidden shadow-inner flex items-center justify-center">
              {/* Optional Guidance Lines */}
              {showGuides && (
                <div className="absolute inset-0 pointer-events-none opacity-40">
                  {/* Flower Head Area Circle */}
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-36 h-36 rounded-full border border-dashed border-[#E07A5F] flex items-center justify-center">
                    <span className="text-[10px] text-[#E07A5F]">花朵花頭區域</span>
                  </div>
                  {/* Stem Guidance Line */}
                  <div className="absolute top-42 left-1/2 -translate-x-1/2 w-[1px] h-44 border-l border-dashed border-[#81B29A]" />
                  <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[#81B29A]">
                    花莖與綠葉區域
                  </span>
                </div>
              )}

              {/* Drawing HTML5 Canvas */}
              <canvas
                ref={canvasRef}
                width={280}
                height={360}
                className="relative z-10 touch-none cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>

            {/* Canvas Quick Actions Bar */}
            <div className="flex items-center gap-2 mt-3 text-xs">
              <button
                onClick={() => setShowGuides(!showGuides)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EFE9DD] hover:bg-[#E5DDCF] text-[#4A5743] border border-[#DDD3C2] transition-colors cursor-pointer"
              >
                {showGuides ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>{showGuides ? '隱藏輔助線' : '顯示輔助線'}</span>
              </button>
              <button
                onClick={handleUndo}
                disabled={history.length <= 1}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EFE9DD] hover:bg-[#E5DDCF] text-[#4A5743] border border-[#DDD3C2] disabled:opacity-50 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>復原</span>
              </button>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FDE8E8] hover:bg-[#FCD2D2] text-[#991B1B] border border-[#FCA5A5] cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清除</span>
              </button>
            </div>
          </div>

          {/* Tools & Palette Panel (right) */}
          <div className="md:col-span-5 flex flex-col justify-between space-y-4">
            {/* Tool Mode Selection */}
            <div>
              <label className="text-xs font-semibold text-[#485642] mb-1.5 block">
                工具選擇
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setTool('brush')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    tool === 'brush'
                      ? 'bg-[#55694C] text-white border-[#55694C] shadow-xs'
                      : 'bg-white text-[#4A5743] border-[#DDD5C5]'
                  }`}
                >
                  <Paintbrush className="w-3.5 h-3.5" />
                  <span>水彩畫筆</span>
                </button>
                <button
                  onClick={() => setTool('eraser')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    tool === 'eraser'
                      ? 'bg-[#55694C] text-white border-[#55694C] shadow-xs'
                      : 'bg-white text-[#4A5743] border-[#DDD5C5]'
                  }`}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  <span>橡皮擦</span>
                </button>
              </div>
            </div>

            {/* Brush Size & Opacity Slider */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs text-[#5D6B57] mb-1">
                  <span>筆刷粗細</span>
                  <span className="font-mono">{brushSize}px</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="28"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-full accent-[#55694C] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-[#5D6B57] mb-1">
                  <span>水彩濃度 (透明度)</span>
                  <span className="font-mono">{Math.round(opacity * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1.0"
                  step="0.05"
                  value={opacity}
                  onChange={(e) => setOpacity(Number(e.target.value))}
                  className="w-full accent-[#55694C] cursor-pointer"
                />
              </div>
            </div>

            {/* Color Palette */}
            <div>
              <label className="text-xs font-semibold text-[#485642] mb-1.5 block">
                常用手作水彩色票
              </label>
              <div className="grid grid-cols-5 gap-2">
                {colorPalette.map((c) => (
                  <button
                    key={c.hex}
                    onClick={() => {
                      setColor(c.hex);
                      setTool('brush');
                    }}
                    title={c.name}
                    className={`w-8 h-8 rounded-full border-2 transition-transform cursor-pointer flex items-center justify-center ${
                      color === c.hex && tool === 'brush'
                        ? 'border-[#384831] scale-110 shadow-xs'
                        : 'border-white hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  >
                    {color === c.hex && tool === 'brush' && (
                      <Check className="w-3.5 h-3.5 text-white filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
              {/* Custom Color input */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] text-[#6E7B68]">自訂色彩：</span>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => {
                    setColor(e.target.value);
                    setTool('brush');
                  }}
                  className="w-7 h-7 rounded border border-[#CCC] cursor-pointer p-0 bg-transparent"
                />
                <span className="text-xs font-mono text-[#55634F]">{color}</span>
              </div>
            </div>

            {/* Flower Information Inputs */}
            <div className="space-y-1.5 pt-1 border-t border-[#ECE5D8]">
              <div>
                <label className="text-[11px] text-[#57644F] block">花朵名稱</label>
                <input
                  type="text"
                  value={flowerName}
                  onChange={(e) => setFlowerName(e.target.value)}
                  maxLength={10}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#D5CDBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#55694C]"
                  placeholder="為你的花朵取個名字"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#57644F] block">專屬花語</label>
                <input
                  type="text"
                  value={flowerMeaning}
                  onChange={(e) => setFlowerMeaning(e.target.value)}
                  maxLength={20}
                  className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-[#D5CDBC] bg-white focus:outline-none focus:ring-1 focus:ring-[#55694C]"
                  placeholder="例如：代表獨特心意"
                />
              </div>
            </div>

            {/* Submission Actions */}
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleSave('garden')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#55694C] hover:bg-[#43533C] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer active:scale-98"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>種植入花田 (生長觀察)</span>
              </button>
              <button
                onClick={() => handleSave('basket')}
                className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#EDE4D2] hover:bg-[#E2D8C3] text-[#47573F] text-xs font-semibold border border-[#D2C6B2] transition-all cursor-pointer active:scale-98"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>直接放入採收花籃</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
