import React, { useRef, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useIsPreview } from '../../context/PreviewContext';
import { LiveScreenPreview } from './ScreenPreview';
import { useNavigation } from '../../context/NavigationContext';
import { SCREEN_LABELS } from '../../constants/screenLabels';
import { MODULES } from '../../constants/modules';
import { Colors, FontFamily } from '../../constants/theme';
import type { RecentPage } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

const SUBMODULE_SCREEN: Record<string, ScreenName> = {
  'Human Management':        'HumanManagement',
  'Employee Management':     'EmployeeManagement',
  'User Management':         'UserManagement',
  'System Settings':         'SystemSettings',
  'General Settings':        'GeneralSettings',
  'System Default Settings': 'SystemDefaultSettings',
  'Support Ticket':          'SupportTicket',
  'Activity Log':            'ActivityLog',
  'Finance Utilities':       'FinanceUtilities',
  'Ledger Management':       'LedgerManagement',
  'Finance Operation':       'FinanceOperation',
  'Purchasing':              'Purchasing',
  'Stores & Inventory':      'StoresInventory',
  'Logistics':               'Logistics',
};

const CARD_ACCENT = [
  '#6B8CFF', '#E91E63', '#34C759', '#FF9500',
  '#9B59B6', '#17A2B8', '#FF6B35', '#00B894',
];

function getLabel(page: RecentPage): string {
  if (page.screen === 'ModuleDetail') {
    const mod = MODULES.find(m => m.id === page.params?.moduleId);
    return mod?.name ?? 'Module';
  }
  return SCREEN_LABELS[page.screen] ?? page.screen;
}

function getSubmodules(page: RecentPage) {
  if (page.screen === 'ModuleDetail') {
    const mod = MODULES.find(m => m.id === page.params?.moduleId);
    return mod?.submodules ?? [];
  }
  const mod = MODULES.find(m => m.screen === page.screen);
  return mod?.submodules ?? [];
}

function getInitials(label: string): string {
  return label
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}


