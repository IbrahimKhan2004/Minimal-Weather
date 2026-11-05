import { AirQuality, ConditionType, PressureUnit, SpeedUnit, TemperatureUnit, UVDetails } from '../types/weather';

/**
 * Converts Celsius to Fahrenheit
 */
export function celsiusToFahrenheit(celsius: number): number {
  return Math.round((celsius * 9) / 5 + 32);
}

/**
 * Converts Fahrenheit to Celsius
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return Math.round(((fahrenheit - 32) * 5) / 9);
}

/**
 * Formats temperature based on active unit
 */
export function formatTemperature(celsius: number, unit: TemperatureUnit): string {
  if (unit === 'fahrenheit') {
    return `${celsiusToFahrenheit(celsius)}°`;
  }
  return `${Math.round(celsius)}°`;
}

/**
 * Formats raw value for number display
 */
export function getConvertedTempValue(celsius: number, unit: TemperatureUnit): number {
  return unit === 'fahrenheit' ? celsiusToFahrenheit(celsius) : Math.round(celsius);
}

/**
 * Converts and formats wind speed
 */
export function formatWindSpeed(mph: number, unit: SpeedUnit): string {
  if (unit === 'kmh') {
    const kmh = Math.round(mph * 1.60934);
    return `${kmh} km/h`;
  }
  return `${Math.round(mph)} mph`;
}

/**
 * Formats barometric pressure
 */
export function formatPressure(hPa: number, unit: PressureUnit): string {
  if (unit === 'inHg') {
    const inHg = (hPa * 0.02953).toFixed(2);
    return `${inHg} inHg`;
  }
  return `${Math.round(hPa)} hPa`;
}

/**
 * Computes UV level, rating description, and badge tone
 */
export function getUVLevel(index: number): { level: UVDetails['level']; colorClass: string; advice: string } {
  if (index <= 2) {
    return {
      level: 'Low',
      colorClass: 'text-emerald-400',
      advice: 'No protection needed. You can safely stay outside.',
    };
  }
  if (index <= 5) {
    return {
      level: 'Moderate',
      colorClass: 'text-yellow-400',
      advice: 'Take precautions. Wear sunglasses and SPF 30+.',
    };
  }
  if (index <= 7) {
    return {
      level: 'High',
      colorClass: 'text-orange-400',
      advice: 'Protection required. Seek shade during midday hours.',
    };
  }
  if (index <= 10) {
    return {
      level: 'Very High',
      colorClass: 'text-red-400',
      advice: 'Extra protection essential. Avoid sun between 10am-4pm.',
    };
  }
  return {
    level: 'Extreme',
    colorClass: 'text-purple-400',
    advice: 'Take all precautions. Unprotected skin can burn in minutes.',
  };
}

/**
 * Computes Air Quality Category and color tone
 */
export function getAQILevel(aqi: number): {
  category: AirQuality['category'];
  colorClass: string;
  dotColor: string;
  statement: string;
} {
  if (aqi <= 50) {
    return {
      category: 'Good',
      colorClass: 'text-emerald-400',
      dotColor: 'bg-emerald-400',
      statement: 'Air quality is satisfactory and poses little or no risk.',
    };
  }
  if (aqi <= 100) {
    return {
      category: 'Moderate',
      colorClass: 'text-yellow-400',
      dotColor: 'bg-yellow-400',
      statement: 'Acceptable; unusually sensitive people should consider limiting prolonged outdoor exertion.',
    };
  }
  if (aqi <= 150) {
    return {
      category: 'Unhealthy for Sensitive',
      colorClass: 'text-orange-400',
      dotColor: 'bg-orange-400',
      statement: 'Members of sensitive groups may experience health effects.',
    };
  }
  if (aqi <= 200) {
    return {
      category: 'Unhealthy',
      colorClass: 'text-red-400',
      dotColor: 'bg-red-400',
      statement: 'Some members of the general public may experience health effects.',
    };
  }
  if (aqi <= 300) {
    return {
      category: 'Very Unhealthy',
      colorClass: 'text-purple-400',
      dotColor: 'bg-purple-400',
      statement: 'Health alert: The risk of health effects is increased for everyone.',
    };
  }
  return {
    category: 'Hazardous',
    colorClass: 'text-rose-500',
    dotColor: 'bg-rose-500',
    statement: 'Health warning of emergency conditions. Entire population is affected.',
  };
}

