/**
 * Core Weather & iOS Glassmorphism Type Definitions
 */

export type ConditionType =
  | 'clear-day'
  | 'clear-night'
  | 'cloudy'
  | 'rainy'
  | 'thunderstorm'
  | 'snow'
  | 'sunset'
  | 'foggy';

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type SpeedUnit = 'mph' | 'kmh';
export type PressureUnit = 'hPa' | 'inHg';

export interface HourlyForecast {
  time: string;
  hour: number;
  temp: number; // in Celsius
  condition: ConditionType;
  conditionText: string;
  pop: number; // probability of precipitation 0-100%
  isSunEvent?: 'sunrise' | 'sunset';
  sunEventLabel?: string;
}

export interface DailyForecast {
  day: string;
  dateStr: string;
  condition: ConditionType;
  conditionText: string;
  minTemp: number; // Celsius
  maxTemp: number; // Celsius
  pop: number; // Probability of precipitation %
}

export interface AirQuality {
  aqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  primaryPollutant: string;
  statement: string;
}

export interface UVDetails {
  index: number;
  level: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  advice: string;
}

export interface SunTimes {
  sunrise: string;
  sunset: string;
  dawn: string;
  dusk: string;
  dayLength: string;
  solarProgress: number; // 0 to 1
  isNight: boolean;
}

export interface WindDetails {
  speed: number; // mph
  gusts: number; // mph
  directionDeg: number;
  direction: string;
  beaufortScale: string;
}

export interface PrecipitationDetails {
  last24h: number; // inches
  nextExpected: string;
  hourlyHistory: number[]; // 8 periods (e.g. every 3 hrs)
}

export interface WeatherCity {
  id: string;
  name: string;
  region: string;
  country: string;
  lat: number;
  lon: number;
  localTime: string;
  temp: number; // Celsius
  feelsLike: number; // Celsius
  high: number; // Celsius
  low: number; // Celsius
  condition: ConditionType;
  conditionText: string;
  humidity: number; // %
  dewPoint: number; // Celsius
  visibility: number; // miles
  pressure: number; // hPa
  pressureTrend: 'rising' | 'falling' | 'steady';
  uv: UVDetails;
  aqi: AirQuality;
  sun: SunTimes;
  wind: WindDetails;
  precipitation: PrecipitationDetails;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
}
