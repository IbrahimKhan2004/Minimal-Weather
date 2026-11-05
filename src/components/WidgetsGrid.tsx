import React from 'react';
import {
  Compass,
  Droplets,
  Eye,
  Gauge,
  Navigation,
  Radar,
  Sparkles,
  Sunrise,
  Sunset,
  Thermometer,
  Wind,
} from 'lucide-react';
import { PressureUnit, SpeedUnit, TemperatureUnit, WeatherCity } from '../types/weather';
import {
  formatPressure,
  formatTemperature,
  formatWindSpeed,
  getAQILevel,
  getUVLevel,
} from '../utils/weatherMath';

interface WidgetsGridProps {
  city: WeatherCity;
  unit: TemperatureUnit;
  speedUnit: SpeedUnit;
  pressureUnit: PressureUnit;
  onOpenRadar: () => void;
}

export const WidgetsGrid: React.FC<WidgetsGridProps> = ({
  city,
  unit,
  speedUnit,
  pressureUnit,
  onOpenRadar,
}) => {
  const uvInfo = getUVLevel(city.uv.index);
  const aqiInfo = getAQILevel(city.aqi.aqi);

  // Solar progress percentage for sun arc
  const sunProgress = Math.max(0, Math.min(1, city.sun.solarProgress));
  // Angle on semi-circle arc: from Math.PI (left) to 0 (right)
  const sunAngle = Math.PI * (1 - sunProgress);
  const arcRadius = 46;
  const arcCenterX = 60;
  const arcCenterY = 54;
  const sunX = arcCenterX + arcRadius * Math.cos(sunAngle);
  const sunY = arcCenterY - arcRadius * Math.sin(sunAngle);

  return (
    <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-white">
      {/* 1. AIR QUALITY (AQI) */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Air Quality</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 tabular-nums">
            {city.aqi.aqi} <span className="text-sm font-normal text-white/70">AQI</span>
          </div>
          <div className={`text-sm font-semibold mb-2 ${aqiInfo.colorClass}`}>
            {aqiInfo.category} · {city.aqi.primaryPollutant}
          </div>
        </div>

        {/* Segmented AQI Gradient Bar */}
        <div>
          <div className="w-full h-2 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 via-orange-500 to-rose-600 relative my-2 overflow-visible">
            <div
              className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md ring-1 ring-white/60 -translate-x-1/2"
              style={{
                left: `${Math.min(98, Math.max(2, (city.aqi.aqi / 300) * 100))}%`,
              }}
            />
          </div>
          <p className="text-xs text-white/75 leading-relaxed mt-2 line-clamp-2">
            {city.aqi.statement}
          </p>
        </div>
      </div>

      {/* 2. UV INDEX */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
            <Gauge className="w-3.5 h-3.5" />
            <span>UV Index</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 tabular-nums">
            {city.uv.index}
          </div>
          <div className={`text-sm font-semibold mb-2 ${uvInfo.colorClass}`}>
            {uvInfo.level}
          </div>
        </div>

        <div>
          {/* UV Meter Bar */}
          <div className="w-full h-2 rounded-full bg-gradient-to-r from-emerald-400 via-yellow-400 via-orange-400 to-purple-600 relative my-2 overflow-visible">
            <div
              className="absolute -top-1 w-4 h-4 rounded-full bg-white border-2 border-slate-900 shadow-md ring-1 ring-white/60 -translate-x-1/2"
              style={{
                left: `${Math.min(98, Math.max(2, (city.uv.index / 12) * 100))}%`,
              }}
            />
          </div>
          <p className="text-xs text-white/75 leading-relaxed mt-2 line-clamp-2">
            {uvInfo.advice}
          </p>
        </div>
      </div>

      {/* 3. SUNRISE & SUNSET */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
            <Sunrise className="w-3.5 h-3.5" />
            <span>Sunrise & Sunset</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-0.5">
            {city.sun.isNight ? city.sun.sunrise : city.sun.sunset}
          </div>
          <div className="text-xs text-white/70 font-medium">
            {city.sun.isNight ? 'Sunrise tomorrow' : 'Sunset today'}
          </div>
        </div>

        {/* Visual Solar Arc Canvas/SVG */}
        <div className="relative flex flex-col items-center justify-center my-1">
          <svg className="w-36 h-18 overflow-visible" viewBox="0 0 120 60">
            {/* Horizon line */}
            <line x1="5" y1="54" x2="115" y2="54" stroke="rgba(255,255,255,0.2)" strokeWidth="1" strokeDasharray="3 3" />
            {/* Solar arc background */}
            <path
              d="M 14 54 A 46 46 0 0 1 106 54"
              fill="none"
              stroke="rgba(255,255,255,0.25)"
              strokeWidth="2.5"
              strokeDasharray="4 4"
            />
            {/* Traveled arc */}
            <path
              d="M 14 54 A 46 46 0 0 1 106 54"
              fill="none"
              stroke="url(#sunArcGrad)"
              strokeWidth="3"
              strokeDasharray="144"
              strokeDashoffset={144 * (1 - sunProgress)}
            />
            <defs>
              <linearGradient id="sunArcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f43f5e" />
              </linearGradient>
            </defs>
            {/* Glowing Sun Position */}
            <circle cx={sunX} cy={sunY} r="5" fill="#fde047" className="animate-pulse" />
            <circle cx={sunX} cy={sunY} r="8" fill="rgba(253, 224, 71, 0.3)" />
          </svg>

          <div className="w-full flex items-center justify-between text-[11px] text-white/60 px-2 mt-1">
            <span>Rise: {city.sun.sunrise}</span>
            <span>Set: {city.sun.sunset}</span>
          </div>
        </div>
      </div>

      {/* 4. WIND & GUSTS */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
            <Wind className="w-3.5 h-3.5" />
            <span>Wind</span>
          </div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-2xl sm:text-3xl font-semibold tracking-tight tabular-nums">
              {formatWindSpeed(city.wind.speed, speedUnit)}
            </span>
          </div>
          <div className="text-xs text-white/70 font-medium">
            Gusts up to {formatWindSpeed(city.wind.gusts, speedUnit)}
          </div>
        </div>

        {/* Compass Dial Indicator */}
        <div className="flex items-center gap-4 my-1">
          <div className="relative w-14 h-14 rounded-full border border-white/25 flex items-center justify-center bg-white/5">
            <span className="absolute top-1 text-[9px] font-bold text-white/60">N</span>
            <span className="absolute bottom-1 text-[9px] font-bold text-white/60">S</span>
            <span className="absolute left-1.5 text-[9px] font-bold text-white/60">W</span>
            <span className="absolute right-1.5 text-[9px] font-bold text-white/60">E</span>
            {/* Rotating pointer */}
            <div
              className="w-full h-full flex items-center justify-center transition-transform duration-700"
              style={{ transform: `rotate(${city.wind.directionDeg}deg)` }}
            >
              <Navigation className="w-5 h-5 text-cyan-300 fill-cyan-400" />
            </div>
          </div>

          <div className="flex flex-col text-xs text-white/80">
            <span className="font-semibold text-white text-sm">
              {city.wind.direction} · {city.wind.directionDeg}°
            </span>
            <span className="text-white/60">{city.wind.beaufortScale}</span>
          </div>
        </div>
      </div>

      {/* 5. PRECIPITATION */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
            <Droplets className="w-3.5 h-3.5 text-cyan-300" />
            <span>Precipitation</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 tabular-nums">
            {city.precipitation.last24h}&quot;{' '}
            <span className="text-sm font-normal text-white/70">in last 24h</span>
          </div>
        </div>

        {/* Mini Precipitation History Bar Chart */}
        <div>
          <div className="flex items-end justify-between gap-1.5 h-12 pt-2 px-1">
            {city.precipitation.hourlyHistory.map((val, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                <div
                  className="w-full rounded-t-sm bg-cyan-400/80 transition-all duration-500"
                  style={{ height: `${Math.max(4, Math.min(100, (val / 0.5) * 100))}%` }}
                />
              </div>
            ))}
          </div>
          <p className="text-xs text-white/75 mt-2 line-clamp-1">
            {city.precipitation.nextExpected}
          </p>
        </div>
      </div>

      {/* 6. FEELS LIKE */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
            <Thermometer className="w-3.5 h-3.5" />
            <span>Feels Like</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 tabular-nums">
            {formatTemperature(city.feelsLike, unit)}
          </div>
        </div>

        <p className="text-xs text-white/75 leading-relaxed">
          {city.feelsLike < city.temp
            ? 'Wind is making it feel cooler than the actual temperature.'
            : city.feelsLike > city.temp
            ? 'Humidity is making it feel warmer than the actual temperature.'
            : 'Similar to the actual temperature.'}
        </p>
      </div>

      {/* 7. HUMIDITY & DEW POINT */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
            <Droplets className="w-3.5 h-3.5" />
            <span>Humidity</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 tabular-nums">
            {city.humidity}%
          </div>
        </div>

        <div>
          <div className="w-full h-1.5 rounded-full bg-black/25 overflow-hidden my-2">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `${city.humidity}%` }}
            />
          </div>
          <p className="text-xs text-white/75 leading-relaxed">
            The dew point is {formatTemperature(city.dewPoint, unit)} right now.
          </p>
        </div>
      </div>

      {/* 8. VISIBILITY */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
            <Eye className="w-3.5 h-3.5" />
            <span>Visibility</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 tabular-nums">
            {city.visibility} <span className="text-sm font-normal text-white/70">mi</span>
          </div>
        </div>

        <p className="text-xs text-white/75 leading-relaxed">
          {city.visibility >= 10
            ? 'Perfect clarity. Clear line of sight across the horizon.'
            : city.visibility >= 6
            ? 'Good visibility with mild haze or distant moisture.'
            : 'Reduced visibility due to precipitation or fog.'}
        </p>
      </div>

      {/* 9. PRESSURE */}
      <div className="glass-card rounded-3xl p-4 sm:p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
            <Compass className="w-3.5 h-3.5" />
            <span>Pressure</span>
          </div>
          <div className="text-2xl sm:text-3xl font-semibold tracking-tight mb-1 tabular-nums">
            {formatPressure(city.pressure, pressureUnit)}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-white/75">
          <span>Barometric trend:</span>
          <span className="font-semibold text-white capitalize flex items-center gap-1">
            {city.pressureTrend === 'rising' && '↑ Rising'}
            {city.pressureTrend === 'falling' && '↓ Falling'}
            {city.pressureTrend === 'steady' && '→ Steady'}
          </span>
        </div>
      </div>

      {/* 10. INTERACTIVE RADAR PREVIEW WIDGET (spanning 2-3 columns on wide screens) */}
      <div
        onClick={onOpenRadar}
        className="glass-card glass-card-interactive rounded-3xl p-4 sm:p-5 flex flex-col justify-between sm:col-span-2 lg:col-span-3 cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-white/80 text-xs font-semibold tracking-wider uppercase">
            <Radar className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span>Precipitation Radar</span>
          </div>
          <span className="text-xs font-medium text-cyan-300 group-hover:underline flex items-center gap-1">
            Tap to open radar →
          </span>
        </div>

        {/* Radar Map Simulation Canvas Box */}
        <div className="relative w-full h-32 sm:h-36 rounded-2xl overflow-hidden bg-slate-900/60 border border-white/15 flex items-center justify-center">
          {/* Faux map grid lines */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* Animated radar sweep line */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border border-cyan-400/30" />
            <div className="w-32 h-32 rounded-full border border-cyan-400/40" />
            <div className="w-16 h-16 rounded-full border border-cyan-400/50" />
            {/* Center city pin */}
            <div className="absolute w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#38bdf8]" />
          </div>

          {/* Simulated Rain Clouds Blobs */}
          <div className="absolute top-6 left-1/4 w-28 h-16 rounded-full bg-emerald-500/35 blur-md" />
          <div className="absolute top-8 left-1/3 w-16 h-12 rounded-full bg-yellow-400/40 blur-sm" />
          <div className="absolute bottom-6 right-1/4 w-32 h-20 rounded-full bg-cyan-400/30 blur-md" />

          {/* Overlay Tag */}
          <div className="absolute bottom-2.5 left-3 glass-pill px-2.5 py-1 rounded-full text-[11px] font-medium text-white/90">
            Live 2-Hour Radar Loop
          </div>

          <div className="absolute bottom-2.5 right-3 text-[10px] text-white/60">
            12-minute intervals
          </div>
        </div>
      </div>
    </div>
  );
};
