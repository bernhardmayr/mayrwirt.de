import { create } from 'zustand';
import type { Coordinates } from '../providers/types';

type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

interface LocationState {
  coords: Coordinates | null;
  status: LocationStatus;
  error: string | null;
  setCoords: (coords: Coordinates) => void;
  setStatus: (status: LocationStatus, error?: string) => void;
}

export const useLocationStore = create<LocationState>()((set) => ({
  coords: null,
  status: 'idle',
  error: null,
  setCoords: (coords) => set({ coords, status: 'granted', error: null }),
  setStatus: (status, error) => set({ status, error: error ?? null }),
}));
