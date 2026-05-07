import React, { useRef, useState } from 'react';
import {
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import type { AppModule } from '../../constants/modules';

type Tab = 'dashboard' | 'modules';

const ITEM_SETTING_TABS = [
  { key: 'item-category',       label: 'Item Category' },
  { key: 'item-sub-category',   label: 'Item Sub Category' },
  { key: 'item-material',       label: 'Item Material' },
  { key: 'variance-type',       label: 'Variance Type' },
  { key: 'variance-attribute',  label: 'Variance Attribute' },
  { key: 'item-generic',        label: 'Item Generic' },
  { key: 'item-oem',            label: 'Item OEM' },
  { key: 'group-name',          label: 'Group Name' },
];

const ARROW_W     = 18;
const ROW_GAP     = 6;
const SCROLL_STEP = 120;
const PREVIEW_W   = 140;
const PREVIEW_H   = 118;

// ── Placeholder content 
function TabPlaceholder({ label }: { label: string }) {
  return (
    <View style={ph.wrap}>
      <View style={ph.icon} />
      <Text style={ph.title}>{label}</Text>
      <Text style={ph.sub}>No records found. Add a new entry to get started.</Text>
    </View>
  );
}

// ── Mini tab preview (scaled-down placeholder shown in the dropdown) 
function MiniTabPreview({ label }: { label: string }) {
  const { width: screenW, height: screenH } = useWindowDimensions();
  const scale = PREVIEW_W / screenW;
  const tx    = (PREVIEW_W - screenW) / 2;
  const ty    = (screenH * scale - screenH) / 2;

  return (
    <View style={mini.wrap}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width:  screenW,
          height: screenH,
          transform: [{ translateX: tx }, { translateY: ty }, { scale }],
        }}>
        <TabPlaceholder label={label} />
      </View>
    </View>
  );
}

// ── Arrow button 
function ArrowButton({
  direction, disabled, onPress,
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
      style={({ pressed }) => [arr.btn, disabled && arr.disabled, pressed && arr.pressed]}>
      <View style={[arr.chevron, {
        borderTopColor:   disabled ? '#D0D0D6' : Colors.primaryHighlight,
        borderRightColor: disabled ? '#D0D0D6' : Colors.primaryHighlight,
        transform: [{ rotate: direction === 'left' ? '-135deg' : '45deg' }],
      }]} />
    </Pressable>
  );
}

