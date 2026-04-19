import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
} from 'react-native';
import { BorderRadius, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

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
  const { colors } = useTheme();
  const isDisabled = disabled || loading;
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        dynamicStyles.button,
        pressed && dynamicStyles.buttonPressed,
        isDisabled && styles.buttonDisabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled, busy: loading }}>
      {loading ? (
        <ActivityIndicator color={colors.buttonText} size="small" />
      ) : (
        <Text style={[styles.label, dynamicStyles.label]}>{label}</Text>
      )}
    </Pressable>
  );
}

function createDynamicStyles(colors: any) {
  return StyleSheet.create({
    button: {
      backgroundColor: colors.buttonBg,
    },
    buttonPressed: {
      backgroundColor: colors.buttonBgPressed,
    },
    label: {
      color: colors.buttonText,
    },
  });
}

const styles = StyleSheet.create({
  button: {
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
    letterSpacing: 0.5,
  },
});
