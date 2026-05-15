import React, { useState, useMemo } from 'react';
import {
  Image,
  KeyboardAvoidingView,
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
}

const MOCK_GRN: GrnRecord[] = [
  { grnNo: 'GRN-2025-001', date: '15 Jan 2025', supplier: 'Prime Auto Parts Co.',  mainCost: '1,250.00', loseCost: '12.50', mainSell: '1,450.00', loseSell: '14.50', mainQty: '50',  loseQty: '500' },
  { grnNo: 'GRN-2024-089', date: '20 Nov 2024', supplier: 'Auto Supply Ltd.',       mainCost: '1,180.00', loseCost: '11.80', mainSell: '1,380.00', loseSell: '13.80', mainQty: '40',  loseQty: '400' },
  { grnNo: 'GRN-2024-044', date: '05 Aug 2024', supplier: 'Prime Auto Parts Co.',   mainCost: '1,100.00', loseCost: '11.00', mainSell: '1,300.00', loseSell: '13.00', mainQty: '60',  loseQty: '600' },
  { grnNo: 'GRN-2023-128', date: '12 Dec 2023', supplier: 'Minami Trade House',     mainCost: '1,050.00', loseCost: '10.50', mainSell: '1,250.00', loseSell: '12.50', mainQty: '35',  loseQty: '350' },
];

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
}: {
  item: StoreItem;
  onApply: (record: GrnRecord) => void;
  onClose: () => void;
}) {
  return (
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

                {/* Card top: GRN no + date + supplier */}
                <View style={grn.cardTop}>
                  <View style={grn.cardAccent} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <View style={grn.cardTitleRow}>
                      <MaterialCommunityIcons name="file-document-outline" size={13} color={Colors.primaryHighlight} />
                      <Text style={grn.cardGrnNo}>{record.grnNo}</Text>
                      <View style={grn.dateBadge}>
                        <Text style={grn.dateText}>{record.date}</Text>
                      </View>
                    </View>
                    <View style={grn.supplierRow}>
                      <MaterialCommunityIcons name="store-outline" size={11} color="#9090A0" />
                      <Text style={grn.supplierText}>{record.supplier}</Text>
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

                {/* Apply button */}
                <View style={grn.cardFooter}>
                  <Pressable
                    onPress={() => { onApply(record); onClose(); }}
                    style={({ pressed }) => [grn.applyBtn, pressed && { opacity: 0.82 }]}>
                    <MaterialCommunityIcons name="check-circle-outline" size={14} color="#FFF" />
                    <Text style={grn.applyBtnTxt}>Apply</Text>
                  </Pressable>
                </View>

              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

function StockAdjModal({ item, storeCode, onClose }: {
  item: StoreItem;
  storeCode: string;
  onClose: () => void;
}) {
  const [activeTab,    setActiveTab]    = useState<AdjTab>('adjustment');
  const [adjType,      setAdjType]      = useState<'excess' | 'damage' | null>(null);
  const [costPrice,      setCostPrice]      = useState('');
  const [_excessStock,   _setExcessStock]   = useState('');
  const [reasonNote,     _setReasonNote]    = useState('');
  const [damageStock,    setDamageStock]    = useState('');
  const [damageReason,   setDamageReason]   = useState('');
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
  const demoImages = useMemo(() => getDemoImages(item.subCategory), [item.subCategory]);
  const ringColor  = stockRingColor(item.stockBal);

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

  function renderAdjustment() {
    return (
      <>
        {/* ── 1. Radio selector ── */}
        <View style={sa.radioCard}>
          <Pressable onPress={() => setAdjType('excess')} style={sa.radioOption}>
            <View style={[sa.radioCircle, adjType === 'excess' && sa.radioCircleSelected]}>
              {adjType === 'excess' && <View style={sa.radioDot} />}
            </View>
            <Text style={[sa.radioLabel, adjType === 'excess' && sa.radioLabelSelected]}>Excess Stock</Text>
          </Pressable>
          <View style={sa.radioSep} />
          <Pressable onPress={() => setAdjType('damage')} style={sa.radioOption}>
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

                {/* Remove button */}
                <Pressable onPress={removeApplied} hitSlop={10}
                  style={({ pressed }) => [sa.appliedRemoveBtn, pressed && { opacity: 0.7 }]}>
                  <MaterialCommunityIcons name="trash-can-outline" size={14} color="#E53935" />
                </Pressable>
              </View>
            )}

            {/* Column headers — [blank] | main | Qty | /kg | sep | lose | Qty | /g */}
            <View style={sa.pxHeaderRow}>
              <View style={sa.pxLblCol} />
              <View style={sa.pxGrp}>
                <View style={sa.pxPriceSubcol}>
                  <Text style={sa.pxColTitle}>Main</Text>
                  <Text style={sa.pxColUnit}>price</Text>
                </View>
                <View style={sa.pxQtySubcol}>
                  <Text style={sa.pxColTitle}>Qty</Text>
                  <Text style={sa.pxColUnit}>amt</Text>
                </View>
              </View>
              <Text style={sa.pxGrpUnit}>/kg</Text>
              <View style={sa.pxSep} />
              <View style={sa.pxGrp}>
                <View style={sa.pxPriceSubcol}>
                  <Text style={sa.pxColTitle}>Lose</Text>
                  <Text style={sa.pxColUnit}>price</Text>
                </View>
                <View style={sa.pxQtySubcol}>
                  <Text style={sa.pxColTitle}>Qty</Text>
                  <Text style={sa.pxColUnit}>amt</Text>
                </View>
              </View>
              <Text style={sa.pxGrpUnit}>/g</Text>
            </View>

            {/* Cost Price row */}
            <View style={sa.pxRow}>
              <Text style={sa.pxRowLbl}>Cost Price</Text>
              <View style={sa.pxGrp}>
                <View style={sa.pxPriceSubcol}>
                  <View style={sa.pxInputWrap}>
                    <TextInput
                      value={mainCostPrice}
                      onChangeText={setMainCostPrice}
                      keyboardType="numeric"
                      style={sa.pxInput}
                      placeholder="0.00"
                      placeholderTextColor="#BBBBC0"
                    />
                  </View>
                </View>
                <View style={sa.pxQtySubcol}>
                  <View style={[sa.pxInputWrap, sa.pxQtyInputWrap]}>
                    <TextInput
                      value={mainQty}
                      onChangeText={setMainQty}
                      keyboardType="numeric"
                      style={sa.pxInput}
                      placeholder="0"
                      placeholderTextColor="#BBBBC0"
                    />
                  </View>
                </View>
              </View>
              <Text style={sa.pxGrpUnit}>/kg</Text>
              <View style={sa.pxSep} />
              <View style={sa.pxGrp}>
                <View style={sa.pxPriceSubcol}>
                  <View style={sa.pxInputWrap}>
                    <TextInput
                      value={loseCostPrice}
                      onChangeText={setLoseCostPrice}
                      keyboardType="numeric"
                      style={sa.pxInput}
                      placeholder="0.00"
                      placeholderTextColor="#BBBBC0"
                    />
                  </View>
                </View>
                <View style={sa.pxQtySubcol}>
                  <View style={[sa.pxInputWrap, sa.pxQtyInputWrap]}>
                    <TextInput
                      value={loseQty}
                      onChangeText={setLoseQty}
                      keyboardType="numeric"
                      style={sa.pxInput}
                      placeholder="0"
                      placeholderTextColor="#BBBBC0"
                    />
                  </View>
                </View>
              </View>
              <Text style={sa.pxGrpUnit}>/g</Text>
            </View>

            {/* Selling Price row */}
            <View style={[sa.pxRow, { borderBottomWidth: 0 }]}>
              <Text style={sa.pxRowLbl}>Selling Price</Text>
              <View style={sa.pxGrp}>
                <View style={sa.pxPriceSubcol}>
                  <View style={sa.pxInputWrap}>
                    <TextInput
                      value={mainSellPrice}
                      onChangeText={setMainSellPrice}
                      keyboardType="numeric"
                      style={sa.pxInput}
                      placeholder="0.00"
                      placeholderTextColor="#BBBBC0"
                    />
                  </View>
                </View>
                <View style={sa.pxQtySubcol}>
                  <View style={[sa.pxInputWrap, sa.pxQtyInputWrap]}>
                    <TextInput
                      value={mainQty}
                      onChangeText={setMainQty}
                      keyboardType="numeric"
                      style={sa.pxInput}
                      placeholder="0"
                      placeholderTextColor="#BBBBC0"
                    />
                  </View>
                </View>
              </View>
              <Text style={sa.pxGrpUnit}>/kg</Text>
              <View style={sa.pxSep} />
              <View style={sa.pxGrp}>
                <View style={sa.pxPriceSubcol}>
                  <View style={sa.pxInputWrap}>
                    <TextInput
                      value={loseSellPrice}
                      onChangeText={setLoseSellPrice}
                      keyboardType="numeric"
                      style={sa.pxInput}
                      placeholder="0.00"
                      placeholderTextColor="#BBBBC0"
                    />
                  </View>
                </View>
                <View style={sa.pxQtySubcol}>
                  <View style={[sa.pxInputWrap, sa.pxQtyInputWrap]}>
                    <TextInput
                      value={loseQty}
                      onChangeText={setLoseQty}
                      keyboardType="numeric"
                      style={sa.pxInput}
                      placeholder="0"
                      placeholderTextColor="#BBBBC0"
                    />
                  </View>
                </View>
              </View>
              <Text style={sa.pxGrpUnit}>/g</Text>
            </View>

            {/* View Previous GRN */}
            <Pressable onPress={() => setShowGrn(true)} style={sa.viewGrnBtn} hitSlop={8}>
              <MaterialCommunityIcons name="file-document-outline" size={12} color={Colors.primaryHighlight} />
              <Text style={sa.viewGrnTxt}>View Previous GRN</Text>
            </Pressable>

          </View>
        )}

        {/* ── 2. Damage Stock form ── */}
        {adjType === 'damage' && (
          <View style={sa.detailCard}>
            <View style={sa.adjField}>
              <Text style={sa.adjLabel}>Cost Price</Text>
              <View style={sa.adjInputRow}>
                <TextInput value={costPrice} onChangeText={setCostPrice} keyboardType="numeric"
                  style={sa.adjInput} placeholder="0.00" placeholderTextColor="#BBBBC0" />
                <View style={sa.spinnerCol}>
                  <Pressable hitSlop={8} onPress={() => setCostPrice(p => String((parseFloat(p || '0') + 0.01).toFixed(2)))}>
                    <MaterialCommunityIcons name="chevron-up" size={18} color="#888" />
                  </Pressable>
                  <Pressable hitSlop={8} onPress={() => setCostPrice(p => String(Math.max(0, parseFloat(p || '0') - 0.01).toFixed(2)))}>
                    <MaterialCommunityIcons name="chevron-down" size={18} color="#888" />
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={sa.adjField}>
              <Text style={sa.adjLabel}>Damage Stock</Text>
              <View style={sa.adjInputRow}>
                <TextInput value={damageStock} onChangeText={setDamageStock} keyboardType="numeric"
                  style={sa.adjInput} placeholder="0" placeholderTextColor="#BBBBC0" />
                <View style={sa.spinnerCol}>
                  <Pressable hitSlop={8} onPress={() => setDamageStock(p => String(parseInt(p || '0', 10) + 1))}>
                    <MaterialCommunityIcons name="chevron-up" size={18} color="#888" />
                  </Pressable>
                  <Pressable hitSlop={8} onPress={() => setDamageStock(p => String(Math.max(0, parseInt(p || '0', 10) - 1)))}>
                    <MaterialCommunityIcons name="chevron-down" size={18} color="#888" />
                  </Pressable>
                </View>
              </View>
            </View>
            <View style={[sa.adjField, { borderBottomWidth: 0 }]}>
              <Text style={sa.adjLabel}>Damage Reason Note</Text>
              <TextInput value={damageReason} onChangeText={setDamageReason} multiline
                style={[sa.adjInput, { height: 70, textAlignVertical: 'top', paddingTop: 4 }]}
                placeholder="Enter reason…" placeholderTextColor="#BBBBC0" />
            </View>
          </View>
        )}

        {/* ── 3. Item details ── */}
        <View style={sa.detailCard}>
          {DETAIL_ROWS.map(([label, val], i) => (
            <View key={label} style={[sa.compactRow, i < DETAIL_ROWS.length - 1 && sa.compactRowBorder]}>
              <Text style={sa.compactLbl}>{label}</Text>
              <Text style={sa.compactVal} numberOfLines={2}>{val}</Text>
            </View>
          ))}
        </View>

        {/* ── 4. Image card: thumbnail strip left | main image right ── */}
        <View style={sa.imgDetailCard}>

          {/* Left: vertical thumbnail strip */}
          <View style={sa.thumbStrip}>
            <Pressable
              onPress={() => shiftThumb('up')}
              disabled={!canUp}
              style={[sa.thumbArrowBtn, !canUp && sa.thumbArrowDisabled]}>
              <MaterialCommunityIcons name="chevron-up" size={16} color={canUp ? '#595959' : '#D0D0D8'} />
            </Pressable>

            <View style={sa.thumbList} {...thumbPanResponder.panHandlers}>
              {demoImages.slice(thumbStart, thumbStart + VISIBLE).map((uri, i) => {
                const idx = thumbStart + i;
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

        </View>
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

  const serialQty   = adjType === 'excess'
    ? (parseFloat(mainQty) || 0)
    : (parseFloat(damageStock) || 0);
  const serialNote  = adjType === 'excess' ? reasonNote : damageReason;

  return (
    <>
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
                <View style={{ height: 8 }} />
              </ScrollView>

              {/* ── Fixed footer: Add Makers Serial ── */}
              {activeTab === 'adjustment' && (
                <View style={sa.serialFooter}>
                  <Pressable
                    onPress={() => setShowSerial(true)}
                    style={({ pressed }) => [sa.serialFooterBtn, pressed && { opacity: 0.85 }]}>
                    <MaterialCommunityIcons name="barcode" size={15} color="#FFF" />
                    <Text style={sa.serialFooterTxt}>Add Makers Serial</Text>
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
      />
    )}
    </>
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
  modalOverlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 30, paddingBottom: 10, paddingHorizontal: 12 },
  cardWrapper:     { flex: 1, maxHeight: '98%', width: '100%' },
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
  // Card wrapping the entire image + details block
  imgDetailCard: { flexDirection: 'row', gap: 8, backgroundColor: '#FFFFFF', borderRadius: 12, padding: 8, shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },

  // Left: vertical thumbnail strip
  thumbStrip:        { width: 52, alignItems: 'center', gap: 4 },
  thumbArrowBtn:     { width: 52, height: 22, borderRadius: 6, backgroundColor: '#F2F2F7', alignItems: 'center', justifyContent: 'center' },
  thumbArrowDisabled:{ backgroundColor: '#F8F8FA' },
  thumbList:          { gap: 5 },
  thumbV:            { width: 50, height: 50, borderRadius: 7, overflow: 'hidden', borderWidth: 1.5, borderColor: '#D8D8E0' },

  // Right: main image stacked above details
  mainRight:     { flex: 1, gap: 6 },
  imgMain:       { width: '100%', aspectRatio: 4 / 3, backgroundColor: '#F0F0F5', borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: '#DCDCE0' },
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

  // Excess form — main/lose price grid
  pxHeaderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  pxRow:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5', gap: 6 },
  pxLblCol:    { width: 72, flexShrink: 0 },
  pxRowLbl:    { width: 52, fontFamily: FontFamily.regular, fontSize: 8, color: '#8E8E93', flexShrink: 0 },
  pxSep:          { width: 1, alignSelf: 'stretch', backgroundColor: '#F0F0F5', marginHorizontal: 4 },
  pxColTitle:     { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', color: '#595959', textAlign: 'center' },
  pxColUnit:      { fontFamily: FontFamily.regular, fontSize: 9, color: '#9090A0', textAlign: 'center', marginTop: 1 },
  pxInputWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F7', borderRadius: 7, borderWidth: 1, borderColor: '#DCDCE0', paddingHorizontal: 5, gap: 2 },
  pxQtyInputWrap: { backgroundColor: 'rgba(233,30,99,0.05)', borderColor: Colors.primaryHighlight },
  pxInput:        { flex: 1, fontFamily: FontFamily.medium, fontSize: 9, fontWeight: '600', color: '#1C1C1E', paddingVertical: 6 },
  // Grouped two-subcol layout (price + qty per side)
  pxGrp:          { flex: 1, flexDirection: 'row', gap: 4, alignItems: 'center' },
  pxPriceSubcol:  { flex: 5.0 },
  pxQtySubcol:    { flex: 3.0 },
  pxGrpUnit:      { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', color: '#AEAEB2', width: 14, textAlign: 'center' },
  viewGrnBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, paddingVertical: 10 },
  viewGrnTxt:  { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: Colors.primaryHighlight, textDecorationLine: 'underline' },

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
  appliedRemoveBtn:  { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginRight: 6, borderRadius: 8, backgroundColor: 'rgba(229,57,53,0.08)' },
  appliedRemoveTxt:  { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#E53935' },

  // Fixed serial footer
  serialFooter:           { paddingHorizontal: 14, paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#EBEBEB', backgroundColor: '#F5F5F7' },
  serialFooterBtn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13, borderRadius: 10, backgroundColor: '#595959' },
  serialFooterBtnDisabled:{ backgroundColor: '#EAEAEE' },
  serialFooterTxt:        { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
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
  applyBtn:    { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: Colors.primaryHighlight, paddingHorizontal: 20, paddingVertical: 9, borderRadius: 9 },
  applyBtnTxt: { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#FFF' },
});
