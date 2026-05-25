import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../common/PageHeader';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { RecentPageTabs } from '../common/RecentPageTabs';
import { TabsSection } from '../dashboard/TabsSection';
import { DashboardView } from '../dashboard/DashboardView';
import { ModuleTreeView } from '../dashboard/ModuleTreeView';
import { Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import { useIsPreview } from '../../context/PreviewContext';

type Tab = 'dashboard' | 'modules';

interface SubModuleLayoutProps {
  title?: string;
  showBack?: boolean;
  children: React.ReactNode;
  stickyContent?: React.ReactNode;
  selfManagesScroll?: boolean;
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
  stickyContent,
  selfManagesScroll = false,
  activeTab = 'modules',
  onTabChange,
  parentModuleId,
}: SubModuleLayoutProps) {
  const { isDarkMode, colors } = useTheme();
  const { currentScreen, params } = useNavigation();
  const isPreview = useIsPreview();
  const [tab, setTab] = useState<Tab>(activeTab);
  const [refreshing, setRefreshing] = useState(false);

  // Distinguish module-level screens (HR, Finance, Procurement…) from submodule screens.
  // Module-level screens have their screen name registered in MODULES[].screen.
  const isModuleScreen = MODULES.some(m => m.screen === currentScreen);
  const parentModule   = parentModuleId ? MODULES.find(m => m.id === parentModuleId) : null;

  // When a breadcrumb tap calls setCurrentParams({ tab: 'modules' }), sync both the
  // local tab state AND the parent screen's onTabChange callback (e.g. StoreDetailScreen
  // manages its own tab state internally and drives children content from it).
  const tabParam = params?.tab as Tab | undefined;
  useEffect(() => {
    if (tabParam === 'modules' || tabParam === 'dashboard') {
      setTab(tabParam);
      onTabChange?.(tabParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Tab-aware content flags
  const showModuleTree = isModuleScreen  && tab === 'modules' && !!parentModule;
  const showDashboard  = !isModuleScreen && tab === 'dashboard';

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

  if (isPreview) {
    return (
      <View style={styles.previewWrap}>
        <ScrollView scrollEnabled={false} bounces={false}>
          <View style={styles.content}>{children}</View>
        </ScrollView>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <PageHeader showBack={showBack} showBrand={true} hideGreeting={true} showBreadcrumbs={false} hideSearchIcon={true} />

      <View style={styles.whiteSection}>
        <RecentPageTabs />

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

        {stickyContent && (
          <View style={styles.stickyWrap}>
            {stickyContent}
          </View>
        )}

        {showDashboard ? (
          // Submodule screen · Dashboard tab → DashboardView manages its own scroll
          <View style={styles.contentArea}>
            <DashboardView />
          </View>

        ) : showModuleTree ? (
          // Module-level screen · Modules tab → submodule tiles
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
              <ModuleTreeView module={parentModule!} />
            </View>
          </ScrollView>

        ) : selfManagesScroll ? (
          // Screen manages its own scroll (complex tables / data screens)
          <View style={styles.contentArea}>
            {children}
          </View>

        ) : (
          // Default: children in outer ScrollView
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
        )}
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
  previewWrap: { flex: 1, backgroundColor: '#FFFFFF' },

  whiteSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    marginTop: -5,
    flexDirection: 'column',
  },

  crumbRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
    marginTop: -4,
  },

  crumbFlex: {
    flex: 1,
  },

  stickyWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 8,
    paddingBottom: 10,
    backgroundColor: '#FFFFFF',
  },

  contentArea: {
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
