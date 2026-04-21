import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Text,
} from 'react-native';
import { PageHeader } from '../common/PageHeader';
import { QuickAccessRow } from '../dashboard/QuickAccessRow';
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
}: SubModuleLayoutProps) {
  const { colors, isDarkMode } = useTheme();
  const [tab, setTab] = useState<Tab>(activeTab);

  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    onTabChange?.(newTab);
  };

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <PageHeader showBack={showBack} title={title} />

      {/* Quick Access */}
      <View style={styles.quickWrap}>
        <QuickAccessRow onPress={onModulePress} />
      </View>

      {/* White section with scrollable content */}
      <View style={styles.whiteSection}>
        <ScrollView
          style={styles.contentScroll}
          contentContainerStyle={styles.contentScrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Tabs */}
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
                label="Submodules"
                active={tab === 'submodules'}
                onPress={() => handleTabChange('submodules')}
                dyn={dyn}
              />
            )}
          </View>

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
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  quickWrap: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },

  whiteSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    overflow: 'hidden',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    marginTop: 16,
    flexDirection: 'column',
  },

  contentScroll: {
    flex: 1,
  },

  contentScrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: 80,
  },

  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    marginHorizontal: -Spacing.lg - 8,
    paddingHorizontal: Spacing.lg + 8,
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
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primaryHighlight,
    borderRadius: 2,
  },

  content: {
    flex: 1,
    paddingTop: Spacing.md,
  },
});
