import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CurrentWeather } from '../../providers/types';
import { useSettingsStore } from '../../store/settingsStore';
import { formatTemperature, formatWindSpeed, windDirectionLabel } from '../../utils/units';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  weather: CurrentWeather;
}

export function CurrentWeatherCard({ weather }: Props) {
  const tempUnit = useSettingsStore((s) => s.temperatureUnit);
  const windUnit = useSettingsStore((s) => s.windSpeedUnit);

  return (
    <View style={styles.card}>
      {weather.locationName && <Text style={styles.location}>{weather.locationName}</Text>}
      <WeatherIcon condition={weather.condition} size={72} />
      <Text style={styles.temperature}>{formatTemperature(weather.temperature, tempUnit)}</Text>
      <Text style={styles.conditionLabel}>{weather.conditionLabel}</Text>
      <Text style={styles.feelsLike}>
        Feels like {formatTemperature(weather.feelsLike, tempUnit)}
      </Text>

      <View style={styles.stats}>
        <StatItem label="Humidity" value={`${weather.humidity}%`} />
        <StatItem
          label="Wind"
          value={`${formatWindSpeed(weather.windSpeed, windUnit)} ${windDirectionLabel(weather.windDirection)}`}
        />
        {weather.pressure != null && (
          <StatItem label="Pressure" value={`${Math.round(weather.pressure)} hPa`} />
        )}
        {weather.uvIndex != null && (
          <StatItem label="UV Index" value={String(Math.round(weather.uvIndex))} />
        )}
        {weather.visibility != null && (
          <StatItem label="Visibility" value={`${weather.visibility.toFixed(1)} km`} />
        )}
      </View>

      <Text style={styles.updated}>
        Updated {weather.observedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', padding: 24, gap: 4 },
  location: { fontSize: 20, fontWeight: '600', color: '#333', marginBottom: 8 },
  temperature: { fontSize: 72, fontWeight: '300', color: '#1a1a1a', lineHeight: 80 },
  conditionLabel: { fontSize: 18, color: '#555', textTransform: 'capitalize' },
  feelsLike: { fontSize: 15, color: '#888', marginBottom: 16 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 8 },
  statItem: { alignItems: 'center', minWidth: 80 },
  statValue: { fontSize: 16, fontWeight: '600', color: '#333' },
  statLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  updated: { fontSize: 12, color: '#bbb', marginTop: 16 },
});
