import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize } from '../../constants/theme';

export interface PageTabItem {
  key: string;
  label: string;
  color?: string;
}

interface PageTabBarProps {
  tabs: PageTabItem[];
  active: string;
  onChange: (key: string) => void;
  variant?: 'pill' | 'folder' | 'segment';
}

const DEFAULT_COLOR = '#595959';

export function PageTabBar({ tabs, active, onChange, variant = 'pill' }: PageTabBarProps) {
  if (variant === 'segment') {
    return (
      <View style={sg.wrap}>
        {tabs.map(({ key, label }) => {
          const isActive = active === key;
          return (
            <Pressable
              key={key}
              onPress={() => onChange(key)}
              style={({ pressed }) => [
                sg.tab,
                isActive && sg.tabActive,
                pressed && sg.tabPressed,
              ]}>
              <Text style={[sg.label, isActive && sg.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  if (variant === 'folder') {
    return (
      <View style={f.bar}>
        {tabs.map(({ key, label }) => {
          const isActive = active === key;
          return (
            <Pressable
              key={key}
              onPress={() => onChange(key)}
              style={({ pressed }) => [
                f.tab,
                isActive ? f.tabActive : f.tabInactive,
                pressed && f.tabPressed,
              ]}>
              <Text style={[f.label, isActive && f.labelActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>
    );
  }

  // pill variant
  return (
    <View style={s.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.row}>
        {tabs.map(({ key, label, color }) => {
          const isActive = active === key;
          const accent = color ?? DEFAULT_COLOR;
          return (
            <Pressable
              key={key}
              onPress={() => onChange(key)}
              style={({ pressed }) => [
                s.tab,
                isActive && [s.tabActive, { backgroundColor: accent, shadowColor: accent }],
                pressed && s.tabPressed,
              ]}>
              <Text style={[s.label, isActive && s.labelActive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Segment variant styles (iOS segmented control) ───────────────────────────
const sg = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F5',
    borderRadius: 8,
    padding: 2,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 14,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.09,
    shadowRadius: 2,
    elevation: 2,
  },
  tabPressed: {
    opacity: 0.70,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#9A9A9A',
    fontWeight: '500',
  },
  labelActive: {
    fontFamily: FontFamily.bold,
    fontWeight: '600',
    color: '#1C1C1E',
  },
});

// ─── Folder-tab variant styles ────────────────────────────────────────────────
const f = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    gap: 2,
    paddingHorizontal: 14,
    marginBottom: -1,
  },
  tab: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  tabActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#E8E8ED',
  },
  tabInactive: {
    backgroundColor: '#EDEDED',
  },
  tabPressed: {
    opacity: 0.65,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#AAAAAA',
    fontWeight: '500',
  },
  labelActive: {
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    color: '#2C2C2E',
  },
});

// ─── Pill variant styles ──────────────────────────────────────────────────────
const s = StyleSheet.create({
  wrap: {
    paddingVertical: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 3,
  },
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: '#F0F0F5',
  },
  tabActive: {
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.28,
    shadowRadius: 5,
    elevation: 3,
  },
  tabPressed: {
    opacity: 0.65,
    transform: [{ scale: 0.96 }],
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#9A9A9A',
    fontWeight: '500',
  },
  labelActive: {
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
