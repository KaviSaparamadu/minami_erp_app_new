import React, { useState, useMemo } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { UIIcon } from '../../components/common/UIIcon';
import { TableIcons } from '../../components/common/DataTable';
import { PageTabBar, PageTabItem } from '../../components/common/PageTabBar';
import { useNavigation } from '../../context/NavigationContext';
import { useStores } from '../../context/StoresContext';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import type { AppModule } from '../../constants/modules';

type Tab     = 'dashboard' | 'modules';
type PageTab = 'items-availability' | 'simple-grn' | 'report';

const STORE_TABS: PageTabItem[] = [
  { key: 'items-availability', label: 'Items Availability', color: '#595959' },
  { key: 'simple-grn',         label: 'Simple GRN',         color: '#595959' },
  { key: 'report',             label: 'Report',             color: '#595959' },
];

// ── Types ─────────────────────────────────────────────────────────────────────

interface StoreItem {
  id: number;
  itemCode: string;
  itemDescription: string;
  movementCategory: string;
  ongoingPurchases: number;
  reOrderMin: number | null;
  reOrderRe:  number | null;
  reOrderMax: number | null;
  stockCnt:   number;
  stockRsvd:  number;
  stockBal:   number;
  suppliersCount:  number;
  identicalGroups: number;
  category:    string;
  subCategory: string;
  grnType:     string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const MOCK_ITEMS: StoreItem[] = [
  { id: 1, itemCode: 'SP01-HL01-0000', itemDescription: 'Spare Parts Head Light Assembly',   movementCategory: 'Order', ongoingPurchases: 0, reOrderMin: null, reOrderRe: null, reOrderMax: null, stockCnt: 15, stockRsvd: 0, stockBal: 15, suppliersCount: 1, identicalGroups: 0, category: 'Spare Parts', subCategory: 'Head Light', grnType: 'Excess' },
  { id: 2, itemCode: 'SP01-D01-0002',  itemDescription: 'Spare Parts Dashboard Panel Unit',  movementCategory: 'Order', ongoingPurchases: 0, reOrderMin: null, reOrderRe: null, reOrderMax: null, stockCnt: 2,  stockRsvd: 0, stockBal: 2,  suppliersCount: 0, identicalGroups: 0, category: 'Spare Parts', subCategory: 'Dashboard', grnType: 'Excess' },
  { id: 3, itemCode: 'SP01-D01-0003',  itemDescription: 'Spare Parts Dashboard Cover Left',  movementCategory: 'Order', ongoingPurchases: 0, reOrderMin: null, reOrderRe: null, reOrderMax: null, stockCnt: 0,  stockRsvd: 0, stockBal: 0,  suppliersCount: 0, identicalGroups: 0, category: 'Spare Parts', subCategory: 'Dashboard', grnType: 'Excess' },
  { id: 4, itemCode: 'SP01-D01-0004',  itemDescription: 'Spare Parts Dashboard Cover Right', movementCategory: 'Order', ongoingPurchases: 0, reOrderMin: null, reOrderRe: null, reOrderMax: null, stockCnt: 0,  stockRsvd: 0, stockBal: 0,  suppliersCount: 0, identicalGroups: 0, category: 'Spare Parts', subCategory: 'Dashboard', grnType: 'Excess' },
  { id: 5, itemCode: 'SP01-D01-0005',  itemDescription: 'Spare Parts Dashboard Trim Strip',  movementCategory: 'Order', ongoingPurchases: 0, reOrderMin: null, reOrderRe: null, reOrderMax: null, stockCnt: 0,  stockRsvd: 0, stockBal: 0,  suppliersCount: 0, identicalGroups: 0, category: 'Spare Parts', subCategory: 'Dashboard', grnType: 'Excess' },
  { id: 6, itemCode: 'SP01-HL01-0006', itemDescription: 'Spare Parts Vehicle Fog Light Kit', movementCategory: 'Order', ongoingPurchases: 0, reOrderMin: null, reOrderRe: null, reOrderMax: null, stockCnt: 15, stockRsvd: 0, stockBal: 15, suppliersCount: 1, identicalGroups: 0, category: 'Spare Parts', subCategory: 'Head Light', grnType: 'Excess' },
];

const ALL_CATEGORIES     = ['All', 'Spare Parts', 'Electronics', 'Consumables'];
const ALL_SUB_CATEGORIES = ['All', 'Head Light', 'Dashboard', 'Engine', 'Body'];

const AVATAR_COLORS = ['#595959', '#6B6B6B', '#7D7D7D', '#8E8E8E', '#A0A0A0', '#606060'];

// ── Stock health helpers (same pattern as employee health) ────────────────────

function stockRingColor(bal: number): string {
  if (bal === 0) return '#E53935';
  if (bal < 5)   return '#FB8C00';
  if (bal < 10)  return '#FDD835';
  return '#30A84B';
}
function stockBadgeBg(bal: number): string {
  if (bal === 0) return 'rgba(229,57,53,0.12)';
  if (bal < 5)   return 'rgba(251,140,0,0.12)';
  if (bal < 10)  return 'rgba(253,216,53,0.15)';
  return 'rgba(48,168,75,0.12)';
}
function stockBadgeTxt(bal: number): string {
  if (bal === 0) return '#B71C1C';
  if (bal < 5)   return '#E65100';
  if (bal < 10)  return '#F57F17';
  return '#2E7D32';
}

// ── Info chip — same as EmployeeManagementScreen ──────────────────────────────

function InfoChip({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={ic.chip}>
      <Text style={ic.label}>{label}</Text>
      <Text style={[ic.value, { color: colors.primaryText }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// ── Item card — mirrors EmployeeCard / HumanCard structure ────────────────────

function ItemCard({
  item,
  index,
  onView,
  onAdjust,
}: {
  item: StoreItem;
  index: number;
  onView: () => void;
  onAdjust: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const initial   = item.itemCode.charAt(0).toUpperCase();
  const avatarBg  = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const ringColor = stockRingColor(item.stockBal);

  return (
    <View style={[card.wrap, isDarkMode && card.wrapDark]}>
      {/* Left accent bar */}
      <View style={[card.accent, { backgroundColor: ringColor }]} />

      <View style={card.inner}>

        {/* ── Header ── */}
        <View style={card.header}>
          {/* Avatar with stock-health ring */}
          <View style={card.avatarWrap}>
            <View style={[card.avatarRing, { borderColor: ringColor }]}>
              <View style={[card.avatar, { backgroundColor: avatarBg }]}>
                <Text style={card.avatarTxt}>{initial}</Text>
              </View>
            </View>
            {/* Stock balance badge */}
            <View style={[card.balBadge, { backgroundColor: stockBadgeBg(item.stockBal) }]}>
              <Text style={[card.balLabel, { color: stockBadgeTxt(item.stockBal) }]}>Bal </Text>
              <Text style={[card.balVal,   { color: stockBadgeTxt(item.stockBal) }]}>{item.stockBal}</Text>
            </View>
          </View>

          {/* Name block */}
          <View style={card.nameBlock}>
            <Text style={[card.name, { color: colors.primaryText }]} numberOfLines={2}>
              {item.itemDescription}
            </Text>
            <View style={card.codeBadge}>
              <Text style={card.codeTxt}>{item.itemCode}</Text>
            </View>
          </View>

          <Text style={[card.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        <View style={[card.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* ── Chips — Category | Sub-category | GRN Type ── */}
        <View style={card.chips}>
          <InfoChip label="Category" value={item.category} />
          <View style={[card.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <InfoChip label="Sub-Cat"  value={item.subCategory} />
          <View style={[card.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <InfoChip label="GRN"      value={item.grnType} />
        </View>

        <View style={[card.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* ── Stock strip ── */}
        <View style={card.stockRow}>
          {([
            ['Cnt',       String(item.stockCnt)],
            ['Rsvd',      String(item.stockRsvd)],
            ['Bal',       String(item.stockBal)],
            ['Suppliers', String(item.suppliersCount)],
          ] as [string, string][]).map(([lbl, val], i, arr) => (
            <React.Fragment key={lbl}>
              <View style={card.stockCell}>
                <Text style={card.stockLabel}>{lbl}</Text>
                <Text style={[card.stockVal, { color: colors.primaryText }]}>{val}</Text>
              </View>
              {i < arr.length - 1 && (
                <View style={[card.stockSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
              )}
            </React.Fragment>
          ))}
        </View>

        {/* ── Actions ── */}
        <View style={[card.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable onPress={onView}
            style={({ pressed }) => [card.btn, card.btnView, pressed && card.btnPressed]} hitSlop={4}>
            <TableIcons.Eye />
            <Text style={card.btnTxt}>View</Text>
          </Pressable>

          <Text style={[card.moveCat, { color: Colors.primaryHighlight }]}>{item.movementCategory}</Text>

          <View style={{ flex: 1 }} />

          <Pressable onPress={onAdjust}
            style={({ pressed }) => [card.btn, card.btnAdj, pressed && card.btnPressed]} hitSlop={4}>
            <MaterialCommunityIcons name="plus-circle-outline" size={13} color="#30A84B" />
            <Text style={card.btnAdjTxt}>Stock Adj</Text>
          </Pressable>
        </View>

      </View>
    </View>
  );
}

// ── Stock Adjustment Modal ────────────────────────────────────────────────────

// ── Modal tab icons (pure RN, same style as EmployeeFormModal) ───────────────

function ItemInfoTabIcon({ active }: { active: boolean }) {
  const c = active ? Colors.primaryHighlight : '#A0A0A0';
  return (
    <View style={mti.wrap}>
      <View style={[mti.doc, { borderColor: c }]} />
      <View style={[mti.line, { backgroundColor: c, top: 6 }]} />
      <View style={[mti.line, { backgroundColor: c, top: 10 }]} />
      <View style={[mti.photo, { backgroundColor: c }]} />
    </View>
  );
}
function AdjTabIcon({ active }: { active: boolean }) {
  const c = active ? Colors.primaryHighlight : '#A0A0A0';
  return (
    <View style={mti.wrap}>
      <View style={[mti.adjBox, { borderColor: c }]} />
      <View style={[mti.adjH, { backgroundColor: c }]} />
      <View style={[mti.adjV, { backgroundColor: c }]} />
    </View>
  );
}
function PendingTabIcon({ active }: { active: boolean }) {
  const c = active ? Colors.primaryHighlight : '#A0A0A0';
  return (
    <View style={mti.wrap}>
      <View style={[mti.clock, { borderColor: c }]} />
      <View style={[mti.clockH, { backgroundColor: c }]} />
      <View style={[mti.clockM, { backgroundColor: c }]} />
    </View>
  );
}

type AdjTab = 'info' | 'adjustment' | 'pending';
const ADJ_TABS: { id: AdjTab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'info',       label: 'Item Info',   Icon: ItemInfoTabIcon },
  { id: 'adjustment', label: 'Adjustment',  Icon: AdjTabIcon },
  { id: 'pending',    label: 'Pending',     Icon: PendingTabIcon },
];

function StockAdjModal({ item, storeCode, onClose }: {
  item: StoreItem;
  storeCode: string;
  onClose: () => void;
}) {
  const [activeTab,   setActiveTab]   = useState<AdjTab>('info');
  const [costPrice,   setCostPrice]   = useState('');
  const [excessStock, setExcessStock] = useState('');
  const [reasonNote,  setReasonNote]  = useState('');
  const ringColor = stockRingColor(item.stockBal);

  const DETAIL_ROWS: [string, string][] = [
    ['Item Code',          item.itemCode],
    ['Description',        item.itemDescription],
    ['Category',           item.category],
    ['Sub Category',       item.subCategory],
    ['GRN Type',           item.grnType],
    ['Store Code',         storeCode],
    ['Current Stock',      String(item.stockCnt)],
    ['Reserved Stock',     String(item.stockRsvd)],
    ['Available To Issue', String(item.stockBal)],
  ];

  function renderInfo() {
    return (
      <>
        {/* Image panel */}
        <View style={sa.imgCard}>
          <View style={[sa.imgMain, { borderColor: ringColor }]}>
            <MaterialCommunityIcons name="image-outline" size={44} color="rgba(0,0,0,0.13)" />
          </View>
          <View style={sa.thumbRow}>
            {[true, false, false, false].map((active, i) => (
              <View key={i} style={[sa.thumb, active && { borderColor: ringColor, borderWidth: 2 }]}>
                <MaterialCommunityIcons name="image-outline" size={11} color="rgba(0,0,0,0.18)" />
              </View>
            ))}
          </View>
        </View>

        {/* Stock health strip */}
        <View style={sa.stockStrip}>
          {([
            ['Cnt',      String(item.stockCnt),  '#1C1C1E'],
            ['Reserved', String(item.stockRsvd), '#E65100'],
            ['Balance',  String(item.stockBal),  ringColor],
          ] as [string, string, string][]).map(([lbl, val, color], i, arr) => (
            <React.Fragment key={lbl}>
              <View style={sa.stripCell}>
                <Text style={sa.stripLbl}>{lbl}</Text>
                <Text style={[sa.stripVal, { color }]}>{val}</Text>
              </View>
              {i < arr.length - 1 && <View style={sa.stripSep} />}
            </React.Fragment>
          ))}
        </View>

        {/* Detail rows */}
        <View style={sa.detailCard}>
          {DETAIL_ROWS.map(([label, val], i) => (
            <View key={label} style={[sa.detailRow, i < DETAIL_ROWS.length - 1 && sa.detailRowBorder]}>
              <Text style={sa.detailLbl}>{label}</Text>
              <Text style={sa.detailVal} numberOfLines={2}>{val}</Text>
            </View>
          ))}
        </View>
      </>
    );
  }

  function renderAdjustment() {
    return (
      <View style={sa.detailCard}>
        {/* Cost Price */}
        <View style={sa.adjField}>
          <Text style={sa.adjLabel}>Cost Price</Text>
          <View style={sa.adjInputRow}>
            <TextInput
              value={costPrice} onChangeText={setCostPrice}
              keyboardType="numeric" style={sa.adjInput}
              placeholder="0.00" placeholderTextColor="#BBBBC0"
            />
            <View style={sa.spinnerCol}>
              <Pressable hitSlop={8} onPress={() => setCostPrice(p => String((parseFloat(p || '0') + 0.01).toFixed(2)))}>
                <MaterialCommunityIcons name="chevron-up"   size={18} color="#888" />
              </Pressable>
              <Pressable hitSlop={8} onPress={() => setCostPrice(p => String(Math.max(0, parseFloat(p || '0') - 0.01).toFixed(2)))}>
                <MaterialCommunityIcons name="chevron-down" size={18} color="#888" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Excess Stock */}
        <View style={sa.adjField}>
          <Text style={sa.adjLabel}>Excess Stock</Text>
          <View style={sa.adjInputRow}>
            <TextInput
              value={excessStock} onChangeText={setExcessStock}
              keyboardType="numeric" style={sa.adjInput}
              placeholder="0" placeholderTextColor="#BBBBC0"
            />
            <View style={sa.spinnerCol}>
              <Pressable hitSlop={8} onPress={() => setExcessStock(p => String(parseInt(p || '0', 10) + 1))}>
                <MaterialCommunityIcons name="chevron-up"   size={18} color="#888" />
              </Pressable>
              <Pressable hitSlop={8} onPress={() => setExcessStock(p => String(Math.max(0, parseInt(p || '0', 10) - 1)))}>
                <MaterialCommunityIcons name="chevron-down" size={18} color="#888" />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Reason Note */}
        <View style={[sa.adjField, { borderBottomWidth: 0 }]}>
          <Text style={sa.adjLabel}>Excess Reason Note</Text>
          <TextInput
            value={reasonNote} onChangeText={setReasonNote}
            style={[sa.adjInput, { height: 70, textAlignVertical: 'top', paddingTop: 4 }]}
            placeholder="Enter reason…" placeholderTextColor="#BBBBC0"
            multiline
          />
        </View>

        {/* Add Makers Serial */}
        <Pressable style={({ pressed }) => [sa.serialBtn, pressed && { opacity: 0.8 }]}>
          <MaterialCommunityIcons name="barcode" size={14} color="#FFF" />
          <Text style={sa.serialBtnTxt}>Add Makers Serial</Text>
        </Pressable>
      </View>
    );
  }

  function renderPending() {
    return (
      <View style={sa.pendingWrap}>
        <View style={sa.pendingIconRing}>
          <MaterialCommunityIcons name="clock-outline" size={28} color="#9090A0" />
        </View>
        <Text style={sa.pendingTitle}>Pending Stock Adjustment</Text>
        <Text style={sa.pendingSubtxt}>No pending adjustments for this item</Text>
      </View>
    );
  }

  const tabContent: Record<AdjTab, () => React.ReactNode> = {
    info:       renderInfo,
    adjustment: renderAdjustment,
    pending:    renderPending,
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={sa.modalOverlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={sa.cardWrapper}>

            {/* Close button — centred on top border, same as EmployeeFormModal */}
            <Pressable onPress={onClose}
              style={({ pressed }) => [sa.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={16}>
              <View style={sa.xL} /><View style={sa.xR} />
            </Pressable>

            <View style={sa.container}>

              {/* ── Header ── */}
              <View style={sa.header}>
                <View style={sa.headerIcon}>
                  <MaterialCommunityIcons name="package-variant" size={18} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={sa.headerTitle}>Stock Adjustment</Text>
                  <Text style={sa.headerSub}>{ADJ_TABS.find(t => t.id === activeTab)?.label}</Text>
                </View>
                <View style={[sa.balBadge, { backgroundColor: stockBadgeBg(item.stockBal) }]}>
                  <Text style={[sa.balTxt, { color: stockBadgeTxt(item.stockBal) }]}>
                    Bal {item.stockBal}
                  </Text>
                </View>
              </View>

              {/* ── Tab bar ── */}
              <View style={sa.tabBarWrap}>
                {ADJ_TABS.map(tab => {
                  const active = activeTab === tab.id;
                  return (
                    <Pressable key={tab.id} onPress={() => setActiveTab(tab.id)}
                      style={[sa.tabBtn, active && sa.tabBtnActive]}>
                      <tab.Icon active={active} />
                      <Text style={[sa.tabLbl, active && sa.tabLblActive]}>{tab.label}</Text>
                      {active && <View style={sa.tabUnderline} />}
                    </Pressable>
                  );
                })}
              </View>

              {/* ── Tab content ── */}
              <ScrollView
                contentContainerStyle={sa.form}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {tabContent[activeTab]()}
                <View style={{ height: 20 }} />
              </ScrollView>

              {/* ── Footer ── */}
              {activeTab === 'adjustment' && (
                <View style={sa.footer}>
                  <Pressable style={({ pressed }) => [sa.saveBtn, pressed && { opacity: 0.85 }]}>
                    <Text style={sa.saveTxt}>Save Adjustment</Text>
                  </Pressable>
                </View>
              )}

            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Items Availability ────────────────────────────────────────────────────────

function DropdownSelect({
  label,
  value,
  options,
  onChange,
  isDarkMode,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  isDarkMode: boolean;
}) {
  const [open, setOpen] = useState(false);
  const isFiltered = value !== 'All';
  return (
    <View style={dd.wrap}>
      <Pressable
        onPress={() => setOpen(o => !o)}
        style={[dd.trigger, isDarkMode && dd.triggerDark, isFiltered && dd.triggerActive]}>
        <MaterialCommunityIcons
          name="filter-variant"
          size={10}
          color={isFiltered ? '#E91E63' : (isDarkMode ? '#888' : '#AAA')}
        />
        <Text
          style={[dd.triggerTxt, isDarkMode && { color: '#D0D0D0' }, isFiltered && dd.triggerTxtActive]}
          numberOfLines={1}>
          {isFiltered ? value : label}
        </Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={11}
          color={isFiltered ? '#E91E63' : (isDarkMode ? '#888' : '#AAA')}
        />
      </Pressable>

      {open && (
        <View style={[dd.list, isDarkMode && dd.listDark]}>
          {options.map((opt, idx) => {
            const selected = opt === value;
            return (
              <Pressable
                key={opt}
                onPress={() => { onChange(opt); setOpen(false); }}
                style={({ pressed }) => [
                  dd.item,
                  idx < options.length - 1 && dd.itemBorder,
                  pressed && dd.itemPressed,
                  selected && dd.itemSelected,
                  isDarkMode && dd.itemDark,
                  selected && dd.itemSelected,
                ]}>
                <Text style={[dd.itemTxt, isDarkMode && { color: '#D0D0D0' }, selected && dd.itemTxtSelected]}>
                  {opt}
                </Text>
                {selected && (
                  <View style={dd.checkCircle}>
                    <MaterialCommunityIcons name="check" size={9} color="#FFF" />
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

function ItemsAvailabilityView({ storeCode }: { storeCode: string }) {
  const { colors, isDarkMode } = useTheme();
  const [category,    setCategory]    = useState('All');
  const [subCategory, setSubCategory] = useState('All');
  const [search,      setSearch]      = useState('');
  const [adjItem,     setAdjItem]     = useState<StoreItem | null>(null);

  const filtered = useMemo(() => MOCK_ITEMS.filter(item => {
    const catOk = category    === 'All' || item.category    === category;
    const subOk = subCategory === 'All' || item.subCategory === subCategory;
    const q     = search.trim().toLowerCase();
    const srOk  = q === '' ||
      item.itemCode.toLowerCase().includes(q) ||
      item.itemDescription.toLowerCase().includes(q);
    return catOk && subOk && srOk;
  }), [category, subCategory, search]);

  return (
    <View style={{ flex: 1 }}>

      {/* ── Store strip ── */}
      <View style={[strip.bar, isDarkMode && { backgroundColor: '#1C1C1E', borderBottomColor: '#2C2C2E' }]}>
        <View style={strip.accent} />
        <View style={{ flex: 1 }}>
          <View style={strip.codeRow}>
            <Text style={[strip.code, { color: colors.primaryText }]}>{storeCode}</Text>
            <Pressable>
              <Text style={strip.changeTxt}>Change Stores</Text>
            </Pressable>
          </View>
          <Text style={[strip.sub, { color: colors.placeholder }]}>Tokyo · Minami Lanka</Text>
        </View>
        <Pressable style={({ pressed }) => [strip.scanBtn, pressed && { opacity: 0.8 }]}>
          <MaterialCommunityIcons name="qrcode-scan" size={13} color="#FFF" />
          <Text style={strip.scanTxt}>Scan QR</Text>
        </Pressable>
      </View>

      {/* ── Filter + Search ── */}
      <View style={lv.searchFilterContainer}>

        {/* Filters row */}
        <View style={lv.filterSearchRow}>
          <DropdownSelect
            label="All Categories"
            value={category}
            options={ALL_CATEGORIES}
            onChange={setCategory}
            isDarkMode={isDarkMode}
          />
          <DropdownSelect
            label="All Sub-categories"
            value={subCategory}
            options={ALL_SUB_CATEGORIES}
            onChange={setSubCategory}
            isDarkMode={isDarkMode}
          />
        </View>

        {/* Search bar — below filters */}
        <View style={[lv.searchBar, isDarkMode && { borderBottomColor: '#3A3A3C' }]}>
            <UIIcon name="search" size={13} color="#8E8E93" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search…"
              placeholderTextColor="#8E8E93"
              style={[lv.searchInput, { color: colors.primaryText }]}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} style={lv.clearBtn} hitSlop={8}>
                <View style={[lv.clearX1, { backgroundColor: colors.placeholder }]} />
                <View style={[lv.clearX2, { backgroundColor: colors.placeholder }]} />
              </Pressable>
            )}
        </View>

      </View>

      {/* ── Card list ── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={lv.listContent}
        showsVerticalScrollIndicator={false}>

        {filtered.length === 0 ? (
          <View style={lv.emptyWrap}>
            <View style={lv.emptyIcon}>
              <View style={lv.emptyHead} />
              <View style={lv.emptyBody} />
            </View>
            <Text style={[lv.emptyTitle, { color: colors.primaryText }]}>
              {search.trim() ? 'No matches found' : 'No items yet'}
            </Text>
            <Text style={[lv.emptySubText, { color: colors.placeholder }]}>
              {search.trim() ? `Nothing matched "${search}"` : 'No items in this store yet'}
            </Text>
            {search.trim().length > 0 && (
              <Pressable onPress={() => setSearch('')} style={lv.clearSearchBtn}>
                <Text style={lv.clearSearchTxt}>Clear search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          filtered.map((item, idx) => (
            <ItemCard
              key={item.id}
              item={item}
              index={idx}
              onView={() => {}}
              onAdjust={() => setAdjItem(item)}
            />
          ))
        )}
      </ScrollView>

      {adjItem != null && (
        <StockAdjModal item={adjItem!} storeCode={storeCode} onClose={() => setAdjItem(null)} />
      )}
    </View>
  );
}

// ── Placeholder ───────────────────────────────────────────────────────────────

function PlaceholderView({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  const { colors } = useTheme();
  return (
    <View style={ph.wrap}>
      <View style={ph.iconCircle}>
        <MaterialCommunityIcons name={icon} size={28} color="rgba(89,89,89,0.4)" />
      </View>
      <Text style={[ph.title, { color: colors.primaryText }]}>{title}</Text>
      <Text style={[ph.sub,   { color: colors.placeholder }]}>{subtitle}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function StoreDetailScreen() {
  const { navigate, params } = useNavigation();
  const { stores } = useStores();
  const [tab,     setTab]     = useState<Tab>('modules');
  const [pageTab, setPageTab] = useState<PageTab>('items-availability');

  const storeId   = params?.storeId as string | undefined;
  const store     = stores.find(s => s.id === storeId);
  const title     = store?.storeName || store?.storeNo || 'Store';
  const storeCode = store ? `${store.storeNo} - ${store.storeCode}` : 'Store';

  return (
    <SubModuleLayout
      parentModuleId="4"
      title={title}
      showBack
      activeTab={tab}
      onTabChange={setTab}
      onModulePress={(m: AppModule) => navigate('ModuleDetail', { moduleId: m.id })}
      showSubmodulesTab={false}
      showSubTab={false}
      selfManagesScroll={true}>

      <View style={scr.container}>
        {tab !== 'dashboard' && (
          <View style={scr.tabBarWrap}>
            <PageTabBar
              tabs={STORE_TABS}
              active={pageTab}
              onChange={(t) => { setPageTab(t as PageTab); setTab('modules'); }}
              variant="segment"
            />
          </View>
        )}

        <View style={[scr.panel, tab !== 'dashboard' && scr.panelOffset]}>
          {tab === 'dashboard' ? (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
              <DashboardView />
            </ScrollView>
          ) : pageTab === 'items-availability' ? (
            <ItemsAvailabilityView storeCode={storeCode} />
          ) : pageTab === 'simple-grn' ? (
            <PlaceholderView icon="clipboard-list-outline" title="Simple GRN"
              subtitle="Goods Received Notes for this store will appear here." />
          ) : (
            <PlaceholderView icon="chart-bar" title="Report"
              subtitle="Store reports and analytics will appear here." />
          )}
        </View>
      </View>
    </SubModuleLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const scr = StyleSheet.create({
  container:   { flex: 1, paddingTop: 8 },
  tabBarWrap:  { paddingHorizontal: Spacing.md },
  panel:       { flex: 1 },
  panelOffset: { marginTop: 8 },
});

const ph = StyleSheet.create({
  wrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: 10 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title:      { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'center' },
  sub:        { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
});

// Store strip
const strip = StyleSheet.create({
  bar:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBEBF0', gap: 10 },
  accent:    { width: 4, height: 40, backgroundColor: '#B71C1C', borderRadius: 2 },
  code:      { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },
  sub:       { fontFamily: FontFamily.regular, fontSize: 10, marginTop: 1 },
  scanBtn:   { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7, backgroundColor: '#595959' },
  scanTxt:   { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#FFF' },
  codeRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  changeRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: 4 },
  changeTxt:      { fontFamily: FontFamily.medium, fontSize: 9, color: Colors.primaryHighlight, fontStyle: 'italic' },
  storeCodeRight: { fontFamily: FontFamily.regular, fontSize: 9, fontStyle: 'italic' },
});

// Search + filter — exact lv from EmployeeManagementScreen
const lv = StyleSheet.create({
  searchFilterContainer: { paddingHorizontal: Spacing.md, paddingTop: 5, paddingBottom: 4 },
  searchAndFilterRow:    { flexDirection: 'column', gap: 4 },

  sectionHeader: { paddingTop: 0, paddingBottom: 2 },
  sectionTitle:  { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },

  searchWrapper: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4, backgroundColor: 'transparent' },
  searchBar:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 4, height: 32, borderBottomWidth: 1, borderBottomColor: '#D0D0D8', backgroundColor: 'transparent' },
  searchInput:   { flex: 1, fontFamily: FontFamily.regular, fontSize: 11, paddingVertical: 0 },
  clearBtn:      { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  clearX1:       { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg'  }] },
  clearX2:       { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  pillRow:          { flexDirection: 'row', gap: 6 },
  pill:             { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#E0E0E0' },
  pillActive:       { backgroundColor: '#E91E63', borderColor: 'transparent' },
  pillTxt:          { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500', color: '#5A5A62' },
  pillTxtActive:    { color: '#FFFFFF', fontFamily: FontFamily.bold, fontWeight: '600' },
  pillBadge:        { backgroundColor: '#D0D0D0', borderRadius: 8, paddingHorizontal: 5, minWidth: 16, alignItems: 'center' },
  pillBadgeActive:  { backgroundColor: 'rgba(255,255,255,0.25)' },
  pillBadgeTxt:     { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', color: '#666666' },
  pillBadgeTxtActive: { color: '#FFF', fontWeight: '700' },

  searchDropRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dropRow:          { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 5 },
  filterSearchRow:  { flexDirection: 'row', alignItems: 'flex-end', gap: 6 },

  listContent:   { paddingHorizontal: Spacing.md, paddingTop: 8, paddingBottom: 100, gap: 10 },

  emptyWrap:     { alignItems: 'center', paddingVertical: 50, paddingHorizontal: Spacing.xl, gap: 8 },
  emptyIcon:     { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyHead:     { position: 'absolute', top: 12, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(89,89,89,0.25)' },
  emptyBody:     { position: 'absolute', bottom: 12, width: 26, height: 14, borderTopLeftRadius: 13, borderTopRightRadius: 13, backgroundColor: 'rgba(89,89,89,0.25)' },
  emptyTitle:    { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySubText:  { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  clearSearchBtn:{ marginTop: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryHighlight },
  clearSearchTxt:{ fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryHighlight },
});

// Item card — mirrors ec (EmployeeCard) styles exactly
const card = StyleSheet.create({
  wrap:     { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAF0', shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  wrapDark: { backgroundColor: '#1C1C1E', borderColor: '#2A2A2C' },
  accent:   { width: 4 },
  inner:    { flex: 1 },

  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 12 },
  avatarWrap: { alignItems: 'center', gap: 4, flexShrink: 0 },
  avatarRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarTxt:  { fontFamily: FontFamily.bold, fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  balBadge:   { flexDirection: 'row', alignItems: 'center', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  balLabel:   { fontFamily: FontFamily.regular, fontSize: 7, fontStyle: 'italic' },
  balVal:     { fontFamily: FontFamily.bold, fontSize: 7, fontWeight: '700' },

  nameBlock:  { flex: 1, gap: 4 },
  name:       { fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  codeBadge:  { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(89,89,89,0.08)' },
  codeTxt:    { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#595959' },

  idx:        { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500', alignSelf: 'flex-start', marginTop: 2 },
  divider:    { height: 1 },

  chips:      { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' },
  chipSep:    { width: 1, height: 34, marginHorizontal: 10 },

  stockRow:   { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 10, alignItems: 'center' },
  stockCell:  { flex: 1, alignItems: 'center', gap: 3 },
  stockLabel: { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#9090A0' },
  stockVal:   { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700' },
  stockSep:   { width: 1, height: 30, marginHorizontal: 4 },

  actions:    { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  btn:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnView:    { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnAdj:     { backgroundColor: 'rgba(48,168,75,0.10)' },
  btnPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  btnTxt:     { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#595959' },
  btnAdjTxt:  { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#30A84B' },
  moveCat:    { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', textDecorationLine: 'underline' },
});

// Info chip — same as ec.chip
const ic = StyleSheet.create({
  chip:  { flex: 1, gap: 4 },
  label: { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#9090A0' },
  value: { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600' },
});

// Stock Adjustment modal — matches EmployeeFormModal structure exactly
const sa = StyleSheet.create({
  // Modal structure
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 12 },
  cardWrapper:     { flex: 1, maxHeight: '95%', width: '100%' },
  container:       { flex: 1, backgroundColor: '#F5F5F7', borderRadius: 10, overflow: 'hidden' },
  closeBtn:        { position: 'absolute', top: -18, right: -5, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center' },
  xL:              { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '45deg'  }] },
  xR:              { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  // Header
  header:          { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 16, paddingVertical: 12, gap: 10, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  headerIcon:      { width: 38, height: 38, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#595959' },
  headerSub:       { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder, marginTop: 2 },
  balBadge:        { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  balTxt:          { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700' },

  // Tab bar
  tabBarWrap:      { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  tabBtn:          { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 4, position: 'relative' },
  tabBtnActive:    {},
  tabLbl:          { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0' },
  tabLblActive:    { fontFamily: FontFamily.bold, fontWeight: '700', color: Colors.primaryHighlight },
  tabUnderline:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: 2.5, backgroundColor: Colors.primaryHighlight, borderRadius: 2 },

  // Scrollable form area
  form:            { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 20, gap: 10 },

  // Image panel (info tab)
  imgCard:         { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, gap: 8, shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  imgMain:         { height: 100, backgroundColor: '#F0F0F5', borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#DCDCE0' },
  thumbRow:        { flexDirection: 'row', gap: 6 },
  thumb:           { flex: 1, height: 30, backgroundColor: '#EAEAF0', borderRadius: 6, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#D8D8E0' },

  // Stock health strip
  stockStrip:      { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  stripCell:       { flex: 1, alignItems: 'center', gap: 3 },
  stripLbl:        { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: '#9090A0' },
  stripVal:        { fontFamily: FontFamily.bold, fontSize: 16, fontWeight: '700' },
  stripSep:        { width: 1, backgroundColor: '#EBEBF0' },

  // Detail rows card (info tab) & adjustment fields wrapper
  detailCard:      { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  detailRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: 10 },
  detailRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  detailLbl:       { width: 110, fontFamily: FontFamily.regular, fontSize: 11, color: '#8E8E93' },
  detailVal:       { flex: 1, fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#1C1C1E', textAlign: 'right' },

  // Adjustment fields
  adjField:        { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5', gap: 6 },
  adjLabel:        { fontFamily: FontFamily.regular, fontSize: 11, color: '#8E8E93' },
  adjInputRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#DCDCE0' },
  adjInput:        { flex: 1, fontFamily: FontFamily.medium, fontSize: 13, fontWeight: '600', color: '#1C1C1E', paddingVertical: 8 },
  spinnerCol:      { gap: 0 },
  serialBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: 8, backgroundColor: '#595959', marginTop: 10, marginHorizontal: 14 },
  serialBtnTxt:    { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#FFF' },

  // Pending state
  pendingWrap:     { alignItems: 'center', paddingVertical: 50, gap: 10 },
  pendingIconRing: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(144,144,160,0.10)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  pendingTitle:    { fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  pendingSubtxt:   { fontFamily: FontFamily.regular, fontSize: 12, color: '#9090A0' },

  // Footer
  footer:          { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#E8E8EE', backgroundColor: '#F5F5F7' },
  saveBtn:         { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 13, borderRadius: 10, backgroundColor: Colors.primaryHighlight },
  saveTxt:         { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
});

// Tab icon styles — mirrors EmployeeFormModal icon stylesheet
const mti = StyleSheet.create({
  wrap:   { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  // ItemInfo — document with lines + photo corner
  doc:    { position: 'absolute', width: 13, height: 16, borderWidth: 1.5, borderRadius: 2 },
  line:   { position: 'absolute', left: 4, right: 3, height: 1.5, borderRadius: 1 },
  photo:  { position: 'absolute', top: 3, left: 3, width: 4, height: 4, borderRadius: 1 },
  // Adjustment — box with plus sign
  adjBox: { width: 14, height: 14, borderWidth: 1.5, borderRadius: 3 },
  adjH:   { position: 'absolute', width: 8, height: 1.5, borderRadius: 1 },
  adjV:   { position: 'absolute', width: 1.5, height: 8, borderRadius: 1 },
  // Pending — clock face
  clock:  { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5 },
  clockH: { position: 'absolute', width: 4, height: 1.5, borderRadius: 1, top: 9, left: 9 },
  clockM: { position: 'absolute', width: 1.5, height: 4, borderRadius: 1, top: 5, left: 9 },
});

// Dropdown select
const dd = StyleSheet.create({
  wrap:             { position: 'relative', zIndex: 10, flex: 1 },
  filterLabel:      { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: '#9090A0', marginBottom: 3 },
  trigger:          { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 7, height: 24, borderRadius: 5, borderWidth: 1, borderColor: '#DCDCE0', backgroundColor: '#F8F8FA' },
  triggerDark:      { backgroundColor: '#2C2C2E', borderColor: '#3A3A3C' },
  triggerActive:    { borderColor: '#E91E63', backgroundColor: 'rgba(233,30,99,0.05)' },
  triggerTxt:       { flex: 1, fontFamily: FontFamily.regular, fontSize: 9, color: '#555', fontWeight: '500' },
  triggerTxtActive: { color: '#E91E63', fontWeight: '600' },
  list:             { position: 'absolute', top: 28, left: 0, right: 0, backgroundColor: '#FFFFFF', borderRadius: 7, borderWidth: 1, borderColor: '#DCDCE0', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 10, zIndex: 999 },
  listDark:         { backgroundColor: '#2C2C2E', borderColor: '#3A3A3C' },
  item:             { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  itemBorder:       { borderBottomWidth: 1, borderBottomColor: '#F0F0F4' },
  itemDark:         { borderBottomColor: '#3A3A3C' },
  itemPressed:      { backgroundColor: 'rgba(0,0,0,0.04)' },
  itemSelected:     { backgroundColor: '#595959' },
  itemTxt:          { flex: 1, fontFamily: FontFamily.regular, fontSize: 10, color: '#333' },
  itemTxtSelected:  { color: '#FFFFFF', fontWeight: '600' },
  checkCircle:      { width: 16, height: 16, borderRadius: 8, backgroundColor: '#30A84B', alignItems: 'center', justifyContent: 'center' },
});
