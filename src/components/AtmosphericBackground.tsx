import React, { useEffect, useRef } from 'react';
import { ConditionType } from '../types/weather';
import { getAtmosphericTheme } from '../utils/weatherMath';

interface AtmosphericBackgroundProps {
  condition: ConditionType;
  isNight?: boolean;
}

export const AtmosphericBackground: React.FC<AtmosphericBackgroundProps> = ({ condition, isNight }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const theme = getAtmosphericTheme(condition);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particles system
    const particleType = theme.particleType;

    // Rain drops
    interface RainDrop {
      x: number;
      y: number;
      speed: number;
      length: number;
      opacity: number;
    }
    const rainDrops: RainDrop[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 12 + Math.random() * 14,
      length: 14 + Math.random() * 16,
      opacity: 0.2 + Math.random() * 0.45,
    }));

    // Snowflakes
    interface Snowflake {
      x: number;
      y: number;
      radius: number;
      speed: number;
      drift: number;
      opacity: number;
    }
    const snowflakes: Snowflake[] = Array.from({ length: 70 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 1.5 + Math.random() * 3,
      speed: 0.8 + Math.random() * 1.8,
      drift: -0.5 + Math.random() * 1.0,
      opacity: 0.3 + Math.random() * 0.6,
    }));

    // Stars
    interface Star {
      x: number;
      y: number;
      radius: number;
      baseOpacity: number;
      twinkleSpeed: number;
      phase: number;
    }
    const stars: Star[] = Array.from({ length: 90 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.7,
      radius: 0.8 + Math.random() * 1.8,
      baseOpacity: 0.3 + Math.random() * 0.6,
      twinkleSpeed: 0.02 + Math.random() * 0.04,
      phase: Math.random() * Math.PI * 2,
    }));

    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, width, height);

      if (particleType === 'rain' || particleType === 'thunder') {
        ctx.strokeStyle = 'rgba(210, 230, 255, 0.6)';
        ctx.lineWidth = 1.2;
        ctx.lineCap = 'round';

        for (let i = 0; i < rainDrops.length; i++) {
          const drop = rainDrops[i];
          ctx.beginPath();
          ctx.strokeStyle = `rgba(210, 230, 255, ${drop.opacity})`;
          ctx.moveTo(drop.x, drop.y);
          ctx.lineTo(drop.x - 2, drop.y + drop.length);
          ctx.stroke();

          drop.y += drop.speed;
          drop.x -= 1.2;

          if (drop.y > height) {
            drop.y = -drop.length;
            drop.x = Math.random() * (width + 50);
          }
        }
      } else if (particleType === 'snow') {
        for (let i = 0; i < snowflakes.length; i++) {
          const flake = snowflakes[i];
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${flake.opacity})`;
          ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
          ctx.fill();

          flake.y += flake.speed;
          flake.x += Math.sin(frameCount * 0.02 + i) * 0.6 + flake.drift;

          if (flake.y > height) {
            flake.y = -flake.radius;
            flake.x = Math.random() * width;
          }
        }
      } else if (particleType === 'stars' || isNight) {
        for (let i = 0; i < stars.length; i++) {
          const star = stars[i];
          const opacity = Math.max(0.1, star.baseOpacity + Math.sin(frameCount * star.twinkleSpeed + star.phase) * 0.3);
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme.particleType, isNight]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-1000">
      {/* Dynamic Base Gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${theme.bgGradient} transition-all duration-1000 ease-out`}
      />

      {/* Sun / Moon Orb Glow */}
      {condition === 'clear-day' && (
        <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-amber-300/25 blur-3xl animate-float-slow" />
      )}
      {condition === 'sunset' && (
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-72 rounded-full bg-rose-500/30 blur-3xl animate-pulse" />
      )}
      {condition === 'clear-night' && (
        <div className="absolute top-12 right-16 w-48 h-48 rounded-full bg-indigo-300/15 blur-2xl" />
      )}
      {condition === 'thunderstorm' && (
        <div className="absolute inset-0 bg-indigo-200/20 mix-blend-overlay animate-lightning pointer-events-none" />
      )}

      {/* Floating Volumetric Cloud Drifts */}
      {(condition === 'cloudy' || condition === 'rainy' || condition === 'foggy') && (
        <>
          <div className="absolute top-10 left-[-20%] w-[120%] h-64 bg-slate-400/10 blur-3xl rounded-full animate-cloud-drift-1" />
          <div className="absolute top-44 left-[-10%] w-[110%] h-80 bg-zinc-300/10 blur-3xl rounded-full animate-cloud-drift-2" />
        </>
      )}

      {/* Glass Frosting Ambient Vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/15 pointer-events-none" />

      {/* Dynamic Canvas Particles (Rain, Snow, Stars) */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
