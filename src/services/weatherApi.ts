import { ConditionType, DailyForecast, HourlyForecast, WeatherCity } from '../types/weather';
import { INITIAL_CITIES } from '../data/mockCities';
import { getAQILevel, getUVLevel } from '../utils/weatherMath';

/**
 * Maps WMO weather code from Open-Meteo to ConditionType and human string
 */
export function mapWmoToCondition(code: number, isDay = true): { condition: ConditionType; text: string } {
  // 0: Clear sky
  if (code === 0) {
    return isDay
      ? { condition: 'clear-day', text: 'Clear Sky' }
      : { condition: 'clear-night', text: 'Clear Night' };
  }
  // 1, 2, 3: Mainly clear, partly cloudy, overcast
  if (code === 1) {
    return isDay
      ? { condition: 'clear-day', text: 'Mainly Clear' }
      : { condition: 'clear-night', text: 'Mostly Clear' };
  }
  if (code === 2 || code === 3) {
    return { condition: 'cloudy', text: code === 2 ? 'Partly Cloudy' : 'Overcast' };
  }
  // 45, 48: Fog
  if (code === 45 || code === 48) {
    return { condition: 'foggy', text: 'Foggy' };
  }
  // 51, 53, 55, 56, 57: Drizzle
  if (code >= 51 && code <= 57) {
    return { condition: 'rainy', text: 'Light Drizzle' };
  }
  // 61, 63, 65, 66, 67: Rain
  if (code >= 61 && code <= 67) {
    return { condition: 'rainy', text: 'Rain' };
  }
  // 71, 73, 75, 77, 85, 86: Snow
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) {
    return { condition: 'snow', text: 'Snow' };
  }
  // 80, 81, 82: Rain showers
  if (code >= 80 && code <= 82) {
    return { condition: 'rainy', text: 'Showers' };
  }
  // 95, 96, 99: Thunderstorm
  if (code >= 95) {
    return { condition: 'thunderstorm', text: 'Thunderstorm' };
  }

  return { condition: isDay ? 'clear-day' : 'clear-night', text: 'Fair' };
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

/**
 * Searches cities using Open-Meteo geocoding API or offline fallback list
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  try {
    const res = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=6&language=en&format=json`
    );
    if (res.ok) {
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        return data.results.map((r: any) => ({
          id: r.id,
          name: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          country: r.country || '',
          admin1: r.admin1 || '',
        }));
      }
    }
  } catch (err) {
    // Offline / hermetic network fallback
  }

  // Fallback to searching our curated mock cities
  const matched = INITIAL_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(trimmed) ||
      c.country.toLowerCase().includes(trimmed) ||
      c.region.toLowerCase().includes(trimmed)
  );

  return matched.map((c, i) => ({
    id: 1000 + i,
    name: c.name,
    latitude: c.lat,
    longitude: c.lon,
    country: c.country,
    admin1: c.region,
  }));
}

/**
 * Fetches real weather data from Open-Meteo, with fallback to initial mock cities
 */