/**
 * Calculates the left offset and width percentage for iOS 10-day forecast temperature range bars
 */
export function calculateDailyRangePercentages(
  dayMin: number,
  dayMax: number,
  globalMin: number,
  globalMax: number
): { leftPercent: number; widthPercent: number } {
  const totalSpan = Math.max(1, globalMax - globalMin);
  const left = Math.max(0, Math.min(100, ((dayMin - globalMin) / totalSpan) * 100));
  const right = Math.max(0, Math.min(100, ((dayMax - globalMin) / totalSpan) * 100));
  const width = Math.max(6, right - left); // minimum 6% width so it's visible

  return {
    leftPercent: Math.round(left),
    widthPercent: Math.round(width),
  };
}

/**
 * Calculates current temperature dot position in the 10-day temperature range
 */
export function calculateCurrentTempDotPosition(currentTemp: number, globalMin: number, globalMax: number): number {
  const totalSpan = Math.max(1, globalMax - globalMin);
  const pos = ((currentTemp - globalMin) / totalSpan) * 100;
  return Math.max(2, Math.min(98, Math.round(pos)));
}

/**
 * Computes compass direction label from degrees
 */
export function getCompassDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((((degrees % 360) + 360) % 360) / 22.5) % 16;
  return directions[index];
}

/**
 * Returns dynamic atmosphere backdrop config based on condition and day/night
 */
export function getAtmosphericTheme(condition: ConditionType): {
  bgGradient: string;
  accentColor: string;
  particleType: 'none' | 'rain' | 'snow' | 'clouds' | 'stars' | 'thunder';
  overlayColor: string;
} {
  switch (condition) {
    case 'clear-day':
      return {
        bgGradient: 'from-sky-500 via-blue-600 to-indigo-700',
        accentColor: '#38bdf8',
        particleType: 'none',
        overlayColor: 'rgba(56, 189, 248, 0.15)',
      };
    case 'clear-night':
      return {
        bgGradient: 'from-slate-900 via-indigo-950 to-slate-950',
        accentColor: '#818cf8',
        particleType: 'stars',
        overlayColor: 'rgba(99, 102, 241, 0.1)',
      };
    case 'cloudy':
      return {
        bgGradient: 'from-slate-600 via-slate-700 to-zinc-800',
        accentColor: '#94a3b8',
        particleType: 'clouds',
        overlayColor: 'rgba(148, 163, 184, 0.15)',
      };
    case 'rainy':
      return {
        bgGradient: 'from-blue-900 via-slate-800 to-slate-950',
        accentColor: '#60a5fa',
        particleType: 'rain',
        overlayColor: 'rgba(96, 165, 250, 0.12)',
      };
    case 'thunderstorm':
      return {
        bgGradient: 'from-purple-950 via-slate-900 to-black',
        accentColor: '#c084fc',
        particleType: 'thunder',
        overlayColor: 'rgba(192, 132, 252, 0.15)',
      };
    case 'snow':
      return {
        bgGradient: 'from-slate-400 via-cyan-800 to-slate-900',
        accentColor: '#e0f2fe',
        particleType: 'snow',
        overlayColor: 'rgba(224, 242, 254, 0.15)',
      };
    case 'sunset':
      return {
        bgGradient: 'from-amber-600 via-rose-700 to-indigo-950',
        accentColor: '#fb923c',
        particleType: 'none',
        overlayColor: 'rgba(251, 146, 60, 0.18)',
      };
    case 'foggy':
      return {
        bgGradient: 'from-slate-500 via-zinc-700 to-stone-900',
        accentColor: '#cbd5e1',
        particleType: 'clouds',
        overlayColor: 'rgba(203, 213, 225, 0.15)',
      };
    default:
      return {
        bgGradient: 'from-sky-500 via-blue-600 to-indigo-800',
        accentColor: '#38bdf8',
        particleType: 'none',
        overlayColor: 'rgba(56, 189, 248, 0.15)',
      };
  }
}
