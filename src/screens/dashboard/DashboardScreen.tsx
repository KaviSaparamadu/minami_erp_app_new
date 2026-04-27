import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [refreshing, setRefreshing] = useState(false);
  const panResponder = useRef<any>(null);

  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  // Set up swipe gesture handling
  useEffect(() => {
    panResponder.current = PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt: GestureResponderEvent, state: PanResponderGestureState) => {
        return Math.abs(state.dx) > 10 && Math.abs(state.dy) < 10;
      },
      onPanResponderRelease: (evt: GestureResponderEvent, state: PanResponderGestureState) => {
        const threshold = 50;
        // Swipe right (from left to right) - go to dashboard
        if (state.dx > threshold && tab !== 'dashboard') {
          setTab('dashboard');
        }
        // Swipe left (from right to left) - go to modules
        if (state.dx < -threshold && tab !== 'modules') {
          setTab('modules');
        }
      },
    });
  }, [tab]);

  function handleModulePress(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate data refresh (1.5 seconds)
    await new Promise<void>(resolve => setTimeout(resolve, 1500));
    setRefreshing(false);
  };


  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <PageHeader
        showBack={false}
        showBrand={true}
        dashboardSearch={true}
        hideSearchBar={false}
      />


      {/* White section with fixed and scrollable content */}
      <View style={styles.whiteSection} {...panResponder.current?.panHandlers}>

        {/* Quick Access - Fixed in white area */}
        <View style={styles.quickWrap}>
          <QuickAccessRow onPress={handleModulePress} />
        </View>

        {/* Tabs - Fixed in white area */}
        <View style={[styles.tabsContainer, dyn.tabsBorder]}>
          <TabButton
            label="Dashboard"
            active={tab === 'dashboard'}
            onPress={() => setTab('dashboard')}
            dyn={dyn}
            isFirst
          />
          <TabButton
            label="Modules"
            active={tab === 'modules'}
            onPress={() => setTab('modules')}
            dyn={dyn}
            isLast
          />
        </View>

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
          {tab === 'modules' ? (
            <ModulesGrid
              data={MODULES}
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

function TabButton({ label, active, onPress, dyn, isFirst, isLast }: { label: string; active: boolean; onPress: () => void; dyn: any; isFirst?: boolean; isLast?: boolean }) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.tabBtn, isFirst && styles.tabBtnFirst, isLast && styles.tabBtnLast]} activeOpacity={0.7}>
      <Text style={[styles.tabLabel, dyn.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active && <View style={styles.tabUnderline} />}
    </TouchableOpacity>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    safe: { backgroundColor: '#5A5A5A' },
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

  tabsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingVertical: 6,
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
  },

  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabBtnFirst: {
    alignItems: 'flex-start',
    paddingLeft: 12,
    paddingRight: 0,
  },

  tabBtnLast: {
    alignItems: 'flex-end',
    paddingLeft: 0,
    paddingRight: 12,
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
    bottom: -6,
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

  pillWrap: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.primaryHighlight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: Colors.primaryHighlight,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  pillText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pillBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  pillBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryHighlight,
  },
});
