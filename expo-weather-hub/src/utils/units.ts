export function formatTemperature(celsius: number, unit: 'celsius' | 'fahrenheit'): string {
  if (unit === 'fahrenheit') {
    return `${Math.round(celsius * 9 / 5 + 32)}°F`;
  }
  return `${Math.round(celsius)}°C`;
}

export function formatWindSpeed(ms: number, unit: 'm/s' | 'km/h' | 'mph'): string {
  if (unit === 'km/h') return `${Math.round(ms * 3.6)} km/h`;
  if (unit === 'mph') return `${Math.round(ms * 2.237)} mph`;
  return `${ms.toFixed(1)} m/s`;
}

export function windDirectionLabel(degrees: number): string {
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return dirs[Math.round(degrees / 45) % 8];
}
