import React, { useMemo, useRef, useState } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FontFamily, FontSize, FontWeight, Spacing, Colors } from '../../constants/theme';

// Simple clean sans-serif: Helvetica Neue on iOS, Roboto light on Android.
const QA_FONT = Platform.select({ ios: 'Helvetica Neue', android: 'sans-serif-light', default: undefined });
import { MODULES } from '../../constants/modules';
import { UIIcon } from '../common/UIIcon';
import { MODULE_ICON_MAP } from './ModuleIcon';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';

interface QuickAccessRowProps {
  onPress?: (module: AppModule) => void;
}

const ITEM_WIDTH = 64;
const ITEM_GAP = Spacing.md;
const STEP = (ITEM_WIDTH + ITEM_GAP) * 3;

export function QuickAccessRow({ onPress }: QuickAccessRowProps) {
  const { colors, isDarkMode } = useTheme();
  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);
  const scrollRef = useRef<ScrollView>(null);
  const offsetRef = useRef(0);
  const contentWidthRef = useRef(0);
  const layoutWidthRef = useRef(0);

  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

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

      <View style={styles.rowWithArrows}>
        <ArrowButton direction="left" disabled={!canLeft} onPress={() => scrollTo(offsetRef.current - STEP)} />

        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scroll}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onContentSizeChange={(w) => {
            contentWidthRef.current = w;
            updateArrows(offsetRef.current);
          }}
          onLayout={(e) => {
            layoutWidthRef.current = e.nativeEvent.layout.width;
            updateArrows(offsetRef.current);
          }}>
          {MODULES.map(m => (
            <Pressable
              key={m.id}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
              onPress={() => onPress?.(m)}
              accessibilityRole="button"
              accessibilityLabel={m.name}>
              <View style={styles.circle}>
                <UIIcon name={MODULE_ICON_MAP[m.iconType] ?? 'clipboard'} color={Colors.primaryHighlight} size={18} />
              </View>
              <Text style={[styles.name, dyn.name]} numberOfLines={1}>{m.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <ArrowButton direction="right" disabled={!canRight} onPress={() => scrollTo(offsetRef.current + STEP)} />
      </View>
    </View>
  );
}

function ArrowButton({ direction, disabled, onPress }: { direction: 'left' | 'right'; disabled: boolean; onPress: () => void }) {
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
  wrapper: { paddingTop: Spacing.lg },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
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
    gap: 4,
  },

  scroll: { gap: ITEM_GAP, paddingBottom: 4, paddingHorizontal: 4 },

  item: { alignItems: 'center', gap: 6, width: ITEM_WIDTH },
  itemPressed: { transform: [{ scale: 0.94 }], opacity: 0.8 },
  circle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(233,30,99,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: QA_FONT,
    fontSize: 10,
    fontWeight: '400',
    letterSpacing: 0,
    textAlign: 'center',
  },

  arrowBtn: {
    width: 28, height: 44,
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
