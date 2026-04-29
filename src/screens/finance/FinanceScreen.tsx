import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { ModulesGrid } from '../../components/dashboard/ModulesGrid';
import { ModuleCard } from '../../components/dashboard/ModuleCard';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

const H_PAD = 6;
const GRID_GAP = 10;
const GRID_COLS = 3;

type Tab = 'dashboard' | 'modules' | 'submodules';

const FINANCE_SUBMODULES: {
  id: string;
  screen: ScreenName;
  name: string;
  value: string;
  valueLabel: string;
  description: string;
  iconType: string;
}[] = [
  {
    id: '1',
    screen: 'FinanceUtilities',
    name: 'Finance Utilities',
    value: '18',
    valueLabel: 'Tools',
    description: 'Currency conversion, tax calculators, and financial utility tools.',
    iconType: 'finance-utilities',
  },
  {
    id: '2',
    screen: 'LedgerManagement',
    name: 'Ledger Management',
    value: '245',
    valueLabel: 'Entries',
    description: 'Manage general ledger, chart of accounts, and journal entries.',
    iconType: 'ledger',
  },
  {
    id: '3',
    screen: 'FinanceOperation',
    name: 'Finance Operation',
    value: '64',
    valueLabel: 'Txns',
    description: 'Handle accounts payable, receivable, payments, and day-to-day transactions.',
    iconType: 'finance-operation',
  },
];

function SubmodulesView({
  onPress,
  refreshing,
  onRefresh,
}: {
  onPress: (screen: ScreenName) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.subScroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryHighlight} />
      }>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Finance</Text>
      {FINANCE_SUBMODULES.map(mod => (
        <SubmoduleDetailCard
          key={mod.id}
          submodule={{ id: mod.id, name: mod.name, value: mod.value, valueLabel: mod.valueLabel }}
          iconType={mod.iconType}
          description={mod.description}
          onPress={() => onPress(mod.screen)}
        />
      ))}
    </ScrollView>
  );
}

function ModulesView({
  onModulePress,
  refreshing,
  onRefresh,
}: {
  onModulePress: (module: AppModule) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - H_PAD * 2 - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: Spacing.sm, gap: 8 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryHighlight} />
      }>
      <View style={{ paddingHorizontal: 8 }}>
        <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', color: colors.primaryText, marginBottom: 12 }}>
          Available Modules
        </Text>
      </View>
      <ModulesGrid
        data={MODULES}
        cardWidth={cardWidth}
        numColumns={GRID_COLS}
        gap={GRID_GAP}
        hPad={0}
        renderItem={(module, w) => (
          <ModuleCard key={module.id} module={module} width={w} onPress={() => onModulePress(module)} />
        )}
      />
    </ScrollView>
  );
}

export function FinanceScreen() {
  const { navigate } = useNavigation();
  const [tab, setTab] = useState<Tab>('submodules');
  const [refreshing, setRefreshing] = useState(false);

  function handleSubmodulePress(screen: ScreenName) {
    navigate(screen);
  }

  function handleModulePress(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }

  return (
    <SubModuleLayout
      title="Finance"
      showBack={true}
      activeTab={tab}
      onTabChange={setTab}
      showSubmodulesTab={false}
      showSubTab={true}
      subTabLabel="Sub Modules"
    >
      {tab === 'dashboard' ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primaryHighlight} />
          }>
          <DashboardView />
        </ScrollView>
      ) : tab === 'modules' ? (
        <ModulesView
          onModulePress={handleModulePress}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      ) : (
        <SubmodulesView
          onPress={handleSubmodulePress}
          refreshing={refreshing}
          onRefresh={handleRefresh}
        />
      )}
    </SubModuleLayout>
  );
}

const styles = StyleSheet.create({
  subScroll: {
    paddingTop: Spacing.sm,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: '700',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
});
