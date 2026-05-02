import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontSize } from '../../constants/theme';
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


interface ModuleTreeViewProps {
  module: AppModule;
}

export function ModuleTreeView({ module }: ModuleTreeViewProps) {
  const { navigate } = useNavigation();
  const submodules = module.submodules ?? [];

  return (
    <View style={styles.container}>
      {/* Module section header */}
      <View style={styles.moduleHeader}>
        <View style={styles.moduleHeaderDot} />
        <Text style={styles.moduleHeaderText}>{module.name}</Text>
      </View>

      {submodules.map(sub => {
        const subScreen = SUBMODULE_SCREEN[sub.name];
        return (
          <SubmoduleDetailCard
            key={sub.id}
            submodule={sub}
            iconType={sub.iconType ?? 'hr'}
            description={sub.description}
            onPress={() => subScreen && navigate(subScreen)}
          />
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


});
