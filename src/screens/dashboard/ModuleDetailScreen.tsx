import React, { useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { Breadcrumbs } from '../../components/common/Breadcrumbs';
import { TabsSection } from '../../components/dashboard/TabsSection';
import { ModulesGrid } from '../../components/dashboard/ModulesGrid';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import { ModuleCard } from '../../components/dashboard/ModuleCard';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { QuickAccessRow } from '../../components/dashboard/QuickAccessRow';
import { UIIcon } from '../../components/common/UIIcon';
import { MODULE_ICON_MAP } from '../../components/dashboard/ModuleIcon';

const H_PAD = 6;
const GAP = 10;
const NUM_COLS = 3;

type Tab = 'dashboard' | 'modules' | 'submodules';

interface ModuleDetailScreenProps {
  moduleId?: string;
}

export function ModuleDetailScreen({ moduleId = '' }: ModuleDetailScreenProps) {
  const { navigate } = useNavigation();
  const { width } = useWindowDimensions();
  const { colors, isDarkMode } = useTheme();
  const cardWidth = (width - H_PAD * 2 - (NUM_COLS - 1) * GAP) / NUM_COLS;

  const [tab, setTab] = useState<Tab>('submodules');
  const [refreshing, setRefreshing] = useState(false);

  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  const module = MODULES.find(m => m.id === moduleId);

  const handleModulePress = (mod: AppModule) => {
    navigate('ModuleDetail', { moduleId: mod.id });
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh (1.5 seconds)
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };

  if (!moduleId || !module) {
    return (
      <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
        <PageHeader showBack={true} showBrand={false} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Module not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const submodules = module.submodules || [];

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <PageHeader showBack={true} showBrand={false} title={module.name} showBreadcrumbs={false} />

      <View style={styles.whiteSection}>
        {/* Quick Access - Fixed in white area */}
        <View style={styles.quickWrap}>
          <QuickAccessRow onPress={handleModulePress} />
        </View>

        {/* Tabs - Fixed in white area (Submodules removed) */}
        <TabsSection
          tabs={['Dashboard' as const, 'Modules' as const]}
          activeTab={tab === 'modules' ? 'Modules' : 'Dashboard'}
          onTabChange={(newTab) => {
            if (newTab === 'Modules') setTab('modules');
            else setTab('dashboard');
          }}
          colors={colors}
          isDarkMode={isDarkMode}
        />

        {/* Sub-tab - Compact modern design, right-aligned */}
        {tab !== 'submodules' && (
          <Pressable
            onPress={() => setTab('submodules')}
            style={({ pressed }) => [
              styles.subTabMinimal,
              dyn.subTabMinimal,
              pressed && styles.subTabMinimalPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="View submodules">
            <View style={styles.subTabMinimalContent}>
              <Text
                style={[styles.subTabMinimalText, dyn.subTabMinimalText]}
                numberOfLines={1}>
                {module.name}
              </Text>
              <Text style={[styles.subTabMinimalLabel, dyn.subTabMinimalLabel]}>
                Submodules
              </Text>
            </View>
            <View style={[styles.subTabMinimalIcon, dyn.subTabMinimalIcon]}>
              <UIIcon
                name={MODULE_ICON_MAP[module.iconType] ?? 'clipboard'}
                color={Colors.primaryHighlight}
                size={12}
              />
            </View>
          </Pressable>
        )}

        {/* Breadcrumbs - under the tab section */}
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

          {tab === 'dashboard' ? (
            <View style={styles.dashboardContent}>
              <DashboardView />
            </View>
          ) : tab === 'modules' ? (
            <ModulesGrid
              data={MODULES}
              renderItem={(mod: AppModule, width) => (
                <ModuleCard module={mod} width={width} onPress={handleModulePress} />
              )}
              cardWidth={cardWidth}
              numColumns={NUM_COLS}
              gap={GAP}
              hPad={H_PAD}
            />
          ) : (
            submodules.length > 0 ? (
              <View style={styles.submodulesContainer}>
                {submodules.map((submodule) => (
                  <SubmoduleDetailCard
                    key={submodule.id}
                    submodule={submodule}
                    iconType="hr"
                    description={submodule.description}
                    onPress={() => {
                      if (submodule.name === 'Human Management') {
                        navigate('HumanManagement');
                      } else if (submodule.name === 'Employee Management') {
                        navigate('EmployeeManagement');
                      } else if (submodule.name === 'User Management') {
                        navigate('UserManagement');
                      }
                    }}
                  />
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyText, dyn.emptyText]}>No submodules available</Text>
              </View>
            )
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function ModuleSubmoduleCard({ submodule, width }: { submodule: any; width: number }) {
  const { colors, isDarkMode } = useTheme();
  const dyn = useMemo(() => createSubmoduleStyles(colors, isDarkMode), [colors, isDarkMode]);

  return (
    <View style={[styles.submoduleCard, dyn.submoduleCard, { width }]}>
      <Text style={[styles.submoduleName, dyn.submoduleName]} numberOfLines={2}>
        {submodule.name}
      </Text>
      <Text style={[styles.submoduleValue, dyn.submoduleValue]} numberOfLines={1}>
        {submodule.value} {submodule.valueLabel}
      </Text>
    </View>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    safe: { backgroundColor: '#5A5A5A' },
    moduleHeader: {
      backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.15)',
      borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.2)',
    },
    moduleName: { color: '#FFFFFF' },
    moduleValue: { color: 'rgba(255, 255, 255, 0.8)' },
    emptyText: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
    subTabMinimal: {
      backgroundColor: isDarkMode ? 'rgba(233, 30, 99, 0.08)' : '#FFF5F9',
    },
    subTabMinimalText: { color: colors.primaryText },
    subTabMinimalLabel: { color: isDarkMode ? 'rgba(255,255,255,0.50)' : '#A0A0A0' },
    subTabMinimalIcon: {
      backgroundColor: isDarkMode ? 'rgba(233, 30, 99, 0.15)' : '#FFE1EC',
    },
  });
}

function createSubmoduleStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    submoduleCard: {
      backgroundColor: isDarkMode ? '#2A2A2E' : '#F2F2F5',
    },
    submoduleName: { color: colors.primaryText },
    submoduleValue: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

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

  quickWrap: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: '#FFFFFF',
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

  contentScroll: {
    flex: 1,
  },

  subTabMinimal: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  subTabMinimalPressed: {
    opacity: 0.75,
  },
  subTabMinimalContent: {
    alignItems: 'flex-end',
    gap: 1,
  },
  subTabMinimalText: {
    fontFamily: FontFamily.semiBold,
    fontSize: FontSize.xs,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  subTabMinimalLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    letterSpacing: 0.2,
  },
  subTabMinimalIcon: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  contentScrollContent: {
    flexGrow: 1,
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.md,
    paddingBottom: 80,
  },

  submoduleCard: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  submoduleName: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.1,
    marginBottom: 8,
  },

  submoduleValue: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  dashboardContent: {
    paddingBottom: 40,
  },

  submodulesContainer: {
    paddingBottom: 40,
  },

  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
});
