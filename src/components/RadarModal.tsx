import React, { useEffect, useRef, useState } from 'react';
import { Layers, Maximize2, Pause, Play, RotateCcw, X } from 'lucide-react';
import { WeatherCity } from '../types/weather';

interface RadarModalProps {
  isOpen: boolean;
  onClose: () => void;
  city: WeatherCity;
}

export const RadarModal: React.FC<RadarModalProps> = ({ isOpen, onClose, city }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [timeOffset, setTimeOffset] = useState(0); // minutes: -60 to +60
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Play animation loop
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setTimeOffset((prev) => {
        if (prev >= 60) return -60;
        return prev + 5;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  // Render radar canvas
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let angle = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Dark map background
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Map grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Range rings centered at city
      const cx = width / 2;
      const cy = height / 2;
      const rings = [60, 120, 180, 240];
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.setLineDash([4, 4]);
      rings.forEach((r) => {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Rotating radar beam
      angle += 0.035;
      const beamGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 260);
      beamGradient.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
      beamGradient.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 260, angle - 0.45, angle);
      ctx.closePath();
      ctx.fillStyle = beamGradient;
      ctx.fill();
      ctx.restore();

      // Rain cells moving with timeOffset
      const shiftX = (timeOffset / 60) * 90;
      const shiftY = (timeOffset / 60) * -30;

      // Draw simulated precipitation blobs
      const drawBlob = (bx: number, by: number, radius: number, color: string) => {
        ctx.beginPath();
        const grad = ctx.createRadialGradient(bx, by, 0, bx, by, radius);
        grad.addColorStop(0, color);
        grad.addColorStop(0.7, color.replace(/[\d.]+\)$/, '0.4)'));
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.arc(bx, by, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      // Rain cells
      drawBlob(cx - 80 + shiftX, cy - 40 + shiftY, 75, 'rgba(16, 185, 129, 0.7)'); // green/light
      drawBlob(cx - 70 + shiftX, cy - 45 + shiftY, 45, 'rgba(234, 179, 8, 0.75)'); // yellow/mod
      drawBlob(cx - 65 + shiftX, cy - 48 + shiftY, 25, 'rgba(239, 68, 68, 0.8)'); // red/heavy

      drawBlob(cx + 90 + shiftX * 0.8, cy + 60 + shiftY * 0.8, 60, 'rgba(56, 189, 248, 0.65)');
      drawBlob(cx + 40 + shiftX * 1.1, cy - 90 + shiftY * 1.1, 55, 'rgba(16, 185, 129, 0.6)');

      // Center City Point
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Label
      ctx.fillStyle = '#ffffff';
      ctx.font = '600 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(city.name, cx, cy + 22);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [isOpen, timeOffset, city.name]);

  if (!isOpen) return null;

  const formatOffsetLabel = (mins: number) => {
    if (mins === 0) return 'Now (Live)';
    if (mins < 0) return `${Math.abs(mins)}m ago`;
    return `+${mins}m forecast`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-3xl h-[85vh] max-h-[720px] rounded-3xl overflow-hidden glass-panel flex flex-col shadow-2xl border border-white/20">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/15 bg-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-base font-semibold text-white">
              {city.name} Weather Radar
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close radar map"
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white hover:bg-white/20 active:scale-90 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Radar Viewport */}
        <div className="relative flex-1 bg-slate-950 overflow-hidden">
          <canvas
            ref={canvasRef}
            width={720}
            height={500}
            className="w-full h-full object-cover"
          />

          {/* Rain Intensity Legend Bar */}
          <div className="absolute top-3 left-3 glass-pill px-3 py-1.5 rounded-2xl flex items-center gap-2 text-xs text-white/90">
            <span className="font-semibold text-white/70">Rain:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="Light" />
              <span className="text-[10px] text-white/80">Light</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" title="Moderate" />
              <span className="text-[10px] text-white/80">Mod</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" title="Heavy" />
              <span className="text-[10px] text-white/80">Heavy</span>
            </div>
          </div>

          {/* Quick action controls inside map */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <button
              onClick={() => setTimeOffset(0)}
              title="Reset to current time"
              aria-label="Reset radar to live current time"
              className="glass-pill p-2 rounded-xl text-white/80 hover:text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Time Scrubber Controls */}
        <div className="px-5 py-3.5 border-t border-white/15 bg-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-white/90">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                aria-label={isPlaying ? 'Pause radar animation' : 'Play radar animation'}
                className="w-8 h-8 rounded-full bg-cyan-400 text-slate-900 font-bold flex items-center justify-center hover:bg-cyan-300 active:scale-95 transition-all shadow-md"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>
              <span className="font-semibold text-sm text-cyan-300">
                {formatOffsetLabel(timeOffset)}
              </span>
            </div>

            <span className="text-white/60 text-[11px]">
              Next-generation composite radar
            </span>
          </div>

          {/* Timeline Range Slider */}
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-white/50 w-12 text-left">-60 min</span>
            <input
              type="range"
              min={-60}
              max={60}
              step={5}
              value={timeOffset}
              onChange={(e) => {
                setIsPlaying(false);
                setTimeOffset(parseInt(e.target.value, 10));
              }}
              aria-label="Radar timeline scrubber"
              className="flex-1 accent-cyan-400 h-1.5 bg-white/20 rounded-lg cursor-pointer"
            />
            <span className="text-[10px] text-white/50 w-12 text-right">+60 min</span>
          </div>
        </div>
      </div>
    </div>
  );
};
