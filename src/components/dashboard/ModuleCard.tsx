import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { ModuleIcon } from './ModuleIcon';
import { useTheme } from '../../hooks/useTheme';

interface ModuleCardProps {
  module: AppModule;
  width: number;
  onPress?: (module: AppModule) => void;
}

export function ModuleCard({ module, width, onPress }: ModuleCardProps) {
  const { colors, isDarkMode } = useTheme();
  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  return (
    <Pressable
      style={({ pressed }) => [styles.outer, dyn.outer, { width }, pressed && styles.pressed]}
      onPress={() => onPress?.(module)}
      accessibilityRole="button"
      accessibilityLabel={`${module.name} module`}>

      {/* Floating icon — overflows the top of the inner card */}
      <View style={styles.iconFloat}>
        <ModuleIcon type={module.iconType} size={46} />
      </View>

      {/* Inner white card */}
      <View style={[styles.inner, dyn.inner]}>
        <Text style={[styles.name, dyn.name]} numberOfLines={2}>{module.name}</Text>
        <Text style={[styles.label, dyn.label]} numberOfLines={1}>
          {module.value} {module.valueLabel}
        </Text>
      </View>
    </Pressable>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    outer: {
      backgroundColor: isDarkMode ? '#2A2A2E' : '#F2F2F5',
    },
    inner: {
      backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
    },
    name:  { color: colors.primaryText },
    label: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
  });
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: 18,
    marginBottom: Spacing.md,
    paddingTop: 28,
    paddingBottom: 12,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.94,
  },

  iconFloat: {
    position: 'absolute',
    top: -4,
    alignSelf: 'center',
    zIndex: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
  },

  inner: {
    width: '100%',
    borderRadius: 14,
    paddingTop: 36,
    paddingBottom: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },

  name: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    letterSpacing: 0.1,
    minHeight: 28,
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

});
