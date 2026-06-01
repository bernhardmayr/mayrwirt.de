import type {
  Coordinates,
  CurrentWeather,
  ForecastDay,
  ProviderCredentials,
  WeatherCondition,
  WeatherForecast,
  WeatherProvider,
} from './types';

function mmSymbolToCondition(idx: number): WeatherCondition {
  if (idx === 1 || idx === 2) return 'clear';
  if (idx === 3 || idx === 4) return 'partly-cloudy';
  if (idx === 5) return 'cloudy';
  if (idx === 6) return 'fog';
  if (idx === 7 || idx === 8) return 'drizzle';
  if (idx === 9 || idx === 10) return 'rain';
  if (idx === 11 || idx === 12) return 'snow';
  if (idx === 13 || idx === 14) return 'thunderstorm';
  return 'unknown';
}

function mmSymbolToLabel(idx: number): string {
  const labels: Record<number, string> = {
    1: 'Sunny', 2: 'Clear', 3: 'Partly cloudy', 4: 'Mostly cloudy',
    5: 'Overcast', 6: 'Fog', 7: 'Light drizzle', 8: 'Drizzle',
    9: 'Light rain', 10: 'Rain', 11: 'Light snow', 12: 'Snow',
    13: 'Thunderstorm', 14: 'Heavy thunderstorm',
  };
  return labels[idx] ?? 'Unknown';
}

function basicAuthHeader(username: string, password: string): string {
  return 'Basic ' + btoa(`${username}:${password}`);
}

function indexByParam(dataArr: any[]): Record<string, any> {
  const map: Record<string, any> = {};
  for (const entry of dataArr) {
    const key = entry.parameter as string;
    const value = entry.coordinates?.[0]?.dates?.[0]?.value;
    map[key] = value;
  }
  return map;
}

export class MeteomaticsProvider implements WeatherProvider {
  readonly id = 'meteomatics' as const;
  readonly displayName = 'Meteomatics';
  readonly requiresApiKey = false;
  readonly requiresCredentials = true;

  validateCredentials(creds: ProviderCredentials): boolean {
    return !!(creds.username && creds.password);
  }

  async getCurrentWeather(coords: Coordinates, creds: ProviderCredentials): Promise<CurrentWeather> {
    const { latitude, longitude } = coords;
    const params = [
      't_2m:C', 'apparent_temperature_2m:C', 'relative_humidity_2m:p',
      'wind_speed_10m:ms', 'wind_dir_10m:d', 'msl_pressure:hPa',
      'visibility:m', 'uv:idx', 'weather_symbol_1h:idx',
    ].join(',');
    const url = `https://api.meteomatics.com/now/${params}/${latitude},${longitude}/json`;

    const res = await fetch(url, {
      headers: { Authorization: basicAuthHeader(creds.username!, creds.password!) },
    });
    if (res.status === 401 || res.status === 403) throw new Error('Invalid Meteomatics credentials.');
    if (!res.ok) throw new Error(`Meteomatics error: ${res.status}`);
    const data = await res.json();
    const p = indexByParam(data.data);

    const symbolIdx = Math.round(p['weather_symbol_1h:idx'] ?? 0);
    return {
      temperature: p['t_2m:C'],
      feelsLike: p['apparent_temperature_2m:C'],
      humidity: p['relative_humidity_2m:p'],
      windSpeed: p['wind_speed_10m:ms'],
      windDirection: p['wind_dir_10m:d'] ?? 0,
      condition: mmSymbolToCondition(symbolIdx),
      conditionLabel: mmSymbolToLabel(symbolIdx),
      uvIndex: p['uv:idx'] ?? null,
      visibility: p['visibility:m'] != null ? p['visibility:m'] / 1000 : null,
      pressure: p['msl_pressure:hPa'] ?? null,
      observedAt: new Date(),
      locationName: null,
    };
  }

  async getForecast(coords: Coordinates, creds: ProviderCredentials, days = 7): Promise<WeatherForecast> {
    const { latitude, longitude } = coords;
    const period = `today/${days}d:P1D`;
    const params = [
      't_2m_min:C', 't_2m_max:C', 'precip_24h:mm', 'prob_precip_24h:p100',
      'weather_symbol_1d:idx', 'sunrise:sql', 'sunset:sql', 'uv:idx',
    ].join(',');
    const url = `https://api.meteomatics.com/${period}/${params}/${latitude},${longitude}/json`;

    const res = await fetch(url, {
      headers: { Authorization: basicAuthHeader(creds.username!, creds.password!) },
    });
    if (res.status === 401 || res.status === 403) throw new Error('Invalid Meteomatics credentials.');
    if (!res.ok) throw new Error(`Meteomatics error: ${res.status}`);
    const data = await res.json();

    const byParamDate: Record<string, Record<string, any>> = {};
    for (const entry of data.data as any[]) {
      const param = entry.parameter as string;
      const dates = entry.coordinates?.[0]?.dates ?? [];
      byParamDate[param] = {};
      for (const d of dates) {
        byParamDate[param][d.date] = d.value;
      }
    }

    const dates = Object.keys(byParamDate['t_2m_min:C'] ?? {});
    const forecastDays: ForecastDay[] = dates.map((dateStr) => {
      const symbolIdx = Math.round(byParamDate['weather_symbol_1d:idx']?.[dateStr] ?? 0);
      return {
        date: new Date(dateStr),
        tempMin: byParamDate['t_2m_min:C']?.[dateStr],
        tempMax: byParamDate['t_2m_max:C']?.[dateStr],
        precipitationSum: byParamDate['precip_24h:mm']?.[dateStr] ?? null,
        precipitationProbability: byParamDate['prob_precip_24h:p100']?.[dateStr] ?? null,
        condition: mmSymbolToCondition(symbolIdx),
        conditionLabel: mmSymbolToLabel(symbolIdx),
        sunrise: byParamDate['sunrise:sql']?.[dateStr]
          ? new Date(byParamDate['sunrise:sql'][dateStr])
          : null,
        sunset: byParamDate['sunset:sql']?.[dateStr]
          ? new Date(byParamDate['sunset:sql'][dateStr])
          : null,
        uvIndexMax: byParamDate['uv:idx']?.[dateStr] ?? null,
      };
    });

    return { days: forecastDays, generatedAt: new Date() };
  }
}
