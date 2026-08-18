'use client';

import React, { useEffect, useRef } from 'react';

interface WaveformLiveProps {
  isActive: boolean;
  volumeLevel: number; // 0.0 to 1.0
  height?: number;
}

export const WaveformLive: React.FC<WaveformLiveProps> = ({
  isActive,
  volumeLevel,
  height = 80,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef(0);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = canvas.width;
      const h = canvas.height;
      const centerY = h / 2;

      ctx.clearRect(0, 0, width, h);

      const baseAmp = isActive ? Math.max(10, volumeLevel * (h * 0.42)) : 3;
      phaseRef.current += isActive ? 0.08 : 0.02;

      // Draw dual gradient glow waves
      const waves = [
        { color: 'rgba(99, 102, 241, 0.85)', speed: 1.0, freq: 0.025, ampMult: 1.0 },
        { color: 'rgba(16, 185, 129, 0.75)', speed: 1.4, freq: 0.035, ampMult: 0.7 },
        { color: 'rgba(6, 182, 212, 0.65)', speed: 0.8, freq: 0.02, ampMult: 0.5 },
      ];

      waves.forEach((w) => {
        ctx.beginPath();
        ctx.lineWidth = isActive ? 2.5 : 1.5;
        ctx.strokeStyle = w.color;

        for (let x = 0; x < width; x++) {
          const envelope = Math.sin((x / width) * Math.PI); // Window envelope
          const y =
            centerY +
            Math.sin(x * w.freq + phaseRef.current * w.speed) *
              baseAmp *
              w.ampMult *
              envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      });

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isActive, volumeLevel]);

  return (
    <div className="w-full flex items-center justify-center p-2 rounded-2xl bg-white border border-gray-200 border border-surface-raised shadow-inner overflow-hidden">
      <canvas
        ref={canvasRef}
        width={600}
        height={height}
        className="w-full h-full max-w-lg"
      />
    </div>
  );
};
