import React, { useMemo, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { TabsSection } from '../../components/dashboard/TabsSection';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { UIIcon } from '../../components/common/UIIcon';
import { MODULE_ICON_MAP } from '../../components/dashboard/ModuleIcon';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import { ModuleTreeView } from '../../components/dashboard/ModuleTreeView';
import { QuickAccessRow } from '../../components/dashboard/QuickAccessRow';
import { RecentPageTabs } from '../../components/common/RecentPageTabs';

const H_PAD = 6;

type Tab = 'dashboard' | 'modules';

interface ModuleDetailScreenProps {
  moduleId?: string;
}

export function ModuleDetailScreen({ moduleId = '' }: ModuleDetailScreenProps) {
  const { colors, isDarkMode } = useTheme();
  const { navigate } = useNavigation();

  const [tab, setTab] = useState<Tab>('modules');
  const [submodulesOpen, setSubmodulesOpen] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const dyn = useMemo(() => createDynamicStyles(isDarkMode), [isDarkMode]);

  const module = MODULES.find(m => m.id === moduleId);

  const handleModulePress = (mod: AppModule) => navigate('ModuleDetail', { moduleId: mod.id });

  const handleTabChange = (newTab: string) => {
    if (newTab === 'Modules') {
      setTab('modules');
      setSubmodulesOpen(true);
    } else {
      setTab('dashboard');
      setSubmodulesOpen(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  if (!moduleId || !module) {
    return (
      <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
        <PageHeader showBack={true} showBrand={true} hideGreeting={true} showBreadcrumbs={false} hideSearchIcon={true} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Module not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const submodules = module.submodules || [];

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <PageHeader showBack={true} showBrand={true} hideGreeting={true} showBreadcrumbs={false} hideSearchIcon={true} />

      <View style={styles.whiteSection}>
        {/* Quick Access */}
        <View style={styles.quickWrap}>
          <QuickAccessRow onPress={handleModulePress} selectedModuleId={module.id} />
        </View>

        <RecentPageTabs />

        {/* Tabs */}
        <TabsSection
          tabs={['Modules' as const, 'Dashboard' as const]}
          activeTab={tab === 'modules' ? 'Modules' : 'Dashboard'}
          onTabChange={handleTabChange}
          colors={colors}
          isDarkMode={isDarkMode}
        />

        {/* Breadcrumb navigation */}
        <Breadcrumbs variant="light" />

        {/* Scrollable content */}
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

          {submodulesOpen ? (
            submodules.length > 0 ? (
              <View style={styles.submodulesContainer}>
                <ModuleTreeView module={module} />
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, dyn.emptyText]}>No submodules available</Text>
              </View>
            )
          ) : (
            <View style={styles.dashboardContent}>

              {/* Hero banner */}
              <View style={styles.hero}>
                <View style={styles.heroCircle1} />
                <View style={styles.heroCircle2} />

                <View style={styles.heroIconWrap}>
                  <UIIcon
                    name={MODULE_ICON_MAP[module.iconType] ?? 'clipboard'}
                    color="#FFFFFF"
                    size={28}
                  />
                </View>

                <Text style={styles.heroName}>{module.name}</Text>
                <Text style={styles.heroDesc} numberOfLines={4}>
                  {module.description ?? `Manage your ${module.name.toLowerCase()} operations efficiently.`}
                </Text>

                <View style={styles.heroStats}>
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>{module.value}</Text>
                    <Text style={styles.heroStatLabel}>{module.valueLabel}</Text>
                  </View>
                  <View style={styles.heroStatDivider} />
                  <View style={styles.heroStat}>
                    <Text style={styles.heroStatValue}>{module.submodules?.length ?? 0}</Text>
                    <Text style={styles.heroStatLabel}>Submodules</Text>
                  </View>
                </View>
              </View>

              <DashboardView />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}


function createDynamicStyles(isDarkMode: boolean) {
  return StyleSheet.create({
    safe: { backgroundColor: '#5A5A5A' },
    emptyText: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
    card: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#ECECF0',
    },
    text: { color: isDarkMode ? '#FFFFFF' : '#1C1C1E' },
    mutedText: { color: isDarkMode ? 'rgba(255,255,255,0.65)' : '#8E8E93' },
  });
}


const styles = StyleSheet.create({
  safe: { flex: 1 },

  quickWrap: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: '#FFFFFF',
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: '#8E8E93',
    textAlign: 'center',
  },

  whiteSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    overflow: 'hidden',
    flexDirection: 'column',
    marginTop: -10,
  },

  contentScroll: { flex: 1 },

  contentScrollContent: {
    flexGrow: 1,
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.md,
    paddingBottom: 80,
  },

  dashboardContent: { paddingBottom: 40 },

  submodulesContainer: { paddingBottom: 40 },

  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },

  hero: {
    backgroundColor: '#FFF5F8',
    borderRadius: 20,
    padding: 20,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFE0EE',
  },
  heroCircle1: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(233,30,99,0.05)',
    top: -60,
    right: -50,
  },
  heroCircle2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(233,30,99,0.04)',
    bottom: -30,
    left: -20,
  },
  heroIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#FFE4EF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  heroName: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
    letterSpacing: 0.2,
    marginBottom: 8,
  },
  heroDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#6B6B70',
    lineHeight: 20,
    marginBottom: 18,
  },
  heroStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#F0E6EA',
  },
  heroStat: {
    flex: 1,
    alignItems: 'center',
  },
  heroStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#EAD8DF',
  },
  heroStatValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
  },
  heroStatLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#8E8E93',
    marginTop: 3,
  },
});
