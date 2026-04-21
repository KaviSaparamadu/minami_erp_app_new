import React, { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UIIcon } from '../../components/common/UIIcon';
import { PageHeader } from '../../components/common/PageHeader';
import { ModuleCard } from '../../components/dashboard/ModuleCard';
import { QuickAccessRow } from '../../components/dashboard/QuickAccessRow';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { TabsSection } from '../../components/dashboard/TabsSection';
import { ModulesGrid } from '../../components/dashboard/ModulesGrid';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../hooks/useTheme';

const H_PAD = 6;
const GAP = 10;
const NUM_COLS = 3;

type Tab = 'modules' | 'dashboard';

export function DashboardScreen() {
  const { navigate } = useNavigation();
  const { width } = useWindowDimensions();
  const { colors, isDarkMode } = useTheme();
  const cardWidth = (width - H_PAD * 2 - (NUM_COLS - 1) * GAP) / NUM_COLS;

  const [tab, setTab] = useState<Tab>('dashboard');
  const [search, setSearch] = useState('');

  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  function handleModulePress(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  const filteredModules = MODULES.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <PageHeader showBack={false} showBrand={true} />

      {/* White section with fixed and scrollable content */}
      <View style={styles.whiteSection}>

        {/* Quick Access - Fixed in white area */}
        <View style={styles.quickWrap}>
          <QuickAccessRow onPress={handleModulePress} />
        </View>

        {/* Search bar - Fixed in white area */}
        <View style={[styles.searchBar, dyn.searchBar]}>
          <UIIcon name="search" size={16} color="#8E8E93" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search modules..."
            placeholderTextColor={isDarkMode ? '#8E8E93' : '#8E8E93'}
            style={[styles.searchInput, dyn.searchInput]}
          />
        </View>

        {/* Tabs - Fixed in white area */}
        <View style={[styles.tabsContainer, dyn.tabsBorder]}>
          <TabButton
            label="Dashboard"
            active={tab === 'dashboard'}
            onPress={() => setTab('dashboard')}
            dyn={dyn}
          />
          <TabButton
            label="Modules"
            active={tab === 'modules'}
            onPress={() => setTab('modules')}
            dyn={dyn}
          />
        </View>

        {/* Scrollable content only */}
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Content */}
          {tab === 'modules' ? (
            <ModulesGrid
              data={filteredModules}
              renderItem={(module, width) => (
                <ModuleCard module={module} width={width} onPress={handleModulePress} />
              )}
              cardWidth={cardWidth}
              numColumns={NUM_COLS}
              gap={GAP}
              hPad={H_PAD}
            />
          ) : (
            <View style={styles.dashboardContent}>
              <DashboardView />
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress, dyn }: { label: string; active: boolean; onPress: () => void; dyn: any }) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.tabBtn} activeOpacity={0.7}>
      <Text style={[styles.tabLabel, dyn.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active && <View style={styles.tabUnderline} />}
    </TouchableOpacity>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    safe: { backgroundColor: '#5A5A5A' },
    searchBar: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    searchInput: { color: colors.primaryText },
    tabLabel: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
    tabsBorder: {
      borderBottomColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
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

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: H_PAD,
    marginVertical: Spacing.xs,
    paddingHorizontal: 12,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    paddingVertical: 0,
  },

  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 0,
    paddingVertical: 6,
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: H_PAD,
    alignItems: 'center',
  },

  tabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },

  tabLabelActive: {
    fontFamily: FontFamily.bold,
    color: Colors.primaryHighlight,
  },

  tabUnderline: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primaryHighlight,
    borderRadius: 2,
  },

  whiteSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    flexDirection: 'column',
  },

  contentScroll: {
    flex: 1,
  },

  contentScrollContent: {
    flexGrow: 1,
    paddingTop: Spacing.md,
    paddingBottom: 80,
  },

  dashboardContent: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
});
