import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontWeight, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import { ModuleIcon } from './ModuleIcon';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../context/ThemeContext';

interface QuickAccessRowProps {
  onPress?: (module: AppModule) => void;
}

export function QuickAccessRow({ onPress }: QuickAccessRowProps) {
  const { theme } = useTheme();

  return (
    <View style={styles.wrapper}>

      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>Quick Access</Text>
          <Text style={[styles.subtitle, { color: theme.textSub }]}>Jump into your top modules</Text>
        </View>
        <Text style={[styles.seeAll, { color: theme.accent }]}>See all</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}>

        {MODULES.map(m => (
          <Pressable
            key={m.id}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && styles.cardPressed,
            ]}
            onPress={() => onPress?.(m)}
            accessibilityRole="button"
            accessibilityLabel={m.name}>

            <View style={[styles.iconWrap, { backgroundColor: theme.iconBg }]}>
              <ModuleIcon type={m.iconType} size={22} color={theme.accent} />
            </View>
            <Text style={[styles.name, { color: theme.textSub }]} numberOfLines={2}>
              {m.name}
            </Text>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{m.value}</Text>
            </View>

          </Pressable>
        ))}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.md,
    paddingBottom: 4,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    marginTop: 3,
    letterSpacing: 0.2,
  },
  seeAll: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    fontWeight: FontWeight.medium,
  },

  scroll: { gap: 8, paddingBottom: 2 },

  card: {
    width: 88,
    borderRadius: 18,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: { transform: [{ scale: 0.93 }], opacity: 0.82 },

  iconWrap: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },

  name: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    lineHeight: 13,
  },

  badge: {
    backgroundColor: 'rgba(233,30,99,0.12)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
  },
});
