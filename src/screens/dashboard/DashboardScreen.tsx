import React, { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ModuleCard } from '../../components/dashboard/ModuleCard';
import { QuickAccessRow } from '../../components/dashboard/QuickAccessRow';
import { ProfileSheet } from '../../components/dashboard/ProfileSheet';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../context/NavigationContext';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const DARK     = '#111318';
const LIGHT_BG = '#FFFFFF';
const W        = '#FFFFFF';
const W55      = 'rgba(255,255,255,0.55)';
const W30      = 'rgba(255,255,255,0.30)';
const W08      = 'rgba(255,255,255,0.08)';
const W15      = 'rgba(255,255,255,0.15)';
const H_PAD    = Spacing.lg;
const GAP      = 10;
const NUM_COLS = 3;

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning ☀️';
  if (h < 18) return 'Good Afternoon 👋';
  return 'Good Evening 🌙';
}

function getDateString() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });
}

// ─── Bell icon (white) ────────────────────────────────────────────────────────
function BellIcon() {
  return (
    <View style={ic.bell}>
      <View style={ic.bellStem} />
      <View style={ic.bellBody} />
      <View style={ic.bellClap} />
      <View style={ic.bellDot} />
    </View>
  );
}

// ─── Dark hero section ────────────────────────────────────────────────────────
interface DarkHeroProps {
  fullName: string;
  initial: string;
  onAvatar: () => void;
}

function DarkHero({ fullName, initial, onAvatar }: DarkHeroProps) {
  return (
    <View style={hero.wrap}>

      {/* Ghost decorative rings */}
      <View style={hero.ringLg} />
      <View style={hero.ringSm} />
      <View style={hero.ringXs} />

      {/* ── Top bar ── */}
      <View style={hero.topBar}>

        {/* Logo mark */}
        <View style={hero.logoMark}>
          <Text style={hero.logoLetter}>G</Text>
        </View>

        <View style={hero.appNameWrap}>
          <Text style={hero.appName}>GPIT</Text>
          <Text style={hero.appSub}>Enterprise Resource Planning</Text>
        </View>

        {/* Bell */}
        <Pressable
          style={({ pressed }) => [hero.iconBtn, pressed && hero.iconBtnPressed]}
          hitSlop={12}
          accessibilityLabel="Notifications">
          <BellIcon />
        </Pressable>

        {/* Avatar */}
        <Pressable
          onPress={onAvatar}
          style={({ pressed }) => [hero.avatar, pressed && hero.avatarPressed]}
          hitSlop={8}
          accessibilityLabel="Open profile">
          <Text style={hero.avatarText}>{initial}</Text>
          <View style={hero.onlineDot} />
        </Pressable>

      </View>

      {/* ── Greeting ── */}
      <View style={hero.greetBlock}>
        <Text style={hero.greetLabel}>{getGreeting()}</Text>
        <Text style={hero.greetName} numberOfLines={1}>{fullName}</Text>
        <Text style={hero.greetDate}>{getDateString()}</Text>
      </View>

    </View>
  );
}

// ─── Stat chips (top of white sheet) ──────────────────────────────────────────
const STAT_TINTS: Record<string, string> = {
  '4': '#EEF2FF',   // HR — indigo
  '8': '#F0FDF4',   // Employee — emerald
  '7': '#F8FAFC',   // System Admin — slate
};

