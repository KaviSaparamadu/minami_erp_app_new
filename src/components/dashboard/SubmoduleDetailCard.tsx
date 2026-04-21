import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing, Colors } from '../../constants/theme';
import { ModuleIcon } from './ModuleIcon';
import { useTheme } from '../../hooks/useTheme';

interface SubmoduleDetailCardProps {
  submodule: {
    id: string;
    name: string;
    value: string;
    valueLabel: string;
  };
  iconType?: string;
  description?: string;
  onPress?: () => void;
}

export function SubmoduleDetailCard({
  submodule,
  iconType = 'clipboard',
  description,
  onPress,
}: SubmoduleDetailCardProps) {
  const { colors, isDarkMode } = useTheme();
  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, dyn.card, pressed && styles.pressed]}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={submodule.name}>

      <View style={styles.iconContainer}>
        <View style={[styles.iconBox, { backgroundColor: Colors.primaryHighlight }]}>
          <ModuleIcon type={iconType} size={32} />
        </View>
      </View>

      <View style={styles.contentContainer}>
        <Text style={[styles.title, dyn.title]} numberOfLines={1}>
          {submodule.name}
        </Text>
        {description && (
          <Text style={[styles.description, dyn.description]} numberOfLines={2}>
            {description}
          </Text>
        )}
        <View style={styles.valueContainer}>
          <View style={[styles.valueBadge, dyn.valueBadge]}>
            <View style={styles.dot} />
            <Text style={[styles.value, dyn.value]}>
              {submodule.value} {submodule.valueLabel}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.arrow}>
        <Text style={[styles.arrowText, { color: Colors.primaryHighlight }]}>›</Text>
      </View>
    </Pressable>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    title: { color: colors.primaryText },
    description: { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#8E8E93' },
    valueBadge: {
      backgroundColor: isDarkMode ? 'rgba(233, 30, 99, 0.2)' : 'rgba(233, 30, 99, 0.1)',
    },
    value: { color: isDarkMode ? 'rgba(255,255,255,0.8)' : '#8E8E93' },
  });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: 16,
    borderWidth: 1,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  iconContainer: {
    marginRight: Spacing.lg,
  },

  iconBox: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentContainer: {
    flex: 1,
    gap: Spacing.sm,
  },

  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },

  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    letterSpacing: 0.1,
  },

  valueContainer: {
    marginTop: Spacing.sm,
  },

  valueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryHighlight,
  },

  value: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    fontWeight: '500',
  },

  arrow: {
    paddingLeft: Spacing.lg,
    justifyContent: 'center',
  },

  arrowText: {
    fontSize: 32,
    fontWeight: '300',
    marginTop: -4,
  },
});
