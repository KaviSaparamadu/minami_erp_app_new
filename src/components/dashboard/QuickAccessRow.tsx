import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import { ModuleIcon } from './ModuleIcon';
import type { AppModule } from '../../constants/modules';

interface QuickAccessRowProps {
  onPress?: (module: AppModule) => void;
}

export function QuickAccessRow({ onPress }: QuickAccessRowProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <View style={styles.titleAccent} />
          <Text style={styles.title}>Quick Access</Text>
        </View>
        <Text style={styles.seeAll}>See all</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>
        {MODULES.map(m => (
          <Pressable
            key={m.id}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            onPress={() => onPress?.(m)}
            accessibilityRole="button"
            accessibilityLabel={m.name}>

            {/* Icon row */}
            <ModuleIcon type={m.iconType} size={32} />

            {/* Name */}
            <Text style={styles.name} numberOfLines={1}>{m.name}</Text>

            {/* Value pill */}
            <View style={styles.pill}>
              <Text style={styles.pillText}>{m.value}</Text>
            </View>

          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.lg,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  titleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  titleAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.primaryHighlight,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primaryText,
  },
  seeAll: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.placeholder,
    fontWeight: FontWeight.medium,
  },

  scroll: {
    gap: Spacing.sm,
    paddingBottom: 4,
  },

  card: {
    width: 76,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardPressed: {
    transform: [{ scale: 0.94 }],
    opacity: 0.85,
  },

  name: {
    fontFamily: FontFamily.medium,
    fontSize: 9,
    fontWeight: FontWeight.medium,
    color: Colors.primaryText,
    textAlign: 'center',
  },

  pill: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  pillText: {
    fontFamily: FontFamily.bold,
    fontSize: 8,
    fontWeight: FontWeight.bold,
    color: Colors.primaryText,
  },
});
