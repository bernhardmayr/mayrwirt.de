import type {
  Coordinates,
  CurrentWeather,
  ForecastDay,
  ProviderCredentials,
  WeatherCondition,
  WeatherForecast,
  WeatherProvider,
} from './types';

function wapiCodeToCondition(code: number): WeatherCondition {
  if (code === 1000) return 'clear';
  if (code === 1003) return 'partly-cloudy';
  if (code === 1006 || code === 1009) return 'cloudy';
  if (code >= 1030 && code <= 1135) return 'fog';
  if (code >= 1150 && code <= 1201) return 'drizzle';
  if (code >= 1204 && code <= 1237) return 'snow';
  if (code >= 1240 && code <= 1246) return 'rain';
  if (code >= 1249 && code <= 1264) return 'snow';
  if (code >= 1273 && code <= 1282) return 'thunderstorm';
  return 'unknown';
}

export class WeatherApiProvider implements WeatherProvider {
  readonly id = 'weatherapi' as const;
  readonly displayName = 'WeatherAPI.com';
  readonly requiresApiKey = true;
  readonly requiresCredentials = false;

  validateCredentials(creds: ProviderCredentials): boolean {
    return !!creds.apiKey;
  }

  async getCurrentWeather(coords: Coordinates, creds: ProviderCredentials): Promise<CurrentWeather> {
    const { latitude, longitude } = coords;
    const url =
      `https://api.weatherapi.com/v1/current.json` +
      `?key=${creds.apiKey}&q=${latitude},${longitude}&aqi=no`;

    const res = await fetch(url);
    if (res.status === 401 || res.status === 403) throw new Error('Invalid WeatherAPI.com API key.');
    if (!res.ok) throw new Error(`WeatherAPI.com error: ${res.status}`);
    const data = await res.json();
    const c = data.current;

    return {
      temperature: c.temp_c,
      feelsLike: c.feelslike_c,
      humidity: c.humidity,
      windSpeed: c.wind_kph / 3.6,
      windDirection: c.wind_degree ?? 0,
      condition: wapiCodeToCondition(c.condition.code),
      conditionLabel: c.condition.text,
      uvIndex: c.uv ?? null,
      visibility: c.vis_km ?? null,
      pressure: c.pressure_mb ?? null,
      observedAt: new Date(c.last_updated),
      locationName: data.location?.name ?? null,
    };
  }

  async getForecast(coords: Coordinates, creds: ProviderCredentials, days = 7): Promise<WeatherForecast> {
    const { latitude, longitude } = coords;
    const url =
      `https://api.weatherapi.com/v1/forecast.json` +
      `?key=${creds.apiKey}&q=${latitude},${longitude}&days=${days}&aqi=no&alerts=no`;

    const res = await fetch(url);
    if (res.status === 401 || res.status === 403) throw new Error('Invalid WeatherAPI.com API key.');
    if (!res.ok) throw new Error(`WeatherAPI.com error: ${res.status}`);
    const data = await res.json();

    const forecastDays: ForecastDay[] = (data.forecast.forecastday as any[]).map((fd) => {
      const d = fd.day;
      return {
        date: new Date(fd.date),
        tempMin: d.mintemp_c,
        tempMax: d.maxtemp_c,
        precipitationProbability: d.daily_chance_of_rain ?? null,
        precipitationSum: d.totalprecip_mm ?? null,
        condition: wapiCodeToCondition(d.condition.code),
        conditionLabel: d.condition.text,
        sunrise: fd.astro?.sunrise ? new Date(`${fd.date} ${fd.astro.sunrise}`) : null,
        sunset: fd.astro?.sunset ? new Date(`${fd.date} ${fd.astro.sunset}`) : null,
        uvIndexMax: d.uv ?? null,
      };
    });

    return { days: forecastDays, generatedAt: new Date() };
  }
}
