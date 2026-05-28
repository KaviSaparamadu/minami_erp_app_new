import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { PageTabBar, PageTabItem } from '../../components/common/PageTabBar';
import { useStores, type Store } from '../../context/StoresContext';
import { useNavigation } from '../../context/NavigationContext';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';

type Tab = 'dashboard' | 'modules';

const TABS: PageTabItem[] = [
  { key: 'store-op-dashboard', label: 'Store Op Dashboard', color: '#595959' },
];

const SLOTS_PER_LINE = 3;

// ── Helpers ───────────────────────────────────────────────────────────────────

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

// ── Filled store card ─────────────────────────────────────────────────────────

function StoreCard({ store, onPress }: { store: Store; onPress: () => void }) {
  const bg       = store.storeColor || '#595959';
  const lum      = luminance(bg);
  const textColor = lum > 0.55 ? 'rgba(0,0,0,0.85)' : '#FFFFFF';
  const subColor  = lum > 0.55 ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.75)';

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [sc.card, { backgroundColor: bg }, pressed && { opacity: 0.8 }]}>
      <Text style={[sc.code, { color: subColor }]} numberOfLines={1}>{store.storeCode}</Text>
      <Text style={[sc.number, { color: textColor }]}>{store.storeNo}</Text>
      <View style={[sc.divider, { backgroundColor: textColor, opacity: 0.25 }]} />
      <Text style={[sc.label, { color: subColor }]} numberOfLines={1}>{store.workBranch}</Text>
      <Text style={[sc.label, { color: subColor }]} numberOfLines={1}>{store.entity}</Text>
    </Pressable>
  );
}

// ── Empty slot placeholder ────────────────────────────────────────────────────

function EmptySlot({ slotNo, onPress }: { slotNo: number; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [sc.emptySlot, pressed && { opacity: 0.6 }]}>
      <MaterialCommunityIcons name="store-plus-outline" size={22} color="rgba(89,89,89,0.3)" />
      <Text style={sc.emptySlotNo}>{String(slotNo).padStart(2, '0')}</Text>
    </Pressable>
  );
}

// ── Row of 3 ─────────────────────────────────────────────────────────────────

function StoreRow({ rowStores, startSlot, onEmptyPress, onStorePress }: {
  rowStores: (Store | null)[];
  startSlot: number;
  onEmptyPress: () => void;
  onStorePress: (store: Store) => void;
}) {
  return (
    <View style={sc.row}>
      {rowStores.map((store, i) => {
        const slotNo = startSlot + i;
        return store
          ? <StoreCard key={store.id} store={store} onPress={() => onStorePress(store)} />
          : <EmptySlot key={`empty-${slotNo}`} slotNo={slotNo} onPress={onEmptyPress} />;
      })}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function ProcStoresScreen() {
  const { stores } = useStores();
  const { navigate } = useNavigation();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [search, setSearch] = useState('');

  const filtered = stores.filter(s => {
    const q = search.toLowerCase();
    return (
      s.storeName.toLowerCase().includes(q) ||
      s.storeCode.toLowerCase().includes(q) ||
      s.workBranch.toLowerCase().includes(q) ||
      s.entity.toLowerCase().includes(q) ||
      s.storeNo.includes(q)
    );
  });

  // Build rows of SLOTS_PER_LINE, padding last row with null placeholders
  function buildRows(list: Store[]): (Store | null)[][] {
    if (list.length === 0) return [[null, null, null]];
    const rows: (Store | null)[][] = [];
    for (let i = 0; i < list.length; i += SLOTS_PER_LINE) {
      const chunk = list.slice(i, i + SLOTS_PER_LINE) as (Store | null)[];
      while (chunk.length < SLOTS_PER_LINE) chunk.push(null);
      rows.push(chunk);
    }
    return rows;
  }

  const rows = buildRows(filtered);

  return (
    <SubModuleLayout
      parentModuleId="4"
      title="Stores"
      showBack
      activeTab={tab}
      onTabChange={setTab}
      onModulePress={(m: AppModule) => navigate('ModuleDetail', { moduleId: m.id })}
      showSubmodulesTab={false}
      showSubTab={false}
      selfManagesScroll={true}>

      <View style={styles.content}>

        {/* Tab bar */}
        <View style={styles.tabBarWrap}>
          <PageTabBar
            tabs={TABS}
            active="store-op-dashboard"
            onChange={() => {}}
            variant="segment"
          />
        </View>

        {/* Search bar */}
        <View style={styles.searchWrap}>
          <MaterialCommunityIcons name="magnify" size={16} color="#8E8E93" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search stores…"
            placeholderTextColor="#8E8E93"
            style={styles.searchInput}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={16} color="#8E8E93" />
            </Pressable>
          )}
        </View>

        {/* Store count label */}
        <View style={styles.countRow}>
          <Text style={styles.countTxt}>
            {filtered.length} {filtered.length === 1 ? 'store' : 'stores'}
            {search.trim() ? ` found for "${search}"` : ' total'}
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {search.trim() !== '' && filtered.length === 0 ? (
            <View style={styles.empty}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons name="magnify-remove-outline" size={32} color="rgba(89,89,89,0.35)" />
              </View>
              <Text style={styles.emptyTitle}>No matches</Text>
              <Text style={styles.emptyHint}>Nothing matched "{search}"</Text>
              <Pressable onPress={() => setSearch('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnTxt}>Clear search</Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.rowsWrap}>
              {rows.map((rowStores, ri) => (
                <React.Fragment key={ri}>
                  <StoreRow
                    rowStores={rowStores}
                    startSlot={ri * SLOTS_PER_LINE + 1}
                    onEmptyPress={() => navigate('ProcManageStores')}
                    onStorePress={(store) => navigate('StoreDetail', { storeId: store.id })}
                  />
                  {/* Separator line between rows */}
                  {ri < rows.length - 1 && <View style={styles.rowDivider} />}
                </React.Fragment>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SubModuleLayout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const sc = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 10,
  },
  card: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 5,
    elevation: 4,
    minHeight: 130,
    justifyContent: 'center',
  },
  code: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.8,
    marginBottom: 4,
    textAlign: 'center',
  },
  number: {
    fontFamily: FontFamily.bold,
    fontSize: 32,
    fontWeight: FontWeight.bold,
    lineHeight: 38,
  },
  divider: {
    width: 28,
    height: 1,
    marginVertical: 6,
    borderRadius: 1,
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
    lineHeight: 15,
    textAlign: 'center',
  },
  emptySlot: {
    flex: 1,
    minHeight: 130,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: 'rgba(89,89,89,0.18)',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(89,89,89,0.03)',
  },
  emptySlotNo: {
    fontFamily: FontFamily.bold,
    fontSize: 13,
    fontWeight: FontWeight.bold,
    color: 'rgba(89,89,89,0.25)',
  },
});

const styles = StyleSheet.create({
  content: {
    flex: 1,
    paddingTop: 8,
  },
  tabBarWrap: {
    paddingHorizontal: Spacing.md,
    marginBottom: 10,
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: Spacing.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#1C1C1E',
    paddingVertical: 0,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    marginBottom: 4,
  },
  countTxt: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#8E8E93',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.md,
    paddingBottom: 80,
  },
  rowsWrap: {
    gap: 0,
  },
  rowDivider: {
    height: 1,
    backgroundColor: 'rgba(89,89,89,0.1)',
    marginHorizontal: 4,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(89,89,89,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#595959',
    textAlign: 'center',
  },
  emptyHint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
  },
  clearBtn: {
    marginTop: 4,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primaryHighlight,
  },
  clearBtnTxt: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
  },
});
