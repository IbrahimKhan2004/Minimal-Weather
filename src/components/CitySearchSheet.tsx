import React, { useState } from 'react';
import { Check, Plus, Search, Trash2, X } from 'lucide-react';
import { TemperatureUnit, WeatherCity } from '../types/weather';
import { GeocodingResult, searchCities } from '../services/weatherApi';
import { formatTemperature, getAtmosphericTheme } from '../utils/weatherMath';

interface CitySearchSheetProps {
  isOpen: boolean;
  onClose: () => void;
  savedCities: WeatherCity[];
  currentCityId: string;
  onSelectCity: (city: WeatherCity) => void;
  onAddCityByCoordinates: (name: string, lat: number, lon: number, region?: string, country?: string) => Promise<void>;
  onDeleteCity: (id: string) => void;
  unit: TemperatureUnit;
}

export const CitySearchSheet: React.FC<CitySearchSheetProps> = ({
  isOpen,
  onClose,
  savedCities,
  currentCityId,
  onSelectCity,
  onAddCityByCoordinates,
  onDeleteCity,
  unit,
}) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingCity, setIsAddingCity] = useState(false);

  if (!isOpen) return null;

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      const results = await searchCities(val);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectResult = async (res: GeocodingResult) => {
    setIsAddingCity(true);
    await onAddCityByCoordinates(res.name, res.latitude, res.longitude, res.admin1, res.country);
    setIsAddingCity(false);
    setQuery('');
    setSearchResults([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-2xl animate-fade-in">
      <div className="relative w-full max-w-xl max-h-[90vh] sm:max-h-[80vh] rounded-t-3xl sm:rounded-3xl overflow-hidden glass-panel flex flex-col shadow-2xl border border-white/20">
        {/* iOS Drag Handle on Mobile */}
        <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-lg font-bold text-white tracking-tight">Weather Locations</h2>
          <button
            onClick={onClose}
            aria-label="Close location search sheet"
            className="w-8 h-8 rounded-full glass-pill flex items-center justify-center text-white/80 hover:text-white active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-white/60" />
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Search for a city or airport..."
              aria-label="Search city name"
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-sm text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/40"
              autoFocus
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setSearchResults([]);
                }}
                className="absolute right-3 p-1 rounded-full text-white/60 hover:text-white"
                aria-label="Clear search input"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto no-scrollbar px-5 py-3 space-y-3">
          {/* Search Results Dropdown/List */}
          {query.trim().length >= 2 && (
            <div className="mb-4">
              <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                Search Results
              </div>

              {isSearching ? (
                <div className="py-4 text-center text-xs text-white/60 animate-pulse">
                  Searching locations...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-1.5">
                  {searchResults.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => handleSelectResult(res)}
                      disabled={isAddingCity}
                      className="w-full flex items-center justify-between p-3 rounded-2xl glass-card glass-card-interactive text-left group"
                    >
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                          {res.name}
                        </div>
                        <div className="text-xs text-white/60">
                          {res.admin1 ? `${res.admin1}, ` : ''}{res.country}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-white/70 group-hover:text-cyan-300" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-4 text-center text-xs text-white/60">
                  No cities found for &quot;{query}&quot;.
                </div>
              )}
            </div>
          )}

          {/* Saved Cities Cards List */}
          <div>
            <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2.5">
              Saved Locations
            </div>

            <div className="space-y-2.5">
              {savedCities.map((city) => {
                const isSelected = city.id === currentCityId;
                const theme = getAtmosphericTheme(city.condition);

                return (
                  <div
                    key={city.id}
                    onClick={() => {
                      onSelectCity(city);
                      onClose();
                    }}
                    className={`relative overflow-hidden p-4 rounded-3xl cursor-pointer transition-all duration-200 border group ${
                      isSelected
                        ? 'ring-2 ring-white/80 border-white/40 shadow-xl'
                        : 'border-white/15 hover:border-white/30'
                    }`}
                  >
                    {/* Background gradient from weather condition */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-r ${theme.bgGradient} opacity-75 group-hover:opacity-90 transition-opacity`}
                    />
                    <div className="absolute inset-0 backdrop-blur-md bg-black/15" />

                    {/* Card Content */}
                    <div className="relative z-10 flex items-center justify-between">
                      {/* Left: City Info */}
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-bold text-white tracking-tight">
                            {city.name}
                          </h3>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-300">
                              <Check className="w-3 h-3" /> Selected
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-white/80 mt-0.5">
                          {city.localTime}
                        </div>
                        <div className="text-xs font-medium text-white/95 mt-3">
                          {city.conditionText}
                        </div>
                      </div>

                      {/* Right: Temp & High/Low & Delete */}
                      <div className="flex flex-col items-end">
                        <div className="text-3xl font-light text-white tabular-nums font-['Outfit']">
                          {formatTemperature(city.temp, unit)}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-white/80 mt-1">
                          <span>H: {formatTemperature(city.high, unit)}</span>
                          <span>L: {formatTemperature(city.low, unit)}</span>
                        </div>

                        {/* Delete button (if more than 1 city) */}
                        {savedCities.length > 1 && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCity(city.id);
                            }}
                            title="Remove from saved cities"
                            aria-label={`Delete ${city.name} from saved locations`}
                            className="mt-2 p-1 text-white/40 hover:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-white/10 text-center text-xs text-white/50">
          Tap any location to view forecast details
        </div>
      </div>
    </div>
  );
};
