import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CurrentWeatherCard } from '../../src/components/weather/CurrentWeatherCard';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { LoadingState } from '../../src/components/ui/LoadingState';
import { useCurrentWeather } from '../../src/hooks/useCurrentWeather';
import { useLocation } from '../../src/hooks/useLocation';
import { useSettingsStore } from '../../src/store/settingsStore';
import { PROVIDER_LIST } from '../../src/constants/providers';

export default function CurrentWeatherScreen() {
  const { status: locationStatus, error: locationError } = useLocation();
  const { data, isLoading, error, refetch, isRefetching } = useCurrentWeather();
  const activeProvider = useSettingsStore((s) => s.activeProvider);
  const providerLabel = PROVIDER_LIST.find((p) => p.id === activeProvider)?.label ?? activeProvider;

  if (locationStatus === 'denied' || locationStatus === 'error') {
    return (
      <SafeAreaView style={styles.screen}>
        <ErrorState message={locationError ?? 'Location unavailable. Please enable location access in Settings.'} />
      </SafeAreaView>
    );
  }

  if (locationStatus === 'loading' || locationStatus === 'idle') {
    return (
      <SafeAreaView style={styles.screen}>
        <LoadingState message="Getting your location…" />
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <LoadingState message={`Fetching weather from ${providerLabel}…`} />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.screen}>
        <ErrorState message={(error as Error).message} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        {data && <CurrentWeatherCard weather={data} />}
        <Text style={styles.providerBadge}>via {providerLabel}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8faff' },
  scroll: { flexGrow: 1, paddingBottom: 20 },
  providerBadge: { textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 8 },
});
