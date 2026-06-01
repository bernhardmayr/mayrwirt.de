import { MeteomaticsProvider } from './meteomatics';
import { OpenMeteoProvider } from './openMeteo';
import { OpenWeatherMapProvider } from './openWeatherMap';
import { WeatherApiProvider } from './weatherApi';
import type { ProviderId, WeatherProvider } from './types';

export { type ProviderId, type WeatherProvider } from './types';

export const PROVIDER_REGISTRY: Record<ProviderId, WeatherProvider> = {
  'open-meteo': new OpenMeteoProvider(),
  openweathermap: new OpenWeatherMapProvider(),
  weatherapi: new WeatherApiProvider(),
  meteomatics: new MeteomaticsProvider(),
};

export function getProvider(id: ProviderId): WeatherProvider {
  return PROVIDER_REGISTRY[id];
}
