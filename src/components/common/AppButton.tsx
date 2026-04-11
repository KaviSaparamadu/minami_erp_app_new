import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { BorderRadius, Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function AppButton({
  label,
  onPress,
  loading = false,
  disabled = false,
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}>
      {loading ? (
        <ActivityIndicator color={Colors.buttonText} size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.buttonBg,
    borderRadius: 14,
    paddingVertical: 15,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPressed: {
    backgroundColor: Colors.buttonBgPressed,
    transform: [{ scale: 0.98 }],
    shadowOpacity: 0.07,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  label: {
    fontFamily: FontFamily.bold,
    color: Colors.buttonText,
    fontSize: 15,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.6,
  },
});
