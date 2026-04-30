import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontFamily, FontWeight } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../hooks/useTheme';
import { MODULES } from '../../constants/modules';

interface BreadcrumbsProps {
  variant?: 'light' | 'dark';
  style?: object;
}

type NavChild = { label: string; screen: string };

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

// Children for each screen that has navigable sub-screens
const CRUMB_CHILDREN: Record<string, NavChild[]> = {
  HR: [
    { label: 'Human Management',   screen: 'HumanManagement' },
    { label: 'Employee Management', screen: 'EmployeeManagement' },
    { label: 'User Management',    screen: 'UserManagement' },
  ],
  UserManagement: [
    { label: 'Create System Users',    screen: 'CreateSystemUsers' },
    { label: 'Assign User Permission', screen: 'AssignUserPermission' },
    { label: 'Create User Role',       screen: 'CreateUserRole' },
    { label: 'Assign Role Permission', screen: 'AssignUserRolePermission' },
  ],
  SystemAdmin: [
    { label: 'System Settings',         screen: 'SystemSettings' },
    { label: 'General Settings',        screen: 'GeneralSettings' },
    { label: 'System Default Settings', screen: 'SystemDefaultSettings' },
    { label: 'Support Ticket',          screen: 'SupportTicket' },
    { label: 'Activity Log',            screen: 'ActivityLog' },
  ],
  SystemDefaultSettings: [
    { label: 'System Work Flow', screen: 'SystemWorkFlow' },
  ],
  Finance: [
    { label: 'Finance Utilities',  screen: 'FinanceUtilities' },
    { label: 'Ledger Management',  screen: 'LedgerManagement' },
    { label: 'Finance Operation',  screen: 'FinanceOperation' },
  ],
  Procurement: [
    { label: 'Purchasing',          screen: 'Purchasing' },
    { label: 'Stores & Inventory',  screen: 'StoresInventory' },
    { label: 'Logistics',           screen: 'Logistics' },
  ],
};

// Maps submodule display name → screen name (for ModuleDetail crumbs)
const SUBMODULE_SCREEN: Record<string, string> = {
  'Human Management':          'HumanManagement',
  'Employee Management':       'EmployeeManagement',
  'User Management':           'UserManagement',
  'System Settings':           'SystemSettings',
  'General Settings':          'GeneralSettings',
  'System Default Settings':   'SystemDefaultSettings',
  'Support Ticket':            'SupportTicket',
  'Activity Log':              'ActivityLog',
  'Finance Utilities':         'FinanceUtilities',
  'Ledger Management':         'LedgerManagement',
  'Finance Operation':         'FinanceOperation',
};

