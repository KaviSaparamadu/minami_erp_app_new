import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';

type TabName = 'Dashboard' | 'Modules' | 'Submodules';

interface TabsSectionProps {
  tabs: readonly TabName[];
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
  colors: any;
  isDarkMode: boolean;
}

export function TabsSection({ tabs, activeTab, onTabChange, colors, isDarkMode }: TabsSectionProps) {
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
  tabsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
    marginHorizontal: 0,
    marginBottom: Spacing.sm,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
  },
  tabBtn: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tabBtn3Cols: {
    flex: 1,
  },
  tabBtnFirst: {
    alignItems: 'flex-start',
    paddingLeft: 12,
    paddingRight: 0,
  },
  tabBtnMiddle: {
    alignItems: 'center',
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
    fontWeight: '700',
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
});
