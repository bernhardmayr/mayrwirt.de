import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface Props {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  isPassword?: boolean;
}

export function SecureTextInput({ label, placeholder, value, onChangeText, onBlur, isPassword = true }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          placeholder={placeholder ?? (isPassword ? '••••••••••••••••' : '')}
          secureTextEntry={isPassword && !visible}
          autoCapitalize="none"
          autoCorrect={false}
          placeholderTextColor="#aaa"
        />
        {isPassword && (
          <TouchableOpacity style={styles.toggle} onPress={() => setVisible((v) => !v)}>
            <Text style={styles.toggleText}>{visible ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  row: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#fafafa' },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: '#222' },
  toggle: { paddingHorizontal: 12 },
  toggleText: { color: '#1a73e8', fontWeight: '600', fontSize: 14 },
});
