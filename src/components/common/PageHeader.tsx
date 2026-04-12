import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Colors, FontFamily, FontWeight, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';

const SCREEN_LABELS: Record<ScreenName, string> = {
  Dashboard:                    'Dashboard',
  HR:                           'HR',
  HumanManagement:              'Human Management',
  EmployeeManagement:           'Employee Management',
  UserManagement:               'User Management',
  CreateSystemUsers:            'Create Users',
  AssignUserPermission:         'Assign Permission',
  CreateUserRole:               'Create Role',
  AssignUserRolePermission:     'Assign Role Permission',
  SystemAdmin:                  'System Admin',
  EmployeeSettings:             'Employee Settings',
  ItemSettings:                 'Item Settings',
  SupplierSettings:             'Supplier Settings',
  StoresSetting:                'Stores',
  FinanceSetting:               'Finance',
  FinanceInstitutesAccSetting:  'Finance Accounts',
  SecurityPostSetting:          'Security Post',
  VehicleSettings:              'Vehicles',
  ServiceOfferedSettings:       'Services',
  DistributionBusinessSettings: 'Distribution',
};

export interface PageHeaderProps {
  title: string;
  showBack?: boolean;
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function SunIcon({ color }: { color: string }) {
  return (
    <View style={ic.box}>
      <View style={[ic.sunCore,  { backgroundColor: color }]} />
      <View style={[ic.sunRayV,  { backgroundColor: color }]} />
      <View style={[ic.sunRayH,  { backgroundColor: color }]} />
      <View style={[ic.sunRayD1, { backgroundColor: color }]} />
      <View style={[ic.sunRayD2, { backgroundColor: color }]} />
    </View>
  );
}

function MoonIcon({ color, bg }: { color: string; bg: string }) {
  return (
    <View style={ic.box}>
      <View style={[ic.moonFull, { backgroundColor: color }]} />
      <View style={[ic.moonCut,  { backgroundColor: bg }]} />
    </View>
  );
}

function BackChevron() {
  return (
    <View style={ic.chevWrap}>
      <View style={ic.chevTop} />
      <View style={ic.chevBot} />
    </View>
  );
}

// ─── Theme toggle ─────────────────────────────────────────────────────────────
function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const spin = useRef(new Animated.Value(0)).current;

  function handlePress() {
    spin.setValue(0);
    Animated.timing(spin, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    toggleTheme();
  }

  const rotate   = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const iconCol  = 'rgba(255,255,255,0.75)';

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [s.iconBtn, pressed && s.iconBtnPressed]}
      accessibilityRole="switch"
      accessibilityLabel="Toggle theme"
      hitSlop={10}>
      <Animated.View style={{ transform: [{ rotate }] }}>
        {theme.isDark
          ? <SunIcon  color={iconCol} />
          : <MoonIcon color={iconCol} bg="#000000" />
        }
      </Animated.View>
    </Pressable>
  );
}

// ─── Dashboard header (avatar + name) ────────────────────────────────────────
function DashboardHeader() {
  const { user }  = useAuth();
  const { theme } = useTheme();

  const fullName = user?.fullName ?? 'User';
  const initial  = fullName.charAt(0).toUpperCase();

  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <View style={dh.row}>
      {/* Avatar */}
      <View style={dh.avatarWrap}>
        <View style={dh.avatar}>
          <Text style={dh.avatarText}>{initial}</Text>
        </View>
        <View style={[dh.onlineDot, { borderColor: '#000000' }]} />
      </View>

      {/* Greeting + name */}
      <View style={dh.nameBlock}>
        <Text style={[dh.greeting, { color: 'rgba(255,255,255,0.50)' }]}>{greeting}</Text>
        <Text style={dh.name} numberOfLines={1}>{fullName}</Text>
      </View>

      {/* Theme toggle */}
      <ThemeToggle />
    </View>
  );
}