export async function fetchLiveWeather(
  cityName: string,
  lat: number,
  lon: number,
  region = '',
  country = ''
): Promise<WeatherCity> {
  // Check if we have an exact match in initial cities first to reuse rich data
  const existingMock = INITIAL_CITIES.find(
    (c) => c.name.toLowerCase() === cityName.toLowerCase()
  );

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Open-Meteo returned status ${res.status}`);
    }

    const data = await res.json();
    const current = data.current;
    const isDay = current.is_day === 1;
    const { condition, text: conditionText } = mapWmoToCondition(current.weather_code, isDay);

    // Parse hourly forecast (take next 24 hours)
    const hourly: HourlyForecast[] = [];
    if (data.hourly && data.hourly.time) {
      const nowIdx = 0;
      for (let i = nowIdx; i < Math.min(nowIdx + 24, data.hourly.time.length); i++) {
        const timeStr = data.hourly.time[i];
        const dateObj = new Date(timeStr);
        const hours = dateObj.getHours();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHour = hours % 12 === 0 ? 12 : hours % 12;
        const displayTime = i === 0 ? 'Now' : `${formattedHour} ${ampm}`;

        const code = data.hourly.weather_code[i] ?? 0;
        const isHDay = hours >= 6 && hours <= 18;
        const hCond = mapWmoToCondition(code, isHDay);

        hourly.push({
          time: displayTime,
          hour: hours,
          temp: Math.round(data.hourly.temperature_2m[i]),
          condition: hCond.condition,
          conditionText: hCond.text,
          pop: Math.round(data.hourly.precipitation_probability[i] || 0),
        });
      }
    }

    // Parse daily forecast
    const daily: DailyForecast[] = [];
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    if (data.daily && data.daily.time) {
      for (let i = 0; i < Math.min(10, data.daily.time.length); i++) {
        const dateObj = new Date(data.daily.time[i]);
        const dayName = i === 0 ? 'Today' : daysOfWeek[dateObj.getDay()];
        const month = dateObj.toLocaleDateString('en-US', { month: 'short' });
        const dateNum = dateObj.getDate();
        const code = data.daily.weather_code[i] ?? 0;
        const dCond = mapWmoToCondition(code, true);

        daily.push({
          day: dayName,
          dateStr: `${month} ${dateNum}`,
          condition: dCond.condition,
          conditionText: dCond.text,
          minTemp: Math.round(data.daily.temperature_2m_min[i]),
          maxTemp: Math.round(data.daily.temperature_2m_max[i]),
          pop: Math.round(data.daily.precipitation_probability_max[i] || 0),
        });
      }
    }

    const sunriseIso = data.daily?.sunrise?.[0] || '';
    const sunsetIso = data.daily?.sunset?.[0] || '';
    const sunriseDate = sunriseIso ? new Date(sunriseIso) : new Date();
    const sunsetDate = sunsetIso ? new Date(sunsetIso) : new Date();

    const uvMax = Math.round(data.daily?.uv_index_max?.[0] || 4);
    const uvInfo = getUVLevel(uvMax);
    const windMph = Math.round((current.wind_speed_10m || 10) * 0.621371);
    const gustMph = Math.round((current.wind_gusts_10m || current.wind_speed_10m * 1.4) * 0.621371);

    const now = new Date();
    const localTimeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

    return {
      id: `${cityName.toLowerCase().replace(/\s+/g, '-')}-${Math.round(lat * 100)}`,
      name: cityName,
      region: region || existingMock?.region || '',
      country: country || existingMock?.country || '',
      lat,
      lon,
      localTime: localTimeStr,
      temp: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      high: daily[0]?.maxTemp ?? Math.round(current.temperature_2m + 3),
      low: daily[0]?.minTemp ?? Math.round(current.temperature_2m - 4),
      condition,
      conditionText,
      humidity: Math.round(current.relative_humidity_2m),
      dewPoint: Math.round(current.temperature_2m - (100 - current.relative_humidity_2m) / 5),
      visibility: 10,
      pressure: Math.round(current.surface_pressure),
      pressureTrend: 'steady',
      uv: {
        index: uvMax,
        level: uvInfo.level,
        advice: uvInfo.advice,
      },
      aqi: existingMock?.aqi || {
        aqi: 35,
        category: 'Good',
        primaryPollutant: 'PM2.5',
        statement: 'Air quality is within healthy outdoor thresholds.',
      },
      sun: {
        sunrise: sunriseDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        sunset: sunsetDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        dawn: '6:15 AM',
        dusk: '6:45 PM',
        dayLength: '10h 30m',
        solarProgress: isDay ? 0.5 : 0.0,
        isNight: !isDay,
      },
      wind: {
        speed: windMph,
        gusts: gustMph,
        directionDeg: current.wind_direction_10m || 0,
        direction: 'NW',
        beaufortScale: windMph > 18 ? 'Fresh Breeze' : 'Light Breeze',
      },
      precipitation: {
        last24h: current.precipitation || 0.0,
        nextExpected: current.precipitation > 0 ? 'Precipitation active' : 'None expected today',
        hourlyHistory: [0, 0, 0, 0, 0, 0, 0, 0],
      },
      hourly: hourly.length > 0 ? hourly : (existingMock?.hourly || []),
      daily: daily.length > 0 ? daily : (existingMock?.daily || []),
    };
  } catch (err) {
    // Return existing mock if available
    if (existingMock) {
      return existingMock;
    }

    // Default fallback city
    return INITIAL_CITIES[0];
  }
}
