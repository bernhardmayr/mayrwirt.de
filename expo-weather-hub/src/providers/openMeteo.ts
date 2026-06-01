import type {
  Coordinates,
  CurrentWeather,
  ForecastDay,
  ProviderCredentials,
  WeatherCondition,
  WeatherForecast,
  WeatherProvider,
} from './types';

function wmoToCondition(code: number): WeatherCondition {
  if (code === 0) return 'clear';
  if (code <= 3) return 'partly-cloudy';
  if (code <= 48) return 'fog';
  if (code <= 57) return 'drizzle';
  if (code <= 67) return 'rain';
  if (code <= 77) return 'snow';
  if (code <= 82) return 'rain';
  if (code <= 86) return 'snow';
  if (code >= 95) return 'thunderstorm';
  return 'unknown';
}

function wmoToLabel(code: number): string {
  const labels: Record<number, string> = {
    0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
    45: 'Foggy', 48: 'Icy fog',
    51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
    61: 'Slight rain', 63: 'Moderate rain', 65: 'Heavy rain',
    71: 'Slight snow', 73: 'Moderate snow', 75: 'Heavy snow', 77: 'Snow grains',
    80: 'Slight showers', 81: 'Moderate showers', 82: 'Violent showers',
    85: 'Slight snow showers', 86: 'Heavy snow showers',
    95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with heavy hail',
  };
  return labels[code] ?? 'Unknown';
}

export class OpenMeteoProvider implements WeatherProvider {
  readonly id = 'open-meteo' as const;
  readonly displayName = 'Open-Meteo';
  readonly requiresApiKey = false;
  readonly requiresCredentials = false;

  validateCredentials(_creds: ProviderCredentials): boolean {
    return true;
  }

  async getCurrentWeather(coords: Coordinates, _creds: ProviderCredentials): Promise<CurrentWeather> {
    const { latitude, longitude } = coords;
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&current=temperature_2m,relative_humidity_2m,apparent_temperature,` +
      `weather_code,wind_speed_10m,wind_direction_10m,surface_pressure,visibility,uv_index` +
      `&wind_speed_unit=ms`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
    const data = await res.json();
    const c = data.current;

    return {
      temperature: c.temperature_2m,
      feelsLike: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      condition: wmoToCondition(c.weather_code),
      conditionLabel: wmoToLabel(c.weather_code),
      uvIndex: c.uv_index ?? null,
      visibility: c.visibility != null ? c.visibility / 1000 : null,
      pressure: c.surface_pressure ?? null,
      observedAt: new Date(c.time),
      locationName: null,
    };
  }

  async getForecast(coords: Coordinates, _creds: ProviderCredentials, days = 7): Promise<WeatherForecast> {
    const { latitude, longitude } = coords;
    const url =
      `https://api.open-meteo.com/v1/forecast` +
      `?latitude=${latitude}&longitude=${longitude}` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,` +
      `precipitation_probability_max,weather_code,sunrise,sunset,uv_index_max` +
      `&forecast_days=${days}&timezone=auto`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`Open-Meteo error: ${res.status}`);
    const data = await res.json();
    const d = data.daily;

    const forecastDays: ForecastDay[] = (d.time as string[]).map((date, i) => ({
      date: new Date(date),
      tempMin: d.temperature_2m_min[i],
      tempMax: d.temperature_2m_max[i],
      precipitationProbability: d.precipitation_probability_max[i] ?? null,
      precipitationSum: d.precipitation_sum[i] ?? null,
      condition: wmoToCondition(d.weather_code[i]),
      conditionLabel: wmoToLabel(d.weather_code[i]),
      sunrise: d.sunrise[i] ? new Date(d.sunrise[i]) : null,
      sunset: d.sunset[i] ? new Date(d.sunset[i]) : null,
      uvIndexMax: d.uv_index_max[i] ?? null,
    }));

    return { days: forecastDays, generatedAt: new Date() };
  }
}
