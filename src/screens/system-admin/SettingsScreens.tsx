/**
 * All 10 System Admin / System Settings sub-module screens.
 * Each follows the same dark-band + light-sheet layout used across the app.
 */
import React from 'react';
import {
  ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';

// ─── Shared palette & base styles ────────────────────────────────────────────
const DARK     = '#1C1C1E';
const LIGHT_BG = '#F2F2F7';
const ACCENT   = '#1C1C1E';

const base = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },
  band: { backgroundColor: DARK, paddingBottom: 32 },
  bandContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  bandTitle: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xl,
    fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.2,
  },
  bandSub: {
    fontFamily: FontFamily.regular, fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.4)', marginTop: 3,
  },
  sheet: {
    flex: 1, backgroundColor: LIGHT_BG,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -28, overflow: 'hidden',
  },
  scroll: { padding: Spacing.lg, paddingBottom: 40 },

  // Coming-soon placeholder card
  placeholderCard: {
    backgroundColor: '#FFF', borderRadius: 20, padding: Spacing.xl,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: '#F0F0F0', marginTop: Spacing.md,
  },
  gearWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#F5F5F7', alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1, borderColor: '#E8E8E8',
  },
  gearRing:  { position: 'absolute', width: 38, height: 38, borderRadius: 19, borderWidth: 5, borderColor: '#1C1C1E' },
  gearInner: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#1C1C1E' },
  toothT: { position: 'absolute', top: 6,  width: 8, height: 14, borderRadius: 4, backgroundColor: '#1C1C1E' },
  toothB: { position: 'absolute', bottom: 6, width: 8, height: 14, borderRadius: 4, backgroundColor: '#1C1C1E' },
  toothL: { position: 'absolute', left: 6,  width: 14, height: 8, borderRadius: 4, backgroundColor: '#1C1C1E' },
  toothR: { position: 'absolute', right: 6, width: 14, height: 8, borderRadius: 4, backgroundColor: '#1C1C1E' },

  comingSoonTitle: {
    fontFamily: FontFamily.bold, fontSize: FontSize.lg,
    fontWeight: FontWeight.bold, color: DARK, textAlign: 'center', marginBottom: 6,
  },
  comingSoonSub: {
    fontFamily: FontFamily.regular, fontSize: FontSize.sm,
    color: '#8E8E93', textAlign: 'center', lineHeight: 20,
  },
  badge: {
    marginTop: Spacing.lg, backgroundColor: '#E8E8E8',
    borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6,
  },
  badgeTxt: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xs,
    fontWeight: FontWeight.bold, color: ACCENT,
  },
});

// ─── Reusable placeholder screen factory ─────────────────────────────────────
function SettingsPlaceholder({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <SafeAreaView style={base.safe} edges={['top', 'left', 'right']}>
      <View style={base.band}>
        <PageHeader title={title} showBack={true} />
        <View style={base.bandContent}>
          <Text style={base.bandTitle}>{title}</Text>
          <Text style={base.bandSub}>{subtitle}</Text>
        </View>
      </View>

      <View style={base.sheet}>
        <ScrollView contentContainerStyle={base.scroll} showsVerticalScrollIndicator={false}>
          <View style={base.placeholderCard}>
            {/* Gear icon */}
            <View style={base.gearWrap}>
              <View style={base.gearRing} />
              <View style={base.gearInner} />
              <View style={base.toothT} />
              <View style={base.toothB} />
              <View style={base.toothL} />
              <View style={base.toothR} />
            </View>
            <Text style={base.comingSoonTitle}>{title}</Text>
            <Text style={base.comingSoonSub}>
              Configuration options for this module{'\n'}are being set up.
            </Text>
            <View style={base.badge}>
              <Text style={base.badgeTxt}>Coming Soon</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ─── 10 named screen exports ──────────────────────────────────────────────────
export function EmployeeSettingsScreen() {
  return <SettingsPlaceholder title="Employee Settings" subtitle="Employee categories, grades & policies" />;
}

export function ItemSettingsScreen() {
  return <SettingsPlaceholder title="Item Settings" subtitle="Item categories, units & inventory parameters" />;
}

export function SupplierSettingsScreen() {
  return <SettingsPlaceholder title="Supplier Settings" subtitle="Supplier categories, payment terms & rules" />;
}

export function StoresSettingScreen() {
  return <SettingsPlaceholder title="Stores Setting" subtitle="Store locations, warehouse zones & stock rules" />;
}

export function FinanceSettingScreen() {
  return <SettingsPlaceholder title="Finance Setting" subtitle="Fiscal year, currency, tax rates & periods" />;
}

export function FinanceInstitutesAccSettingScreen() {
  return <SettingsPlaceholder title="Finance Institutes & Acc Setting" subtitle="Bank accounts, institutions & chart of accounts" />;
}

export function SecurityPostSettingScreen() {
  return <SettingsPlaceholder title="Security Post Setting" subtitle="Security checkpoints, access zones & guard posts" />;
}

export function VehicleSettingsScreen() {
  return <SettingsPlaceholder title="Vehicle Settings" subtitle="Vehicle types, fuel categories & maintenance" />;
}

export function ServiceOfferedSettingsScreen() {
  return <SettingsPlaceholder title="Service Offered Settings" subtitle="Service types, pricing tiers & delivery config" />;
}

export function DistributionBusinessSettingsScreen() {
  return <SettingsPlaceholder title="Distribution Business Settings" subtitle="Distribution channels, routes & business rules" />;
}
