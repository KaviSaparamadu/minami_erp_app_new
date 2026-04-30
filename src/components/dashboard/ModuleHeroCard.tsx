import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { UIIcon } from '../common/UIIcon';
import { MODULE_ICON_MAP } from './ModuleIcon';

interface ModuleHeroCardProps {
  module: AppModule;
}

export function ModuleHeroCard({ module }: ModuleHeroCardProps) {
  return (
    <View style={styles.hero}>
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <View style={styles.iconWrap}>
        <UIIcon
          name={MODULE_ICON_MAP[module.iconType] ?? 'clipboard'}
          color="#E91E63"
          size={28}
        />
      </View>

      <Text style={styles.name}>{module.name}</Text>
      <Text style={styles.desc} numberOfLines={4}>
        {module.description ?? `Manage your ${module.name.toLowerCase()} operations efficiently.`}
      </Text>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{module.value}</Text>
          <Text style={styles.statLabel}>{module.valueLabel}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statValue}>{module.submodules?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Submodules</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: '#FFF5F8',
    borderRadius: 20,
    padding: 20,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE0EE',
  },
  circle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(233,30,99,0.05)',
    top: -60,
    right: -50,
  },
  circle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(233,30,99,0.04)',
    bottom: -30,
    left: -20,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFE4EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  desc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#6B6B70',
    lineHeight: 20,
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F0E6EA',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#EAD8DF',
  },
  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#8E8E93',
    marginTop: 3,
  },
});
