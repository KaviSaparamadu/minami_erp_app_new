import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

type Tab = 'dashboard' | 'modules' | 'submodules';

const LM_SUBMODULES: {
  id: string; screen: ScreenName; name: string;
  value: string; valueLabel: string; description: string; iconType: string;
}[] = [
  {
    id: '1', screen: 'ChartOfAccounts',
    name: 'Chart of Accounts Manager',
    value: '120', valueLabel: 'Accounts',
    description: 'Create, organise, and manage the full chart of accounts structure.',
    iconType: 'coa',
  },
  {
    id: '2', screen: 'FinanceReportsGenerator',
    name: 'Finance Reports Generator',
    value: '24', valueLabel: 'Reports',
    description: 'Generate balance sheets, P&L statements, and custom financial reports.',
    iconType: 'fin-reports',
  },
  {
    id: '3', screen: 'LedgerConnectionConsole',
    name: 'Ledger Connection Console',
    value: '8', valueLabel: 'Connections',
    description: 'Configure and manage connections between ledgers and external systems.',
    iconType: 'ledger-connect',
  },
  {
    id: '4', screen: 'OpeningBalanceConsole',
    name: 'Opening Balance Console',
    value: '15', valueLabel: 'Entries',
    description: 'Set and adjust opening balances for accounts at the start of each period.',
    iconType: 'opening-bal',
  },
  {
    id: '5', screen: 'JournalEntry',
    name: 'Journal Entry',
    value: '340', valueLabel: 'Entries',
    description: 'Record, review, and post manual journal entries to the general ledger.',
    iconType: 'journal',
  },
];

export function LedgerManagementScreen() {
  const { navigate } = useNavigation();
  const { colors } = useTheme();
  const [tab, setTab] = useState<Tab>('submodules');
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }

  return (
    <SubModuleLayout parentModuleId="3"
      title="Ledger Management"
      showBack={true}
      activeTab={tab}
      onTabChange={setTab}
      showSubmodulesTab={false}
      showSubTab={true}
      subTabLabel="Sub Modules"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primaryHighlight} />
        }>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Ledger Management</Text>
        {LM_SUBMODULES.map(mod => (
          <SubmoduleDetailCard
            key={mod.id}
            submodule={{ id: mod.id, name: mod.name, value: mod.value, valueLabel: mod.valueLabel }}
            iconType={mod.iconType}
            description={mod.description}
            onPress={() => navigate(mod.screen)}
          />
        ))}
      </ScrollView>
    </SubModuleLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingTop: Spacing.sm, paddingBottom: 80 },
  sectionTitle: {
    fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700',
    paddingHorizontal: Spacing.lg, paddingBottom: Spacing.sm,
  },
});
