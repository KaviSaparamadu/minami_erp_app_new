import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  LayoutAnimation,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const SCREEN_H = Dimensions.get('window').height;
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
import { calcSellPrice } from '../../store/itemSellingStore';

type Tab     = 'dashboard' | 'modules';
type PageTab = 'items-availability' | 'simple-grn' | 'report' | 'items';

const STORE_TABS: PageTabItem[] = [
  { key: 'items-availability', label: 'Items Availability', color: '#595959' },
  { key: 'items',              label: 'Items',              color: '#595959' },
  { key: 'simple-grn',        label: 'Simple GRN',         color: '#595959' },
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

interface SearchableItem {
  code:          string;
  description:   string;
  compatibility: string;
}

type SerialType = 'auto' | 'manufacture' | 'none';

interface CreateItemForm {
  category:    string;
  subCategory: string;
  brand:       string;
  itemName:    string;
  groupName:   string;
  packLength:  string;
  packBreadth: string;
  packHeight:  string;
  variantType: string;
  variantAttr: string;
  itemGeneric: string;
  serialType:  SerialType;
  sameAsDesc:  boolean;
  salesName:   string;
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

// ── Form health helpers ───────────────────────────────────────────────────────

const STORE_ITEM_HEALTH: Array<{ key: keyof StoreItem; label: string }> = [
  { key: 'itemCode',        label: 'Item Code' },
  { key: 'itemDescription', label: 'Description' },
  { key: 'category',        label: 'Category' },
  { key: 'subCategory',     label: 'Sub-Category' },
  { key: 'grnType',         label: 'GRN Type' },
  { key: 'movementCategory', label: 'Movement Category' },
];
function calcItemFormHealth(item: StoreItem): number {
  const filled = STORE_ITEM_HEALTH.filter(f => !!item[f.key]).length;
  return Math.round((filled / STORE_ITEM_HEALTH.length) * 100);
}
function itemFormRingColor(pct: number): string {
  return pct < 25 ? '#E53935' : pct < 50 ? '#FB8C00' : pct < 75 ? '#FDD835' : '#30A84B';
}

// stock helpers kept for accent bar and adjustment modal
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

// ── Item form health modal ────────────────────────────────────────────────────

function ItemFormHealthModal({ visible, item, onClose }: {
  visible: boolean; item: StoreItem; onClose: () => void;
}) {
  const pct         = calcItemFormHealth(item);
  const ringColor   = itemFormRingColor(pct);
  const isComplete  = pct === 100;
  const filledCount = STORE_ITEM_HEALTH.filter(f => !!item[f.key]).length;
  const totalCount  = STORE_ITEM_HEALTH.length;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={ifhm.overlay} onPress={onClose}>
        <Pressable style={ifhm.card} onPress={() => {}}>
          <View style={[ifhm.topBar, { backgroundColor: ringColor }]} />
          <View style={ifhm.header}>
            <View style={[ifhm.ring, { borderColor: ringColor }]}>
              <Text style={[ifhm.ringPct, { color: ringColor }]}>{pct}%</Text>
            </View>
            <View style={ifhm.headerText}>
              <Text style={ifhm.title}>Form Health</Text>
              <Text style={ifhm.sub}>{filledCount} of {totalCount} fields complete</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={18} color="#9090A0" />
            </Pressable>
          </View>
          {isComplete ? (
            <View style={ifhm.completeBanner}>
              <MaterialCommunityIcons name="check-decagram" size={15} color="#2E7D32" />
              <Text style={ifhm.completeText}>Complete — all required fields are filled</Text>
            </View>
          ) : (
            <View style={ifhm.warnBanner}>
              <MaterialCommunityIcons name="alert-outline" size={14} color="#E65100" />
              <Text style={ifhm.warnText}>{totalCount - filledCount} field(s) need attention</Text>
            </View>
          )}
          <ScrollView style={ifhm.list} showsVerticalScrollIndicator={false}>
            {STORE_ITEM_HEALTH.map(({ key, label }) => {
              const filled = !!item[key];
              const val    = item[key];
              return (
                <View key={key} style={ifhm.row}>
                  <MaterialCommunityIcons
                    name={filled ? 'check-circle' : 'alert-circle-outline'}
                    size={16} color={filled ? '#30A84B' : '#FB8C00'} />
                  <View style={ifhm.rowBody}>
                    <Text style={ifhm.rowLabel}>{label}</Text>
                    {filled
                      ? <Text style={ifhm.rowValue} numberOfLines={1}>{String(val)}</Text>
                      : <Text style={ifhm.rowMissing}>Not filled</Text>}
                  </View>
                </View>
              );
            })}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
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
  const pct         = calcItemFormHealth(item);
  const formRing    = itemFormRingColor(pct);
  const stockAccent = stockRingColor(item.stockBal);
  const [showHealth, setShowHealth] = useState(false);

  return (
    <View style={[card.wrap, isDarkMode && card.wrapDark]}>
      {/* Left accent bar — keeps stock colour */}
      <View style={[card.accent, { backgroundColor: stockAccent }]} />

      <View style={card.inner}>

        {/* ── Header ── */}
        <View style={card.header}>
          {/* Avatar with form-health ring */}
          <Pressable onPress={() => setShowHealth(true)} style={card.avatarWrap} hitSlop={6}>
            <View style={[card.avatarRing, { borderColor: formRing }]}>
              <View style={card.avatar}>
                <Text style={[card.avatarPct, { color: formRing }]}>{pct}%</Text>
              </View>
            </View>
          </Pressable>

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
      <ItemFormHealthModal visible={showHealth} item={item} onClose={() => setShowHealth(false)} />
    </View>
  );
}

// ── Stock Adjustment Modal ────────────────────────────────────────────────────

// ── Modal tab icons (pure RN, same style as EmployeeFormModal) ───────────────

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

type AdjTab = 'adjustment' | 'pending';
const ADJ_TABS: { id: AdjTab; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'adjustment', label: 'Adjustment', Icon: AdjTabIcon },
  { id: 'pending',    label: 'Pending',    Icon: PendingTabIcon },
];

const ITEM_IMAGE_MAP: Record<string, string[]> = {
  'Head Light': [
    'https://loremflickr.com/400/400/car,headlight?lock=11',
    'https://loremflickr.com/400/400/car,headlight?lock=12',
    'https://loremflickr.com/400/400/car,headlight?lock=13',
    'https://loremflickr.com/400/400/car,headlight?lock=14',
    'https://loremflickr.com/400/400/car,headlight?lock=15',
  ],
  'Dashboard': [
    'https://loremflickr.com/400/400/car,dashboard?lock=21',
    'https://loremflickr.com/400/400/car,dashboard?lock=22',
    'https://loremflickr.com/400/400/car,dashboard?lock=23',
    'https://loremflickr.com/400/400/car,dashboard?lock=24',
    'https://loremflickr.com/400/400/car,dashboard?lock=25',
  ],
  'Engine': [
    'https://loremflickr.com/400/400/car,engine?lock=31',
    'https://loremflickr.com/400/400/car,engine?lock=32',
    'https://loremflickr.com/400/400/car,engine?lock=33',
    'https://loremflickr.com/400/400/car,engine?lock=34',
    'https://loremflickr.com/400/400/car,engine?lock=35',
  ],
  'Body': [
    'https://loremflickr.com/400/400/car,body,panel?lock=41',
    'https://loremflickr.com/400/400/car,body,panel?lock=42',
    'https://loremflickr.com/400/400/car,body,panel?lock=43',
    'https://loremflickr.com/400/400/car,body,panel?lock=44',
    'https://loremflickr.com/400/400/car,body,panel?lock=45',
  ],
};

const FALLBACK_IMAGES = [
  'https://loremflickr.com/400/400/car,spare,parts?lock=51',
  'https://loremflickr.com/400/400/car,spare,parts?lock=52',
  'https://loremflickr.com/400/400/car,spare,parts?lock=53',
  'https://loremflickr.com/400/400/car,spare,parts?lock=54',
  'https://loremflickr.com/400/400/car,spare,parts?lock=55',
];

function getDemoImages(subCategory: string): string[] {
  return ITEM_IMAGE_MAP[subCategory] ?? FALLBACK_IMAGES;
}

// ── GRN record type + mock data ──────────────────────────────────────────────

interface GrnRecord {
  grnNo:    string;
  date:     string;
  supplier: string;
  mainCost: string;
  loseCost: string;
  mainSell: string;
  loseSell: string;
  mainQty:  string;
  loseQty:  string;
  sold:     number;
  damaged:  number;
  reserved: number;
}

const MOCK_GRN: GrnRecord[] = [
  { grnNo: 'GRN-2025-001', date: '15 Jan 2025', supplier: 'Prime Auto Parts Co.',  mainCost: '1,250.00', loseCost: '12.50', mainSell: '1,450.00', loseSell: '14.50', mainQty: '50', loseQty: '500', sold: 1,  damaged: 0, reserved: 2 },
  { grnNo: 'GRN-2024-089', date: '20 Nov 2024', supplier: 'Auto Supply Ltd.',       mainCost: '1,180.00', loseCost: '11.80', mainSell: '1,380.00', loseSell: '13.80', mainQty: '40', loseQty: '400', sold: 0,  damaged: 0, reserved: 0 },
  { grnNo: 'GRN-2024-044', date: '05 Aug 2024', supplier: 'Prime Auto Parts Co.',   mainCost: '1,100.00', loseCost: '11.00', mainSell: '1,300.00', loseSell: '13.00', mainQty: '60', loseQty: '600', sold: 12, damaged: 2, reserved: 0 },
  { grnNo: 'GRN-2023-128', date: '12 Dec 2023', supplier: 'Minami Trade House',     mainCost: '1,050.00', loseCost: '10.50', mainSell: '1,250.00', loseSell: '12.50', mainQty: '35', loseQty: '350', sold: 35, damaged: 0, reserved: 0 },
];

interface AdjRecord {
  id:          string;
  type:        'excess' | 'damage';
  timestamp:   string;
  stockBefore: number;
  stockAfter:  number;
  qty:         number;
  damageType?: string;
  reason?:     string;
  grnNo?:      string;
  supplier?:   string;
  mainQty?:    number;
  loseQty?:    number;
  mainCostPrice?: string;
  mainSellPrice?: string;
  grnBreakdown?: Array<{ grnNo: string; dmgQty: number; prevAvail: number; newBalance: number }>;
}

const MOCK_ADJ_HISTORY: AdjRecord[] = [
  {
    id: 'ADJ-2025-004', type: 'excess', timestamp: '19 May 2025, 09:15 AM',
    stockBefore: 12, stockAfter: 17, qty: 5,
    grnNo: 'GRN-2025-001', supplier: 'Prime Auto Parts Co.',
    mainQty: 5, loseQty: 50, mainCostPrice: '1,250.00', mainSellPrice: '1,450.00',
  },
  {
    id: 'ADJ-2025-003', type: 'damage', timestamp: '10 Apr 2025, 02:30 PM',
    stockBefore: 17, stockAfter: 15, qty: 2,
    damageType: 'Physical', reason: 'Dropped during warehouse transfer.',
    grnBreakdown: [{ grnNo: 'GRN-2024-044', dmgQty: 2, prevAvail: 46, newBalance: 44 }],
  },
  {
    id: 'ADJ-2025-002', type: 'excess', timestamp: '20 Feb 2025, 11:00 AM',
    stockBefore: 10, stockAfter: 12, qty: 2,
    grnNo: 'GRN-2024-089', supplier: 'Auto Supply Ltd.',
    mainQty: 2, loseQty: 20, mainCostPrice: '1,180.00', mainSellPrice: '1,380.00',
  },
  {
    id: 'ADJ-2025-001', type: 'damage', timestamp: '15 Jan 2025, 04:45 PM',
    stockBefore: 12, stockAfter: 10, qty: 2,
    damageType: 'Water', reason: 'Water damage from roof leak in storage area.',
    grnBreakdown: [
      { grnNo: 'GRN-2025-001', dmgQty: 1, prevAvail: 47, newBalance: 46 },
      { grnNo: 'GRN-2024-044', dmgQty: 1, prevAvail: 48, newBalance: 47 },
    ],
  },
];

const SEARCHABLE_ITEMS: SearchableItem[] = [
  { code: 'SP01-HL01-0000', description: 'Spare Parts Head Light HINO SCOOP (L-h-s)',          compatibility: 'DUTRO – KK BU306M – 1999/05 to 2004-06 Led Kdsw23dcsd' },
  { code: 'SP01-D01-0002',  description: 'Spare Parts Dashboard HINO PROFIA (Black)',           compatibility: 'TRUCK FN – KL FN2P – 2002/11 to present, TRUCK FN – KL FN2P – 2000/02 to 2002-10 Kdsw23dcsd' },
  { code: 'SP01-D01-0003',  description: 'Spare Parts Dashboard MITSUBISHI CANER WIDE (Black)', compatibility: 'TRUCK FU – U FU415 – 1993/06 to 1995-05, TRUCK FU – P FU416 – 1989/11 to 1993-05 Kdsw23dcsd' },
  { code: 'SP01-D01-0004',  description: 'Spare Parts Dashboard HINO RANGER (Black)',           compatibility: 'FC RANGER – KK FC1JCDD – 2001/06 to present Kdsw23dcsd' },
  { code: 'SP01-D01-0005',  description: 'Spare Parts Dashboard ISUZU I061 (Black)',            compatibility: 'ELF 250 – U NKR61 – 1984/06 to 1993-06' },
  { code: 'SP01-HL01-0006', description: 'Spare Parts Vehicle Fog Light Kit',                   compatibility: 'Universal fitment, multi-vehicle compatible' },
];

const EMPTY_CREATE_FORM: CreateItemForm = {
  category: '', subCategory: '', brand: '', itemName: '', groupName: '',
  packLength: '', packBreadth: '', packHeight: '',
  variantType: '', variantAttr: '', itemGeneric: '',
  serialType: 'auto', sameAsDesc: true, salesName: '',
};

// ── Assign Makers Serial No modal ─────────────────────────────────────────────

function SerialModal({
  item,
  adjType,
  stockQty,
  noteText,
  onClose,
}: {
  item: StoreItem;
  adjType: 'excess' | 'damage';
  stockQty: number;
  noteText: string;
  onClose: () => void;
}) {
  type InputType = 'batch' | 'barcode' | 'ocr';
  const [inputType, setInputType] = useState<InputType>('batch');
  const [prefix,    setPrefix]    = useState('');
  const [rangeFrom, setRangeFrom] = useState('1');
  const [rangeTo,   setRangeTo]   = useState(String(Math.ceil(stockQty)));
  const [serials,   setSerials]   = useState<string[]>(
    () => Array(Math.max(1, Math.ceil(stockQty))).fill(''),
  );
  const [page, setPage] = useState(1);

  const total      = Math.max(1, Math.ceil(stockQty));
  const looseQty   = Number((stockQty % 1).toFixed(2));
  const PAGE_SIZE  = 9;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const assigned   = serials.filter(s => s.trim() !== '').length;
  const adjLabel   = adjType === 'excess' ? 'Excess' : 'Damage';
  const pageStart  = (page - 1) * PAGE_SIZE;
  const pageRows   = serials.slice(pageStart, pageStart + PAGE_SIZE);

  function generateSerials() {
    const from = Math.max(1, parseInt(rangeFrom, 10) || 1);
    const to   = Math.min(total, parseInt(rangeTo, 10) || total);
    setSerials(prev => {
      const next = [...prev];
      for (let i = from - 1; i < to; i++) {
        next[i] = prefix
          ? `${prefix}${String(i + 1).padStart(4, '0')}`
          : String(i + 1);
      }
      return next;
    });
  }

  function clearAll() {
    setSerials(Array(total).fill(''));
    setPage(1);
  }

  function updateSerial(idx: number, val: string) {
    setSerials(prev => { const n = [...prev]; n[idx] = val; return n; });
  }

  const INPUT_TYPES: { id: InputType; label: string }[] = [
    { id: 'batch',   label: 'Batch wise' },
    { id: 'barcode', label: 'Barcode'    },
    { id: 'ocr',     label: 'OCR'        },
  ];

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={sm.overlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={sm.card}>

            {/* ── Header ── */}
            <View style={sm.header}>
              <View style={sm.headerIcon}>
                <MaterialCommunityIcons name="barcode-scan" size={16} color="#FFF" />
              </View>
              <Text style={sm.headerTitle}>Assign Makers Serial No</Text>
              <Pressable onPress={onClose}
                style={({ pressed }) => [sm.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={12}>
                <MaterialCommunityIcons name="close" size={16} color="#595959" />
              </Pressable>
            </View>

            {/* ── Input type row ── */}
            <View style={sm.topRow}>
              <View style={sm.typeSection}>
                <Text style={sm.selectLbl}>Select serial number input type ?</Text>
                <View style={sm.radios}>
                  {INPUT_TYPES.map(t => (
                    <Pressable key={t.id} onPress={() => { setInputType(t.id); setPage(1); }}
                      style={sm.radioOpt}>
                      <View style={[sm.radioCircle, inputType === t.id && sm.radioCircleSel]}>
                        {inputType === t.id && <View style={sm.radioDot} />}
                      </View>
                      <Text style={[sm.radioLbl, inputType === t.id && sm.radioLblSel]}>{t.label}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>
              <View style={sm.stockMeta}>
                <View style={sm.stockItem}>
                  <Text style={sm.stockLbl}>{adjLabel} Stock :</Text>
                  <Text style={sm.stockVal}>{stockQty.toFixed(2)}</Text>
                </View>
                <View style={sm.stockItem}>
                  <Text style={sm.stockLbl}>{adjLabel} Loose Stock :</Text>
                  <Text style={sm.stockVal}>{looseQty.toFixed(0)}</Text>
                </View>
              </View>
            </View>

            {/* ── Batch wise: serial number ranges ── */}
            {inputType === 'batch' && (
              <View style={sm.rangesWrap}>
                <Text style={sm.rangesTitle}>Serial Number Ranges</Text>
                <View style={sm.rangeRow}>
                  <TextInput
                    value={prefix}
                    onChangeText={setPrefix}
                    style={sm.prefixInput}
                    placeholder="Serial prefix"
                    placeholderTextColor="#BBBBC0"
                  />
                  <View style={sm.numFieldWrap}>
                    <TextInput value={rangeFrom} onChangeText={setRangeFrom} keyboardType="numeric"
                      style={sm.numField} placeholder="From" placeholderTextColor="#BBBBC0" />
                    <View style={sm.spinCols}>
                      <Pressable hitSlop={6} onPress={() => setRangeFrom(p => String(Math.max(1, parseInt(p||'1',10)+1)))}>
                        <MaterialCommunityIcons name="chevron-up" size={13} color="#888" />
                      </Pressable>
                      <Pressable hitSlop={6} onPress={() => setRangeFrom(p => String(Math.max(1, parseInt(p||'2',10)-1)))}>
                        <MaterialCommunityIcons name="chevron-down" size={13} color="#888" />
                      </Pressable>
                    </View>
                  </View>
                  <View style={sm.numFieldWrap}>
                    <TextInput value={rangeTo} onChangeText={setRangeTo} keyboardType="numeric"
                      style={sm.numField} placeholder="To" placeholderTextColor="#BBBBC0" />
                    <View style={sm.spinCols}>
                      <Pressable hitSlop={6} onPress={() => setRangeTo(p => String(parseInt(p||'0',10)+1))}>
                        <MaterialCommunityIcons name="chevron-up" size={13} color="#888" />
                      </Pressable>
                      <Pressable hitSlop={6} onPress={() => setRangeTo(p => String(Math.max(0, parseInt(p||'1',10)-1)))}>
                        <MaterialCommunityIcons name="chevron-down" size={13} color="#888" />
                      </Pressable>
                    </View>
                  </View>
                  <Text style={sm.assignedCount}>{assigned} / {total}</Text>
                  <Pressable hitSlop={8}
                    onPress={() => { setPrefix(''); setRangeFrom('1'); setRangeTo(String(total)); }}
                    style={sm.clearRowBtn}>
                    <MaterialCommunityIcons name="close" size={12} color="#888" />
                  </Pressable>
                </View>
                <View style={sm.actionBtns}>
                  <Pressable style={[sm.actionBtn, sm.btnAddRange]}>
                    <Text style={sm.actionBtnTxt}>Add Range</Text>
                  </Pressable>
                  <Pressable onPress={generateSerials} style={[sm.actionBtn, sm.btnGenerate]}>
                    <Text style={[sm.actionBtnTxt, { color: '#FFF' }]}>Generate Serials</Text>
                  </Pressable>
                  <Pressable onPress={clearAll} style={[sm.actionBtn, sm.btnClear]}>
                    <Text style={sm.actionBtnTxt}>Clear All</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {/* ── Table ── */}
            <View style={sm.tableWrap}>
              {/* Fixed table header */}
              <View style={[sm.tRow, sm.tHeaderRow]}>
                <Text style={[sm.tCell, sm.cHash,   sm.tHdrTxt]}>#</Text>
                <Text style={[sm.tCell, sm.cCode,   sm.tHdrTxt]}>Item Code</Text>
                <Text style={[sm.tCell, sm.cNote,   sm.tHdrTxt]}>{adjLabel} Note</Text>
                <Text style={[sm.tCell, sm.cSerial, sm.tHdrTxt]}>Serial No</Text>
                <Text style={[sm.tCell, sm.cOcr,    sm.tHdrTxt]}>OCR</Text>
              </View>

              {/* Scrollable data rows */}
              <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
                {pageRows.map((serial, i) => {
                  const gIdx = pageStart + i;
                  return (
                    <View key={gIdx} style={[sm.tRow, sm.tDataRow]}>
                      <Text style={[sm.tCell, sm.cHash, sm.tDataTxt]}>{gIdx + 1}</Text>
                      <Text style={[sm.tCell, sm.cCode, sm.tDataTxt]} numberOfLines={1}>{item.itemCode}</Text>
                      <Text style={[sm.tCell, sm.cNote, sm.tDataTxt]} numberOfLines={1}>{noteText || '—'}</Text>
                      <View style={[sm.tCell, sm.cSerial, sm.serialRow]}>
                        <TextInput
                          value={serial}
                          onChangeText={v => updateSerial(gIdx, v)}
                          placeholder="Serial No"
                          placeholderTextColor="#BBBBC0"
                          style={sm.serialInput}
                        />
                        <Pressable hitSlop={8}>
                          <MaterialCommunityIcons name="pencil-outline" size={13} color="#595959" />
                        </Pressable>
                        <Pressable hitSlop={8} onPress={() => updateSerial(gIdx, '')}>
                          <MaterialCommunityIcons name="trash-can-outline" size={13} color="#888" />
                        </Pressable>
                      </View>
                      <View style={[sm.tCell, sm.cOcr, sm.ocrCol]}>
                        <Pressable hitSlop={8}>
                          <MaterialCommunityIcons name="link-variant" size={15} color="#8E8E93" />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            </View>

            {/* ── Footer: pagination + Done ── */}
            <View style={sm.footer}>
              <View style={sm.pagination}>
                <Pressable disabled={page === 1} hitSlop={8} onPress={() => setPage(1)}
                  style={[sm.pgBtn, page === 1 && sm.pgBtnOff]}>
                  <MaterialCommunityIcons name="page-first" size={15} color={page === 1 ? '#CCC' : '#595959'} />
                </Pressable>
                <Pressable disabled={page === 1} hitSlop={8} onPress={() => setPage(p => p - 1)}
                  style={[sm.pgBtn, page === 1 && sm.pgBtnOff]}>
                  <MaterialCommunityIcons name="chevron-left" size={15} color={page === 1 ? '#CCC' : '#595959'} />
                </Pressable>
                <Text style={sm.pgInfo}>Page {page} of {totalPages}</Text>
                <Pressable disabled={page === totalPages} hitSlop={8} onPress={() => setPage(p => p + 1)}
                  style={[sm.pgBtn, page === totalPages && sm.pgBtnOff]}>
                  <MaterialCommunityIcons name="chevron-right" size={15} color={page === totalPages ? '#CCC' : '#595959'} />
                </Pressable>
                <Pressable disabled={page === totalPages} hitSlop={8} onPress={() => setPage(totalPages)}
                  style={[sm.pgBtn, page === totalPages && sm.pgBtnOff]}>
                  <MaterialCommunityIcons name="page-last" size={15} color={page === totalPages ? '#CCC' : '#595959'} />
                </Pressable>
              </View>
              <Pressable onPress={onClose}
                style={({ pressed }) => [sm.doneBtn, pressed && { opacity: 0.85 }]}>
                <Text style={sm.doneTxt}>Done</Text>
              </Pressable>
            </View>

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Previous GRN picker ───────────────────────────────────────────────────────

function GrnPickerModal({
  item,
  onApply,
  onClose,
  appliedGrnNo,
}: {
  item: StoreItem;
  onApply: (record: GrnRecord) => void;
  onClose: () => void;
  appliedGrnNo?: string;
}) {
  const [viewGrn, setViewGrn] = useState<GrnRecord | null>(null);

  return (
    <>
    {/* ── GRN detail popup ── */}
    {viewGrn && (
      <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => setViewGrn(null)}>
        <View style={grn.detOverlay}>
          <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setViewGrn(null)} />
          <View style={grn.detCard}>
            {/* Header */}
            <View style={grn.detHeader}>
              <MaterialCommunityIcons name="file-document-outline" size={14} color={Colors.primaryHighlight} />
              <Text style={grn.detTitle}>{viewGrn.grnNo}</Text>
              <Pressable onPress={() => setViewGrn(null)} hitSlop={10}
                style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}>
                <MaterialCommunityIcons name="close" size={15} color="#595959" />
              </Pressable>
            </View>
            {/* Rows */}
            {([
              ['Date',        viewGrn.date],
              ['Supplier',    viewGrn.supplier],
              ['Main Qty',    viewGrn.mainQty + ' kg'],
              ['Lose Qty',    viewGrn.loseQty + ' g'],
              ['Cost / kg',   viewGrn.mainCost],
              ['Cost / g',    viewGrn.loseCost],
              ['Sell / kg',   viewGrn.mainSell],
              ['Sell / g',    viewGrn.loseSell],
              ['Sold',        String(viewGrn.sold)],
              ['Damaged',     String(viewGrn.damaged)],
              ['Reserved',    String(viewGrn.reserved)],
            ] as [string, string][]).map(([lbl, val], i) => (
              <View key={lbl}>
                <View style={grn.detRow}>
                  <Text style={grn.detLbl}>{lbl}:</Text>
                  <Text style={grn.detVal}>{val}</Text>
                </View>
                {i < 10 && <View style={grn.detDiv} />}
              </View>
            ))}
          </View>
        </View>
      </Modal>
    )}

    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={grn.overlay}>
        {/* Tap backdrop to dismiss */}
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        <View style={grn.sheet}>
          {/* Drag handle */}
          <View style={grn.handle} />

          {/* Header */}
          <View style={grn.header}>
            <View style={grn.headerIcon}>
              <MaterialCommunityIcons name="file-document-multiple-outline" size={16} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={grn.title}>Previous GRN Records</Text>
              <Text style={grn.subtitle} numberOfLines={1}>{item.itemCode} · {item.itemDescription}</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={12}
              style={({ pressed }) => [grn.closeBtn, pressed && { opacity: 0.6 }]}>
              <MaterialCommunityIcons name="close" size={15} color="#595959" />
            </Pressable>
          </View>

          {/* GRN card list */}
          <ScrollView showsVerticalScrollIndicator={false}
            style={grn.list} contentContainerStyle={grn.listContent}>
            {MOCK_GRN.map(record => (
              <View key={record.grnNo} style={grn.card}>

                {/* Card top: GRN no + date */}
                <View style={grn.cardTop}>
                  <View style={grn.cardAccent} />
                  <View style={{ flex: 1 }}>
                    <View style={grn.cardTitleRow}>
                      <MaterialCommunityIcons name="file-document-outline" size={13} color={Colors.primaryHighlight} />
                      <Text style={grn.cardGrnNo}>{record.grnNo}</Text>
                      <View style={grn.dateBadge}>
                        <Text style={grn.dateText}>{record.date}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Price grid */}
                <View style={grn.priceGrid}>
                  <View style={grn.gridRow}>
                    <View style={grn.gridLblCell} />
                    <View style={grn.gridValCell}>
                      <Text style={grn.gridHdr}>Main  /kg</Text>
                    </View>
                    <View style={grn.gridValCell}>
                      <Text style={grn.gridHdr}>Lose  /g</Text>
                    </View>
                  </View>
                  <View style={[grn.gridRow, grn.gridBorder]}>
                    <View style={grn.gridLblCell}>
                      <Text style={grn.gridLbl}>Qty</Text>
                    </View>
                    <View style={grn.gridValCell}>
                      <Text style={[grn.gridVal, grn.gridValQty]}>{record.mainQty}</Text>
                    </View>
                    <View style={grn.gridValCell}>
                      <Text style={[grn.gridVal, grn.gridValQty]}>{record.loseQty}</Text>
                    </View>
                  </View>
                  <View style={[grn.gridRow, grn.gridBorder]}>
                    <View style={grn.gridLblCell}>
                      <Text style={grn.gridLbl}>Cost Price</Text>
                    </View>
                    <View style={grn.gridValCell}>
                      <Text style={grn.gridVal}>{record.mainCost}</Text>
                    </View>
                    <View style={grn.gridValCell}>
                      <Text style={grn.gridVal}>{record.loseCost}</Text>
                    </View>
                  </View>
                  <View style={grn.gridRow}>
                    <View style={grn.gridLblCell}>
                      <Text style={grn.gridLbl}>Selling Price</Text>
                    </View>
                    <View style={grn.gridValCell}>
                      <Text style={grn.gridVal}>{record.mainSell}</Text>
                    </View>
                    <View style={grn.gridValCell}>
                      <Text style={grn.gridVal}>{record.loseSell}</Text>
                    </View>
                  </View>
                </View>

                {/* Footer: eye icon + apply */}
                <View style={grn.cardFooter}>
                  <Pressable onPress={() => setViewGrn(record)} hitSlop={10}
                    style={({ pressed }) => [grn.detEyeBtn, pressed && { opacity: 0.6 }]}>
                    <MaterialCommunityIcons name="eye-outline" size={16} color={Colors.primaryHighlight} />
                  </Pressable>
                  <View style={{ flex: 1 }} />
                  {record.grnNo === appliedGrnNo ? (
                    <View style={grn.appliedBadge}>
                      <MaterialCommunityIcons name="check-circle" size={14} color="#FFF" />
                      <Text style={grn.appliedBadgeTxt}>Applied</Text>
                    </View>
                  ) : (
                    <Pressable
                      onPress={() => { onApply(record); onClose(); }}
                      style={({ pressed }) => [grn.applyBtn, pressed && { opacity: 0.82 }]}>
                      <MaterialCommunityIcons name="check-circle-outline" size={14} color="#FFF" />
                      <Text style={grn.applyBtnTxt}>Apply</Text>
                    </Pressable>
                  )}
                </View>

              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
    </>
  );
}

// ── Stock Adjustment View Modal ───────────────────────────────────────────────

function StockAdjViewModal({ item, onClose }: { item: StoreItem; onClose: () => void }) {
  const [filter, setFilter] = useState<'all' | 'excess' | 'damage'>('all');
  const records = MOCK_ADJ_HISTORY.filter(r => filter === 'all' || r.type === filter);

  function Row({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <>
        <View style={av.row}>
          <Text style={av.rowLabel}>{label}</Text>
          <View style={av.rowValue}>{children}</View>
        </View>
        <View style={av.rowDiv} />
      </>
    );
  }

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={av.overlay}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onClose} />

        <View style={av.cardWrapper}>

          {/* Dark circular X — sibling of card so overflow:hidden doesn't clip it */}
          <Pressable onPress={onClose} style={av.closeBtn} hitSlop={8}>
            <MaterialCommunityIcons name="close" size={16} color="#FFF" />
          </Pressable>

          <View style={av.card}>

          {/* ── Header: icon + title ── */}
          <View style={av.headerRow}>
            <View style={av.headerIcon}>
              <MaterialCommunityIcons name="eye-outline" size={26} color="#FFF" />
            </View>
            <Text style={av.headerTitle}>View Adjustments</Text>
          </View>

          <View style={av.divider} />

          {/* ── Filter chips ── */}
          <View style={av.filterRow}>
            {(['all', 'excess', 'damage'] as const).map(f => (
              <Pressable key={f} onPress={() => setFilter(f)}
                style={[av.filterChip,
                  filter === f && f === 'all'    && av.filterChipAllActive,
                  filter === f && f === 'excess' && av.filterChipExcessActive,
                  filter === f && f === 'damage' && av.filterChipDmgActive,
                ]}>
                <Text style={[av.filterChipTxt,
                  filter === f && f === 'excess' && { color: '#2E7D32' },
                  filter === f && f === 'damage' && { color: '#C62828' },
                  filter === f && f === 'all'    && { color: '#595959', fontWeight: '700' },
                ]}>
                  {f === 'all' ? 'All' : f === 'excess' ? 'Excess' : 'Damage'}
                </Text>
              </Pressable>
            ))}
            <View style={{ flex: 1 }} />
            <Text style={av.countTxt}>{records.length} record{records.length !== 1 ? 's' : ''}</Text>
          </View>

          {/* ── Record list ── */}
          <ScrollView showsVerticalScrollIndicator={false}
            style={av.list} contentContainerStyle={av.listContent}>

            {records.length === 0 ? (
              <View style={av.emptyWrap}>
                <MaterialCommunityIcons name="clipboard-off-outline" size={32} color="#CCCCCC" />
                <Text style={av.emptyTxt}>No records found</Text>
              </View>
            ) : records.map((rec, ri) => {
              const isExcess  = rec.type === 'excess';
              const typeColor = isExcess ? '#30A84B' : '#E53935';
              const sign      = isExcess ? '+' : '-';
              return (
                <View key={rec.id} style={[av.recBlock, ri > 0 && av.recBlockBorder]}>

                  {/* Section label */}
                  <View style={av.recSectionLbl}>
                    <View style={[av.recDot, { backgroundColor: typeColor }]} />
                    <Text style={av.recSectionTxt}>{rec.id}</Text>
                  </View>

                  <View style={av.rowDiv} />

                  <Row label="Date:">
                    <Text style={av.rowTxt}>{rec.timestamp}</Text>
                  </Row>

                  <Row label="Type:">
                    <View style={[av.typePill, { backgroundColor: isExcess ? 'rgba(48,168,75,0.12)' : 'rgba(229,57,53,0.10)' }]}>
                      <Text style={[av.typePillTxt, { color: typeColor }]}>
                        {isExcess ? 'Excess Stock' : 'Damage Stock'}
                      </Text>
                    </View>
                  </Row>

                  <Row label="Stock Before:">
                    <Text style={av.rowTxt}>{rec.stockBefore}</Text>
                  </Row>

                  <Row label="Change:">
                    <Text style={[av.rowTxt, { color: typeColor, fontWeight: '700' }]}>{sign}{rec.qty}</Text>
                  </Row>

                  <Row label="Stock After:">
                    <Text style={[av.rowTxt, { color: typeColor, fontWeight: '700' }]}>{rec.stockAfter}</Text>
                  </Row>

                  {/* Excess-specific rows */}
                  {isExcess && rec.grnNo && (
                    <Row label="GRN No:">
                      <Text style={av.rowTxt}>{rec.grnNo}</Text>
                    </Row>
                  )}
                  {isExcess && rec.supplier && (
                    <Row label="Supplier:">
                      <Text style={av.rowTxt} numberOfLines={1}>{rec.supplier}</Text>
                    </Row>
                  )}
                  {isExcess && rec.mainQty != null && (
                    <Row label="Main Qty:">
                      <Text style={av.rowTxt}>{rec.mainQty} kg</Text>
                    </Row>
                  )}
                  {isExcess && rec.mainCostPrice && (
                    <Row label="Cost / kg:">
                      <Text style={av.rowTxt}>{rec.mainCostPrice}</Text>
                    </Row>
                  )}
                  {isExcess && rec.mainSellPrice && (
                    <Row label="Sell / kg:">
                      <Text style={av.rowTxt}>{rec.mainSellPrice}</Text>
                    </Row>
                  )}

                  {/* Damage-specific rows */}
                  {!isExcess && rec.damageType && (
                    <Row label="Damage Type:">
                      <Text style={av.rowTxt}>{rec.damageType}</Text>
                    </Row>
                  )}
                  {!isExcess && rec.reason && (
                    <Row label="Reason:">
                      <Text style={av.rowTxt} numberOfLines={3}>{rec.reason}</Text>
                    </Row>
                  )}

                  {/* GRN breakdown mini table (damage) */}
                  {!isExcess && rec.grnBreakdown && rec.grnBreakdown.length > 0 && (
                    <View style={av.miniTableWrap}>
                      <Text style={av.miniTableTitle}>GRN Breakdown</Text>
                      <View style={av.miniTable}>
                        <View style={[av.miniRow, av.miniHead]}>
                          <Text style={[av.miniCell, { flex: 2 }]}>GRN No.</Text>
                          <Text style={[av.miniCell, { textAlign: 'center' }]}>Dmg</Text>
                          <Text style={[av.miniCell, { textAlign: 'center' }]}>Prev</Text>
                          <Text style={[av.miniCell, { textAlign: 'center' }]}>New Bal</Text>
                        </View>
                        {rec.grnBreakdown.map((b, i) => (
                          <View key={i} style={[av.miniRow, i % 2 === 1 && av.miniRowAlt]}>
                            <Text style={[av.miniCell, { flex: 2, fontWeight: '700', color: '#1C1C1E' }]}>{b.grnNo}</Text>
                            <Text style={[av.miniCell, { textAlign: 'center', color: '#E53935' }]}>{b.dmgQty}</Text>
                            <Text style={[av.miniCell, { textAlign: 'center' }]}>{b.prevAvail}</Text>
                            <Text style={[av.miniCell, { textAlign: 'center', color: b.newBalance >= 0 ? '#30A84B' : '#E53935' }]}>{b.newBalance}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}

                </View>
              );
            })}
          </ScrollView>

          </View>{/* card */}
        </View>{/* cardWrapper */}
      </View>{/* overlay */}
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StockAdjModal({ item, storeCode, onClose, onSave }: {
  item: StoreItem;
  storeCode: string;
  onClose: () => void;
  onSave: (updated: StoreItem) => void;
}) {
  const [activeTab,    setActiveTab]    = useState<AdjTab>('adjustment');
  const [adjType,      setAdjType]      = useState<'excess' | 'damage' | null>(null);
  const [_costPrice,     _setCostPrice]     = useState('');
  const [_excessStock,   _setExcessStock]   = useState('');
  const [reasonNote,     _setReasonNote]    = useState('');
  const [damageStock,    setDamageStock]    = useState('');
  const [dmgLoseQty,     setDmgLoseQty]     = useState('');
  const [damageType,     setDamageType]     = useState('');
  const [damageReason,   setDamageReason]   = useState('');
  const [dmgStep,        setDmgStep]        = useState<1 | 2>(1);
  const [selectedGrn,    setSelectedGrn]    = useState<GrnRecord | null>(null);
  const [dmgPerGrn,      setDmgPerGrn]      = useState<Record<string, string>>({});
  const [dmgReportData,  setDmgReportData]  = useState<null | {
    adjustments: Array<{ grnNo: string; date: string; dmgQty: number; prevAvail: number; newBalance: number }>;
    totalDmg: number; damageType: string; reason: string;
    stockBefore: number; stockAfter: number; updatedItem: StoreItem; timestamp: string;
  }>(null);
  const [excReportData,  setExcReportData]  = useState<null | {
    mainQty: number; loseQtyNum: number;
    mainCostPrice: string; loseCostPrice: string;
    mainSellPrice: string; loseSellPrice: string;
    stockBefore: number; stockAfter: number;
    updatedItem: StoreItem; timestamp: string;
    appliedGrn: GrnRecord | null;
  }>(null);
  // Excess form — qty + pricing
  const [mainQty,        setMainQty]        = useState('');
  const [loseQty,        setLoseQty]        = useState('');
  const [mainCostPrice,  setMainCostPrice]  = useState('');
  const [loseCostPrice,  setLoseCostPrice]  = useState('');
  const [mainSellPrice,  setMainSellPrice]  = useState('');
  const [loseSellPrice,  setLoseSellPrice]  = useState('');
  const [showSerial,   setShowSerial]   = useState(false);
  const [showGrn,      setShowGrn]      = useState(false);
  const [appliedGrn,   setAppliedGrn]   = useState<GrnRecord | null>(null);
  const [activeImg,  setActiveImg]  = useState(0);
  const [thumbStart,  setThumbStart]  = useState(0);
  const [showImages, setShowImages] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const demoImages = useMemo(() => getDemoImages(item.subCategory), [item.subCategory]);
  const ringColor  = stockRingColor(item.stockBal);

  const DRAFT_KEY = `stock_adj_draft_${item.id}`;

  // Load saved draft on mount
  useEffect(() => {
    AsyncStorage.getItem(DRAFT_KEY).then(raw => {
      if (!raw) return;
      try {
        const d = JSON.parse(raw);
        // adjType intentionally not restored — radio starts unselected on every open
        if (d.mainQty)        setMainQty(d.mainQty);
        if (d.loseQty)        setLoseQty(d.loseQty);
        if (d.mainCostPrice)  setMainCostPrice(d.mainCostPrice);
        if (d.loseCostPrice)  setLoseCostPrice(d.loseCostPrice);
        if (d.mainSellPrice)  setMainSellPrice(d.mainSellPrice);
        if (d.loseSellPrice)  setLoseSellPrice(d.loseSellPrice);
        if (d.appliedGrn)     setAppliedGrn(d.appliedGrn);
        if (d.damageStock)    setDamageStock(d.damageStock);
        if (d.dmgLoseQty)     setDmgLoseQty(d.dmgLoseQty);
        if (d.damageType)     setDamageType(d.damageType);
        if (d.damageReason)   setDamageReason(d.damageReason);
        if (d.selectedGrn)    setSelectedGrn(d.selectedGrn);
        if (d.dmgStep)        setDmgStep(d.dmgStep);
      } catch (_) {}
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft whenever form values change
  const saveDraft = useCallback(() => {
    AsyncStorage.setItem(DRAFT_KEY, JSON.stringify({
      adjType,
      mainQty, loseQty,
      mainCostPrice, loseCostPrice,
      mainSellPrice, loseSellPrice,
      appliedGrn,
      damageStock, dmgLoseQty,
      damageType, damageReason,
      selectedGrn, dmgStep,
    }));
  }, [adjType, mainQty, loseQty, mainCostPrice, loseCostPrice, mainSellPrice, loseSellPrice,
      appliedGrn, damageStock, dmgLoseQty, damageType, damageReason, selectedGrn, dmgStep, DRAFT_KEY]);

  useEffect(() => { saveDraft(); }, [saveDraft]);

  // Auto-calculate sell prices from cost prices using item selling config
  useEffect(() => {
    
    const cost = parseFloat(mainCostPrice);
    const sell = calcSellPrice(item.itemCode, cost);
    if (sell !== null) {
      setMainSellPrice(sell.toFixed(2));
    }
  }, [mainCostPrice, item.itemCode]);

  useEffect(() => {
    const cost = parseFloat(loseCostPrice);
    const sell = calcSellPrice(item.itemCode, cost);
    if (sell !== null) {
      setLoseSellPrice(sell.toFixed(2));
    }
  }, [loseCostPrice, item.itemCode]);

  const VISIBLE = 3;
  const canUp   = thumbStart > 0;
  const canDown = thumbStart + VISIBLE < demoImages.length;

  function shiftThumb(dir: 'up' | 'down') {
    if (dir === 'up' && !canUp)     return;
    if (dir === 'down' && !canDown) return;
    const next = dir === 'up' ? thumbStart - 1 : thumbStart + 1;
    setThumbStart(next);
    setActiveImg(dir === 'down' ? next + VISIBLE - 1 : next);
  }

  function applyGrn(record: GrnRecord) {
    setAppliedGrn(record);
    setMainCostPrice(record.mainCost);
    setLoseCostPrice(record.loseCost);
    setMainSellPrice(record.mainSell);
    setLoseSellPrice(record.loseSell);
    setMainQty(record.mainQty);
    setLoseQty(record.loseQty);
  }

  function removeApplied() {
    setAppliedGrn(null);
    setMainCostPrice('');
    setLoseCostPrice('');
    setMainSellPrice('');
    setLoseSellPrice('');
    setMainQty('');
    setLoseQty('');
  }

  // PanResponder for thumbnail strip swipe — recreated when thumbStart changes
  // so the closure always sees the latest canUp/canDown values.
  // onStartShouldSetPanResponder returns false so taps still reach child Pressables;
  // onMoveShouldSetPanResponder captures only clear vertical swipes.
  const thumbPanResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, state) =>
          Math.abs(state.dy) > 8 && Math.abs(state.dy) > Math.abs(state.dx),
        onPanResponderRelease: (_, state) => {
          if (state.dy < -12) shiftThumb('down');
          else if (state.dy > 12) shiftThumb('up');
        },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [thumbStart, demoImages.length],
  );

  function handleSave() {
    if (!adjType) {
      Alert.alert('Validation', 'Please select Excess Stock or Damage Stock before saving.');
      return;
    }

    if (adjType === 'excess') {
      const qty = parseFloat(mainQty) || 0;
      if (qty <= 0) {
        Alert.alert('Validation', 'Please enter a valid quantity to add.');
        return;
      }
      const updated: StoreItem = { ...item, stockCnt: item.stockCnt + qty, stockBal: item.stockBal + qty };
      AsyncStorage.removeItem(DRAFT_KEY);
      setExcReportData({
        mainQty: qty,
        loseQtyNum: parseFloat(loseQty) || 0,
        mainCostPrice,
        loseCostPrice,
        mainSellPrice,
        loseSellPrice,
        stockBefore: item.stockBal,
        stockAfter:  item.stockBal + qty,
        updatedItem: updated,
        timestamp:   new Date().toLocaleString(),
        appliedGrn,
      });
    } else {
      if (totalDmgQty <= 0) {
        Alert.alert('Validation', 'Please enter a damage quantity for at least one GRN batch.');
        return;
      }
      const qty = totalDmgQty;
      const updated: StoreItem = {
        ...item,
        stockCnt: Math.max(0, item.stockCnt - qty),
        stockBal: Math.max(0, item.stockBal - qty),
      };
      AsyncStorage.removeItem(DRAFT_KEY);
      const adjustments = MOCK_GRN
        .filter(r => (parseFloat(dmgPerGrn[r.grnNo]) || 0) > 0)
        .map(r => {
          const dmgQty = parseFloat(dmgPerGrn[r.grnNo]) || 0;
          const avail  = parseInt(r.mainQty, 10) - r.sold - r.damaged - r.reserved;
          return { grnNo: r.grnNo, date: r.date, dmgQty, prevAvail: avail, newBalance: avail - dmgQty };
        });
      setDmgReportData({
        adjustments,
        totalDmg:   qty,
        damageType,
        reason:     damageReason,
        stockBefore: item.stockBal,
        stockAfter:  Math.max(0, item.stockBal - qty),
        updatedItem: updated,
        timestamp:   new Date().toLocaleString(),
      });
    }
  }

  function handleSingleGrnAdjust(record: GrnRecord, dmgQty: number) {
    if (dmgQty <= 0) return;
    const avail   = parseInt(record.mainQty, 10) - record.sold - record.damaged - record.reserved;
    const updated: StoreItem = {
      ...item,
      stockCnt: Math.max(0, item.stockCnt - dmgQty),
      stockBal: Math.max(0, item.stockBal - dmgQty),
    };
    AsyncStorage.removeItem(DRAFT_KEY);
    setDmgReportData({
      adjustments: [{ grnNo: record.grnNo, date: record.date, dmgQty, prevAvail: avail, newBalance: avail - dmgQty }],
      totalDmg:    dmgQty,
      damageType,
      reason:      damageReason,
      stockBefore: item.stockBal,
      stockAfter:  Math.max(0, item.stockBal - dmgQty),
      updatedItem: updated,
      timestamp:   new Date().toLocaleString(),
    });
  }

  const DETAIL_ROWS: [string, string][] = [
    ['Item Code',     item.itemCode],
    ['Description',   item.itemDescription],
    ['Category',      item.category],
    ['Sub Category',  item.subCategory],
    ['GRN Type',      item.grnType],
    ['Store Code',    storeCode],
    ['Cur. Stock',    String(item.stockCnt)],
    ['Reserved',      String(item.stockRsvd)],
    ['Available',     String(item.stockBal)],
  ];

  function renderExcessReport() {
    const rd = excReportData!;
    const rows: [string, string][] = [
      ['Main Qty Added', `${rd.mainQty} kg`],
      ['Lose Qty',       rd.loseQtyNum > 0 ? `${rd.loseQtyNum} g` : '—'],
      ['Main Cost',      rd.mainCostPrice !== '' ? rd.mainCostPrice : '—'],
      ['Lose Cost',      rd.loseCostPrice !== '' ? rd.loseCostPrice : '—'],
      ['Main Sell',      rd.mainSellPrice !== '' ? rd.mainSellPrice : '—'],
      ['Lose Sell',      rd.loseSellPrice !== '' ? rd.loseSellPrice : '—'],
    ];
    return (
      <View style={dmg.reportWrap}>
        <View style={[dmg.reportHeader, { backgroundColor: 'rgba(48,168,75,0.10)' }]}>
          <View style={[dmg.reportCheckCircle, { backgroundColor: '#30A84B' }]}>
            <MaterialCommunityIcons name="check-bold" size={22} color="#FFF" />
          </View>
          <Text style={dmg.reportTitle}>Excess Adjustment Report</Text>
          <Text style={dmg.reportTs}>{rd.timestamp}</Text>
        </View>

        <View style={dmg.reportSummaryRow}>
          <View style={[dmg.reportSummBox, { backgroundColor: '#F3F3F8' }]}>
            <Text style={dmg.reportSummVal}>{rd.stockBefore}</Text>
            <Text style={dmg.reportSummLbl}>Before</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#9090A0" />
          <View style={[dmg.reportSummBox, { backgroundColor: 'rgba(48,168,75,0.09)' }]}>
            <Text style={[dmg.reportSummVal, { color: '#30A84B' }]}>+{rd.mainQty}</Text>
            <Text style={dmg.reportSummLbl}>Added</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#9090A0" />
          <View style={[dmg.reportSummBox, { backgroundColor: 'rgba(48,168,75,0.09)' }]}>
            <Text style={[dmg.reportSummVal, { color: '#30A84B' }]}>{rd.stockAfter}</Text>
            <Text style={dmg.reportSummLbl}>After</Text>
          </View>
        </View>

        {rd.appliedGrn && (
          <View style={dmg.reportMeta}>
            <Text style={[dmg.reportTypeChip, { backgroundColor: 'rgba(48,168,75,0.12)', color: '#1B5E20' }]}>
              GRN: {rd.appliedGrn.grnNo}
            </Text>
            <Text style={dmg.reportReasonTxt} numberOfLines={1}>{rd.appliedGrn.supplier}</Text>
          </View>
        )}

        <Text style={dmg.reportTableTitle}>Adjustment Details</Text>
        <View style={dmg.reportTable}>
          {rows.map(([lbl, val], i) => (
            <View key={lbl} style={[dmg.reportTableRow, i % 2 === 1 && dmg.reportTableRowAlt]}>
              <Text style={[dmg.reportTableCell, { flex: 2, color: '#666' }]}>{lbl}</Text>
              <Text style={[dmg.reportTableCell, { flex: 2, textAlign: 'right', fontWeight: '700', color: '#1C1C1E' }]}>{val}</Text>
            </View>
          ))}
        </View>

      </View>
    );
  }

  function renderDmgReport() {
    const rd = dmgReportData!;
    return (
      <View style={dmg.reportWrap}>

        {/* ── Check header ── */}
        <View style={dmg.reportHeader}>
          <View style={dmg.reportCheckCircle}>
            <MaterialCommunityIcons name="check-bold" size={22} color="#FFF" />
          </View>
          <Text style={dmg.reportTitle}>Damage Adjustment Report</Text>
          <Text style={dmg.reportTs}>{rd.timestamp}</Text>
        </View>

        {/* ── Summary row: Before → Damage → After ── */}
        <View style={dmg.reportSummaryRow}>
          <View style={[dmg.reportSummBox, { backgroundColor: '#F3F3F8' }]}>
            <Text style={dmg.reportSummVal}>{rd.stockBefore}</Text>
            <Text style={dmg.reportSummLbl}>Before</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#9090A0" />
          <View style={[dmg.reportSummBox, { backgroundColor: 'rgba(229,57,53,0.08)' }]}>
            <Text style={[dmg.reportSummVal, { color: '#E53935' }]}>{rd.totalDmg}</Text>
            <Text style={dmg.reportSummLbl}>Damage</Text>
          </View>
          <MaterialCommunityIcons name="arrow-right" size={16} color="#9090A0" />
          <View style={[dmg.reportSummBox, { backgroundColor: rd.stockAfter > 0 ? 'rgba(48,168,75,0.09)' : 'rgba(229,57,53,0.08)' }]}>
            <Text style={[dmg.reportSummVal, { color: rd.stockAfter > 0 ? '#30A84B' : '#E53935' }]}>{rd.stockAfter}</Text>
            <Text style={dmg.reportSummLbl}>After</Text>
          </View>
        </View>

        {/* ── Damage type + reason ── */}
        {(rd.damageType !== '' || rd.reason !== '') && (
          <View style={dmg.reportMeta}>
            {rd.damageType !== '' && (
              <Text style={dmg.reportTypeChip}>{rd.damageType}</Text>
            )}
            {rd.reason !== '' && (
              <Text style={dmg.reportReasonTxt} numberOfLines={2}>{rd.reason}</Text>
            )}
          </View>
        )}

        {/* ── Per-GRN breakdown table ── */}
        <Text style={dmg.reportTableTitle}>GRN Breakdown</Text>
        <View style={dmg.reportTable}>
          <View style={[dmg.reportTableRow, dmg.reportTableHead]}>
            <Text style={[dmg.reportTableCell, { flex: 2 }]}>GRN No.</Text>
            <Text style={[dmg.reportTableCell, { textAlign: 'center' }]}>Dmg</Text>
            <Text style={[dmg.reportTableCell, { textAlign: 'center' }]}>Prev Bal</Text>
            <Text style={[dmg.reportTableCell, { textAlign: 'center' }]}>New Bal</Text>
          </View>
          {rd.adjustments.map((adj, i) => (
            <View key={i} style={[dmg.reportTableRow, i % 2 === 1 && dmg.reportTableRowAlt]}>
              <Text style={[dmg.reportTableCell, { flex: 2, fontWeight: '700', color: '#1C1C1E' }]}>{adj.grnNo}</Text>
              <Text style={[dmg.reportTableCell, { textAlign: 'center', color: '#E53935' }]}>{adj.dmgQty}</Text>
              <Text style={[dmg.reportTableCell, { textAlign: 'center' }]}>{adj.prevAvail}</Text>
              <Text style={[dmg.reportTableCell, { textAlign: 'center', color: adj.newBalance >= 0 ? '#30A84B' : '#E53935' }]}>{adj.newBalance}</Text>
            </View>
          ))}
        </View>

        {/* ── Action buttons ── */}
        <View style={dmg.reportBtnRow}>
          <Pressable onPress={() => setDmgReportData(null)} style={[dmg.reportBtn, dmg.reportBtnEdit]}>
            <MaterialCommunityIcons name="pencil-outline" size={14} color="#595959" />
            <Text style={[dmg.reportBtnTxt, { color: '#595959' }]}>Edit</Text>
          </Pressable>
          <Pressable onPress={() => onSave(rd.updatedItem)} style={[dmg.reportBtn, dmg.reportBtnConfirm]}>
            <MaterialCommunityIcons name="check-circle-outline" size={14} color="#FFF" />
            <Text style={dmg.reportBtnTxt}>Confirm & Save</Text>
          </Pressable>
        </View>

      </View>
    );
  }

  function renderAdjustment() {
    if (adjType === 'excess' && excReportData) return renderExcessReport();
    if (adjType === 'damage' && dmgReportData) return renderDmgReport();

    return (
      <>
        {/* ── 1. Radio selector ── */}
        <View style={sa.radioCard}>
          <Pressable onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setAdjType('excess'); setDmgStep(1); setSelectedGrn(null); }} style={sa.radioOption}>
            <View style={[sa.radioCircle, adjType === 'excess' && sa.radioCircleSelected]}>
              {adjType === 'excess' && <View style={sa.radioDot} />}
            </View>
            <Text style={[sa.radioLabel, adjType === 'excess' && sa.radioLabelSelected]}>Excess Stock</Text>
          </Pressable>
          <View style={sa.radioSep} />
          <Pressable onPress={() => { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); setAdjType('damage'); setDmgStep(1); setSelectedGrn(null); }} style={sa.radioOption}>
            <View style={[sa.radioCircle, adjType === 'damage' && sa.radioCircleSelected]}>
              {adjType === 'damage' && <View style={sa.radioDot} />}
            </View>
            <Text style={[sa.radioLabel, adjType === 'damage' && sa.radioLabelSelected]}>Damage Stock</Text>
          </Pressable>
        </View>

        {/* ── 2. Excess Stock form ── */}
        {adjType === 'excess' && (
          <View style={sa.detailCard}>

            {/* Applied GRN banner */}
            {appliedGrn && (
              <View style={sa.appliedCard}>
                {/* Left accent bar */}
                <View style={sa.appliedAccent} />

                {/* Check icon circle */}
                <View style={sa.appliedIconCircle}>
                  <MaterialCommunityIcons name="check" size={12} color="#FFF" />
                </View>

                {/* Info */}
                <View style={sa.appliedInfo}>
                  <Text style={sa.appliedGrnNo}>{appliedGrn.grnNo}</Text>
                  <View style={sa.appliedSubRow}>
                    <View style={sa.appliedTag}>
                      <Text style={sa.appliedTagTxt}>APPLIED</Text>
                    </View>
                    <Text style={sa.appliedSupplier} numberOfLines={1}>{appliedGrn.supplier}</Text>
                  </View>
                </View>

                {/* Edit + Delete grouped */}
                <View style={sa.appliedActions}>
                  <Pressable onPress={() => setShowGrn(true)} hitSlop={6}
                    style={({ pressed }) => [sa.appliedActionBtn, pressed && { opacity: 0.7 }]}>
                    <MaterialCommunityIcons name="pencil-outline" size={13} color={Colors.primaryHighlight} />
                  </Pressable>
                  <View style={sa.appliedActionSep} />
                  <Pressable onPress={removeApplied} hitSlop={6}
                    style={({ pressed }) => [sa.appliedActionBtn, pressed && { opacity: 0.7 }]}>
                    <MaterialCommunityIcons name="trash-can-outline" size={13} color="#E53935" />
                  </Pressable>
                </View>
              </View>
            )}

            {/* Column headers */}
            <View style={sa.exColHeaders}>
              <View style={sa.exHalf}><Text style={sa.exColHdr}>Main  /kg</Text></View>
              <View style={[sa.exHalf, sa.exHalfR]}><Text style={sa.exColHdr}>Lose  /g</Text></View>
            </View>

            {/* ── 1. Quantity ── */}
            <View style={[sa.exRow, sa.exRowBorder]}>
              <View style={sa.exHalf}>
                <Text style={sa.exLbl}>Main Qty</Text>
                <View style={[sa.exBox, sa.exBoxQty, sa.exBoxQtyLarge, { flexDirection: 'row', alignItems: 'center' }, appliedGrn && { opacity: 0.45 }]}>
                  <TextInput value={mainQty} onChangeText={setMainQty}
                    editable={!appliedGrn}
                    keyboardType="numeric" style={[sa.exInput, sa.exInputQty, sa.exInputQtyLarge, { flex: 1 }]}
                    placeholder="0" placeholderTextColor="#C8F0CE" textAlign="center" />
                  <Text style={sa.exUnitTag}>/kg</Text>
                </View>
              </View>
              <View style={[sa.exHalf, sa.exHalfR]}>
                <Text style={sa.exLbl}>Lose QTY</Text>
                <View style={[sa.exBox, sa.exBoxQty, sa.exBoxQtyLarge, { flexDirection: 'row', alignItems: 'center' }, appliedGrn && { opacity: 0.45 }]}>
                  <TextInput value={loseQty} onChangeText={setLoseQty}
                    editable={!appliedGrn}
                    keyboardType="numeric" style={[sa.exInput, sa.exInputQty, sa.exInputQtyLarge, { flex: 1 }]}
                    placeholder="0" placeholderTextColor="#C8F0CE" textAlign="center" />
                  <Text style={sa.exUnitTag}>/g</Text>
                </View>
              </View>
            </View>

            {/* ── Match Previous GRN For Excess ── */}
            <Pressable
              onPress={() => setShowGrn(true)}
              style={({ pressed }) => [sa.grnMatchBtn, pressed && { opacity: 0.75 }]}>
              <View style={sa.grnMatchIconCircle}>
                <MaterialCommunityIcons name="file-clock-outline" size={14} color={Colors.primaryHighlight} />
              </View>
              <Text style={sa.grnMatchTxt}>Match Previous GRN For Excess</Text>
              <MaterialCommunityIcons name="chevron-right" size={15} color={Colors.primaryHighlight} />
            </Pressable>

            {/* ── 2. Sell Price ── */}
            <View style={[sa.exRow, sa.exRowBorder]}>
              <View style={sa.exHalf}>
                <View style={sa.exLblRow}>
                  <Text style={sa.exLbl}>Sell Price · Main</Text>
                  {mainSellPrice !== '' && mainCostPrice !== '' && (
                    <View style={sa.autoTag}><Text style={sa.autoTagTxt}>Auto</Text></View>
                  )}
                </View>
                <View style={[sa.exBox, { flexDirection: 'row', alignItems: 'center' }, appliedGrn && { opacity: 0.45 }]}>
                  <TextInput value={mainSellPrice} onChangeText={setMainSellPrice}
                    editable={!appliedGrn}
                    keyboardType="numeric" style={[sa.exInput, { flex: 1 }]}
                    placeholder="0.00" placeholderTextColor="#BBBBC0" />
                  <Text style={sa.exUnitTagPrice}>/kg</Text>
                </View>
              </View>
              <View style={sa.exHalfDivider} />
              <View style={sa.exHalf}>
                <View style={sa.exLblRow}>
                  <Text style={sa.exLbl}>Sell Price · Lose</Text>
                  {loseSellPrice !== '' && loseCostPrice !== '' && (
                    <View style={sa.autoTag}><Text style={sa.autoTagTxt}>Auto</Text></View>
                  )}
                </View>
                <View style={[sa.exBox, sa.exBoxLose, { flexDirection: 'row', alignItems: 'center' }, appliedGrn && { opacity: 0.45 }]}>
                  <TextInput value={loseSellPrice} onChangeText={setLoseSellPrice}
                    editable={!appliedGrn}
                    keyboardType="numeric" style={[sa.exInput, { flex: 1 }]}
                    placeholder="0.00" placeholderTextColor="#BBBBC0" />
                  <Text style={sa.exUnitTagPrice}>/g</Text>
                </View>
              </View>
            </View>

            {/* ── 3. Cost Price ── */}
            <View style={sa.exRow}>
              <View style={sa.exHalf}>
                <Text style={sa.exLbl}>Cost Price . Main</Text>
                <View style={[sa.exBox, { flexDirection: 'row', alignItems: 'center' }, appliedGrn && { opacity: 0.45 }]}>
                  <TextInput value={mainCostPrice} onChangeText={setMainCostPrice}
                    editable={!appliedGrn}
                    keyboardType="numeric" style={[sa.exInput, { flex: 1 }]}
                    placeholder="0.00" placeholderTextColor="#BBBBC0" />
                  <Text style={sa.exUnitTagPrice}>/kg</Text>
                </View>
              </View>
              <View style={[sa.exHalf, sa.exHalfR]}>
                <Text style={sa.exLbl}>Cost Price . Lose</Text>
                <View style={[sa.exBox, sa.exBoxLose, { flexDirection: 'row', alignItems: 'center' }, appliedGrn && { opacity: 0.45 }]}>
                  <TextInput value={loseCostPrice} onChangeText={setLoseCostPrice}
                    editable={!appliedGrn}
                    keyboardType="numeric" style={[sa.exInput, { flex: 1 }]}
                    placeholder="0.00" placeholderTextColor="#BBBBC0" />
                  <Text style={sa.exUnitTagPrice}>/g</Text>
                </View>
              </View>
            </View>

            {/* ── Action buttons ── */}
            <View style={[sa.serialFooter, { marginHorizontal: -14, marginBottom: 0, borderTopWidth: 1, borderTopColor: '#F0F0F5', gap: 5 }]}>
              <Pressable
                disabled={!canSave}
                onPress={() => setShowSerial(true)}
                style={[sa.serialFooterBtn, sa.serialFooterBtnOutline, !canSave && sa.serialFooterBtnDisabled]}>
                <MaterialCommunityIcons name="barcode" size={14} color={canSave ? '#595959' : '#C0C0CC'} />
                <Text style={[sa.serialFooterTxt, { color: '#595959' }, !canSave && sa.serialFooterTxtDisabled]}>Add Makers Serial</Text>
              </Pressable>
              <Pressable
                disabled={!canSave}
                onPress={handleSave}
                style={[sa.serialFooterBtn, sa.serialFooterBtnSave, !canSave && sa.serialFooterBtnDisabled]}>
                <MaterialCommunityIcons name="content-save-outline" size={12} color={canSave ? '#FFF' : '#C0C0CC'} />
                <Text style={[sa.serialFooterTxt, !canSave && sa.serialFooterTxtDisabled]}>Stock Adjustment</Text>
              </Pressable>
            </View>

          </View>
        )}

        {/* ── 2. Damage Stock form ── */}
        {adjType === 'damage' && (
          <View style={dmg.outerWrap}>

            {/* ── Compact Dashboard ── */}
            {(() => {
              const bal = item.stockBal - totalDmgQty;
              return (
                <View style={dmg.dashBoxRow}>
                  <View style={[dmg.dashBox, { backgroundColor: '#F3F3F8' }]}>
                    <Text style={dmg.dashBoxVal}>{item.stockCnt}</Text>
                    <Text style={dmg.dashBoxLbl}>{'Current\nStock'}</Text>
                  </View>
                  <View style={dmg.dashBoxDiv} />
                  <View style={[dmg.dashBox, { backgroundColor: 'rgba(230,126,34,0.09)' }]}>
                    <Text style={[dmg.dashBoxVal, { color: '#E67E22' }]}>{item.stockRsvd}</Text>
                    <Text style={dmg.dashBoxLbl}>Reserve</Text>
                  </View>
                  <View style={dmg.dashBoxDiv} />
                  <View style={[dmg.dashBox, { backgroundColor: 'rgba(229,57,53,0.08)' }]}>
                    <Text style={[dmg.dashBoxVal, { color: '#E53935' }]}>{totalDmgQty}</Text>
                    <Text style={dmg.dashBoxLbl}>Damage</Text>
                  </View>
                  <View style={dmg.dashBoxDiv} />
                  <View style={[dmg.dashBox, { backgroundColor: bal >= 0 ? 'rgba(48,168,75,0.09)' : 'rgba(229,57,53,0.08)' }]}>
                    <Text style={[dmg.dashBoxVal, { color: bal >= 0 ? '#30A84B' : '#E53935' }]}>{bal}</Text>
                    <Text style={dmg.dashBoxLbl}>Balance</Text>
                  </View>
                </View>
              );
            })()}

            {/* ── GRN Batch Cards ── */}
            <Text style={dmg.sectionLbl}>GRN Batches</Text>
            {MOCK_GRN.map(record => {
              const avail          = parseInt(record.mainQty, 10) - record.sold - record.damaged - record.reserved;
              const hasStock       = avail > 0;
              const dmgVal         = dmgPerGrn[record.grnNo] ?? '';
              const newDmgForGrn   = parseFloat(dmgVal) || 0;
              const reactiveDamage = record.damaged + newDmgForGrn;
              const reactiveBalance= avail - newDmgForGrn;
              const balPositive    = reactiveBalance >= 0;
              return (
                <View key={record.grnNo} style={[dmg.grnCard, !hasStock && { opacity: 0.5 }]}>

                  {/* GRN header row */}
                  <View style={dmg.grnHeader}>
                    <View style={dmg.grnIconWrap}>
                      <MaterialCommunityIcons name="file-document-outline" size={13} color="#E53935" />
                    </View>
                    <Text style={dmg.grnNo}>{record.grnNo}</Text>
                    <Text style={dmg.grnDate}>{record.date}</Text>
                  </View>

                  {/* Stat badges */}
                  <View style={dmg.badgeRow}>
                    <View style={[dmg.badge, dmg.badgeNeutral]}>
                      <Text style={dmg.badgeLbl}>Cur. Stock</Text>
                      <Text style={dmg.badgeVal}>{record.mainQty}</Text>
                    </View>
                    <View style={[dmg.badge, dmg.badgeNeutral]}>
                      <Text style={dmg.badgeLbl}>Reverse</Text>
                      <Text style={dmg.badgeVal}>{record.sold}</Text>
                    </View>
                    <View style={[dmg.badge, dmg.badgeDmgChip]}>
                      <Text style={[dmg.badgeLbl, { color: '#B71C1C' }]}>Damage</Text>
                      <Text style={[dmg.badgeVal, { color: '#E53935' }]}>{reactiveDamage}</Text>
                    </View>
                    <View style={[dmg.badge, balPositive ? dmg.badgeAvail : dmg.badgeDmgChip]}>
                      <Text style={[dmg.badgeLbl, { color: balPositive ? '#1B5E20' : '#B71C1C' }]}>Balance</Text>
                      <Text style={[dmg.badgeVal, { color: balPositive ? '#30A84B' : '#E53935' }]}>{reactiveBalance}</Text>
                    </View>
                  </View>

                  {/* Per-GRN damage input */}
                  {hasStock && (
                    <View style={dmg.grnDmgRow}>
                      <Text style={dmg.grnDmgLbl}>Damage Qty</Text>
                      <View style={dmg.grnDmgInputWrap}>
                        <TextInput
                          value={dmgVal}
                          onChangeText={v => setDmgPerGrn(prev => ({ ...prev, [record.grnNo]: v }))}
                          keyboardType="numeric"
                          style={dmg.grnDmgInput}
                          placeholder="0"
                          placeholderTextColor="rgba(229,57,53,0.35)"
                          textAlign="right"
                        />
                        <Text style={dmg.grnDmgUnit}>/kg</Text>
                      </View>
                    </View>
                  )}

                  {/* Stock Adjustments — bottom right of card */}
                  {hasStock && (
                    <View style={dmg.grnAdjFooter}>
                      <Pressable
                        disabled={newDmgForGrn <= 0}
                        onPress={() => handleSingleGrnAdjust(record, newDmgForGrn)}
                        style={({ pressed }) => [
                          dmg.grnAdjBtn,
                          newDmgForGrn <= 0 && dmg.grnAdjBtnDisabled,
                          pressed && newDmgForGrn > 0 && { opacity: 0.82 },
                        ]}>
                        <MaterialCommunityIcons
                          name="content-save-outline"
                          size={12}
                          color={newDmgForGrn > 0 ? '#FFF' : '#C0C0CC'}
                        />
                        <Text style={[dmg.grnAdjBtnTxt, newDmgForGrn <= 0 && { color: '#C0C0CC' }]}>
                          Stock Adjustments
                        </Text>
                      </Pressable>
                    </View>
                  )}
                </View>
              );
            })}

            {/* ── Damage Type + Reason ── */}
            <View style={dmg.typeSection}>
              <Text style={dmg.typeLbl}>Damage Type</Text>
              <View style={dmg.chipRow}>
                {['Physical', 'Water', 'Expired', 'Theft', 'Other'].map(t => (
                  <Pressable key={t} onPress={() => setDamageType(t)}
                    style={[dmg.chip, damageType === t && dmg.chipActive]}>
                    <Text style={[dmg.chipTxt, damageType === t && dmg.chipTxtActive]}>{t}</Text>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={dmg.noteBox}>
              <Text style={[dmg.noteLbl, { marginBottom: 6 }]}>Reason Note</Text>
              <TextInput value={damageReason} onChangeText={setDamageReason} multiline
                style={dmg.noteInput} placeholder="Describe the damage…"
                placeholderTextColor="#BBBBC0" />
            </View>

            {/* ── Stock Adjustment button ── */}
            <Pressable
              disabled={!canSave}
              onPress={handleSave}
              style={[dmg.dmgSaveBtn, !canSave && dmg.dmgSaveBtnDisabled]}>
              <MaterialCommunityIcons name="content-save-outline" size={15} color={canSave ? '#FFF' : '#C0C0CC'} />
              <Text style={[dmg.dmgSaveTxt, !canSave && { color: '#C0C0CC' }]}>Stock Adjustment</Text>
            </Pressable>

          </View>
        )}

        {/* ── 3. Item details ── */}
        <View style={sa.detailCard}>
          {DETAIL_ROWS.map(([label, val]) => (
            <View key={label} style={[sa.compactRow, sa.compactRowBorder]}>
              <Text style={sa.compactLbl}>{label}</Text>
              <Text style={sa.compactVal} numberOfLines={2}>{val}</Text>
            </View>
          ))}
          <Pressable
            onPress={() => {
              const next = !showImages;
              setShowImages(next);
              if (next) {
                setTimeout(() => scrollViewRef.current?.scrollTo({ y: 0, animated: true }), 80);
              }
            }}
            style={sa.seeMoreBtn}
            hitSlop={8}>
            <MaterialCommunityIcons
              name={showImages ? 'image-off-outline' : 'image-outline'}
              size={12}
              color={Colors.primaryHighlight}
            />
            <Text style={sa.seeMoreTxt}>{showImages ? 'See less...' : 'See more...'}</Text>
            <MaterialCommunityIcons
              name={showImages ? 'chevron-up' : 'chevron-down'}
              size={13}
              color={Colors.primaryHighlight}
            />
          </Pressable>
        </View>

        {/* ── 4. Image card: thumbnail strip left | main image right ── */}
        {showImages && <View style={sa.imgDetailCard}>

          {/* Left: vertical thumbnail strip */}
          <View style={sa.thumbStrip}>
            <Pressable
              onPress={() => shiftThumb('up')}
              disabled={!canUp}
              style={[sa.thumbArrowBtn, !canUp && sa.thumbArrowDisabled]}>
              <MaterialCommunityIcons name="chevron-up" size={16} color={canUp ? '#595959' : '#D0D0D8'} />
            </Pressable>

            <View style={sa.thumbList} {...thumbPanResponder.panHandlers}>
              {demoImages.slice(thumbStart, thumbStart + VISIBLE).map((uri, _i) => {
                const idx = thumbStart + _i;
                return (
                  <Pressable
                    key={idx}
                    onPress={() => setActiveImg(idx)}
                    style={[sa.thumbV, activeImg === idx && { borderColor: ringColor, borderWidth: 2.5 }]}>
                    <Image source={{ uri }} style={sa.thumbImg} resizeMode="cover" />
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => shiftThumb('down')}
              disabled={!canDown}
              style={[sa.thumbArrowBtn, !canDown && sa.thumbArrowDisabled]}>
              <MaterialCommunityIcons name="chevron-down" size={16} color={canDown ? '#595959' : '#D0D0D8'} />
            </Pressable>
          </View>

          {/* Right: main image only */}
          <View style={sa.mainRight}>
            <View style={[sa.imgMain, { borderColor: ringColor }]}>
              <Image source={{ uri: demoImages[activeImg] }} style={sa.imgFull} resizeMode="cover" />
            </View>
          </View>

        </View>}
      </>
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
    adjustment: renderAdjustment,
    pending:    renderPending,
  };

  const totalDmgQty = Object.values(dmgPerGrn).reduce((s, v) => s + (parseFloat(v) || 0), 0);

  const serialQty   = adjType === 'excess' ? (parseFloat(mainQty) || 0) : totalDmgQty;
  const serialNote  = adjType === 'excess' ? reasonNote : damageReason;

  const canSave = adjType === 'excess'
    ? mainQty.trim() !== '' && parseFloat(mainQty) > 0
    : adjType === 'damage' && totalDmgQty > 0;

  return (
    <>
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={[sa.modalOverlay, showImages && sa.modalOverlayTop]}>
        <KeyboardAvoidingView style={sa.kav} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={[sa.cardWrapper, { height: showImages ? SCREEN_H * 0.92 : adjType === null ? SCREEN_H * 0.65 : adjType === 'excess' ? SCREEN_H * 0.82 : SCREEN_H * 0.88 }]}>

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
                ref={scrollViewRef}
                contentContainerStyle={sa.form}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}>
                {tabContent[activeTab]()}
                <View style={{ height: 8 }} />
              </ScrollView>

              {/* Excess report: Edit + Confirm & Save pinned at bottom */}
              {adjType === 'excess' && excReportData && (
                <View style={[dmg.reportBtnRow, { marginHorizontal: 14, marginBottom: 10, marginTop: 0 }]}>
                  <Pressable onPress={() => setExcReportData(null)} style={[dmg.reportBtn, dmg.reportBtnEdit]}>
                    <MaterialCommunityIcons name="pencil-outline" size={14} color="#595959" />
                    <Text style={[dmg.reportBtnTxt, { color: '#595959' }]}>Edit</Text>
                  </Pressable>
                  <Pressable onPress={() => onSave(excReportData.updatedItem)} style={[dmg.reportBtn, dmg.reportBtnConfirm, { backgroundColor: '#30A84B' }]}>
                    <MaterialCommunityIcons name="check-circle-outline" size={14} color="#FFF" />
                    <Text style={dmg.reportBtnTxt}>Confirm & Save</Text>
                  </Pressable>
                </View>
              )}


            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
    {showSerial && (
      <SerialModal
        item={item}
        adjType={adjType!}
        stockQty={serialQty}
        noteText={serialNote}
        onClose={() => setShowSerial(false)}
      />
    )}
    {showGrn && (
      <GrnPickerModal
        item={item}
        onApply={applyGrn}
        onClose={() => setShowGrn(false)}
        appliedGrnNo={appliedGrn?.grnNo}
      />
    )}
    </>
  );
}

// ── Items Availability ────────────────────────────────────────────────────────

function ItemsAvailabilityView({ storeCode }: { storeCode: string }) {
  const { colors, isDarkMode } = useTheme();
  const [items,   setItems]   = useState<StoreItem[]>(MOCK_ITEMS);
  const [search,  setSearch]  = useState('');
  const [adjItem,  setAdjItem]  = useState<StoreItem | null>(null);
  const [viewItem, setViewItem] = useState<StoreItem | null>(null);

  function handleStockUpdate(updated: StoreItem) {
    setItems(prev => prev.map(it => it.id === updated.id ? updated : it));
    setAdjItem(null);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(item =>
      item.itemCode.toLowerCase().includes(q) ||
      item.itemDescription.toLowerCase().includes(q)
    );
  }, [items, search]);

  return (
    <View style={{ flex: 1 }}>

      {/* ── Search ── */}
      <View style={lv.searchFilterContainer}>

        {/* Search bar */}
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
              onView={() => setViewItem(item)}
              onAdjust={() => setAdjItem(item)}
            />
          ))
        )}
      </ScrollView>

      {adjItem != null && (
        <StockAdjModal
          item={adjItem}
          storeCode={storeCode}
          onClose={() => setAdjItem(null)}
          onSave={handleStockUpdate}
        />
      )}
      {viewItem != null && (
        <StockAdjViewModal
          item={viewItem}
          onClose={() => setViewItem(null)}
        />
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

// ── Create Item modal styles (must be before the components that reference ci) ─

const ci = StyleSheet.create({
  overlay:         { flex: 1, backgroundColor: 'rgba(0,0,0,0.40)', justifyContent: 'flex-end' },
  kav:             { flex: 1, justifyContent: 'flex-end' },
  sheet:           { backgroundColor: '#FFF', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '94%', overflow: 'hidden' },
  header:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  headerLeft:      { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  headerIconBox:   { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  headerTitle:     { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  headerRight:     { flexDirection: 'row', alignItems: 'center', gap: 7 },
  outlineBtn:      { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6, borderWidth: 1, borderColor: '#007AFF' },
  outlineBtnTxt:   { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#007AFF' },
  fillBtn:         { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6, backgroundColor: '#007AFF' },
  fillBtnTxt:      { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#FFF' },
  searchSection:   { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  fieldLbl:        { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#1C1C1E', marginBottom: 7 },
  searchBox:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 7, paddingHorizontal: 11, backgroundColor: '#FFF' },
  searchInput:     { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, color: '#1C1C1E', paddingVertical: 10 },
  resultList:      { flex: 1 },
  resultRow:       { paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#FAFAFA' },
  resultRowBorder: { borderBottomWidth: 1, borderBottomColor: '#EDEDF0' },
  resultRowPressed:{ backgroundColor: '#F0F0F5' },
  resultTitle:     { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1C1C1E', marginBottom: 3 },
  resultSub:       { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0', lineHeight: 15 },
  noResultsRow:    { flexDirection: 'row', alignItems: 'center', margin: 14, padding: 14, backgroundColor: '#F5F5F7', borderRadius: 10, gap: 12 },
  noResultsTxt:    { fontFamily: FontFamily.regular, fontSize: 12, color: '#3C3C50', flex: 1, lineHeight: 18 },
  noResultsLink:   { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#007AFF' },
  createPlusBtn:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, width: 44, height: 36, borderRadius: 7, backgroundColor: '#30A84B' },
  backBtn:         { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  backBtnTxt:      { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: Colors.primaryHighlight },
  progressWrap:    { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  progressBg:      { flex: 1, height: 5, backgroundColor: '#E0E0E8', borderRadius: 3 },
  progressFill:    { height: 5, backgroundColor: '#E53935', borderRadius: 3 },
  progressFillAvg: { height: 5, backgroundColor: '#30A84B', borderRadius: 3 },
  progressLbl:     { fontFamily: FontFamily.regular, fontSize: 9, color: '#E53935' },
  progressAvg:     { fontFamily: FontFamily.medium, fontSize: 9, fontWeight: '600', color: '#30A84B' },
  formScroll:      { flex: 1 },
  formGroup:       { paddingHorizontal: 14, marginBottom: 10 },
  formLbl:         { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#3C3C50', marginBottom: 5 },
  textInput:       { borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 9, fontFamily: FontFamily.regular, fontSize: 13, color: '#1C1C1E' },
  selectBox:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 14, backgroundColor: '#FAFAFA' },
  selectPlaceholder: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, color: '#BBBBC0' },
  selectVal:       { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, color: '#1C1C1E' },
  sectionLbl:      { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#3C3C50', paddingHorizontal: 14, marginBottom: 6, marginTop: 4 },
  packRow:         { flexDirection: 'row', paddingHorizontal: 14, marginBottom: 10 },
  packField:       { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 7, paddingHorizontal: 8, backgroundColor: '#FAFAFA' },
  packInput:       { flex: 1, fontFamily: FontFamily.regular, fontSize: 12, color: '#1C1C1E', paddingVertical: 8 },
  packUnit:        { fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },
  sectionCard:     { marginHorizontal: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EDEDF2', borderRadius: 9, padding: 12 },
  sectionTitle:    { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1C1C1E', marginBottom: 10 },
  radioRow:        { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  radioOpt:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radioDot:        { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#DCDCE0' },
  radioDotActive:  { borderColor: Colors.primaryHighlight, backgroundColor: Colors.primaryHighlight },
  radioLbl:        { fontFamily: FontFamily.regular, fontSize: 12, color: '#3C3C50' },
  addMoreBtn:      { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, borderWidth: 1, borderColor: '#30A84B', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  addMoreTxt:      { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#30A84B' },
  imgScroll:       { paddingHorizontal: 14, marginBottom: 10 },
  imgScrollContent:{ gap: 8, paddingVertical: 4 },
  imgPlaceholder:  { width: 75, height: 75, borderRadius: 8, borderWidth: 1, borderColor: '#DCDCE0', backgroundColor: '#F5F5F7', alignItems: 'center', justifyContent: 'center' },
  salesQ:          { fontFamily: FontFamily.regular, fontSize: 11, color: '#E53935', marginBottom: 8 },
  salesRow:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  salesRowLbl:     { fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0', width: 110 },
  salesRowVal:     { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#3C3C50', flex: 1 },
  salesInput:      { flex: 1, borderBottomWidth: 1, borderBottomColor: '#DCDCE0', fontFamily: FontFamily.regular, fontSize: 12, color: '#1C1C1E', paddingVertical: 4 },
  formFooter:      { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: '#F0F0F5' },
  nextBtn:         { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 8, backgroundColor: '#595959' },
  saveBtn:         { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 8, backgroundColor: '#595959' },
  footerBtnTxt:    { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
});

// ── Items tab view ────────────────────────────────────────────────────────────

function ItemsTabView({ onCreateItem }: { onCreateItem: () => void }) {
  return (
    <View style={itv.container}>
      <ScrollView contentContainerStyle={itv.list} showsVerticalScrollIndicator={false}>
        {SEARCHABLE_ITEMS.map((it, idx) => (
          <View key={it.code} style={[itv.row, idx < SEARCHABLE_ITEMS.length - 1 && itv.rowBorder]}>
            <View style={itv.rowIcon}>
              <MaterialCommunityIcons name="package-variant-closed" size={18} color={Colors.primaryHighlight} />
            </View>
            <View style={itv.rowInfo}>
              <Text style={itv.rowCode}>{it.code}</Text>
              <Text style={itv.rowDesc} numberOfLines={1}>{it.description}</Text>
              <Text style={itv.rowCompat} numberOfLines={1}>{it.compatibility}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={16} color="#C8C8D4" />
          </View>
        ))}
      </ScrollView>
      <Pressable style={({ pressed }) => [itv.fab, pressed && { opacity: 0.85 }]}
        onPress={onCreateItem}>
        <MaterialCommunityIcons name="plus" size={22} color="#FFF" />
      </Pressable>
    </View>
  );
}

const itv = StyleSheet.create({
  container: { flex: 1 },
  list:      { paddingVertical: 8, paddingBottom: 80 },
  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', gap: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  rowIcon:   { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(233,30,99,0.08)', alignItems: 'center', justifyContent: 'center' },
  rowInfo:   { flex: 1, gap: 2 },
  rowCode:   { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#60607A' },
  rowDesc:   { fontFamily: FontFamily.medium, fontSize: 13, fontWeight: '600', color: '#1C1C1E' },
  rowCompat: { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0' },
  fab:       { position: 'absolute', bottom: 20, right: 20, width: 52, height: 52, borderRadius: 26, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: Colors.primaryHighlight, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.35, shadowRadius: 6 },
});

// ── Create Item modal helpers ─────────────────────────────────────────────────

function CiFieldInput({ label, value, onChangeText, placeholder }: {
  label: string; value: string; onChangeText: (v: string) => void; placeholder?: string;
}) {
  return (
    <View style={ci.formGroup}>
      <Text style={ci.formLbl}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} style={ci.textInput}
        placeholder={placeholder ?? ''} placeholderTextColor="#BBBBC0" />
    </View>
  );
}

function CiFieldSelect({ label, value, placeholder }: {
  label: string; value: string; placeholder: string;
}) {
  return (
    <View style={ci.formGroup}>
      <Text style={ci.formLbl}>{label}</Text>
      <View style={ci.selectBox}>
        <Text style={value ? ci.selectVal : ci.selectPlaceholder} numberOfLines={1}>
          {value || placeholder}
        </Text>
        <MaterialCommunityIcons name="chevron-down" size={15} color="#9090A0" />
      </View>
    </View>
  );
}

// ── Create Item modal ─────────────────────────────────────────────────────────

function CreateItemModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState<'search' | 'create'>('search');
  const [query, setQuery] = useState('');
  const [form,  setForm]  = useState<CreateItemForm>(EMPTY_CREATE_FORM);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SEARCHABLE_ITEMS;
    return SEARCHABLE_ITEMS.filter(i =>
      i.code.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
    );
  }, [query]);

  function resetAll() { setPhase('search'); setQuery(''); setForm(EMPTY_CREATE_FORM); }

  function field<K extends keyof CreateItemForm>(key: K) {
    return (v: CreateItemForm[K]) => setForm(f => ({ ...f, [key]: v }));
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={ci.overlay}>
        <KeyboardAvoidingView
          style={ci.kav}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={ci.sheet}>

            {/* ── Header ── */}
            <View style={ci.header}>
              <View style={ci.headerLeft}>
                <View style={ci.headerIconBox}>
                  <MaterialCommunityIcons name="clipboard-list" size={16} color="#FFF" />
                </View>
                <Text style={ci.headerTitle}>
                  {phase === 'search' ? 'Create Items' : 'Create Item'}
                </Text>
              </View>
              <View style={ci.headerRight}>
                <Pressable style={ci.outlineBtn}>
                  <MaterialCommunityIcons name="chevron-double-left" size={11} color="#007AFF" />
                  <Text style={ci.outlineBtnTxt}>Create Human</Text>
                </Pressable>
                <Pressable style={ci.fillBtn} onPress={resetAll}>
                  <MaterialCommunityIcons name="refresh" size={12} color="#FFF" />
                  <Text style={ci.fillBtnTxt}>Reset</Text>
                </Pressable>
                <Pressable onPress={onClose} hitSlop={10} style={{ paddingLeft: 4 }}>
                  <MaterialCommunityIcons name="close" size={20} color="#60607A" />
                </Pressable>
              </View>
            </View>

            {/* ══ PHASE 1: Search & Select ══ */}
            {phase === 'search' && (
              <>
                <View style={ci.searchSection}>
                  <Text style={ci.fieldLbl}>*Item Description</Text>
                  <View style={ci.searchBox}>
                    <TextInput
                      value={query}
                      onChangeText={setQuery}
                      style={ci.searchInput}
                      placeholder="Search and select"
                      placeholderTextColor="#BBBBC0"
                      autoCapitalize="none"
                    />
                    {query.length > 0 && (
                      <Pressable onPress={() => setQuery('')} hitSlop={8}>
                        <MaterialCommunityIcons name="close" size={16} color="#9090A0" />
                      </Pressable>
                    )}
                  </View>
                </View>

                {filtered.length > 0 ? (
                  <ScrollView style={ci.resultList} keyboardShouldPersistTaps="handled">
                    {filtered.map((it, idx) => (
                      <Pressable key={it.code}
                        style={({ pressed }) => [
                          ci.resultRow,
                          idx < filtered.length - 1 && ci.resultRowBorder,
                          pressed && ci.resultRowPressed,
                        ]}
                        onPress={onClose}>
                        <Text style={ci.resultTitle}>{it.code}-{it.description}</Text>
                        <Text style={ci.resultSub} numberOfLines={2}>{it.compatibility}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                ) : (
                  <View style={ci.noResultsRow}>
                    <Text style={ci.noResultsTxt}>
                      {'No results found. Please '}
                      <Text style={ci.noResultsLink} onPress={() => setPhase('create')}>
                        create a new item
                      </Text>
                    </Text>
                    <Pressable
                      style={({ pressed }) => [ci.createPlusBtn, pressed && { opacity: 0.75 }]}
                      onPress={() => setPhase('create')}>
                      <MaterialCommunityIcons name="plus" size={16} color="#FFF" />
                      <MaterialCommunityIcons name="arrow-right" size={13} color="#FFF" />
                    </Pressable>
                  </View>
                )}
              </>
            )}

            {/* ══ PHASE 2: Create Form ══ */}
            {phase === 'create' && (
              <>
                {/* Back + progress */}
                <Pressable style={ci.backBtn} onPress={() => setPhase('search')}>
                  <MaterialCommunityIcons name="chevron-left" size={15} color={Colors.primaryHighlight} />
                  <Text style={ci.backBtnTxt}>Back to search</Text>
                </Pressable>
                <View style={ci.progressWrap}>
                  <View style={ci.progressBg}>
                    <View style={[ci.progressFill, { width: '35%' }]} />
                  </View>
                  <Text style={ci.progressLbl}>Required ~24%</Text>
                  <View style={ci.progressBg}>
                    <View style={[ci.progressFillAvg, { width: '55%' }]} />
                  </View>
                  <Text style={ci.progressAvg}>Average</Text>
                </View>

                <ScrollView style={ci.formScroll} keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}>

                  {/* Core fields */}
                  <CiFieldSelect label="Item Category"    value={form.category}    placeholder="Spare Parts" />
                  <CiFieldInput  label="*Item Sub Category" value={form.subCategory} onChangeText={field('subCategory')} />
                  <CiFieldSelect label="*Item Brand"      value={form.brand}       placeholder="Search and select" />
                  <CiFieldInput  label="*Item Name"       value={form.itemName}    onChangeText={field('itemName')} />
                  <CiFieldSelect label="Group Name"       value={form.groupName}   placeholder="Search and select" />

                  {/* Packing Size */}
                  <Text style={ci.sectionLbl}>Item Packing Size</Text>
                  <View style={ci.packRow}>
                    {(['packLength', 'packBreadth', 'packHeight'] as const).map((k, i) => (
                      <View key={k} style={[ci.packField, i < 2 && { marginRight: 6 }]}>
                        <TextInput value={form[k]} onChangeText={field(k)}
                          style={ci.packInput} keyboardType="numeric"
                          placeholder={['Length', 'Breadth', 'Height'][i]}
                          placeholderTextColor="#BBBBC0" />
                        <Text style={ci.packUnit}>mm</Text>
                      </View>
                    ))}
                  </View>

                  {/* Item Variance */}
                  <View style={ci.sectionCard}>
                    <Text style={ci.sectionTitle}>Item Variance 1</Text>
                    <Text style={ci.formLbl}>Type</Text>
                    <View style={[ci.selectBox, { marginHorizontal: 0, marginBottom: 8 }]}>
                      <Text style={ci.selectPlaceholder} numberOfLines={1}>Select Item Variance</Text>
                      <MaterialCommunityIcons name="chevron-down" size={15} color="#9090A0" />
                    </View>
                    <Text style={ci.formLbl}>Attribute</Text>
                    <View style={[ci.selectBox, { marginHorizontal: 0 }]}>
                      <Text style={ci.selectPlaceholder} numberOfLines={1}>Select Item Variance Attribute</Text>
                      <MaterialCommunityIcons name="chevron-down" size={15} color="#9090A0" />
                    </View>
                    <Pressable style={ci.addMoreBtn}>
                      <MaterialCommunityIcons name="plus-circle-outline" size={14} color="#30A84B" />
                      <Text style={ci.addMoreTxt}>Add More</Text>
                    </Pressable>
                  </View>

                  {/* Special Item Parameters */}
                  <View style={ci.sectionCard}>
                    <Text style={ci.sectionTitle}>Special Item Parameters</Text>
                    <CiFieldSelect label="*Item Generic" value={form.itemGeneric} placeholder="Search and select" />
                    <Text style={[ci.formLbl, { marginTop: 8, paddingHorizontal: 0 }]}>*Serial Number</Text>
                    <View style={ci.radioRow}>
                      {(['auto', 'manufacture', 'none'] as SerialType[]).map(t => (
                        <Pressable key={t} style={ci.radioOpt}
                          onPress={() => setForm(f => ({ ...f, serialType: t }))}>
                          <View style={[ci.radioDot, form.serialType === t && ci.radioDotActive]} />
                          <Text style={ci.radioLbl}>
                            {t === 'auto' ? 'Auto Generate' : t === 'manufacture' ? 'Enter Manufacture Serial' : 'No Serial'}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Upload Images */}
                  <Text style={ci.sectionLbl}>Upload Common Item Image</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}
                    style={ci.imgScroll} contentContainerStyle={ci.imgScrollContent}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <View key={n} style={ci.imgPlaceholder}>
                        <MaterialCommunityIcons name="image-outline" size={26} color="#C8C8D4" />
                      </View>
                    ))}
                  </ScrollView>

                  {/* Upload Video */}
                  <Text style={[ci.sectionLbl, { marginTop: 4 }]}>Upload Video</Text>
                  <View style={[ci.radioRow, { paddingHorizontal: 14, marginBottom: 10 }]}>
                    {(['Upload File', 'URL'] as const).map(t => (
                      <Pressable key={t} style={ci.radioOpt}>
                        <View style={ci.radioDot} />
                        <Text style={ci.radioLbl}>{t}</Text>
                      </Pressable>
                    ))}
                  </View>

                  {/* Sales Item Name */}
                  <View style={ci.sectionCard}>
                    <Text style={ci.sectionTitle}>Sales Item Name</Text>
                    <Text style={ci.salesQ}>Do you use same as Item description?</Text>
                    <View style={[ci.radioRow, { paddingHorizontal: 0, marginBottom: 10 }]}>
                      {([true, false] as const).map(v => (
                        <Pressable key={String(v)} style={ci.radioOpt}
                          onPress={() => setForm(f => ({ ...f, sameAsDesc: v }))}>
                          <View style={[ci.radioDot, form.sameAsDesc === v && ci.radioDotActive]} />
                          <Text style={ci.radioLbl}>{v ? 'Yes' : 'No'}</Text>
                        </Pressable>
                      ))}
                    </View>
                    <View style={ci.salesRow}>
                      <Text style={ci.salesRowLbl}>Item Description:</Text>
                      <Text style={ci.salesRowVal} numberOfLines={1}>
                        {form.itemName || form.subCategory || 'Spare Parts Vehicle Head Light'}
                      </Text>
                    </View>
                    <View style={[ci.salesRow, { marginTop: 6 }]}>
                      <Text style={ci.salesRowLbl}>Sales Name</Text>
                      <TextInput
                        value={form.sameAsDesc
                          ? (form.itemName || form.subCategory || 'Spare Parts Vehicle Head Light')
                          : form.salesName}
                        onChangeText={field('salesName')}
                        editable={!form.sameAsDesc}
                        style={ci.salesInput}
                      />
                    </View>
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>

                {/* Footer */}
                <View style={ci.formFooter}>
                  <Pressable style={ci.nextBtn}>
                    <Text style={ci.footerBtnTxt}>Next</Text>
                  </Pressable>
                  <Pressable style={ci.saveBtn}>
                    <Text style={ci.footerBtnTxt}>Save</Text>
                  </Pressable>
                </View>
              </>
            )}

          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function StoreDetailScreen() {
  const { navigate, params } = useNavigation();
  const { stores } = useStores();
  const [tab,            setTab]            = useState<Tab>('modules');
  const [pageTab,        setPageTab]        = useState<PageTab>('items-availability');
  const [showCreateItem, setShowCreateItem] = useState(false);

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
          <>
            {/* ── Store info bar ── */}
            <View style={scr.storeBar}>
              <View style={scr.storeBarAccent} />
              <View style={{ flex: 1 }}>
                <Text style={scr.storeBarName} numberOfLines={1}>{title}</Text>
                <Text style={scr.storeBarCode} numberOfLines={1}>{storeCode}</Text>
              </View>
              <Pressable
                onPress={() => navigate('ProcStores')}
                style={({ pressed }) => [scr.changeBtn, pressed && { opacity: 0.6 }]}>
                <Text style={scr.changeBtnTxt}>Change Stores</Text>
              </Pressable>
            </View>

            <View style={scr.tabBarWrap}>
              <PageTabBar
                tabs={STORE_TABS}
                active={pageTab}
                onChange={(t) => { setPageTab(t as PageTab); setTab('modules'); }}
                variant="segment"
              />
            </View>
          </>
        )}

        <View style={[scr.panel, tab !== 'dashboard' && scr.panelOffset]}>
          {tab === 'dashboard' ? (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
              <DashboardView />
            </ScrollView>
          ) : pageTab === 'items-availability' ? (
            <ItemsAvailabilityView storeCode={storeCode} />
          ) : pageTab === 'items' ? (
            <ItemsTabView onCreateItem={() => setShowCreateItem(true)} />
          ) : pageTab === 'simple-grn' ? (
            <PlaceholderView icon="clipboard-list-outline" title="Simple GRN"
              subtitle="Goods Received Notes for this store will appear here." />
          ) : (
            <PlaceholderView icon="chart-bar" title="Report"
              subtitle="Store reports and analytics will appear here." />
          )}
        </View>
      </View>

      <CreateItemModal visible={showCreateItem} onClose={() => setShowCreateItem(false)} />
    </SubModuleLayout>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const scr = StyleSheet.create({
  container:      { flex: 1, paddingTop: 2 },
  storeCodeBar:   { paddingHorizontal: Spacing.md, paddingBottom: 6 },
  storeCodeTxt:   { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#595959' },
  storeBar:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBEBF0', gap: 10 },
  storeBarAccent: { width: 4, height: 36, backgroundColor: '#B71C1C', borderRadius: 2 },
  storeBarName:   { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
  storeBarCode:   { fontFamily: FontFamily.regular, fontSize: 10, color: '#8E8E93', marginTop: 1 },
  changeBtn:      { paddingHorizontal: 8, paddingVertical: 4 },
  changeBtnTxt:   { fontFamily: FontFamily.medium, fontSize: 9, fontWeight: '600', color: Colors.primaryHighlight, fontStyle: 'italic' },
  tabBarWrap:     { paddingHorizontal: Spacing.md, paddingTop: 8 },
  panel:          { flex: 1 },
  panelOffset:    { marginTop: 4 },
});

const ph = StyleSheet.create({
  wrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, gap: 10 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title:      { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, textAlign: 'center' },
  sub:        { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
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
  avatarWrap: { alignItems: 'center', flexShrink: 0 },
  avatarRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  avatarPct:  { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },

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

// Previous GRN pill button
// Damage Stock form
const dmg = StyleSheet.create({
  // Step indicator
  stepBar:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginBottom: 12 },
  stepPill:       { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 20, backgroundColor: '#EDEDF2' },
  stepPillActive: { backgroundColor: 'rgba(229,57,53,0.10)' },
  stepTxt:        { fontFamily: FontFamily.medium, fontSize: 9, fontWeight: '600', color: '#AAAABC' },
  stepTxtActive:  { color: '#E53935' },
  stepLine:       { width: 18, height: 1, backgroundColor: '#DCDCE0' },
  // GRN batch card (Step 1)
  batchCard:      { borderRadius: 10, borderWidth: 1, borderColor: '#EDEDF2', backgroundColor: '#FAFAFA', padding: 10, marginBottom: 8 },
  batchHead:      { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  batchGrnNo:     { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#1C1C1E', flex: 1 },
  batchDate:      { fontFamily: FontFamily.regular, fontSize: 9, color: '#9090A0' },
  batchSupplier:  { fontFamily: FontFamily.regular, fontSize: 10, color: '#60607A', marginBottom: 8 },
  statsRow:       { flexDirection: 'row', gap: 4, marginBottom: 8 },
  statCell:       { flex: 1, alignItems: 'center', paddingVertical: 5, backgroundColor: '#F0F0F5', borderRadius: 6 },
  statCellAvail:  { backgroundColor: 'rgba(48,168,75,0.09)' },
  statCellDmg:    { backgroundColor: 'rgba(229,57,53,0.07)' },
  statLbl:        { fontFamily: FontFamily.regular, fontSize: 7, color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 2 },
  statVal:        { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1C1C1E' },
  statValAvail:   { color: '#30A84B' },
  statValDmg:     { color: '#E53935' },
  priceRow:       { flexDirection: 'row', gap: 6, marginBottom: 8 },
  priceChip:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#F0F0F5', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 5 },
  priceLbl:       { fontFamily: FontFamily.regular, fontSize: 9, color: '#9090A0' },
  priceVal:       { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#3C3C50', flex: 1 },
  proceedBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  proceedTxt:     { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#E53935' },
  // Selected batch banner (Step 2)
  selBanner:      { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(229,57,53,0.05)', borderRadius: 9, borderWidth: 1, borderColor: 'rgba(229,57,53,0.18)', padding: 10, marginBottom: 12, gap: 8 },
  selIcon:        { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(229,57,53,0.12)', alignItems: 'center', justifyContent: 'center' },
  selInfo:        { flex: 1 },
  selGrnNo:       { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#1C1C1E' },
  selSub:         { fontFamily: FontFamily.regular, fontSize: 9, color: '#9090A0', marginTop: 1 },
  selChange:      { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#E53935' },
  // Damage type chips
  typeSection:    { marginBottom: 10 },
  typeLbl:        { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, color: '#9090A0', marginBottom: 6 },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:           { paddingVertical: 4, paddingHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: '#DCDCE0', backgroundColor: '#F7F7FA' },
  chipActive:     { borderColor: '#E53935', backgroundColor: 'rgba(229,57,53,0.07)' },
  chipTxt:        { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#8888A0' },
  chipTxtActive:  { color: '#E53935' },
  // 2-col inputs
  colHeaders:     { flexDirection: 'row', paddingBottom: 4 },
  half:           { flex: 1, gap: 4 },
  halfR:          { paddingLeft: 8 },
  colHdr:         { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldRow:       { flexDirection: 'row', marginBottom: 10 },
  lbl:            { fontFamily: FontFamily.regular, fontSize: 9, color: '#9090A0', marginBottom: 4 },
  box:            { backgroundColor: '#F5F5F7', borderRadius: 7, borderWidth: 1, borderColor: '#DCDCE0', paddingHorizontal: 8 },
  boxRed:         { backgroundColor: 'rgba(229,57,53,0.05)', borderColor: 'rgba(229,57,53,0.28)' },
  input:          { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#1C1C1E', paddingVertical: 7 },
  inputRed:       { color: '#E53935' },
  // Reason note
  noteLbl:        { fontFamily: FontFamily.regular, fontSize: 9, color: '#9090A0', marginBottom: 4 },
  noteBox:        { backgroundColor: '#F5F5F7', borderRadius: 7, borderWidth: 1, borderColor: '#DCDCE0', paddingHorizontal: 10, paddingTop: 8, paddingBottom: 6, minHeight: 60 },
  noteInput:      { fontFamily: FontFamily.regular, fontSize: 11, color: '#1C1C1E', textAlignVertical: 'top' },
  outerWrap:        { gap: 10 },
  // ── Compact horizontal dashboard ──
  dashBoxRow:       { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#EBEBEB', shadowColor: '#8888AA', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
  dashBox:          { flex: 1, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 2, gap: 3 },
  dashBoxVal:       { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  dashBoxLbl:       { fontFamily: FontFamily.regular, fontSize: 7, color: '#9090A0', textAlign: 'center', textTransform: 'uppercase', letterSpacing: 0.3 },
  dashBoxDiv:       { width: 1, alignSelf: 'stretch', backgroundColor: '#EBEBEB' },
  // ── Legacy table styles (kept to avoid ref errors) ──
  dashCard:         {}, dashCardHeader: {}, dashCardTitle: {},
  dashRow:          {}, dashRowDmg: {}, dashRowLeft: {}, dashDot: {}, dashRowLbl: {}, dashRowVal: {},
  // ── Section label ──
  sectionLbl:       { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#9090A0', marginBottom: -4 },
  // ── GRN card ──
  grnCard:          { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#EBEBEB', gap: 8, shadowColor: '#8888AA', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 5, elevation: 1 },
  grnHeader:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  grnIconWrap:      { width: 28, height: 28, borderRadius: 7, backgroundColor: 'rgba(229,57,53,0.09)', alignItems: 'center', justifyContent: 'center' },
  grnNo:            { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1C1C1E', flex: 1 },
  grnDate:          { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0' },
  grnSupplier:      { fontFamily: FontFamily.regular, fontSize: 10, color: '#60607A', marginLeft: 36 },
  // ── Stat badges ──
  badgeRow:         { flexDirection: 'row', gap: 5, flexWrap: 'wrap' },
  badge:            { flex: 1, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 4, borderRadius: 8, minWidth: 60 },
  badgeNeutral:     { backgroundColor: '#F3F3F8' },
  badgeDmgChip:     { backgroundColor: 'rgba(229,57,53,0.08)' },
  badgeAvail:       { backgroundColor: 'rgba(48,168,75,0.09)' },
  badgeEmpty:       { backgroundColor: '#F3F3F8' },
  badgeLbl:         { fontFamily: FontFamily.regular, fontSize: 8, color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 2 },
  badgeVal:         { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
  // ── Per-GRN damage input ──
  grnDmgRow:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(229,57,53,0.04)', borderRadius: 9, paddingHorizontal: 12, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(229,57,53,0.18)' },
  grnDmgLbl:        { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#E53935' },
  grnDmgInputWrap:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  grnDmgInput:      { fontFamily: FontFamily.bold, fontSize: 16, fontWeight: '700', color: '#E53935', paddingVertical: 6, minWidth: 48 },
  grnDmgUnit:       { fontFamily: FontFamily.regular, fontSize: 10, color: 'rgba(229,57,53,0.55)' },
  // ── Per-GRN card Stock Adjustments button ──
  grnAdjFooter:     { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2 },
  grnAdjBtn:        { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#595959', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  grnAdjBtnDisabled:{ backgroundColor: '#EAEAEE' },
  grnAdjBtnTxt:     { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#FFF' },
  // ── Stock Adjustment button ──
  dmgSaveBtn:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 12, backgroundColor: '#595959' },
  dmgSaveBtnDisabled:{ backgroundColor: '#EAEAEE' },
  dmgSaveTxt:       { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
  // ── Report view ──
  reportWrap:        { gap: 14 },
  reportHeader:      { alignItems: 'center', paddingVertical: 12, gap: 5 },
  reportCheckCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#30A84B', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  reportTitle:       { fontFamily: FontFamily.bold, fontSize: 16, fontWeight: '700', color: '#1C1C1E' },
  reportTs:          { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0' },
  reportSummaryRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  reportSummBox:     { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 10 },
  reportSummVal:     { fontFamily: FontFamily.bold, fontSize: 18, fontWeight: '700', color: '#1C1C1E' },
  reportSummLbl:     { fontFamily: FontFamily.regular, fontSize: 8, color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.4, marginTop: 2 },
  reportMeta:        { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  reportTypeChip:    { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#E53935', backgroundColor: 'rgba(229,57,53,0.09)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  reportReasonTxt:   { fontFamily: FontFamily.regular, fontSize: 11, color: '#60607A', flex: 1 },
  reportTableTitle:  { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#9090A0' },
  reportTable:       { borderRadius: 10, borderWidth: 1, borderColor: '#EBEBEB', overflow: 'hidden' },
  reportTableRow:    { flexDirection: 'row', paddingVertical: 8, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  reportTableHead:   { backgroundColor: '#F7F7FA' },
  reportTableRowAlt: { backgroundColor: '#F9F9FC' },
  reportTableCell:   { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#9090A0', flex: 1 },
  reportBtnRow:      { flexDirection: 'row', gap: 8 },
  reportBtn:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 13, borderRadius: 12 },
  reportBtnEdit:     { backgroundColor: '#F0F0F5', borderWidth: 1, borderColor: '#E0E0E8' },
  reportBtnConfirm:  { backgroundColor: '#30A84B' },
  reportBtnTxt:      { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
  // ── Legacy ──
  unitTag:          { fontFamily: FontFamily.regular, fontSize: 9, color: '#AEAEB2', paddingRight: 6 },
  batchRow: {}, batchRowSelected: {}, batchRowIcon: {}, batchRowIconSel: {},
  availBadge: {}, availBadgeEmpty: {}, availVal: {}, availLbl: {},
  dashboard: {}, dTile: {}, dTileNeutral: {}, dTileAmber: {}, dTileRed: {}, dTileGreen: {},
  dTileVal: {}, dTileLbl: {}, dDivider: {}, dashInputWrap: {}, dashInput: {}, dashInputUnit: {},
});

// Stock Adjustment modal — matches EmployeeFormModal structure exactly
const sa = StyleSheet.create({
  // Modal structure
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 },
  modalOverlayTop: { justifyContent: 'flex-start', paddingTop: 22 },
  kav:             { width: '100%' },
  cardWrapper:     { width: '100%' },
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
  form:            { paddingHorizontal: 12, paddingTop: 12, paddingBottom: 80, gap: 10 },

  // Image panel (info tab)
  // Card wrapping the entire image + details block
  imgDetailCard: { flexDirection: 'row', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 8, shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },

  // Left: vertical thumbnail strip
  thumbStrip:        { width: 66, alignItems: 'center', gap: 4 },
  thumbArrowBtn:     { width: 66, height: 26, borderRadius: 6, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  thumbArrowDisabled:{ backgroundColor: '#F8F8FA' },
  thumbList:          { gap: 6 },
  thumbV:            { width: 64, height: 64, borderRadius: 8, overflow: 'hidden', borderWidth: 1.5, borderColor: '#D8D8E0' },

  // Right: main image fills full strip height
  mainRight:     { flex: 1 },
  imgMain:       { flex: 1, width: '100%', backgroundColor: '#F0F0F5', borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: '#DCDCE0' },
  imgFull:       { width: '100%', height: '100%' },
  thumbImg:      { width: '100%', height: '100%' },

  // Compact detail rows (below main image in right column)
  detailSection:    { gap: 0 },
  compactRow:       { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 4, gap: 4 },
  compactRowBorder: { borderBottomWidth: 1, borderBottomColor: '#F4F4F8' },
  compactLbl:       { width: 62, fontFamily: FontFamily.regular, fontSize: 9, color: '#9090A0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, paddingTop: 1, flexShrink: 0 },
  compactVal:       { flex: 1, fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#1C1C1E' },

  // Adjustment fields wrapper card
  detailCard:      { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 14, shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },

  // Radio buttons
  radioCard:           { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, paddingVertical: 2, paddingHorizontal: 6, shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  radioOption:         { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8 },
  radioCircle:         { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: '#CCCCCC', alignItems: 'center', justifyContent: 'center' },
  radioCircleSelected: { borderColor: Colors.primaryHighlight },
  radioDot:            { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primaryHighlight },
  radioLabel:          { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '500', color: '#8E8E93' },
  radioLabelSelected:  { fontFamily: FontFamily.bold, fontWeight: '700', color: Colors.primaryHighlight },
  radioSep:            { width: 1, alignSelf: 'stretch', backgroundColor: '#F0F0F5' },

  // Adjustment fields
  adjField:        { paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5', gap: 6 },
  adjLabel:        { fontFamily: FontFamily.regular, fontSize: 11, color: '#8E8E93' },
  adjInputRow:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', borderRadius: 8, paddingHorizontal: 10, borderWidth: 1, borderColor: '#DCDCE0' },
  adjInput:        { flex: 1, fontFamily: FontFamily.medium, fontSize: 13, fontWeight: '600', color: '#1C1C1E', paddingVertical: 8 },
  spinnerCol:      { gap: 0 },

  // Excess stock input fields (2-col layout)
  exColHeaders: { flexDirection: 'row', paddingTop: 10, paddingBottom: 2 },
  exHalf:       { flex: 1, gap: 3 },
  exHalfR:      { paddingLeft: 7 },
  exColHdr:     { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.4 },
  exRow:        { flexDirection: 'row', paddingVertical: 6 },
  exRowBorder:  { borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  exLbl:        { fontFamily: FontFamily.regular, fontSize: 9, color: '#9090A0' },
  exLblRow:     { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  autoTag:      { backgroundColor: 'rgba(48,168,75,0.12)', borderRadius: 4, paddingHorizontal: 4, paddingVertical: 1 },
  autoTagTxt:   { fontFamily: FontFamily.bold, fontSize: 8, fontWeight: '700', color: '#2E7D32' },
  exBox:        { backgroundColor: '#F5F5F7', borderRadius: 7, borderWidth: 1, borderColor: '#DCDCE0', paddingHorizontal: 8 },
  exBoxLose:    { backgroundColor: 'rgba(233,30,99,0.04)', borderColor: 'rgba(233,30,99,0.22)' },
  exBoxQty:     { backgroundColor: 'rgba(48,168,75,0.05)', borderColor: 'rgba(48,168,75,0.28)' },
  exInput:      { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#1C1C1E', paddingVertical: 7 },
  exInputQty:      { color: '#30A84B' },
  exBoxQtyLarge:   { paddingHorizontal: 10 },
  exInputQtyLarge: { fontSize: 22, fontWeight: '700', paddingVertical: 12 },
  exUnitTag:       { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#30A84B', paddingRight: 8, opacity: 0.8 },
  exUnitTagPrice:  { fontFamily: FontFamily.regular, fontSize: 10, color: '#AEAEB2', paddingRight: 6 },
  grnMatchBtn:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 9, paddingHorizontal: 12, borderRadius: 9, borderWidth: 1, borderColor: 'rgba(233,30,99,0.22)', backgroundColor: 'rgba(233,30,99,0.04)', marginVertical: 8 },
  grnMatchIconCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(233,30,99,0.10)', alignItems: 'center', justifyContent: 'center' },
  grnMatchTxt:        { flex: 1, fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: Colors.primaryHighlight },
  exHalfDivider:      { width: 1, alignSelf: 'stretch', borderLeftWidth: 1, borderStyle: 'dotted', borderColor: '#D0D0D8', marginHorizontal: 6 },


  // Excess stock card header
  excessCardHdr:      { flexDirection: 'row', alignItems: 'center', gap: 7, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  excessCardIconWrap: { width: 20, height: 20, borderRadius: 5, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  excessCardTitle:    { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#595959', flex: 1 },
  excessCardSub:      { fontFamily: FontFamily.regular, fontSize: 9, color: '#AEAEB2' },

  // View Previous GRN action button
  grnActionBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 11, paddingHorizontal: 12, backgroundColor: 'rgba(233,30,99,0.04)', borderRadius: 9, marginTop: 6, marginBottom: 4, borderWidth: 1, borderColor: 'rgba(233,30,99,0.15)' },
  grnActionLeft: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  grnActionTxt:  { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: Colors.primaryHighlight },

  // See more / see less toggle inside detail card
  seeMoreBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 9, borderTopWidth: 1, borderTopColor: '#F0F0F5' },
  seeMoreTxt:  { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: Colors.primaryHighlight },

  // Applied GRN banner
  appliedCard:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 10, marginBottom: 8, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(48,168,75,0.25)', shadowColor: '#30A84B', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.10, shadowRadius: 4, elevation: 2 },
  appliedAccent:     { width: 4, alignSelf: 'stretch', backgroundColor: '#30A84B' },
  appliedIconCircle: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#30A84B', alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  appliedInfo:       { flex: 1, paddingVertical: 8, paddingLeft: 8, gap: 3 },
  appliedGrnNo:      { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1C1C1E' },
  appliedSubRow:     { flexDirection: 'row', alignItems: 'center', gap: 5 },
  appliedTag:        { backgroundColor: 'rgba(48,168,75,0.12)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  appliedTagTxt:     { fontFamily: FontFamily.bold, fontSize: 8, fontWeight: '700', color: '#2E7D32', letterSpacing: 0.5 },
  appliedSupplier:   { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0', flex: 1 },
  appliedActions:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EBEBF0', borderRadius: 8, overflow: 'hidden', marginRight: 8 },
  appliedActionBtn:  { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  appliedActionSep:  { width: 1, height: 20, backgroundColor: '#EBEBF0' },
  appliedRemoveTxt:  { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#E53935' },

  // Fixed serial footer
  serialFooter:           { flexDirection: 'row', gap: 10, paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EBEBEB', backgroundColor: '#F5F5F7' },
  serialFooterBtn:        { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 8, borderRadius: 10, backgroundColor: '#595959' },
  serialFooterBtnOutline: { backgroundColor: '#F0F0F5', borderWidth: 1, borderColor: '#D0D0D8' },
  serialFooterBtnSave:    { backgroundColor: '#595959' },
  serialFooterBtnDisabled:{ backgroundColor: '#EAEAEE' },
  serialFooterTxt:        { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#FFF' },
  serialFooterTxtDisabled:{ color: '#C0C0CC' },

  // Pending state
  pendingWrap:     { alignItems: 'center', paddingVertical: 50, gap: 10 },
  pendingIconRing: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(144,144,160,0.10)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  pendingTitle:    { fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  pendingSubtxt:   { fontFamily: FontFamily.regular, fontSize: 12, color: '#9090A0' },

  // Footer
});

// Tab icon styles — mirrors EmployeeFormModal icon stylesheet
const mti = StyleSheet.create({
  wrap:   { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
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
// Serial modal styles
const sm = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', padding: 14, paddingTop: 24 },
  card:    { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 12, overflow: 'hidden' },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EBEBEB', gap: 10 },
  headerIcon:  { width: 34, height: 34, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  closeBtn:    { width: 30, height: 30, borderRadius: 8, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },

  // Input type row
  topRow:      { paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EBEBEB', gap: 6 },
  typeSection: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  selectLbl:   { fontFamily: FontFamily.regular, fontSize: 11, color: '#595959', flexShrink: 0 },
  radios:      { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  radioOpt:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  radioCircle:    { width: 15, height: 15, borderRadius: 7.5, borderWidth: 2, borderColor: '#CCCCCC', alignItems: 'center', justifyContent: 'center' },
  radioCircleSel: { borderColor: Colors.primaryHighlight },
  radioDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.primaryHighlight },
  radioLbl:    { fontFamily: FontFamily.regular, fontSize: 11, color: '#666' },
  radioLblSel: { fontFamily: FontFamily.bold, fontWeight: '700', color: Colors.primaryHighlight },
  stockMeta:   { flexDirection: 'row', gap: 16, paddingTop: 2 },
  stockItem:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  stockLbl:    { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0' },
  stockVal:    { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1C1C1E' },

  // Batch ranges section
  rangesWrap:    { paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EBEBEB', gap: 7, backgroundColor: '#FAFAFA' },
  rangesTitle:   { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.4 },
  rangeRow:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  prefixInput:   { flex: 2, height: 32, borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 6, paddingHorizontal: 7, fontFamily: FontFamily.regular, fontSize: 11, color: '#1C1C1E', backgroundColor: '#FFF' },
  numFieldWrap:  { flex: 1, flexDirection: 'row', alignItems: 'center', height: 32, borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 6, backgroundColor: '#FFF', paddingLeft: 6, overflow: 'hidden' },
  numField:      { flex: 1, fontFamily: FontFamily.regular, fontSize: 11, color: '#1C1C1E', paddingVertical: 0 },
  spinCols:      { width: 18, borderLeftWidth: 1, borderLeftColor: '#EBEBEB', alignItems: 'center', justifyContent: 'space-evenly', alignSelf: 'stretch' },
  assignedCount: { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#1C1C1E', minWidth: 38, textAlign: 'center' },
  clearRowBtn:   { width: 22, height: 22, borderRadius: 11, backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center' },
  actionBtns:    { flexDirection: 'row', gap: 7 },
  actionBtn:     { paddingHorizontal: 11, paddingVertical: 7, borderRadius: 7, borderWidth: 1, borderColor: '#DCDCE0' },
  btnAddRange:   { backgroundColor: '#F5F5F7' },
  btnGenerate:   { backgroundColor: '#595959', borderColor: '#595959' },
  btnClear:      { backgroundColor: '#F5F5F7' },
  actionBtnTxt:  { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#595959' },

  // Table
  tableWrap:  { flex: 1 },
  tRow:       { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  tHeaderRow: { backgroundColor: '#F5F5F7', borderBottomColor: '#DCDCE0' },
  tDataRow:   { backgroundColor: '#FFFFFF' },
  tCell:      { paddingHorizontal: 7, paddingVertical: 9 },
  tHdrTxt:    { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', color: '#595959', textTransform: 'uppercase', letterSpacing: 0.3 },
  tDataTxt:   { fontFamily: FontFamily.regular, fontSize: 11, color: '#1C1C1E' },
  cHash:      { width: 34, textAlign: 'center' },
  cCode:      { flex: 2 },
  cNote:      { flex: 2 },
  cSerial:    { flex: 3 },
  cOcr:       { width: 44 },
  serialRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serialInput:{ flex: 1, fontFamily: FontFamily.regular, fontSize: 11, color: '#1C1C1E', paddingVertical: 0 },
  ocrCol:     { alignItems: 'center', justifyContent: 'center' },

  // Footer
  footer:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EBEBEB', backgroundColor: '#F5F5F7', gap: 12 },
  pagination: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3 },
  pgBtn:      { width: 26, height: 26, borderRadius: 5, backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center' },
  pgBtnOff:   { backgroundColor: '#F5F5F7' },
  pgInfo:     { flex: 1, fontFamily: FontFamily.regular, fontSize: 11, color: '#595959', textAlign: 'center' },
  doneBtn:    { paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8, backgroundColor: '#595959' },
  doneTxt:    { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
});

// GRN picker bottom-sheet styles
const grn = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.48)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: '#F5F5F7', borderTopLeftRadius: 22, borderTopRightRadius: 22, maxHeight: '80%', paddingBottom: 20 },
  handle:  { width: 38, height: 4, borderRadius: 2, backgroundColor: '#D0D0D8', alignSelf: 'center', marginTop: 10, marginBottom: 2 },

  // Sheet header
  header:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBEBEB', gap: 10 },
  headerIcon: { width: 32, height: 32, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  title:      { fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  subtitle:   { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0', marginTop: 1 },
  closeBtn:   { width: 28, height: 28, borderRadius: 8, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },

  // List
  list:        { },
  listContent: { padding: 12, gap: 10, paddingBottom: 20 },

  // GRN card
  card:       { backgroundColor: '#FFFFFF', borderRadius: 14, overflow: 'hidden', shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.09, shadowRadius: 8, elevation: 3 },

  // Card top row
  cardTop:       { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 12, paddingBottom: 10, gap: 10 },
  cardAccent:    { width: 3, borderRadius: 2, backgroundColor: Colors.primaryHighlight, alignSelf: 'stretch' },
  cardTitleRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  cardGrnNo:     { flex: 1, fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
  dateBadge:     { backgroundColor: '#F2F2F7', borderRadius: 5, paddingHorizontal: 7, paddingVertical: 2 },
  dateText:      { fontFamily: FontFamily.regular, fontSize: 10, color: '#595959' },
  supplierRow:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  supplierText:  { fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },

  // Price grid
  priceGrid:   { marginHorizontal: 12, marginBottom: 2, borderWidth: 1, borderColor: '#EBEBF0', borderRadius: 8, overflow: 'hidden' },
  gridRow:     { flexDirection: 'row' },
  gridBorder:  { borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#EBEBF0' },
  gridLblCell: { flex: 1.4, backgroundColor: '#F9F9FB', paddingHorizontal: 10, paddingVertical: 8, justifyContent: 'center' },
  gridValCell: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  gridLbl:     { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#595959' },
  gridHdr:     { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', color: '#595959', textTransform: 'uppercase', letterSpacing: 0.3 },
  gridVal:     { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1C1C1E' },
  gridValQty:  { color: Colors.primaryHighlight },

  // Card footer + Apply button
  cardFooter:  { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#F0F0F5', backgroundColor: '#FAFAFA' },
  applyBtn:        { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryHighlight, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 9 },
  applyBtnTxt:     { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#FFF' },
  adjBtn:          { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: Colors.primaryHighlight, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 9, marginRight: 'auto' },
  adjBtnTxt:       { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: Colors.primaryHighlight },
  appliedBadge:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#30A84B', paddingHorizontal: 20, paddingVertical: 9, borderRadius: 9 },
  appliedBadgeTxt: { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#FFF' },

  // GRN detail popup
  detOverlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.48)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 24 },
  detCard:     { width: '100%', backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.16, shadowRadius: 14, elevation: 10 },
  detHeader:   { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  detTitle:    { flex: 1, fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
  detRow:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10 },
  detLbl:      { flex: 1, fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },
  detVal:      { flex: 1.5, fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#1C1C1E', textAlign: 'right' },
  detDiv:      { height: 1, backgroundColor: '#F2F2F7', marginHorizontal: 14 },
  detEyeBtn:   { padding: 4 },
});

// Stock Adjustment View modal styles  (View Human pattern)
const av = StyleSheet.create({
  // Centered overlay
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.52)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 20 },

  // Wrapper holds card + absolute close button (so overflow:hidden doesn't clip it)
  cardWrapper: { width: '100%', maxHeight: '82%' },

  // White card — rounded all sides
  card: { width: '100%', backgroundColor: '#FFF', borderRadius: 12, overflow: 'hidden',
          shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 12 },

  // Dark circular X — absolute top-right corner of card
  closeBtn: { position: 'absolute', top: -14, right: -14, width: 36, height: 36, borderRadius: 18,
              backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', zIndex: 10,
              shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6 },

  // Header block
  headerRow:   { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 20 },
  headerIcon:  { width: 52, height: 52, borderRadius: 12, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', color: '#1C1C1E', flex: 1 },

  // Divider
  divider: { height: 1, backgroundColor: '#F0F0F5' },

  // Filter row
  filterRow:             { flexDirection: 'row', alignItems: 'center', gap: 7, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FAFAFA', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  filterChip:            { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1, borderColor: '#E0E0E8', backgroundColor: '#F5F5F7' },
  filterChipAllActive:   { backgroundColor: '#EBEBEE', borderColor: '#9090A0' },
  filterChipExcessActive:{ backgroundColor: 'rgba(48,168,75,0.12)', borderColor: '#30A84B' },
  filterChipDmgActive:   { backgroundColor: 'rgba(229,57,53,0.10)', borderColor: '#E53935' },
  filterChipTxt:         { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#9090A0' },
  countTxt:              { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0' },

  // Scrollable list
  list:        { },
  listContent: { paddingBottom: 24 },
  emptyWrap:   { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyTxt:    { fontFamily: FontFamily.regular, fontSize: 11, color: '#CCCCCC' },

  // Per-record block
  recBlock:       { },
  recBlockBorder: { borderTopWidth: 8, borderTopColor: '#F5F5F7' },
  recSectionLbl:  { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#FAFAFA' },
  recDot:         { width: 8, height: 8, borderRadius: 4 },
  recSectionTxt:  { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', color: '#595959', letterSpacing: 0.3 },

  // Label / value row  (same as View Human)
  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  rowLabel:  { flex: 1, fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },
  rowValue:  { flex: 2, alignItems: 'flex-start' },
  rowTxt:    { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#1C1C1E' },
  rowDiv:    { height: 1, backgroundColor: '#F2F2F7', marginHorizontal: 16 },

  // Type pill badge
  typePill:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  typePillTxt: { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700' },

  // Mini GRN breakdown table
  miniTableWrap:  { paddingHorizontal: 16, paddingBottom: 10 },
  miniTableTitle: { fontFamily: FontFamily.medium, fontSize: 9, fontWeight: '600', color: '#9090A0', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  miniTable:      { borderWidth: 1, borderColor: '#EBEBF0', borderRadius: 8, overflow: 'hidden' },
  miniRow:        { flexDirection: 'row' },
  miniHead:       { backgroundColor: '#F5F5F7' },
  miniRowAlt:     { backgroundColor: '#FAFAFA' },
  miniCell:       { flex: 1, fontFamily: FontFamily.regular, fontSize: 10, color: '#595959', paddingHorizontal: 8, paddingVertical: 6 },
});

const ifhm = StyleSheet.create({
  overlay:        { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  card:           { width: '100%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', maxHeight: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 16, elevation: 12 },
  topBar:         { height: 4 },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  ring:           { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ringPct:        { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },
  headerText:     { flex: 1 },
  title:          { fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  sub:            { fontFamily: FontFamily.regular, fontSize: 11, color: '#8E8E93', marginTop: 2 },
  completeBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 16, marginBottom: 10, marginTop: 4, backgroundColor: 'rgba(48,168,75,0.10)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  completeText:   { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#2E7D32', flex: 1 },
  warnBanner:     { flexDirection: 'row', alignItems: 'center', gap: 6, marginHorizontal: 16, marginBottom: 10, marginTop: 4, backgroundColor: 'rgba(251,140,0,0.10)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  warnText:       { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#E65100', flex: 1 },
  list:           { maxHeight: 380 },
  row:            { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F7' },
  rowBody:        { flex: 1 },
  rowLabel:       { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#1C1C1E', marginBottom: 2 },
  rowValue:       { fontFamily: FontFamily.regular, fontSize: 11, color: '#5A5A6E' },
  rowMissing:     { fontFamily: FontFamily.regular, fontSize: 11, color: '#FB8C00', fontStyle: 'italic' },
});
