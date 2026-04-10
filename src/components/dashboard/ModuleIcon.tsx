import React from 'react';
import { StyleSheet, View } from 'react-native';
import type { ModuleIconType } from '../../constants/modules';

interface ModuleIconProps {
  type: ModuleIconType;
  size?: number;   // diameter — defaults to 52
}

const W = '#1C1C1E';

function HRIcon() {
  return (
    <View style={icon.person}>
      <View style={icon.personHead} />
      <View style={icon.personBody} />
    </View>
  );
}

function EmployeeIcon() {
  return (
    <View style={icon.empWrap}>
      <View style={icon.empHead} />
      <View style={icon.empBody} />
      <View style={icon.empCard} />
      <View style={icon.empLine} />
    </View>
  );
}

function SystemAdminIcon() {
  return (
    <View style={icon.gearWrap}>
      <View style={icon.gearRing} />
      <View style={icon.gearInner} />
      <View style={[icon.tooth, icon.toothT]} />
      <View style={[icon.tooth, icon.toothB]} />
      <View style={[icon.toothH, icon.toothL]} />
      <View style={[icon.toothH, icon.toothR]} />
    </View>
  );
}

export function ModuleIcon({ type, size = 52 }: ModuleIconProps) {
  const map: Record<ModuleIconType, React.ReactElement> = {
    hr:             <HRIcon />,
    employee:       <EmployeeIcon />,
    'system-admin': <SystemAdminIcon />,
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EBEBEB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
});

const icon = StyleSheet.create({
  empWrap:  { width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  empHead:  { position: 'absolute', top: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: W },
  empBody:  { position: 'absolute', top: 10, width: 14, height: 8, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: W },
  empCard:  { position: 'absolute', bottom: 0, right: 0, width: 9, height: 7, borderRadius: 2, borderWidth: 1.5, borderColor: W },
  empLine:  { position: 'absolute', bottom: 3, right: 1.5, width: 6, height: 1.5, borderRadius: 1, backgroundColor: W },

  person: { alignItems: 'center', gap: 3 },
  personHead: { width: 10, height: 10, borderRadius: 5, backgroundColor: W },
  personBody: {
    width: 16, height: 8,
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
    backgroundColor: W,
  },

  // Gear / cog
  gearWrap:  { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  gearRing:  { position: 'absolute', width: 20, height: 20, borderRadius: 10, borderWidth: 2.5, borderColor: W },
  gearInner: { position: 'absolute', width: 8,  height: 8,  borderRadius: 4,  backgroundColor: W },
  tooth:     { position: 'absolute', width: 4, height: 7, borderRadius: 2, backgroundColor: W },
  toothH:    { position: 'absolute', width: 7, height: 4, borderRadius: 2, backgroundColor: W },
  toothT:    { top: -1 },
  toothB:    { bottom: -1 },
  toothL:    { left: -1 },
  toothR:    { right: -1 },
});
