import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
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
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useAuth } from '../../hooks/useAuth';
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../hooks/useTheme';

const H_PAD    = Spacing.lg;
const GAP      = 6;
const NUM_COLS = 3;

type Tab = 'modules' | 'dashboard';

export function DashboardScreen() {
  const { user } = useAuth();
  const { navigate } = useNavigation();
  const { width } = useWindowDimensions();
  const { colors, isDarkMode } = useTheme();
  const cardWidth = (width - H_PAD * 2 - GAP) / NUM_COLS;

  const [tab, setTab] = useState<Tab>('dashboard');
  const [search, setSearch] = useState('');

  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  function handleModulePress(module: AppModule) {
    if (module.screen) navigate(module.screen);
  }

  const filteredModules = MODULES.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const fullName = user?.fullName ?? 'Administrator';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <PageHeader showBack={false} showBrand={true} />

      <View style={[styles.welcomeCard, dyn.welcomeCard]}>
        <View style={styles.welcomeAccent} />
        <View style={styles.welcomeText}>
          <Text style={[styles.welcomeGreeting, dyn.welcomeGreeting]}>{greeting},</Text>
          <Text style={[styles.welcomeName, dyn.welcomeName]} numberOfLines={1}>Welcome, {fullName}</Text>
        </View>
        <View style={styles.welcomeBadge}>
          <UIIcon name="user" size={20} color={Colors.primaryHighlight} />
        </View>
      </View>

      <View style={styles.quickWrap}>
        <QuickAccessRow onPress={handleModulePress} />
      </View>

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

      <View style={[styles.tabsRow, dyn.tabsBorder]}>
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

      {tab === 'modules' ? (
        <FlatList
          key="modules-list"
          data={filteredModules}
          keyExtractor={item => item.id}
          numColumns={NUM_COLS}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }: { item: AppModule }) => (
            <ModuleCard module={item} width={cardWidth} onPress={handleModulePress} />
          )}
        />
      ) : (
        <ScrollView
          key="dashboard-scroll"
          contentContainerStyle={styles.dashboardScroll}
          showsVerticalScrollIndicator={false}>
          <DashboardView />
        </ScrollView>
      )}
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
    safe: { backgroundColor: colors.background },
    searchBar: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    searchInput: { color: colors.primaryText },
    tabsBorder: {
      borderBottomColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    tabLabel: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
    welcomeCard: {
      backgroundColor: isDarkMode ? '#2A1A22' : '#FFF1F6',
      borderColor: isDarkMode ? 'rgba(233,30,99,0.35)' : 'rgba(233,30,99,0.2)',
    },
    welcomeGreeting: { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#8E8E93' },
    welcomeName: { color: colors.primaryText },
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  welcomeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: H_PAD,
    marginTop: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  welcomeAccent: {
    width: 4, height: 34, borderRadius: 2,
    backgroundColor: Colors.primaryHighlight,
  },
  welcomeText: { flex: 1 },
  welcomeGreeting: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
  welcomeName: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
    marginTop: 2,
  },
  welcomeBadge: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(233,30,99,0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  quickWrap: {
    paddingHorizontal: H_PAD,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: H_PAD,
    marginTop: Spacing.md,
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

  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginHorizontal: H_PAD,
    borderBottomWidth: 1,
  },
  tabBtn: {
    paddingVertical: 10,
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
    left: 0, right: 0,
    height: 2,
    backgroundColor: Colors.primaryHighlight,
    borderRadius: 2,
  },

  list: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.md,
    paddingBottom: 40,
  },
  row: {
    gap: GAP,
    justifyContent: 'space-between',
    marginBottom: GAP,
  },

  dashboardScroll: {
    padding: H_PAD,
    paddingBottom: 40,
  },
});
