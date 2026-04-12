import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ModuleIconType } from '../../constants/modules';

interface ModuleIconProps {
  type: ModuleIconType;
  size?: number;   // diameter — defaults to 52
  color?: string;
}

const DEFAULT_ICON_COLOR = '#1C1C1E';

function HRIcon({ color }: { color: string }) {
  return (
    <View style={icon.person}>
      <View style={[icon.personHead, { backgroundColor: color }]} />
      <View style={[icon.personBody, { backgroundColor: color }]} />
    </View>
  );
}

function EmployeeIcon({ color }: { color: string }) {
  return (
    <View style={icon.empWrap}>
      <View style={[icon.empHead, { backgroundColor: color }]} />
      <View style={[icon.empBody, { backgroundColor: color }]} />
      <View style={[icon.empCard, { borderColor: color }]} />
      <View style={[icon.empLine, { backgroundColor: color }]} />
    </View>
  );
}

function SystemAdminIcon({ color }: { color: string }) {
  return (
    <View style={icon.gearWrap}>
      <View style={[icon.gearRing, { borderColor: color }]} />
      <View style={[icon.gearInner, { backgroundColor: color }]} />
      <View style={[icon.tooth, icon.toothT, { backgroundColor: color }]} />
      <View style={[icon.tooth, icon.toothB, { backgroundColor: color }]} />
      <View style={[icon.toothH, icon.toothL, { backgroundColor: color }]} />
      <View style={[icon.toothH, icon.toothR, { backgroundColor: color }]} />
    </View>
  );
}

export function ModuleIcon({ type, size = 52, color = DEFAULT_ICON_COLOR }: ModuleIconProps) {
  const map: Record<ModuleIconType, React.ReactElement> = {
    hr:             <HRIcon color={color} />,
    employee:       <EmployeeIcon color={color} />,
    'system-admin': <SystemAdminIcon color={color} />,
  };
  return (
    <View style={[
      styles.circle,
      {
        width: size,
        height: size,
        borderRadius: size / 2,
        shadowRadius: size < 40 ? 6 : 10,
      },
    ]}>
      {map[type]}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

const icon = StyleSheet.create({
  empWrap:  { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  empHead:  { position: 'absolute', top: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: DEFAULT_ICON_COLOR },
  empBody:  { position: 'absolute', top: 10, width: 14, height: 8, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: DEFAULT_ICON_COLOR },
  empCard:  { position: 'absolute', bottom: 0, right: 0, width: 9, height: 7, borderRadius: 2, borderWidth: 1.5, borderColor: DEFAULT_ICON_COLOR },
  empLine:  { position: 'absolute', bottom: 3, right: 1.5, width: 6, height: 1.5, borderRadius: 1, backgroundColor: DEFAULT_ICON_COLOR },

  person: { alignItems: 'center', gap: 3 },
  personHead: { width: 10, height: 10, borderRadius: 5, backgroundColor: DEFAULT_ICON_COLOR },
  personBody: {
    width: 16, height: 8,
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
    backgroundColor: DEFAULT_ICON_COLOR,
  },

  // Gear / cog
  gearWrap:  { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  gearRing:  { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: DEFAULT_ICON_COLOR },
  gearInner: { position: 'absolute', width: 8,  height: 8,  borderRadius: 4,  backgroundColor: DEFAULT_ICON_COLOR },
  tooth:     { position: 'absolute', width: 4, height: 7, borderRadius: 2, backgroundColor: DEFAULT_ICON_COLOR },
  toothH:    { position: 'absolute', width: 7, height: 4, borderRadius: 2, backgroundColor: DEFAULT_ICON_COLOR },
  toothT:    { top: -1 },
  toothB:    { bottom: -1 },
  toothL:    { left: -1 },
  toothR:    { right: -1 },
});
