import React from 'react';
import { Text } from 'react-native';
import type { WeatherCondition } from '../../providers/types';

const CONDITION_EMOJI: Record<WeatherCondition, string> = {
  clear: '☀️',
  'partly-cloudy': '⛅',
  cloudy: '☁️',
  rain: '🌧️',
  drizzle: '🌦️',
  snow: '❄️',
  thunderstorm: '⛈️',
  fog: '🌫️',
  unknown: '🌡️',
};

interface Props {
  condition: WeatherCondition;
  size?: number;
}

export function WeatherIcon({ condition, size = 48 }: Props) {
  return <Text style={{ fontSize: size, lineHeight: size + 8 }}>{CONDITION_EMOJI[condition]}</Text>;
}
