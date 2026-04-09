import React, { useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '../../components/common/AppButton';
import { AppTextInput } from '../../components/common/AppTextInput';
import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  Spacing,
} from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

export function LoginScreen() {
  const { login, isLoading, error, clearError } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  useEffect(() => {
    if (error) {
      clearError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username, password]);

  useEffect(() => {
    return () => {
      setPassword('');
    };
  }, []);

  function validateAndSubmit() {
    let valid = true;

    if (!username.trim()) {
      setUsernameError('Username is required.');
      valid = false;
    } else {
      setUsernameError('');
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    } else {
      setPasswordError('');
    }

    if (!valid) {
      return;
    }

    login({ username, password });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}>
        <Pressable style={styles.inner} onPress={() => {}} accessible={false}>

          {/* ── Row 1: Logo ── */}
          <View style={styles.logoSection}>
            <Image
              source={require('../../../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* ── Row 2: Form ── */}
          <View style={styles.formSection}>

            <AppTextInput
              label="Username"
              value={username}
              onChangeText={setUsername}
              placeholder="Enter your username"
              autoCapitalize="none"
              autoComplete="off"
              error={usernameError}
            />

            <AppTextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
              error={passwordError}
            />

            {!!error && (
              <Text style={styles.apiError} accessibilityRole="alert">
                {error}
              </Text>
            )}

            <AppButton
              label="Sign In"
              onPress={validateAndSubmit}
              loading={isLoading}
              disabled={isLoading}
            />
          </View>

          {/* ── Row 3: Spacer ── */}
          <View style={styles.bottomSection} />

        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
} 

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },

  // ── Grid row 1: logo 
  logoSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',   // logo sits at the bottom of its cell → pushed up toward middle
    paddingBottom: Spacing.xl,
  },
  logoImage: {
    width: 200,
    height: 60,
  },

  // ── Grid row 2: form 
  formSection: {
    flex: 1,
    justifyContent: 'center',
    gap: 0,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: Colors.placeholder,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  apiError: {
    fontSize: FontSize.sm,
    color: Colors.error,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },

  // ── Grid row 3: spacer 
  bottomSection: {
    flex: 1,
  },
});
