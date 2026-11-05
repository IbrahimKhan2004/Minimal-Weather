import React, { useState } from 'react';
import { AtmosphericBackground } from './components/AtmosphericBackground';
import { CitySearchSheet } from './components/CitySearchSheet';
import { ConditionSimulatorBar } from './components/ConditionSimulatorBar';
import { HourlyForecastCard } from './components/HourlyForecastCard';
import { RadarModal } from './components/RadarModal';
import { TenDayForecastCard } from './components/TenDayForecastCard';
import { WeatherHeader } from './components/WeatherHeader';
import { WidgetsGrid } from './components/WidgetsGrid';
import { INITIAL_CITIES } from './data/mockCities';
import { fetchLiveWeather } from './services/weatherApi';
import { ConditionType, PressureUnit, SpeedUnit, TemperatureUnit, WeatherCity } from './types/weather';

export default function App() {
  const [savedCities, setSavedCities] = useState<WeatherCity[]>(INITIAL_CITIES);
  const [currentCityIndex, setCurrentCityIndex] = useState(0);
  const [unit, setUnit] = useState<TemperatureUnit>('celsius');
  const [speedUnit] = useState<SpeedUnit>('mph');
  const [pressureUnit] = useState<PressureUnit>('hPa');

  // Condition override simulation
  const [simulatedCondition, setSimulatedCondition] = useState<ConditionType | null>(null);

  // Modals
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isRadarOpen, setIsRadarOpen] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const activeCity = savedCities[currentCityIndex] || savedCities[0];
  const effectiveCondition = simulatedCondition || activeCity.condition;

  // Toggle °C / °F
  const handleToggleUnit = () => {
    setUnit((prev) => (prev === 'celsius' ? 'fahrenheit' : 'celsius'));
  };

  // Select city from list
  const handleSelectCity = (city: WeatherCity) => {
    const idx = savedCities.findIndex((c) => c.id === city.id);
    if (idx !== -1) {
      setCurrentCityIndex(idx);
    } else {
      setSavedCities((prev) => [city, ...prev]);
      setCurrentCityIndex(0);
    }
    setSimulatedCondition(null);
  };

  // Add new city by search coordinates
  const handleAddCityByCoordinates = async (
    name: string,
    lat: number,
    lon: number,
    region?: string,
    country?: string
  ) => {
    const newCity = await fetchLiveWeather(name, lat, lon, region, country);
    setSavedCities((prev) => {
      const exists = prev.find((c) => c.name.toLowerCase() === name.toLowerCase());
      if (exists) return prev;
      return [newCity, ...prev];
    });
    setCurrentCityIndex(0);
    setSimulatedCondition(null);
  };

  // Delete saved city
  const handleDeleteCity = (id: string) => {
    if (savedCities.length <= 1) return;
    const newCities = savedCities.filter((c) => c.id !== id);
    setSavedCities(newCities);
    if (currentCityIndex >= newCities.length) {
      setCurrentCityIndex(0);
    }
  };

  // Request browser geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const userCity = await fetchLiveWeather('Current Location', lat, lon);
          setSavedCities((prev) => [userCity, ...prev.filter((c) => c.name !== 'Current Location')]);
          setCurrentCityIndex(0);
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      (err) => {
        console.warn('Geolocation denied or unavailable, maintaining preset city', err);
        setIsLoadingLocation(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="relative min-h-screen text-white select-none pb-16 flex flex-col items-center">
      {/* 1. Dynamic Atmospheric Background with Particle Engine */}
      <AtmosphericBackground
        condition={effectiveCondition}
        isNight={activeCity.sun.isNight && !simulatedCondition}
      />

      {/* 2. Main Weather Container */}
      <main className="w-full max-w-4xl px-3 sm:px-6 flex flex-col items-center space-y-4 sm:space-y-6 z-10 pt-2">
        {/* Header Hero Section */}
        <WeatherHeader
          city={{
            ...activeCity,
            condition: effectiveCondition,
          }}
          unit={unit}
          onToggleUnit={handleToggleUnit}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenRadar={() => setIsRadarOpen(true)}
          onUseCurrentLocation={handleUseCurrentLocation}
          isLoadingLocation={isLoadingLocation}
        />

        {/* Condition Preset Atmosphere Simulator */}
        <ConditionSimulatorBar
          currentCondition={effectiveCondition}
          onSelectCondition={(cond) => setSimulatedCondition(cond)}
          onResetCondition={() => setSimulatedCondition(null)}
          isSimulated={simulatedCondition !== null}
        />

        {/* Hourly Forecast Ribbon */}
        <HourlyForecastCard
          hourly={activeCity.hourly}
          unit={unit}
          headlineSummary={
            effectiveCondition === 'rainy'
              ? 'Precipitation expected throughout the day. Rain showers likely.'
              : effectiveCondition === 'thunderstorm'
              ? 'Thunderstorms with gusty winds and heavy rain squalls.'
              : effectiveCondition === 'snow'
              ? 'Cold Arctic airflow with light snowfall accumulation.'
              : 'Clear and pleasant conditions continuing into tonight.'
          }
        />

        {/* 10-Day Outlook Forecast */}
        <TenDayForecastCard
          daily={activeCity.daily}
          unit={unit}
          currentTemp={activeCity.temp}
        />

        {/* iOS Bento Widgets Grid */}
        <WidgetsGrid
          city={activeCity}
          unit={unit}
          speedUnit={speedUnit}
          pressureUnit={pressureUnit}
          onOpenRadar={() => setIsRadarOpen(true)}
        />

        {/* iOS-Style City Pager Dots Indicator */}
        <footer className="w-full flex items-center justify-center gap-2 pt-4 pb-2">
          {savedCities.map((city, idx) => (
            <button
              key={city.id}
              onClick={() => {
                setCurrentCityIndex(idx);
                setSimulatedCondition(null);
              }}
              aria-label={`Switch to ${city.name}`}
              className={`transition-all duration-300 rounded-full ${
                idx === currentCityIndex
                  ? 'w-6 h-2 bg-white shadow-md'
                  : 'w-2 h-2 bg-white/40 hover:bg-white/70'
              }`}
            />
          ))}
        </footer>
      </main>

      {/* 3. Interactive Weather Radar Modal */}
      <RadarModal
        isOpen={isRadarOpen}
        onClose={() => setIsRadarOpen(false)}
        city={activeCity}
      />

      {/* 4. iOS City Search & Management Sheet */}
      <CitySearchSheet
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        savedCities={savedCities}
        currentCityId={activeCity.id}
        onSelectCity={handleSelectCity}
        onAddCityByCoordinates={handleAddCityByCoordinates}
        onDeleteCity={handleDeleteCity}
        unit={unit}
      />
    </div>
  );
}
