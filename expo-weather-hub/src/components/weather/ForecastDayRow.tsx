import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { ForecastDay } from '../../providers/types';
import { useSettingsStore } from '../../store/settingsStore';
import { formatTemperature } from '../../utils/units';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  day: ForecastDay;
  isFirst?: boolean;
}

export function ForecastDayRow({ day, isFirst }: Props) {
  const tempUnit = useSettingsStore((s) => s.temperatureUnit);

  const label = isFirst
    ? 'Today'
    : day.date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <View style={styles.row}>
      <Text style={styles.day}>{label}</Text>
      <WeatherIcon condition={day.condition} size={22} />
      <Text style={styles.condition} numberOfLines={1}>{day.conditionLabel}</Text>
      {day.precipitationProbability != null && (
        <Text style={styles.precip}>{day.precipitationProbability}%</Text>
      )}
      <View style={styles.temps}>
        <Text style={styles.tempMax}>{formatTemperature(day.tempMax, tempUnit)}</Text>
        <Text style={styles.tempMin}>{formatTemperature(day.tempMin, tempUnit)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    gap: 10,
  },
  day: { width: 80, fontSize: 14, fontWeight: '600', color: '#333' },
  condition: { flex: 1, fontSize: 13, color: '#666' },
  precip: { fontSize: 13, color: '#1a73e8', width: 36, textAlign: 'right' },
  temps: { flexDirection: 'row', gap: 8 },
  tempMax: { fontSize: 15, fontWeight: '600', color: '#222', minWidth: 44, textAlign: 'right' },
  tempMin: { fontSize: 15, color: '#999', minWidth: 44, textAlign: 'right' },
});