// ─── Sub-screen header (back + title) ────────────────────────────────────────
function SubHeader({ title }: { title: string }) {
  const { goBack, stack } = useNavigation();
  const { user }          = useAuth();
  const { theme }         = useTheme();

  const crumbs  = stack.slice(0, -1).map(n => SCREEN_LABELS[n]);
  const initial = user?.fullName.charAt(0).toUpperCase() ?? '?';

  return (
    <View style={sh.row}>
      <Pressable
        onPress={goBack}
        style={({ pressed }) => [s.iconBtn, pressed && s.iconBtnPressed]}
        hitSlop={14}
        accessibilityRole="button"
        accessibilityLabel="Go back">
        <BackChevron />
      </Pressable>

      <View style={sh.titleBlock}>
        {crumbs.length > 0 && (
          <ScrollView
            horizontal showsHorizontalScrollIndicator={false}
            contentContainerStyle={sh.crumbRow}>
            {crumbs.map((lbl, i) => (
              <React.Fragment key={i}>
                {i > 0 && <Text style={sh.crumbSep}> / </Text>}
                <Text style={sh.crumbStep}>{lbl}</Text>
              </React.Fragment>
            ))}
            <Text style={sh.crumbSep}> / </Text>
            <Text style={sh.crumbActive}>{title}</Text>
          </ScrollView>
        )}
        <Text style={sh.title} numberOfLines={1}>{title}</Text>
      </View>

      <View style={[s.iconBtn, sh.avatarSmall]}>
        <Text style={sh.avatarSmallText}>{initial}</Text>
      </View>
    </View>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function PageHeader({ title, showBack = true }: PageHeaderProps) {
  return showBack
    ? <SubHeader title={title} />
    : <DashboardHeader />;
}

// ─── Shared button styles ─────────────────────────────────────────────────────
const BTN_BG  = 'rgba(255,255,255,0.10)';
const BTN_PRE = 'rgba(255,255,255,0.18)';

const s = StyleSheet.create({
  iconBtn: {
    width: 36, height: 36, borderRadius: 11,
    backgroundColor: BTN_BG,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  iconBtnPressed: { backgroundColor: BTN_PRE, transform: [{ scale: 0.91 }] },
});

// ─── Dashboard header styles ──────────────────────────────────────────────────
const dh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 14,
    paddingBottom: 20,
    gap: 12,
  },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(233,30,99,0.40)',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute', bottom: 1, right: 1,
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#34D058', borderWidth: 2,
  },
  nameBlock: { flex: 1, gap: 1 },
  greeting: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 17,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
});

// ─── Sub-screen header styles ─────────────────────────────────────────────────
const sh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: 12,
    paddingBottom: 18,
    gap: 12,
  },
  titleBlock: { flex: 1, gap: 2 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  crumbRow:    { flexDirection: 'row', alignItems: 'center' },
  crumbStep:   { fontFamily: FontFamily.regular, fontSize: 10, color: 'rgba(255,255,255,0.32)' },
  crumbSep:    { fontFamily: FontFamily.regular, fontSize: 10, color: 'rgba(255,255,255,0.16)' },
  crumbActive: { fontFamily: FontFamily.medium,  fontSize: 10, color: 'rgba(255,255,255,0.55)' },
  avatarSmall: {
    backgroundColor: Colors.primaryHighlight,
    borderRadius: 18,
  },
  avatarSmallText: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});

// ─── Icon shapes ──────────────────────────────────────────────────────────────
const ic = StyleSheet.create({
  box: { width: 15, height: 15, alignItems: 'center', justifyContent: 'center' },

  sunCore:  { position: 'absolute', width: 6,  height: 6,  borderRadius: 3 },
  sunRayV:  { position: 'absolute', width: 2,  height: 13, borderRadius: 1, opacity: 0.55 },
  sunRayH:  { position: 'absolute', width: 13, height: 2,  borderRadius: 1, opacity: 0.55 },
  sunRayD1: { position: 'absolute', width: 2,  height: 9,  borderRadius: 1, opacity: 0.40, transform: [{ rotate: '45deg'  }] },
  sunRayD2: { position: 'absolute', width: 2,  height: 9,  borderRadius: 1, opacity: 0.40, transform: [{ rotate: '-45deg' }] },

  moonFull: { position: 'absolute', width: 12, height: 12, borderRadius: 6 },
  moonCut:  { position: 'absolute', left: 4, top: 1, width: 10, height: 10, borderRadius: 5 },

  chevWrap: { width: 12, height: 12 },
  chevTop: {
    position: 'absolute', width: 7, height: 2, borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    top: 2, left: 1, transform: [{ rotate: '-45deg' }],
  },
  chevBot: {
    position: 'absolute', width: 7, height: 2, borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    bottom: 2, left: 1, transform: [{ rotate: '45deg' }],
  },
});
