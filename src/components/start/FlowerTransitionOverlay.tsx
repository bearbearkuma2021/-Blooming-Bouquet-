import React, { useEffect, useMemo } from 'react';
import { PRESET_FLOWERS } from '../../data/presetFlowers';

interface FlowerTransitionOverlayProps {
  onMidpoint: () => void;
  onComplete: () => void;
}

interface SwooshParticle {
  id: number;
  type: 'flower' | 'petal' | 'leaf';
  imgUrl?: string;
  color?: string;
  topPercent: number;
  size: number;
  durationSec: number;
  delaySec: number;
  driftY: number;
  rotateDeg: number;
  scale: number;
  zIndex: number;
}

export const FlowerTransitionOverlay: React.FC<FlowerTransitionOverlayProps> = ({
  onMidpoint,
  onComplete,
}) => {
  // Generate a rich wave of flowers and accompanying petals
  const particles = useMemo<SwooshParticle[]>(() => {
    const list: SwooshParticle[] = [];
    const flowerImages = PRESET_FLOWERS.map((f) => f.assetUrl);
    const petalColors = ['#F48C9A', '#D9383A', '#F59E0B', '#8A7BB3', '#E5A93C', '#FFFFFF', '#A3B899'];

    // 1. Core flower sprites (36 flowers spanning top to bottom)
    for (let i = 0; i < 36; i++) {
      const img = flowerImages[i % flowerImages.length];
      const topPercent = (i / 36) * 94 + (Math.random() * 6 - 3);
      const size = 64 + Math.random() * 64; // 64px - 128px
      const durationSec = 0.95 + Math.random() * 0.45; // 0.95s - 1.4s
      const delaySec = Math.random() * 0.35; // 0 - 0.35s
      const driftY = (Math.random() - 0.5) * 120;
      const rotateDeg = (Math.random() > 0.5 ? 1 : -1) * (180 + Math.random() * 360);
      const scale = 0.8 + Math.random() * 0.5;

      list.push({
        id: i,
        type: 'flower',
        imgUrl: img,
        topPercent,
        size,
        durationSec,
        delaySec,
        driftY,
        rotateDeg,
        scale,
        zIndex: 20 + Math.floor(Math.random() * 10),
      });
    }

    // 2. Swirling botanical petals and leaves for density & magical atmosphere
    for (let i = 0; i < 28; i++) {
      const color = petalColors[i % petalColors.length];
      const topPercent = Math.random() * 100;
      const size = 16 + Math.random() * 24; // 16px - 40px
      const durationSec = 0.8 + Math.random() * 0.4;
      const delaySec = Math.random() * 0.4;
      const driftY = (Math.random() - 0.5) * 160;
      const rotateDeg = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 360);

      list.push({
        id: 100 + i,
        type: i % 3 === 0 ? 'leaf' : 'petal',
        color,
        topPercent,
        size,
        durationSec,
        delaySec,
        driftY,
        rotateDeg,
        scale: 1,
        zIndex: 10 + Math.floor(Math.random() * 10),
      });
    }

    return list;
  }, []);

  // Midpoint trigger when screen is covered, and completion when finished
  useEffect(() => {
    const midpointTimer = setTimeout(() => {
      onMidpoint();
    }, 550);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 1500);

    return () => {
      clearTimeout(midpointTimer);
      clearTimeout(completeTimer);
    };
  }, [onMidpoint, onComplete]);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
      {/* Soft translucent wind breeze veil passing right to left */}
      <div 
        className="absolute inset-0 bg-gradient-to-l from-white/40 via-[#F7F3E9]/50 to-transparent transition-opacity duration-700" 
        style={{
          animation: 'fade-veil 1.4s ease-in-out forwards',
        }}
      />

      {/* Dynamic Swooshing Particles from Right to Left */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute right-0 will-change-transform"
          style={{
            top: `${p.topPercent}%`,
            zIndex: p.zIndex,
            animationName: 'flower-swoosh-left',
            animationDuration: `${p.durationSec}s`,
            animationDelay: `${p.delaySec}s`,
            animationTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
            animationFillMode: 'forwards',
            // @ts-expect-error CSS variable injection
            '--tw-drift-y': `${p.driftY}px`,
            '--tw-rotation': `${p.rotateDeg}deg`,
          }}
        >
          {p.type === 'flower' && p.imgUrl && (
            <img
              src={p.imgUrl}
              alt="blooming petal"
              className="object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.18)]"
              style={{
                width: `${p.size}px`,
                height: `${p.size * 1.3}px`,
                transform: `scale(${p.scale})`,
              }}
            />
          )}

          {p.type === 'petal' && (
            <div
              className="rounded-full shadow-xs opacity-90"
              style={{
                width: `${p.size}px`,
                height: `${p.size * 1.5}px`,
                backgroundColor: p.color,
                borderRadius: '50% 50% 50% 10%',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
              }}
            />
          )}

          {p.type === 'leaf' && (
            <div
              className="bg-[#788E6D] shadow-xs opacity-85"
              style={{
                width: `${p.size}px`,
                height: `${p.size * 2}px`,
                borderRadius: '80% 0% 80% 0%',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.15))',
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};
