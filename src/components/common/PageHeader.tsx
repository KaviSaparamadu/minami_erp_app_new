import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { ProfileSheet } from '../dashboard/ProfileSheet';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;   // true on sub-screens; false on Dashboard
  transparent?: boolean; // removes dark background (for coloured parent headers)
}

function BackArrow() {
  return (
    <View style={arrow.wrap}>
      <View style={arrow.stem} />
      <View style={arrow.head} />
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

export function PageHeader({ title, showBack = true, transparent = false }: PageHeaderProps) {
  const { goBack } = useNavigation();
  const { user, logout } = useAuth();
  const [sheetVisible, setSheetVisible] = useState(false);

  const initial = user?.fullName.charAt(0).toUpperCase() ?? '?';

  return (
    <>
      <View style={[styles.header, transparent && styles.headerTransparent]}>

        {/* ── Left: back arrow or spacer ── */}
        {showBack ? (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={14}>
            <BackArrow />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        {/* ── Center: page title ── */}
        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
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

      <ProfileSheet
        visible={sheetVisible}
        user={user!}
        onClose={() => setSheetVisible(false)}
        onLogout={logout}
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
    gap: Spacing.sm,
  },
  headerTransparent: {
    backgroundColor: 'transparent',
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  iconBtnPressed: { backgroundColor: 'rgba(255,255,255,0.18)' },

  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.4,
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
    borderColor: 'rgba(233,30,99,0.35)',
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
    bottom: 0, right: 0,
    width: 9, height: 9,
    borderRadius: 5,
    backgroundColor: '#30D158',
    borderWidth: 1.5,
    borderColor: DARK,
  },
});

// Back arrow — left-pointing chevron
const arrow = StyleSheet.create({
  wrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stem: {
    position: 'absolute',
    width: 10,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  head: {
    position: 'absolute',
    left: 0,
    width: 7,
    height: 7,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '-45deg' }, { translateX: 2 }],
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
    borderColor: DARK,
  },
});
