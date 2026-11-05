import React from 'react';
import { LocateFixed, MapPin, Radar, Search } from 'lucide-react';
import { TemperatureUnit, WeatherCity } from '../types/weather';
import { formatTemperature } from '../utils/weatherMath';

interface WeatherHeaderProps {
  city: WeatherCity;
  unit: TemperatureUnit;
  onToggleUnit: () => void;
  onOpenSearch: () => void;
  onOpenRadar: () => void;
  onUseCurrentLocation: () => void;
  isLoadingLocation?: boolean;
}

export const WeatherHeader: React.FC<WeatherHeaderProps> = ({
  city,
  unit,
  onToggleUnit,
  onOpenSearch,
  onOpenRadar,
  onUseCurrentLocation,
  isLoadingLocation,
}) => {
  return (
    <header className="w-full flex flex-col items-center pt-3 pb-6 px-4 max-w-4xl mx-auto">
      {/* Top Glass Control Bar */}
      <div className="w-full flex items-center justify-between mb-8 gap-3">
        {/* Left: Saved Cities & Search Button */}
        <button
          onClick={onOpenSearch}
          aria-label="Search and manage saved cities"
          className="glass-pill px-4 py-2 rounded-full flex items-center gap-2.5 text-xs font-medium text-white/90 hover:text-white hover:bg-white/25 active:scale-95 transition-all shadow-sm"
        >
          <Search className="w-3.5 h-3.5 text-white/80" />
          <span className="hidden sm:inline">Search cities</span>
          <span className="sm:hidden">Cities</span>
        </button>

        {/* Center: Quick Indicators & Geolocation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUseCurrentLocation}
            disabled={isLoadingLocation}
            aria-label="Use current location"
            title="Use current GPS location"
            className={`glass-pill p-2 rounded-full text-white/90 hover:text-white hover:bg-white/25 active:scale-95 transition-all ${
              isLoadingLocation ? 'animate-spin' : ''
            }`}
          >
            <LocateFixed className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenRadar}
            aria-label="Open weather radar map"
            title="Open Interactive Radar"
            className="glass-pill px-3 py-2 rounded-full flex items-center gap-1.5 text-xs font-medium text-white/90 hover:text-white hover:bg-white/25 active:scale-95 transition-all"
          >
            <Radar className="w-4 h-4 text-cyan-300 animate-pulse" />
            <span className="hidden md:inline">Radar</span>
          </button>
        </div>

        {/* Right: Unit Toggle (°C / °F) */}
        <button
          onClick={onToggleUnit}
          aria-label={`Switch temperature unit, currently ${unit === 'celsius' ? 'Celsius' : 'Fahrenheit'}`}
          className="glass-pill px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-semibold tracking-wide text-white/90 hover:text-white hover:bg-white/25 active:scale-95 transition-all"
        >
          <span className={unit === 'celsius' ? 'text-white font-bold' : 'text-white/50'}>°C</span>
          <span className="text-white/30">|</span>
          <span className={unit === 'fahrenheit' ? 'text-white font-bold' : 'text-white/50'}>°F</span>
        </button>
      </div>

      {/* iOS Weather Hero Typography */}
      <div className="flex flex-col items-center text-center select-none">
        {/* City & Region */}
        <div className="flex items-center gap-1.5 text-white/90 mb-1">
          <MapPin className="w-4 h-4 text-white/70" />
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white drop-shadow-md">
            {city.name}
          </h1>
        </div>

        <p className="text-xs sm:text-sm font-medium text-white/70 mb-2 drop-shadow">
          {city.region ? `${city.region}, ${city.country}` : city.country}
        </p>

        {/* Big Temperature Hero Number */}
        <div className="relative my-1">
          <span className="text-7xl sm:text-8xl md:text-9xl font-light tracking-tighter text-white drop-shadow-lg font-['Outfit'] tabular-nums leading-none">
            {formatTemperature(city.temp, unit)}
          </span>
        </div>

        {/* Condition Text */}
        <div className="text-lg sm:text-xl font-medium text-white/95 drop-shadow mb-1.5">
          {city.conditionText}
        </div>

        {/* High & Low Range */}
        <div className="flex items-center gap-3 text-sm font-medium text-white/85 drop-shadow">
          <span>H: {formatTemperature(city.high, unit)}</span>
          <span className="text-white/40">·</span>
          <span>L: {formatTemperature(city.low, unit)}</span>
        </div>
      </div>
    </header>
  );
};
