import { useQuery } from '@tanstack/react-query';
import { getProvider } from '../providers';
import { useLocationStore } from '../store/locationStore';
import { useSettingsStore } from '../store/settingsStore';
import { queryKeys } from '../constants/queryKeys';

const FORECAST_DAYS = 7;

export function useForecast() {
  const coords = useLocationStore((s) => s.coords);
  const activeProvider = useSettingsStore((s) => s.activeProvider);
  const getCredentials = useSettingsStore((s) => s.getCredentials);

  return useQuery({
    queryKey: queryKeys.weather.forecast(
      activeProvider,
      coords?.latitude ?? 0,
      coords?.longitude ?? 0,
      FORECAST_DAYS,
    ),
    queryFn: async () => {
      const provider = getProvider(activeProvider);
      const creds = await getCredentials(activeProvider);
      if (!provider.validateCredentials(creds)) {
        throw new Error(`${provider.displayName} requires credentials. Please configure them in Settings.`);
      }
      return provider.getForecast(coords!, creds, FORECAST_DAYS);
    },
    enabled: coords !== null,
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    retry: (count, error) => {
      if (error instanceof Error && error.message.toLowerCase().includes('invalid')) return false;
      return count < 2;
    },
  });
}
