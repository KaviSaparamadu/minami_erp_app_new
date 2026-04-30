import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontWeight, Spacing } from '../../constants/theme';
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
      style={({ pressed }) => [styles.card, dyn.card, { width }, pressed && styles.pressed]}
      onPress={() => onPress?.(module)}
      accessibilityRole="button"
      accessibilityLabel={`${module.name} module`}>

      {/* Pink circular icon */}
      <View style={styles.iconWrap}>
        <ModuleIcon type={module.iconType} size={40} />
      </View>

      {/* Name */}
      <Text style={[styles.name, dyn.name]} numberOfLines={1}>{module.name}</Text>

      {/* Large value */}
      <Text style={[styles.value, dyn.value]} numberOfLines={1}>{module.value}</Text>

      {/* Label row: pink dot + label */}
      <View style={styles.labelRow}>
        <View style={styles.dot} />
        <Text style={[styles.label, dyn.label]} numberOfLines={1}>{module.valueLabel}</Text>
      </View>
    </Pressable>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
      shadowColor: isDarkMode ? '#000' : '#F8BBD0',
    },
    name:  { color: colors.primaryText },
    value: { color: colors.primaryText },
    label: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
  });
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginBottom: Spacing.sm,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 4,
  },
  pressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.94,
  },
  iconWrap: {
    marginBottom: 8,
  },
  name: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    fontWeight: '400',
    textAlign: 'center',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: Colors.primaryHighlight,
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    letterSpacing: 0.2,
  },
});
