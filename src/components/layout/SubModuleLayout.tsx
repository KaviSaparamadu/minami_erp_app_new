import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../common/PageHeader';
import { QuickAccessRow } from '../dashboard/QuickAccessRow';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';

type Tab = 'dashboard' | 'modules' | 'submodules';

interface SubModuleLayoutProps {
  title: string;
  showBack?: boolean;
  children: React.ReactNode;
  activeTab?: Tab;
  onTabChange?: (tab: Tab) => void;
  onModulePress?: (module: AppModule) => void;
  showSubmodulesTab?: boolean;
  submodulesTabLabel?: string;
  showSubTab?: boolean;
  subTabLabel?: string;
}

function TabButton({
  label,
  active,
  onPress,
  dyn,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  dyn: any;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabBtn} activeOpacity={0.7}>
      <Text style={[styles.tabLabel, dyn.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
      {active && <View style={styles.tabUnderline} />}
    </TouchableOpacity>
  );
}

export function SubModuleLayout({
  title,
  showBack = true,
  children,
  activeTab = 'dashboard',
  onTabChange,
  onModulePress,
  showSubmodulesTab = false,
  submodulesTabLabel = 'Submodules',
  showSubTab = false,
  subTabLabel = 'Sub Tab',
}: SubModuleLayoutProps) {
  const { colors, isDarkMode } = useTheme();
  const [tab, setTab] = useState<Tab>(activeTab);
  const [refreshing, setRefreshing] = useState(false);

  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    onTabChange?.(newTab);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh (1.5 seconds)
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <PageHeader showBack={showBack} title={title} showBreadcrumbs={false} />

      {/* White section with scrollable content */}
      <View style={styles.whiteSection}>
        {/* Quick Access - At Top (Fixed) */}
        <View style={styles.quickWrap}>
          <QuickAccessRow onPress={onModulePress} />
        </View>

        {/* Tabs (Fixed) */}
        <View style={[styles.tabsRow, dyn.tabsBorder]}>
          <TabButton
            label="Dashboard"
            active={tab === 'dashboard'}
            onPress={() => handleTabChange('dashboard')}
            dyn={dyn}
          />
          <TabButton
            label="Modules"
            active={tab === 'modules'}
            onPress={() => handleTabChange('modules')}
            dyn={dyn}
          />
          {showSubmodulesTab && (
            <TabButton
              label={submodulesTabLabel}
              active={tab === 'submodules'}
              onPress={() => handleTabChange('submodules')}
              dyn={dyn}
            />
          )}
        </View>

        {/* Sub-tab - Compact design, right-aligned */}
        {showSubTab && tab !== 'submodules' && (
          <TouchableOpacity
            onPress={() => handleTabChange('submodules')}
            style={[styles.subTabContainer, dyn.subTabContainer]}
            activeOpacity={0.7}>
            <View style={styles.subTabContent}>
              <Text style={[styles.subTabLabel, dyn.subTabLabel]}>{subTabLabel}</Text>
            </View>
            <View style={[styles.subTabIcon, dyn.subTabIcon]}>
              <View style={styles.subTabDot} />
            </View>
          </TouchableOpacity>
        )}

        {/* Breadcrumbs - Below tabs (Fixed) */}
        <Breadcrumbs variant="light" />

        {/* Scrollable content only */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={isDarkMode ? '#E91E63' : '#E91E63'}
              colors={['#E91E63']}
            />
          }>

          {/* Content */}
          <View style={styles.content}>
            {children}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    safe: { backgroundColor: '#5A5A5A' },
    tabsBorder: {
      borderBottomColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    tabLabel: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
    subTabContainer: {
      backgroundColor: isDarkMode ? 'rgba(233, 30, 99, 0.08)' : '#FFF5F9',
    },
    subTabLabel: { color: isDarkMode ? 'rgba(255,255,255,0.70)' : '#5A5A62' },
    subTabIcon: {
      backgroundColor: isDarkMode ? 'rgba(233, 30, 99, 0.15)' : '#FFE1EC',
    },
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
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop: -5,
    flexDirection: 'column',
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

  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 0,
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    borderBottomWidth: 1,
  },

  tabBtn: {
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    alignItems: 'center',
  },

  tabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },

  tabLabelActive: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
  },

  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primaryHighlight,
    borderRadius: 2,
  },

  subTabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: 2,
    gap: 8,
  },

  subTabContent: {
    alignItems: 'flex-end',
  },

  subTabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },

  subTabIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  subTabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primaryHighlight,
  },

  content: {
    flex: 1,
    paddingTop: 12,
  },
});
