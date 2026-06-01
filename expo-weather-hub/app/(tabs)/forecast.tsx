import React from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ForecastDayRow } from '../../src/components/weather/ForecastDayRow';
import { ErrorState } from '../../src/components/ui/ErrorState';
import { LoadingState } from '../../src/components/ui/LoadingState';
import { useForecast } from '../../src/hooks/useForecast';
import { useLocationStore } from '../../src/store/locationStore';
import type { ForecastDay } from '../../src/providers/types';

export default function ForecastScreen() {
  const locationStatus = useLocationStore((s) => s.status);
  const { data, isLoading, error, refetch, isRefetching } = useForecast();

  if (locationStatus === 'loading' || locationStatus === 'idle') {
    return <SafeAreaView style={styles.screen}><LoadingState message="Getting your location…" /></SafeAreaView>;
  }

  if (locationStatus === 'denied' || locationStatus === 'error') {
    return <SafeAreaView style={styles.screen}><ErrorState message="Location unavailable." /></SafeAreaView>;
  }

  if (isLoading) {
    return <SafeAreaView style={styles.screen}><LoadingState message="Loading forecast…" /></SafeAreaView>;
  }

  if (error) {
    return <SafeAreaView style={styles.screen}><ErrorState message={(error as Error).message} onRetry={refetch} /></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      <FlatList
        data={data?.days ?? []}
        keyExtractor={(item: ForecastDay) => item.date.toISOString()}
        renderItem={({ item, index }) => <ForecastDayRow day={item} isFirst={index === 0} />}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        ListEmptyComponent={<Text style={styles.empty}>No forecast data available.</Text>}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  list: { flexGrow: 1 },
  empty: { textAlign: 'center', marginTop: 40, color: '#999' },
});
