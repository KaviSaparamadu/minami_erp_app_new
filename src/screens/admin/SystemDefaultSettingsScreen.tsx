import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

type Tab = 'dashboard' | 'modules' | 'submodules';

const DEFAULT_SUBMODULES: {
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
    screen: 'SystemWorkFlow',
    name: 'System Work Flow',
    value: '8',
    valueLabel: 'Workflows',
    description: 'Define and manage system-wide workflow templates, approval chains, and automation rules.',
    iconType: 'log',
  },
];

export function SystemDefaultSettingsScreen() {
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
    <SubModuleLayout parentModuleId="2"
      title="System Default Settings"
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
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>
          System Default Settings
        </Text>
        {DEFAULT_SUBMODULES.map(mod => (
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
  scroll: {
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
