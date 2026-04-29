import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface SettingsListItemProps {
  name: string;
  iconType: string;
  onPress?: () => void;
}

export function SettingsListItem({ name, iconType, onPress }: SettingsListItemProps) {
  const { colors, isDarkMode } = useTheme();
  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  return (
    <Pressable
      style={({ pressed }) => [styles.item, dyn.item, pressed && styles.itemPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={name}>
      <View style={[styles.iconContainer, dyn.iconContainer]}>
        <MaterialCommunityIcons name={iconType} size={24} color={Colors.primaryHighlight} />
      </View>
      <Text style={[styles.label, dyn.label]}>{name}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#C0C0C8" />
    </Pressable>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    item: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    },
    iconContainer: {
      backgroundColor: isDarkMode ? 'rgba(233, 30, 99, 0.1)' : 'rgba(233, 30, 99, 0.08)',
    },
    label: { color: colors.primaryText },
  });
}

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    backgroundColor: '#FFFFFF',
  },
  itemPressed: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(233, 30, 99, 0.08)',
    marginRight: Spacing.md,
  },
  label: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: '#1C1C1E',
  },
});
