import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ModuleIconType } from '../../constants/modules';
import { UIIcon, type IconName } from '../common/UIIcon';
import { useTheme } from '../../hooks/useTheme';

interface ModuleIconProps {
  type: ModuleIconType;
  size?: number;
}

export const MODULE_ICON_MAP: Record<string, IconName> = {
  hr:          'people',
  admin:       'shield',
  finance:     'dollar',
  procurement: 'truck',
  operation:   'wrench',
  marketing:   'megaphone',
  security:    'lock',
  location:    'pin',
  customer:    'headset',
  enterprise:  'building',
};

export function ModuleIcon({ type, size = 48 }: ModuleIconProps) {
  const { isDarkMode } = useTheme();
  const glyphSize = Math.round(size * 0.5);
  const bg = '#FFFFFF';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)';
  const glyphColor = '#595959';
  const iconName = MODULE_ICON_MAP[type] ?? 'clipboard';

  return (
    <View style={[
      styles.circle,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        borderColor,
        borderWidth: StyleSheet.hairlineWidth,
      },
    ]}>
      <UIIcon name={iconName} color={glyphColor} size={glyphSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
