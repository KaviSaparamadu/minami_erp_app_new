import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../common/PageHeader';
import { QuickAccessRow } from '../dashboard/QuickAccessRow';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { TabsSection } from '../dashboard/TabsSection';
import { Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';

type Tab = 'dashboard' | 'modules';

interface SubModuleLayoutProps {
  title?: string;
  showBack?: boolean;
  children: React.ReactNode;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  onModulePress?: (module: AppModule) => void;
  parentModuleId?: string;
  // legacy props — accepted but ignored
  showSubmodulesTab?: boolean;
  submodulesTabLabel?: string;
  showSubTab?: boolean;
  subTabLabel?: string;
}

export function SubModuleLayout({
  showBack = true,
  children,
  activeTab = 'modules',
  onTabChange,
  onModulePress,
}: SubModuleLayoutProps) {
  const { isDarkMode, colors } = useTheme();
  const [tab, setTab] = useState<Tab>(activeTab);
  const [refreshing, setRefreshing] = useState(false);

  const dyn = useMemo(() => createDynamicStyles(isDarkMode), [isDarkMode]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    onTabChange?.(newTab);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <PageHeader showBack={showBack} showBrand={true} hideGreeting={true} showBreadcrumbs={false} hideSearchIcon={true} />

      <View style={styles.whiteSection}>
        <View style={styles.quickWrap}>
          <QuickAccessRow onPress={onModulePress} />
        </View>

        <TabsSection
          tabs={['Modules', 'Dashboard']}
          activeTab={tab === 'modules' ? 'Modules' : 'Dashboard'}
          onTabChange={t => handleTabChange(t === 'Modules' ? 'modules' : 'dashboard')}
          colors={colors}
          isDarkMode={isDarkMode}
        />

        <View style={styles.crumbRow}>
          <Breadcrumbs variant="light" style={styles.crumbFlex} />
        </View>

        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#E91E63"
              colors={['#E91E63']}
            />
          }>
          <View style={styles.content}>
            {children}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function createDynamicStyles(_isDarkMode: boolean) {
  return StyleSheet.create({
    safe: { backgroundColor: '#5A5A5A' },
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  quickWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: 0,
    backgroundColor: 'transparent',
  },

  whiteSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    marginTop: -5,
    flexDirection: 'column',
  },

  crumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
    minHeight: 38,
  },

  crumbFlex: {
    flex: 1,
  },

  contentScroll: {
    flex: 1,
  },

  contentScrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: 0,
    paddingBottom: 80,
  },

  content: {
    flex: 1,
    paddingTop: 12,
  },
});
