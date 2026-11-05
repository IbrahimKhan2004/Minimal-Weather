import React from 'react';
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  Moon,
  Snowflake,
  Sun,
  Sunset,
} from 'lucide-react';
import { ConditionType } from '../types/weather';

interface WeatherIconProps {
  condition: ConditionType;
  className?: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ condition, className = 'w-5 h-5' }) => {
  switch (condition) {
    case 'clear-day':
      return <Sun className={`${className} text-amber-300 drop-shadow`} />;
    case 'clear-night':
      return <Moon className={`${className} text-indigo-200 drop-shadow`} />;
    case 'cloudy':
      return <Cloud className={`${className} text-slate-200 drop-shadow`} />;
    case 'rainy':
      return <CloudRain className={`${className} text-cyan-300 drop-shadow`} />;
    case 'thunderstorm':
      return <CloudLightning className={`${className} text-purple-300 drop-shadow animate-pulse`} />;
    case 'snow':
      return <Snowflake className={`${className} text-sky-100 drop-shadow`} />;
    case 'sunset':
      return <Sunset className={`${className} text-amber-400 drop-shadow`} />;
    case 'foggy':
      return <CloudFog className={`${className} text-slate-300 drop-shadow`} />;
    default:
      return <Sun className={`${className} text-amber-300 drop-shadow`} />;
  }
};
