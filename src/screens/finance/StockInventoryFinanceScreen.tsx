import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Modal,
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
// "Stock" subtab removed — only Pending Finance Approval + History remain.

const STOCK_SUBTABS = [
  { key: 'pending', label: 'Pending Finance Approval' },
  { key: 'history', label: 'History' },
] as const;

type StockSubTabKey = typeof STOCK_SUBTABS[number]['key'];


const ARROW_W     = 18;
const ROW_GAP     = 6;
const SCROLL_STEP = 120;

// ── Pending Finance Approval types ────────────────────────────────────────────

type AdjType = 'Damage' | 'Excess' | 'ISU' | 'Goods Vehicle' | 'Item';

interface GRNLine {
  id:           string;
  grnNumber:    string;
  grnDate:      string;   // e.g. "08 Apr 2024"
  warehouse:    string;   // e.g. "WH-MAIN-01"
  batchNo:      string;   // e.g. "BT-2241-A"
  unitCost:     string;   // e.g. "LKR 12,250"
  currentStock: string;
  damageStock:  string;
  loseQty:      string;
  mainQty:      string;
}

interface PendingAdjRecord {
  id:             string;
  serialNo:       string;   // Stock No.
  itemNo:         string;   // Item No. (SKU / catalogue)
  type:           AdjType;
  goodsVehicle:   string;
  item:           string;
  qtyMain:        string;
  qtyLose:        string;
  amount:         string;   // formatted amount string e.g. "LKR 24,500"
  grnTypeNo:      string;   // "One" | "Two" | "Three" …
  actionStockAdj: string;
  status:         'Pending';
  grnLines:       GRNLine[];
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
  {
    id: '1', serialNo: 'PA-2024-001', itemNo: 'ITM-2241', type: 'Damage',
    goodsVehicle: 'GV-HINO-001', item: 'Head Light (L-h-s) HINO SCOOP',
    qtyMain: '12', qtyLose: '2', amount: 'LKR 24,500', grnTypeNo: 'One',
    actionStockAdj: 'Reduce stock by 2 units', status: 'Pending',
    grnLines: [
      { id: 'g1-1', grnNumber: 'GRN-2024-0091', grnDate: '08 Apr 2024', warehouse: 'WH-MAIN-01',  batchNo: 'BT-2241-A', unitCost: 'LKR 12,250', currentStock: '12', damageStock: '2', loseQty: '2', mainQty: '10' },
      { id: 'g1-2', grnNumber: 'GRN-2024-0101', grnDate: '08 Apr 2024', warehouse: 'WH-MAIN-02',  batchNo: 'BT-2241-B', unitCost: 'LKR 12,250', currentStock: '5',  damageStock: '0', loseQty: '0', mainQty: '5'  },
      { id: 'g1-3', grnNumber: 'GRN-2024-0102', grnDate: '08 Apr 2024', warehouse: 'WH-SOUTH-01', batchNo: 'BT-2241-C', unitCost: 'LKR 12,250', currentStock: '3',  damageStock: '0', loseQty: '0', mainQty: '3'  },
    ],
  },
  {
    id: '2', serialNo: 'PA-2024-002', itemNo: 'ITM-0882', type: 'Excess',
    goodsVehicle: 'GV-MITS-004', item: 'Dashboard MITSUBISHI CANER WIDE',
    qtyMain: '8', qtyLose: '0', amount: 'LKR 18,000', grnTypeNo: 'Two',
    actionStockAdj: 'Add 3 excess units to stock', status: 'Pending',
    grnLines: [
      { id: 'g2-1', grnNumber: 'GRN-2024-0092', grnDate: '09 Apr 2024', warehouse: 'WH-MAIN-02',  batchNo: 'BT-0882-B', unitCost: 'LKR 9,000', currentStock: '8', damageStock: '0', loseQty: '0', mainQty: '8' },
      { id: 'g2-2', grnNumber: 'GRN-2024-0093', grnDate: '09 Apr 2024', warehouse: 'WH-SOUTH-01', batchNo: 'BT-0882-C', unitCost: 'LKR 9,000', currentStock: '3', damageStock: '0', loseQty: '0', mainQty: '3' },
      { id: 'g2-3', grnNumber: 'GRN-2024-0103', grnDate: '09 Apr 2024', warehouse: 'WH-NORTH-01', batchNo: 'BT-0882-D', unitCost: 'LKR 9,000', currentStock: '5', damageStock: '0', loseQty: '0', mainQty: '5' },
    ],
  },
  {
    id: '3', serialNo: 'PA-2024-003', itemNo: 'ITM-1105', type: 'ISU',
    goodsVehicle: 'GV-ISUZ-002', item: 'Dashboard ISUZU I061 (Black)',
    qtyMain: '25', qtyLose: '0', amount: 'LKR 75,000', grnTypeNo: 'One',
    actionStockAdj: 'Initial balance entry — 25 qty', status: 'Pending',
    grnLines: [
      { id: 'g3-1', grnNumber: 'GRN-2024-0094', grnDate: '10 Apr 2024', warehouse: 'WH-MAIN-01', batchNo: 'BT-1105-A', unitCost: 'LKR 3,000', currentStock: '25', damageStock: '0', loseQty: '0', mainQty: '25' },
      { id: 'g3-2', grnNumber: 'GRN-2024-0104', grnDate: '10 Apr 2024', warehouse: 'WH-MAIN-02', batchNo: 'BT-1105-B', unitCost: 'LKR 3,000', currentStock: '8',  damageStock: '0', loseQty: '0', mainQty: '8'  },
      { id: 'g3-3', grnNumber: 'GRN-2024-0105', grnDate: '10 Apr 2024', warehouse: 'WH-EAST-01', batchNo: 'BT-1105-C', unitCost: 'LKR 3,000', currentStock: '6',  damageStock: '0', loseQty: '0', mainQty: '6'  },
    ],
  },
  {
    id: '4', serialNo: 'PA-2024-004', itemNo: 'ITM-3318', type: 'Goods Vehicle',
    goodsVehicle: 'GV-HINO-007', item: 'Dashboard HINO RANGER (Black) FC',
    qtyMain: '15', qtyLose: '1', amount: 'LKR 32,000', grnTypeNo: 'Three',
    actionStockAdj: 'Vehicle damage — reduce 1 unit', status: 'Pending',
    grnLines: [
      { id: 'g4-1', grnNumber: 'GRN-2024-0095', grnDate: '11 Apr 2024', warehouse: 'WH-MAIN-01', batchNo: 'BT-3318-A', unitCost: 'LKR 10,667', currentStock: '5', damageStock: '1', loseQty: '1', mainQty: '4' },
      { id: 'g4-2', grnNumber: 'GRN-2024-0096', grnDate: '11 Apr 2024', warehouse: 'WH-MAIN-02', batchNo: 'BT-3318-B', unitCost: 'LKR 10,667', currentStock: '6', damageStock: '0', loseQty: '0', mainQty: '6' },
      { id: 'g4-3', grnNumber: 'GRN-2024-0097', grnDate: '11 Apr 2024', warehouse: 'WH-NORTH-01', batchNo: 'BT-3318-C', unitCost: 'LKR 10,667', currentStock: '4', damageStock: '0', loseQty: '0', mainQty: '4' },
    ],
  },
  {
    id: '5', serialNo: 'PA-2024-005', itemNo: 'ITM-0774', type: 'Item',
    goodsVehicle: '—', item: 'Head Light SUZUKI WAGON R STINGRAY',
    qtyMain: '30', qtyLose: '5', amount: 'LKR 56,250', grnTypeNo: 'Two',
    actionStockAdj: 'Write-off 5 damaged units', status: 'Pending',
    grnLines: [
      { id: 'g5-1', grnNumber: 'GRN-2024-0098', grnDate: '12 Apr 2024', warehouse: 'WH-MAIN-01',  batchNo: 'BT-0774-A', unitCost: 'LKR 11,250', currentStock: '18', damageStock: '3', loseQty: '3', mainQty: '15' },
      { id: 'g5-2', grnNumber: 'GRN-2024-0099', grnDate: '12 Apr 2024', warehouse: 'WH-EAST-01',  batchNo: 'BT-0774-B', unitCost: 'LKR 11,250', currentStock: '12', damageStock: '2', loseQty: '2', mainQty: '10' },
      { id: 'g5-3', grnNumber: 'GRN-2024-0106', grnDate: '12 Apr 2024', warehouse: 'WH-NORTH-01', batchNo: 'BT-0774-C', unitCost: 'LKR 11,250', currentStock: '7',  damageStock: '0', loseQty: '0', mainQty: '7'  },
    ],
  },
  {
    id: '6', serialNo: 'PA-2024-006', itemNo: 'ITM-4421', type: 'Damage',
    goodsVehicle: 'GV-HINO-003', item: 'Dashboard HINO PROFIA (Black) TRUCK',
    qtyMain: '10', qtyLose: '3', amount: 'LKR 48,000', grnTypeNo: 'One',
    actionStockAdj: 'Adjust stock — 3 units lost', status: 'Pending',
    grnLines: [
      { id: 'g6-1', grnNumber: 'GRN-2024-0100', grnDate: '13 Apr 2024', warehouse: 'WH-MAIN-01',  batchNo: 'BT-4421-A', unitCost: 'LKR 16,000', currentStock: '10', damageStock: '3', loseQty: '3', mainQty: '7' },
      { id: 'g6-2', grnNumber: 'GRN-2024-0107', grnDate: '13 Apr 2024', warehouse: 'WH-MAIN-02',  batchNo: 'BT-4421-B', unitCost: 'LKR 16,000', currentStock: '4',  damageStock: '0', loseQty: '0', mainQty: '4' },
      { id: 'g6-3', grnNumber: 'GRN-2024-0108', grnDate: '13 Apr 2024', warehouse: 'WH-SOUTH-01', batchNo: 'BT-4421-C', unitCost: 'LKR 16,000', currentStock: '3',  damageStock: '0', loseQty: '0', mainQty: '3' },
    ],
  },
];


// ── Pending Adjustment Card ────────────────────────────────────────────────────

