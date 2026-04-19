import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
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
  const dynamicStyles = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, dynamicStyles.card, { width }, pressed && styles.pressed]}
      onPress={() => onPress?.(module)}
      accessibilityRole="button"
      accessibilityLabel={`${module.name} module`}>

      {/* Icon area */}
      <View style={[styles.top, dynamicStyles.top]}>
        <ModuleIcon type={module.iconType} size={36} />
      </View>

      {/* Info area */}
      <View style={[styles.bottom, dynamicStyles.bottom]}>
        <Text style={[styles.name, dynamicStyles.name]} numberOfLines={1}>{module.name}</Text>
        <Text style={[styles.value, dynamicStyles.value]} numberOfLines={1}>{module.value}</Text>
        <View style={styles.labelRow}>
          <View style={styles.dot} />
          <Text style={[styles.label, dynamicStyles.label]} numberOfLines={1}>{module.valueLabel}</Text>
        </View>
      </View>

    </Pressable>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    },
    top: {
      backgroundColor: isDarkMode ? '#3A3A3C' : '#F5F5F7',
    },
    bottom: {
      borderTopColor: isDarkMode ? '#404040' : '#F0F0F0',
    },
    name: {
      color: colors.primaryText,
    },
    value: {
      color: colors.primaryText,
    },
    label: {
      color: colors.placeholder,
    },
  });
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  top: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottom: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    marginTop: 3,
    letterSpacing: -0.3,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  dot: {
    width: 4, height: 4,
    borderRadius: 2,
    backgroundColor: '#30D158',
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 8,
  },
});