export function Breadcrumbs({ variant = 'light', style }: BreadcrumbsProps) {
  const { goBack, stack, navigateTo, paramsStack } = useNavigation();
  const { isDarkMode } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const getModuleNameForIdx = (idx: number) => {
    const p = paramsStack[idx];
    if (p && 'moduleId' in p) {
      const mod = MODULES.find(m => m.id === p.moduleId);
      return mod?.name || 'ModuleDetail';
    }
    return 'ModuleDetail';
  };

  const getChildrenForCrumb = (screen: string, stackIdx: number): NavChild[] => {
    if (screen === 'ModuleDetail') {
      const p = paramsStack[stackIdx];
      if (p && 'moduleId' in p) {
        const mod = MODULES.find(m => m.id === p.moduleId);
        return (mod?.submodules || []).map(sub => ({
          label: sub.name,
          screen: SUBMODULE_SCREEN[sub.name] ?? sub.name,
        }));
      }
      return [];
    }
    return CRUMB_CHILDREN[screen] ?? [];
  };

  const lastDashIdx = stack.reduce((last, s, i) => (s === 'Dashboard' ? i : last), 0);
  const currentSegment = stack.slice(lastDashIdx + 1);

  const seen = new Set<string>();
  const breadcrumbs = currentSegment.reduce((acc, screen, i) => {
    const stackIdx = lastDashIdx + 1 + i;
    const label = screen === 'ModuleDetail'
      ? getModuleNameForIdx(stackIdx)
      : (SCREEN_LABELS[screen] || screen);
    const key = screen === 'ModuleDetail' ? `ModuleDetail:${label}` : screen;
    if (!seen.has(key)) {
      seen.add(key);
      acc.push({ screen, label, stackIdx });
    }
    return acc;
  }, [] as { screen: string; label: string; stackIdx: number }[]);

  const dyn = useMemo(() => createDynamicStyles(variant, isDarkMode), [variant, isDarkMode]);

  if (breadcrumbs.length === 0) return null;

  const backIconColor = variant === 'dark' ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#3A3A3C');
  const chevronColor  = variant === 'dark'
    ? 'rgba(255,255,255,0.55)'
    : (isDarkMode ? 'rgba(255,255,255,0.45)' : '#AEAEB2');

  const activeEntry = activeDropdown
    ? breadcrumbs.find(c => `${c.screen}-${c.stackIdx}` === activeDropdown)
    : null;
  const dropdownChildren: NavChild[] = activeEntry
    ? getChildrenForCrumb(activeEntry.screen, activeEntry.stackIdx)
    : [];

  return (
    <View style={[styles.wrapper, style]}>

      {/* ── Crumb bar ── */}
      <View style={styles.crumbBar}>
        <Pressable
          onPress={goBack}
          style={({ pressed }) => [styles.backIconBtn, pressed && styles.backIconBtnPressed]}
          accessibilityLabel="Go back"
          accessibilityRole="button"
          hitSlop={14}>
          <MaterialCommunityIcons name="chevron-left" size={22} color={backIconColor} />
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollRow}
          contentContainerStyle={styles.scrollContent}>
          {breadcrumbs.map((crumb, idx) => {
            const isLast     = idx === breadcrumbs.length - 1;
            const crumbKey   = `${crumb.screen}-${crumb.stackIdx}`;
            const children   = getChildrenForCrumb(crumb.screen, crumb.stackIdx);
            const hasChildren = children.length > 0;
            const isOpen     = activeDropdown === crumbKey;

            return (
              <View key={crumbKey} style={styles.crumbGroup}>

                {/* Label */}
                <Pressable
                  onPress={() => {
                    setActiveDropdown(null);
                    navigateTo(crumb.screen as any);
                  }}
                  style={({ pressed }) => [
                    styles.crumbLabel,
                    isLast && styles.crumbLabelActive,
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[
                      styles.text,
                      dyn.text,
                      isLast && [styles.textActive, dyn.textActive],
                    ]}>
                    {crumb.label}
                  </Text>
                </Pressable>

                {/* Inline dropdown chevron */}
                {hasChildren && (
                  <Pressable
                    onPress={() => setActiveDropdown(isOpen ? null : crumbKey)}
                    hitSlop={6}
                    style={styles.chevronBtn}
                    accessibilityRole="button">
                    <MaterialCommunityIcons
                      name={isOpen ? 'chevron-up' : 'chevron-down'}
                      size={11}
                      color={isOpen ? Colors.primaryHighlight : chevronColor}
                    />
                  </Pressable>
                )}

                {/* Separator between crumbs */}
                {!isLast && (
                  <Text style={[styles.separator, dyn.separator]}> / </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Dropdown panel ── */}
      {activeDropdown && dropdownChildren.length > 0 && (
        <View style={[styles.dropdown, dyn.dropdown]}>
          {dropdownChildren.map((child, idx) => (
            <Pressable
              key={child.screen}
              style={({ pressed }) => [
                styles.dropdownItem,
                idx < dropdownChildren.length - 1 && [styles.dropdownItemBorder, dyn.dropdownItemBorder],
                pressed && styles.dropdownItemPressed,
              ]}
              onPress={() => {
                setActiveDropdown(null);
                navigateTo(child.screen as any);
              }}>
              <View style={[styles.dropdownDot, dyn.dropdownDot]} />
              <Text style={[styles.dropdownItemText, dyn.dropdownItemText]} numberOfLines={1}>
                {child.label}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={14}
                color={isDarkMode ? 'rgba(255,255,255,0.3)' : '#C7C7CC'}
              />
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function createDynamicStyles(variant: 'light' | 'dark', isDarkMode: boolean) {
  const dropdownBg      = variant === 'dark' ? 'rgba(30,30,30,0.97)' : (isDarkMode ? '#2C2C2E' : '#FFFFFF');
  const dropdownBorder  = variant === 'dark' ? 'rgba(255,255,255,0.12)' : (isDarkMode ? '#3A3A3C' : '#E8E8ED');
  const itemBorderColor = variant === 'dark' ? 'rgba(255,255,255,0.08)' : (isDarkMode ? '#3A3A3C' : '#F0F0F5');
  const itemTextColor   = variant === 'dark' ? 'rgba(255,255,255,0.9)' : (isDarkMode ? 'rgba(255,255,255,0.88)' : '#2C2C2E');
  const crumbText       = variant === 'dark' ? 'rgba(255,255,255,0.7)' : (isDarkMode ? 'rgba(255,255,255,0.6)' : '#6B6B70');
  const activeText      = variant === 'dark' ? '#c7d2fe' : Colors.primaryHighlight;
  const sepColor        = variant === 'dark' ? 'rgba(255,255,255,0.4)' : (isDarkMode ? 'rgba(255,255,255,0.35)' : '#B0B0B5');

  return StyleSheet.create({
    text:               { color: crumbText },
    textActive:         { color: activeText },
    separator:          { color: sepColor },
    dropdown: {
      backgroundColor: dropdownBg,
      borderColor:     dropdownBorder,
      shadowColor:     '#000',
      shadowOffset:    { width: 0, height: 4 },
      shadowOpacity:   isDarkMode || variant === 'dark' ? 0.35 : 0.10,
      shadowRadius:    12,
      elevation:       6,
    },
    dropdownItemBorder: { borderBottomColor: itemBorderColor },
    dropdownDot:        { backgroundColor: Colors.primaryHighlight },
    dropdownItemText:   { color: itemTextColor },
  });
}

const styles = StyleSheet.create({
  wrapper: {
    // column — dropdown expands naturally below the bar
  },

  crumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },

  scrollRow: { flex: 1 },

  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

  backIconBtn: {
    padding: 4,
    marginLeft: -4,
  },
  backIconBtnPressed: { opacity: 0.6 },

  crumbGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

  crumbLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },

  crumbLabelActive: {
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primaryHighlight,
    paddingBottom: 1,
  },

  pressed: { opacity: 0.7 },

  chevronBtn: {
    paddingHorizontal: 3,
    paddingVertical: 2,
  },

  text: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    paddingHorizontal: 3,
  },

  textActive: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },

  separator: { fontSize: 10 },

  // Dropdown
  dropdown: {
    marginHorizontal: 10,
    marginBottom: 4,
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },

  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },

  dropdownItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  dropdownItemPressed: { opacity: 0.7 },

  dropdownDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },

  dropdownItemText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 12,
  },
});
