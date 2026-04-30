import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { UIIcon } from '../common/UIIcon';
import { MODULE_ICON_MAP } from './ModuleIcon';
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

  const iconName = MODULE_ICON_MAP[iconType] ?? 'clipboard';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, dyn.card, pressed && styles.pressed]}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={submodule.name}>

      {/* Icon */}
      <View style={[styles.iconBox, dyn.iconBox]}>
        <UIIcon name={iconName} color={isDarkMode ? '#AEAEB2' : '#3C3C43'} size={22} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={[styles.title, dyn.title]} numberOfLines={1}>
          {submodule.name}
        </Text>
        {description ? (
          <Text style={[styles.description, dyn.description]} numberOfLines={2}>
            {description}
          </Text>
        ) : null}
        <View style={[styles.chip, dyn.chip]}>
          <View style={styles.chipDot} />
          <Text style={[styles.chipText, dyn.chipText]}>
            {submodule.value}
            <Text style={[styles.chipLabel, dyn.chipLabel]}> {submodule.valueLabel}</Text>
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <View style={styles.chevronWrap}>
        <View style={[styles.chevron, dyn.chevron]} />
      </View>
    </Pressable>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#EDEDF0',
      shadowColor: isDarkMode ? '#000' : '#8E8E9340',
    },
    iconBox: {
      backgroundColor: isDarkMode ? '#3A3A3C' : '#F2F2F7',
    },
    title: { color: isDarkMode ? '#FFFFFF' : '#1C1C1E' },
    description: { color: isDarkMode ? 'rgba(255,255,255,0.5)' : '#8E8E93' },
    chip: {
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.07)' : '#F5F5F8',
    },
    chipText: { color: isDarkMode ? 'rgba(255,255,255,0.75)' : '#3C3C43' },
    chipLabel: { color: isDarkMode ? 'rgba(255,255,255,0.45)' : '#8E8E93' },
    chevron: {
      borderTopColor: isDarkMode ? '#6C6C70' : '#C7C7CC',
      borderRightColor: isDarkMode ? '#6C6C70' : '#C7C7CC',
    },
  });
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },

  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  content: {
    flex: 1,
    gap: 4,
  },

  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.1,
  },

  description: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    lineHeight: 16,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 10,
    marginTop: 2,
  },

  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#30D158',
  },

  chipText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    fontWeight: '600',
  },

  chipLabel: {
    fontFamily: FontFamily.regular,
    fontWeight: '400',
  },

  chevronWrap: {
    width: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  chevron: {
    width: 7,
    height: 7,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
    transform: [{ rotate: '45deg' }, { translateX: -1 }],
  },
});
