import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontWeight, Spacing } from '../../constants/theme';
import type { AppModule, ModuleIconType } from '../../constants/modules';
import { ModuleIcon } from './ModuleIcon';

// ─── Soft icon tint per module ─────────────────────────────────────────────
const MODULE_TINT: Record<ModuleIconType, string> = {
  'hr':           '#EEF2FF',   // indigo tint
  'employee':     '#F0FDF4',   // emerald tint
  'system-admin': '#F8FAFC',   // slate tint
};

interface ModuleCardProps {
  module: AppModule;
  width: number;
  onPress?: (module: AppModule) => void;
}

export function ModuleCard({ module, width, onPress }: ModuleCardProps) {
  const tint = MODULE_TINT[module.iconType] ?? '#F5F5F7';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
      onPress={() => onPress?.(module)}
      accessibilityRole="button"
      accessibilityLabel={`${module.name} module`}>

      {/* Icon circle */}
      <View style={[styles.iconCircle, { backgroundColor: tint }]}>
        <ModuleIcon type={module.iconType} size={28} />
      </View>

      {/* Value */}
      <Text style={styles.value}>{module.value}</Text>
      <Text style={styles.valueLabel}>{module.valueLabel}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Module name */}
      <Text style={styles.name} numberOfLines={1}>{module.name}</Text>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginBottom: Spacing.sm,
    paddingTop: 16,
    paddingBottom: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    // clean shadow — no border stripe
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.88,
  },

  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },

  value: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
    letterSpacing: -0.5,
    lineHeight: 24,
  },
  valueLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: '#9E9E9E',
    textAlign: 'center',
    letterSpacing: 0.1,
  },

  divider: {
    width: '80%',
    height: 1,
    backgroundColor: '#F0F0F5',
    marginVertical: 6,
  },

  name: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#3A3A3C',
    textAlign: 'center',
    letterSpacing: 0.1,
  },
});
