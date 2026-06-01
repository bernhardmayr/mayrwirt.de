import * as Location from 'expo-location';
import { useEffect } from 'react';
import { useLocationStore } from '../store/locationStore';

export function useLocation() {
  const { setCoords, setStatus } = useLocationStore();

  useEffect(() => {
    let cancelled = false;

    async function requestLocation() {
      setStatus('loading');
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (cancelled) return;
        if (status !== 'granted') {
          setStatus('denied', 'Location permission denied.');
          return;
        }
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (cancelled) return;
        setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } catch (e) {
        if (!cancelled) {
          setStatus('error', e instanceof Error ? e.message : 'Failed to get location.');
        }
      }
    }

    requestLocation();
    return () => { cancelled = true; };
  }, [setCoords, setStatus]);

  return useLocationStore();
}
