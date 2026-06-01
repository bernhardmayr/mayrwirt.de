import type { ProviderId } from '../providers/types';

export const PROVIDER_LIST: Array<{ id: ProviderId; label: string; description: string }> = [
  {
    id: 'open-meteo',
    label: 'Open-Meteo',
    description: 'Free, no API key required. European meteorological models.',
  },
  {
    id: 'openweathermap',
    label: 'OpenWeatherMap',
    description: 'Requires API key. Free tier available.',
  },
  {
    id: 'weatherapi',
    label: 'WeatherAPI.com',
    description: 'Requires API key. Detailed hourly data, free tier available.',
  },
  {
    id: 'meteomatics',
    label: 'Meteomatics',
    description: 'Professional-grade data. Requires username + password. Paid plans.',
  },
];
