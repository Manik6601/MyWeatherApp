import React from "react";

/**
 * Expects `forecast` array from OneCall daily (each item has dt, temp, weather, pop)
 * We display: Weekday, icon, min, max, chance of rain (pop)
 */
export default function ForecastCarousel({ forecast = [] }) {
  // forecast is daily[1..5] in App
  const dayName = (ts) =>
    new Date(ts * 1000).toLocaleDateString(undefined, { weekday: "short" });

  return (
    <div className="overflow-x-auto py-2">
      <div className="flex gap-3 px-1">
        {forecast.map((day) => (
          <div
            key={day.dt}
            className="min-w-[130px] bg-white/20 backdrop-blur-sm rounded-lg p-3 text-white flex-shrink-0 shadow-md transform transition hover:scale-105"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">{dayName(day.dt)}</div>
              <div className="text-xs text-white/80">{new Date(day.dt * 1000).getDate()}</div>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={`https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png`}
                alt="icon"
                className="w-14 h-14"
              />
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {Math.round(day.temp.max)}° / {Math.round(day.temp.min)}°
                </div>
                <div className="text-xs text-white/80">
                  Rain: {Math.round((day.pop || 0) * 100)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
