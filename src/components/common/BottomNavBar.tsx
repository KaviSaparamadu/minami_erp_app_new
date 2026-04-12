import React, { useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontWeight } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../context/ThemeContext';
import { ProfileSheet } from '../dashboard/ProfileSheet';
import { SettingsSheet } from './SettingsSheet';

// ─── Tab icons (pure View) ────────────────────────────────────────────────────

function HomeIcon({ color }: { color: string }) {
  return (
    <View style={ico.wrap}>
      {/* Roof */}
      <View style={[ico.roofL, { backgroundColor: color }]} />
      <View style={[ico.roofR, { backgroundColor: color }]} />
      {/* Body */}
      <View style={[ico.houseBody, { backgroundColor: color }]} />
      {/* Door */}
      <View style={[ico.door, { backgroundColor: color }]} />
    </View>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <View style={ico.bell}>
      <View style={[ico.bellStem, { borderColor: color }]} />
      <View style={[ico.bellBody, { backgroundColor: color }]} />
      <View style={[ico.bellClap, { backgroundColor: color }]} />
    </View>
  );
}

function GearIcon({ color }: { color: string }) {
  return (
    <View style={ico.gearWrap}>
      <View style={[ico.gearRing,  { borderColor: color }]} />
      <View style={[ico.gearCore,  { backgroundColor: color }]} />
      <View style={[ico.toothV,  ico.toothT, { backgroundColor: color }]} />
      <View style={[ico.toothV,  ico.toothBm, { backgroundColor: color }]} />
      <View style={[ico.toothH,  ico.toothL,  { backgroundColor: color }]} />
      <View style={[ico.toothH,  ico.toothRt, { backgroundColor: color }]} />
    </View>
  );
}

function PersonIcon({ color }: { color: string }) {
  return (
    <View style={ico.person}>
      <View style={[ico.head,  { backgroundColor: color }]} />
      <View style={[ico.body,  { backgroundColor: color }]} />
    </View>
  );
}

// ─── Single tab ───────────────────────────────────────────────────────────────
interface TabProps {
  label:    string;
  active:   boolean;
  accent:   string;
  inactive: string;
  surface:  string;
  onPress:  () => void;
  icon:     (color: string) => React.ReactElement;
  badge?:   boolean;
}

function Tab({ label, active, accent, inactive, surface, onPress, icon, badge }: TabProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePress() {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80,  useNativeDriver: true }),
      Animated.spring(scale,  { toValue: 1,    bounciness: 8, useNativeDriver: true }),
    ]).start();
    onPress();
  }

  const color = active ? accent : inactive;

  return (
    <Pressable
      onPress={handlePress}
      style={t.tab}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}>
      <Animated.View style={[t.iconWrap, active && { backgroundColor: surface }, { transform: [{ scale }] }]}>
        {icon(color)}
        {badge && <View style={[t.badge, { backgroundColor: accent }]} />}
      </Animated.View>
      <Text style={[t.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function BottomNavBar() {
  const { currentScreen, navigate } = useNavigation();
  const { user, logout }            = useAuth();
  const { theme }                   = useTheme();
  const insets                      = useSafeAreaInsets();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifActive,   setNotifActive]   = useState(false);
  const [settingsOpen,  setSettingsOpen]  = useState(false);

  const activeTab =
    settingsOpen                      ? 'settings' :
    currentScreen === 'Dashboard'     ? 'home'     : 'home';

  const ACCENT   = theme.accent;
  const INACTIVE = theme.isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.30)';
  const SURFACE  = theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  return (
    <>
      <View style={[
        b.bar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, 8),
        },
      ]}>
        <Tab
          label="Home"
          active={activeTab === 'home'}
          accent={ACCENT} inactive={INACTIVE} surface={SURFACE}
          onPress={() => navigate('Dashboard')}
          icon={c => <HomeIcon color={c} />}
        />
        <Tab
          label="Notifs"
          active={notifActive}
          accent={ACCENT} inactive={INACTIVE} surface={SURFACE}
          badge
          onPress={() => setNotifActive(p => !p)}
          icon={c => <BellIcon color={c} />}
        />
        <Tab
          label="Settings"
          active={activeTab === 'settings'}
          accent={ACCENT} inactive={INACTIVE} surface={SURFACE}
          onPress={() => setSettingsOpen(true)}
          icon={c => <GearIcon color={c} />}
        />
        <Tab
          label="Profile"
          active={profileOpen}
          accent={ACCENT} inactive={INACTIVE} surface={SURFACE}
          onPress={() => setProfileOpen(true)}
          icon={c => <PersonIcon color={c} />}
        />
      </View>

      <ProfileSheet
        visible={profileOpen}
        user={user!}
        onClose={() => setProfileOpen(false)}
        onLogout={logout}
      />

      <SettingsSheet
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}

// ─── Tab styles ───────────────────────────────────────────────────────────────
const t = StyleSheet.create({
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 10,
  },
  iconWrap: {
    width: 44,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

// ─── Bar styles ───────────────────────────────────────────────────────────────
const b = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 12,
  },
});

// ─── Icon shapes ──────────────────────────────────────────────────────────────
const ico = StyleSheet.create({
  wrap: { width: 18, height: 16, alignItems: 'center' },

  // House
  roofL: {
    position: 'absolute',
    width: 10, height: 2, borderRadius: 1,
    top: 4, left: 1,
    transform: [{ rotate: '-38deg' }],
  },
  roofR: {
    position: 'absolute',
    width: 10, height: 2, borderRadius: 1,
    top: 4, right: 1,
    transform: [{ rotate: '38deg' }],
  },
  houseBody: {
    position: 'absolute',
    bottom: 0,
    width: 12, height: 8,
    borderTopLeftRadius: 1, borderTopRightRadius: 1,
  },
  door: {
    position: 'absolute',
    bottom: 0,
    width: 4, height: 5,
    borderTopLeftRadius: 2, borderTopRightRadius: 2,
    backgroundColor: 'transparent',
  },

  // Bell
  bell:     { width: 16, height: 17, alignItems: 'center' },
  bellStem: { width: 4, height: 4, borderRadius: 2, borderWidth: 1.5, borderBottomWidth: 0, marginBottom: -1, zIndex: 1 },
  bellBody: { width: 12, height: 8, borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  bellClap: { width: 4, height: 3, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, marginTop: -0.5 },

  // Gear
  gearWrap:  { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  gearRing:  { position: 'absolute', width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  gearCore:  { position: 'absolute', width: 5, height: 5, borderRadius: 2.5 },
  toothV:    { position: 'absolute', width: 3, height: 5, borderRadius: 1.5 },
  toothH:    { position: 'absolute', width: 5, height: 3, borderRadius: 1.5 },
  toothT:    { top: 0 },
  toothBm:   { bottom: 0 },
  toothL:    { left: 0 },
  toothRt:   { right: 0 },

  // Person
  person: { alignItems: 'center', gap: 2 },
  head:   { width: 8, height: 8, borderRadius: 4 },
  body:   { width: 13, height: 7, borderTopLeftRadius: 7, borderTopRightRadius: 7 },
});
