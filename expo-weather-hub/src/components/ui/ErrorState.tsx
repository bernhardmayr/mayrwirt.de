import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface Props {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.button} onPress={onRetry}>
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 12 },
  icon: { fontSize: 40 },
  message: { fontSize: 16, color: '#c0392b', textAlign: 'center', lineHeight: 22 },
  button: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#1a73e8', borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
