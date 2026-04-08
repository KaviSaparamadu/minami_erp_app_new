import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import type { ModuleIconType } from '../../constants/modules';

interface ModuleIconProps {
  type: ModuleIconType;
  size?: number;   // diameter — defaults to 52
}

const W = '#FFFFFF';

function SalesIcon() {
  return (
    <View style={icon.barChart}>
      <View style={[icon.bar, { height: 8 }]} />
      <View style={[icon.bar, { height: 14 }]} />
      <View style={[icon.bar, { height: 11 }]} />
      <View style={icon.baseline} />
    </View>
  );
}

function InventoryIcon() {
  return (
    <View style={icon.box}>
      <View style={icon.boxLid} />
      <View style={icon.boxMidLine} />
    </View>
  );
}

function FinanceIcon() {
  return <Text style={icon.symbolText}>$</Text>;
}

function HRIcon() {
  return (
    <View style={icon.person}>
      <View style={icon.personHead} />
      <View style={icon.personBody} />
    </View>
  );
}

function PurchaseIcon() {
  return (
    <View style={icon.bag}>
      <View style={icon.bagHandle} />
      <View style={icon.bagBody} />
    </View>
  );
}

function ReportsIcon() {
  return (
    <View style={icon.doc}>
      <View style={icon.docLine} />
      <View style={icon.docLine} />
      <View style={[icon.docLine, icon.docLineShort]} />
    </View>
  );
}

export function ModuleIcon({ type, size = 52 }: ModuleIconProps) {
  const map: Record<ModuleIconType, React.ReactElement> = {
    sales:     <SalesIcon />,
    inventory: <InventoryIcon />,
    finance:   <FinanceIcon />,
    hr:        <HRIcon />,
    purchase:  <PurchaseIcon />,
    reports:   <ReportsIcon />,
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
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primaryHighlight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
});

const icon = StyleSheet.create({
  barChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3 },
  bar: { width: 5, backgroundColor: W, borderRadius: 2 },
  baseline: {
    position: 'absolute', bottom: -2, left: 0, right: 0,
    height: 1.5, backgroundColor: 'rgba(255,255,255,0.3)',
  },

  box: {
    width: 19, height: 16,
    borderWidth: 1.5, borderColor: W, borderRadius: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  boxLid: {
    position: 'absolute', top: -5,
    width: 12, height: 5,
    borderWidth: 1.5, borderColor: W, borderRadius: 1,
    backgroundColor: Colors.primaryHighlight,
  },
  boxMidLine: { width: 1.5, height: 7, backgroundColor: 'rgba(255,255,255,0.45)' },

  symbolText: { color: W, fontSize: 22, fontWeight: '700', lineHeight: 24 },

  person: { alignItems: 'center', gap: 3 },
  personHead: { width: 10, height: 10, borderRadius: 5, backgroundColor: W },
  personBody: {
    width: 16, height: 8,
    borderTopLeftRadius: 8, borderTopRightRadius: 8,
    backgroundColor: W,
  },

  bag: { alignItems: 'center' },
  bagHandle: {
    width: 10, height: 5,
    borderWidth: 1.5, borderColor: W, borderBottomWidth: 0,
    borderTopLeftRadius: 5, borderTopRightRadius: 5, marginBottom: -1,
  },
  bagBody: { width: 18, height: 12, borderWidth: 1.5, borderColor: W, borderRadius: 3 },

  doc: {
    width: 14, height: 18,
    borderWidth: 1.5, borderColor: W, borderRadius: 2,
    paddingHorizontal: 3, paddingTop: 5, gap: 4,
  },
  docLine: { height: 1.5, backgroundColor: W, borderRadius: 1 },
  docLineShort: { width: '60%' },
});
