import React from 'react';
import { Clock, Sunrise, Sunset } from 'lucide-react';
import { HourlyForecast, TemperatureUnit } from '../types/weather';
import { formatTemperature } from '../utils/weatherMath';
import { WeatherIcon } from './WeatherIcon';

interface HourlyForecastCardProps {
  hourly: HourlyForecast[];
  unit: TemperatureUnit;
  headlineSummary?: string;
}

export const HourlyForecastCard: React.FC<HourlyForecastCardProps> = ({
  hourly,
  unit,
  headlineSummary = 'Sun and clear conditions expected around midday.',
}) => {
  return (
    <div className="glass-card rounded-3xl p-4 sm:p-5 w-full text-white shadow-xl backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center gap-2 text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
        <Clock className="w-3.5 h-3.5" />
        <span>Hourly Forecast</span>
      </div>

      {headlineSummary && (
        <p className="text-xs sm:text-sm text-white/90 font-medium mb-4 leading-relaxed">
          {headlineSummary}
        </p>
      )}

      {/* Horizontal Hourly Scroller */}
      <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-1 px-1">
        {hourly.map((hourItem, idx) => {
          if (hourItem.isSunEvent) {
            const isSunrise = hourItem.isSunEvent === 'sunrise';
            return (
              <div
                key={`sun-${idx}`}
                className="flex flex-col items-center justify-between min-w-[58px] shrink-0 text-center py-1 px-2 rounded-2xl bg-amber-500/15 border border-amber-400/25"
              >
                <span className="text-[11px] font-medium text-amber-200 whitespace-nowrap">
                  {hourItem.time}
                </span>
                <div className="my-2.5">
                  {isSunrise ? (
                    <Sunrise className="w-5 h-5 text-amber-300 animate-pulse" />
                  ) : (
                    <Sunset className="w-5 h-5 text-rose-300 animate-pulse" />
                  )}
                </div>
                <span className="text-xs font-semibold text-amber-100 whitespace-nowrap">
                  {hourItem.sunEventLabel || (isSunrise ? 'Sunrise' : 'Sunset')}
                </span>
              </div>
            );
          }

          const isNow = idx === 0 || hourItem.time === 'Now';

          return (
            <div
              key={`hour-${idx}`}
              className={`flex flex-col items-center justify-between min-w-[54px] shrink-0 text-center py-1.5 px-2 rounded-2xl transition-all ${
                isNow
                  ? 'bg-white/20 border border-white/30 shadow-inner'
                  : 'hover:bg-white/10'
              }`}
            >
              <span
                className={`text-xs whitespace-nowrap ${
                  isNow ? 'font-bold text-white' : 'font-medium text-white/80'
                }`}
              >
                {hourItem.time}
              </span>

              <div className="my-2.5 flex flex-col items-center">
                <WeatherIcon condition={hourItem.condition} className="w-5 h-5" />
                {hourItem.pop > 0 && (
                  <span className="text-[10px] font-bold text-cyan-300 mt-1 tabular-nums">
                    {hourItem.pop}%
                  </span>
                )}
              </div>

              <span className="text-sm font-semibold text-white tabular-nums">
                {formatTemperature(hourItem.temp, unit)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
