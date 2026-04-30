import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { SubmoduleDetailCard } from './SubmoduleDetailCard';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

const SUBMODULE_SCREEN: Record<string, ScreenName> = {
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
  'Purchasing':                'Purchasing',
  'Stores & Inventory':        'StoresInventory',
  'Logistics':                 'Logistics',
};

const SUB_CHILDREN: Record<string, { label: string; screen: ScreenName }[]> = {
  'User Management': [
    { label: 'Create System Users',    screen: 'CreateSystemUsers' },
    { label: 'Assign User Permission', screen: 'AssignUserPermission' },
    { label: 'Create User Role',       screen: 'CreateUserRole' },
    { label: 'Assign Role Permission', screen: 'AssignUserRolePermission' },
  ],
  'System Default Settings': [
    { label: 'System Work Flow', screen: 'SystemWorkFlow' },
  ],
};

interface ModuleTreeViewProps {
  module: AppModule;
}

export function ModuleTreeView({ module }: ModuleTreeViewProps) {
  const { navigate } = useNavigation();
  const submodules = [...(module.submodules ?? [])].reverse();

  return (
    <View style={styles.container}>
      {/* Module section header */}
      <View style={styles.moduleHeader}>
        <View style={styles.moduleHeaderDot} />
        <Text style={styles.moduleHeaderText}>{module.name}</Text>
      </View>

      {/* Submodules + their children */}
      {submodules.map(sub => {
        const subScreen = SUBMODULE_SCREEN[sub.name];
        const children  = SUB_CHILDREN[sub.name] ?? [];
        return (
          <View key={sub.id}>
            <SubmoduleDetailCard
              submodule={sub}
              iconType={sub.iconType ?? 'hr'}
              description={sub.description}
              onPress={() => subScreen && navigate(subScreen)}
            />
            {children.length > 0 && (
              <View style={styles.childWrap}>
                {children.map((child, idx) => (
                  <Pressable
                    key={child.screen}
                    style={({ pressed }) => [
                      styles.childRow,
                      idx < children.length - 1 && styles.childRowBorder,
                      pressed && styles.childRowPressed,
                    ]}
                    onPress={() => navigate(child.screen)}>
                    <View style={styles.childDot} />
                    <Text style={styles.childLabel} numberOfLines={1}>
                      {child.label}
                    </Text>
                    <MaterialCommunityIcons
                      name="chevron-right"
                      size={14}
                      color="#C7C7CC"
                    />
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    paddingBottom: 20,
  },

  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
    paddingBottom: 4,
  },
  moduleHeaderDot: {
    width: 3,
    height: 16,
    borderRadius: 2,
    backgroundColor: Colors.primaryHighlight,
  },
  moduleHeaderText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    color: '#1C1C1E',
    letterSpacing: 0.1,
  },

  childWrap: {
    marginTop: 2,
    marginBottom: 4,
    marginLeft: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0E6EA',
    backgroundColor: '#FFFBFD',
    overflow: 'hidden',
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 10,
  },
  childRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F0F0F5',
  },
  childRowPressed: {
    opacity: 0.7,
    backgroundColor: 'rgba(233,30,99,0.04)',
  },
  childDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.primaryHighlight,
  },
  childLabel: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#3A3A3C',
  },
});
