import React, { useMemo, useRef, useState } from 'react';
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { StockAdjustmentModal } from '../../components/common/StockAdjustmentModal';
import type { StockAdjType } from '../../components/common/StockAdjustmentModal';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

// ── Main tab definitions ───────────────────────────────────────────────────────

const SIF_TABS = [
  { key: 'stock',     label: 'Stock' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'history',   label: 'History of Stock & Inv. Adj.' },
] as const;

type SIFTabKey = typeof SIF_TABS[number]['key'];

const TAB_ICONS: Record<SIFTabKey, string> = {
  stock:     'package-variant-closed-outline',
  inventory: 'clipboard-list-outline',
  history:   'history',
};

const TAB_SUBTITLES: Record<SIFTabKey, string> = {
  stock:     'View and manage current stock levels across all locations.',
  inventory: 'Track inventory items, quantities, and valuation.',
  history:   'Full audit trail of past stock and inventory changes, including all adjustment entries.',
};

// ── Stock sub-tab definitions ──────────────────────────────────────────────────

const STOCK_SUBTABS = [
  { key: 'stock-main',    label: 'Stock' },
  { key: 'stock-pending', label: 'Pending Price Adjustments' },
] as const;

type StockSubTabKey = typeof STOCK_SUBTABS[number]['key'];

const STOCK_SUBTAB_ICONS: Record<StockSubTabKey, string> = {
  'stock-main':    'package-variant-closed-outline',
  'stock-pending': 'tag-edit-outline',
};

const STOCK_SUBTAB_SUBTITLES: Record<StockSubTabKey, string> = {
  'stock-main':    'View and manage current stock levels across all locations.',
  'stock-pending': 'Review and approve pending price adjustment requests for stock items.',
};

const ARROW_W     = 18;
const ROW_GAP     = 6;
const SCROLL_STEP = 120;

// ── Pending Price Adjustment types ─────────────────────────────────────────────

type AdjType = 'Damage' | 'Excess' | 'ISU' | 'Goods Vehicle' | 'Item';

interface PendingAdjRecord {
  id:             string;
  serialNo:       string;
  type:           AdjType;
  goodsVehicle:   string;
  item:           string;
  qtyMain:        string;
  qtyLose:        string;
  actionStockAdj: string;
  status:         'Pending';
}

const TYPE_COLORS: Record<AdjType, { bg: string; text: string }> = {
  'Damage':        { bg: 'rgba(229,57,53,0.10)',   text: '#C62828' },
  'Excess':        { bg: 'rgba(25,118,210,0.10)',  text: '#1565C0' },
  'ISU':           { bg: 'rgba(123,31,162,0.10)',  text: '#6A1B9A' },
  'Goods Vehicle': { bg: 'rgba(0,137,123,0.10)',   text: '#00695C' },
  'Item':          { bg: 'rgba(245,124,0,0.10)',   text: '#E65100' },
};

const TYPE_FULL: Record<AdjType, string> = {
  'Damage':        'Damage',
  'Excess':        'Excess',
  'ISU':           'Initial Stock Update (ISU)',
  'Goods Vehicle': 'Goods Vehicle',
  'Item':          'Item',
};

