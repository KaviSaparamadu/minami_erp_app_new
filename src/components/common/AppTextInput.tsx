import React, { useState, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from '../../constants/theme';
import { EyeIcon } from './EyeIcon';
import { useTheme } from '../../hooks/useTheme';

interface AppTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'numeric';
  error?: string;
  autoComplete?: 'email' | 'password' | 'off';
}

export function AppTextInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  autoCapitalize = 'none',
  keyboardType = 'default',
  error,
  autoComplete = 'off',
}: AppTextInputProps) {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  const lineColor = error
    ? colors.error
    : isFocused
    ? colors.borderFocus
    : colors.border;

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.label,
          dynamicStyles.label,
          isFocused && dynamicStyles.labelFocused,
          !!error && dynamicStyles.labelError,
        ]}>
        {label}
      </Text>

      <View style={[styles.inputRow, dynamicStyles.inputRow, { borderBottomColor: lineColor }]}>
        <TextInput
          style={[styles.input, dynamicStyles.input]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !isRevealed}
          autoCapitalize={autoCapitalize}
          keyboardType={keyboardType}
          autoComplete={autoComplete}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label}
        />

        {secureTextEntry && (
          <Pressable
            onPress={() => setIsRevealed(prev => !prev)}
            style={styles.eyeButton}
            accessibilityLabel={isRevealed ? 'Hide password' : 'Show password'}
            hitSlop={8}>
            <EyeIcon
              visible={isRevealed}
              color={isFocused ? colors.borderFocus : colors.placeholder}
              backgroundColor={colors.inputBg}
            />
          </Pressable>
        )}
      </View>

      {!!error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

function createDynamicStyles(colors: any) {
  return StyleSheet.create({
    label: {
      color: colors.placeholder,
    },
    labelFocused: {
      color: colors.primaryText,
    },
    labelError: {
      color: colors.error,
    },
    inputRow: {
      backgroundColor: colors.inputBg,
    },
    input: {
      color: colors.primaryText,
    },
  });
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: Spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    paddingVertical: 0,
  },
  eyeButton: {
    paddingLeft: Spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    marginTop: Spacing.xs,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
});
