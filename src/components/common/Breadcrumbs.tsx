import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontFamily, FontWeight } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../hooks/useTheme';
import { MODULES } from '../../constants/modules';

interface BreadcrumbsProps {
  variant?: 'light' | 'dark';
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

export function Breadcrumbs({ variant = 'light' }: BreadcrumbsProps) {
  const { goBack, stack, navigateTo, paramsStack } = useNavigation();
  const { isDarkMode } = useTheme();

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

  const uniqueBreadcrumbs = breadcrumbs.reduce((acc, current, idx) => {
    if (idx === 0 || current.label !== breadcrumbs[idx - 1].label) {
      acc.push(current);
    }
    return acc;
  }, [] as typeof breadcrumbs);

  const dyn = useMemo(() => createDynamicStyles(variant, isDarkMode), [variant, isDarkMode]);

  if (uniqueBreadcrumbs.length === 0) return null;

  const iconColor = variant === 'dark' ? '#FFFFFF' : (isDarkMode ? '#FFFFFF' : '#3A3A3C');

  return (
    <View style={[styles.container, dyn.container]}>
      <Pressable
        onPress={goBack}
        style={({ pressed }) => [styles.backIconBtn, pressed && styles.backIconBtnPressed]}
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={14}>
        <MaterialCommunityIcons name="chevron-left" size={22} color={iconColor} />
      </Pressable>
      {uniqueBreadcrumbs.map((crumb, idx) => {
        const isLast = idx === uniqueBreadcrumbs.length - 1;
        return (
          <Pressable
            key={`${crumb.label}-${idx}`}
            onPress={() => navigateTo(crumb.screen as any)}
            style={({ pressed }) => [
              styles.item,
              isLast && styles.active,
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
            {!isLast && <Text style={[styles.separator, dyn.separator]}> / </Text>}
          </Pressable>
        );
      })}
    </View>
  );
}

function createDynamicStyles(variant: 'light' | 'dark', isDarkMode: boolean) {
  if (variant === 'dark') {
    return StyleSheet.create({
      container: {},
      text: { color: 'rgba(255,255,255,0.7)' },
      textActive: { color: '#c7d2fe' },
      separator: { color: 'rgba(255,255,255,0.4)' },
    });
  }
  return StyleSheet.create({
    container: {},
    text: { color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#6B6B70' },
    textActive: { color: Colors.primaryHighlight },
    separator: { color: isDarkMode ? 'rgba(255,255,255,0.35)' : '#B0B0B5' },
  });
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  backIconBtn: {
    padding: 4,
    marginLeft: -4,
  },
  backIconBtnPressed: {
    opacity: 0.6,
  },
  item: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  active: {
    borderBottomWidth: 1.5,
    borderBottomColor: Colors.primaryHighlight,
    paddingBottom: 1,
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
  separator: {
    fontSize: 10,
  },
});
