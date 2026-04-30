import React, { useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

type Tab = 'dashboard' | 'modules' | 'submodules';

const FU_SUBMODULES: {
  id: string; screen: ScreenName; name: string;
  value: string; valueLabel: string; description: string; iconType: string;
}[] = [
  { id: '1',  screen: 'FinanceEntities',      name: 'Entities',                   value: '14', valueLabel: 'Records',  description: 'Define and manage legal entities, companies, and organisational units.',         iconType: 'entities' },
  { id: '2',  screen: 'BusinessStructure',    name: 'Business Structure',          value: '8',  valueLabel: 'Nodes',    description: 'Configure hierarchical business structure, divisions, and reporting lines.',     iconType: 'biz-structure' },
  { id: '3',  screen: 'FinanceInstitutesAcc', name: 'Finance Institutes & Acc',    value: '12', valueLabel: 'Accounts', description: 'Manage bank accounts, financial institutions, and account integrations.',        iconType: 'fin-institutes' },
  { id: '4',  screen: 'BooksAndAccounts',     name: 'Books & Accounts',            value: '30', valueLabel: 'Books',    description: 'Maintain chart of accounts, accounting books, and ledger structures.',           iconType: 'books' },
  { id: '5',  screen: 'UtilityService',       name: 'Utility Service',             value: '6',  valueLabel: 'Services', description: 'Set up utility services such as electricity, water, and recurring service costs.', iconType: 'utility' },
  { id: '6',  screen: 'ServiceProvider',      name: 'Service Provider',            value: '9',  valueLabel: 'Providers',description: 'Register and manage external service providers and vendor contracts.',            iconType: 'provider' },
  { id: '7',  screen: 'TaxSettings',          name: 'Tax Settings',                value: '5',  valueLabel: 'Tax Rules',description: 'Define tax rates, tax codes, and compliance rules for financial operations.',     iconType: 'tax' },
  { id: '8',  screen: 'POS',                  name: 'POS',                         value: '4',  valueLabel: 'Terminals',description: 'Configure point-of-sale terminals, payment methods, and cash drawer settings.',   iconType: 'pos' },
  { id: '9',  screen: 'BankCardMachine',      name: 'Create Bank Card Machine',    value: '3',  valueLabel: 'Machines', description: 'Register and configure bank card machines and payment gateway integrations.',      iconType: 'bank-card' },
  { id: '10', screen: 'LoyaltyPoints',        name: 'Loyalty Points',              value: '1',  valueLabel: 'Programs', description: 'Design loyalty point programs, redemption rules, and reward tiers.',               iconType: 'loyalty' },
];

export function FinanceUtilitiesScreen() {
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
      title="Finance Utilities"
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
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Finance Utilities</Text>
        {FU_SUBMODULES.map(mod => (
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
