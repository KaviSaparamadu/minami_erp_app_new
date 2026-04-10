import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

// ─── Sub-module data ──────────────────────────────────────────────────────────
interface SASubModule {
  id: string;
  screen: ScreenName;
  name: string;
  description: string;
  count: string;
  countLabel: string;
}

const SA_SUBMODULES: SASubModule[] = [
  {
    id: '1',
    screen: 'EmployeeSettings',
    name: 'Employee Settings',
    description: 'Configure employee categories, grades, types and employment policies.',
    count: '8',
    countLabel: 'Config Items',
  },
  {
    id: '2',
    screen: 'ItemSettings',
    name: 'Item Settings',
    description: 'Set up item categories, units of measure and inventory parameters.',
    count: '12',
    countLabel: 'Item Types',
  },
  {
    id: '3',
    screen: 'SupplierSettings',
    name: 'Supplier Settings',
    description: 'Manage supplier categories, payment terms and procurement rules.',
    count: '6',
    countLabel: 'Categories',
  },
  {
    id: '4',
    screen: 'StoresSetting',
    name: 'Stores Setting',
    description: 'Configure store locations, warehouse zones and stock rules.',
    count: '5',
    countLabel: 'Stores',
  },
  {
    id: '5',
    screen: 'FinanceSetting',
    name: 'Finance Setting',
    description: 'Set fiscal year, currency, tax rates and accounting periods.',
    count: '9',
    countLabel: 'Params',
  },
  {
    id: '6',
    screen: 'FinanceInstitutesAccSetting',
    name: 'Finance Institutes & Acc Setting',
    description: 'Manage bank accounts, financial institutions and chart of accounts.',
    count: '4',
    countLabel: 'Institutes',
  },
  {
    id: '7',
    screen: 'SecurityPostSetting',
    name: 'Security Post Setting',
    description: 'Configure security checkpoints, access zones and guard posts.',
    count: '3',
    countLabel: 'Posts',
  },
  {
    id: '8',
    screen: 'VehicleSettings',
    name: 'Vehicle Settings',
    description: 'Register vehicle types, fuel categories and maintenance schedules.',
    count: '7',
    countLabel: 'Vehicles',
  },
  {
    id: '9',
    screen: 'ServiceOfferedSettings',
    name: 'Service Offered Settings',
    description: 'Define service types, pricing tiers and delivery configurations.',
    count: '11',
    countLabel: 'Services',
  },
  {
    id: '10',
    screen: 'DistributionBusinessSettings',
    name: 'Distribution Business Settings',
    description: 'Set distribution channels, routes, regions and business rules.',
    count: '6',
    countLabel: 'Channels',
  },
];

const SUBMODULE_SCREENS: Record<string, ScreenName> = {
  '1':  'EmployeeSettings',
  '2':  'ItemSettings',
  '3':  'SupplierSettings',
  '4':  'StoresSetting',
  '5':  'FinanceSetting',
  '6':  'FinanceInstitutesAccSetting',
  '7':  'SecurityPostSetting',
  '8':  'VehicleSettings',
  '9':  'ServiceOfferedSettings',
  '10': 'DistributionBusinessSettings',
};

