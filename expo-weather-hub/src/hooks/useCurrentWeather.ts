import { useQuery } from '@tanstack/react-query';
import { getProvider } from '../providers';
import { useLocationStore } from '../store/locationStore';
import { useSettingsStore } from '../store/settingsStore';
import { queryKeys } from '../constants/queryKeys';

export function useCurrentWeather() {
  const coords = useLocationStore((s) => s.coords);
  const activeProvider = useSettingsStore((s) => s.activeProvider);
  const getCredentials = useSettingsStore((s) => s.getCredentials);

  return useQuery({
    queryKey: queryKeys.weather.current(
      activeProvider,
      coords?.latitude ?? 0,
      coords?.longitude ?? 0,
    ),
    queryFn: async () => {
      const provider = getProvider(activeProvider);
      const creds = await getCredentials(activeProvider);
      if (!provider.validateCredentials(creds)) {
        throw new Error(`${provider.displayName} requires credentials. Please configure them in Settings.`);
      }
      return provider.getCurrentWeather(coords!, creds);
    },
    enabled: coords !== null,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: (count, error) => {
      if (error instanceof Error && error.message.toLowerCase().includes('invalid')) return false;
      return count < 2;
    },
  });
}
