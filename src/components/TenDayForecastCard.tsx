import React from 'react';
import { Calendar } from 'lucide-react';
import { DailyForecast, TemperatureUnit } from '../types/weather';
import {
  calculateCurrentTempDotPosition,
  calculateDailyRangePercentages,
  formatTemperature,
} from '../utils/weatherMath';
import { WeatherIcon } from './WeatherIcon';

interface TenDayForecastCardProps {
  daily: DailyForecast[];
  unit: TemperatureUnit;
  currentTemp: number;
}

export const TenDayForecastCard: React.FC<TenDayForecastCardProps> = ({
  daily,
  unit,
  currentTemp,
}) => {
  // Find global min and max over the entire 10-day forecast to calibrate the bars
  const globalMin = Math.min(...daily.map((d) => d.minTemp));
  const globalMax = Math.max(...daily.map((d) => d.maxTemp));

  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5 w-full text-white shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-3">
        <Calendar className="w-3.5 h-3.5" />
        <span>10-Day Forecast</span>
      </div>

      {/* Daily Rows */}
      <div className="flex flex-col divide-y divide-white/10">
        {daily.map((item, idx) => {
          const isToday = item.day === 'Today' || idx === 0;
          const { leftPercent, widthPercent } = calculateDailyRangePercentages(
            item.minTemp,
            item.maxTemp,
            globalMin,
            globalMax
          );

          const dotPosition = isToday
            ? calculateCurrentTempDotPosition(currentTemp, globalMin, globalMax)
            : null;

          return (
            <div
              key={`day-${idx}`}
              className="py-2.5 sm:py-3 flex items-center justify-between gap-2 text-sm first:pt-1 last:pb-1"
            >
              {/* Day label */}
              <div className="w-16 sm:w-20 shrink-0">
                <span
                  className={`block truncate ${
                    isToday ? 'font-bold text-white' : 'font-medium text-white/90'
                  }`}
                >
                  {item.day}
                </span>
                <span className="text-[10px] text-white/50 block sm:hidden">
                  {item.dateStr}
                </span>
              </div>

              {/* Weather icon & rain chance */}
              <div className="w-14 sm:w-16 flex items-center justify-center gap-1 shrink-0">
                <WeatherIcon condition={item.condition} className="w-5 h-5" />
                {item.pop > 15 ? (
                  <span className="text-[11px] font-bold text-cyan-300 tabular-nums">
                    {item.pop}%
                  </span>
                ) : (
                  <span className="w-6" aria-hidden="true" />
                )}
              </div>

              {/* Low temp */}
              <span className="w-8 sm:w-10 text-right text-xs sm:text-sm font-medium text-white/70 tabular-nums shrink-0">
                {formatTemperature(item.minTemp, unit)}
              </span>

              {/* iOS Gradient Range Bar */}
              <div className="flex-1 px-2 flex items-center min-w-[70px] sm:min-w-[120px]">
                <div className="relative w-full h-1.5 bg-black/25 rounded-full overflow-visible">
                  {/* Active Day Range Gradient Bar */}
                  <div
                    className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-cyan-400 via-amber-300 to-rose-400 shadow-sm"
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                  />

                  {/* Current Temp Indicator Dot for Today */}
                  {isToday && dotPosition !== null && (
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-slate-900 shadow-md ring-1 ring-white/50"
                      style={{ left: `${dotPosition}%` }}
                      title={`Current Temperature: ${formatTemperature(currentTemp, unit)}`}
                    />
                  )}
                </div>
              </div>

              {/* High temp */}
              <span className="w-8 sm:w-10 text-right text-xs sm:text-sm font-semibold text-white tabular-nums shrink-0">
                {formatTemperature(item.maxTemp, unit)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
