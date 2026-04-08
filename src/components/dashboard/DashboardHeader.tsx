import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing, Colors } from '../../constants/theme';
import type { AuthUser } from '../../types/auth';
import { ProfileSheet } from './ProfileSheet';

interface DashboardHeaderProps {
  user: AuthUser;
  onBack: () => void;
}

function LogoutIcon() {
  return (
    <View style={icon.wrap}>
      <View style={icon.arc} />
      <View style={icon.bar} />
    </View>
  );
}

function BellIcon() {
  return (
    <View style={bell.wrap}>
      <View style={bell.top} />
      <View style={bell.body} />
      <View style={bell.clapper} />
      <View style={bell.dot} />
    </View>
  );
}

export function DashboardHeader({ user, onBack }: DashboardHeaderProps) {
  const [sheetVisible, setSheetVisible] = useState(false);
  const initial = user.fullName.charAt(0).toUpperCase();

  return (
    <>
      <View style={styles.header}>

        {/* ── Left: direct logout ── */}
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          accessibilityLabel="Log out"
          accessibilityRole="button"
          hitSlop={14}>
          <LogoutIcon />
        </Pressable>

        {/* ── Center: brand ── */}
        <View style={styles.brand}>
          <Text style={styles.brandG}>G</Text>
          <Text style={styles.brandPink}>P</Text>
          <Text style={styles.brandRest}>IT</Text>
          <View style={styles.brandPill}>
            <Text style={styles.brandPillText}>ERP</Text>
          </View>
        </View>

        {/* ── Right: bell + avatar ── */}
        <View style={styles.rightRow}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            accessibilityLabel="Notifications"
            accessibilityRole="button"
            hitSlop={14}>
            <BellIcon />
          </Pressable>

          {/* Profile avatar — opens sheet */}
          <Pressable
            onPress={() => setSheetVisible(true)}
            style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
            accessibilityLabel="Profile"
            accessibilityRole="button"
            hitSlop={8}>
            <Text style={styles.avatarText}>{initial}</Text>
            <View style={styles.onlineDot} />
          </Pressable>
        </View>

      </View>

      {/* Profile bottom sheet */}
      <ProfileSheet
        visible={sheetVisible}
        user={user}
        onClose={() => setSheetVisible(false)}
        onLogout={onBack}
      />
    </>
  );
}

const DARK = '#1C1C1E';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: DARK,
  },

  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconBtnPressed: { backgroundColor: 'rgba(255,255,255,0.15)' },

  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  brandG: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  brandPink: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
    letterSpacing: 1,
  },
  brandRest: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginRight: 6,
  },
  brandPill: {
    backgroundColor: 'rgba(233,30,99,0.18)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.3)',
  },
  brandPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
    letterSpacing: 1,
  },

  rightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(233,30,99,0.4)',
  },
  avatarPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.93 }],
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#30D158',
    borderWidth: 1.5,
    borderColor: DARK,
  },
});

const icon = StyleSheet.create({
  wrap: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  arc: {
    width: 14, height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
  },
  bar: {
    width: 2, height: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
    position: 'absolute',
    top: 0,
  },
});

const bell = StyleSheet.create({
  wrap: { width: 18, height: 19, alignItems: 'center' },
  top: {
    width: 7, height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  body: {
    width: 14, height: 9,
    borderTopLeftRadius: 7, borderTopRightRadius: 7,
    backgroundColor: '#FFFFFF',
  },
  clapper: {
    width: 5, height: 3,
    borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
    backgroundColor: '#FFFFFF',
    marginTop: -1,
  },
  dot: {
    position: 'absolute',
    top: -1, right: 1,
    width: 6, height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primaryHighlight,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
});
