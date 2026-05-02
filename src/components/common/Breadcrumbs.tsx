import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontFamily, FontWeight } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../hooks/useTheme';
import { MODULES } from '../../constants/modules';
import { SidebarIcon } from '../layout/SidebarIcon';
import { SCREEN_LABELS } from '../../constants/screenLabels';

interface BreadcrumbsProps {
  variant?: 'light' | 'dark';
  style?: object;
}

type NavChild = { label: string; screen: string; icon?: string };

// ── Static parent hierarchy ────────────────────────────────────────────────────
// Determines the breadcrumb path purely from screen identity, not nav history.
const SCREEN_PARENT: Record<string, string> = {
  // HR
  HR:                       'Dashboard',
  HumanManagement:          'HR',
  EmployeeManagement:       'HR',
  UserManagement:           'HR',
  CreateSystemUsers:        'UserManagement',
  AssignUserPermission:     'UserManagement',
  CreateUserRole:           'UserManagement',
  AssignUserRolePermission: 'UserManagement',
  // System Admin
  SystemAdmin:              'Dashboard',
  SystemSettings:           'SystemAdmin',
  GeneralSettings:          'SystemAdmin',
  SystemDefaultSettings:    'SystemAdmin',
  SupportTicket:            'SystemAdmin',
  ActivityLog:              'SystemAdmin',
  SystemWorkFlow:           'SystemDefaultSettings',
  // Finance
  Finance:                  'Dashboard',
  FinanceUtilities:         'Finance',
  LedgerManagement:         'Finance',
  FinanceOperation:         'Finance',
  // Procurement
  Procurement:              'Dashboard',
  Purchasing:               'Procurement',
  StoresInventory:          'Procurement',
  Logistics:                'Procurement',
};

function buildPath(screen: string): string[] {
  const path: string[] = [];
  let cur: string | undefined = screen;
  while (cur && cur !== 'Dashboard') {
    path.unshift(cur);
    cur = SCREEN_PARENT[cur];
  }
  return path;
}

// ── Dropdown children per screen ───────────────────────────────────────────────
const CRUMB_CHILDREN: Record<string, NavChild[]> = {
  HR: [
    { label: 'Human Management',    screen: 'HumanManagement',   icon: 'human' },
    { label: 'Employee Management', screen: 'EmployeeManagement', icon: 'employee' },
    { label: 'User Management',     screen: 'UserManagement',     icon: 'user' },
  ],
  UserManagement: [
    { label: 'Create System Users',    screen: 'CreateSystemUsers',        icon: 'user-plus' },
    { label: 'Assign User Permission', screen: 'AssignUserPermission',     icon: 'user-key' },
    { label: 'Create User Role',       screen: 'CreateUserRole',           icon: 'user-role' },
    { label: 'Assign Role Permission', screen: 'AssignUserRolePermission', icon: 'user-role-key' },
  ],
  SystemAdmin: [
    { label: 'System Settings',         screen: 'SystemSettings',        icon: 'sys-settings' },
    { label: 'General Settings',        screen: 'GeneralSettings',       icon: 'gen-settings' },
    { label: 'System Default Settings', screen: 'SystemDefaultSettings', icon: 'sys-defaults' },
    { label: 'Support Ticket',          screen: 'SupportTicket',         icon: 'support-ticket' },
    { label: 'Activity Log',            screen: 'ActivityLog',           icon: 'activity-log' },
  ],
  SystemDefaultSettings: [
    { label: 'System Work Flow', screen: 'SystemWorkFlow', icon: 'workflow' },
  ],
  Finance: [
    { label: 'Finance Utilities', screen: 'FinanceUtilities', icon: 'finance-utilities' },
    { label: 'Ledger Management', screen: 'LedgerManagement', icon: 'ledger' },
    { label: 'Finance Operation', screen: 'FinanceOperation', icon: 'finance-operation' },
  ],
  Procurement: [
    { label: 'Purchasing',         screen: 'Purchasing',      icon: 'proc-purchasing' },
    { label: 'Stores & Inventory', screen: 'StoresInventory', icon: 'proc-stores' },
    { label: 'Logistics',          screen: 'Logistics',       icon: 'proc-logistics' },
  ],
};

const SUBMODULE_ICON: Record<string, string> = {
  'Human Management':        'human',
  'Employee Management':     'employee',
  'User Management':         'user',
  'System Settings':         'sys-settings',
  'General Settings':        'gen-settings',
  'System Default Settings': 'sys-defaults',
  'Support Ticket':          'support-ticket',
  'Activity Log':            'activity-log',
  'Finance Utilities':       'finance-utilities',
  'Ledger Management':       'ledger',
  'Finance Operation':       'finance-operation',
  'Purchasing':              'proc-purchasing',
  'Stores & Inventory':      'proc-stores',
  'Logistics':               'proc-logistics',
};

const SUBMODULE_SCREEN: Record<string, string> = {
  'Human Management':         'HumanManagement',
  'Employee Management':      'EmployeeManagement',
  'User Management':          'UserManagement',
  'System Settings':          'SystemSettings',
  'General Settings':         'GeneralSettings',
  'System Default Settings':  'SystemDefaultSettings',
  'Support Ticket':           'SupportTicket',
  'Activity Log':             'ActivityLog',
  'Finance Utilities':        'FinanceUtilities',
  'Ledger Management':        'LedgerManagement',
  'Finance Operation':        'FinanceOperation',
};

