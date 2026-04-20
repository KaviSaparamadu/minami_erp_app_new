import React, { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ProfileSheet } from '../dashboard/ProfileSheet';

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;   // true on sub-screens; false on Dashboard
  transparent?: boolean; // removes dark background (for coloured parent headers)
  showBrand?: boolean; // shows brand logo instead of title (for Dashboard)
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

function MenuIcon({ color }: { color: string }) {
  return (
    <View style={menuIcon.wrap}>
      <View style={[menuIcon.bar, { backgroundColor: color }]} />
      <View style={[menuIcon.bar, { backgroundColor: color }]} />
      <View style={[menuIcon.bar, { backgroundColor: color }]} />
    </View>
  );
}

function BrandLogo() {
  return (
    <View style={brandStyles.brand}>
      <Text style={[brandStyles.brandG, { color: '#FFFFFF' }]}>G</Text>
      <Text style={brandStyles.brandPink}>P</Text>
      <Text style={[brandStyles.brandRest, { color: '#FFFFFF' }]}>IT</Text>
      <View style={brandStyles.brandPill}>
        <Text style={brandStyles.brandPillText}>ERP</Text>
      </View>
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

export function PageHeader({ title = '', showBack = true, transparent = false, showBrand = false }: PageHeaderProps) {
  const { goBack, stack, navigateTo, openSidebar } = useNavigation();
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [showProfile, setShowProfile] = useState(false);
  const breadcrumbs = stack.length > 1 ? stack : [];
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  return (
    <View style={[styles.header, transparent && styles.headerTransparent, dynamicStyles.header]}>
      {/* ── Left: menu ── */}
      <Pressable
        onPress={openSidebar}
        style={({ pressed }) => [styles.iconBtn, dynamicStyles.iconBtn, pressed && dynamicStyles.iconBtnPressed]}
        accessibilityLabel="Open menu"
        accessibilityRole="button"
        hitSlop={10}>
        <MenuIcon color="#FFFFFF" />
      </Pressable>

      {/* ── Back arrow (optional) ── */}
      {showBack && (
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.iconBtn, dynamicStyles.iconBtn, pressed && dynamicStyles.iconBtnPressed]}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={14}>
          <BackArrow color="#FFFFFF" />
        </Pressable>
      )}

      {/* ── Center: brand logo or page title + breadcrumbs ── */}
      <View style={styles.titleWrap}>
        {showBrand ? (
          <BrandLogo />
        ) : (
          <>
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
          </>
        )}
      </View>

      {/* ── Right: user avatar ── */}
      <Pressable
        onPress={() => setShowProfile(true)}
        style={({ pressed }) => [styles.avatar, dynamicStyles.avatar, pressed && styles.avatarPressed]}
        accessibilityLabel="Open profile"
        accessibilityRole="button"
        hitSlop={10}>
        <Text style={[styles.avatarText, dynamicStyles.avatarText]}>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</Text>
        <View style={styles.onlineDot} />
      </Pressable>

      {user && (
        <ProfileSheet
          visible={showProfile}
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={logout}
        />
      )}
    </View>
  );
}

const DARK = '#1C1C1E';

function createDynamicStyles(colors: any) {
  const isDark = colors.background !== '#FFFFFF';
  return StyleSheet.create({
    header: {
      backgroundColor: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0f1419 100%)',
      shadowColor: Colors.primaryHighlight,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 8,
    },
    title: {
      color: '#FFFFFF',
    },
    breadcrumbText: {
      color: 'rgba(255,255,255,0.6)',
    },
    breadcrumbTextActive: {
      color: colors.primaryHighlight,
    },
    separator: {
      color: 'rgba(255,255,255,0.3)',
    },
    iconBtn: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderColor: 'rgba(255,255,255,0.25)',
    },
    iconBtnPressed: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    avatar: {
      backgroundColor: Colors.primaryHighlight,
      borderColor: 'rgba(233,30,99,0.35)',
    },
    avatarText: {
      color: '#FFFFFF',
    },

  });
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    gap: Spacing.md,
    minHeight: 64,
  },
  headerTransparent: {
    backgroundColor: 'transparent',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  iconBtnPressed: { backgroundColor: 'rgba(255,255,255,0.2)' },

  titleWrap: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },

  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    textAlign: 'center',
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
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: Colors.primaryHighlight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 5,
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

const brandStyles = StyleSheet.create({
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
    letterSpacing: 1.2,
  },
  brandPink: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
    letterSpacing: 1.2,
  },
  brandRest: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    letterSpacing: 1.2,
    marginRight: 8,
  },
  brandPill: {
    backgroundColor: 'rgba(233,30,99,0.25)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: 'rgba(233,30,99,0.4)',
    shadowColor: Colors.primaryHighlight,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  brandPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
    letterSpacing: 0.8,
  },
});

// Hamburger menu — three horizontal bars
const menuIcon = StyleSheet.create({
  wrap: {
    width: 16,
    height: 14,
    justifyContent: 'space-between',
  },
  bar: {
    width: '100%',
    height: 2,
    borderRadius: 1,
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

