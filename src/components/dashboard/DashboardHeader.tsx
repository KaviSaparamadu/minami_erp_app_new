import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing, Colors } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface DashboardHeaderProps {
  onBack: () => void;
}

interface IconProps {
  color: string;
}

function LogoutIcon({ color }: IconProps) {
  return (
    <View style={iconBase.wrap}>
      <View style={[iconBase.arc, { borderColor: color, borderBottomColor: 'transparent' }]} />
      <View style={[iconBase.bar, { backgroundColor: color }]} />
    </View>
  );
}

function BellIcon({ color }: IconProps) {
  return (
    <View style={bellBase.wrap}>
      <View style={[bellBase.top, { borderColor: color }]} />
      <View style={[bellBase.body, { backgroundColor: color }]} />
      <View style={[bellBase.clapper, { backgroundColor: color }]} />
      <View style={bellBase.dot} />
    </View>
  );
}

export function DashboardHeader({ onBack }: DashboardHeaderProps) {
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  return (
    <>
      <View style={[styles.header, dynamicStyles.header]}>
        {/* ── Left: direct logout ── */}
        <Pressable
          onPress={onBack}
          style={({ pressed }) => [styles.iconBtn, dynamicStyles.iconBtn, pressed && dynamicStyles.iconBtnPressed]}
          accessibilityLabel="Log out"
          accessibilityRole="button"
          hitSlop={14}>
          <LogoutIcon color="#FFFFFF" />
        </Pressable>

        {/* ── Center: brand ── */}
        <View style={styles.brand}>
          <Text style={[styles.brandG, { color: '#FFFFFF' }]}>G</Text>
          <Text style={styles.brandPink}>P</Text>
          <Text style={[styles.brandRest, { color: '#FFFFFF' }]}>IT</Text>
          <View style={styles.brandPill}>
            <Text style={styles.brandPillText}>ERP</Text>
          </View>
        </View>

        {/* ── Right: bell icon ── */}
        <Pressable
          style={({ pressed }) => [styles.iconBtn, dynamicStyles.iconBtn, pressed && dynamicStyles.iconBtnPressed]}
          accessibilityLabel="Notifications"
          accessibilityRole="button"
          hitSlop={14}>
          <BellIcon color="#FFFFFF" />
        </Pressable>
      </View>
    </>
  );
}

const DARK = '#1C1C1E';

function createDynamicStyles(colors: any) {
  const isDark = colors.background !== '#FFFFFF';
  return StyleSheet.create({
    header: {
      backgroundColor: isDark ? 'linear-gradient(135deg, #1C1C1E 0%, #2A2A2C 100%)' : 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F7 100%)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 4,
    },
    iconBtn: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    iconBtnPressed: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
    },
  });
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    paddingTop: Spacing.xl,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
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
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  brandPink: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
    letterSpacing: 1,
  },
  brandRest: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
    marginRight: 6,
  },
  brandPill: {
    backgroundColor: 'rgba(233,30,99,0.18)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.3)',
  },
  brandPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
    letterSpacing: 1,
  },
});

const iconBase = StyleSheet.create({
  wrap: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  arc: {
    width: 14, height: 14,
    borderRadius: 7,
    borderWidth: 2,
    transform: [{ rotate: '45deg' }],
    position: 'absolute',
  },
  bar: {
    width: 2, height: 7,
    borderRadius: 1,
    position: 'absolute',
    top: 0,
  },
});

const bellBase = StyleSheet.create({
  wrap: { width: 18, height: 19, alignItems: 'center' },
  top: {
    width: 7, height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
    borderBottomWidth: 0,
    marginBottom: -1,
  },
  body: {
    width: 14, height: 9,
    borderTopLeftRadius: 7, borderTopRightRadius: 7,
  },
  clapper: {
    width: 5, height: 3,
    borderBottomLeftRadius: 3, borderBottomRightRadius: 3,
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
