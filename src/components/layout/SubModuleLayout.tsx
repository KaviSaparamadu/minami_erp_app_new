import React, { useMemo, useState } from 'react';
import {
  Pressable,
  Text,
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../common/PageHeader';
import { QuickAccessRow } from '../dashboard/QuickAccessRow';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { RecentPageTabs } from '../common/RecentPageTabs';
import { TabsSection } from '../dashboard/TabsSection';
import { Spacing, Colors } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
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
  onModulePress,
}: SubModuleLayoutProps) {
  const { isDarkMode, colors } = useTheme();
  const isPreview = useIsPreview();
  const [tab, setTab] = useState<Tab>(activeTab);
  const [refreshing, setRefreshing] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);

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
        <Pressable
          onPress={() => setShowQuickAccess(v => !v)}
          style={({ pressed }) => [styles.quickToggle, pressed && { opacity: 0.7 }]}>
          <View style={styles.quickAccent} />
          <Text style={styles.quickToggleTxt}>Quick Access</Text>
          <MaterialCommunityIcons
            name={showQuickAccess ? 'chevron-up' : 'chevron-down'}
            size={14}
            color="#9090A0"
            style={{ marginLeft: 4 }}
          />
        </Pressable>
        {showQuickAccess && (
          <View style={styles.quickWrap}>
            <QuickAccessRow onPress={onModulePress} hideTitle />
          </View>
        )}

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

        {selfManagesScroll ? (
          <View style={styles.contentArea}>
            {children}
          </View>
        ) : (
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

  quickToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
  },
  quickAccent: {
    width: 3,
    height: 14,
    borderRadius: 2,
    backgroundColor: Colors.primaryHighlight,
    marginRight: 7,
  },
  quickToggleTxt: {
    fontFamily: 'System',
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
    marginRight: 4,
  },
  quickWrap: {
    paddingHorizontal: Spacing.lg,
    paddingTop: 0,
    paddingBottom: 4,
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
