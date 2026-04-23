import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

// ─── Dynamic styles ─────────────────────────────────────────────────────────
function createDynamicStyles(colors: any) {
  return StyleSheet.create({
    cardTitle: { color: colors.primaryText },
    cardDesc: { color: colors.placeholder },
    chipCount: { color: colors.primaryText },
    chipLabel: { color: colors.placeholder },
  });
}

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
  const { colors } = useTheme();
  const [tab, setTab] = useState<'dashboard' | 'modules' | 'submodules'>('dashboard');
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  function handlePress(id: string) {
    const screen = SUBMODULE_SCREENS[id];
    if (screen) navigate(screen);
  }

  return (
    <SubModuleLayout
      title="User Management"
      showBack={true}
      activeTab={tab}
      onTabChange={setTab}
      showSubmodulesTab={true}
    >
      {tab === 'dashboard' ? (
        // Dashboard view - shows stats
        <View>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>24</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>7</Text>
              <Text style={styles.statLabel}>User Roles</Text>
            </View>
          </View>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>18</Text>
              <Text style={styles.statLabel}>Permissions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>12</Text>
              <Text style={styles.statLabel}>Assignments</Text>
            </View>
          </View>
        </View>
      ) : tab === 'modules' ? (
        // Modules view - shows submodules
        <View>
          <View style={styles.bandContent}>
            <Text style={styles.bandTitle}>User Management</Text>
            <Text style={styles.bandSub}>Select a module to manage</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}>

            {UM_SUBMODULES.map((mod, idx) => {
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
                    <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{mod.name}</Text>
                    <Text style={[styles.cardDesc, dynamicStyles.cardDesc]} numberOfLines={2}>{mod.description}</Text>

                    {/* Count chip */}
                    <View style={styles.chipRow}>
                      <View style={styles.chip}>
                        <View style={styles.chipDot} />
                        <Text style={[styles.chipCount, dynamicStyles.chipCount]}>{mod.count}</Text>
                        <Text style={[styles.chipLabel, dynamicStyles.chipLabel]}>{mod.countLabel}</Text>
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
      ) : tab === 'submodules' ? (
        // Submodules view - shows submodules in wider cards
        <View>
          <View style={styles.submodulesGrid}>
            {UM_SUBMODULES.map((mod, idx) => {
              const IconComp = ICONS[idx];
              return (
                <Pressable
                  key={mod.id}
                  style={({ pressed }) => [styles.wideCard, pressed && styles.cardPressed]}
                  onPress={() => handlePress(mod.id)}
                  accessibilityRole="button"
                  accessibilityLabel={mod.name}>

                  <View style={styles.iconArea}>
                    <IconComp />
                  </View>

                  <View style={styles.content}>
                    <Text style={[styles.cardTitle, dynamicStyles.cardTitle]}>{mod.name}</Text>
                    <Text style={[styles.cardDesc, dynamicStyles.cardDesc]} numberOfLines={2}>{mod.description}</Text>

                    <View style={styles.chipRow}>
                      <View style={styles.chip}>
                        <View style={styles.chipDot} />
                        <Text style={[styles.chipCount, dynamicStyles.chipCount]}>{mod.count}</Text>
                        <Text style={[styles.chipLabel, dynamicStyles.chipLabel]}>{mod.countLabel}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.arrowWrap}>
                    <View style={styles.arrowHead} />
                  </View>

                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
    </SubModuleLayout>
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

  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#F8F8FA',
    borderRadius: 14,
    padding: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },

  statValue: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
    marginBottom: Spacing.xs,
  },

  statLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#999999',
    letterSpacing: 0.3,
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

  submodulesGrid: {
    flexDirection: 'column',
    gap: Spacing.md,
  },

  wideCard: {
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
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  content: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.1,
  },
  cardDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
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
  },
  chipLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
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

// ─── Icon shapes (white on pink) ─────────────────────────────────────────────
const icon = StyleSheet.create({
  wrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  // User + plus
  head:  { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF', marginBottom: 2 },
  body:  { width: 14, height: 9, borderTopLeftRadius: 7, borderTopRightRadius: 7, backgroundColor: '#FFF' },
  plusH: { position: 'absolute', bottom: 2, right: 0, width: 8, height: 2, borderRadius: 1, backgroundColor: '#FFF' },
  plusV: { position: 'absolute', bottom: -2, right: 3, width: 2, height: 8, borderRadius: 1, backgroundColor: '#FFF' },

  // Key
  keyRing:  { position: 'absolute', top: 2, left: 2, width: 11, height: 11, borderRadius: 6, borderWidth: 2.5, borderColor: '#FFF' },
  keyShank: { position: 'absolute', bottom: 4, right: 1, width: 12, height: 2.5, borderRadius: 1.5, backgroundColor: '#FFF', transform: [{ rotate: '-30deg' }] },
  keyT1:    { position: 'absolute', bottom: 6, right: 2, width: 2.5, height: 5, borderRadius: 1, backgroundColor: '#FFF', transform: [{ rotate: '-30deg' }] },
  keyT2:    { position: 'absolute', bottom: 3, right: 5, width: 2.5, height: 4, borderRadius: 1, backgroundColor: '#FFF', transform: [{ rotate: '-30deg' }] },

  // Badge / ID card
  badgeCard: { position: 'absolute', width: 20, height: 24, borderRadius: 4, borderWidth: 2, borderColor: '#FFF' },
  badgeTop:  { position: 'absolute', top: 0, width: 8, height: 4, borderRadius: 2, backgroundColor: '#FFF' },
  badgeL1:   { position: 'absolute', top: 10, width: 12, height: 2.5, borderRadius: 1, backgroundColor: '#FFF' },
  badgeL2:   { position: 'absolute', top: 15, width: 8,  height: 2.5, borderRadius: 1, backgroundColor: '#FFF', opacity: 0.6 },

  // Shield + check
  shield:  {
    position: 'absolute', width: 20, height: 22,
    borderRadius: 5, borderBottomLeftRadius: 10, borderBottomRightRadius: 10,
    borderWidth: 2.5, borderColor: '#FFF',
  },
  ckShort: { position: 'absolute', bottom: 7, left: 4,  width: 5, height: 2.5, borderRadius: 1, backgroundColor: '#FFF', transform: [{ rotate: '45deg' }] },
  ckLong:  { position: 'absolute', bottom: 8, right: 2, width: 9, height: 2.5, borderRadius: 1, backgroundColor: '#FFF', transform: [{ rotate: '-55deg' }] },
});
