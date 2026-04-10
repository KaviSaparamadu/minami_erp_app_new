import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { ModuleIcon } from './ModuleIcon';

interface ModuleCardProps {
  module: AppModule;
  width: number;
  onPress?: (module: AppModule) => void;
}

export function ModuleCard({ module, width, onPress }: ModuleCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
      onPress={() => onPress?.(module)}
      accessibilityRole="button"
      accessibilityLabel={`${module.name} module`}>

      {/* Icon area */}
      <View style={styles.top}>
        <ModuleIcon type={module.iconType} size={36} />
      </View>

      {/* Info area */}
      <View style={styles.bottom}>
        <Text style={styles.name} numberOfLines={1}>{module.name}</Text>
        <Text style={styles.value} numberOfLines={1}>{module.value}</Text>
        <View style={styles.labelRow}>
          <View style={styles.dot} />
          <Text style={styles.label} numberOfLines={1}>{module.valueLabel}</Text>
        </View>
      </View>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bottom: {
    paddingHorizontal: 6,
    paddingTop: 6,
    paddingBottom: Spacing.sm,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.primaryText,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primaryText,       // dark gray — no pink
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
    color: Colors.placeholder,
  },
});
