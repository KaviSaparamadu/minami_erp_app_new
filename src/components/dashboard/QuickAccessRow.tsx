import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontWeight, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import { ModuleIcon } from './ModuleIcon';
import type { AppModule, ModuleIconType } from '../../constants/modules';

// ─── Soft tints matching ModuleCard ──────────────────────────────────────────
const MODULE_TINT: Record<ModuleIconType, string> = {
  'hr':           '#EEF2FF',
  'employee':     '#F0FDF4',
  'system-admin': '#F8FAFC',
};

interface QuickAccessRowProps {
  onPress?: (module: AppModule) => void;
}

export function QuickAccessRow({ onPress }: QuickAccessRowProps) {
  return (
    <View style={styles.wrapper}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quick Access</Text>
        <Text style={styles.seeAll}>See all</Text>
      </View>

      {/* Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {MODULES.map(m => {
          const tint = MODULE_TINT[m.iconType] ?? '#F5F5F7';
          return (
            <Pressable
              key={m.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => onPress?.(m)}
              accessibilityRole="button"
              accessibilityLabel={m.name}>

              {/* Icon */}
              <View style={[styles.iconWrap, { backgroundColor: tint }]}>
                <ModuleIcon type={m.iconType} size={24} />
              </View>

              {/* Name */}
              <Text style={styles.name} numberOfLines={2}>{m.name}</Text>

              {/* Value badge */}
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{m.value}</Text>
              </View>

            </Pressable>
          );
        })}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.lg,
    paddingBottom: 4,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
    letterSpacing: 0.1,
  },
  seeAll: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    color: Colors.primaryHighlight,
    fontWeight: FontWeight.medium,
  },

  scroll: {
    gap: 10,
    paddingBottom: 4,
  },

  card: {
    width: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 6,
    // Clean shadow, no border stripe
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.93 }],
    opacity: 0.82,
  },

  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  name: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    fontWeight: FontWeight.medium,
    color: '#3A3A3C',
    textAlign: 'center',
    lineHeight: 13,
  },

  badge: {
    backgroundColor: '#F0F0F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
  },
});
