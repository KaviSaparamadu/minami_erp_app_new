import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from '../../constants/theme';
import { EyeIcon } from './EyeIcon';

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
  const [isFocused, setIsFocused] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const lineColor = error
    ? Colors.error
    : isFocused
    ? Colors.borderFocus   // dark gray on focus
    : Colors.border;       // gray by default

  return (
    <View style={styles.wrapper}>
      <Text
        style={[
          styles.label,
          isFocused && styles.labelFocused,
          !!error && styles.labelError,
        ]}>
        {label}
      </Text>

      <View style={[styles.inputRow, { borderBottomColor: lineColor }]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
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
              color={isFocused ? Colors.borderFocus : Colors.placeholder}
            />
          </Pressable>
        )}
      </View>

      {!!error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.xl,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.placeholder,       // gray — inactive
    marginBottom: Spacing.xs,
  },
  labelFocused: {
    color: Colors.primaryText,       // dark gray — focused
  },
  labelError: {
    color: Colors.error,
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
    fontSize: FontSize.md,           // 12px
    color: Colors.primaryText,
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
    color: Colors.error,
  },
});
