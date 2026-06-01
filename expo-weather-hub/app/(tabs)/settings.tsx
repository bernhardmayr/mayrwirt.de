import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SecureTextInput } from '../../src/components/ui/SecureTextInput';
import { PROVIDER_LIST } from '../../src/constants/providers';
import { queryKeys } from '../../src/constants/queryKeys';
import { getProvider } from '../../src/providers';
import type { ProviderId } from '../../src/providers/types';
import { useLocationStore } from '../../src/store/locationStore';
import { useSettingsStore } from '../../src/store/settingsStore';

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const {
    activeProvider,
    temperatureUnit,
    windSpeedUnit,
    setActiveProvider,
    setTemperatureUnit,
    setWindSpeedUnit,
    saveProviderCredential,
    getCredentials,
  } = useSettingsStore();
  const coords = useLocationStore((s) => s.coords);

  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [usernames, setUsernames] = useState<Record<string, string>>({});
  const [passwords, setPasswords] = useState<Record<string, string>>({});
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    async function loadAll() {
      const entries: Record<string, string> = {};
      for (const p of PROVIDER_LIST) {
        const creds = await getCredentials(p.id);
        if (creds.apiKey) entries[p.id] = creds.apiKey;
      }
      setApiKeys(entries);
      const uMap: Record<string, string> = {};
      const pMap: Record<string, string> = {};
      for (const p of PROVIDER_LIST) {
        const creds = await getCredentials(p.id);
        if (creds.username) uMap[p.id] = creds.username;
        if (creds.password) pMap[p.id] = creds.password;
      }
      setUsernames(uMap);
      setPasswords(pMap);
    }
    loadAll();
  }, [getCredentials]);

  const handleSaveCredential = useCallback(
    async (provider: ProviderId, field: 'apiKey' | 'username' | 'password', value: string) => {
      if (!value.trim()) return;
      await saveProviderCredential(provider, field, value.trim());
    },
    [saveProviderCredential],
  );

  const handleTestConnection = useCallback(async () => {
    if (!coords) {
      Alert.alert('No location', 'Location not available yet. Open the Now tab first.');
      return;
    }
    setTesting(true);
    try {
      const provider = getProvider(activeProvider);
      const creds = await getCredentials(activeProvider);
      if (!provider.validateCredentials(creds)) {
        Alert.alert('Missing credentials', `${provider.displayName} requires credentials.`);
        return;
      }
      await queryClient.fetchQuery({
        queryKey: ['test', activeProvider, coords.latitude, coords.longitude],
        queryFn: () => provider.getCurrentWeather(coords, creds),
        staleTime: 0,
      });
      Alert.alert('Connection OK', `${provider.displayName} is working correctly.`);
    } catch (e) {
      Alert.alert('Connection failed', e instanceof Error ? e.message : String(e));
    } finally {
      setTesting(false);
    }
  }, [activeProvider, coords, getCredentials, queryClient]);

  const handleProviderChange = useCallback(
    (id: ProviderId) => {
      setActiveProvider(id);
      queryClient.invalidateQueries({ queryKey: ['weather'] });
    },
    [setActiveProvider, queryClient],
  );

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>

        <SectionHeader title="Weather Provider" />
        {PROVIDER_LIST.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={[styles.providerRow, activeProvider === p.id && styles.providerRowActive]}
            onPress={() => handleProviderChange(p.id)}
          >
            <View style={styles.providerLeft}>
              <Text style={[styles.providerLabel, activeProvider === p.id && styles.providerLabelActive]}>
                {p.label}
              </Text>
              <Text style={styles.providerDesc}>{p.description}</Text>
            </View>
            {activeProvider === p.id && <Text style={styles.checkmark}>✓</Text>}
          </TouchableOpacity>
        ))}

        <SectionHeader title="Credentials" subtitle={`For ${PROVIDER_LIST.find((p) => p.id === activeProvider)?.label}`} />

        {activeProvider === 'open-meteo' && (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Open-Meteo requires no API key — it is free and open.</Text>
          </View>
        )}

        {(activeProvider === 'openweathermap' || activeProvider === 'weatherapi') && (
          <SecureTextInput
            label="API Key"
            value={apiKeys[activeProvider] ?? ''}
            onChangeText={(v) => setApiKeys((prev) => ({ ...prev, [activeProvider]: v }))}
            onBlur={() => handleSaveCredential(activeProvider, 'apiKey', apiKeys[activeProvider] ?? '')}
          />
        )}

        {activeProvider === 'meteomatics' && (
          <>
            <SecureTextInput
              label="Username"
              isPassword={false}
              value={usernames['meteomatics'] ?? ''}
              onChangeText={(v) => setUsernames((prev) => ({ ...prev, meteomatics: v }))}
              onBlur={() => handleSaveCredential('meteomatics', 'username', usernames['meteomatics'] ?? '')}
            />
            <SecureTextInput
              label="Password"
              value={passwords['meteomatics'] ?? ''}
              onChangeText={(v) => setPasswords((prev) => ({ ...prev, meteomatics: v }))}
              onBlur={() => handleSaveCredential('meteomatics', 'password', passwords['meteomatics'] ?? '')}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.testButton, testing && styles.testButtonDisabled]}
          onPress={handleTestConnection}
          disabled={testing}
        >
          <Text style={styles.testButtonText}>{testing ? 'Testing…' : 'Test Connection'}</Text>
        </TouchableOpacity>

        <SectionHeader title="Units" />
        <View style={styles.unitRow}>
          <Text style={styles.unitLabel}>Temperature</Text>
          <View style={styles.segmented}>
            {(['celsius', 'fahrenheit'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.segment, temperatureUnit === u && styles.segmentActive]}
                onPress={() => setTemperatureUnit(u)}
              >
                <Text style={[styles.segmentText, temperatureUnit === u && styles.segmentTextActive]}>
                  {u === 'celsius' ? '°C' : '°F'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <View style={styles.unitRow}>
          <Text style={styles.unitLabel}>Wind Speed</Text>
          <View style={styles.segmented}>
            {(['m/s', 'km/h', 'mph'] as const).map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.segment, windSpeedUnit === u && styles.segmentActive]}
                onPress={() => setWindSpeedUnit(u)}
              >
                <Text style={[styles.segmentText, windSpeedUnit === u && styles.segmentTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  scroll: { padding: 16, paddingBottom: 40 },
  sectionHeader: { marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#888', textTransform: 'uppercase', letterSpacing: 0.8 },
  sectionSubtitle: { fontSize: 12, color: '#aaa', marginTop: 2 },
  providerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  providerRowActive: { borderColor: '#1a73e8', backgroundColor: '#f0f6ff' },
  providerLeft: { flex: 1 },
  providerLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  providerLabelActive: { color: '#1a73e8' },
  providerDesc: { fontSize: 13, color: '#888', marginTop: 2 },
  checkmark: { fontSize: 18, color: '#1a73e8', fontWeight: '700' },
  infoBox: { backgroundColor: '#e8f4fd', borderRadius: 8, padding: 14, marginBottom: 16 },
  infoText: { fontSize: 14, color: '#1a73e8' },
  testButton: {
    backgroundColor: '#1a73e8',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  testButtonDisabled: { backgroundColor: '#9ab8e8' },
  testButtonText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  unitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  unitLabel: { flex: 1, fontSize: 15, color: '#333' },
  segmented: { flexDirection: 'row', borderRadius: 8, overflow: 'hidden', borderWidth: 1, borderColor: '#ddd' },
  segment: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#fff' },
  segmentActive: { backgroundColor: '#1a73e8' },
  segmentText: { fontSize: 14, color: '#555', fontWeight: '500' },
  segmentTextActive: { color: '#fff', fontWeight: '700' },
});
