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
interface UMSubModule {
  id: string;
  screen: ScreenName;
  name: string;
  description: string;
  count: string;
  countLabel: string;
}

const UM_SUBMODULES: UMSubModule[] = [
  {
    id: '1',
    screen: 'CreateSystemUsers',
    name: 'Create System Users',
    description: 'Add accounts, set credentials and configure login access for staff members.',
    count: '24',
    countLabel: 'Active Users',
  },
  {
    id: '2',
    screen: 'AssignUserPermission',
    name: 'Assign User Permission',
    description: 'Grant or revoke individual module permissions per user.',
    count: '18',
    countLabel: 'Configured',
  },
  {
    id: '3',
    screen: 'CreateUserRole',
    name: 'Create User Role',
    description: 'Define reusable role profiles that bundle a set of permissions.',
    count: '7',
    countLabel: 'Roles',
  },
  {
    id: '4',
    screen: 'AssignUserRolePermission',
    name: 'Assign Role Permission',
    description: 'Map permissions to roles and assign roles to users system-wide.',
    count: '12',
    countLabel: 'Assignments',
  },
];

const SUBMODULE_SCREENS: Record<string, ScreenName> = {
  '1': 'CreateSystemUsers',
  '2': 'AssignUserPermission',
  '3': 'CreateUserRole',
  '4': 'AssignUserRolePermission',
};

// ─── Icons (white shapes on pink bg) ─────────────────────────────────────────
function UserPlusIcon() {
  return (
    <View style={icon.wrap}>
      <View style={icon.head} />
      <View style={icon.body} />
      <View style={icon.plusH} />
      <View style={icon.plusV} />
    </View>
  );
}

function KeyIcon() {
  return (
    <View style={icon.wrap}>
      <View style={icon.keyRing} />
      <View style={icon.keyShank} />
      <View style={icon.keyT1} />
      <View style={icon.keyT2} />
    </View>
  );
}

function BadgeIcon() {
  return (
    <View style={icon.wrap}>
      <View style={icon.badgeCard} />
      <View style={icon.badgeTop} />
      <View style={icon.badgeL1} />
      <View style={icon.badgeL2} />
    </View>
  );
}

function ShieldIcon() {
  return (
    <View style={icon.wrap}>
      <View style={icon.shield} />
      <View style={icon.ckShort} />
      <View style={icon.ckLong} />
    </View>
  );
}

const ICONS = [UserPlusIcon, KeyIcon, BadgeIcon, ShieldIcon];

// ─── Screen ───────────────────────────────────────────────────────────────────
export function UserManagementScreen() {
  const { navigate } = useNavigation();
  const [search, setSearch] = useState('');

  function handlePress(id: string) {
    const screen = SUBMODULE_SCREENS[id];
    if (screen) navigate(screen);
  }

  const q = search.trim().toLowerCase();
  const filtered = q === ''
    ? UM_SUBMODULES
    : UM_SUBMODULES.filter(m =>
        m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q),
      );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

      {/* Dark top band */}
      <View style={styles.darkBand}>
        <PageHeader title="User Management" showBack={true} />
        <View style={styles.bandContent}>
          <Text style={styles.bandTitle}>User Management</Text>
          <Text style={styles.bandSub}>Select a module to manage</Text>
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
            placeholder="Search modules…"
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

                {/* Left icon area */}
                <View style={styles.iconArea}>
                  <IconComp />
                </View>

                {/* Content */}
                <View style={styles.content}>
                  <Text style={styles.cardTitle}>{mod.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{mod.description}</Text>

                  {/* Count chip */}
                  <View style={styles.chipRow}>
                    <View style={styles.chip}>
                      <View style={styles.chipDot} />
                      <Text style={styles.chipCount}>{mod.count}</Text>
                      <Text style={styles.chipLabel}>{mod.countLabel}</Text>
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

  darkBand: {
    backgroundColor: DARK,
    paddingBottom: 32,
  },

  bandContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  bandTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  bandSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.4)',
    marginTop: 3,
  },

  sheet: {
    flex: 1,
    backgroundColor: LIGHT_BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    marginTop: -28,
    overflow: 'hidden',
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: 40,
    gap: 6,
  },

  // ── Card ──────────────────────────────────────────────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: Spacing.lg,
    gap: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },

  iconArea: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },

  content: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.primaryText,
    letterSpacing: 0.1,
  },
  cardDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.placeholder,
    lineHeight: 15,
  },

  chipRow: {
    flexDirection: 'row',
    marginTop: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#EBEBEB',
  },
  chipDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#30D158',
  },
  chipCount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primaryText,
  },
  chipLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.placeholder,
  },

  arrowWrap: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  arrowHead: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#C0C0C8',
    transform: [{ rotate: '45deg' }, { translateX: -2 }],
  },
});

// ─── Icon shapes (black on white bg) ─────────────────────────────────────────
const BK = '#1C1C1E';
const icon = StyleSheet.create({
  wrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  // User + plus
  head:  { width: 10, height: 10, borderRadius: 5, backgroundColor: BK, marginBottom: 2 },
  body:  { width: 14, height: 9, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: BK },
  plusH: { position: 'absolute', bottom: 2, right: 0, width: 8, height: 2, borderRadius: 1, backgroundColor: BK },
  plusV: { position: 'absolute', bottom: -2, right: 3, width: 2, height: 8, borderRadius: 1, backgroundColor: BK },

  // Key
  keyRing:  { position: 'absolute', top: 2, left: 2, width: 11, height: 11, borderRadius: 6, borderWidth: 2.5, borderColor: BK },
  keyShank: { position: 'absolute', bottom: 4, right: 1, width: 12, height: 2.5, borderRadius: 1.5, backgroundColor: BK, transform: [{ rotate: '-30deg' }] },
  keyT1:    { position: 'absolute', bottom: 6, right: 2, width: 2.5, height: 5, borderRadius: 1, backgroundColor: BK, transform: [{ rotate: '-30deg' }] },
  keyT2:    { position: 'absolute', bottom: 3, right: 5, width: 2.5, height: 4, borderRadius: 1, backgroundColor: BK, transform: [{ rotate: '-30deg' }] },

  // Badge / ID card
  badgeCard: { position: 'absolute', width: 20, height: 24, borderRadius: 4, borderWidth: 2, borderColor: BK },
  badgeTop:  { position: 'absolute', top: 0, width: 8, height: 4, borderRadius: 2, backgroundColor: BK },
  badgeL1:   { position: 'absolute', top: 10, width: 12, height: 2.5, borderRadius: 1, backgroundColor: BK },
  badgeL2:   { position: 'absolute', top: 15, width: 8,  height: 2.5, borderRadius: 1, backgroundColor: BK, opacity: 0.45 },

  // Shield + check
  shield:  {
    position: 'absolute', width: 20, height: 22,
    borderRadius: 5, borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    borderWidth: 2.5, borderColor: BK,
  },
  ckShort: { position: 'absolute', bottom: 7, left: 4,  width: 5, height: 2.5, borderRadius: 1, backgroundColor: BK, transform: [{ rotate: '45deg' }] },
  ckLong:  { position: 'absolute', bottom: 8, right: 2, width: 9, height: 2.5, borderRadius: 1, backgroundColor: BK, transform: [{ rotate: '-55deg' }] },
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
