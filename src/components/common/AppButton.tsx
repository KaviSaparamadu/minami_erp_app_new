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
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonPressed: {
    backgroundColor: Colors.buttonBgPressed,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: FontFamily.medium,
    color: Colors.buttonText,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
});
