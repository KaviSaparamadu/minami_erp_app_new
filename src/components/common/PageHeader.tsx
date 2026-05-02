import React, { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, ScrollView } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { useSearch } from '../../context/SearchContext';
import { SearchResults } from './SearchResults';
import { ProfileSheet } from '../dashboard/ProfileSheet';
import { MODULES } from '../../constants/modules';

interface PageHeaderProps {
  title?: string;
  showBack?: boolean;   // true on sub-screens; false on Dashboard
  transparent?: boolean; // removes dark background (for coloured parent headers)
  showBrand?: boolean; // shows brand logo instead of title (for Dashboard)
  showBreadcrumbs?: boolean; // renders breadcrumbs inside the header (default true when !showBrand)
  dashboardSearch?: boolean; // shows dashboard search in header
  hideSearchBar?: boolean; // hides search bar even if dashboardSearch is true
  hideSearchIcon?: boolean; // hides the magnify icon in the header top row
  hideGreeting?: boolean; // shows brand logo without the greeting/search block (compact logo-only mode)
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
      <Text style={brandStyles.brandSpace}> </Text>
      <Text style={brandStyles.brandPink}>P</Text>
      <Text style={brandStyles.brandLowercaseI}>i</Text>
      <Text style={brandStyles.brandRest}>T</Text>
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

export function PageHeader({
  title = '',
  showBack = true,
  transparent = false,
  showBrand = false,
  showBreadcrumbs = true,
  dashboardSearch = false,
  hideSearchBar = false,
  hideSearchIcon = false,
  hideGreeting = false,
}: PageHeaderProps) {
  const { goBack, stack, navigateTo, openSidebar, paramsStack } = useNavigation();
  const { user, logout } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const { searchQuery, setSearchQuery, searchResults, isSearching, setIsSearchVisible } = useSearch();
  const [showProfile, setShowProfile] = useState(false);

  const getModuleNameForIdx = (idx: number) => {
    const p = paramsStack[idx];
    if (p && 'moduleId' in p) {
      const module = MODULES.find(m => m.id === p.moduleId);
      return module?.name || 'ModuleDetail';
    }
    return 'ModuleDetail';
  };

  const breadcrumbs = stack.slice(1).map((screen, i) => {
    const stackIdx = i + 1;
    const label = screen === 'ModuleDetail'
      ? getModuleNameForIdx(stackIdx)
      : (SCREEN_LABELS[screen] || screen);
    return { screen, label, stackIdx };
  });

  // Remove duplicate consecutive breadcrumbs
  const uniqueBreadcrumbs = breadcrumbs.reduce((acc, current, idx) => {
    if (idx === 0 || current.label !== breadcrumbs[idx - 1].label) {
      acc.push(current);
    }
    return acc;
  }, [] as typeof breadcrumbs);
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  const hour = new Date().getHours();
  const greetingEmoji = hour < 12 ? '☀️' : hour < 17 ? '👋' : '🌙';
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View>
      <View style={[styles.header, showBack && styles.headerCompact, transparent && styles.headerTransparent, dynamicStyles.header]}>
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

        {/* Search icon — non-dashboard screens only */}
        {!showBrand && !hideSearchIcon && (
          <Pressable
            onPress={() => setIsSearchVisible(true)}
            style={({ pressed }) => [styles.iconBtn, dynamicStyles.iconBtn, pressed && dynamicStyles.iconBtnPressed]}
            accessibilityLabel="Search"
            accessibilityRole="button"
            hitSlop={10}>
            <MaterialCommunityIcons name="magnify" size={20} color="#FFFFFF" />
          </Pressable>
        )}

        {/* Right: user avatar */}
        <View
          style={[styles.avatar, dynamicStyles.avatar]}
          accessibilityLabel="User avatar">
          <Text style={[styles.avatarText, dynamicStyles.avatarText]}>{user?.fullName?.charAt(0).toUpperCase() || 'U'}</Text>
          <View style={styles.onlineDot} />
        </View>
      </View>

      {/* ── Bottom Row: Greeting (only on brand, hidden in logo-only mode) ── */}
      {showBrand && !hideGreeting && (
        <View style={styles.greetingSection}>
          <Text style={[styles.greetingSubtitle, dynamicStyles.greetingSubtitle]}>{greeting} {greetingEmoji}</Text>
        </View>
      )}

      {/* Dashboard Search Bar with Everything Search */}
      {dashboardSearch && showBrand && !hideGreeting && !hideSearchBar && (
        <View>
          <View style={[styles.dashboardSearchBar, dynamicStyles.dashboardSearchBar]}>
            <MaterialCommunityIcons name="magnify" size={16} color="#8E8E93" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search everything..."
              placeholderTextColor="#A0A0A0"
              style={[styles.dashboardSearchInput, dynamicStyles.dashboardSearchInput]}
            />
            {searchQuery.trim() && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <MaterialCommunityIcons name="close-circle" size={14} color="#8E8E93" />
              </Pressable>
            )}
          </View>

          {/* Search Results Dropdown */}
          {searchQuery.trim() && (
            <ScrollView
              style={[styles.searchDropdown, dynamicStyles.searchDropdown]}
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}>
              {searchResults.length > 0 ? (
                <SearchResults
                  results={searchResults.slice(0, 8)}
                  isLoading={isSearching}
                  onSelectResult={() => setSearchQuery('')}
                />
              ) : (
                <View style={[styles.noResultsMessage, dynamicStyles.noResultsMessage]}>
                  <MaterialCommunityIcons
                    name="magnify-close"
                    size={40}
                    color={isDarkMode ? '#666' : '#CCC'}
                  />
                  <Text style={[styles.noResultsText, dynamicStyles.noResultsText]}>
                    No results found
                  </Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* Breadcrumbs */}
      {!showBrand && showBreadcrumbs && (
        <View style={styles.breadcrumbContainer}>
          {uniqueBreadcrumbs.length > 0 && (
            <>
              <Pressable
                onPress={goBack}
                style={({ pressed }) => [styles.backIconBtn, pressed && styles.backIconBtnPressed]}
                accessibilityLabel="Go back"
                accessibilityRole="button"
                hitSlop={14}>
                <MaterialCommunityIcons name="chevron-left" size={22} color="#FFFFFF" />
              </Pressable>
              {uniqueBreadcrumbs.map((crumb, idx) => {
                const isLast = idx === uniqueBreadcrumbs.length - 1;
                return (
                  <Pressable
                    key={`${crumb.label}-${idx}`}
                    onPress={() => navigateTo(crumb.screen as any)}
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
                      {crumb.label}
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
    </View>
  );
}

const DARK = '#1C1C1E';

function createDynamicStyles(colors: any) {
  const isDark = colors.background !== '#FFFFFF';
  return StyleSheet.create({
    searchBarWrapper: {
      backgroundColor: isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(89, 89, 89, 0.9)',
    },
    searchHeader: {
      backgroundColor: isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(89, 89, 89, 0.9)',
    },
    universalSearch: {
      backgroundColor: isDark ? '#2A2A2E' : 'rgba(255, 255, 255, 0.95)',
    },
    searchInputField: {
      color: isDark ? '#FFFFFF' : '#000000',
    },
    searchContentContainer: {
      backgroundColor: isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(89, 89, 89, 0.9)',
    },
    noResultsContainer: {
      backgroundColor: isDark ? 'rgba(42, 42, 46, 0.5)' : 'rgba(255, 255, 255, 0.1)',
      borderRadius: 12,
      margin: Spacing.lg,
    },
    noResultsText: {
      color: '#FFFFFF',
    },
    noResultsSubtext: {
      color: isDark ? '#999' : '#666',
    },
    dashboardSearchBar: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
    },
    dashboardSearchInput: {
      color: '#FFFFFF',
    },
    searchDropdown: {
      backgroundColor: 'transparent',
    },
    noResultsMessage: {
      backgroundColor: 'transparent',
    },
    header: {
      backgroundColor: 'rgba(89, 89, 89, 0.8)',
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
    footerSearchContainer: {
      position: 'relative',
    },
    footerSearchBar: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.12)',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.2)',
    },
    footerSearchDropdown: {
      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
      borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      borderWidth: 1,
    },
    footerSearchInput: {
      borderBottomColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    },
    footerSearchTextInput: {
      color: isDark ? '#FFFFFF' : '#000000',
    },
    dropdownNoResults: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    dropdownNoResultsText: {
      color: isDark ? '#FFFFFF' : '#000000',
    },
  });
}

const styles = StyleSheet.create({
  searchBarWrapper: {
    flexDirection: 'column',
    backgroundColor: 'rgba(89, 89, 89, 0.9)',
    minHeight: 100,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 12,
  },
  closeSearchBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  universalSearch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
  },
  searchInputField: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#000000',
    paddingVertical: 0,
  },
  searchContentContainer: {
    maxHeight: 450,
    paddingVertical: Spacing.md,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: Spacing.sm,
  },
  noResultsContainer: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },
  noResultsSubtext: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
  },
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
  headerCompact: {
    minHeight: 68,
    paddingVertical: 6,
    paddingTop: 6,
    paddingBottom: 6,
    gap: 4,
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
    fontFamily: FontFamily.bold,
    fontSize: 22,
    letterSpacing: 0.3,
    marginBottom: 4,
    color: '#FFFFFF',
    fontWeight: '700',
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

  dashboardSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
  },

  dashboardSearchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    paddingVertical: 0,
  },

  searchDropdown: {
    maxHeight: 400,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },

  noResultsMessage: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },

  footerSearchContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
    zIndex: 50,
  },

  footerSearchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },

  footerSearchPlaceholder: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.6)',
  },

  footerSearchDropdown: {
    position: 'absolute',
    top: 45,
    left: 0,
    right: 0,
    maxHeight: 380,
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 1000,
  },

  footerSearchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },

  footerSearchTextInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    paddingVertical: 0,
  },

  dropdownResultsSection: {
    paddingVertical: Spacing.md,
  },

  dropdownNoResults: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.lg,
  },

  dropdownNoResultsText: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semiBold,
  },

  breadcrumbContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    gap: 4,
    flexWrap: 'wrap',
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
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  brandSpace: {
    fontSize: 24,
    color: '#FFFFFF',
    width: 4,
  },
  brandLowercaseI: {
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


