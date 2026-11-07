import React, { useState } from 'react';
import { 
  Sun, Sunset, Moon, Sunrise, CloudRain, 
  Sparkles, RefreshCw, Zap, Droplets, RotateCcw,
  Compass, Lock, Unlock, Key, X, Check
} from 'lucide-react';
import { TimePeriod, WeatherEvent } from '../../types';

interface TestPeriodSwitcherProps {
  currentPeriod: TimePeriod;
  currentEvent: WeatherEvent;
  cooldownSeconds: number; // current remaining cooldown
  isCooldownActive: boolean;
  onManualRefresh: () => void;
  onDirectSetScene: (period: TimePeriod, event: WeatherEvent) => void;
  onInstantHarvestAll: () => void;
  onWaterFlowers: () => void;
  onReplantGarden: () => void;
  cooldownMode: 'test_5s' | 'normal_5m';
  onToggleCooldownMode: () => void;
}

export const TestPeriodSwitcher: React.FC<TestPeriodSwitcherProps> = ({
  currentPeriod,
  currentEvent,
  cooldownSeconds,
  isCooldownActive,
  onManualRefresh,
  onDirectSetScene,
  onInstantHarvestAll,
  onWaterFlowers,
  onReplantGarden,
  cooldownMode,
  onToggleCooldownMode,
}) => {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return localStorage.getItem('blooming_test_unlocked') === 'true';
  });
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Exactly 9 scenes matching the 9 watercolor illustration assets
  const scenes: {
    label: string;
    period: TimePeriod;
    event: WeatherEvent;
    icon: string;
    themeClass: string;
    desc: string;
  }[] = [
    { label: '晴空白天', period: 'DAY', event: 'NONE', icon: '☀️', themeClass: 'bg-amber-50 text-amber-900 border-amber-200', desc: '暖陽與綠野花草' },
    { label: '晴空彩虹', period: 'DAY', event: 'RAINBOW', icon: '🌈', themeClass: 'bg-pink-50 text-pink-900 border-pink-200', desc: '晴空白日彩虹' },
    { label: '白天細雨', period: 'DAY', event: 'RAIN', icon: '🌧️', themeClass: 'bg-blue-50 text-blue-900 border-blue-200', desc: '白天細雨濛濛' },
    { label: '暖橘夕陽', period: 'SUNSET', event: 'NONE', icon: '🌅', themeClass: 'bg-orange-50 text-orange-900 border-orange-200', desc: '暮日熔金山丘' },
    { label: '夕陽狐狸', period: 'SUNSET', event: 'FOX', icon: '🦊', themeClass: 'bg-amber-100 text-amber-950 border-amber-300', desc: '黃昏與小狐狸群' },
    { label: '淡紫晨曦', period: 'DAWN', event: 'NONE', icon: '🌄', themeClass: 'bg-purple-50 text-purple-900 border-purple-200', desc: '破曉粉紫雲霞' },
    { label: '星夜月明', period: 'NIGHT', event: 'NONE', icon: '🌙', themeClass: 'bg-indigo-950 text-indigo-100 border-indigo-700', desc: '月牙與深藍繁星' },
    { label: '夜空流星', period: 'NIGHT', event: 'METEOR', icon: '🌠', themeClass: 'bg-slate-900 text-amber-200 border-purple-500', desc: '璀璨流星劃過' },
    { label: '靜夜細雨', period: 'NIGHT', event: 'RAIN', icon: '🌧️', themeClass: 'bg-blue-950 text-blue-200 border-blue-800', desc: '月夜綿綿雨絲' },
  ];

  const handleUnlockSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (passwordInput.trim() === '0000') {
      setIsUnlocked(true);
      localStorage.setItem('blooming_test_unlocked', 'true');
      setShowPasswordDialog(false);
      setPasswordInput('');
      setErrorMessage(null);
    } else {
      setErrorMessage('代號驗證未通過，請重新輸入');
    }
  };

  const handleLock = () => {
    setIsUnlocked(false);
    localStorage.removeItem('blooming_test_unlocked');
  };

  const formatCooldown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}分${secs < 10 ? '0' : ''}${secs}秒`;
    }
    return `${secs}秒`;
  };

  // 1. STANDARD VIEW (When not unlocked with password 0000)
  // Only displays: 手動刷新(冷卻5分鐘)、一鍵採收、重播花田
  if (!isUnlocked) {
    return (
      <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-[#E4DDD0] rounded-2xl p-3 shadow-xs mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Main Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* 1. 手動刷新 (冷卻 5 分鐘) */}
            <button
              onClick={onManualRefresh}
              disabled={isCooldownActive}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                isCooldownActive
                  ? 'bg-[#E3DDCF] text-[#8C8474] cursor-not-allowed'
                  : 'bg-[#55694C] hover:bg-[#43533C] text-white cursor-pointer active:scale-95'
              }`}
              title="推進下一個時段或天氣（正常冷卻 5 分鐘）"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCooldownActive ? 'animate-spin' : ''}`} />
              <span>
                {isCooldownActive
                  ? `手動刷新 (${formatCooldown(cooldownSeconds)})`
                  : '手動刷新 (冷卻5分鐘)'}
              </span>
            </button>

            {/* 2. 一鍵採收 */}
            <button
              onClick={onInstantHarvestAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              title="一鍵將花田中當前所有花朵立即採收入花籃（最多可採收 50 朵）"
            >
              <Zap className="w-3.5 h-3.5 text-[#059669]" />
              <span>一鍵採收</span>
            </button>

            {/* 3. 重播花田 */}
            <button
              onClick={onReplantGarden}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FDF4FF] hover:bg-[#FAE8FF] text-[#86198F] border border-[#F5D0FE] text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              title="重新整地並種下新的一批花朵種子"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#A21CAF]" />
              <span>重播花田</span>
            </button>
          </div>

          {/* Test Panel Unlock Entry */}
          <div className="flex items-center">
            <button
              onClick={() => {
                setShowPasswordDialog(true);
                setErrorMessage(null);
                setPasswordInput('');
              }}
              className="flex items-center gap-1 text-[11px] text-[#7A8A73] hover:text-[#3B4D36] px-2.5 py-1 rounded-lg hover:bg-[#EFE8DD] transition-colors cursor-pointer border border-transparent hover:border-[#D5CDBC]"
              title="輸入測試人員代號解鎖面板"
            >
              <Lock className="w-3 h-3 text-[#8A9B83]" />
              <span>測試面板</span>
            </button>
          </div>
        </div>

        {/* Password Modal Dialog */}
        {showPasswordDialog && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-[#FAF8F5] border border-[#DDD5C5] rounded-2xl p-5 max-w-sm w-full shadow-2xl relative animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-[#ECE5D8] mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#E3EBDD] text-[#4F6542] flex items-center justify-center">
                    <Key className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-serif-tc text-sm font-semibold text-[#323E2E]">
                    開啟測試用面板
                  </h3>
                </div>
                <button
                  onClick={() => setShowPasswordDialog(false)}
                  className="w-6 h-6 rounded-full bg-[#EDE6D8] hover:bg-[#E2D8C6] text-[#55634F] flex items-center justify-center cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <label className="block text-xs font-semibold text-[#4A5743] mb-2">
                請輸入寫測試人員代號：
              </label>

              <form onSubmit={handleUnlockSubmit} className="space-y-3">
                <input
                  type="password"
                  maxLength={10}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="請輸入測試人員代號"
                  autoFocus
                  className="w-full px-3 py-2 rounded-xl border border-[#D5CDBC] bg-white text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#55694C]"
                />

                {errorMessage && (
                  <p className="text-[11px] text-red-600 font-medium text-center">
                    {errorMessage}
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPasswordDialog(false)}
                    className="flex-1 py-1.5 rounded-xl border border-[#D5CDBC] text-xs text-[#55634F] hover:bg-[#EFE8DD] transition-colors cursor-pointer"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-1.5 rounded-xl bg-[#55694C] hover:bg-[#43533C] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    解鎖面板
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. UNLOCKED VIEW (Password 0000 verified)
  // Shows full 9 backgrounds preview and debug switchers
  return (
    <div className="bg-[#FAF8F5]/95 backdrop-blur-md border border-[#D4CBB8] rounded-2xl p-3.5 mb-4 shadow-sm space-y-3">
      {/* Top Header Row of Unlocked Panel */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#ECE5DA]">
        <div className="flex items-center gap-2">
          <div className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#55694C] text-white flex items-center gap-1 shadow-2xs">
            <Unlock className="w-3 h-3" />
            <span>測試專用面板 (已解鎖)</span>
          </div>
          <span className="text-xs text-[#55634F] font-medium hidden sm:inline">
            可即刻切換 9 款水彩手繪背景場景，隨意調整冷卻時長
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle cooldown mode */}
          <button
            onClick={onToggleCooldownMode}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#EFE8DC] hover:bg-[#E5DDCF] text-[#4E5A47] border border-[#DDD3C2] transition-colors cursor-pointer font-medium"
            title="點擊切換測試 5 秒 / 標準 5 分鐘冷卻"
          >
            冷卻設定: {cooldownMode === 'test_5s' ? '⚡ 5 秒 (測試極速)' : '⏳ 5 分鐘 (標準)'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={onManualRefresh}
            disabled={isCooldownActive}
            className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-semibold transition-all shadow-xs ${
              isCooldownActive
                ? 'bg-[#E3DDCF] text-[#8C8474] cursor-not-allowed'
                : 'bg-[#55694C] hover:bg-[#43533C] text-white cursor-pointer active:scale-95'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isCooldownActive ? 'animate-spin' : ''}`} />
            <span>{isCooldownActive ? `冷卻中 ${formatCooldown(cooldownSeconds)}` : '手動推進'}</span>
          </button>

          {/* Lock Button */}
          <button
            onClick={handleLock}
            className="text-[11px] text-[#7A8A73] hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg border border-[#D5CDBC] transition-colors cursor-pointer flex items-center gap-1"
            title="鎖定並關閉測試面板"
          >
            <Lock className="w-3 h-3" />
            <span>鎖定</span>
          </button>
        </div>
      </div>

      {/* 9 Scenes Direct Switcher Grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#3D4C38]">
            <Compass className="w-3.5 h-3.5 text-[#55694C]" />
            <span>9 款水彩背景即刻切換（點擊即可載入高清場景）：</span>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={onWaterFlowers}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#E8F0FE] hover:bg-[#D5E3FA] text-[#1E40AF] border border-[#BFDBFE] text-[11px] font-medium transition-colors cursor-pointer"
              title="為所有花朵澆水，增加生長進度 30 秒"
            >
              <Droplets className="w-3 h-3 text-[#2563EB]" />
              <span>澆水 +30s</span>
            </button>
            <button
              onClick={onInstantHarvestAll}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0] text-[11px] font-semibold transition-colors cursor-pointer"
              title="一鍵將花田中當前所有花朵立即採收"
            >
              <Zap className="w-3 h-3 text-[#059669]" />
              <span>一鍵採收</span>
            </button>
            <button
              onClick={onReplantGarden}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#FDF4FF] hover:bg-[#FAE8FF] text-[#86198F] border border-[#F5D0FE] text-[11px] font-medium transition-colors cursor-pointer"
              title="重新播種 5 格泥土"
            >
              <RotateCcw className="w-3 h-3 text-[#A21CAF]" />
              <span>重播花田</span>
            </button>
          </div>
        </div>

        {/* 9 Scene Chips */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
          {scenes.map((s, idx) => {
            const isCurrent = currentPeriod === s.period && currentEvent === s.event;
            return (
              <button
                key={idx}
                onClick={() => onDirectSetScene(s.period, s.event)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs border transition-all cursor-pointer ${
                  isCurrent
                    ? 'ring-2 ring-[#4F6344] ring-offset-1 font-bold shadow-xs scale-102 ' + s.themeClass
                    : 'bg-white/80 hover:bg-white text-[#4A5543] border-[#E0D7C6] hover:border-[#B4C2AB]'
                }`}
                title={s.desc}
              >
                <span className="text-base mb-0.5">{s.icon}</span>
                <span className="text-[11px] font-medium truncate w-full text-center">
                  {s.label}
                </span>
                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#526B45] mt-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