// ─── Icons (white shapes on pink bg) ─────────────────────────────────────────
function EmployeeSettingsIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.head} />
      <View style={ic.body} />
      <View style={ic.gearSmH} /><View style={ic.gearSmV} />
    </View>
  );
}
function ItemSettingsIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.box} />
      <View style={ic.boxLid} />
      <View style={ic.gearSmH} /><View style={ic.gearSmV} />
    </View>
  );
}
function SupplierSettingsIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.truck} />
      <View style={ic.truckCab} />
      <View style={ic.wheelL} /><View style={ic.wheelR} />
    </View>
  );
}
function StoresSettingIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.storeFront} />
      <View style={ic.storeRoof} />
      <View style={ic.storeDoor} />
    </View>
  );
}
function FinanceSettingIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.coinOuter} />
      <View style={ic.coinInner} />
    </View>
  );
}
function FinanceInstitutesIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.bankBase} />
      <View style={ic.bankRoof} />
      <View style={ic.bankCol} /><View style={ic.bankCol2} /><View style={ic.bankCol3} />
    </View>
  );
}
function SecurityPostIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.shield} />
      <View style={ic.lockBody} />
      <View style={ic.lockArch} />
    </View>
  );
}
function VehicleSettingsIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.carBody} />
      <View style={ic.carTop} />
      <View style={ic.carWheelL} /><View style={ic.carWheelR} />
    </View>
  );
}
function ServiceOfferedIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.wrenchHandle} />
      <View style={ic.wrenchHead} />
    </View>
  );
}
function DistributionIcon() {
  return (
    <View style={ic.wrap}>
      <View style={ic.mapBase} />
      <View style={ic.mapPin} />
      <View style={ic.mapLine} />
    </View>
  );
}

const ICONS = [
  EmployeeSettingsIcon,
  ItemSettingsIcon,
  SupplierSettingsIcon,
  StoresSettingIcon,
  FinanceSettingIcon,
  FinanceInstitutesIcon,
  SecurityPostIcon,
  VehicleSettingsIcon,
  ServiceOfferedIcon,
  DistributionIcon,
];

// ─── Screen ───────────────────────────────────────────────────────────────────
export function SystemAdminScreen() {
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');

  function handlePress(id: string) {
    const screen = SUBMODULE_SCREENS[id];
    if (screen) navigate(screen);
  }

  const q = search.trim().toLowerCase();
  const filtered = q === ''
    ? SA_SUBMODULES
    : SA_SUBMODULES.filter(m =>
        m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q),
      );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

      {/* Dark top band */}
      <View style={styles.darkBand}>
        <PageHeader title="System Admin" showBack={true} />
        <View style={styles.bandContent}>
          <Text style={styles.bandTitle}>System Admin</Text>
          <Text style={styles.bandSub}>System Settings — Select a module to configure</Text>
        </View>
      </View>

      {/* Light sheet */}
      <View style={styles.sheet}>

        {/* Search bar */}
        <View style={sb.wrap}>
          <View style={sb.iconWrap}>
            <View style={sb.glass} /><View style={sb.handle} />
          </View>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search settings…"
            placeholderTextColor={Colors.placeholder}
            style={sb.input}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} style={sb.clearBtn} hitSlop={8}>
              <View style={sb.clearX1} /><View style={sb.clearX2} />
            </Pressable>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>

          {filtered.map((mod, idx) => {
            const IconComp = ICONS[idx];
            return (
              <Pressable
                key={mod.id}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => handlePress(mod.id)}
                accessibilityRole="button"
                accessibilityLabel={mod.name}>

                {/* Left icon */}
                <View style={styles.iconArea}>
                  <IconComp />
                </View>

                {/* Content */}
                <View style={styles.content}>
                  <Text style={styles.cardTitle}>{mod.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{mod.description}</Text>
                  <View style={styles.chipRow}>
                    <View style={styles.chip}>
                      <View style={styles.chipDot} />
                      <Text style={styles.chipCount}>{mod.count}</Text>
                      <Text style={styles.chipLabel}> {mod.countLabel}</Text>
                    </View>
                  </View>
                </View>

                {/* Arrow */}
                <View style={styles.arrowWrap}>
                  <View style={styles.arrowHead} />
                </View>

              </Pressable>
            );
          })}

        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK     = '#1C1C1E';
