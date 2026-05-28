import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../common/PageHeader';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { RecentPageTabs } from '../common/RecentPageTabs';
import { TabsSection } from '../dashboard/TabsSection';
import { ModulesGrid } from '../dashboard/ModulesGrid';
import { ModuleCard } from '../dashboard/ModuleCard';
import { ModuleTreeView } from '../dashboard/ModuleTreeView';
import { DashboardView } from '../dashboard/DashboardView';
import { Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import { useIsPreview } from '../../context/PreviewContext';

type Tab = 'dashboard' | 'modules';
/** null = no overlay active (show default content) */
type OverlayTab = 'modules' | 'dashboard' | null;

interface SubModuleLayoutProps {
  title?: string;
  showBack?: boolean;
  /** Optional — module-level screens don't need children (submodules shown automatically). */
  children?: React.ReactNode;
  stickyContent?: React.ReactNode;
  selfManagesScroll?: boolean;
  /** Kept for backward compat — accepted but internal overlay state is managed independently. */
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
  onTabChange,
  onModulePress,
  parentModuleId,
}: SubModuleLayoutProps) {
  const { isDarkMode } = useTheme();
  const { currentScreen, params, navigate } = useNavigation();
  const isPreview = useIsPreview();
  const { width } = useWindowDimensions();

  /**
   * overlay = null  → show default content (submodules for module screens, children for others)
   * overlay = 'modules'   → show full modules grid (same as DashboardScreen)
   * overlay = 'dashboard' → show DashboardView    (same as DashboardScreen)
   */
  const [overlay, setOverlay] = useState<OverlayTab>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Grid dimensions — matches DashboardScreen exactly
  const H_PAD    = 12;
  const NUM_COLS = 3;
  const GAP      = 10;
  const cardWidth = (width - H_PAD * 2 - (NUM_COLS - 1) * GAP) / NUM_COLS;

  // Distinguish module-level screens (HR, Finance, Procurement…) from submodule screens.
  // Module-level screens have their screen name registered in MODULES[].screen.
  const isModuleScreen = MODULES.some(m => m.screen === currentScreen);
  const parentModule   = parentModuleId ? MODULES.find(m => m.id === parentModuleId) : null;

  // Reset overlay whenever the active screen changes — ensures tabs are never
  // left active after breadcrumb navigation to another module.
  useEffect(() => {
    setOverlay(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentScreen]);

  // When a breadcrumb tap (or any navigation) sets params.tab, activate that overlay.
  const tabParam = params?.tab as Tab | undefined;
  useEffect(() => {
    if (tabParam === 'modules' || tabParam === 'dashboard') {
      setOverlay(tabParam);
      onTabChange?.(tabParam);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabParam]);

  // Breadcrumbs sets _resetAt: Date.now() when the user taps the active module-screen
  // breadcrumb (e.g. "Human Resources" while on the HR page).  The Date.now() value is
  // always new, so this effect fires on every tap and resets any active overlay —
  // bringing the submodule list back into view.
  const resetAt = params?._resetAt as number | undefined;
  useEffect(() => {
    if (resetAt != null) {
      setOverlay(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetAt]);

  const dyn = useMemo(() => createDynamicStyles(isDarkMode), [isDarkMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  // Toggle: clicking the already-active tab deactivates the overlay (returns to default).
  const handleTabPress = (tabName: string) => {
    const clicked: OverlayTab =
      tabName === 'Modules' ? 'modules' :
      tabName === 'Dashboard' ? 'dashboard' :
      null;
    if (clicked === null) return;
    const next: OverlayTab = overlay === clicked ? null : clicked;
    setOverlay(next);
    if (next !== null) onTabChange?.(next);
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

  // Tabs are only active when explicitly clicked — not on breadcrumb navigation.
  const activeTabName: 'Modules' | 'Dashboard' | null =
    overlay === 'modules' ? 'Modules' :
    overlay === 'dashboard' ? 'Dashboard' :
    null;

  const refreshControl = (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={handleRefresh}
      tintColor="#E91E63"
      colors={['#E91E63']}
    />
  );

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <PageHeader showBack={showBack} showBrand={true} hideGreeting={true} showBreadcrumbs={false} hideSearchIcon={true} />

      <View style={styles.whiteSection}>
        <RecentPageTabs />

        <TabsSection
          tabs={['Modules', 'Dashboard']}
          activeTab={activeTabName}
          onTabChange={handleTabPress}
          isDarkMode={isDarkMode}
        />

        {/* Breadcrumbs: visible when no overlay OR when the Modules tab is active
            (so the modules grid is anchored below the breadcrumb trail).
            Hidden for the Dashboard overlay to keep that view full-width/clean. */}
        {(overlay === null || overlay === 'modules') && (
          <View style={styles.crumbRow}>
            <Breadcrumbs variant="light" style={styles.crumbFlex} />
          </View>
        )}

        {overlay === null && stickyContent && (
          <View style={styles.stickyWrap}>
            {stickyContent}
          </View>
        )}

        {overlay === 'modules' ? (
          // ── Modules overlay → same 3-column grid as DashboardScreen ──────────
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.modulesScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}>
            <ModulesGrid
              data={MODULES}
              renderItem={(module, w) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  width={w}
                  onPress={() =>
                    onModulePress
                      ? onModulePress(module)
                      : navigate('ModuleDetail', { moduleId: module.id })
                  }
                />
              )}
              cardWidth={cardWidth}
              numColumns={NUM_COLS}
              gap={GAP}
              hPad={H_PAD}
            />
          </ScrollView>

        ) : overlay === 'dashboard' ? (
          // ── Dashboard overlay → DashboardView (same as DashboardScreen) ──────
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.dashboardScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}>
            <DashboardView />
          </ScrollView>

        ) : isModuleScreen && parentModule ? (
          // ── No overlay · module screen → submodule list ───────────────────────
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}>
            <View style={styles.content}>
              <ModuleTreeView module={parentModule} />
            </View>
          </ScrollView>

        ) : selfManagesScroll ? (
          // ── No overlay · data screen managing its own scroll ──────────────────
          <View style={styles.contentArea}>
            {children}
          </View>

        ) : (
          // ── No overlay · default children in a scroll view ────────────────────
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={refreshControl}>
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

  modulesScrollContent: {
    flexGrow: 1,
    paddingBottom: 80,
  },

  dashboardScrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 80,
  },

  content: {
    flex: 1,
    paddingTop: 12,
  },
});
