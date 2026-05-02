import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontWeight } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { UIIcon } from '../common/UIIcon';
import { MODULE_ICON_MAP } from './ModuleIcon';

interface ModuleCardProps {
  module: AppModule;
  width: number;
  onPress?: (module: AppModule) => void;
}

export function ModuleCard({ module, width, onPress }: ModuleCardProps) {
  const iconName = MODULE_ICON_MAP[module.iconType] ?? 'clipboard';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, { width }, pressed && styles.pressed]}
      onPress={() => onPress?.(module)}
      accessibilityRole="button"
      accessibilityLabel={`${module.name} module`}>

      {/* Icon rounded square */}
      <View style={styles.iconBox}>
        <UIIcon name={iconName} color="#E91E63" size={17} />
      </View>

      {/* Module name */}
      <Text style={styles.name} numberOfLines={2}>{module.name}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Value */}
      <Text style={styles.value} numberOfLines={1}>{module.value}</Text>

      {/* Label */}
      <Text style={styles.label} numberOfLines={1}>{module.valueLabel}</Text>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 118,
  },
  pressed: {
    backgroundColor: '#F5F5F5',
    transform: [{ scale: 0.97 }],
  },

  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFF0F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFD6E7',
  },

  name: {
    fontFamily: FontFamily.medium,
    fontSize: 9,
    fontWeight: '500',
    color: '#595959',
    textAlign: 'center',
    letterSpacing: 0.1,
    lineHeight: 13,
    marginBottom: 8,
  },

  divider: {
    width: 20,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 6,
  },

  value: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    fontWeight: FontWeight.bold,
    color: '#1C1C1C',
    textAlign: 'center',
    letterSpacing: -0.3,
    marginBottom: 2,
  },

  label: {
    fontFamily: FontFamily.regular,
    fontSize: 8,
    color: '#9E9E9E',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
});
