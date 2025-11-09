import React from "react";

/**
 * Expects the OpenWeather `weather` object returned by the /weather endpoint
 * (fields like name, main.temp, weather[0], wind, sys.sunrise, sys.sunset etc.)
 */
function WeatherCard({ weather }) {
  if (!weather) return null;

  const iconCode = weather.weather?.[0]?.icon;
  const iconUrl = iconCode
    ? `https://openweathermap.org/img/wn/${iconCode}@2x.png`
    : null;

  // convert unix timestamp to local time string
  const timeFromUnix = (ts) => {
    if (!ts) return "";
    const d = new Date(ts * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="weather-card">
      <div className="card-top">
        <div>
          <h2 className="city-name">{weather.name}</h2>
          <p className="desc">{weather.weather?.[0]?.description}</p>
        </div>
        {iconUrl && <img src={iconUrl} alt="weather icon" className="weather-icon" />}
      </div>

      <div className="temp-row">
        <div className="temp-big">{Math.round(weather.main.temp)}°C</div>
        <div className="temp-small">
          Feels like: {Math.round(weather.main.feels_like)}°C
        </div>
      </div>

      <div className="details-grid">
        <div>💧 Humidity: {weather.main.humidity}%</div>
        <div>💨 Wind: {weather.wind.speed} m/s</div>
        <div>📉 Pressure: {weather.main.pressure} hPa</div>
        <div>🌅 Sunrise: {timeFromUnix(weather.sys?.sunrise)}</div>
        <div>🌇 Sunset: {timeFromUnix(weather.sys?.sunset)}</div>
      </div>
    </div>
  );
}

export default WeatherCard;
