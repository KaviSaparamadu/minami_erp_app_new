import React from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';

// ─── Sub-module definitions ───────────────────────────────────────────────────
interface UMSubModule {
  id: string;
  name: string;
  description: string;
  count: string;
  countLabel: string;
  accentColor: string;
}

const UM_SUBMODULES: UMSubModule[] = [
  {
    id: '1',
    name: 'Create System Users',
    description: 'Add new system accounts, set credentials, and configure login access for staff.',
    count: '24',
    countLabel: 'Active Users',
    accentColor: '#3F51B5',
  },
  {
    id: '2',
    name: 'Assign User Permission',
    description: 'Grant or revoke individual permissions for specific modules and actions.',
    count: '18',
    countLabel: 'Configured',
    accentColor: '#E91E63',
  },
  {
    id: '3',
    name: 'Create User Role',
    description: 'Define reusable role profiles that bundle a set of permissions together.',
    count: '7',
    countLabel: 'Roles',
    accentColor: '#FF9800',
  },
  {
    id: '4',
    name: 'Assign User Role Permission',
    description: 'Map permissions to roles and assign those roles to users across the system.',
    count: '12',
    countLabel: 'Assignments',
    accentColor: '#009688',
  },
];

// ─── Icons (pure RN, white on colored square) ─────────────────────────────────

/** Create System Users — person + plus */
function CreateUserIcon() {
  return (
    <View style={icon.wrap}>
      <View style={icon.head} />
      <View style={icon.body} />
      <View style={icon.plusH} />
      <View style={icon.plusV} />
    </View>
  );
}

/** Assign User Permission — person + key */
function AssignPermIcon() {
  return (
    <View style={icon.wrap}>
      <View style={icon.head} />
      <View style={icon.body} />
      <View style={icon.keyRing} />
      <View style={icon.keyShank} />
      <View style={icon.keyTooth1} />
    </View>
  );
}

/** Create User Role — badge / tag */
function CreateRoleIcon() {
  return (
    <View style={icon.wrap}>
      <View style={icon.badge} />
      <View style={icon.badgeHole} />
      <View style={icon.badgeLine1} />
      <View style={icon.badgeLine2} />
    </View>
  );
}

/** Assign User Role Permission — shield + checkmark */
function AssignRolePermIcon() {
  return (
    <View style={icon.wrap}>
      <View style={icon.shield} />
      <View style={icon.ckL} />
      <View style={icon.ckR} />
    </View>
  );
}

const ICONS = [CreateUserIcon, AssignPermIcon, CreateRoleIcon, AssignRolePermIcon];

// ─── Screen ──────────────────────────────────────────────────────────────────
export function UserManagementScreen() {
  function handlePress(mod: UMSubModule) {
    Alert.alert(mod.name, `"${mod.name}" module is coming soon.`, [{ text: 'OK' }]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

      {/* Dark band */}
      <View style={styles.darkBand}>
        <PageHeader title="User Management" showBack={true} />
        <View style={styles.bandContent}>
          <Text style={styles.bandTitle}>User Management</Text>
          <Text style={styles.bandSub}>Manage system access, roles &amp; permissions</Text>
        </View>
      </View>

      {/* Light card sheet */}
      <View style={styles.sheet}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}>

          {UM_SUBMODULES.map((mod, idx) => {
            const IconComp = ICONS[idx];
            return (
              <Pressable
                key={mod.id}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => handlePress(mod)}
                accessibilityRole="button"
                accessibilityLabel={mod.name}>

                {/* Icon area — each sub-module has its own accent colour */}
                <View style={[styles.iconArea, { backgroundColor: mod.accentColor }]}>
                  <IconComp />
                </View>

                {/* Content */}
                <View style={styles.content}>
                  <Text style={styles.cardTitle}>{mod.name}</Text>
                  <Text style={styles.cardDesc} numberOfLines={2}>{mod.description}</Text>

                  {/* Count chip */}
                  <View style={styles.chipRow}>
                    <View style={[styles.chip, { borderColor: mod.accentColor + '33' }]}>
                      <View style={[styles.chipDot, { backgroundColor: mod.accentColor }]} />
                      <Text style={[styles.chipCount, { color: mod.accentColor }]}>{mod.count}</Text>
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

// ─── Styles ──────────────────────────────────────────────────────────────────
const DARK     = '#1C1C1E';
const LIGHT_BG = '#F2F2F7';

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: DARK },
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
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
    borderWidth: 1,
  },
  chipDot:   { width: 5, height: 5, borderRadius: 3 },
  chipCount: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  chipLabel: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder },

  arrowWrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  arrowHead: { width: 8, height: 8, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#C0C0C8', transform: [{ rotate: '45deg' }, { translateX: -2 }] },
});

// ─── Icon shapes ──────────────────────────────────────────────────────────────
const icon = StyleSheet.create({
  wrap: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },

  // Shared person shape
  head: { position: 'absolute', top: 1, width: 9, height: 9, borderRadius: 5, backgroundColor: '#FFF' },
  body: { position: 'absolute', bottom: 2, width: 16, height: 9, borderTopLeftRadius: 8, borderTopRightRadius: 8, backgroundColor: '#FFF' },

  // Plus (Create System Users)
  plusH: { position: 'absolute', bottom: 2, right: 1, width: 8, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.9)' },
  plusV: { position: 'absolute', bottom: -1, right: 4, width: 2, height: 8, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.9)' },

  // Key (Assign User Permission)
  keyRing:  { position: 'absolute', bottom: 3, right: 0, width: 7, height: 7, borderRadius: 4, borderWidth: 2, borderColor: 'rgba(255,255,255,0.9)' },
  keyShank: { position: 'absolute', bottom: 5, right: 5, width: 6, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.9)' },
  keyTooth1:{ position: 'absolute', bottom: 3, right: 6, width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.9)' },

  // Badge (Create User Role)
  badge:      { position: 'absolute', width: 18, height: 22, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.9)' },
  badgeHole:  { position: 'absolute', top: 2, width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,152,0,0.8)' },
  badgeLine1: { position: 'absolute', top: 10, width: 10, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,152,0,0.7)' },
  badgeLine2: { position: 'absolute', top: 14, width: 7, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,152,0,0.5)' },

  // Shield + checkmark (Assign User Role Permission)
  shield: {
    position: 'absolute', width: 18, height: 20,
    borderRadius: 4, borderBottomLeftRadius: 9, borderBottomRightRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  ckL: { position: 'absolute', bottom: 7, left: 4, width: 5, height: 2, backgroundColor: 'rgba(0,150,136,0.9)', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  ckR: { position: 'absolute', bottom: 8, right: 3, width: 9, height: 2, backgroundColor: 'rgba(0,150,136,0.9)', borderRadius: 1, transform: [{ rotate: '-55deg' }] },
});