const LIGHT_BG = '#F2F2F7';

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: DARK },

  darkBand: { backgroundColor: DARK, paddingBottom: 32 },
  bandContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  bandTitle: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xl,
    fontWeight: FontWeight.bold, color: '#FFFFFF', letterSpacing: 0.2,
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
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 40,
    gap: 6,
  },

  // Card
  card: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF', borderRadius: 18,
    padding: Spacing.lg, gap: Spacing.md,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    borderWidth: 1, borderColor: '#F0F0F0',
  },
  cardPressed: { transform: [{ scale: 0.97 }], opacity: 0.9 },

  iconArea: {
    width: 52, height: 52, borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    borderWidth: 1, borderColor: '#EBEBEB',
  },

  content: { flex: 1, gap: 4 },
  cardTitle: {
    fontFamily: FontFamily.bold, fontSize: FontSize.md,
    fontWeight: FontWeight.bold, color: Colors.primaryText, letterSpacing: 0.1,
  },
  cardDesc: {
    fontFamily: FontFamily.regular, fontSize: FontSize.xs,
    color: Colors.placeholder, lineHeight: 15,
  },

  chipRow: { flexDirection: 'row', marginTop: 4 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#F5F5F7', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
    borderWidth: 1, borderColor: '#EBEBEB',
  },
  chipDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: '#30D158' },
  chipCount: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xs,
    fontWeight: FontWeight.bold, color: Colors.primaryText,
  },
  chipLabel: {
    fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder,
  },

  arrowWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  arrowHead: {
    width: 8, height: 8,
    borderTopWidth: 2, borderRightWidth: 2, borderColor: '#C0C0C8',
    transform: [{ rotate: '45deg' }, { translateX: -2 }],
  },
});

