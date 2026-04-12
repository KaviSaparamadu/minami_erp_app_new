import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { ModuleIcon } from '../../components/dashboard/ModuleIcon';
import { FontFamily, FontWeight, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../context/ThemeContext';

const H_PAD = Spacing.lg;

// ─── Summary card ─────────────────────────────────────────────────────────────
function SummaryCard() {
  const { theme } = useTheme();
  const total = MODULES.reduce((s, m) => s + parseInt(m.value, 10), 0);
  const now   = new Date();
  const day   = now.toLocaleDateString('en-US', { weekday: 'long' });
  const date  = now.toLocaleDateString('en-US', { day: 'numeric', month: 'long' });

  return (
    <View style={[sc.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Left: date */}
      <View style={sc.left}>
        <Text style={[sc.day, { color: theme.textMuted }]}>{day}</Text>
        <Text style={[sc.date, { color: theme.text }]}>{date}</Text>
      </View>

      {/* Divider */}
      <View style={[sc.divider, { backgroundColor: theme.border }]} />

      {/* Right: totals */}
      <View style={sc.right}>
        <View style={sc.statRow}>
          <Text style={[sc.statNum, { color: theme.text }]}>{total}</Text>
          <Text style={[sc.statLabel, { color: theme.textMuted }]}>Total Records</Text>
        </View>
        <View style={[sc.statusPill, { backgroundColor: theme.iconBg }]}>
          <View style={sc.statusDot} />
          <Text style={[sc.statusText, { color: theme.textSub }]}>
            {MODULES.length} modules active
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Module row (3 fixed, no scroll) ─────────────────────────────────────────
function ModuleRow({ onPress }: { onPress: (m: AppModule) => void }) {
  const { theme } = useTheme();

  const TINTS = [
    { bg: theme.surface, text: theme.text, sub: theme.textMuted, icon: theme.accent },
    { bg: theme.surface, text: theme.text, sub: theme.textMuted, icon: theme.accent },
    { bg: theme.surface, text: theme.text, sub: theme.textMuted, icon: theme.accent },
  ];

  return (
    <View style={ms.wrap}>
      <View style={ms.header}>
        <Text style={[ms.heading, { color: theme.text }]}>Modules</Text>
        <View style={[ms.badge, { backgroundColor: theme.iconBg }]}>
          <Text style={[ms.badgeText, { color: theme.textSub }]}>{MODULES.length}</Text>
        </View>
      </View>
      <View style={ms.row}>
        {MODULES.map((m, i) => {
          const t = TINTS[i] ?? TINTS[1];
          return (
            <Pressable
              key={m.id}
              style={({ pressed }) => [
                ms.card,
                { backgroundColor: t.bg, borderColor: theme.border },
                pressed && ms.pressed,
              ]}
              onPress={() => onPress(m)}
              accessibilityRole="button">

              <View style={[ms.iconWrap, { backgroundColor: theme.iconBg }]}>
                <ModuleIcon type={m.iconType} size={16} color={t.icon} />
              </View>

              <Text style={[ms.cardValue, { color: t.text }]}>{m.value}</Text>
              <Text style={[ms.cardLabel, { color: t.sub }]}>{m.valueLabel}</Text>
              <Text style={[ms.cardName,  { color: t.sub }]}>{m.name}</Text>

            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ─── Quick access horizontal row ─────────────────────────────────────────────
function QuickRow({ onPress }: { onPress: (m: AppModule) => void }) {
  const { theme } = useTheme();
  return (
    <View style={ql.wrap}>
      <Text style={[ql.heading, { color: theme.text }]}>Quick Access</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={ql.scroll}>
        {MODULES.map(m => (
          <Pressable
            key={m.id}
            style={({ pressed }) => [
              ql.pill,
              { backgroundColor: theme.surface, borderColor: theme.border },
              pressed && ql.pillPressed,
            ]}
            onPress={() => onPress(m)}
            accessibilityRole="button">
            <View style={[ql.iconBox, { backgroundColor: theme.iconBg }]}>
              <ModuleIcon type={m.iconType} size={18} color={theme.accent} />
            </View>
            <View style={ql.info}>
              <Text style={[ql.name, { color: theme.text }]} numberOfLines={1}>{m.name}</Text>
              <Text style={[ql.sub, { color: theme.textMuted }]} numberOfLines={1}>
                {m.value} {m.valueLabel}
              </Text>
            </View>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export function DashboardScreen() {
  const { navigate } = useNavigation();
  const { theme }    = useTheme();

  function press(m: AppModule) {
    if      (m.id === '4') { navigate('HR'); }
    else if (m.id === '8') { navigate('EmployeeManagement'); }
    else if (m.id === '7') { navigate('SystemAdmin'); }
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: '#000000' }]}
      edges={['top', 'left', 'right']}>

      {/* ── Header (always black) ── */}
      <View style={styles.headerWrap}>
        <PageHeader title="Dashboard" showBack={false} />
      </View>

      {/* ── Content sheet ── */}
      <View style={[styles.sheet, { backgroundColor: theme.bg }]}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scroll}>

          {/* Summary card */}
          <SummaryCard />

          {/* Quick access horizontal row */}
          <QuickRow onPress={press} />

          {/* Module row */}
          <ModuleRow onPress={press} />

        </ScrollView>
      </View>

    </SafeAreaView>
  );
}

// ─── Base ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:       { flex: 1 },
  headerWrap: { backgroundColor: '#000000' },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
  },
  scroll: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.xl,
    paddingBottom: 96,
    gap: 20,
  },

});

// ─── Summary card ─────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderWidth: 1,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  left: { gap: 3 },
  day: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  date: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
  },
  divider: { width: 1, height: 36, borderRadius: 1 },
  right: { flex: 1, gap: 8 },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  statNum: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.8,
  },
  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    letterSpacing: 0.2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#34D058',
  },
  statusText: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    letterSpacing: 0.2,
  },
});

// ─── Module row ───────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  wrap:   { gap: 10 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heading: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
  },
  badge: {
    width: 22, height: 22, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    fontWeight: FontWeight.bold,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  card: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignItems: 'center',
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardAccentShadow: {
    shadowColor: '#E91E63',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  pressed: { transform: [{ scale: 0.96 }], opacity: 0.88 },
  iconWrap: {
    width: 30, height: 30, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  cardValue: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.6,
    lineHeight: 24,
  },
  cardLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    letterSpacing: 0.1,
    textAlign: 'center',
  },
  cardName: {
    fontFamily: FontFamily.medium,
    fontSize: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    textAlign: 'center',
    marginTop: 2,
  },
});

// ─── Quick access horizontal row ─────────────────────────────────────────────
const ql = StyleSheet.create({
  wrap: { gap: 10 },
  heading: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.2,
  },
  scroll: {
    gap: 10,
    paddingBottom: 2,
    paddingRight: H_PAD,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  pillPressed: { transform: [{ scale: 0.96 }], opacity: 0.85 },
  iconBox: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  info: { gap: 1 },
  name: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    fontWeight: FontWeight.medium,
    letterSpacing: -0.1,
  },
  sub: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    letterSpacing: 0.1,
  },
});
