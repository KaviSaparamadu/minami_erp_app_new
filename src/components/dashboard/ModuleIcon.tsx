import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ModuleIconType } from '../../constants/modules';
import { UIIcon, type IconName } from '../common/UIIcon';

interface ModuleIconProps {
  type: ModuleIconType;
  size?: number;
}

export const MODULE_ICON_MAP: Record<string, IconName> = {
  // ── Module-level icons ───────────────────────────────────────────
  hr:           'people',
  admin:        'shield',
  finance:      'dollar',
  procurement:  'truck',
  operation:    'wrench',
  marketing:    'megaphone',
  security:     'lock',
  location:     'pin',
  customer:     'headset',
  enterprise:   'building',
  // ── Submodule-specific icons ─────────────────────────────────────
  employee:     'briefcase',
  'user-add':   'user',
  key:          'key',
  badge:        'badge',
  settings:     'gear',
  sliders:      'sliders',
  defaults:     'clipboard',
  ticket:       'ticket',
  log:          'log',
  calendar:     'calendar',
  chart:        'chart',
  invoice:      'dollar',
  vendor:       'building',
  project:      'briefcase',
  shift:        'calendar',
  store:        'pin',
  inventory:    'clipboard',
  'customer-list':     'user',
  complaint:           'bell',
  'finance-utilities': 'gear',
  'ledger':            'clipboard',
  'finance-operation': 'chart',
  'coa':              'clipboard',
  'fin-reports':      'chart',
  'ledger-connect':   'key',
  'opening-bal':      'dollar',
  'journal':          'log',
  'entities':          'building',
  'biz-structure':     'chart',
  'fin-institutes':    'dollar',
  'books':             'log',
  'utility':           'wrench',
  'provider':          'headset',
  'tax':               'sliders',
  'pos':               'briefcase',
  'bank-card':         'key',
  'loyalty':           'bell',
  // Finance Operation sub-module icons
  'fo-pos':            'briefcase',
  'fo-pos-points':     'badge',
  'fo-invoice':        'clipboard',
  'fo-bank-card':      'key',
  // Procurement sub-module icons
  'proc-purchasing':   'truck',
  'proc-stores':       'clipboard',
  'proc-logistics':    'pin',
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
        backgroundColor: '#F0F0F0',
      },
    ]}>
      <UIIcon name={iconName} color="#595959" size={glyphSize} />
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
