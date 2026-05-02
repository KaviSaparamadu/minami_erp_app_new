import React, { useRef, useState } from 'react';
import {
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

// Muted background colours per tab (cycles)
const CARD_COLORS = [
  '#F0F4FF', '#FFF0F5', '#F0FFF4', '#FFFBF0',
  '#F5F0FF', '#F0FAFF', '#FFF5F0', '#F0FFF9',
];
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
  const { width } = useWindowDimensions();
  const {
    recentPages, removeRecentPage,
    navigate, currentScreen, params: currentParams,
  } = useNavigation();

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

  const toggleSubmodule = (key: string) =>
    setActiveSubmodule(prev => (prev === key ? null : key));

  const activePage     = activeSubmodule ? recentPages.find(p => p.key === activeSubmodule) : null;
  const activeSubItems = activePage ? getSubmodules(activePage) : [];

  // card grid: 2 columns with gap
  const CARD_GAP = 10;
  const CARD_H_PAD = 16;
  const cardWidth = (width - CARD_H_PAD * 2 - CARD_GAP) / 2;

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
                      navigate(page.screen, page.params ?? undefined);
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

        {/* Subtle count badge */}
        <Pressable
          style={({ pressed }) => [styles.countBadge, pressed && styles.countBadgePressed]}
          onPress={() => setModalOpen(true)}>
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
                  if (targetScreen) navigate(targetScreen);
                }}>
                <View style={styles.subDot} />
                <Text style={styles.subItemText} numberOfLines={1}>{sub.name}</Text>
                <MaterialCommunityIcons name="chevron-right" size={12} color="#CCCCCC" />
              </Pressable>
            );
          })}
        </View>
      )}

      {/* ── Browser-style tab switcher modal ── */}
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
                    { paddingHorizontal: CARD_H_PAD, gap: CARD_GAP },
                  ]}
                  showsVerticalScrollIndicator={false}>

                  {recentPages.length === 0 ? (
                    <View style={styles.emptyWrap}>
                      <Text style={styles.emptyText}>No open tabs</Text>
                    </View>
                  ) : (
                    <View style={[styles.gridRow]}>
                      {recentPages.map((page, idx) => {
                        const label    = getLabel(page);
                        const isActive = isTabActive(page);
                        const bg       = CARD_COLORS[idx % CARD_COLORS.length];
                        const accent   = CARD_ACCENT[idx % CARD_ACCENT.length];
                        const initials = getInitials(label);

                        return (
                          <Pressable
                            key={page.key}
                            style={({ pressed }) => [
                              styles.card,
                              { width: cardWidth, borderColor: isActive ? Colors.primaryHighlight : '#E8E8E8' },
                              isActive && styles.cardActive,
                              pressed && styles.cardPressed,
                            ]}
                            onPress={() => {
                              navigate(page.screen, page.params ?? undefined);
                              setModalOpen(false);
                            }}>

                            {/* Card top bar */}
                            <View style={[styles.cardTopBar, { backgroundColor: accent }]}>
                              <View style={styles.cardDots}>
                                <View style={styles.cardDot} />
                                <View style={styles.cardDot} />
                                <View style={styles.cardDot} />
                              </View>
                              <Pressable
                                onPress={() => removeRecentPage(page.key)}
                                hitSlop={8}
                                style={styles.cardClose}>
                                <MaterialCommunityIcons name="close" size={11} color="rgba(255,255,255,0.9)" />
                              </Pressable>
                            </View>

                            {/* Card content */}
                            <View style={[styles.cardBody, { backgroundColor: bg }]}>
                              <View style={[styles.cardInitialCircle, { backgroundColor: accent + '22' }]}>
                                <Text style={[styles.cardInitials, { color: accent }]}>{initials}</Text>
                              </View>
                              <Text style={styles.cardLabel} numberOfLines={2}>{label}</Text>
                              {isActive && (
                                <View style={[styles.cardActivePill, { backgroundColor: accent + '22' }]}>
                                  <Text style={[styles.cardActivePillText, { color: accent }]}>active</Text>
                                </View>
                              )}
                            </View>
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
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingVertical: 5,
    paddingLeft: 8,
    paddingRight: 6,
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

  // ── Count badge (subtle) ─────────────────────────────────────────────────────
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#C8C8C8',
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
  },
  countBadgePressed: { opacity: 0.6 },
  countText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    fontWeight: '700',
    color: '#595959',
  },

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
    maxHeight: '75%',
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
    gap: 10,
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

  card: {
    borderRadius: 14,
    borderWidth: 2,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  cardActive: {
    shadowOpacity: 0.15,
    elevation: 5,
  },
  cardPressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },

  cardTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  cardDots: { flexDirection: 'row', gap: 3, flex: 1 },
  cardDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  cardClose: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(0,0,0,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  cardBody: {
    padding: 10,
    alignItems: 'center',
    gap: 6,
    minHeight: 90,
    justifyContent: 'center',
  },
  cardInitialCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInitials: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    fontWeight: '700',
  },
  cardLabel: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    fontWeight: '600',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  cardActivePill: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardActivePillText: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    fontWeight: '600',
  },
});