const MOCK_PENDING: PendingAdjRecord[] = [
  { id: '1', serialNo: 'PA-2024-001', type: 'Damage',        goodsVehicle: 'GV-HINO-001',  item: 'Head Light (L-h-s) HINO SCOOP',        qtyMain: '12',  qtyLose: '2',  actionStockAdj: 'Reduce stock by 2 units',        status: 'Pending' },
  { id: '2', serialNo: 'PA-2024-002', type: 'Excess',        goodsVehicle: 'GV-MITS-004',  item: 'Dashboard MITSUBISHI CANER WIDE',       qtyMain: '8',   qtyLose: '0',  actionStockAdj: 'Add 3 excess units to stock',    status: 'Pending' },
  { id: '3', serialNo: 'PA-2024-003', type: 'ISU',           goodsVehicle: 'GV-ISUZ-002',  item: 'Dashboard ISUZU I061 (Black)',          qtyMain: '25',  qtyLose: '0',  actionStockAdj: 'Initial balance entry — 25 qty', status: 'Pending' },
  { id: '4', serialNo: 'PA-2024-004', type: 'Goods Vehicle', goodsVehicle: 'GV-HINO-007',  item: 'Dashboard HINO RANGER (Black) FC',     qtyMain: '15',  qtyLose: '1',  actionStockAdj: 'Vehicle damage — reduce 1 unit', status: 'Pending' },
  { id: '5', serialNo: 'PA-2024-005', type: 'Item',          goodsVehicle: '—',             item: 'Head Light SUZUKI WAGON R STINGRAY',    qtyMain: '30',  qtyLose: '5',  actionStockAdj: 'Write-off 5 damaged units',      status: 'Pending' },
  { id: '6', serialNo: 'PA-2024-006', type: 'Damage',        goodsVehicle: 'GV-HINO-003',  item: 'Dashboard HINO PROFIA (Black) TRUCK',  qtyMain: '10',  qtyLose: '3',  actionStockAdj: 'Adjust stock — 3 units lost',    status: 'Pending' },
];

// ── Info chip (shared) ─────────────────────────────────────────────────────────