// ── Scrollable segment tab bar ────────────────────────────────────────────────
function ScrollableSegmentTabBar({
  tabs, active, onChange,
}: {
  tabs: typeof ITEM_SETTING_TABS;
  active: string;
  onChange: (key: string) => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef       = useRef<ScrollView>(null);
  const dropBtnRef      = useRef<any>(null);
  const offsetRef       = useRef(0);
  const contentWidthRef = useRef(0);
  const layoutWidthRef  = useRef(0);
  const tabOffsetsRef   = useRef<Record<string, number>>({});
  const tabWidthsRef    = useRef<Record<string, number>>({});
  const [canLeft,    setCanLeft]    = useState(false);
  const [canRight,   setCanRight]   = useState(true);
  const [dropOpen,   setDropOpen]   = useState(false);
  const [dropPos,    setDropPos]    = useState({ top: 0, right: 0 });
  const [previewTab, setPreviewTab] = useState<string>(active);

  function scrollTo(x: number) {
    const max     = Math.max(0, contentWidthRef.current - layoutWidthRef.current);
    const clamped = Math.max(0, Math.min(max, x));
    scrollRef.current?.scrollTo({ x: clamped, animated: true });
  }

  function scrollToTab(key: string) {
    const tabX    = tabOffsetsRef.current[key] ?? 0;
    const tabW    = tabWidthsRef.current[key] ?? 0;
    const centerX = tabX - (layoutWidthRef.current - tabW) / 2;
    scrollTo(centerX);
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

  function openDropdown() {
    setPreviewTab(active);
    dropBtnRef.current?.measure((_x: number, _y: number, w: number, h: number, pageX: number, pageY: number) => {
      setDropPos({
        top:   pageY + h + 6,
        right: screenWidth - (pageX + w),
      });
      setDropOpen(true);
    });
  }

  return (
    <>
      {/* ── Tab bar row ── */}
      <View style={st.row}>
        <ArrowButton
          direction="left"
          disabled={!canLeft}
          onPress={() => scrollTo(offsetRef.current - SCROLL_STEP)}
        />

        <View style={st.strip}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onContentSizeChange={w => { contentWidthRef.current = w; updateArrows(offsetRef.current); }}
            onLayout={e => { layoutWidthRef.current = e.nativeEvent.layout.width; updateArrows(offsetRef.current); }}
            contentContainerStyle={st.scroll}>
            {tabs.map(t => {
              const isActive = active === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => onChange(t.key)}
                  onLayout={e => {
                    tabOffsetsRef.current[t.key] = e.nativeEvent.layout.x;
                    tabWidthsRef.current[t.key]  = e.nativeEvent.layout.width;
                  }}
                  style={({ pressed }) => [st.tab, isActive && st.tabActive, pressed && st.tabPressed]}>
                  <Text style={[st.label, isActive && st.labelActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ArrowButton
          direction="right"
          disabled={!canRight}
          onPress={() => scrollTo(offsetRef.current + SCROLL_STEP)}
        />

        {/* ── Dropdown toggle ── */}
        <Pressable
          ref={dropBtnRef}
          onPress={openDropdown}
          hitSlop={6}
          accessibilityRole="button"
          accessibilityLabel="Show all tabs"
          style={({ pressed }) => [st.dropBtn, pressed && st.dropBtnPressed]}>
          <MaterialCommunityIcons
            name="chevron-down"
            size={15}
            color={Colors.primaryHighlight}
          />
        </Pressable>
      </View>

      {/* ── Dropdown panel ── */}
      <Modal
        visible={dropOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDropOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setDropOpen(false)}>
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback>
              <View style={[dd.panel, { top: dropPos.top, right: dropPos.right }]}>
                <View style={dd.split}>

                  {/* Left column — compact tab boxes */}
                  <View style={dd.leftCol}>
                    {tabs.map(t => {
                      const isActive    = active === t.key;
                      const isPreviewed = previewTab === t.key;
                      return (
                        <Pressable
                          key={t.key}
                          onPressIn={() => setPreviewTab(t.key)}
                          onPress={() => { onChange(t.key); scrollToTab(t.key); setDropOpen(false); }}
                          style={({ pressed }) => [
                            dd.tabBox,
                            isActive    && dd.tabBoxActive,
                            isPreviewed && dd.tabBoxPreviewed,
                            pressed     && dd.tabBoxPressed,
                          ]}>
                          <Text style={[dd.label, isActive && dd.labelActive]} numberOfLines={1}>
                            {t.label}
                          </Text>
                          {isActive && (
                            <MaterialCommunityIcons name="check" size={12} color={Colors.primaryHighlight} />
                          )}
                        </Pressable>
                      );
                    })}
                  </View>

                  {/* Divider */}
                  <View style={dd.divider} />

                  {/* Right column — page preview */}
                  <View style={dd.rightCol}>
                    <Text style={dd.previewLabel} numberOfLines={1}>
                      {tabs.find(t => t.key === previewTab)?.label}
                    </Text>
                    <MiniTabPreview label={tabs.find(t => t.key === previewTab)?.label ?? ''} />
                  </View>

                </View>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export function ItemSettingsScreen() {
  const { navigate } = useNavigation();
  const [tab,     setTab]     = useState<Tab>('modules');
  const [pageTab, setPageTab] = useState<string>('item-category');

  function handleQuickAccess(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  const activeTabItem = ITEM_SETTING_TABS.find(t => t.key === pageTab);

  return (
    <SubModuleLayout
      parentModuleId="2"
      title="Item Settings"
      showBack={true}
      activeTab={tab}
      onTabChange={setTab}
      onModulePress={handleQuickAccess}
      showSubmodulesTab={false}
      selfManagesScroll={true}>

      <View style={styles.tabContainer}>
        {tab !== 'dashboard' && (
          <View style={styles.tabBarWrap}>
            <ScrollableSegmentTabBar
              tabs={ITEM_SETTING_TABS}
              active={pageTab}
              onChange={(t) => { setPageTab(t); setTab('modules'); }}
            />
          </View>
        )}

        <View style={[styles.tabPanel, tab !== 'dashboard' && styles.tabPanelOffset]}>
          {tab === 'dashboard' ? (
            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={styles.contentScrollContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.dashboardContent} />
            </ScrollView>
          ) : (
            <ScrollView
              style={styles.contentScroll}
              contentContainerStyle={styles.contentScrollContent}
              showsVerticalScrollIndicator={false}>
              <TabPlaceholder label={activeTabItem?.label ?? pageTab} />
            </ScrollView>
          )}
        </View>
      </View>
    </SubModuleLayout>
  );
}

// ── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabContainer:         { flex: 1, paddingTop: 8 },
  tabBarWrap:           { paddingHorizontal: Spacing.md },
  tabPanel:             { flex: 1 },
  tabPanelOffset:       { marginTop: 8 },
  contentScroll:        { flex: 1 },
  contentScrollContent: { flexGrow: 1, paddingBottom: 80 },
  dashboardContent:     { flex: 1 },
});

// ── Arrow button styles ───────────────────────────────────────────────────────
const arr = StyleSheet.create({
  btn:     { width: ARROW_W, height: 32, alignItems: 'center', justifyContent: 'center' },
  disabled:{ opacity: 0.35 },
  pressed: { opacity: 0.55, transform: [{ scale: 0.9 }] },
  chevron: { width: 7, height: 7, borderTopWidth: 2, borderRightWidth: 2 },
});

// ── Tab bar styles ────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: ROW_GAP,
  },
  strip: {
    flex: 1,
    backgroundColor: '#F0F0F5',
    borderRadius: 8,
    padding: 2,
    overflow: 'hidden',
  },
  scroll:      { flexDirection: 'row', gap: 2 },
  tab:         { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  tabActive:   { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.09, shadowRadius: 2, elevation: 2 },
  tabPressed:  { opacity: 0.70 },
  label:       { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: '#9A9A9A', fontWeight: '500' },
  labelActive: { fontFamily: FontFamily.bold, fontWeight: '600', color: '#1C1C1E' },

  dropBtn:        { width: 28, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryHighlight + '18' },
  dropBtnPressed: { opacity: 0.6 },
});

// ── Dropdown styles ───────────────────────────────────────────────────────────
const dd = StyleSheet.create({
  panel: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 10,
    overflow: 'hidden',
  },
  split:   { flexDirection: 'row' },
  leftCol: { width: 150, paddingVertical: 6 },
  divider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: '#E8E8ED',
    marginVertical: 8,
  },
  rightCol: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 6,
    alignItems: 'center',
  },
  tabBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginHorizontal: 6,
    marginVertical: 1,
    borderRadius: 7,
    gap: 6,
  },
  tabBoxActive:    { backgroundColor: Colors.primaryHighlight + '12' },
  tabBoxPreviewed: { backgroundColor: '#F2F2F7' },
  tabBoxPressed:   { backgroundColor: '#EAEAF0' },
  label: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  labelActive: {
    fontFamily: FontFamily.bold,
    fontWeight: '600',
    color: Colors.primaryHighlight,
  },
  previewLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    fontWeight: '600',
    color: '#595959',
    textAlign: 'center',
    maxWidth: PREVIEW_W,
  },
});

// ── Mini preview styles ───────────────────────────────────────────────────────
const mini = StyleSheet.create({
  wrap: {
    width: PREVIEW_W,
    height: PREVIEW_H,
    overflow: 'hidden',
    backgroundColor: '#F5F5FA',
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E8E8ED',
  },
});

// ── Placeholder styles ────────────────────────────────────────────────────────
const ph = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(89,89,89,0.08)',
    marginBottom: 8,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#595959',
    textAlign: 'center',
  },
  sub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 20,
  },
});
