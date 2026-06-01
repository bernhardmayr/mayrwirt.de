import * as SecureStore from 'expo-secure-store';
import type { ProviderId, ProviderCredentials } from '../providers/types';

const key = (provider: ProviderId, field: keyof ProviderCredentials) =>
  `creds_${provider}_${field}`;

export async function saveCredential(
  provider: ProviderId,
  field: keyof ProviderCredentials,
  value: string,
): Promise<void> {
  await SecureStore.setItemAsync(key(provider, field), value);
}

export async function loadCredential(
  provider: ProviderId,
  field: keyof ProviderCredentials,
): Promise<string | null> {
  return SecureStore.getItemAsync(key(provider, field));
}

export async function deleteCredential(
  provider: ProviderId,
  field: keyof ProviderCredentials,
): Promise<void> {
  await SecureStore.deleteItemAsync(key(provider, field));
}

export async function loadAllCredentials(
  provider: ProviderId,
): Promise<ProviderCredentials> {
  const [apiKey, username, password] = await Promise.all([
    loadCredential(provider, 'apiKey'),
    loadCredential(provider, 'username'),
    loadCredential(provider, 'password'),
  ]);
  const creds: ProviderCredentials = {};
  if (apiKey) creds.apiKey = apiKey;
  if (username) creds.username = username;
  if (password) creds.password = password;
  return creds;
}
