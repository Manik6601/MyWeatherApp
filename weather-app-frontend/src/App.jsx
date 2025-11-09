import { useEffect, useState } from "react";
import ForecastCarousel from "./components/ForecastCarousel";

const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

export default function App() {
  const [city, setCity] = useState("");
  const [current, setCurrent] = useState(null); // current weather (weather endpoint)
  const [forecast, setForecast] = useState([]); // daily forecast (onecall)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [bgClass, setBgClass] = useState(
    "from-sky-400 via-blue-500 to-indigo-600"
  );
  const [animation, setAnimation] = useState("");

  // Helper: pick background + animation based on weather + time
  function updateThemeAndAnimation(weatherObj) {
    if (!weatherObj) {
      setBgClass("from-sky-400 via-blue-500 to-indigo-600");
      setAnimation("");
      return;
    }
    const main = (weatherObj.weather?.[0]?.main || "").toLowerCase();
    const isDay =
      weatherObj.dt >= weatherObj.sys?.sunrise &&
      weatherObj.dt <= weatherObj.sys?.sunset;

    let bg = "from-sky-400 via-blue-500 to-indigo-600";
    let anim = "";

    if (!isDay) bg = "from-gray-900 via-blue-900 to-black";

    if (main.includes("clear")) {
      bg = isDay
        ? "from-yellow-300 via-orange-400 to-pink-500"
        : "from-blue-900 via-gray-800 to-black";
      anim = isDay ? "sunrise" : "stars";
    } else if (main.includes("cloud")) {
      bg = isDay
        ? "from-gray-300 via-gray-400 to-blue-400"
        : "from-gray-700 via-gray-800 to-black";
      anim = "clouds";
    } else if (main.includes("rain") || main.includes("drizzle")) {
      bg = isDay
        ? "from-blue-400 via-blue-600 to-gray-700"
        : "from-gray-800 via-blue-900 to-black";
      anim = "rain";
    } else if (main.includes("snow")) {
      bg = isDay
        ? "from-blue-100 via-sky-200 to-white"
        : "from-gray-600 via-gray-800 to-blue-900";
      anim = "snow";
    } else if (main.includes("thunder")) {
      bg = "from-gray-700 via-yellow-600 to-gray-900";
      anim = "lightning";
    } else {
      anim = "";
    }

    setBgClass(bg);
    setAnimation(anim);
  }

  // Renders the animation layers (these classes rely on your index.css additions)
  const renderAnimation = () => {
    switch (animation) {
      case "sunrise":
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-44 h-44 bg-yellow-400 rounded-full opacity-70 animate-bounce-slow" />
          </div>
        );
      case "clouds":
        return (
          <div className="absolute inset-0 pointer-events-none">
            <div className="cloud one" />
            <div className="cloud two" />
            <div className="cloud three" />
          </div>
        );
      case "rain":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {/* raindrops positioned with CSS -- small performance cost */}
            {[...Array(28)].map((_, i) => (
              <div
                key={i}
                className="raindrop"
                style={{ left: `${(i * 3.6) % 100}%`, animationDelay: `${(i % 5) * 0.15}s` }}
              />
            ))}
          </div>
        );
      case "snow":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(18)].map((_, i) => (
              <div
                key={i}
                className="snowflake"
                style={{ left: `${(i * 5.5) % 100}%`, animationDelay: `${(i % 6) * 0.3}s` }}
              >
                ❄️
              </div>
            ))}
          </div>
        );
      case "stars":
        return (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="star"
                style={{
                  left: `${(i * 7.3) % 100}%`,
                  top: `${(i * 9.1) % 100}%`,
                  animationDelay: `${(i % 4) * 0.4}s`,
                }}
              />
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  // Fetch forecast + current by city name
  async function fetchByCityName(name) {
    setError("");
    setLoading(true);
    try {
      // 1) get current weather (gives coord & city name)
      const curRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(
          name
        )}&units=metric&appid=${API_KEY}`
      );
      const curJson = await curRes.json();
      if (curJson.cod && curJson.cod !== 200) {
        throw new Error(curJson.message || "City not found");
      }

      // 2) get onecall daily forecast with coords
      const { coord } = curJson;
      const oneRes = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${coord.lat}&lon=${coord.lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`
      );
      const oneJson = await oneRes.json();

      setCurrent(curJson);
      // daily[0] is today; show next 5 days -> daily[1..5]
      const fiveDays = (oneJson.daily || []).slice(1, 6);
      setForecast(fiveDays);
      updateThemeAndAnimation(curJson);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch weather");
      setCurrent(null);
      setForecast([]);
      updateThemeAndAnimation(null);
    } finally {
      setLoading(false);
    }
  }

  // Fetch forecast + current by coords (used for geolocation)
  async function fetchByCoords(lat, lon) {
    setError("");
    setLoading(true);
    try {
      // current / name
      const curRes = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
      );
      const curJson = await curRes.json();
      if (curJson.cod && curJson.cod !== 200) {
        throw new Error(curJson.message || "Location weather not found");
      }

      // onecall
      const oneRes = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly,alerts&units=metric&appid=${API_KEY}`
      );
      const oneJson = await oneRes.json();

      setCurrent(curJson);
      const fiveDays = (oneJson.daily || []).slice(1, 6);
      setForecast(fiveDays);
      updateThemeAndAnimation(curJson);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to fetch location weather");
      setCurrent(null);
      setForecast([]);
      updateThemeAndAnimation(null);
    } finally {
      setLoading(false);
    }
  }

  // On load, try to auto-detect location
  useEffect(() => {
    if (!navigator.geolocation) {
      // if no geolocation, optionally show a default city (do nothing)
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        fetchByCoords(pos.coords.latitude, pos.coords.longitude);
      },
      (err) => {
        // user blocked or error — keep blank until they search manually
        console.warn("Geolocation failed:", err);
      },
      { timeout: 10000 }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Manual search handler
  function onSearch(e) {
    e?.preventDefault();
    if (!city || !city.trim()) {
      setError("Type a city name to search");
      return;
    }
    fetchByCityName(city.trim());
  }

  return (
    <div
      className={`relative min-h-screen flex items-center justify-center transition-all duration-700 bg-gradient-to-br ${bgClass} overflow-hidden`}
    >
      {renderAnimation()}

      <div className="relative z-10 w-full px-4 max-w-3xl">
        <header className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white drop-shadow-md">🌤 Weather</h1>
          <p className="text-sm text-white/90 mt-1">Current + 5-day forecast</p>
        </header>

        {/* Search */}
        <form onSubmit={onSearch} className="flex gap-2 justify-center mb-4">
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search city (e.g., Mumbai)"
            className="px-3 py-2 rounded-md outline-none w-60 shadow-sm"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-white/30 text-white hover:bg-white/50 transition"
          >
            Search
          </button>
          <button
            type="button"
            onClick={() => {
              setError("");
              setCity("");
              setCurrent(null);
              setForecast([]);
              // try geolocation again
              navigator.geolocation.getCurrentPosition(
                (pos) => fetchByCoords(pos.coords.latitude, pos.coords.longitude),
                () => setError("Location denied"),
                { timeout: 10000 }
              );
            }}
            className="px-3 py-2 rounded-md bg-white/20 text-white hover:bg-white/40 transition"
          >
            Use my location
          </button>
        </form>

        {/* Error / Loading */}
        {error && (
          <div className="max-w-md mx-auto mb-3 p-2 bg-white/30 text-red-200 rounded-md">
            {error}
          </div>
        )}
        {loading && (
          <div className="flex justify-center mb-3">
            <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Current Weather Card */}
        {current && !loading && (
          <div className="mx-auto mb-4 max-w-md">
            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 text-center border border-white/30 shadow-lg animate-fadeIn">
              <div className="flex items-center justify-center gap-4">
                <img
                  src={`https://openweathermap.org/img/wn/${current.weather[0].icon}@4x.png`}
                  alt="icon"
                  className="w-28 h-28"
                />
                <div className="text-left">
                  <h2 className="text-2xl font-semibold text-white drop-shadow">
                    {current.name}
                  </h2>
                  <p className="text-white/90 capitalize">
                    {current.weather[0].description}
                  </p>
                  <div className="text-4xl font-bold text-white mt-2">
                    {Math.round(current.main.temp)}°C
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-4 text-white/90">
                <div>💧 Humidity: <b>{current.main.humidity}%</b></div>
                <div>🌬 Wind: <b>{Math.round(current.wind.speed)} m/s</b></div>
                <div>🌡 Feels: <b>{Math.round(current.main.feels_like)}°C</b></div>
                <div>📈 Pressure: <b>{current.main.pressure} hPa</b></div>
              </div>
            </div>
          </div>
        )}

        {/* 5-day Forecast Carousel */}
        {forecast && forecast.length > 0 && (
          <div className="mb-8">
            <h3 className="text-white font-semibold mb-3">5-Day Forecast</h3>
            <ForecastCarousel forecast={forecast} />
          </div>
        )}

        <footer className="text-center text-white/80 mt-6">
          <small>Data from OpenWeather • Forecast shows next 5 days</small>
        </footer>
      </div>
    </div>
  );
}