function InfoChip({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={ic.chip}>
      <Text style={ic.label}>{label}</Text>
      <Text style={[ic.value, { color: colors.primaryText }]} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

// ── Pending Adjustment Card ────────────────────────────────────────────────────

function PendingAdjCard({
  record,
  index,
}: {
  record: PendingAdjRecord;
  index:  number;
}) {
  const { colors, isDarkMode } = useTheme();
  const typeStyle = TYPE_COLORS[record.type];
  const [adjVisible, setAdjVisible] = useState(false);

  return (
    <View style={[pc.card, isDarkMode && pc.cardDark]}>
      {/* Left accent stripe */}
      <View style={[pc.accent, { backgroundColor: '#F59E0B' }]} />

      <View style={pc.inner}>

        {/* ── Header ── */}
        <View style={pc.header}>
          {/* Type badge */}
          <View style={[pc.typeBadge, { backgroundColor: typeStyle.bg }]}>
            <Text style={[pc.typeTxt, { color: typeStyle.text }]}>
              {TYPE_FULL[record.type]}
            </Text>
          </View>

          <View style={{ flex: 1 }} />

          {/* Index */}
          <Text style={[pc.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        {/* Serial No. + Status row */}
        <View style={pc.serialRow}>
          <View style={pc.serialWrap}>
            <MaterialCommunityIcons name="barcode" size={13} color={colors.placeholder} />
            <Text style={[pc.serialTxt, { color: colors.primaryText }]}>{record.serialNo}</Text>
          </View>
          <View style={pc.statusBadge}>
            <View style={pc.statusDot} />
            <Text style={pc.statusTxt}>Pending</Text>
          </View>
        </View>

        <View style={[pc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* ── Info chips row 1: Goods Vehicle + Item ── */}
        <View style={pc.chips}>
          <InfoChip label="Goods Vehicle" value={record.goodsVehicle} />
          <View style={[pc.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <InfoChip label="Item"          value={record.item} />
        </View>

        {/* ── Info chips row 2: Qty Main + Qty Lose ── */}
        <View style={[pc.chips, pc.chipsQty]}>
          <View style={pc.qtyBox}>
            <Text style={pc.qtyLabel}>Qty. Main</Text>
            <Text style={[pc.qtyVal, { color: colors.primaryText }]}>{record.qtyMain}</Text>
          </View>
          <View style={[pc.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <View style={pc.qtyBox}>
            <Text style={pc.qtyLabel}>Qty. Lose</Text>
            <Text style={[pc.qtyVal, { color: record.qtyLose !== '0' ? '#E53935' : colors.primaryText }]}>
              {record.qtyLose}
            </Text>
          </View>
          <View style={[pc.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <View style={[pc.qtyBox, { flex: 2 }]}>
            <Text style={pc.qtyLabel}>Action Stock Adj.</Text>
            <Text style={[pc.qtyVal, pc.adjTxt, { color: colors.primaryText }]} numberOfLines={2}>
              {record.actionStockAdj}
            </Text>
          </View>
        </View>

        {/* ── Action buttons ── */}
        <View style={[pc.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable style={({ pressed }) => [pc.btn, pc.btnView, pressed && pc.btnPressed]} hitSlop={4}>
            <MaterialCommunityIcons name="eye-outline" size={13} color="#595959" />
            <Text style={pc.btnTxt}>View</Text>
          </Pressable>
          <Pressable style={({ pressed }) => [pc.btn, pc.btnEdit, pressed && pc.btnPressed]} hitSlop={4}>
            <MaterialCommunityIcons name="pencil-outline" size={13} color="#595959" />
            <Text style={pc.btnTxt}>Edit</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => setAdjVisible(true)}
            style={({ pressed }) => [pc.btn, pc.btnAdj, pressed && pc.btnPressed]}
            hitSlop={4}>
            <MaterialCommunityIcons name="tune-variant" size={13} color="#1565C0" />
            <Text style={pc.btnAdjTxt}>Adjustment</Text>
          </Pressable>
        </View>
      </View>

      {/* Stock Adjustment modal — type driven by this record */}
      <StockAdjustmentModal
        visible={adjVisible}
        onClose={() => setAdjVisible(false)}
        adjType={record.type as StockAdjType}
        serialNo={record.serialNo}
        itemName={record.item}
        goodsVehicle={record.goodsVehicle}
        initialQtyMain={record.qtyMain}
        initialQtyLose={record.qtyLose}
      />
    </View>
  );
}

// ── Pending Price Adjustments tab ──────────────────────────────────────────────

function PendingPriceAdjTab({ onRefresh, refreshing }: {
  onRefresh:  () => Promise<void>;
  refreshing: boolean;
}) {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return MOCK_PENDING;
    return MOCK_PENDING.filter(r =>
      r.serialNo.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.goodsVehicle.toLowerCase().includes(q) ||
      r.item.toLowerCase().includes(q) ||
      r.actionStockAdj.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={pa.scroll}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primaryHighlight}
        />
      }>

      {/* Section header */}
      <View style={pa.sectionHeader}>
        <Text style={[pa.sectionTitle, { color: colors.primaryText }]}>
          Pending Price Adjustments
        </Text>
        <View style={pa.countBadge}>
          <Text style={pa.countTxt}>{filtered.length}</Text>
        </View>
      </View>

      {/* Search bar */}
      <View style={pa.searchRow}>
        <View style={[pa.searchBar, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F5F5F7', borderColor: isDarkMode ? '#3A3A3C' : '#E8E8F0' }]}>
          <MaterialCommunityIcons name="magnify" size={17} color="#8E8E93" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by serial no., type, item…"
            placeholderTextColor="#8E8E93"
            style={[pa.searchInput, { color: colors.primaryText }]}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8} style={pa.clearBtn}>
              <View style={[pa.clearX1, { backgroundColor: colors.placeholder }]} />
              <View style={[pa.clearX2, { backgroundColor: colors.placeholder }]} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Card list */}
      {filtered.length === 0 ? (
        <View style={pa.empty}>
          <MaterialCommunityIcons name="tag-search-outline" size={36} color="rgba(89,89,89,0.3)" />
          <Text style={[pa.emptyTitle, { color: colors.primaryText }]}>
            {searchQuery.trim() ? 'No matches found' : 'No pending adjustments'}
          </Text>
          <Text style={[pa.emptySub, { color: colors.placeholder }]}>
            {searchQuery.trim()
              ? `Nothing matched "${searchQuery}"`
              : 'All price adjustments are up to date.'}
          </Text>
          {searchQuery.trim().length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={pa.clearSearchBtn}>
              <Text style={pa.clearSearchTxt}>Clear search</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={pa.list}>
          {filtered.map((record, idx) => (
            <PendingAdjCard key={record.id} record={record} index={idx} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── Tab placeholder (for non-pending tabs) ─────────────────────────────────────

function TabPlaceholder({
  icon, title, subtitle,
}: { icon: string; title: string; subtitle: string }) {
  const { colors } = useTheme();
  return (
    <View style={ph.wrap}>
      <View style={ph.iconCircle}>
        <MaterialCommunityIcons name={icon as any} size={28} color="rgba(89,89,89,0.4)" />
      </View>
      <Text style={[ph.title, { color: colors.primaryText }]}>{title}</Text>
      <Text style={[ph.sub,   { color: colors.placeholder }]}>{subtitle}</Text>
    </View>
  );
}

// ── Arrow button ───────────────────────────────────────────────────────────────

function ArrowButton({
  direction, disabled, onPress,
}: { direction: 'left' | 'right'; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      accessibilityRole="button"
      style={({ pressed }) => [arr.btn, disabled && arr.disabled, pressed && arr.pressed]}>
      <View style={[arr.chevron, {
        borderTopColor:   disabled ? '#D0D0D6' : Colors.primaryHighlight,
        borderRightColor: disabled ? '#D0D0D6' : Colors.primaryHighlight,
        transform: [{ rotate: direction === 'left' ? '-135deg' : '45deg' }],
      }]} />
    </Pressable>
  );
}

// ── Scrollable segment tab bar (main) ──────────────────────────────────────────

function ScrollableSegmentTabBar({
  tabs, active, onChange,
}: {
  tabs:     typeof SIF_TABS;
  active:   SIFTabKey;
  onChange: (key: SIFTabKey) => void;
}) {
  const scrollRef       = useRef<ScrollView>(null);
  const offsetRef       = useRef(0);
  const contentWidthRef = useRef(0);
  const layoutWidthRef  = useRef(0);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  function scrollTo(x: number) {
    const max     = Math.max(0, contentWidthRef.current - layoutWidthRef.current);
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
    <View style={st.row}>
      <ArrowButton direction="left" disabled={!canLeft} onPress={() => scrollTo(offsetRef.current - SCROLL_STEP)} />
      <View style={st.strip}>
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={st.scroll}
          onScroll={onScroll}
          scrollEventThrottle={16}
          onContentSizeChange={w => { contentWidthRef.current = w; updateArrows(offsetRef.current); }}
          onLayout={e => { layoutWidthRef.current = e.nativeEvent.layout.width; updateArrows(offsetRef.current); }}>
          {tabs.map(tab => {
            const isActive = active === tab.key;
            return (
              <Pressable
                key={tab.key}
                onPress={() => onChange(tab.key)}
                style={({ pressed }) => [st.tab, isActive && st.tabActive, pressed && st.tabPressed]}>
                <Text style={[st.label, isActive && st.labelActive]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>
      <ArrowButton direction="right" disabled={!canRight} onPress={() => scrollTo(offsetRef.current + SCROLL_STEP)} />
    </View>
  );
}

// ── Underline sub-tab bar (Stock) ──────────────────────────────────────────────

function StockSubTabBar({
  active, onChange,
}: { active: StockSubTabKey; onChange: (key: StockSubTabKey) => void }) {
  const scrollRef       = useRef<ScrollView>(null);
  const offsetRef       = useRef(0);
  const contentWidthRef = useRef(0);
  const layoutWidthRef  = useRef(0);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  function scrollTo(x: number) {
    const max     = Math.max(0, contentWidthRef.current - layoutWidthRef.current);
    const clamped = Math.max(0, Math.min(max, x));
    scrollRef.current?.scrollTo({ x: clamped, animated: true });
  }

  function updateArrows(x: number) {
    const max = Math.max(0, contentWidthRef.current - layoutWidthRef.current);
    setCanLeft(x > 2);
    setCanRight(x < max - 2);
  }

  return (
    <View style={sub.wrap}>
      {canLeft && (
        <Pressable hitSlop={8} onPress={() => scrollTo(offsetRef.current - SCROLL_STEP)} style={sub.arrow}>
          <MaterialCommunityIcons name="chevron-left" size={16} color={Colors.placeholder} />
        </Pressable>
      )}
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={sub.scroll}
        scrollEventThrottle={16}
        onScroll={e => { offsetRef.current = e.nativeEvent.contentOffset.x; updateArrows(offsetRef.current); }}
        onContentSizeChange={w => { contentWidthRef.current = w; updateArrows(offsetRef.current); }}
        onLayout={e => { layoutWidthRef.current = e.nativeEvent.layout.width; updateArrows(offsetRef.current); }}>
        {STOCK_SUBTABS.map(tab => {
          const isActive = active === tab.key;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              style={({ pressed }) => [sub.tab, pressed && { opacity: 0.6 }]}>
              <Text style={[sub.label, isActive && sub.labelActive]}>{tab.label}</Text>
              {isActive && <View style={sub.indicator} />}
            </Pressable>
          );
        })}
      </ScrollView>
      {canRight && (
        <Pressable hitSlop={8} onPress={() => scrollTo(offsetRef.current + SCROLL_STEP)} style={sub.arrow}>
          <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.placeholder} />
        </Pressable>
      )}
    </View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────

export function StockInventoryFinanceScreen() {
  const [activeTab,   setActiveTab]   = useState<SIFTabKey>('stock');
  const [stockSubTab, setStockSubTab] = useState<StockSubTabKey>('stock-main');
  const [refreshing,  setRefreshing]  = useState(false);

  function handleMainTabChange(key: SIFTabKey) {
    setActiveTab(key);
    if (key === 'stock') setStockSubTab('stock-main');
  }

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise<void>(r => setTimeout(r, 700));
    setRefreshing(false);
  }

  const showPending = activeTab === 'stock' && stockSubTab === 'stock-pending';

  const placeholderIcon     = TAB_ICONS[activeTab];
  const placeholderTitle    = SIF_TABS.find(t => t.key === activeTab)!.label;
  const placeholderSubtitle = TAB_SUBTITLES[activeTab];

  // For stock-main placeholder
  const stockMainIcon     = STOCK_SUBTAB_ICONS['stock-main'];
  const stockMainTitle    = STOCK_SUBTABS.find(t => t.key === 'stock-main')!.label;
  const stockMainSubtitle = STOCK_SUBTAB_SUBTITLES['stock-main'];

  return (
    <SubModuleLayout parentModuleId="3" title="Stock & Inventory Finance" showBack={true}>
      <View style={s.container}>

        {/* Main tab bar */}
        <View style={s.tabBarWrap}>
          <ScrollableSegmentTabBar
            tabs={SIF_TABS}
            active={activeTab}
            onChange={handleMainTabChange}
          />
        </View>

        {/* Stock sub-tab bar */}
        {activeTab === 'stock' && (
          <View style={s.subTabWrap}>
            <StockSubTabBar active={stockSubTab} onChange={setStockSubTab} />
          </View>
        )}

        {/* Content */}
        <View style={s.panel}>
          {showPending ? (
            // ── Pending Price Adjustments ──
            <PendingPriceAdjTab onRefresh={handleRefresh} refreshing={refreshing} />
          ) : activeTab === 'stock' ? (
            // ── Stock main placeholder ──
            <ScrollView
              style={s.scroll}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primaryHighlight} />
              }>
              <TabPlaceholder icon={stockMainIcon} title={stockMainTitle} subtitle={stockMainSubtitle} />
            </ScrollView>
          ) : (
            // ── Inventory / History placeholders ──
            <ScrollView
              style={s.scroll}
              contentContainerStyle={s.scrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.primaryHighlight} />
              }>
              <TabPlaceholder icon={placeholderIcon} title={placeholderTitle} subtitle={placeholderSubtitle} />
            </ScrollView>
          )}
        </View>

      </View>
    </SubModuleLayout>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:    { flex: 1, paddingTop: 8 },
  tabBarWrap:   { paddingHorizontal: Spacing.md },
  subTabWrap:   { marginTop: 4, paddingHorizontal: Spacing.md },
  panel:        { flex: 1, marginTop: 4 },
  scroll:       { flex: 1 },
  scrollContent:{ flexGrow: 1, paddingBottom: 80 },
});

const arr = StyleSheet.create({
  btn:     { width: ARROW_W, height: 32, alignItems: 'center', justifyContent: 'center' },
  disabled:{ opacity: 0.35 },
  pressed: { opacity: 0.55, transform: [{ scale: 0.9 }] },
  chevron: { width: 7, height: 7, borderTopWidth: 2, borderRightWidth: 2 },
});

const st = StyleSheet.create({
  row:        { flexDirection: 'row', alignItems: 'center', gap: ROW_GAP },
  strip:      { flex: 1, backgroundColor: '#F0F0F5', borderRadius: 8, padding: 2, overflow: 'hidden' },
  scroll:     { flexDirection: 'row', gap: 2 },
  tab:        { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  tabActive:  { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.09, shadowRadius: 2, elevation: 2 },
  tabPressed: { opacity: 0.70 },
  label:      { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: '#9A9A9A', fontWeight: '500' },
  labelActive:{ fontFamily: FontFamily.bold, fontWeight: '600', color: '#1C1C1E' },
});

const sub = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EBEBF0' },
  scroll:     { flexDirection: 'row' },
  tab:        { paddingVertical: 8, paddingHorizontal: 14, alignItems: 'center', position: 'relative' },
  label:      { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: '#9A9A9A', fontWeight: '500' },
  labelActive:{ fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: '600', color: Colors.primaryHighlight },
  indicator:  { position: 'absolute', bottom: 0, left: 14, right: 14, height: 2, borderRadius: 1, backgroundColor: Colors.primaryHighlight },
  arrow:      { paddingHorizontal: 2, alignItems: 'center', justifyContent: 'center' },
});

const ph = StyleSheet.create({
  wrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, paddingTop: 60 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:      { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  sub:        { fontFamily: FontFamily.regular, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});

// ── Pending adj tab styles ─────────────────────────────────────────────────────

const pa = StyleSheet.create({
  scroll:       { paddingBottom: 80 },
  sectionHeader:{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.xs },
  sectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700' },
  countBadge:   { backgroundColor: '#F59E0B', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
  countTxt:     { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#FFF' },
  searchRow:    { paddingHorizontal: Spacing.md, marginBottom: Spacing.sm },
  searchBar:    { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 8 },
  searchInput:  { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, paddingVertical: 0 },
  clearBtn:     { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
  clearX1:      { position: 'absolute', width: 12, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2:      { position: 'absolute', width: 12, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  list:         { paddingHorizontal: Spacing.md, gap: 10 },
  empty:        { alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: Spacing.xl, gap: 8 },
  emptyTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', textAlign: 'center' },
  emptySub:     { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  clearSearchBtn:{ marginTop: 4, paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryHighlight },
  clearSearchTxt:{ fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryHighlight },
});

// ── Pending adj card styles ────────────────────────────────────────────────────

const pc = StyleSheet.create({
  card:        { borderRadius: 12, backgroundColor: '#FFF', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
  cardDark:    { backgroundColor: '#1C1C1E' },
  accent:      { width: 4 },
  inner:       { flex: 1, paddingTop: 12 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 6 },
  typeBadge:   { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeTxt:     { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  idx:         { fontFamily: FontFamily.regular, fontSize: 11 },
  serialRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 10 },
  serialWrap:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serialTxt:   { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '500' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusDot:   { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B' },
  statusTxt:   { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', color: '#D97706' },
  divider:     { height: 1, marginHorizontal: 12, marginBottom: 8 },
  chips:       { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8 },
  chipSep:     { width: 1, marginHorizontal: 8 },
  chipsQty:    { marginBottom: 0 },
  qtyBox:      { flex: 1 },
  qtyLabel:    { fontFamily: FontFamily.medium, fontSize: 9, color: '#9A9A9A', marginBottom: 2 },
  qtyVal:      { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '600' },
  adjTxt:      { fontWeight: '500', fontSize: 11 },
  actions:     { flexDirection: 'row', alignItems: 'center', marginTop: 10, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1 },
  btn:         { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
  btnView:    { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnEdit:    { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnAdj:     { backgroundColor: 'rgba(25,118,210,0.09)' },
  btnPressed: { opacity: 0.65 },
  btnTxt:     { fontFamily: FontFamily.medium, fontSize: 12, color: '#595959', fontWeight: '500' },
  btnAdjTxt:  { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#1565C0' },
});

// ── Info chip styles ───────────────────────────────────────────────────────────

const ic = StyleSheet.create({
  chip:  { flex: 1 },
  label: { fontFamily: FontFamily.medium, fontSize: 9, color: '#9A9A9A', marginBottom: 2 },
  value: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '500' },
});
