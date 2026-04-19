import React, { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ProfileSheet } from '../dashboard/ProfileSheet';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;   // true on sub-screens; false on Dashboard
  transparent?: boolean; // removes dark background (for coloured parent headers)
}

interface BackArrowProps {
  color: string;
}

function BackArrow({ color }: BackArrowProps) {
  return (
    <View style={arrowWrap.wrap}>
      <View style={[arrowWrap.stem, { backgroundColor: color }]} />
      <View style={[arrowWrap.head, { borderColor: color }]} />
    </View>
  );
}


const SCREEN_LABELS: Record<string, string> = {
  Dashboard: 'Dashboard',
  HR: 'Human Resources',
  HumanManagement: 'Human Management',
  EmployeeManagement: 'Employee Management',
  UserManagement: 'User Management',
  CreateSystemUsers: 'Create System Users',
  AssignUserPermission: 'Assign User Permission',
  CreateUserRole: 'Create User Role',
  AssignUserRolePermission: 'Assign User Role Permission',
};

export function PageHeader({ title, showBack = true, transparent = false }: PageHeaderProps) {
  const { goBack, stack, navigateTo } = useNavigation();
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [sheetVisible, setSheetVisible] = useState(false);

  const initial = user?.fullName.charAt(0).toUpperCase() ?? '?';
  const breadcrumbs = stack.length > 1 ? stack : [];
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  return (
    <>
      <View style={[styles.header, transparent && styles.headerTransparent, { backgroundColor: colors.background }]}>

        {/* ── Left: back arrow or spacer ── */}
        {showBack ? (
          <Pressable
            onPress={goBack}
            style={({ pressed }) => [styles.iconBtn, dynamicStyles.iconBtn, pressed && dynamicStyles.iconBtnPressed]}
            accessibilityLabel="Go back"
            accessibilityRole="button"
            hitSlop={14}>
            <BackArrow color={colors.primaryText} />
          </Pressable>
        ) : (
          <View style={[styles.iconBtn, dynamicStyles.iconBtn]} />
        )}

        {/* ── Center: page title + breadcrumbs ── */}
        <View style={styles.titleWrap}>
          <Text style={[styles.title, dynamicStyles.title]} numberOfLines={1}>{title}</Text>
          {breadcrumbs.length > 0 && (
            <View style={styles.breadcrumbContainer}>
              {breadcrumbs.map((screen, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <Pressable
                    key={screen}
                    onPress={() => navigateTo(screen)}
                    style={({ pressed }) => [
                      styles.breadcrumbItem,
                      isLast && styles.breadcrumbActive,
                      pressed && styles.breadcrumbPressed,
                    ]}>
                    <Text
                      style={[
                        styles.breadcrumbText,
                        dynamicStyles.breadcrumbText,
                        isLast && [styles.breadcrumbTextActive, dynamicStyles.breadcrumbTextActive],
                      ]}>
                      {SCREEN_LABELS[screen] || screen}
                    </Text>
                    {!isLast && <Text style={[styles.separator, dynamicStyles.separator]}> / </Text>}
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {/* ── Right: avatar ── */}
        <Pressable
          onPress={() => setSheetVisible(true)}
          style={({ pressed }) => [styles.avatar, pressed && styles.avatarPressed]}
          accessibilityLabel="Profile"
          accessibilityRole="button"
          hitSlop={8}>
          <Text style={[styles.avatarText, dynamicStyles.avatarText]}>{initial}</Text>
          <View style={[styles.onlineDot, { borderColor: colors.background }]} />
        </Pressable>

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

function createDynamicStyles(colors: any) {
  const isDark = colors.background !== '#FFFFFF';
  return StyleSheet.create({
    title: {
      color: colors.primaryText,
    },
    breadcrumbText: {
      color: colors.placeholder,
    },
    breadcrumbTextActive: {
      color: colors.primaryHighlight,
    },
    separator: {
      color: colors.placeholder,
    },
    avatarText: {
      color: isDark ? '#FFFFFF' : '#FFFFFF',
    },
    iconBtn: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
    },
    iconBtnPressed: {
      backgroundColor: isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.18)',
    },
  });
}

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
    alignItems: 'flex-start',
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.4,
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 0,
  },
  breadcrumbItem: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  breadcrumbPressed: {
    opacity: 0.7,
  },
  breadcrumbActive: {
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primaryHighlight,
    paddingBottom: 1,
  },
  breadcrumbText: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    paddingHorizontal: 3,
  },
  breadcrumbTextActive: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  separator: {
    fontSize: 9,
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
const arrowWrap = StyleSheet.create({
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
    borderRadius: 1,
  },
  head: {
    position: 'absolute',
    left: 0,
    width: 7,
    height: 7,
    borderTopWidth: 2,
    borderLeftWidth: 2,
    transform: [{ rotate: '-45deg' }, { translateX: 2 }],
  },
});

