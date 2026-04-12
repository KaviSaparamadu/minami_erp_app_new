import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontWeight } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { ModuleIcon } from './ModuleIcon';
import { useTheme } from '../../context/ThemeContext';

interface ModuleCardProps {
  module: AppModule;
  onPress?: (module: AppModule) => void;
  // legacy prop — kept so existing call sites don't break
  width?: number;
}

// ─── Chevron arrow (pure View) ────────────────────────────────────────────────
function Chevron({ color }: { color: string }) {
  return (
    <View style={ch.wrap}>
      <View style={[ch.top, { backgroundColor: color }]} />
      <View style={[ch.bot, { backgroundColor: color }]} />
    </View>
  );
}

export function ModuleCard({ module, onPress }: ModuleCardProps) {
  const { theme } = useTheme();

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.surface, borderColor: theme.border },
        pressed && styles.pressed,
      ]}
      onPress={() => onPress?.(module)}
      accessibilityRole="button"
      accessibilityLabel={`${module.name} module`}>

      {/* Icon container */}
      <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
        <ModuleIcon type={module.iconType} size={24} color={theme.accent} />
      </View>

      {/* Name + label */}
      <View style={styles.info}>
        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
          {module.name}
        </Text>
        <Text style={[styles.label, { color: theme.textMuted }]} numberOfLines={1}>
          {module.valueLabel}
        </Text>
      </View>

      {/* Count + chevron */}
      <View style={styles.right}>
        <Text style={[styles.value, { color: theme.accent }]}>{module.value}</Text>
        <Chevron color={theme.textMuted} />
      </View>

    </Pressable>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  pressed: {
    transform: [{ scale: 0.985 }],
    opacity: 0.88,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    letterSpacing: 0.1,
  },
  right: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
  },
});

// ─── Chevron icon ─────────────────────────────────────────────────────────────
const ch = StyleSheet.create({
  wrap: { width: 12, height: 14, alignItems: 'center', justifyContent: 'center' },
  top: {
    position: 'absolute',
    width: 8, height: 2, borderRadius: 1,
    top: 3, left: 2,
    transform: [{ rotate: '45deg' }],
  },
  bot: {
    position: 'absolute',
    width: 8, height: 2, borderRadius: 1,
    bottom: 3, left: 2,
    transform: [{ rotate: '-45deg' }],
  },
});