function StatsRow() {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={stat.row}>
      {MODULES.map(m => (
        <View key={m.id} style={[stat.chip, { backgroundColor: STAT_TINTS[m.id] ?? '#F5F5F7' }]}>
          <Text style={stat.value}>{m.value}</Text>
          <Text style={stat.label}>{m.name}</Text>
          <Text style={stat.sublabel}>{m.valueLabel}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Section divider ──────────────────────────────────────────────────────────
function SectionDivider({ count }: { count: number }) {
  return (
    <View style={divider.row}>
      <View style={divider.line} />
      <View style={divider.pill}>
        <Text style={divider.pillText}>All Modules</Text>
        <View style={divider.badge}>
          <Text style={divider.badgeText}>{count}</Text>
        </View>
      </View>
      <View style={divider.line} />
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function DashboardScreen() {
  const { user, logout } = useAuth();
  const { navigate }     = useNavigation();
  const { width }        = useWindowDimensions();
  const [sheetOpen, setSheetOpen] = useState(false);

  const initial  = user?.fullName.charAt(0).toUpperCase() ?? '?';
  const cardWidth = (width - H_PAD * 2 - GAP * (NUM_COLS - 1)) / NUM_COLS;

  function handleModulePress(module: AppModule) {
    if (module.id === '4') navigate('HR');
    else if (module.id === '8') navigate('EmployeeManagement');
    else if (module.id === '7') navigate('SystemAdmin');
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

      {/* Dark hero section (sits behind the white sheet) */}
      <DarkHero
        fullName={user!.fullName}
        initial={initial}
        onAvatar={() => setSheetOpen(true)}
      />

      {/* White content sheet — slides up over the hero */}
      <FlatList
        data={MODULES}
        keyExtractor={item => item.id}
        numColumns={NUM_COLS}
        key={`cols-${NUM_COLS}`}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        style={styles.sheet}
        renderItem={({ item }: { item: AppModule }) => (
          <ModuleCard module={item} width={cardWidth} onPress={handleModulePress} />
        )}
        ListHeaderComponent={
          <View style={styles.listHead}>
            <StatsRow />
            <QuickAccessRow onPress={handleModulePress} />
            <SectionDivider count={MODULES.length} />
          </View>
        }
      />

      <ProfileSheet
        visible={sheetOpen}
        user={user!}
        onClose={() => setSheetOpen(false)}
        onLogout={logout}
      />

    </SafeAreaView>
  );
}

// ─── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: DARK,
  },

  // White sheet that slides up over dark hero
  sheet: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: 'hidden',
  },

  listHead: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.lg,
  },

  list: {
    paddingHorizontal: H_PAD,
    paddingBottom: 40,
  },

  row: {
    gap: GAP,
    justifyContent: 'flex-start',
    marginTop: GAP,
  },
});

// ─── Dark hero styles ──────────────────────────────────────────────────────────
const hero = StyleSheet.create({
  wrap: {
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 52,          // extra: white sheet overlaps by 28
    overflow: 'hidden',
  },

  // Ghost rings
  ringLg: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 36,
    borderColor: 'rgba(233,30,99,0.07)',
    top: -80,
    right: -60,
  },
  ringSm: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 20,
    borderColor: 'rgba(233,30,99,0.05)',
    bottom: 10,
    left: -30,
  },
  ringXs: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 12,
    borderColor: 'rgba(233,30,99,0.04)',
    bottom: 30,
    right: 40,
  },

  // ── Top bar ────────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },

  // Logo mark — pink hexagonal-ish circle
  logoMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoLetter: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: W,
    letterSpacing: -0.5,
  },

  appNameWrap: {
    flex: 1,
    gap: 1,
  },
  appName: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: W,
    letterSpacing: 0.8,
  },
  appSub: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: W30,
    letterSpacing: 0.1,
  },

  // Bell / action button
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: W08,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconBtnPressed: {
    backgroundColor: W15,
    transform: [{ scale: 0.92 }],
  },

  // Avatar
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(233,30,99,0.45)',
    flexShrink: 0,
  },
  avatarPressed: {
    opacity: 0.78,
    transform: [{ scale: 0.92 }],
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: W,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#34D058',
    borderWidth: 1.5,
    borderColor: DARK,
  },

  // ── Greeting ───────────────────────────────────────────────────────────────
  greetBlock: {
    gap: 3,
  },
  greetLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: W55,
  },
  greetName: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: W,
    letterSpacing: -0.5,
    marginTop: 2,
  },
  greetDate: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: W30,
    marginTop: 3,
  },
});

// ─── Stat chips styles ─────────────────────────────────────────────────────────
const stat = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    paddingBottom: 4,
  },
  chip: {
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'flex-start',
    minWidth: 90,
    // subtle shadow
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  value: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    fontWeight: FontWeight.medium,
    color: '#3A3A3C',
    marginTop: 2,
  },
  sublabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 1,
  },
});

// ─── Section divider styles ────────────────────────────────────────────────────
const divider = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    marginBottom: 4,
    gap: Spacing.sm,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#EFEFEF',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  pillText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
    letterSpacing: 0.1,
  },
  badge: {
    backgroundColor: '#1C1C1E',
    borderRadius: 9,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
});

// ─── Icon shapes ───────────────────────────────────────────────────────────────
const ic = StyleSheet.create({
  bell: { width: 18, height: 20, alignItems: 'center' },
  bellStem: {
    width: 5, height: 5,
    borderRadius: 3,
    borderWidth: 1.5,
    borderColor: W,
    borderBottomWidth: 0,
    marginBottom: -1,
    zIndex: 1,
  },
  bellBody: {
    width: 14, height: 10,
    borderTopLeftRadius: 7, borderTopRightRadius: 7,
    backgroundColor: W,
  },
  bellClap: {
    width: 5, height: 3,
    borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
    backgroundColor: W,
    marginTop: -0.5,
  },
  bellDot: {
    position: 'absolute',
    top: 0, right: 0,
    width: 7, height: 7,
    borderRadius: 3.5,
    backgroundColor: Colors.primaryHighlight,
    borderWidth: 1.5,
    borderColor: DARK,
  },
});
