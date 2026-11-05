import React from 'react';
import {
  Cloud,
  CloudLightning,
  CloudRain,
  Moon,
  Sliders,
  Snowflake,
  Sun,
  Sunset,
} from 'lucide-react';
import { ConditionType } from '../types/weather';

interface ConditionSimulatorBarProps {
  currentCondition: ConditionType;
  onSelectCondition: (condition: ConditionType) => void;
  onResetCondition: () => void;
  isSimulated: boolean;
}

export const ConditionSimulatorBar: React.FC<ConditionSimulatorBarProps> = ({
  currentCondition,
  onSelectCondition,
  onResetCondition,
  isSimulated,
}) => {
  const presets: { condition: ConditionType; label: string; icon: React.ReactNode }[] = [
    { condition: 'clear-day', label: 'Sun', icon: <Sun className="w-3.5 h-3.5 text-amber-300" /> },
    { condition: 'rainy', label: 'Rain', icon: <CloudRain className="w-3.5 h-3.5 text-cyan-300" /> },
    { condition: 'thunderstorm', label: 'Storm', icon: <CloudLightning className="w-3.5 h-3.5 text-purple-300" /> },
    { condition: 'snow', label: 'Snow', icon: <Snowflake className="w-3.5 h-3.5 text-sky-200" /> },
    { condition: 'sunset', label: 'Sunset', icon: <Sunset className="w-3.5 h-3.5 text-rose-300" /> },
    { condition: 'clear-night', label: 'Night', icon: <Moon className="w-3.5 h-3.5 text-indigo-300" /> },
    { condition: 'cloudy', label: 'Clouds', icon: <Cloud className="w-3.5 h-3.5 text-slate-300" /> },
  ];

  return (
    <div className="w-full flex items-center justify-center my-3 px-2">
      <div className="glass-pill px-2.5 py-1.5 rounded-full flex items-center gap-1 sm:gap-2 shadow-lg max-w-full overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-white/70 px-1 shrink-0">
          <Sliders className="w-3 h-3 text-cyan-300" />
          <span className="hidden sm:inline">Theme:</span>
        </div>

        {presets.map((preset) => {
          const isActive = currentCondition === preset.condition;
          return (
            <button
              key={preset.condition}
              onClick={() => onSelectCondition(preset.condition)}
              aria-label={`Simulate ${preset.label} weather`}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-white/30 text-white shadow-sm ring-1 ring-white/50'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              {preset.icon}
              <span className="text-[11px]">{preset.label}</span>
            </button>
          );
        })}

        {isSimulated && (
          <button
            onClick={onResetCondition}
            aria-label="Reset to city default condition"
            className="text-[10px] font-semibold text-cyan-300 hover:text-white px-2 py-0.5 rounded-full hover:bg-white/10 transition-colors shrink-0"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
};