function PendingAdjCard({ record, index, onApplied }: { record: PendingAdjRecord; index: number; onApplied: (id: string) => void }) {
  const { colors, isDarkMode } = useTheme();
  const typeStyle = TYPE_COLORS[record.type];
  const sep = isDarkMode ? '#2C2C2E' : '#EBEBF0';
  const [approveVisible, setApproveVisible] = useState(false);

  return (
    <>
      <View style={[pc.card, isDarkMode && pc.cardDark]}>
        {/* Left accent stripe — colour from type */}
        <View style={[pc.accent, { backgroundColor: typeStyle.text }]} />

        <View style={pc.inner}>

          {/* ── Header: type tag · status · index ── */}
          <View style={pc.header}>
            <View style={[pc.typeBadge, { backgroundColor: typeStyle.bg }]}>
              <Text style={pc.typeTxt}>{TYPE_FULL[record.type]}</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={pc.statusBadge}>
              <MaterialCommunityIcons name="alert-circle" size={14} color="#D97706" />
              <Text style={pc.statusTxt}>Pending</Text>
            </View>
            <Text style={[pc.idx, { color: colors.placeholder, marginLeft: 8 }]}>#{index + 1}</Text>
          </View>

          <View style={[pc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

          {/* ── Stock No. + Item No. ── */}
          <View style={pc.idRow}>
            <View style={pc.idField}>
              <Text style={pc.idLabel}>Store No.</Text>
              <Text style={[pc.idValue, { color: colors.primaryText }]}>{record.serialNo}</Text>
            </View>
            <View style={[pc.idSep, { backgroundColor: sep }]} />
            <View style={pc.idField}>
              <Text style={pc.idLabel}>Item No.</Text>
              <Text style={[pc.idValue, { color: colors.primaryText }]}>{record.itemNo}</Text>
            </View>
          </View>

          <View style={[pc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

          {/* ── Adjustment: Qty. Main · Qty. Lose · Amount ── */}
          <Text style={[pc.adjSectionLabel, { color: colors.placeholder }]}>Adjustment</Text>
          <View style={pc.adjRow}>
            <View style={pc.adjCol}>
              <Text style={pc.adjLabel}>Qty. Main</Text>
              <Text style={[pc.adjValue, { color: colors.primaryText }]}>{record.qtyMain}</Text>
            </View>
            <View style={[pc.adjSep, { backgroundColor: sep }]} />
            <View style={pc.adjCol}>
              <Text style={pc.adjLabel}>Qty. Lose</Text>
              <Text style={[pc.adjValue, { color: record.qtyLose !== '0' ? '#E53935' : colors.primaryText }]}>
                {record.qtyLose}
              </Text>
            </View>
            <View style={[pc.adjSep, { backgroundColor: sep }]} />
            <View style={[pc.adjCol, { flex: 1.6 }]}>
              <Text style={pc.adjLabel}>Amount</Text>
              <Text style={[pc.adjValue, { color: colors.primaryText }]}>{record.amount}</Text>
            </View>
          </View>

          {/* GRN Type No */}
          <View style={pc.grnRow}>
            <Text style={[pc.grnLabel, { color: colors.placeholder }]}>GRN Type No:</Text>
            <Text style={[pc.grnValue, { color: colors.primaryText }]}>{record.grnTypeNo}</Text>
          </View>

          <View style={[pc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

          {/* ── Actions ── */}
          <View style={pc.actions}>
            <Pressable style={({ pressed }) => [pc.btn, pc.btnView, pressed && pc.btnPressed]} hitSlop={4}>
              <MaterialCommunityIcons name="eye-outline" size={13} color="#595959" />
              <Text style={pc.btnTxt}>View</Text>
            </Pressable>
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={() => setApproveVisible(true)}
              style={({ pressed }) => [pc.btn, pc.btnApprove, pressed && pc.btnPressed]}
              hitSlop={4}>
              <MaterialCommunityIcons name="check-circle-outline" size={13} color="#2E7D32" />
              <Text style={pc.btnApproveTxt}>Approve</Text>
            </Pressable>
          </View>

        </View>
      </View>

      {record.type === 'Excess' ? (
        <ExcessApproveModal
          visible={approveVisible}
          onClose={() => setApproveVisible(false)}
          onApplied={() => onApplied(record.id)}
          record={record}
        />
      ) : (
        <DamageApproveModal
          visible={approveVisible}
          onClose={() => setApproveVisible(false)}
          onApplied={() => onApplied(record.id)}
          record={record}
        />
      )}
    </>
  );
}

// ── Damage Approve Modal ───────────────────────────────────────────────────────

type LineState = 'pending' | 'approved' | 'applied' | 'rejected';

interface DamageHistoryEntry {
  id:         string;
  date:       string;
  grnNumber:  string;
  loseQty:    string;
  damageQty:  string;
  reviewedBy: string;
  status:     'Approved' | 'Rejected';
  message?:   string;
}

const DAMAGE_HISTORY: DamageHistoryEntry[] = [
  {
    id: 'dh1', date: '15 Mar 2024', grnNumber: 'GRN-2024-0034',
    loseQty: '1', damageQty: '2', reviewedBy: 'Finance Officer',
    status: 'Approved',
  },
  {
    id: 'dh2', date: '02 Feb 2024', grnNumber: 'GRN-2024-0021',
    loseQty: '3', damageQty: '3', reviewedBy: 'Finance Officer',
    status: 'Rejected',
    message: 'Insufficient documentation. Physical verification required before approval.',
  },
  {
    id: 'dh3', date: '18 Jan 2024', grnNumber: 'GRN-2024-0008',
    loseQty: '1', damageQty: '1', reviewedBy: 'Finance Officer',
    status: 'Approved',
  },
];

function DamageApproveModal({
  visible,
  onClose,
  onApplied,
  record,
}: {
  visible:   boolean;
  onClose:   () => void;
  onApplied: () => void;
  record:    PendingAdjRecord;
}) {
  const { colors, isDarkMode } = useTheme();
  const [lineStates, setLineStates] = useState<Record<string, LineState>>({});
  const [rejectionMessages, setRejectionMessages] = useState<Record<string, string>>({});

  // Reset on each open
  useEffect(() => {
    if (visible) {
      setLineStates({});
      setRejectionMessages({});
    }
  }, [visible, record.id]);

  const getState = (id: string): LineState => lineStates[id] ?? 'pending';

  // Toggle pending ↔ approved (applied is final, cannot be undone)
  const toggleApprove = (id: string) => {
    const cur = getState(id);
    if (cur === 'applied' || cur === 'rejected') return;
    setLineStates(prev => ({ ...prev, [id]: cur === 'pending' ? 'approved' : 'pending' }));
  };

  // Toggle pending ↔ rejected
  const toggleReject = (id: string) => {
    const cur = getState(id);
    if (cur === 'applied') return;
    if (cur === 'rejected') {
      setLineStates(prev => ({ ...prev, [id]: 'pending' }));
      setRejectionMessages(prev => { const n = { ...prev }; delete n[id]; return n; });
    } else {
      setLineStates(prev => ({ ...prev, [id]: 'rejected' }));
    }
  };

  // Update rejection message
  const updateRejectionMessage = (id: string, msg: string) => {
    setRejectionMessages(prev => ({ ...prev, [id]: msg }));
  };

  // Apply all currently-approved lines at once → applied (final)
  const applyAll = () =>
    setLineStates(prev => {
      const n = { ...prev };
      record.grnLines.forEach(l => { if ((n[l.id] ?? 'pending') === 'approved') n[l.id] = 'applied'; });
      return n;
    });

  // Bulk: approve all pending lines
  const approveAll = () =>
    setLineStates(prev => {
      const n = { ...prev };
      record.grnLines.forEach(l => { if ((n[l.id] ?? 'pending') === 'pending') n[l.id] = 'approved'; });
      return n;
    });

  // Bulk: reset all non-applied lines back to pending, clear messages
  const clearAll = () => {
    setLineStates(prev => {
      const n = { ...prev };
      record.grnLines.forEach(l => { if (n[l.id] !== 'applied') n[l.id] = 'pending'; });
      return n;
    });
    setRejectionMessages(prev => {
      const n = { ...prev };
      record.grnLines.forEach(l => { if (lineStates[l.id] !== 'applied') delete n[l.id]; });
      return n;
    });
  };

  const total       = record.grnLines.length;
  const appliedCnt  = record.grnLines.filter(l => getState(l.id) === 'applied').length;
  const approvedCnt = record.grnLines.filter(l => getState(l.id) === 'approved').length;
  const rejectedCnt = record.grnLines.filter(l => getState(l.id) === 'rejected').length;
  const pendingCnt  = record.grnLines.filter(l => getState(l.id) === 'pending').length;
  const allApplied  = appliedCnt === total;
  const hasPending  = pendingCnt > 0;

  const div = isDarkMode ? '#2C2C2E' : '#EBEBF0';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={am.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Wrapper lets the floating close button overflow the card edge */}
        <View style={[am.cardWrap, { height: '84%' }]}>

          {/* ── Floating close button — Human Management modal style ── */}
          <Pressable
            onPress={onClose}
            hitSlop={16}
            style={({ pressed }) => [am.floatClose, pressed && { opacity: 0.6 }]}>
            <View style={am.floatCloseXL} />
            <View style={am.floatCloseXR} />
          </Pressable>

          <View style={[am.card, { flex: 1 }, isDarkMode && am.cardDark]}>

            {/* ── Top accent stripe ── */}
            <View style={am.topAccent} />

            {/* ── Header ── */}
            <View style={[am.header, { borderBottomColor: div }]}>
              <Text style={[am.title, { color: colors.primaryText }]}>Approve Damage</Text>
              <View style={am.subtitleRow}>
                <MaterialCommunityIcons name="barcode" size={11} color={colors.placeholder} />
                <Text style={[am.serialTxt, { color: colors.placeholder }]}>{record.serialNo}</Text>
              </View>
              <Text style={[am.itemTxt, { color: colors.primaryText }]} numberOfLines={2}>{record.itemNo}</Text>
            </View>

            {/* ── Bulk controls: [Approve All] ── progress ── [Clear all] ── */}
            <View style={[am.bulkRow, { borderBottomColor: div }]}>
              <Pressable
                onPress={approveAll}
                disabled={!hasPending}
                hitSlop={8}
                style={({ pressed }) => [am.bulkBtn, !hasPending && am.bulkBtnDimmed, pressed && { opacity: 0.7 }]}>
                <MaterialCommunityIcons name="check-all" size={13} color={hasPending ? '#2E7D32' : '#A0A0A6'} />
                <Text style={[am.bulkBtnTxt, { color: hasPending ? '#2E7D32' : '#A0A0A6' }]}>Approve All</Text>
              </Pressable>

              <View style={am.progressWrap}>
                <Text style={[am.progressLabel, { color: allApplied ? '#2E7D32' : colors.placeholder }]}>
                  {appliedCnt}/{total}
                </Text>
                <View style={[am.progressTrack, { backgroundColor: isDarkMode ? '#3A3A3C' : '#E0E0E6' }]}>
                  <View style={[am.progressFill, {
                    width: total > 0 ? `${(appliedCnt / total) * 100}%` : '0%',
                    backgroundColor: allApplied ? '#2E7D32' : '#F59E0B',
                  }]} />
                </View>
              </View>

              <Pressable
                onPress={clearAll}
                disabled={approvedCnt === 0}
                hitSlop={8}
                style={({ pressed }) => [am.clearBtn, approvedCnt === 0 && am.clearBtnDimmed, pressed && { opacity: 0.7 }]}>
                <MaterialCommunityIcons name="close-circle-outline" size={13} color={approvedCnt === 0 ? '#C0C0C6' : '#C62828'} />
                <Text style={[am.clearTxt, approvedCnt === 0 && am.clearTxtDisabled]}>Clear all</Text>
              </Pressable>
            </View>

            {/* ── Column headers ── */}
            <View style={[am.tableHead, { borderBottomColor: div }]}>
              <View style={am.thGrn}>
                <Text style={am.thTxt}>GRN  ·  Date  ·  Warehouse</Text>
              </View>
              <Text style={am.thNum}>C.Stk</Text>
              <Text style={am.thNum}>Dmg</Text>
              <Text style={am.thNum}>Lose</Text>
              <Text style={am.thNum}>Main</Text>
              <View style={am.thAct} />
            </View>

            {/* ── GRN rows (Excel-style) ── */}
            <ScrollView
              style={am.listScroll}
              contentContainerStyle={am.listContent}
              showsVerticalScrollIndicator={false}>

              {record.grnLines.map((line, idx) => {
                const isFirst    = idx === 0;
                const isDisabled = !isFirst;
                const state      = getState(line.id);
                const isApproved = state === 'approved';
                const isApplied  = state === 'applied';
                const isRejected = state === 'rejected';
                const isDone     = isApproved || isApplied || isRejected;
                const isLast     = idx === record.grnLines.length - 1;

                return (
                  // Outer wrapper — column layout so the reject panel sits BELOW the row
                  <View
                    key={line.id}
                    style={isRejected ? { borderLeftWidth: 3, borderLeftColor: '#C62828' } : undefined}>

                    {/* ── Horizontal row content ── */}
                    <View style={[
                      am.tableRow,
                      isDarkMode && am.tableRowDark,
                      isApproved && am.tableRowApproved,
                      isApplied  && am.tableRowApplied,
                      isRejected && { backgroundColor: 'rgba(198,40,40,0.07)', borderBottomWidth: 0 },
                      isDisabled && am.tableRowDisabled,
                      !isRejected && isLast && { borderBottomWidth: 0 },
                    ]}>

                      {/* GRN info */}
                      <View style={am.tdGrn}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <MaterialCommunityIcons
                            name="file-document-outline"
                            size={10}
                            color={isDisabled ? '#C0C0C6' : (isRejected ? '#C62828' : (isDone ? '#2E7D32' : colors.placeholder))}
                          />
                          <Text
                            style={[am.tdGrnNum, { color: isDisabled ? '#B0B0B8' : (isRejected ? '#C62828' : (isDone ? '#2E7D32' : colors.primaryText)) }]}
                            numberOfLines={1}>
                            {line.grnNumber}
                          </Text>
                        </View>
                        <Text
                          style={[am.tdGrnMeta, { color: isDisabled ? '#C8C8CC' : (isRejected ? 'rgba(198,40,40,0.65)' : (isDone ? 'rgba(46,125,50,0.65)' : colors.placeholder)) }]}
                          numberOfLines={1}>
                          {line.grnDate}  ·  {line.warehouse}
                        </Text>
                      </View>

                      {/* Qty columns */}
                      <Text style={[am.tdNum, { color: isDisabled ? '#C0C0C6' : (isRejected ? 'rgba(198,40,40,0.5)' : colors.primaryText) }]}>{line.currentStock}</Text>
                      <Text style={[am.tdNum, { color: isDisabled ? '#D8B0B0' : (isRejected ? 'rgba(198,40,40,0.5)' : (line.damageStock !== '0' ? '#C62828' : colors.placeholder)) }]}>{line.damageStock}</Text>
                      <Text style={[am.tdNum, { color: isDisabled ? '#D8C0A8' : (isRejected ? 'rgba(198,40,40,0.5)' : (line.loseQty !== '0' ? '#E65100' : colors.placeholder)) }]}>{line.loseQty}</Text>
                      <Text style={[am.tdNum, { color: isDisabled ? '#C0C0C6' : (isRejected ? 'rgba(198,40,40,0.5)' : colors.primaryText) }]}>{line.mainQty}</Text>

                      {/* Action column */}
                      <View style={am.tdActContainer}>
                        {isDisabled ? (
                          // Locked row — no buttons
                          <View style={am.tdAct}>
                            <View style={am.disabledCircle}>
                              <MaterialCommunityIcons name="lock-outline" size={10} color="#C0C0C6" />
                            </View>
                          </View>
                        ) : (
                          // Active row — approve + reject
                          <>
                            <View style={am.tdAct}>
                              {isApplied ? (
                                <MaterialCommunityIcons name="check-circle" size={20} color="#2E7D32" />
                              ) : isRejected ? (
                                <MaterialCommunityIcons name="close-circle" size={20} color="#C62828" />
                              ) : (
                                <Pressable
                                  onPress={() => toggleApprove(line.id)}
                                  hitSlop={8}
                                  style={({ pressed }) => [
                                    am.approveCircle,
                                    isApproved && am.approveCircleOn,
                                    pressed    && { opacity: 0.7 },
                                  ]}>
                                  <MaterialCommunityIcons
                                    name="check"
                                    size={11}
                                    color={isApproved ? '#FFFFFF' : '#B0B0B8'}
                                  />
                                </Pressable>
                              )}
                            </View>
                            {!isApplied && (
                              <Pressable
                                onPress={() => toggleReject(line.id)}
                                hitSlop={8}
                                style={({ pressed }) => [
                                  am.rejectBtn,
                                  isRejected && am.rejectBtnActive,
                                  pressed && { opacity: 0.7 },
                                ]}>
                                <MaterialCommunityIcons
                                  name="close"
                                  size={11}
                                  color={isRejected ? '#FFFFFF' : '#C0C0C6'}
                                />
                              </Pressable>
                            )}
                          </>
                        )}
                      </View>
                    </View>

                    {/* ── Reject panel — appears inline below the row ── */}
                    {isRejected && (
                      <View style={[
                        am.rejectPanel,
                        { backgroundColor: isDarkMode ? '#271A1A' : '#FFF8F7', borderBottomColor: div },
                        isLast && { borderBottomWidth: 0 },
                      ]}>
                        {/* Header row */}
                        <View style={am.rejectPanelHeader}>
                          <View style={am.rejectPanelIcon}>
                            <MaterialCommunityIcons name="message-alert-outline" size={12} color="#C62828" />
                          </View>
                          <Text style={[am.rejectPanelTitle, { color: '#C62828' }]}>
                            Rejection Reason
                          </Text>
                          <Pressable
                            onPress={() => toggleReject(line.id)}
                            hitSlop={8}
                            style={({ pressed }) => [am.rejectUndo, pressed && { opacity: 0.6 }]}>
                            <MaterialCommunityIcons name="undo-variant" size={13} color="#8E8E93" />
                            <Text style={[am.rejectUndoTxt, { color: '#8E8E93' }]}>Undo</Text>
                          </Pressable>
                        </View>

                        {/* Text input */}
                        <TextInput
                          style={[
                            am.rejectInput,
                            {
                              borderColor: (rejectionMessages[line.id] ?? '').length > 0
                                ? '#C62828'
                                : (isDarkMode ? '#5A2A2A' : '#FFCDD2'),
                              color: colors.primaryText,
                              backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
                            },
                          ]}
                          placeholder="Type rejection reason here…"
                          placeholderTextColor={isDarkMode ? '#6E4040' : '#F4A0A0'}
                          value={rejectionMessages[line.id] ?? ''}
                          onChangeText={(msg) => updateRejectionMessage(line.id, msg)}
                          multiline
                          maxLength={500}
                        />

                        {/* Char count */}
                        <Text style={[am.rejectHint, { color: colors.placeholder, textAlign: 'right', marginTop: 4 }]}>
                          {(rejectionMessages[line.id] ?? '').length} / 500
                        </Text>
                      </View>
                    )}
                  </View>
                );
              })}
              <View style={[am.histSection, { borderTopColor: div }]}>
                <View style={[am.histHeader, { borderBottomColor: div }]}>
                  <MaterialCommunityIcons name="history" size={13} color="#8E8E93" />
                  <Text style={[am.histTitle, { color: colors.primaryText }]}>History</Text>
                </View>

                {DAMAGE_HISTORY.map((h, i) => (
                  <View
                    key={h.id}
                    style={[
                      am.histRow,
                      { borderBottomColor: div },
                      i === DAMAGE_HISTORY.length - 1 && { borderBottomWidth: 0 },
                    ]}>
                    <View style={am.histInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <Text style={[am.histGrn, { color: colors.primaryText }]}>{h.grnNumber}</Text>
                        <Text style={[am.histDate, { color: colors.placeholder }]}>· {h.date}</Text>
                      </View>
                      <Text style={[am.histQty, { color: colors.placeholder }]}>
                        Lose: {h.loseQty}  ·  Dmg: {h.damageQty}  ·  {h.reviewedBy}
                      </Text>
                      {h.status === 'Rejected' && h.message && (
                        <View style={am.rejectNote}>
                          <MaterialCommunityIcons name="information-outline" size={11} color="#C62828" style={{ marginTop: 1 }} />
                          <Text style={am.rejectMsg}>{h.message}</Text>
                        </View>
                      )}
                    </View>
                    <View style={[am.histBadge, h.status === 'Approved' ? am.histBadgeApproved : am.histBadgeRejected]}>
                      <MaterialCommunityIcons
                        name={h.status === 'Approved' ? 'check' : 'close'}
                        size={10}
                        color={h.status === 'Approved' ? '#2E7D32' : '#C62828'}
                      />
                      <Text style={[am.histBadgeTxt, { color: h.status === 'Approved' ? '#2E7D32' : '#C62828' }]}>
                        {h.status}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>

            </ScrollView>

            {/* ── Footer ── */}
            <View style={[am.footer, { borderTopColor: div }]}>
              {/* Stat pills */}
              <View style={am.footerStats}>
                {approvedCnt > 0 && (
                  <View style={[am.statPill, { backgroundColor: 'rgba(46,125,50,0.11)' }]}>
                    <MaterialCommunityIcons name="check" size={10} color="#2E7D32" />
                    <Text style={[am.statPillTxt, { color: '#2E7D32' }]}>{approvedCnt} approved</Text>
                  </View>
                )}
                {rejectedCnt > 0 && (
                  <View style={[am.statPill, { backgroundColor: 'rgba(198,40,40,0.11)' }]}>
                    <MaterialCommunityIcons name="close" size={10} color="#C62828" />
                    <Text style={[am.statPillTxt, { color: '#C62828' }]}>{rejectedCnt} rejected</Text>
                  </View>
                )}
                {pendingCnt > 0 && (
                  <View style={[am.statPill, { backgroundColor: 'rgba(245,158,11,0.11)' }]}>
                    <MaterialCommunityIcons name="clock-outline" size={10} color="#D97706" />
                    <Text style={[am.statPillTxt, { color: '#D97706' }]}>{pendingCnt} pending</Text>
                  </View>
                )}
                {appliedCnt > 0 && (
                  <View style={[am.statPill, { backgroundColor: 'rgba(46,125,50,0.18)' }]}>
                    <MaterialCommunityIcons name="check-circle-outline" size={10} color="#1B5E20" />
                    <Text style={[am.statPillTxt, { color: '#1B5E20' }]}>{appliedCnt} applied</Text>
                  </View>
                )}
              </View>
              {/* Apply button */}
              <Pressable
                disabled={approvedCnt === 0 && !allApplied}
                onPress={allApplied ? () => { onApplied(); onClose(); } : applyAll}
                style={({ pressed }) => [
                  am.applyBtn,
                  (approvedCnt === 0 && !allApplied) && am.applyBtnDisabled,
                  (approvedCnt > 0   || allApplied)  && am.applyBtnActive,
                  (approvedCnt > 0   || allApplied)  && pressed && { opacity: 0.82 },
                ]}>
                <MaterialCommunityIcons
                  name={allApplied ? 'check-circle' : 'check-all'}
                  size={17}
                  color="#FFF"
                />
                <Text style={am.applyBtnTxt}>
                  {allApplied
                    ? 'Done — All Applied'
                    : approvedCnt > 0
                      ? `Apply & Approve  (${approvedCnt})`
                      : 'Apply & Approve'}
                </Text>
              </Pressable>
            </View>

          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Pending Finance Approval tab ───────────────────────────────────────────────

// ── Excess Approve Modal ──────────────────────────────────────────────────────

interface PriceGrn {
  id: string; date: string; supplier: string;
  sellMain: string; sellLose: string;
  costMain: string; costLose: string;
}

const PRICE_GRNS: PriceGrn[] = [
  { id: 'GRN-2025-001', date: '15 Jan 2025', supplier: 'Prime Auto Parts Co.',  sellMain: '1,450.00', sellLose: '14.50', costMain: '1,250.00', costLose: '12.50' },
  { id: 'GRN-2024-089', date: '20 Nov 2024', supplier: 'Auto Supply Ltd.',       sellMain: '1,380.00', sellLose: '13.80', costMain: '1,180.00', costLose: '11.80' },
  { id: 'GRN-2024-044', date: '05 Aug 2024', supplier: 'Prime Auto Parts Co.',   sellMain: '1,300.00', sellLose: '13.00', costMain: '1,100.00', costLose: '11.00' },
  { id: 'GRN-2023-128', date: '12 Dec 2023', supplier: 'Minami Trade House',     sellMain: '1,250.00', sellLose: '12.50', costMain: '1,050.00', costLose: '10.50' },
];

function ExcessApproveModal({
  visible, onClose, onApplied, record,
}: {
  visible:   boolean;
  onClose:   () => void;
  onApplied: () => void;
  record:    PendingAdjRecord;
}) {
  const { colors, isDarkMode } = useTheme();
  const [pricingMode,  setPricingMode]  = useState<'customize' | 'match-grn' | null>(null);
  const [sellMain,     setSellMain]     = useState('');
  const [sellLose,     setSellLose]     = useState('');
  const [costMain,     setCostMain]     = useState('');
  const [costLose,     setCostLose]     = useState('');
  const [appliedPrGrn, setAppliedPrGrn] = useState<PriceGrn | null>(null);
  const [pendingPrGrn, setPendingPrGrn] = useState<PriceGrn | null>(null);
  const [prGrnSearch,  setPrGrnSearch]  = useState('');

  useEffect(() => {
    if (visible) {
      setPricingMode(null);
      setSellMain(''); setSellLose('');
      setCostMain(''); setCostLose('');
      setAppliedPrGrn(null); setPendingPrGrn(null);
      setPrGrnSearch('');
    }
  }, [visible, record.id]);

  const filteredPrGrns = useMemo(() => {
    const q = prGrnSearch.trim().toLowerCase();
    if (!q) return PRICE_GRNS;
    return PRICE_GRNS.filter(g =>
      g.id.toLowerCase().includes(q) ||
      g.supplier.toLowerCase().includes(q),
    );
  }, [prGrnSearch]);

  function handleSetPricingMode(mode: 'customize' | 'match-grn' | null) {
    setPricingMode(mode);
    setAppliedPrGrn(null); setPendingPrGrn(null);
    setSellMain(''); setSellLose('');
    setCostMain(''); setCostLose('');
    setPrGrnSearch('');
  }

  function handleApplyPrGrn() {
    if (!pendingPrGrn) return;
    setSellMain(pendingPrGrn.sellMain); setSellLose(pendingPrGrn.sellLose);
    setCostMain(pendingPrGrn.costMain); setCostLose(pendingPrGrn.costLose);
    setAppliedPrGrn(pendingPrGrn); setPendingPrGrn(null);
  }

  function clearPrGrn() {
    setAppliedPrGrn(null); setPendingPrGrn(null);
    setSellMain(''); setSellLose('');
    setCostMain(''); setCostLose('');
    setPrGrnSearch('');
  }

  const pricingReady = pricingMode === 'customize'
    ? sellMain !== '' && sellLose !== '' && costMain !== '' && costLose !== ''
    : pricingMode === 'match-grn'
      ? appliedPrGrn !== null
      : false;

  const div = isDarkMode ? '#2C2C2E' : '#EBEBF0';

  const screenH = Dimensions.get('window').height;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={am.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={[am.cardWrap, { maxHeight: '88%' }]}>
          {/* Floating close — Human Management style */}
          <Pressable onPress={onClose} hitSlop={16} style={({ pressed }) => [am.floatClose, pressed && { opacity: 0.6 }]}>
            <View style={am.floatCloseXL} /><View style={am.floatCloseXR} />
          </Pressable>

          <View style={[am.card, isDarkMode && am.cardDark]}>

            {/* Header */}
            <View style={[am.header, { borderBottomColor: div }]}>
              <Text style={[am.title, { color: colors.primaryText }]}>Approve Excess</Text>
              <View style={am.subtitleRow}>
                <MaterialCommunityIcons name="barcode" size={11} color={colors.placeholder} />
                <Text style={[am.serialTxt, { color: colors.placeholder }]}>{record.serialNo}</Text>
              </View>
              <Text style={[am.itemTxt, { color: colors.primaryText }]} numberOfLines={2}>{record.itemNo}</Text>
            </View>

            {/* Content — two-screen flow */}
            {pricingMode === null ? (
              /* ── Screen 1: option selection — plain View, wraps content ── */
              <View style={em.selListContent}>
                <Text style={[em.selHint, { color: colors.placeholder }]}>
                  Choose how to set prices for this item
                </Text>

                {/* Customize Price */}
                <Pressable
                  onPress={() => handleSetPricingMode('customize')}
                  style={({ pressed }) => [em.selCard, isDarkMode && em.selCardDark, pressed && { opacity: 0.8 }]}>
                  <View style={[em.selIcon, { backgroundColor: 'rgba(21,101,192,0.10)' }]}>
                    <MaterialCommunityIcons name="pencil-box-outline" size={22} color="#1565C0" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[em.selTitle, { color: colors.primaryText }]}>Customize Price</Text>
                    <Text style={[em.selSub, { color: colors.placeholder }]}>Enter prices manually</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={isDarkMode ? '#5A5A5C' : '#C0C0C8'} />
                </Pressable>

                {/* "or" divider */}
                <View style={em.selOrRow}>
                  <View style={[em.selOrLine, { backgroundColor: isDarkMode ? '#3A3A3C' : '#E8E8F0' }]} />
                  <Text style={[em.selOrTxt, { color: colors.placeholder }]}>or</Text>
                  <View style={[em.selOrLine, { backgroundColor: isDarkMode ? '#3A3A3C' : '#E8E8F0' }]} />
                </View>

                {/* Match Previous GRN */}
                <Pressable
                  onPress={() => handleSetPricingMode('match-grn')}
                  style={({ pressed }) => [em.selCard, isDarkMode && em.selCardDark, pressed && { opacity: 0.8 }]}>
                  <View style={[em.selIcon, { backgroundColor: 'rgba(21,101,192,0.10)' }]}>
                    <MaterialCommunityIcons name="file-clock-outline" size={22} color="#1565C0" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[em.selTitle, { color: colors.primaryText }]}>Match Previous GRN</Text>
                    <Text style={[em.selSub, { color: colors.placeholder }]}>Import prices from a past GRN</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={20} color={isDarkMode ? '#5A5A5C' : '#C0C0C8'} />
                </Pressable>
              </View>
            ) : (
              /* ── Screen 2: form ── */
              <>
                {/* Mode bar */}
                <View style={[em.modeBar, { borderBottomColor: div }]}>
                  <View style={em.modeBarIcon}>
                    <MaterialCommunityIcons
                      name={pricingMode === 'customize' ? 'pencil-box-outline' : 'file-clock-outline'}
                      size={15} color="#1565C0" />
                  </View>
                  <Text style={[em.modeBarTitle, { color: colors.primaryText }]}>
                    {pricingMode === 'customize' ? 'Customize Price' : 'Match Previous GRN'}
                  </Text>
                  <Pressable onPress={() => handleSetPricingMode(null)} hitSlop={10}>
                    <Text style={em.optChangeTxt}>change</Text>
                  </Pressable>
                </View>

                {/* Qty Sent reference bar — loaded from stock adjustment */}
                <View style={[em.qtySentBar, { backgroundColor: isDarkMode ? '#1C1C1E' : '#F4F6FB', borderBottomColor: div }]}>
                  <MaterialCommunityIcons name="truck-delivery-outline" size={13} color="#1565C0" />
                  <Text style={[em.qtySentLbl, { color: colors.placeholder }]}>Qty Sent</Text>
                  <View style={em.qtySentPills}>
                    <View style={[em.qtySentPill, { backgroundColor: isDarkMode ? '#2C2C2E' : '#E8EDF8' }]}>
                      <Text style={[em.qtySentUnit, { color: colors.placeholder }]}>MAIN</Text>
                      <Text style={[em.qtySentVal, { color: colors.primaryText }]}>{record.qtyMain}</Text>
                      <Text style={[em.qtySentUnit, { color: colors.placeholder }]}>kg</Text>
                    </View>
                    <View style={[em.qtySentPill, { backgroundColor: isDarkMode ? '#2C2C2E' : '#E8EDF8' }]}>
                      <Text style={[em.qtySentUnit, { color: colors.placeholder }]}>LOSE</Text>
                      <Text style={[em.qtySentVal, { color: colors.primaryText }]}>{record.qtyLose}</Text>
                      <Text style={[em.qtySentUnit, { color: colors.placeholder }]}>g</Text>
                    </View>
                  </View>
                </View>

                {pricingMode === 'customize' ? (
                  /* Customize — plain View, wraps content */
                  <View style={em.optListContent}>
                    <View style={{ gap: 8 }}>
                      <View style={em.priceRow}>
                        <View style={em.priceHalf}>
                          <Text style={[em.priceLbl, { color: colors.placeholder }]}>Sell Price · Main</Text>
                          <View style={[em.priceBox, isDarkMode && em.priceBoxDark]}>
                            <TextInput value={sellMain} onChangeText={setSellMain}
                              keyboardType="decimal-pad" placeholder="0.00"
                              placeholderTextColor={colors.placeholder}
                              style={[em.priceInput, { color: colors.primaryText }]} returnKeyType="done" />
                            <Text style={[em.priceUnit, { color: colors.placeholder }]}>/kg</Text>
                          </View>
                        </View>
                        <View style={em.priceDiv} />
                        <View style={em.priceHalf}>
                          <Text style={[em.priceLbl, { color: colors.placeholder }]}>Sell Price · Lose</Text>
                          <View style={[em.priceBox, isDarkMode && em.priceBoxDark]}>
                            <TextInput value={sellLose} onChangeText={setSellLose}
                              keyboardType="decimal-pad" placeholder="0.00"
                              placeholderTextColor={colors.placeholder}
                              style={[em.priceInput, { color: colors.primaryText }]} returnKeyType="done" />
                            <Text style={[em.priceUnit, { color: colors.placeholder }]}>/g</Text>
                          </View>
                        </View>
                      </View>
                      <View style={em.priceRow}>
                        <View style={em.priceHalf}>
                          <Text style={[em.priceLbl, { color: colors.placeholder }]}>Cost Price · Main</Text>
                          <View style={[em.priceBox, isDarkMode && em.priceBoxDark]}>
                            <TextInput value={costMain} onChangeText={setCostMain}
                              keyboardType="decimal-pad" placeholder="0.00"
                              placeholderTextColor={colors.placeholder}
                              style={[em.priceInput, { color: colors.primaryText }]} returnKeyType="done" />
                            <Text style={[em.priceUnit, { color: colors.placeholder }]}>/kg</Text>
                          </View>
                        </View>
                        <View style={em.priceDiv} />
                        <View style={em.priceHalf}>
                          <Text style={[em.priceLbl, { color: colors.placeholder }]}>Cost Price · Lose</Text>
                          <View style={[em.priceBox, isDarkMode && em.priceBoxDark]}>
                            <TextInput value={costLose} onChangeText={setCostLose}
                              keyboardType="decimal-pad" placeholder="0.00"
                              placeholderTextColor={colors.placeholder}
                              style={[em.priceInput, { color: colors.primaryText }]} returnKeyType="done" />
                            <Text style={[em.priceUnit, { color: colors.placeholder }]}>/g</Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : appliedPrGrn ? (
                  /* GRN applied — plain View, wraps content */
                  <View style={em.optListContent}>
                    <View style={em.appliedCard}>
                      <View style={em.appliedCheck}>
                        <MaterialCommunityIcons name="check" size={11} color="#FFF" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={em.appliedId}>{appliedPrGrn.id}</Text>
                        <Text style={[em.appliedSup, { color: colors.placeholder }]} numberOfLines={1}>{appliedPrGrn.supplier}</Text>
                      </View>
                      <Pressable onPress={clearPrGrn} hitSlop={8} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
                        <MaterialCommunityIcons name="pencil-outline" size={14} color="#1565C0" />
                      </Pressable>
                      <View style={{ width: 1, height: 14, backgroundColor: isDarkMode ? '#3A3A3C' : '#DCDCE0', marginHorizontal: 8 }} />
                      <Pressable onPress={clearPrGrn} hitSlop={8} style={({ pressed }) => [pressed && { opacity: 0.6 }]}>
                        <MaterialCommunityIcons name="trash-can-outline" size={14} color="#E53935" />
                      </Pressable>
                    </View>
                    <View style={em.priceRow}>
                      <View style={em.priceHalf}>
                        <Text style={[em.priceLbl, { color: colors.placeholder }]}>Sell Price · Main</Text>
                        <View style={em.priceBoxLocked}>
                          <Text style={em.priceLockedVal}>{sellMain}</Text>
                          <Text style={em.priceLockedUnit}>/kg</Text>
                        </View>
                      </View>
                      <View style={em.priceDiv} />
                      <View style={em.priceHalf}>
                        <Text style={[em.priceLbl, { color: colors.placeholder }]}>Sell Price · Lose</Text>
                        <View style={em.priceBoxLocked}>
                          <Text style={em.priceLockedVal}>{sellLose}</Text>
                          <Text style={em.priceLockedUnit}>/g</Text>
                        </View>
                      </View>
                    </View>
                    <View style={em.priceRow}>
                      <View style={em.priceHalf}>
                        <Text style={[em.priceLbl, { color: colors.placeholder }]}>Cost Price · Main</Text>
                        <View style={em.priceBoxLocked}>
                          <Text style={em.priceLockedVal}>{costMain}</Text>
                          <Text style={em.priceLockedUnit}>/kg</Text>
                        </View>
                      </View>
                      <View style={em.priceDiv} />
                      <View style={em.priceHalf}>
                        <Text style={[em.priceLbl, { color: colors.placeholder }]}>Cost Price · Lose</Text>
                        <View style={em.priceBoxLocked}>
                          <Text style={em.priceLockedVal}>{costLose}</Text>
                          <Text style={em.priceLockedUnit}>/g</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                ) : (
                  /* GRN list — ScrollView sized to show all rows comfortably */
                  <ScrollView
                    style={{ maxHeight: screenH * 0.55 }}
                    contentContainerStyle={em.optListContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled">
                    <View style={[em.grnSearchRow, isDarkMode && em.grnSearchRowDark]}>
                      <MaterialCommunityIcons name="magnify" size={14} color={colors.placeholder} />
                      <TextInput value={prGrnSearch} onChangeText={setPrGrnSearch}
                        placeholder="Search GRN No. or supplier…"
                        placeholderTextColor={colors.placeholder}
                        style={[em.grnSearchInput, { color: colors.primaryText }]}
                        returnKeyType="search" />
                      {prGrnSearch.length > 0 && (
                        <Pressable onPress={() => setPrGrnSearch('')} hitSlop={8}>
                          <MaterialCommunityIcons name="close-circle" size={14} color={colors.placeholder} />
                        </Pressable>
                      )}
                    </View>
                    {filteredPrGrns.map(grn => {
                      const isSel = pendingPrGrn?.id === grn.id;
                      return (
                        <Pressable
                          key={grn.id}
                          onPress={() => setPendingPrGrn(p => p?.id === grn.id ? null : grn)}
                          style={({ pressed }) => [
                            em.grnRow, isDarkMode && em.grnRowDark,
                            isSel && em.grnRowSelected, pressed && { opacity: 0.75 },
                          ]}>
                          <View style={[em.grnRadio, isSel && em.grnRadioSelected]}>
                            {isSel && <View style={em.grnRadioDot} />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={[em.grnId, { color: isSel ? '#1565C0' : colors.primaryText }]}>{grn.id}</Text>
                            <Text style={[em.grnMeta, { color: colors.placeholder }]} numberOfLines={1}>
                              {grn.date}  ·  {grn.supplier}
                            </Text>
                          </View>
                          <View style={{ gap: 3, alignItems: 'flex-end' }}>
                            <View style={[em.grnPricePill, isSel && em.grnPricePillSel]}>
                              <Text style={[em.grnPriceLbl, isSel && { color: '#1565C0' }]}>S</Text>
                              <Text style={[em.grnPriceVal, isSel && { color: '#1565C0' }]}>{grn.sellMain}</Text>
                            </View>
                            <View style={em.grnPricePill}>
                              <Text style={em.grnPriceLbl}>C</Text>
                              <Text style={em.grnPriceVal}>{grn.costMain}</Text>
                            </View>
                          </View>
                        </Pressable>
                      );
                    })}
                    {/* Apply button always visible — disabled until a GRN row is selected */}
                    <Pressable
                      disabled={!pendingPrGrn}
                      onPress={handleApplyPrGrn}
                      style={({ pressed }) => [
                        em.grnApplyBtn,
                        !pendingPrGrn && em.grnApplyBtnDim,
                        pendingPrGrn && pressed && { opacity: 0.85 },
                      ]}>
                      <MaterialCommunityIcons
                        name="arrow-up-circle-outline"
                        size={15}
                        color={pendingPrGrn ? '#FFF' : '#A8A8B8'}
                      />
                      <Text style={[em.grnApplyTxt, !pendingPrGrn && em.grnApplyTxtDim]}>
                        {pendingPrGrn
                          ? `Apply Prices from ${pendingPrGrn.id}`
                          : 'Select a GRN above to apply prices'}
                      </Text>
                    </Pressable>
                  </ScrollView>
                )}

                {/* Footer — Save & Apply (hidden while GRN not yet applied) */}
                {(pricingMode === 'customize' || appliedPrGrn !== null) && (
                  <View style={[am.footer, { borderTopColor: div }]}>
                    <Pressable
                      disabled={!pricingReady}
                      onPress={() => { onApplied(); onClose(); }}
                      style={({ pressed }) => [
                        am.applyBtn,
                        !pricingReady && am.applyBtnDisabled,
                        pricingReady  && am.applyBtnActive,
                        pricingReady  && pressed && { opacity: 0.82 },
                      ]}>
                      <MaterialCommunityIcons name="check-circle" size={17} color="#FFF" />
                      <Text style={am.applyBtnTxt}>Save & Apply</Text>
                    </Pressable>
                  </View>
                )}
              </>
            )}

          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Pending Finance Approval tab ───────────────────────────────────────────────

type AmtFilter  = 'All' | 'low' | 'mid' | 'high';
type TypeFilter = AdjType | 'All';

const TYPE_FILTER_OPTIONS: TypeFilter[] = ['All', 'Damage', 'Excess', 'ISU', 'Goods Vehicle', 'Item'];
const AMT_FILTER_OPTIONS: { key: AmtFilter; label: string }[] = [
  { key: 'All',  label: 'All Amounts'  },
  { key: 'low',  label: '< LKR 20K'   },
  { key: 'mid',  label: 'LKR 20K–50K' },
  { key: 'high', label: '> LKR 50K'   },
];

function parseAmount(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ''), 10) || 0;
}

// ── Compact Filter Select (inline dropdown below trigger) ─────────────────────

interface FSOption { key: string; label: string; color?: string }

function CompactFilterSelect({
  label, options, value, onChange, isDarkMode, colors,
}: {
  label:      string;
  options:    FSOption[];
  value:      string;
  onChange:   (key: string) => void;
  isDarkMode: boolean;
  colors:     any;
}) {
  const [open,   setOpen]   = useState(false);
  const [search, setSearch] = useState('');

  const sel     = options.find(o => o.key === value);
  const hasVal  = !!sel && sel.key !== 'All';
  const display = hasVal ? sel!.label : 'All';
  const accent  = hasVal ? (sel!.color ?? Colors.primaryHighlight) : undefined;

  const visible = search.trim()
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const bg     = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const bdrClr = open ? Colors.primaryHighlight
    : hasVal  ? Colors.primaryHighlight
    : isDarkMode ? '#3A3A3C' : '#D8D8DE';
  const mutedC = isDarkMode ? '#666' : '#9A9A9A';
  const divC   = isDarkMode ? '#2C2C2E' : '#F0F0F5';

  return (
    <View style={[cfs.wrap, open && cfs.wrapOpen]}>
      {/* ── Trigger ── */}
      <Pressable
        onPress={() => { setOpen(o => !o); setSearch(''); }}
        style={({ pressed }) => [
          cfs.trigger,
          { borderColor: bdrClr, backgroundColor: bg },
          hasVal && cfs.triggerActive,
          open   && cfs.triggerOpen,
          pressed && { opacity: 0.75 },
        ]}>
        <Text style={[cfs.triggerLabel, { color: mutedC }]}>{label}</Text>
        <View style={cfs.triggerDivider} />
        <Text style={[cfs.triggerValue, { color: accent ?? (isDarkMode ? '#DDD' : '#1C1C1E') }]} numberOfLines={1}>
          {display}
        </Text>
        <MaterialCommunityIcons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={12}
          color={open ? Colors.primaryHighlight : (accent ?? mutedC)}
        />
      </Pressable>

      {/* ── Inline dropdown panel — appears directly below trigger ── */}
      {open && (
        <View style={[cfs.dropPanel, { backgroundColor: bg, borderColor: bdrClr }]}>
          <View style={[cfs.dropSearch, { borderBottomColor: Colors.primaryHighlight, backgroundColor: bg }]}>
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder={`Search ${label.toLowerCase()}…`}
              placeholderTextColor={Colors.primaryHighlight}
              style={[cfs.dropSearchInput, { color: colors.primaryText }]}
              autoCapitalize="none"
            />
          </View>
          <ScrollView
            style={cfs.dropList}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {visible.map((opt, i) => {
              const active = opt.key === value;
              return (
                <Pressable
                  key={opt.key}
                  onPress={() => { onChange(opt.key); setOpen(false); setSearch(''); }}
                  style={({ pressed }) => [
                    cfs.dropOpt,
                    i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: divC },
                    active  && { backgroundColor: '#1976D2' },
                    pressed && !active && { backgroundColor: isDarkMode ? '#2A2A2C' : '#F5F5F7' },
                  ]}>
                  {opt.color && !active && (
                    <View style={[cfs.optDot, { backgroundColor: opt.color }]} />
                  )}
                  <Text style={[cfs.dropOptTxt, { color: active ? '#FFF' : (isDarkMode ? '#DDD' : '#1C1C1E') }]}>
                    {opt.label}
                  </Text>
                  <MaterialCommunityIcons
                    name={active ? 'check-circle' : 'check-circle-outline'}
                    size={15}
                    color={active ? '#FFF' : (isDarkMode ? '#555' : '#C8C8D0')}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ── CompactFilterSelect styles ─────────────────────────────────────────────────

const cfs = StyleSheet.create({
  wrap:           { flex: 1 },
  wrapOpen:       { zIndex: 100, elevation: 100 },
  // Trigger (single line)
  trigger:        { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderRadius: 7, paddingHorizontal: 8, paddingVertical: 6 },
  triggerOpen:    { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottomWidth: 0 },
  triggerActive:  { backgroundColor: Colors.primaryHighlight + '0A' },
  triggerLabel:   { fontFamily: FontFamily.medium, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0 },
  triggerDivider: { width: 1, height: 10, backgroundColor: '#D8D8DE' },
  triggerValue:   { flex: 1, fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: '700' },
  // Inline dropdown
  dropPanel:      { borderWidth: 1.5, borderTopWidth: 0, borderBottomLeftRadius: 7, borderBottomRightRadius: 7, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.10, shadowRadius: 8, elevation: 100 },
  dropSearch:     { borderBottomWidth: 2, paddingHorizontal: 10, paddingVertical: 7 },
  dropSearchInput:{ fontFamily: FontFamily.regular, fontSize: FontSize.xs, paddingVertical: 0 },
  dropList:       { maxHeight: 180 },
  dropOpt:        { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 10 },
  optDot:         { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
  dropOptTxt:     { flex: 1, fontFamily: FontFamily.medium, fontSize: FontSize.xs, fontWeight: '500' },
});

function PendingFinanceApprovalTab({ onRefresh, refreshing, records, onRecordApplied }: {
  onRefresh:       () => Promise<void>;
  refreshing:      boolean;
  records:         PendingAdjRecord[];
  onRecordApplied: (id: string) => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [typeFilter,  setTypeFilter]  = useState<TypeFilter>('All');
  const [amtFilter,   setAmtFilter]   = useState<AmtFilter>('All');

  const activeFilterCount = (typeFilter !== 'All' ? 1 : 0) + (amtFilter !== 'All' ? 1 : 0);

  const filtered = useMemo(() => {
    let base = [...records];
    if (typeFilter !== 'All') base = base.filter(r => r.type === typeFilter);
    if (amtFilter !== 'All') {
      base = base.filter(r => {
        const amt = parseAmount(r.amount);
        if (amtFilter === 'low')  return amt < 20000;
        if (amtFilter === 'mid')  return amt >= 20000 && amt <= 50000;
        return amt > 50000;
      });
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;
    return base.filter(r =>
      r.serialNo.toLowerCase().includes(q) ||
      r.type.toLowerCase().includes(q) ||
      r.actionStockAdj.toLowerCase().includes(q),
    );
  }, [searchQuery, records, typeFilter, amtFilter]);

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

      {/* ── Section header ── */}
      <View style={pa.sectionHeader}>
        <Text style={[pa.sectionTitle, { color: colors.primaryText }]}>
          Pending Finance Approval
        </Text>
        <View style={pa.countBadge}>
          <Text style={pa.countTxt}>{filtered.length}</Text>
        </View>
      </View>

      {/* ── Single filter / remove-filter button ── */}
      <View style={pa.filterBtnRow}>
        <Pressable
          onPress={() => {
            if (filterOpen) {
              // Close + clear all filters
              setTypeFilter('All');
              setAmtFilter('All');
              setFilterOpen(false);
            } else {
              setFilterOpen(true);
            }
          }}
          style={({ pressed }) => [
            pa.filterToggleBtn,
            filterOpen
              ? pa.filterToggleBtnRemove
              : {
                  backgroundColor: isDarkMode ? '#2C2C2E' : '#F5F5F7',
                  borderColor: isDarkMode ? '#3A3A3C' : '#E0E0E8',
                },
            pressed && { opacity: 0.75 },
          ]}>
          <MaterialCommunityIcons
            name={filterOpen ? 'filter-remove' : 'tune-variant'}
            size={14}
            color={filterOpen ? '#FFF' : '#595959'}
          />
          <Text style={[pa.filterToggleTxt, filterOpen && { color: '#FFF' }]}>
            {filterOpen ? 'Remove Filter' : 'Filter'}
          </Text>
          {!filterOpen && (
            <MaterialCommunityIcons name="chevron-down" size={13} color="#8E8E93" />
          )}
        </Pressable>
      </View>

      {/* ── Filter grid — stays visible until Remove Filter is clicked ── */}
      {filterOpen && (
        <View style={pa.filterGridWrap}>
          <CompactFilterSelect
            label="Type"
            options={TYPE_FILTER_OPTIONS.map(k => ({
              key:   k,
              label: k === 'All' ? 'All Types' : k,
              color: k !== 'All' ? TYPE_COLORS[k as AdjType]?.text : undefined,
            }))}
            value={typeFilter}
            onChange={v => setTypeFilter(v as TypeFilter)}
            isDarkMode={isDarkMode}
            colors={colors}
          />
          <CompactFilterSelect
            label="Amount"
            options={AMT_FILTER_OPTIONS.map(o => ({ key: o.key, label: o.label }))}
            value={amtFilter}
            onChange={v => setAmtFilter(v as AmtFilter)}
            isDarkMode={isDarkMode}
            colors={colors}
          />
        </View>
      )}

      {/* ── Search bar ── */}
      <View style={pa.searchRow}>
        <View style={[pa.searchBar, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F5F5F7', borderColor: isDarkMode ? '#3A3A3C' : '#E8E8F0' }]}>
          <MaterialCommunityIcons name="magnify" size={17} color="#8E8E93" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by serial no. or type…"
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

      {/* ── Card list ── */}
      {filtered.length === 0 ? (
        <View style={pa.empty}>
          <MaterialCommunityIcons name="tag-search-outline" size={36} color="rgba(89,89,89,0.3)" />
          <Text style={[pa.emptyTitle, { color: colors.primaryText }]}>
            {searchQuery.trim() || activeFilterCount > 0 ? 'No matches found' : 'No pending adjustments'}
          </Text>
          <Text style={[pa.emptySub, { color: colors.placeholder }]}>
            {searchQuery.trim()
              ? `Nothing matched "${searchQuery}"`
              : activeFilterCount > 0
                ? 'Try adjusting your filters.'
                : 'All price adjustments are up to date.'}
          </Text>
          {(searchQuery.trim().length > 0 || activeFilterCount > 0) && (
            <Pressable
              onPress={() => { setSearchQuery(''); setTypeFilter('All'); setAmtFilter('All'); }}
              style={pa.clearSearchBtn}>
              <Text style={pa.clearSearchTxt}>Clear filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={pa.list}>
          {filtered.map((record, idx) => (
            <PendingAdjCard key={record.id} record={record} index={idx} onApplied={onRecordApplied} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

// ── Finance Approval History types & data ─────────────────────────────────────

type HistoryStatus = 'Approved' | 'Rejected';

interface HistoryAdjRecord {
  id:             string;
  serialNo:       string;
  type:           AdjType;
  goodsVehicle:   string;
  item:           string;
  qtyMain:        string;
  qtyLose:        string;
  actionStockAdj: string;
  status:         HistoryStatus;
  reviewedBy:     string;
  reviewedAt:     string;
  notes?:         string;
}

const HISTORY_STATUS_COLORS: Record<HistoryStatus, { bg: string; dot: string; text: string }> = {
  Approved: { bg: 'rgba(46,125,50,0.10)',  dot: '#2E7D32', text: '#1B5E20' },
  Rejected: { bg: 'rgba(198,40,40,0.10)',  dot: '#C62828', text: '#B71C1C' },
};

const MOCK_HISTORY: HistoryAdjRecord[] = [
  { id: 'h1', serialNo: 'PA-2023-088', type: 'Damage',        goodsVehicle: 'GV-HINO-002',  item: 'Head Light (R-h-s) HINO SCOOP',        qtyMain: '14', qtyLose: '1', actionStockAdj: 'Reduced stock by 1 unit',           status: 'Approved', reviewedBy: 'Kasun P.',   reviewedAt: '10 Apr 2024', notes: 'Physical damage confirmed' },
  { id: 'h2', serialNo: 'PA-2023-089', type: 'ISU',           goodsVehicle: '—',             item: 'Dashboard NISSAN NAVARA NP300',          qtyMain: '18', qtyLose: '0', actionStockAdj: 'Initial balance entry — 18 qty',  status: 'Approved', reviewedBy: 'Lakmali R.', reviewedAt: '11 Apr 2024' },
  { id: 'h3', serialNo: 'PA-2023-090', type: 'Excess',        goodsVehicle: 'GV-MITS-001',  item: 'Bumper MITSUBISHI L200 (Front)',         qtyMain: '6',  qtyLose: '0', actionStockAdj: 'Added 2 excess units',              status: 'Rejected', reviewedBy: 'Kasun P.',   reviewedAt: '12 Apr 2024', notes: 'Recount required before approval' },
  { id: 'h4', serialNo: 'PA-2023-091', type: 'Item',          goodsVehicle: '—',             item: 'Head Light TOYOTA COROLLA ALTIS',        qtyMain: '22', qtyLose: '4', actionStockAdj: 'Write-off 4 damaged units',         status: 'Approved', reviewedBy: 'Lakmali R.', reviewedAt: '13 Apr 2024' },
  { id: 'h5', serialNo: 'PA-2023-092', type: 'Goods Vehicle', goodsVehicle: 'GV-HINO-005',  item: 'Dashboard HINO DUTRO (Black)',           qtyMain: '9',  qtyLose: '2', actionStockAdj: 'Vehicle damage — reduce 2 units',   status: 'Rejected', reviewedBy: 'Kasun P.',   reviewedAt: '14 Apr 2024', notes: 'Documentation incomplete' },
  { id: 'h6', serialNo: 'PA-2023-093', type: 'Damage',        goodsVehicle: 'GV-ISUZ-003',  item: 'Bumper ISUZU D-MAX (Front)',             qtyMain: '11', qtyLose: '1', actionStockAdj: 'Reduced stock by 1 unit',           status: 'Approved', reviewedBy: 'Lakmali R.', reviewedAt: '15 Apr 2024' },
  { id: 'h7', serialNo: 'PA-2023-094', type: 'ISU',           goodsVehicle: '—',             item: 'Dashboard MITSUBISHI CANTER WIDE',       qtyMain: '30', qtyLose: '0', actionStockAdj: 'Initial balance entry — 30 qty',  status: 'Approved', reviewedBy: 'Kasun P.',   reviewedAt: '16 Apr 2024' },
  { id: 'h8', serialNo: 'PA-2023-095', type: 'Damage',        goodsVehicle: 'GV-MITS-007',  item: 'Head Light MITSUBISHI PAJERO SPORT',    qtyMain: '7',  qtyLose: '3', actionStockAdj: 'Write-off 3 units — water damage',  status: 'Rejected', reviewedBy: 'Lakmali R.', reviewedAt: '17 Apr 2024', notes: 'Insurance claim pending — hold' },
];

// ── History Adjustment Card ────────────────────────────────────────────────────

function HistoryAdjCard({ record, index }: { record: HistoryAdjRecord; index: number }) {
  const { colors, isDarkMode } = useTheme();
  const statusStyle = HISTORY_STATUS_COLORS[record.status];

  return (
    <View style={[pc.card, isDarkMode && pc.cardDark]}>
      {/* Left accent stripe — green for approved, red for rejected */}
      <View style={[pc.accent, { backgroundColor: record.status === 'Approved' ? '#2E7D32' : '#C62828' }]} />

      <View style={pc.inner}>

        {/* ── Header ── */}
        <View style={pc.header}>
          <View style={{ flex: 1 }} />
          <Text style={[pc.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        {/* Serial No. + Status row */}
        <View style={pc.serialRow}>
          <View style={pc.serialWrap}>
            <MaterialCommunityIcons name="barcode" size={13} color={colors.placeholder} />
            <Text style={[pc.serialTxt, { color: colors.primaryText }]}>{record.serialNo}</Text>
          </View>
          <View style={[pc.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <View style={[pc.statusDot, { backgroundColor: statusStyle.dot }]} />
            <Text style={[pc.statusTxt, { color: statusStyle.text }]}>{record.status}</Text>
          </View>
        </View>

        <View style={[pc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* Qty Main + Qty Lose + Action */}
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

        {/* Reviewer row */}
        <View style={[hs.reviewRow, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <MaterialCommunityIcons
            name={record.status === 'Approved' ? 'check-circle-outline' : 'close-circle-outline'}
            size={13}
            color={statusStyle.dot}
          />
          <Text style={[hs.reviewTxt, { color: colors.placeholder }]}>
            {record.status === 'Approved' ? 'Approved' : 'Rejected'} by{' '}
            <Text style={{ color: colors.primaryText, fontWeight: '600' }}>{record.reviewedBy}</Text>
            {'  ·  '}{record.reviewedAt}
          </Text>
          {record.notes && (
            <Text style={[hs.noteTxt, { color: colors.placeholder }]} numberOfLines={1}>
              {'  '}{record.notes}
            </Text>
          )}
        </View>

      </View>
    </View>
  );
}

// ── Finance Approval History tab ───────────────────────────────────────────────

function FinanceApprovalHistoryTab({ onRefresh, refreshing, records }: {
  onRefresh:  () => Promise<void>;
  refreshing: boolean;
  records:    HistoryAdjRecord[];
}) {
  const { colors, isDarkMode } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<HistoryStatus | 'All'>('All');

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return records.filter(r => {
      const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
      if (!matchesStatus) return false;
      if (!q) return true;
      return (
        r.serialNo.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q) ||
        r.goodsVehicle.toLowerCase().includes(q) ||
        r.item.toLowerCase().includes(q) ||
        r.reviewedBy.toLowerCase().includes(q)
      );
    });
  }, [searchQuery, filterStatus, records]);

  const approvedCount = records.filter(r => r.status === 'Approved').length;
  const rejectedCount = records.filter(r => r.status === 'Rejected').length;

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
        <Text style={[pa.sectionTitle, { color: colors.primaryText }]}>Finance Approval History</Text>
        <View style={[pa.countBadge, { backgroundColor: '#6B7280' }]}>
          <Text style={pa.countTxt}>{records.length}</Text>
        </View>
      </View>

      {/* Stat chips: approved / rejected */}
      <View style={hs.statsRow}>
        <Pressable
          onPress={() => setFilterStatus(filterStatus === 'Approved' ? 'All' : 'Approved')}
          style={[hs.statChip, filterStatus === 'Approved' && hs.statChipActive]}>
          <View style={[hs.statDot, { backgroundColor: '#2E7D32' }]} />
          <Text style={[hs.statTxt, { color: colors.primaryText }]}>
            {approvedCount} Approved
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setFilterStatus(filterStatus === 'Rejected' ? 'All' : 'Rejected')}
          style={[hs.statChip, filterStatus === 'Rejected' && hs.statChipActive]}>
          <View style={[hs.statDot, { backgroundColor: '#C62828' }]} />
          <Text style={[hs.statTxt, { color: colors.primaryText }]}>
            {rejectedCount} Rejected
          </Text>
        </Pressable>
      </View>

      {/* Search bar */}
      <View style={pa.searchRow}>
        <View style={[pa.searchBar, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F5F5F7', borderColor: isDarkMode ? '#3A3A3C' : '#E8E8F0' }]}>
          <MaterialCommunityIcons name="magnify" size={17} color="#8E8E93" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by serial no., type, reviewer…"
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
          <MaterialCommunityIcons name="history" size={36} color="rgba(89,89,89,0.3)" />
          <Text style={[pa.emptyTitle, { color: colors.primaryText }]}>
            {searchQuery.trim() ? 'No matches found' : 'No history records'}
          </Text>
          <Text style={[pa.emptySub, { color: colors.placeholder }]}>
            {searchQuery.trim()
              ? `Nothing matched "${searchQuery}"`
              : 'Approved and rejected adjustments will appear here.'}
          </Text>
          {(searchQuery.trim().length > 0 || filterStatus !== 'All') && (
            <Pressable onPress={() => { setSearchQuery(''); setFilterStatus('All'); }} style={pa.clearSearchBtn}>
              <Text style={pa.clearSearchTxt}>Clear filters</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={pa.list}>
          {filtered.map((record, idx) => (
            <HistoryAdjCard key={record.id} record={record} index={idx} />
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
  const [activeTab,      setActiveTab]      = useState<SIFTabKey>('stock');
  const [stockSubTab,    setStockSubTab]    = useState<StockSubTabKey>('pending');
  const [refreshing,     setRefreshing]     = useState(false);
  const [pendingRecords, setPendingRecords] = useState<PendingAdjRecord[]>(MOCK_PENDING);
  const [historyRecords, setHistoryRecords] = useState<HistoryAdjRecord[]>(MOCK_HISTORY);

  function handleMainTabChange(key: SIFTabKey) {
    setActiveTab(key);
    if (key === 'stock') setStockSubTab('pending');
  }

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise<void>(r => setTimeout(r, 700));
    setRefreshing(false);
  }

  // Move a fully-applied pending record into the History tab and switch to it
  function handleRecordApplied(recordId: string) {
    const record = pendingRecords.find(r => r.id === recordId);
    if (!record) return;
    const d     = new Date();
    const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const dateStr = `${String(d.getDate()).padStart(2, '0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const entry: HistoryAdjRecord = {
      id:             `h-${record.id}-${Date.now()}`,
      serialNo:       record.serialNo,
      type:           record.type,
      goodsVehicle:   record.goodsVehicle,
      item:           record.item,
      qtyMain:        record.qtyMain,
      qtyLose:        record.qtyLose,
      actionStockAdj: record.actionStockAdj,
      status:         'Approved',
      reviewedBy:     'Finance Officer',
      reviewedAt:     dateStr,
    };
    setPendingRecords(prev => prev.filter(r => r.id !== recordId));
    setHistoryRecords(prev => [entry, ...prev]);
  }

  const placeholderIcon     = TAB_ICONS[activeTab];
  const placeholderTitle    = SIF_TABS.find(t => t.key === activeTab)!.label;
  const placeholderSubtitle = TAB_SUBTITLES[activeTab];

  return (
    <SubModuleLayout parentModuleId="3" title="Stock And Inventory Adjustment" showBack={true} selfManagesScroll={true}>
      <View style={s.container}>

        {/* Main tab bar */}
        <View style={s.tabBarWrap}>
          <ScrollableSegmentTabBar
            tabs={SIF_TABS}
            active={activeTab}
            onChange={handleMainTabChange}
          />
        </View>

        {/* Stock sub-tab bar — Pending Finance Approval / History */}
        {activeTab === 'stock' && (
          <View style={s.subTabWrap}>
            <StockSubTabBar active={stockSubTab} onChange={setStockSubTab} />
          </View>
        )}

        {/* Content */}
        <View style={s.panel}>
          {activeTab === 'stock' && stockSubTab === 'pending' ? (
            // ── Pending Finance Approval ──
            <PendingFinanceApprovalTab
              onRefresh={handleRefresh}
              refreshing={refreshing}
              records={pendingRecords}
              onRecordApplied={handleRecordApplied}
            />
          ) : activeTab === 'stock' && stockSubTab === 'history' ? (
            // ── Finance Approval History ──
            <FinanceApprovalHistoryTab
              onRefresh={handleRefresh}
              refreshing={refreshing}
              records={historyRecords}
            />
          ) : (
            // ── Inventory / History-of-Adj placeholders ──
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
  clearSearchBtn:  { marginTop: 4, paddingHorizontal: Spacing.lg, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryHighlight },
  clearSearchTxt:  { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryHighlight },
  removeFltBtn:    { flexDirection: 'row', alignItems: 'center', gap: 7, alignSelf: 'flex-start', marginHorizontal: Spacing.md, marginBottom: 12, backgroundColor: '#2E7D32', borderRadius: 7, paddingHorizontal: 14, paddingVertical: 9 },
  removeFltTxt:    { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: '#FFFFFF' },
  // ── Filter toggle button row ────────────────────────────────────────────────
  filterBtnRow:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, marginBottom: 8, gap: 8 },
  filterToggleBtn:       { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1.5, borderRadius: 9, paddingHorizontal: 12, paddingVertical: 7 },
  filterToggleBtnOpen:   { backgroundColor: Colors.primaryHighlight + '0D', borderColor: Colors.primaryHighlight },
  filterToggleBtnRemove: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },
  filterToggleTxt:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '600', color: '#595959' },
  filterCountDot:     { width: 17, height: 17, borderRadius: 9, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  filterCountDotTxt:  { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', color: '#FFF' },
  // ── Compact filter panel ────────────────────────────────────────────────────
  filterGridWrap:     { flexDirection: 'row', alignItems: 'flex-start', gap: 8, paddingHorizontal: Spacing.md, marginBottom: 10 },
  filterGrid:         { flexDirection: 'row', gap: 8 },
});

// ── Pending adj card styles ────────────────────────────────────────────────────

const pc = StyleSheet.create({
  // Card shell
  card:         { borderRadius: 12, backgroundColor: '#FFF', flexDirection: 'row', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2, overflow: 'hidden' },
  cardDark:     { backgroundColor: '#1C1C1E' },
  accent:       { width: 4 },
  inner:        { flex: 1, paddingTop: 12 },
  // Header row
  header:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginBottom: 8 },
  typeBadge:    { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  typeTxt:      { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', letterSpacing: 0.3, color: '#1C1C1E' },
  idx:          { fontFamily: FontFamily.regular, fontSize: 11 },
  statusBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(245,158,11,0.12)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusDot:    { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F59E0B' },
  statusTxt:    { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#D97706' },
  // Divider
  divider:      { height: 1, marginHorizontal: 12, marginBottom: 8 },
  // Stock No. + Item No.
  idRow:        { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 4 },
  idField:      { flex: 1 },
  idSep:        { width: 1, marginHorizontal: 10, alignSelf: 'stretch' },
  idLabel:      { fontFamily: FontFamily.regular, fontSize: 9, color: '#E53935', marginBottom: 2 },
  idValue:      { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '600' },
  // Item name
  itemRow:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, marginBottom: 10 },
  itemName:     { fontFamily: FontFamily.regular, fontSize: FontSize.xs, flex: 1 },
  // Adjustment section
  adjSectionLabel: { fontFamily: FontFamily.medium, fontSize: 9, color: '#E53935', paddingHorizontal: 12, marginBottom: 4, marginTop: 4 },
  adjRow:       { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 6 },
  adjCol:       { flex: 1, alignItems: 'center' },
  adjSep:       { width: 1, marginHorizontal: 4, alignSelf: 'stretch' },
  adjLabel:     { fontFamily: FontFamily.regular, fontSize: 9, color: '#E53935', marginBottom: 2, textAlign: 'center' },
  adjValue:     { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center' },
  // GRN Type No
  grnRow:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, marginBottom: 10 },
  grnLabel:     { fontFamily: FontFamily.regular, fontSize: FontSize.xs },
  grnValue:     { fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: '700' },
  // Action bar
  actions:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  btn:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, marginRight: 6 },
  btnView:      { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnEdit:      { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnApprove:   { backgroundColor: 'rgba(46,125,50,0.09)' },
  btnPressed:   { opacity: 0.65 },
  btnTxt:       { fontFamily: FontFamily.medium, fontSize: 12, color: '#595959', fontWeight: '500' },
  btnApproveTxt:{ fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#2E7D32' },
  // ── Shared with HistoryAdjCard (kept for backward compat) ──────────────────
  serialRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, marginBottom: 10 },
  serialWrap:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  serialTxt:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '500' },
  chips:        { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8 },
  chipSep:      { width: 1, marginHorizontal: 8 },
  chipsQty:     { marginBottom: 0 },
  qtyBox:       { flex: 1 },
  qtyLabel:     { fontFamily: FontFamily.medium, fontSize: 9, color: '#9A9A9A', marginBottom: 2 },
  qtyVal:       { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '600' },
  adjTxt:       { fontWeight: '500', fontSize: 11 },
});

// ── Approve modal styles ───────────────────────────────────────────────────────

const am = StyleSheet.create({
  // Overlay
  overlay:           { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.52)', paddingHorizontal: 18 },
  // Wrapper that lets floating close button overflow outside the card
  cardWrap:          { width: '100%' },
  // Card
  card:              { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 18, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 28, elevation: 18 },
  cardDark:          { backgroundColor: '#1C1C1E' },
  // ── Floating close button (Human Management style) ──
  floatClose:        { position: 'absolute', top: -15, right: -4, zIndex: 10, width: 32, height: 32, borderRadius: 16, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.28, shadowRadius: 4, elevation: 8 },
  floatCloseXL:      { position: 'absolute', width: 13, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '45deg'  }] },
  floatCloseXR:      { position: 'absolute', width: 13, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  // ── Top accent stripe ──
  topAccent:         { height: 4, backgroundColor: '#C62828' },
  // ── Header ──
  header:            { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 11, borderBottomWidth: 1 },
  title:             { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', marginBottom: 4 },
  subtitleRow:       { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  serialTxt:         { fontFamily: FontFamily.regular, fontSize: 11 },
  itemTxt:           { fontFamily: FontFamily.medium, fontSize: FontSize.xs, fontWeight: '500', lineHeight: 17 },
  // ── Bulk controls bar (Approve All · progress · Clear all on one row) ──
  bulkRow:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9, borderBottomWidth: 1, gap: 8 },
  bulkBtn:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, backgroundColor: 'rgba(46,125,50,0.09)' },
  bulkBtnDimmed:     { opacity: 0.38 },
  bulkBtnTxt:        { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600' },
  clearBtn:          { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 8, backgroundColor: 'rgba(198,40,40,0.09)' },
  clearBtnDimmed:    { opacity: 0.38 },
  clearTxt:          { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#C62828' },
  clearTxtDisabled:  { color: '#C0C0C6' },
  // ── Progress ──
  progressWrap:      { flex: 1, alignItems: 'center', gap: 3, paddingHorizontal: 4 },
  progressLabel:     { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700' },
  progressTrack:     { width: '100%', height: 5, borderRadius: 3, overflow: 'hidden' },
  progressFill:      { height: '100%', backgroundColor: '#F59E0B', borderRadius: 3 },
  // ── Column headers ──
  tableHead:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, borderBottomWidth: 1 },
  thGrn:             { flex: 1, marginRight: 4 },
  thTxt:             { fontFamily: FontFamily.medium, fontSize: 9, color: '#9A9A9A', fontWeight: '600', letterSpacing: 0.4 },
  thNum:             { width: 36, textAlign: 'center', fontFamily: FontFamily.medium, fontSize: 9, color: '#9A9A9A', fontWeight: '600', letterSpacing: 0.3 },
  thAct:             { width: 38 },
  // ── GRN table rows (Excel-style) ──
  listScroll:        { flex: 1 },
  listContent:       { paddingBottom: 4 },
  tableRow:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  tableRowDark:      { borderBottomColor: '#2A2A2C' },
  tableRowApproved:  { backgroundColor: 'rgba(67,160,71,0.08)' },
  tableRowApplied:   { backgroundColor: 'rgba(46,125,50,0.13)' },
  // GRN info column (left, flex)
  tdGrn:             { flex: 1, marginRight: 4 },
  tdGrnNum:          { fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: '700' },
  tdGrnMeta:         { fontFamily: FontFamily.regular, fontSize: 10, marginTop: 2 },
  // Qty number columns (fixed width, centred)
  tdNum:             { width: 36, textAlign: 'center', fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700' },
  // Action column — approve circle
  tdAct:             { width: 38, alignItems: 'center', justifyContent: 'center' },
  approveCircle:     { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(89,89,89,0.09)', borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center' },
  approveCircleOn:   { backgroundColor: '#2E7D32', borderColor: '#2E7D32', shadowColor: '#2E7D32', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  // ── Disabled row ──
  tableRowDisabled:  { opacity: 0.38 },
  disabledCircle:    { width: 26, height: 26, borderRadius: 13, backgroundColor: '#F0F0F5', borderWidth: 1.5, borderColor: '#E0E0E6', alignItems: 'center', justifyContent: 'center' },
  // ── History section ──
  histSection:       { borderTopWidth: 1, marginTop: 4 },
  histHeader:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderBottomWidth: 1 },
  histTitle:         { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  histRow:           { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth },
  histInfo:          { flex: 1, marginRight: 10, gap: 3 },
  histGrn:           { fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: '700' },
  histDate:          { fontFamily: FontFamily.regular, fontSize: 10 },
  histQty:           { fontFamily: FontFamily.regular, fontSize: 10, lineHeight: 14 },
  rejectNote:        { flexDirection: 'row', alignItems: 'flex-start', gap: 5, backgroundColor: 'rgba(198,40,40,0.07)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(198,40,40,0.18)', marginTop: 4 },
  rejectMsg:         { flex: 1, fontFamily: FontFamily.regular, fontSize: 10, color: '#C62828', lineHeight: 14 },
  histBadge:         { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 2 },
  histBadgeApproved: { backgroundColor: 'rgba(46,125,50,0.10)' },
  histBadgeRejected: { backgroundColor: 'rgba(198,40,40,0.10)' },
  histBadgeTxt:      { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700' },
  // ── Reject row functionality ──
  tableRowRejected:  { backgroundColor: 'rgba(198,40,40,0.07)' },
  tdActContainer:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  rejectBtn:         { width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(198,40,40,0.1)', borderWidth: 1.5, borderColor: '#F0C0C0', alignItems: 'center', justifyContent: 'center' },
  rejectBtnActive:   { backgroundColor: '#C62828', borderColor: '#C62828', shadowColor: '#C62828', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 4, elevation: 4 },
  // ── Reject panel (inline below the active row) ──
  rejectPanel:       { paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  rejectPanelHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  rejectPanelIcon:   { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(198,40,40,0.12)', alignItems: 'center', justifyContent: 'center' },
  rejectPanelTitle:  { flex: 1, fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700' },
  rejectInput:       { borderWidth: 1.5, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontFamily: FontFamily.regular, fontSize: 12, minHeight: 80, textAlignVertical: 'top', lineHeight: 18 },
  rejectHint:        { fontFamily: FontFamily.regular, fontSize: 9 },
  rejectUndo:        { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5 },
  rejectUndoTxt:     { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600' },
  // ── Footer stats ──
  footerStats:       { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 10 },
  statPill:          { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  statPillTxt:       { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600' },
  // ── Footer ──
  footer:            { paddingHorizontal: 14, paddingTop: 11, paddingBottom: 16, borderTopWidth: 1 },
  applyBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 12, paddingVertical: 13, backgroundColor: '#A8A8AE' },
  applyBtnDisabled:  { backgroundColor: '#A8A8AE' },
  applyBtnActive:    { backgroundColor: '#2E7D32', shadowColor: '#1B5E20', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.38, shadowRadius: 10, elevation: 8 },
  applyBtnTxt:       { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: '#FFFFFF' },
});


// ── Excess approve modal styles ────────────────────────────────────────────────

const em = StyleSheet.create({
  // Form content padding (used as View style or ScrollView contentContainerStyle)
  optListContent: { paddingHorizontal: 16, paddingTop: 18, paddingBottom: 20, gap: 12 },

  // ── Screen 1: selection cards ──
  selListContent: { paddingHorizontal: 16, paddingTop: 28, paddingBottom: 28, gap: 14 },
  selHint:        { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', marginBottom: 4 },
  selCard:        { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#E2E2EA', backgroundColor: '#FAFAFC', paddingHorizontal: 18, paddingVertical: 20 },
  selCardDark:    { borderColor: '#3A3A3C', backgroundColor: '#1C1C1E' },
  selIcon:        { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  selTitle:       { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', marginBottom: 2 },
  selSub:         { fontFamily: FontFamily.regular, fontSize: 11 },
  selOrRow:       { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selOrLine:      { flex: 1, height: 1 },
  selOrTxt:       { fontFamily: FontFamily.regular, fontSize: 12, fontStyle: 'italic' },

  // ── Screen 2: mode bar ──
  modeBar:        { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  modeBarIcon:    { width: 30, height: 30, borderRadius: 8, backgroundColor: 'rgba(21,101,192,0.10)', alignItems: 'center', justifyContent: 'center' },
  modeBarTitle:   { flex: 1, fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700' },
  optChangeTxt:   { fontFamily: FontFamily.regular, fontSize: 11, fontStyle: 'italic', color: Colors.primaryHighlight },

  qtySentBar:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  qtySentLbl:     { fontFamily: FontFamily.regular, fontSize: 11, flex: 1 },
  qtySentPills:   { flexDirection: 'row', gap: 6 },
  qtySentPill:    { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  qtySentUnit:    { fontFamily: FontFamily.regular, fontSize: 10 },
  qtySentVal:     { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },

  // Price inputs (customize mode)
  priceRow:   { flexDirection: 'row', alignItems: 'flex-start', gap: 0 },
  priceHalf:  { flex: 1, gap: 4 },
  priceDiv:   { width: 1, alignSelf: 'stretch', borderLeftWidth: 1, borderStyle: 'dotted', borderColor: '#D0D0D8', marginHorizontal: 6 },
  priceLbl:   { fontFamily: FontFamily.regular, fontSize: 10 },
  priceBox:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7, backgroundColor: '#FAFAFC' },
  priceBoxDark:{ backgroundColor: '#2C2C2E', borderColor: '#3A3A3C' },
  priceInput: { flex: 1, fontFamily: FontFamily.medium, fontSize: 13, paddingVertical: 0 },
  priceUnit:  { fontFamily: FontFamily.regular, fontSize: 10, marginLeft: 2 },

  // Locked price boxes (match-grn applied)
  priceBoxLocked:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(21,101,192,0.30)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 7, backgroundColor: 'rgba(21,101,192,0.05)' },
  priceLockedVal:  { flex: 1, fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#1565C0' },
  priceLockedUnit: { fontFamily: FontFamily.regular, fontSize: 10, color: '#1565C0', marginLeft: 2 },

  // Applied GRN card
  appliedCard:  { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 9, backgroundColor: 'rgba(21,101,192,0.06)', borderWidth: 1, borderColor: 'rgba(21,101,192,0.22)', paddingHorizontal: 10, paddingVertical: 9 },
  appliedCheck: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#1565C0', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  appliedId:    { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1565C0' },
  appliedSup:   { fontFamily: FontFamily.regular, fontSize: 10 },

  // GRN picker
  grnSearchRow:     { flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#FAFAFC' },
  grnSearchRowDark: { backgroundColor: '#2C2C2E', borderColor: '#3A3A3C' },
  grnSearchInput:   { flex: 1, fontFamily: FontFamily.regular, fontSize: 12, paddingVertical: 0 },
  grnRow:           { flexDirection: 'row', alignItems: 'center', gap: 9, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 9, borderWidth: 1, borderColor: '#EBEBF0', backgroundColor: '#FAFAFC', minHeight: 56 },
  grnRowDark:       { backgroundColor: '#2C2C2E', borderColor: '#3A3A3C' },
  grnRowSelected:   { borderColor: '#1565C0', backgroundColor: 'rgba(21,101,192,0.05)', borderWidth: 1.5 },
  grnRadio:         { width: 17, height: 17, borderRadius: 9, borderWidth: 2, borderColor: '#C0C0C8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  grnRadioSelected: { borderColor: '#1565C0', backgroundColor: '#1565C0' },
  grnRadioDot:      { width: 5, height: 5, borderRadius: 3, backgroundColor: '#FFF' },
  grnId:            { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700' },
  grnMeta:          { fontFamily: FontFamily.regular, fontSize: 10 },
  grnPricePill:     { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: '#EBEBF0' },
  grnPricePillSel:  { backgroundColor: 'rgba(21,101,192,0.12)' },
  grnPriceLbl:      { fontFamily: FontFamily.bold, fontSize: 8, fontWeight: '700', color: '#9090A0', textTransform: 'uppercase' },
  grnPriceVal:      { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', color: '#6B6B70' },
  grnApplyBtn:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 11, borderRadius: 9, backgroundColor: '#1565C0' },
  grnApplyBtnDim:   { backgroundColor: '#EBEBF0' },
  grnApplyTxt:      { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
  grnApplyTxtDim:   { color: '#A8A8B8' },

});

// ── History tab styles ─────────────────────────────────────────────────────────

const hs = StyleSheet.create({
  statsRow:      { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  statChip:      { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: 'rgba(89,89,89,0.07)', borderWidth: 1, borderColor: 'transparent' },
  statChipActive:{ borderColor: Colors.primaryHighlight, backgroundColor: 'rgba(233,30,99,0.05)' },
  statDot:       { width: 8, height: 8, borderRadius: 4 },
  statTxt:       { fontFamily: FontFamily.medium, fontSize: FontSize.xs, fontWeight: '500' },
  reviewRow:     { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', marginTop: 10, paddingHorizontal: 12, paddingVertical: 10, borderTopWidth: 1, gap: 4 },
  reviewTxt:     { fontFamily: FontFamily.regular, fontSize: 11, flexShrink: 1 },
  noteTxt:       { fontFamily: FontFamily.regular, fontSize: 11, fontStyle: 'italic', flexShrink: 1 },
});
