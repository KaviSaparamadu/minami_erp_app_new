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
  const [search, setSearch] = useState('');

  function handleSubModulePress(id: string) {
    const screen = SUBMODULE_SCREENS[id];
    if (screen) navigate(screen);
  }

  const q = search.trim().toLowerCase();
  const filtered = q === ''
    ? HR_SUBMODULES
    : HR_SUBMODULES.filter(m =>
        m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q),
      );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

      <PageHeader title="HR" showBack={true} />

      {/* Content */}
      <View style={styles.sheet}>

        {/* Search bar */}
        <View style={sb.wrap}>
          <View style={sb.iconWrap}>
            <View style={sb.glass} />
            <View style={sb.handle} />
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
            const IconComp = ICONS[idx % ICONS.length];
            const tint = CARD_TINTS[idx % CARD_TINTS.length];
            return (
              <Pressable
                key={mod.id}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => handleSubModulePress(mod.id)}
                accessibilityRole="button"
                accessibilityLabel={mod.name}>

                {/* Icon area — unique tint, no pink border */}
                <View style={[styles.iconArea, { backgroundColor: tint }]}>
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

const LIGHT_BG = '#FFFFFF';

// Uniform pink tint for all sub-module cards
const CARD_TINTS = ['rgba(233,30,99,0.07)'];

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#1C1C1E' },

  sheet: {
    flex: 1,
    backgroundColor: LIGHT_BG,
  },
  scroll: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: 40,
    gap: 12,
  },

  // ── Submodule card ──────────────────────────
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    gap: 14,
    // Shadow only — no border stripes
    shadowColor: '#1C1C1E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },
  cardPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.86,
  },

  iconArea: {
    width: 54,
    height: 54,
    borderRadius: 16,
    // backgroundColor injected per-card via inline style
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
    fontSize: 15,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
    letterSpacing: 0.1,
  },
  cardDesc: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: '#9E9E9E',
    lineHeight: 17,
  },

  chipRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F5F7',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#30D158',
  },
  chipCount: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
  },
  chipLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    color: '#9E9E9E',
  },

  arrowWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  arrowHead: {
    width: 8,
    height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#595959',
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
    backgroundColor: '#1C1C1E',
    marginBottom: 2,
  },
  body: {
    width: 14,
    height: 9,
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: '#1C1C1E',
  },
  arm: {
    position: 'absolute',
    bottom: 1,
    width: 4,
    height: 7,
    borderRadius: 2,
    backgroundColor: '#1C1C1E',
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
    backgroundColor: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#BDBDBD',
  },
  cardLine: {
    position: 'absolute',
    bottom: 3,
    width: 8,
    height: 1.5,
    backgroundColor: '#1C1C1E',
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
    backgroundColor: '#E0E0E0',
    borderWidth: 1.5,
    borderColor: '#1C1C1E',
  },
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
