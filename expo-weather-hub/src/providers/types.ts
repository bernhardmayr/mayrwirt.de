export type ProviderId = 'open-meteo' | 'openweathermap' | 'weatherapi' | 'meteomatics';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ProviderCredentials {
  apiKey?: string;
  username?: string;
  password?: string;
}

export type WeatherCondition =
  | 'clear'
  | 'partly-cloudy'
  | 'cloudy'
  | 'rain'
  | 'drizzle'
  | 'snow'
  | 'thunderstorm'
  | 'fog'
  | 'unknown';

export interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  condition: WeatherCondition;
  conditionLabel: string;
  uvIndex: number | null;
  visibility: number | null;
  pressure: number | null;
  observedAt: Date;
  locationName: string | null;
}

export interface ForecastDay {
  date: Date;
  tempMin: number;
  tempMax: number;
  precipitationProbability: number | null;
  precipitationSum: number | null;
  condition: WeatherCondition;
  conditionLabel: string;
  sunrise: Date | null;
  sunset: Date | null;
  uvIndexMax: number | null;
}

export interface WeatherForecast {
  days: ForecastDay[];
  generatedAt: Date;
}

export interface WeatherProvider {
  readonly id: ProviderId;
  readonly displayName: string;
  readonly requiresApiKey: boolean;
  readonly requiresCredentials: boolean;
  validateCredentials(creds: ProviderCredentials): boolean;
  getCurrentWeather(coords: Coordinates, creds: ProviderCredentials): Promise<CurrentWeather>;
  getForecast(coords: Coordinates, creds: ProviderCredentials, days?: number): Promise<WeatherForecast>;
}

export interface WeatherSettings {
  activeProvider: ProviderId;
  credentials: Record<ProviderId, ProviderCredentials>;
  temperatureUnit: 'celsius' | 'fahrenheit';
  windSpeedUnit: 'm/s' | 'km/h' | 'mph';
}