// ─── Icon shapes (white on pink) ─────────────────────────────────────────────
const W = '#1C1C1E';
const ic = StyleSheet.create({
  wrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  // Employee (person + mini gear)
  head:    { position: 'absolute', top: 0, width: 9, height: 9, borderRadius: 5, backgroundColor: W },
  body:    { position: 'absolute', top: 10, width: 14, height: 8, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: W },
  gearSmH: { position: 'absolute', bottom: 0, right: 0, width: 6, height: 2, borderRadius: 1, backgroundColor: W },
  gearSmV: { position: 'absolute', bottom: -2, right: 2, width: 2, height: 6, borderRadius: 1, backgroundColor: W },

  // Item / box
  box:    { position: 'absolute', top: 6, width: 16, height: 14, borderWidth: 2, borderColor: '#1C1C1E', borderRadius: 2 },
  boxLid: { position: 'absolute', top: 1, width: 12, height: 5, borderWidth: 2, borderColor: '#1C1C1E', borderRadius: 1, backgroundColor: '#F5F5F7' },

  // Supplier / truck
  truck:    { position: 'absolute', left: 1, top: 8, width: 18, height: 11, borderWidth: 2, borderColor: '#1C1C1E', borderRadius: 2 },
  truckCab: { position: 'absolute', right: 0, top: 5, width: 9,  height: 14, borderWidth: 2, borderColor: '#1C1C1E', borderTopRightRadius: 4, backgroundColor: '#F5F5F7' },
  wheelL:   { position: 'absolute', bottom: 1, left: 4,  width: 6, height: 6, borderRadius: 3, borderWidth: 2, borderColor: '#1C1C1E', backgroundColor: '#F5F5F7' },
  wheelR:   { position: 'absolute', bottom: 1, right: 2, width: 6, height: 6, borderRadius: 3, borderWidth: 2, borderColor: '#1C1C1E', backgroundColor: '#F5F5F7' },

  // Stores / shop front
  storeFront: { position: 'absolute', bottom: 0, width: 26, height: 14, borderWidth: 2, borderColor: '#1C1C1E', borderRadius: 2 },
  storeRoof:  { position: 'absolute', top: 1, width: 28, height: 5, backgroundColor: W, borderRadius: 1 },
  storeDoor:  { position: 'absolute', bottom: 0, width: 7, height: 9, borderWidth: 2, borderColor: '#1C1C1E', borderRadius: 1, backgroundColor: '#F5F5F7' },

  // Finance / coin
  coinOuter: { position: 'absolute', width: 22, height: 22, borderRadius: 11, borderWidth: 2.5, borderColor: '#1C1C1E' },
  coinInner: { position: 'absolute', width: 10, height: 10, borderRadius: 5,  borderWidth: 2,   borderColor: '#1C1C1E' },

  // Bank / pillars
  bankBase: { position: 'absolute', bottom: 0, width: 26, height: 5, backgroundColor: W, borderRadius: 1 },
  bankRoof: { position: 'absolute', top: 1, width: 26, height: 4, backgroundColor: W, borderRadius: 1 },
  bankCol:  { position: 'absolute', top: 6, left: 4,  width: 3, height: 14, borderRadius: 1.5, backgroundColor: W },
  bankCol2: { position: 'absolute', top: 6, left: 12, width: 3, height: 14, borderRadius: 1.5, backgroundColor: W },
  bankCol3: { position: 'absolute', top: 6, right: 4, width: 3, height: 14, borderRadius: 1.5, backgroundColor: W },

  // Security / shield + lock
  shield:   { position: 'absolute', top: 0, width: 20, height: 20, borderRadius: 4, borderBottomLeftRadius: 10, borderBottomRightRadius: 10, borderWidth: 2, borderColor: '#1C1C1E' },
  lockBody: { position: 'absolute', bottom: 2, width: 10, height: 8, borderWidth: 2, borderColor: '#1C1C1E', borderRadius: 2, backgroundColor: '#F5F5F7' },
  lockArch: { position: 'absolute', bottom: 9, width: 6, height: 6, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderWidth: 2, borderColor: '#1C1C1E', borderBottomWidth: 0 },

  // Vehicle / car
  carBody:   { position: 'absolute', bottom: 3, width: 26, height: 10, borderWidth: 2, borderColor: '#1C1C1E', borderRadius: 3 },
  carTop:    { position: 'absolute', top: 3, width: 16, height: 8, borderTopLeftRadius: 5, borderTopRightRadius: 5, borderWidth: 2, borderColor: '#1C1C1E', backgroundColor: '#F5F5F7' },
  carWheelL: { position: 'absolute', bottom: 0, left: 3,  width: 7, height: 7, borderRadius: 4, borderWidth: 2, borderColor: '#1C1C1E', backgroundColor: '#F5F5F7' },
  carWheelR: { position: 'absolute', bottom: 0, right: 3, width: 7, height: 7, borderRadius: 4, borderWidth: 2, borderColor: '#1C1C1E', backgroundColor: '#F5F5F7' },

  // Service / wrench
  wrenchHandle: { position: 'absolute', bottom: 1, right: 3, width: 4, height: 18, borderRadius: 2, backgroundColor: W, transform: [{ rotate: '35deg' }] },
  wrenchHead:   { position: 'absolute', top: 1, left: 5, width: 12, height: 8, borderRadius: 4, borderWidth: 2.5, borderColor: '#1C1C1E', backgroundColor: '#F5F5F7' },

  // Distribution / map pin
  mapBase: { position: 'absolute', bottom: 0, width: 24, height: 12, borderWidth: 2, borderColor: '#1C1C1E', borderRadius: 3 },
  mapPin:  { position: 'absolute', top: 0, right: 6, width: 8, height: 8, borderRadius: 4, borderWidth: 2, borderColor: '#1C1C1E', backgroundColor: '#F5F5F7' },
  mapLine: { position: 'absolute', bottom: 4, left: 4, width: 8, height: 2, borderRadius: 1, backgroundColor: W },
});

const sb = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.lg,
    paddingTop: Spacing.md, paddingBottom: 10,
    gap: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0',
  },
  iconWrap: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  glass:  { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.placeholder, position: 'absolute', top: 0, left: 0 },
  handle: { position: 'absolute', bottom: 0, right: 0, width: 5, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  input:  { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.primaryText, paddingVertical: 0 },
  clearBtn: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center' },
  clearX1: { position: 'absolute', width: 9, height: 1.5, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2: { position: 'absolute', width: 9, height: 1.5, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
});
