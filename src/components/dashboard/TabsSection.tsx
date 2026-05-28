import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontFamily, FontSize } from '../../constants/theme';

type TabName = 'Dashboard' | 'Modules' | 'Submodules';

interface TabsSectionProps {
  tabs: readonly TabName[];
  /** Pass null to show no tab as active (both labels appear unselected). */
  activeTab: TabName | null;
  onTabChange: (tab: string) => void;
  isDarkMode: boolean;
}

export function TabsSection({ tabs, activeTab, onTabChange, isDarkMode }: TabsSectionProps) {
  const borderBottomColor = isDarkMode ? '#3A3A3C' : '#E5E5EA';
  const labelColor = isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93';

  return (
    <View style={[styles.tabsRow, { borderBottomColor }]}>
      {tabs.map((tab, idx) => {
        const isActive = activeTab === tab;
        const isFirst = idx === 0;
        const isLast = idx === tabs.length - 1;
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            style={[
              styles.tabBtn,
              tabs.length === 3 && styles.tabBtn3Cols,
              isFirst && styles.tabBtnFirst,
              isLast && styles.tabBtnLast,
              !isFirst && !isLast && styles.tabBtnMiddle,
            ]}
            activeOpacity={0.7}>
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? Colors.primaryHighlight : labelColor },
                isActive && styles.tabLabelActive,
              ]}>
              {tab}
            </Text>
            {isActive && <View style={styles.tabUnderline} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  // Matches DashboardScreen's tabsContainer exactly
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  // Matches DashboardScreen's tabBtn exactly
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtn3Cols: {
    flex: 1,
  },
  // Matches DashboardScreen's tabBtnFirst exactly
  tabBtnFirst: {
    alignItems: 'flex-start',
    paddingLeft: 12,
    paddingRight: 0,
  },
  tabBtnMiddle: {
    alignItems: 'center',
  },
  // Matches DashboardScreen's tabBtnLast exactly
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
    fontWeight: '700',
  },
  // Matches DashboardScreen's tabUnderline exactly (bottom: -6 covers the border line)
  tabUnderline: {
    position: 'absolute',
    bottom: -6,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primaryHighlight,
    borderRadius: 2,
  },
});
