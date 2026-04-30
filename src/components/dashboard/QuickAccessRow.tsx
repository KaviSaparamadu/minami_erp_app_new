import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontSize, Colors } from '../../constants/theme';

const QA_FONT = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-light', default: undefined });

import { MODULES } from '../../constants/modules';
import { UIIcon } from '../common/UIIcon';
import { MODULE_ICON_MAP } from './ModuleIcon';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';

interface QuickAccessRowProps {
  onPress?: (module: AppModule) => void;
  selectedModuleId?: string;
}

// Layout constants
const VISIBLE_ITEMS = 5;
const ITEM_GAP = 4;
const ARROW_WIDTH = 18;
const ROW_GAP = 4; // gap between each arrow and the ScrollView

export function QuickAccessRow({ onPress, selectedModuleId }: QuickAccessRowProps) {
  const { colors, isDarkMode } = useTheme();
  const { lastModuleId } = useNavigation();
  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);
  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);
  const contentWidthRef = useRef(0);
  const layoutWidthRef = useRef(0);

  // Measured width of the rowWithArrows container
  const [containerWidth, setContainerWidth] = useState(0);

  // itemWidth fills the row with exactly VISIBLE_ITEMS items
  // rowWithArrows = [ArrowLeft] [gap] [ScrollView] [gap] [ArrowRight]
  // scrollViewWidth = containerWidth - 2*ARROW_WIDTH - 2*ROW_GAP
  // itemWidth = (scrollViewWidth - (VISIBLE_ITEMS-1)*ITEM_GAP) / VISIBLE_ITEMS
  const itemWidth = containerWidth > 0
    ? Math.floor(
        (containerWidth - 2 * ARROW_WIDTH - 2 * ROW_GAP - (VISIBLE_ITEMS - 1) * ITEM_GAP) / VISIBLE_ITEMS
      )
    : 60;

  // Scroll by one full page (5 items)
  const step = itemWidth * VISIBLE_ITEMS + ITEM_GAP * (VISIBLE_ITEMS - 1);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const orderedModules = useMemo(() => {
    const activeModuleId = selectedModuleId ?? lastModuleId;
    if (!activeModuleId) return MODULES;
    const selected = MODULES.find(m => m.id === activeModuleId);
    if (!selected) return MODULES;
    return [selected, ...MODULES.filter(m => m.id !== activeModuleId)];
  }, [selectedModuleId, lastModuleId]);

  function scrollTo(x: number) {
    const max = Math.max(0, contentWidthRef.current - layoutWidthRef.current);
    const clamped = Math.max(0, Math.min(max, x));
    scrollRef.current?.scrollTo({ x: clamped, animated: true });
  }

  function updateArrows(x: number) {
    const max = Math.max(0, contentWidthRef.current - layoutWidthRef.current);
    setCanLeft(x > 2);
    setCanRight(x < max - 2);
  }

  const activeModuleId = selectedModuleId ?? lastModuleId;

  useEffect(() => {
    if (activeModuleId) scrollTo(0);
  }, [activeModuleId]);

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    offsetRef.current = e.nativeEvent.contentOffset.x;
    updateArrows(offsetRef.current);
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <View style={styles.titleAccent} />
          <Text style={[styles.title, dyn.title]}>Quick Access</Text>
        </View>
        <Text style={[styles.seeAll, dyn.seeAll]}>See all</Text>
      </View>

      <View
        style={styles.rowWithArrows}
        onLayout={e => setContainerWidth(e.nativeEvent.layout.width)}>
        <ArrowButton
          direction="left"
          disabled={!canLeft}
          onPress={() => scrollTo(offsetRef.current - step)}
        />

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.scroll, { gap: ITEM_GAP }]}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onContentSizeChange={w => {
            contentWidthRef.current = w;
            updateArrows(offsetRef.current);
            if (activeModuleId) scrollTo(0);
          }}
          onLayout={e => {
            layoutWidthRef.current = e.nativeEvent.layout.width;
            updateArrows(offsetRef.current);
            if (activeModuleId) scrollTo(0);
          }}>
          {orderedModules.map(m => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [styles.item, { width: itemWidth }, pressed && styles.itemPressed]}
              onPress={() => onPress?.(m)}
              accessibilityRole="button"
              accessibilityLabel={m.name}>
              {({ pressed }) => {
                const isActive = activeModuleId === m.id;
                return (
                  <>
                    <View style={[styles.circle, pressed && styles.circleActive, isActive && styles.circleSelected]}>
                      <UIIcon
                        name={MODULE_ICON_MAP[m.iconType] ?? 'clipboard'}
                        color={pressed || isActive ? '#FFFFFF' : '#595959'}
                        size={18}
                      />
                    </View>
                    <Text style={[styles.name, dyn.name, { width: itemWidth, opacity: pressed ? 1 : 0 }]} numberOfLines={1}>
                      {m.name}
                    </Text>
                  </>
                );
              }}
            </Pressable>
          ))}
        </ScrollView>

        <ArrowButton
          direction="right"
          disabled={!canRight}
          onPress={() => scrollTo(offsetRef.current + step)}
        />
      </View>
    </View>
  );
}

function ArrowButton({
  direction,
  disabled,
  onPress,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={direction === 'left' ? 'Scroll left' : 'Scroll right'}
      style={({ pressed }) => [styles.arrowBtn, disabled && styles.arrowDisabled, pressed && styles.arrowPressed]}>
      <View
        style={[
          styles.chevron,
          {
            borderTopColor: disabled ? '#D0D0D6' : Colors.primaryHighlight,
            borderRightColor: disabled ? '#D0D0D6' : Colors.primaryHighlight,
            transform: [{ rotate: direction === 'left' ? '-135deg' : '45deg' }],
          },
        ]}
      />
    </Pressable>
  );
}

function createDynamicStyles(colors: any, _isDarkMode: boolean) {
  return StyleSheet.create({
    title:  { color: colors.primaryText },
    seeAll: { color: colors.placeholder },
    name:   { color: colors.primaryText },
  });
}

const styles = StyleSheet.create({
  wrapper: {
    paddingTop: 8,
    backgroundColor: '#FFFFFF',
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  titleLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  titleAccent: {
    width: 3, height: 14, borderRadius: 2,
    backgroundColor: Colors.primaryHighlight,
  },
  title: {
    fontFamily: QA_FONT,
    fontSize: FontSize.md,
    fontWeight: '700',
    letterSpacing: 0,
  },
  seeAll: {
    fontFamily: QA_FONT,
    fontSize: FontSize.xs,
    fontWeight: '400',
    letterSpacing: 0,
  },

  rowWithArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ROW_GAP,
  },

  scroll: { paddingBottom: 2 },

  item: { alignItems: 'center', gap: 3, height: 64 },
  itemPressed: { transform: [{ scale: 0.92 }] },

  circle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#595959',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  circleActive: {
    backgroundColor: Colors.primaryHighlight,
    shadowOpacity: 0.18,
    elevation: 3,
  },
  circleSelected: {
    backgroundColor: Colors.primaryHighlight,
    shadowColor: Colors.primaryHighlight,
    shadowOpacity: 0.35,
    elevation: 4,
  },
  name: {
    fontFamily: QA_FONT,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 0,
    textAlign: 'center',
  },

  arrowBtn: {
    width: ARROW_WIDTH,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowDisabled: { opacity: 0.35 },
  arrowPressed: { opacity: 0.55, transform: [{ scale: 0.9 }] },
  chevron: {
    width: 8, height: 8,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
});
