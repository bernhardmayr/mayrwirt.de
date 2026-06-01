import type { ProviderId } from '../providers/types';

export const queryKeys = {
  weather: {
    current: (provider: ProviderId, lat: number, lon: number) =>
      ['weather', 'current', provider, lat, lon] as const,
    forecast: (provider: ProviderId, lat: number, lon: number, days: number) =>
      ['weather', 'forecast', provider, lat, lon, days] as const,
  },
};
