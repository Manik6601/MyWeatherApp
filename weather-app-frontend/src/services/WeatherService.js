import axios from "axios";

// 🚨 Not recommended for production (but fine for learning/demo)
const API_KEY = "edfc978dfb628a15e15095296e640fa1";
const BASE_URL = "https://api.openweathermap.org/data/2.5/";

// Get weather by city
export async function getWeather(city) {
  try {
    const response = await axios.get(`${BASE_URL}weather`, {
      params: {
        q: city,
        appid: API_KEY,
        units: "metric",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching weather:", error);
    return null;
  }
}

// Get weather by coordinates
export async function getWeatherByCoords(lat, lon) {
  try {
    const response = await axios.get(`${BASE_URL}weather`, {
      params: {
        lat,
        lon,
        appid: API_KEY,
        units: "metric",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching weather by coords:", error);
    return null;
  }
}
