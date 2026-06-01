import type {
  Coordinates,
  CurrentWeather,
  ForecastDay,
  ProviderCredentials,
  WeatherCondition,
  WeatherForecast,
  WeatherProvider,
} from './types';

function owmIdToCondition(id: number): WeatherCondition {
  if (id >= 200 && id < 300) return 'thunderstorm';
  if (id >= 300 && id < 400) return 'drizzle';
  if (id >= 500 && id < 600) return 'rain';
  if (id >= 600 && id < 700) return 'snow';
  if (id === 741 || id === 701) return 'fog';
  if (id >= 700 && id < 800) return 'cloudy';
  if (id === 800) return 'clear';
  if (id === 801) return 'partly-cloudy';
  if (id > 801) return 'cloudy';
  return 'unknown';
}

export class OpenWeatherMapProvider implements WeatherProvider {
  readonly id = 'openweathermap' as const;
  readonly displayName = 'OpenWeatherMap';
  readonly requiresApiKey = true;
  readonly requiresCredentials = false;

  validateCredentials(creds: ProviderCredentials): boolean {
    return !!creds.apiKey;
  }

  async getCurrentWeather(coords: Coordinates, creds: ProviderCredentials): Promise<CurrentWeather> {
    const { latitude, longitude } = coords;
    const url =
      `https://api.openweathermap.org/data/2.5/weather` +
      `?lat=${latitude}&lon=${longitude}&units=metric&appid=${creds.apiKey}`;

    const res = await fetch(url);
    if (res.status === 401 || res.status === 403) throw new Error('Invalid OpenWeatherMap API key.');
    if (!res.ok) throw new Error(`OpenWeatherMap error: ${res.status}`);
    const data = await res.json();

    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg ?? 0,
      condition: owmIdToCondition(data.weather[0].id),
      conditionLabel: data.weather[0].description,
      uvIndex: null,
      visibility: data.visibility != null ? data.visibility / 1000 : null,
      pressure: data.main.pressure ?? null,
      observedAt: new Date(data.dt * 1000),
      locationName: data.name ?? null,
    };
  }

  async getForecast(coords: Coordinates, creds: ProviderCredentials, days = 7): Promise<WeatherForecast> {
    const { latitude, longitude } = coords;
    const url =
      `https://api.openweathermap.org/data/3.0/onecall` +
      `?lat=${latitude}&lon=${longitude}&exclude=current,minutely,hourly,alerts` +
      `&units=metric&appid=${creds.apiKey}`;

    const res = await fetch(url);
    if (res.status === 401 || res.status === 403) throw new Error('Invalid OpenWeatherMap API key.');
    if (!res.ok) throw new Error(`OpenWeatherMap error: ${res.status}`);
    const data = await res.json();

    const forecastDays: ForecastDay[] = (data.daily as any[]).slice(0, days).map((d) => ({
      date: new Date(d.dt * 1000),
      tempMin: d.temp.min,
      tempMax: d.temp.max,
      precipitationProbability: d.pop != null ? Math.round(d.pop * 100) : null,
      precipitationSum: d.rain ?? d.snow ?? null,
      condition: owmIdToCondition(d.weather[0].id),
      conditionLabel: d.weather[0].description,
      sunrise: d.sunrise ? new Date(d.sunrise * 1000) : null,
      sunset: d.sunset ? new Date(d.sunset * 1000) : null,
      uvIndexMax: d.uvi ?? null,
    }));

    return { days: forecastDays, generatedAt: new Date() };
  }
}
