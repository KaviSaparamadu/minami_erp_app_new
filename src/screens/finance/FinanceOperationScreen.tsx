import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

type Tab = 'dashboard' | 'modules' | 'submodules';

const FO_SUBMODULES: {
  id: string; screen: ScreenName; name: string;
  value: string; valueLabel: string; description: string; iconType: string;
}[] = [
  {
    id: '1', screen: 'POS',
    name: 'POS',
    value: '4', valueLabel: 'Terminals',
    description: 'Operate point-of-sale terminals and manage daily sales transactions.',
    iconType: 'fo-pos',
  },
  {
    id: '2', screen: 'ManagePOSPoints',
    name: 'Manage POS Points',
    value: '320', valueLabel: 'Points',
    description: 'Track, adjust, and report on POS loyalty points and reward balances.',
    iconType: 'fo-pos-points',
  },
  {
    id: '3', screen: 'SimpleInvoice',
    name: 'Simple Invoice',
    value: '87', valueLabel: 'Invoices',
    description: 'Create and manage simple invoices for quick billing and payment collection.',
    iconType: 'fo-invoice',
  },
  {
    id: '4', screen: 'ManageBankCardMachine',
    name: 'Manage Bank Card Machine',
    value: '3', valueLabel: 'Machines',
    description: 'Monitor, configure, and reconcile bank card machine transactions.',
    iconType: 'fo-bank-card',
  },
];

export function FinanceOperationScreen() {
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
    <SubModuleLayout
      title="Finance Operation"
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
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Finance Operation</Text>
        {FO_SUBMODULES.map(mod => (
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
