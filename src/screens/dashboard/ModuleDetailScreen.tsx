import React, { useMemo, useState } from 'react';
import {
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
import { FontFamily, FontSize, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import { ModuleCard } from '../../components/dashboard/ModuleCard';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { QuickAccessRow } from '../../components/dashboard/QuickAccessRow';

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

  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  const module = MODULES.find(m => m.id === moduleId);

  const handleModulePress = (mod: AppModule) => {
    navigate('ModuleDetail', { moduleId: mod.id });
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

        {/* Tabs - Fixed in white area */}
        <TabsSection
          tabs={['Dashboard' as const, 'Modules' as const, 'Submodules' as const]}
          activeTab={tab === 'modules' ? 'Modules' : tab === 'submodules' ? 'Submodules' : 'Dashboard'}
          onTabChange={(newTab) => {
            if (newTab === 'Modules') setTab('modules');
            else if (newTab === 'Submodules') setTab('submodules');
            else setTab('dashboard');
          }}
          colors={colors}
          isDarkMode={isDarkMode}
        />

        {/* Breadcrumbs - under the tab section */}
        <Breadcrumbs variant="light" />

        {/* Scrollable content only */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={false}>

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
