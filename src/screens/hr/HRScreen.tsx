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

interface HRSubModule {
  id: string;
  name: string;
  description: string;
  count: string;
  countLabel: string;
}

const HR_SUBMODULES: HRSubModule[] = [
  {
    id: '1',
    name: 'Human Management',
    description: 'Manage workforce policies, org structure, and HR operations',
    count: '32',
    countLabel: 'Active Staff',
  },
  {
    id: '2',
    name: 'Employee Management',
    description: 'Employee profiles, attendance, leave, and performance records',
    count: '28',
    countLabel: 'Employees',
  },
  {
    id: '3',
    name: 'User Management',
    description: 'System access, roles, permissions, and account settings',
    count: '14',
    countLabel: 'Users',
  },
];

function HumanIcon() {
  return (
    <View style={icon.wrap}>
      {/* Head */}
      <View style={icon.head} />
      {/* Body */}
      <View style={icon.body} />
      {/* Arms */}
      <View style={[icon.arm, icon.armLeft]} />
      <View style={[icon.arm, icon.armRight]} />
    </View>
  );
}

function EmployeeIcon() {
  return (
    <View style={icon.wrap}>
      {/* Head */}
      <View style={icon.head} />
      {/* Badge/ID card */}
      <View style={icon.card} />
      <View style={icon.cardLine} />
    </View>
  );
}

function UserIcon() {
  return (
    <View style={icon.wrap}>
      {/* Head */}
      <View style={icon.head} />
      {/* Shield */}
      <View style={icon.shield} />
    </View>
  );
}

const ICONS = [HumanIcon, EmployeeIcon, UserIcon];

const SUBMODULE_SCREENS: Record<string, ScreenName> = {
  '1': 'HumanManagement',
  '2': 'EmployeeManagement',
  '3': 'UserManagement',
};

export function HRScreen() {
  const { navigate } = useNavigation();
  const { colors, isDarkMode } = useTheme();
  const [tab, setTab] = useState<'dashboard' | 'modules'>('dashboard');
  const dynamicStyles = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  function handleSubModulePress(id: string) {
    const screen = SUBMODULE_SCREENS[id];
    if (screen) navigate(screen);
  }

  return (
    <SubModuleLayout
      title="HR"
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
              <Text style={styles.statValue}>3</Text>
              <Text style={styles.statLabel}>Modules</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>32</Text>
              <Text style={styles.statLabel}>Active Staff</Text>
            </View>
          </View>
        </View>
      ) : tab === 'modules' ? (
        // Modules view - shows submodule cards
        <View>
          {/* Section label */}
          <View style={styles.bandContent}>
            <Text style={[styles.bandTitle, dynamicStyles.bandTitle]}>Human Resources</Text>
            <Text style={[styles.bandSub, dynamicStyles.bandSub]}>Select a module to manage</Text>
          </View>

          <ScrollView
            contentContainerStyle={styles.scroll}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}>

          {HR_SUBMODULES.map((mod, idx) => {
            const IconComp = ICONS[idx];
            return (
              <Pressable
                key={mod.id}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => handleSubModulePress(mod.id)}
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
      ) : tab === 'submodules' ? (
        // Submodules view - shows submodules in wider cards
        <View>
          <View style={styles.submodulesGrid}>
            {HR_SUBMODULES.map((mod, idx) => {
              const IconComp = ICONS[idx];
              return (
                <Pressable
                  key={mod.id}
                  style={({ pressed }) => [styles.wideCard, pressed && styles.cardPressed]}
                  onPress={() => handleSubModulePress(mod.id)}
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

const DARK = '#1C1C1E';
const LIGHT_BG = '#F2F2F7';

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  const sheetBg = isDarkMode ? '#2C2C2E' : '#F2F2F7';

  return StyleSheet.create({
    safe: {
      backgroundColor: colors.background,
    },
    darkBand: {
      backgroundColor: DARK,
    },
    sheet: {
      backgroundColor: sheetBg,
    },
    bandTitle: {
      color: '#FFFFFF',
    },
    bandSub: {
      color: 'rgba(255,255,255,0.4)',
    },
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  darkBand: {
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
    letterSpacing: 0.2,
  },
  bandSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    marginTop: 3,
  },

  sheet: {
    flex: 1,
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

  statsContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.lg,
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

  // ── Submodule card ──────────────────────────
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

// Pure RN icons (white on pink circle)
const icon = StyleSheet.create({
  wrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
    marginBottom: 2,
  },
  body: {
    width: 14,
    height: 9,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  arm: {
    position: 'absolute',
    bottom: 1,
    width: 4,
    height: 7,
    borderRadius: 2,
    backgroundColor: '#FFFFFF',
  },
  armLeft: { left: 2, transform: [{ rotate: '-25deg' }] },
  armRight: { right: 2, transform: [{ rotate: '25deg' }] },

  // Employee card badge
  card: {
    position: 'absolute',
    bottom: 0,
    width: 14,
    height: 9,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  cardLine: {
    position: 'absolute',
    bottom: 3,
    width: 8,
    height: 1.5,
    backgroundColor: Colors.primaryHighlight,
    borderRadius: 1,
  },

  // User shield
  shield: {
    position: 'absolute',
    bottom: 0,
    width: 12,
    height: 10,
    borderRadius: 3,
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});