// ── Component ──────────────────────────────────────────────────────────────────
export function Breadcrumbs({ variant = 'light', style }: BreadcrumbsProps) {
  const { goBack, stack, navigate, navigateTo, paramsStack } = useNavigation();
  const { isDarkMode } = useTheme();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const currentScreen = stack[stack.length - 1];

  // Build breadcrumb items from the static hierarchy, not the nav stack
  const breadcrumbs = useMemo(() => {
    if (currentScreen === 'ModuleDetail') {
      const p = paramsStack[paramsStack.length - 1];
      const mod = p?.moduleId ? MODULES.find(m => m.id === p.moduleId) : null;
      if (!mod) return [];
      return [{ screen: 'ModuleDetail', label: mod.name }];
    }
    return buildPath(currentScreen).map(screen => ({
      screen,
      label: SCREEN_LABELS[screen] ?? screen,
    }));
  }, [currentScreen, paramsStack]);

  const dyn = useMemo(() => createDynamicStyles(variant, isDarkMode), [variant, isDarkMode]);

  if (breadcrumbs.length === 0) return null;

  const backIconColor = variant === 'dark' ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#3A3A3C');
  const chevronColor  = variant === 'dark'
    ? 'rgba(255,255,255,0.55)'
    : (isDarkMode ? 'rgba(255,255,255,0.45)' : '#AEAEB2');

  const getDropdownChildren = (screen: string): NavChild[] => {
    if (screen === 'ModuleDetail') {
      const p = paramsStack[paramsStack.length - 1];
      const mod = p?.moduleId ? MODULES.find(m => m.id === p.moduleId) : null;
      return (mod?.submodules ?? []).map(sub => ({
        label: sub.name,
        screen: SUBMODULE_SCREEN[sub.name] ?? sub.name,
        icon: SUBMODULE_ICON[sub.name],
      }));
    }
    return CRUMB_CHILDREN[screen] ?? [];
  };

  const handleCrumbPress = (screen: string) => {
    setActiveDropdown(null);
    // If the screen exists in the current stack, pop back to it; else push it
    const idx = stack.indexOf(screen as any);
    if (idx >= 0) {
      navigateTo(screen as any);
    } else {
      navigate(screen as any);
    }
  };

  const activeDropdownChildren = activeDropdown
    ? getDropdownChildren(activeDropdown)
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
          <MaterialCommunityIcons name="chevron-left" size={26} color={backIconColor} />
        </Pressable>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scrollRow}
          contentContainerStyle={styles.scrollContent}>
          {breadcrumbs.map((crumb, idx) => {
            const isLast      = idx === breadcrumbs.length - 1;
            const children    = getDropdownChildren(crumb.screen);
            const hasChildren = children.length > 0;
            const isOpen      = activeDropdown === crumb.screen;

            return (
              <View key={crumb.screen} style={styles.crumbGroup}>

                {/* Label */}
                <Pressable
                  onPress={() => handleCrumbPress(crumb.screen)}
                  style={({ pressed }) => [
                    styles.crumbLabel,
                    isLast && styles.crumbLabelActive,
                    pressed && styles.pressed,
                  ]}>
                  <Text style={[styles.text, dyn.text, isLast && [styles.textActive, dyn.textActive]]}>
                    {crumb.label}
                  </Text>
                </Pressable>

                {/* Dropdown chevron */}
                {hasChildren && (
                  <Pressable
                    onPress={() => setActiveDropdown(isOpen ? null : crumb.screen)}
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

                {/* Separator */}
                {!isLast && (
                  <Text style={[styles.separator, dyn.separator]}> / </Text>
                )}
              </View>
            );
          })}
        </ScrollView>
      </View>

      {/* ── Dropdown panel ── */}
      {activeDropdown && activeDropdownChildren.length > 0 && (
        <View style={[styles.dropdown, dyn.dropdown]}>
          {activeDropdownChildren.map((child, idx) => (
            <Pressable
              key={child.screen}
              style={({ pressed }) => [
                styles.dropdownItem,
                idx < activeDropdownChildren.length - 1 && [styles.dropdownItemBorder, dyn.dropdownItemBorder],
                pressed && styles.dropdownItemPressed,
              ]}
              onPress={() => {
                setActiveDropdown(null);
                navigate(child.screen as any);
              }}>
              <SidebarIcon name={child.icon} color={Colors.primaryHighlight} size={16} />
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
    dropdownItemText:   { color: itemTextColor },
  });
}

const styles = StyleSheet.create({
  wrapper: {},

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

  backIconBtn: { padding: 4, marginLeft: -4 },
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

  chevronBtn: { paddingHorizontal: 3, paddingVertical: 2 },

  text: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    fontStyle: 'italic',
    paddingHorizontal: 3,
  },

  textActive: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontStyle: 'italic',
  },

  separator: { fontSize: 9, fontStyle: 'italic' },

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

  dropdownItemBorder: { borderBottomWidth: StyleSheet.hairlineWidth },
  dropdownItemPressed: { opacity: 0.7 },

  dropdownItemText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 12,
  },
});
