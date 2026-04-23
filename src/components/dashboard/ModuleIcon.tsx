import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ModuleIconType } from '../../constants/modules';
import { UIIcon, type IconName } from '../common/UIIcon';

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
  const glyphSize = Math.round(size * 0.5);
  const iconName = MODULE_ICON_MAP[type] ?? 'clipboard';

  return (
    <View style={[
      styles.circle,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: '#FCE4EC',
      },
    ]}>
      <UIIcon name={iconName} color="#E91E63" size={glyphSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