export function RecentPageTabs() {
  const isPreview = useIsPreview();
  const { width } = useWindowDimensions();
  const {
    
    recentPages, removeRecentPage,
    navigateInstant, currentScreen, params: currentParams,
    screenshots, saveScreenshot,
  } = useNavigation();

  if (isPreview) return null;

  const scrollRef         = useRef<ScrollView>(null);
  const [modalOpen,       setModalOpen]       = useState(false);
  const [activeSubmodule, setActiveSubmodule] = useState<string | null>(null);

  const isTabActive = (page: RecentPage): boolean => {
    if (page.screen === 'ModuleDetail') {
      return currentScreen === 'ModuleDetail' &&
        currentParams?.moduleId === page.params?.moduleId;
    }
    return currentScreen === page.screen;
  };

  async function openModal() {
    // Capture the currently visible screen so its card shows a fresh preview
    const currentKey = currentScreen === 'ModuleDetail' && currentParams?.moduleId
      ? `ModuleDetail:${currentParams.moduleId}`
      : currentScreen;
    await saveScreenshot(currentKey);
    setModalOpen(true);
  }

  const toggleSubmodule = (key: string) =>
    setActiveSubmodule(prev => (prev === key ? null : key));

  const activePage     = activeSubmodule ? recentPages.find(p => p.key === activeSubmodule) : null;
  const activeSubItems = activePage ? getSubmodules(activePage) : [];

  // card grid: 2 columns with gap
  const CARD_GAP   = 12;
  const CARD_H_PAD = 16;
  const cardWidth  = (width - CARD_H_PAD * 2 - CARD_GAP) / 2;

  return (
    <View>
      {/* ── Always-visible bar ── */}
      <View style={styles.bar}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}>

          {recentPages.length === 0 ? (
            <Text style={styles.emptyHint}>No recent pages</Text>
          ) : (
            recentPages.map(page => {
              const label         = getLabel(page);
              const isActive      = isTabActive(page);
              const submodules    = getSubmodules(page);
              const hasSubmodules = submodules.length > 0;
              const subOpen       = activeSubmodule === page.key;

              return (
                <View key={page.key} style={[styles.tab, isActive && styles.tabActive]}>
                  <Pressable
                    onPress={() => {
                      setActiveSubmodule(null);
                      navigateInstant(page.screen, page.params ?? undefined);
                    }}
                    style={styles.tabLabelBtn}>
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]} numberOfLines={1}>
                      {label}
                    </Text>
                  </Pressable>

                  {hasSubmodules && (
                    <Pressable onPress={() => toggleSubmodule(page.key)} hitSlop={6} style={styles.subChevronBtn}>
                      <MaterialCommunityIcons
                        name={subOpen ? 'chevron-up' : 'chevron-down'}
                        size={10}
                        color={subOpen ? '#E91E63' : '#BBBBBB'}
                      />
                    </Pressable>
                  )}

                  <Pressable
                    onPress={() => {
                      if (activeSubmodule === page.key) setActiveSubmodule(null);
                      removeRecentPage(page.key);
                    }}
                    hitSlop={8}
                    style={styles.closeBtn}>
                    <Text style={[styles.closeX, isActive && styles.closeXActive]}>×</Text>
                  </Pressable>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Tab count badge — box with + before number */}
        <Pressable
          style={({ pressed }) => [styles.countBadge, pressed && styles.countBadgePressed]}
          onPress={openModal}>
          <MaterialCommunityIcons name="plus" size={9} color="#595959" style={styles.countPlus} />
          <Text style={styles.countText}>{recentPages.length}</Text>
        </Pressable>
      </View>

      {/* ── Sub-module panel ── */}
      {activeSubmodule && activeSubItems.length > 0 && (
        <View style={styles.subPanel}>
          {activeSubItems.map((sub, idx) => {
            const targetScreen = SUBMODULE_SCREEN[sub.name];
            return (
              <Pressable
                key={sub.id}
                style={({ pressed }) => [
                  styles.subItem,
                  idx < activeSubItems.length - 1 && styles.subItemBorder,
                  pressed && styles.subItemPressed,
                ]}
                onPress={() => {
                  setActiveSubmodule(null);
                  if (targetScreen) navigateInstant(targetScreen);
                }}>
                <View style={styles.subDot} />
                <Text style={styles.subItemText} numberOfLines={1}>{sub.name}</Text>
                <MaterialCommunityIcons name="chevron-right" size={12} color="#CCCCCC" />
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Chrome-style tab switcher modal ── */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setModalOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setModalOpen(false)}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.sheet, { width }]}>

                {/* Header */}
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>
                    {recentPages.length} open tab{recentPages.length !== 1 ? 's' : ''}
                  </Text>
                  <Pressable
                    onPress={() => setModalOpen(false)}
                    style={styles.sheetCloseBtn}
                    hitSlop={10}>
                    <MaterialCommunityIcons name="close" size={18} color="#555" />
                  </Pressable>
                </View>

                {/* Tab card grid */}
                <ScrollView
                  contentContainerStyle={[
                    styles.grid,
                    { paddingHorizontal: CARD_H_PAD },
                  ]}
                  showsVerticalScrollIndicator={false}>

                  {recentPages.length === 0 ? (
                    <View style={styles.emptyWrap}>
                      <Text style={styles.emptyText}>No open tabs</Text>
                    </View>
                  ) : (
                    <View style={styles.gridRow}>
                      {recentPages.map((page, idx) => {
                        const label      = getLabel(page);
                        const isActive   = isTabActive(page);
                        const accent     = CARD_ACCENT[idx % CARD_ACCENT.length];
                        const initials   = getInitials(label);
                        const screenshot = screenshots[page.key];

                        return (
                          <Pressable
                            key={page.key}
                            style={({ pressed }) => [
                              styles.card,
                              { width: cardWidth },
                              isActive && styles.cardActive,
                              pressed && styles.cardPressed,
                            ]}
                            onPress={() => {
                              navigateInstant(page.screen, page.params ?? undefined);
                              setModalOpen(false);
                            }}>

                            {/* Chrome-style tab header */}
                            <View style={styles.cardHeader}>
                              <View style={[styles.cardFavicon, { backgroundColor: accent }]}>
                                <Text style={styles.cardFaviconText}>{initials[0] ?? '?'}</Text>
                              </View>
                              <Text style={styles.cardTitle} numberOfLines={1}>{label}</Text>
                              <Pressable
                                onPress={() => removeRecentPage(page.key)}
                                hitSlop={8}
                                style={styles.cardCloseBtn}>
                                <MaterialCommunityIcons name="close" size={13} color="#888888" />
                              </Pressable>
                            </View>

                            {/* Live screen preview — renders the actual screen scaled down */}
                            {screenshot ? (
                              <View style={styles.cardPreviewWrap}>
                                <Image
                                  source={{ uri: screenshot }}
                                  style={styles.cardPreviewImg}
                                  resizeMode="cover"
                                />
                              </View>
                            ) : (
                              <LiveScreenPreview page={page} cardWidth={cardWidth} />
                            )}

                          </Pressable>
                        );
                      })}
                    </View>
                  )}
                </ScrollView>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // ── Bar ──────────────────────────────────────────────────────────────────────
  bar: {
    flexDirection: 'row',
    alignItems: 'stretch',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingVertical: 5,
    paddingLeft: 8,
    paddingRight: 0,
    minHeight: 32,
  },
  scroll: { flex: 1 },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingRight: 4,
  },
  emptyHint: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    fontStyle: 'italic',
    color: '#CCCCCC',
    paddingHorizontal: 4,
  },

  // ── Inline tabs ──────────────────────────────────────────────────────────────
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    paddingLeft: 8,
    paddingRight: 4,
    paddingVertical: 3,
    gap: 2,
  },
  tabActive: {
    borderColor: '#C8C8C8',
    backgroundColor: '#F0F0F0',
  },
  tabLabelBtn: { flexShrink: 1 },
  tabText: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    fontStyle: 'italic',
    color: '#595959',
    maxWidth: 90,
  },
  tabTextActive: {
    color: '#1C1C1C',
    fontFamily: FontFamily.medium,
  },
  subChevronBtn: { paddingHorizontal: 2, paddingVertical: 1 },
  closeBtn: { paddingHorizontal: 2 },
  closeX: { fontSize: 13, color: '#BBBBBB', lineHeight: 16 },
  closeXActive: { color: '#595959' },

  // ── Count badge (box with +) ─────────────────────────────────────────────────
  countBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    borderRadius: 0,
    borderLeftWidth: 1.5,
    borderColor: '#C8C8C8',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 10,
    marginLeft: 6,
    gap: 2,
  },
  countBadgePressed: { opacity: 0.6 },
  countText: {
    fontFamily: FontFamily.bold,
    fontSize: 12,
    fontWeight: '700',
    color: '#595959',
  },
  countPlus: {},

  // ── Sub-module panel ─────────────────────────────────────────────────────────
  subPanel: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    borderRadius: 8,
    marginHorizontal: 8,
    marginTop: 2,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  subItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#F2F2F2',
  },
  subItemPressed: { backgroundColor: '#F8F8F8' },
  subDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E91E63',
  },
  subItemText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: '#595959',
  },

  // ── Modal overlay ────────────────────────────────────────────────────────────
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  sheet: {
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 12,
  },
  sheetTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  sheetCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E0E0E5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Card grid ────────────────────────────────────────────────────────────────
  grid: {
    paddingTop: 4,
    paddingBottom: 16,
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: '#AAAAAA',
    fontStyle: 'italic',
  },

  // ── Chrome-style card ────────────────────────────────────────────────────────
  card: {
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#E0E0E5',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardActive: {
    borderWidth: 1,
    borderColor: Colors.primaryHighlight,
    shadowOpacity: 0.15,
    elevation: 5,
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  // Header row (white, like Chrome tab bar)
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8E8ED',
    gap: 6,
  },
  cardFavicon: {
    width: 18,
    height: 18,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardFaviconText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardTitle: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  cardCloseBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },

  // Preview area
  cardPreviewWrap: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
  },
  cardPreviewImg: {
    width: '100%',
    height: '100%',
  },
  cardPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardPlaceholderInitials: {
    fontFamily: FontFamily.bold,
    fontSize: 22,
    fontWeight: '700',
    opacity: 0.7,
  },
});
