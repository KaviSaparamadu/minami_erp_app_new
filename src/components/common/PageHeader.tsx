import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontWeight, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { ProfileSheet } from '../dashboard/ProfileSheet';

// ─── Screen labels ────────────────────────────────────────────────────────────
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

// ─── Back chevron (white) ─────────────────────────────────────────────────────
function BackChevron() {
  return (
    <View style={ic.chevron}>
      <View style={ic.chevTop} />
      <View style={ic.chevBot} />
    </View>
  );
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

// ─── Component ────────────────────────────────────────────────────────────────
export function PageHeader({ title, showBack = true }: PageHeaderProps) {
  const { goBack, stack } = useNavigation();
  const { user, logout } = useAuth();
  const [sheetOpen, setSheetOpen] = useState(false);

  const initial = user?.fullName.charAt(0).toUpperCase() ?? '?';
  const crumbs  = stack.slice(0, -1).map(s => SCREEN_LABELS[s]);

  return (
    <>
      <View style={styles.header}>

        {/* ── Back button ────────────────────────────────────────────────────── */}
        {showBack ? (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.backBtn, pressed && styles.backBtnPressed]}
            hitSlop={14}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <BackChevron />
          </Pressable>
        ) : (
          /* Spacer to balance right-side icons */
          <View style={styles.backBtn} />
        )}

        {/* ── Title + breadcrumb ─────────────────────────────────────────────── */}
        <View style={styles.titleBlock}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>

          {crumbs.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.crumbRow}>
              {crumbs.map((lbl, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <Text style={styles.crumbSep}> / </Text>}
                  <Text style={styles.crumbStep}>{lbl}</Text>
                </React.Fragment>
              ))}
              <Text style={styles.crumbSep}> / </Text>
              <Text style={styles.crumbActive}>{title}</Text>
            </ScrollView>
          )}
        </View>

        {/* ── Right actions ──────────────────────────────────────────────────── */}
        <View style={styles.actions}>
          <Pressable
            style={({ pressed }) => [styles.actionBtn, pressed && styles.actionPressed]}
            hitSlop={12}
            accessibilityLabel="Notifications">
            <BellIcon />
          </Pressable>

          <Pressable
            onPress={() => setSheetOpen(true)}
            style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
            hitSlop={8}
            accessibilityLabel="Profile">
            <Text style={styles.avatarText}>{initial}</Text>
            <View style={styles.onlineDot} />
          </Pressable>
        </View>

      </View>

      <ProfileSheet
        visible={sheetOpen}
        user={user!}
        onClose={() => setSheetOpen(false)}
        onLogout={logout}
      />
    </>
  );
}

// ─── Design tokens ────────────────────────────────────────────────────────────
const BG   = '#111318';  // rich dark — unified with dashboard hero
const W    = '#FFFFFF';
const W55  = 'rgba(255,255,255,0.55)';
const W28  = 'rgba(255,255,255,0.28)';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 13,
    backgroundColor: BG,
    gap: 10,
  },

  // ── Back ────────────────────────────────────────────────────────────────────
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  backBtnPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    transform: [{ scale: 0.92 }],
  },

  // ── Title ───────────────────────────────────────────────────────────────────
  titleBlock: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: W,
    letterSpacing: -0.2,
  },

  // ── Breadcrumb ──────────────────────────────────────────────────────────────
  crumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  crumbStep: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: W28,
    letterSpacing: 0.1,
  },
  crumbSep: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.18)',
  },
  crumbActive: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: W55,
    fontWeight: FontWeight.medium,
  },

  // ── Actions ──────────────────────────────────────────────────────────────────
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },

  // ── Avatar ───────────────────────────────────────────────────────────────────
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(233,30,99,0.45)',
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
    bottom: 1, right: 1,
    width: 9, height: 9,
    borderRadius: 5,
    backgroundColor: '#34D058',
    borderWidth: 1.5,
    borderColor: BG,
  },
});

// ─── Icon shapes ──────────────────────────────────────────────────────────────
const ic = StyleSheet.create({
  // Chevron <
  chevron: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  chevTop: {
    position: 'absolute',
    width: 8, height: 2,
    backgroundColor: W,
    borderRadius: 1,
    top: 3, left: 3,
    transform: [{ rotate: '-45deg' }],
  },
  chevBot: {
    position: 'absolute',
    width: 8, height: 2,
    backgroundColor: W,
    borderRadius: 1,
    bottom: 3, left: 3,
    transform: [{ rotate: '45deg' }],
  },

  // Bell
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
    borderColor: BG,
  },
});
