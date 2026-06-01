import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { ProviderId, WeatherSettings } from '../providers/types';
import { loadAllCredentials, saveCredential, deleteCredential } from '../utils/storage';
import type { ProviderCredentials } from '../providers/types';

interface SettingsState extends WeatherSettings {
  credentialFlags: Record<ProviderId, { hasApiKey: boolean; hasUsername: boolean }>;
  setActiveProvider: (id: ProviderId) => void;
  setTemperatureUnit: (unit: WeatherSettings['temperatureUnit']) => void;
  setWindSpeedUnit: (unit: WeatherSettings['windSpeedUnit']) => void;
  saveProviderCredential: (provider: ProviderId, field: keyof ProviderCredentials, value: string) => Promise<void>;
  clearProviderCredential: (provider: ProviderId, field: keyof ProviderCredentials) => Promise<void>;
  getCredentials: (provider: ProviderId) => Promise<ProviderCredentials>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      activeProvider: 'open-meteo',
      credentials: {
        'open-meteo': {},
        openweathermap: {},
        weatherapi: {},
        meteomatics: {},
      },
      credentialFlags: {
        'open-meteo': { hasApiKey: false, hasUsername: false },
        openweathermap: { hasApiKey: false, hasUsername: false },
        weatherapi: { hasApiKey: false, hasUsername: false },
        meteomatics: { hasApiKey: false, hasUsername: false },
      },
      temperatureUnit: 'celsius',
      windSpeedUnit: 'm/s',

      setActiveProvider: (id) => set({ activeProvider: id }),
      setTemperatureUnit: (unit) => set({ temperatureUnit: unit }),
      setWindSpeedUnit: (unit) => set({ windSpeedUnit: unit }),

      saveProviderCredential: async (provider, field, value) => {
        await saveCredential(provider, field, value);
        set((state) => ({
          credentialFlags: {
            ...state.credentialFlags,
            [provider]: {
              ...state.credentialFlags[provider],
              hasApiKey: field === 'apiKey' ? true : state.credentialFlags[provider].hasApiKey,
              hasUsername: field === 'username' ? true : state.credentialFlags[provider].hasUsername,
            },
          },
        }));
      },

      clearProviderCredential: async (provider, field) => {
        await deleteCredential(provider, field);
        set((state) => ({
          credentialFlags: {
            ...state.credentialFlags,
            [provider]: {
              ...state.credentialFlags[provider],
              hasApiKey: field === 'apiKey' ? false : state.credentialFlags[provider].hasApiKey,
              hasUsername: field === 'username' ? false : state.credentialFlags[provider].hasUsername,
            },
          },
        }));
      },

      getCredentials: (provider) => loadAllCredentials(provider),
    }),
    {
      name: 'weather-settings',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        activeProvider: state.activeProvider,
        temperatureUnit: state.temperatureUnit,
        windSpeedUnit: state.windSpeedUnit,
        credentialFlags: state.credentialFlags,
      }),
    },
  ),
);
