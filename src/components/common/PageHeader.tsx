import React, { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { ProfileSheet } from '../dashboard/ProfileSheet';
import { MODULES } from '../../constants/modules';

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
    <MaterialCommunityIcons name="chevron-left" size={28} color={color} />
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
      <Text style={brandStyles.brandG}>G</Text>
      <Text style={brandStyles.brandPink}>P</Text>
      <Text style={brandStyles.brandRest}>IT</Text>
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
  const { goBack, stack, navigateTo, openSidebar, params } = useNavigation();
  const { user, logout } = useAuth();
  const { colors } = useTheme();
  const [showProfile, setShowProfile] = useState(false);

  // Get module name if on ModuleDetail screen
  const getModuleName = () => {
    if (stack[stack.length - 1] === 'ModuleDetail' && params && 'moduleId' in params) {
      const module = MODULES.find(m => m.id === params.moduleId);
      return module?.name || 'ModuleDetail';
    }
    return null;
  };

  const breadcrumbs = stack.length > 1 ? stack.map((screen, idx) => {
    if (screen === 'ModuleDetail') {
      return getModuleName() || screen;
    }
    return screen;
  }) : [];
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  const fullName = user?.fullName ?? 'Administrator';
  const hour = new Date().getHours();
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙';
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={[styles.header, transparent && styles.headerTransparent, dynamicStyles.header]}>
      <View style={styles.headerDecoration} />

      {/* ── Top Row: Menu, Brand, Avatar ── */}
      <View style={styles.topRow}>
        {/* Left: menu */}
        <Pressable
          onPress={openSidebar}
          style={({ pressed }) => [styles.iconBtn, dynamicStyles.iconBtn, pressed && dynamicStyles.iconBtnPressed]}
          accessibilityLabel="Open menu"
          accessibilityRole="button"
          hitSlop={10}>
          <MenuIcon color="#FFFFFF" />
        </Pressable>

        {/* Brand logo / Title */}
        <View style={styles.brandArea}>
          {showBrand && <BrandLogo />}
          {!showBrand && (
            <Text style={[styles.title, dynamicStyles.title]} numberOfLines={1}>{title}</Text>
          )}
        </View>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Right: user avatar */}
        <View
          style={[styles.avatar, dynamicStyles.avatar]}
          accessibilityLabel="User avatar">
          <Text style={[styles.avatarText, dynamicStyles.avatarText]}>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</Text>
          <View style={styles.onlineDot} />
        </View>
      </View>

      {/* ── Bottom Row: Greeting (only on brand) ── */}
      {showBrand && (
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingSubtitle, dynamicStyles.greetingSubtitle]}>{greeting} {greetingEmoji}</Text>
          <Text style={[styles.greetingTitle, dynamicStyles.greetingTitle]}>{fullName}</Text>
          <Text style={[styles.greetingWelcome, dynamicStyles.greetingWelcome]}>welcome</Text>
        </View>
      )}

      {/* Breadcrumbs */}
      {!showBrand && (
        <View style={styles.breadcrumbContainer}>
          {breadcrumbs.length > 0 && (
            <>
              <Pressable
                onPress={goBack}
                style={({ pressed }) => [styles.backIconBtn, pressed && styles.backIconBtnPressed]}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={14}>
                <MaterialCommunityIcons name="chevron-left" size={32} color="#FFFFFF" />
              </Pressable>
              {breadcrumbs.map((screenLabel, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                const screenName = stack[idx + 1]; // Get original screen name from stack
                return (
                  <Pressable
                    key={`${screenLabel}-${idx}`}
                    onPress={() => navigateTo(screenName as any)}
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
                      {SCREEN_LABELS[screenName] || screenLabel}
                    </Text>
                    {!isLast && <Text style={[styles.separator, dynamicStyles.separator]}> / </Text>}
                  </Pressable>
                );
              })}
            </>
          )}
        </View>
      )}

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
      backgroundColor: '#595959',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    title: {
      color: '#FFFFFF',
    },
    breadcrumbText: {
      color: 'rgba(255,255,255,0.7)',
    },
    breadcrumbTextActive: {
      color: '#c7d2fe',
    },
    separator: {
      color: 'rgba(255,255,255,0.4)',
    },
    iconBtn: {
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderColor: 'rgba(199,210,254,0.3)',
    },
    iconBtnPressed: {
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    avatar: {
      backgroundColor: 'linear-gradient(135deg, #e91e63 0%, #c2185b 100%)',
      borderColor: 'rgba(233,30,99,0.5)',
    },
    avatarText: {
      color: '#FFFFFF',
    },
    avatarErpText: {
      color: '#FFFFFF',
    },
    greetingSubtitle: {
      color: '#FFFFFF',
    },
    greetingTitle: {
      color: '#FFFFFF',
    },
    greetingWelcome: {
      color: 'rgba(255, 255, 255, 0.75)',
    },
  });
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'column',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    gap: 12,
    minHeight: 120,
    position: 'relative',
    overflow: 'hidden',
  },

  headerDecoration: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 182, 193, 0.12)',
    bottom: -90,
    right: -80,
  },

  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: Spacing.md,
  },

  brandArea: {
    alignItems: 'flex-start',
  },

  spacer: {
    flex: 1,
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
    borderColor: 'rgba(255,255,255,0.12)',
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

  greetingSection: {
    paddingLeft: 0,
  },

  greetingSubtitle: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    letterSpacing: 0.3,
    marginBottom: 4,
    color: '#FFFFFF',
    fontWeight: '500',
  },

  greetingTitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.3,
    marginBottom: 2,
    color: '#FFFFFF',
  },

  greetingWelcome: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    letterSpacing: 0.4,
    marginTop: 2,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '400',
  },

  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  backIconBtn: {
    padding: 4,
    marginLeft: -8,
  },
  backIconBtnPressed: {
    opacity: 0.6,
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
    borderRadius: 20,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#c2185b',
    shadowColor: Colors.primaryHighlight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.95 }],
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 16,
    fontWeight: FontWeight.bold,
    lineHeight: 20,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0, right: 0,
    width: 10, height: 10,
    borderRadius: 5,
    backgroundColor: '#30D158',
    borderWidth: 2,
    borderColor: DARK,
  },
});

const brandStyles = StyleSheet.create({
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 2,
  },
  brandG: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    color: '#E91E63',
  },
  brandPink: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandRest: {
    fontFamily: FontFamily.bold,
    fontSize: 24,
    fontWeight: FontWeight.bold,
    letterSpacing: -0.5,
    color: '#FFFFFF',
    marginRight: 4,
  },
  brandPill: {
    backgroundColor: 'transparent',
    borderRadius: 0,
    paddingHorizontal: 4,
    paddingVertical: 0,
    borderWidth: 0,
    marginLeft: 2,
  },
  brandPillText: {
    fontFamily: FontFamily.bold,
    fontSize: 14,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
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


