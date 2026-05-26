import React, { useMemo, useState } from 'react';
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
import { Colors, FontFamily, FontSize } from '../../constants/theme';

// ── Public types ───────────────────────────────────────────────────────────────

export type StockAdjType =
  | 'Damage'
  | 'Excess'
  | 'ISU'
  | 'Goods Vehicle'
  | 'Item';

export interface StockAdjSubmitData {
  qtyMain:             string;
  qtyLose:             string;
  mainCostPrice:       string;
  loseCostPrice:       string;
  mainSellPrice:       string;
  loseSellPrice:       string;
  priceMatchedFromGrn: string | null;
  selectedGrnId:       string | null;
  remarks:             string;
}

interface Props {
  visible:               boolean;
  onClose:               () => void;
  onSubmit?:             (data: StockAdjSubmitData) => void;
  adjType:               StockAdjType;
  serialNo?:             string;
  itemName:              string;
  itemCode?:             string;
  goodsVehicle?:         string;
  initialQtyMain?:       string;
  initialQtyLose?:       string;
  initialMainCostPrice?: string;
  initialLoseCostPrice?: string;
  initialMainSellPrice?: string;
  initialLoseSellPrice?: string;
}

// ── Type accent map ────────────────────────────────────────────────────────────

const TYPE_META: Record<StockAdjType, { accent: string; light: string; icon: string; label: string }> = {
  Damage:          { accent: '#E53935', light: 'rgba(229,57,53,0.10)',  icon: 'alert-octagon-outline',          label: 'Damage'                     },
  Excess:          { accent: '#1976D2', light: 'rgba(25,118,210,0.10)', icon: 'plus-circle-outline',            label: 'Excess Stock'               },
  ISU:             { accent: '#7B1FA2', light: 'rgba(123,31,162,0.10)', icon: 'database-import-outline',        label: 'Initial Stock Update (ISU)' },
  'Goods Vehicle': { accent: '#00897B', light: 'rgba(0,137,123,0.10)', icon: 'truck-check-outline',            label: 'Goods Vehicle'              },
  Item:            { accent: '#F57C00', light: 'rgba(245,124,0,0.10)',  icon: 'package-variant-closed-outline', label: 'Item'                       },
};

// ── GRN data (cost + sell for Main and Lose) ───────────────────────────────────

interface GrnRecord {
  id:            string;
  date:          string;
  supplier:      string;
  poRef:         string;
  qty:           number;
  mainCostPrice: string;
  loseCostPrice: string;
  mainSellPrice: string;
  loseSellPrice: string;
}

const MOCK_GRNS: GrnRecord[] = [
  { id: 'GRN-2024-001', date: '15 Jan 2024', supplier: 'HINO Lanka Ltd.',        poRef: 'PO-2024-001', qty: 15, mainCostPrice: '1,250.00', loseCostPrice: '125.00', mainSellPrice: '1,450.00', loseSellPrice: '145.00' },
  { id: 'GRN-2024-002', date: '10 Feb 2024', supplier: 'Mitsubishi Parts Co.',   poRef: 'PO-2024-002', qty: 8,  mainCostPrice: '2,935.74', loseCostPrice: '293.57', mainSellPrice: '3,380.00', loseSellPrice: '338.00' },
  { id: 'GRN-2024-003', date: '05 Mar 2024', supplier: 'Universal Auto Parts',   poRef: 'PO-2024-003', qty: 12, mainCostPrice: '1,100.00', loseCostPrice: '110.00', mainSellPrice: '1,280.00', loseSellPrice: '128.00' },
  { id: 'GRN-2024-004', date: '22 Mar 2024', supplier: 'ISUZU Service Centre',   poRef: 'PO-2024-004', qty: 6,  mainCostPrice: '1,050.00', loseCostPrice: '105.00', mainSellPrice: '1,220.00', loseSellPrice: '122.00' },
  { id: 'GRN-2024-005', date: '14 Apr 2024', supplier: 'Lanka Spare Parts Ltd.', poRef: 'PO-2024-005', qty: 20, mainCostPrice: '1,180.00', loseCostPrice: '118.00', mainSellPrice: '1,360.00', loseSellPrice: '136.00' },
  { id: 'GRN-2024-006', date: '02 May 2024', supplier: 'Colombo Auto Parts',     poRef: 'PO-2024-006', qty: 10, mainCostPrice: '1,320.00', loseCostPrice: '132.00', mainSellPrice: '1,520.00', loseSellPrice: '152.00' },
  { id: 'GRN-2024-007', date: '18 May 2024', supplier: 'Prime Spare Parts Ltd.', poRef: 'PO-2024-007', qty: 14, mainCostPrice: '1,080.00', loseCostPrice: '108.00', mainSellPrice: '1,250.00', loseSellPrice: '125.00' },
];

// ── Section heading ────────────────────────────────────────────────────────────

function SectionHead({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={sh.row}>
      <MaterialCommunityIcons name={icon as any} size={14} color={Colors.primaryHighlight} />
      <Text style={sh.label}>{label}</Text>
    </View>
  );
}

// ── Qty bottom-border input ────────────────────────────────────────────────────

function QtyInput({
  label, value, onChangeText, placeholder, required,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={qi.wrap}>
      <Text style={[qi.label, focused && qi.labelFoc]}>
        {label}{required && <Text style={qi.req}> *</Text>}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="numeric"
        placeholder={placeholder ?? '0'}
        placeholderTextColor="#C0C0C8"
        style={[qi.input, focused && qi.inputFoc]}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="done"
      />
    </View>
  );
}

// ── Box price input (border, unit suffix) ─────────────────────────────────────

function PriceInput({
  value, onChangeText, unit, locked,
}: {
  value: string; onChangeText: (v: string) => void;
  unit?: string; locked?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[pi.box, focused && pi.boxFoc, locked && pi.boxLocked]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType="decimal-pad"
        placeholder="0.00"
        placeholderTextColor="#C0C0C8"
        editable={!locked}
        style={pi.input}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        returnKeyType="done"
      />
      {!!unit && <Text style={[pi.unit, locked && pi.unitLocked]}>{unit}</Text>}
    </View>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// GRN Picker  —  centered dialog modal
// ══════════════════════════════════════════════════════════════════════════════

const GRN_ROW_H  = 62;   // approx height per row
const GRN_VISIBLE = 6;   // max rows shown before scroll

function GrnPickerModal({
  visible,
  accentColor,
  appliedGrnId,
  onApply,
  onClose,
}: {
  visible:      boolean;
  accentColor:  string;
  appliedGrnId: string | null;
  onApply:      (grn: GrnRecord) => void;
  onClose:      () => void;
}) {
  const [search,     setSearch]     = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(appliedGrnId);

  React.useEffect(() => {
    if (visible) { setSearch(''); setSelectedId(appliedGrnId); }
  }, [visible, appliedGrnId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return MOCK_GRNS;
    return MOCK_GRNS.filter(g =>
      g.id.toLowerCase().includes(q) ||
      g.supplier.toLowerCase().includes(q) ||
      g.poRef.toLowerCase().includes(q),
    );
  }, [search]);

  const selectedGrn = MOCK_GRNS.find(g => g.id === selectedId) ?? null;
  const listMaxH    = GRN_ROW_H * GRN_VISIBLE;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={gp.overlay}>

        {/* dim backdrop */}
        <Pressable
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          onPress={onClose}
        />

        <View style={gp.dialog}>

          {/* ── Header ── */}
          <View style={[gp.topBar, { backgroundColor: accentColor }]} />
          <View style={gp.header}>
            <View style={[gp.headerIcon, { backgroundColor: accentColor }]}>
              <MaterialCommunityIcons name="file-document-check-outline" size={16} color="#FFF" />
            </View>
            <View style={gp.headerText}>
              <Text style={gp.headerTitle}>Match Previous GRN</Text>
              <Text style={gp.headerSub}>Select a GRN to apply its prices</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={gp.closeBtn}>
              <MaterialCommunityIcons name="close" size={18} color="#9090A0" />
            </Pressable>
          </View>

          {/* ── Search ── */}
          <View style={gp.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={16} color="#8E8E93" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search GRN No., supplier or PO ref…"
              placeholderTextColor="#8E8E93"
              style={gp.searchInput}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} hitSlop={8}>
                <MaterialCommunityIcons name="close-circle" size={15} color="#C0C0C8" />
              </Pressable>
            )}
          </View>

          {/* ── GRN list (max ~6 visible) ── */}
          <ScrollView
            style={[gp.list, { maxHeight: listMaxH }]}
            contentContainerStyle={gp.listContent}
            showsVerticalScrollIndicator
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled>

            {filtered.length === 0 ? (
              <View style={gp.emptyWrap}>
                <MaterialCommunityIcons name="file-search-outline" size={28} color="rgba(0,0,0,0.15)" />
                <Text style={gp.emptyTxt}>No GRN matched "{search}"</Text>
              </View>
            ) : (
              filtered.map(grn => {
                const isSel = selectedId === grn.id;
                const isApplied = appliedGrnId === grn.id;
                return (
                  <Pressable
                    key={grn.id}
                    onPress={() => setSelectedId(p => p === grn.id ? null : grn.id)}
                    style={({ pressed }) => [
                      gp.row,
                      isSel && [gp.rowSelected, { borderColor: accentColor }],
                      pressed && { opacity: 0.72 },
                    ]}>

                    {/* Radio */}
                    <View style={[
                      gp.radio,
                      isSel && { borderColor: accentColor, backgroundColor: accentColor },
                    ]}>
                      {isSel && <View style={gp.radioDot} />}
                    </View>

                    {/* Info */}
                    <View style={gp.rowInfo}>
                      <View style={gp.rowTopLine}>
                        <Text style={[gp.rowId, isSel && { color: accentColor }]}>{grn.id}</Text>
                        {isApplied && (
                          <View style={[gp.appliedChip, { backgroundColor: `${accentColor}18` }]}>
                            <Text style={[gp.appliedChipTxt, { color: accentColor }]}>Applied</Text>
                          </View>
                        )}
                      </View>
                      <Text style={gp.rowMeta} numberOfLines={1}>
                        {grn.date}  ·  {grn.supplier}
                      </Text>
                    </View>

                    {/* Price summary */}
                    <View style={gp.priceSummary}>
                      <View style={[gp.pricePill, isSel && { backgroundColor: `${accentColor}15` }]}>
                        <Text style={[gp.pricePillLbl, isSel && { color: accentColor }]}>C</Text>
                        <Text style={[gp.pricePillVal, isSel && { color: accentColor }]}>{grn.mainCostPrice}</Text>
                      </View>
                      <View style={[gp.pricePill, gp.sellPill, isSel && { backgroundColor: 'rgba(46,125,50,0.10)' }]}>
                        <Text style={[gp.pricePillLbl, { color: '#6B6B70' }, isSel && { color: '#2E7D32' }]}>S</Text>
                        <Text style={[gp.pricePillVal, { color: '#6B6B70' }, isSel && { color: '#2E7D32' }]}>{grn.mainSellPrice}</Text>
                      </View>
                    </View>
                  </Pressable>
                );
              })
            )}
          </ScrollView>

          {/* ── Selected GRN price breakdown ── */}
          {selectedGrn && (
            <View style={[gp.breakdown, { borderColor: `${accentColor}40` }]}>
              {/* Title */}
              <View style={gp.breakdownHeader}>
                <MaterialCommunityIcons name="check-circle" size={13} color={accentColor} />
                <Text style={[gp.breakdownTitle, { color: accentColor }]}>{selectedGrn.id}</Text>
                <Text style={gp.breakdownSup} numberOfLines={1}>{selectedGrn.supplier}</Text>
              </View>
              {/* Price table */}
              <View style={gp.breakdownTable}>
                <View style={gp.btColLabel} />
                <View style={gp.btCol}><Text style={gp.btHdr}>MAIN /kg</Text></View>
                <View style={gp.btDivider} />
                <View style={gp.btCol}><Text style={gp.btHdr}>LOSE /g</Text></View>
              </View>
              <View style={[gp.breakdownTable, gp.btRow]}>
                <View style={gp.btColLabel}><Text style={gp.btLbl}>Cost</Text></View>
                <View style={gp.btCol}><Text style={[gp.btVal, { color: accentColor }]}>{selectedGrn.mainCostPrice}</Text></View>
                <View style={gp.btDivider} />
                <View style={gp.btCol}><Text style={[gp.btVal, { color: accentColor }]}>{selectedGrn.loseCostPrice}</Text></View>
              </View>
              <View style={[gp.breakdownTable, gp.btRow, gp.btRowLast]}>
                <View style={gp.btColLabel}><Text style={gp.btLbl}>Sell</Text></View>
                <View style={gp.btCol}><Text style={[gp.btVal, { color: '#2E7D32' }]}>{selectedGrn.mainSellPrice}</Text></View>
                <View style={gp.btDivider} />
                <View style={gp.btCol}><Text style={[gp.btVal, { color: '#2E7D32' }]}>{selectedGrn.loseSellPrice}</Text></View>
              </View>
            </View>
          )}

          {/* ── Footer ── */}
          <View style={gp.footer}>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [gp.footerCancel, pressed && { opacity: 0.7 }]}>
              <Text style={gp.footerCancelTxt}>Cancel</Text>
            </Pressable>
            <Pressable
              disabled={!selectedGrn}
              onPress={() => { if (selectedGrn) { onApply(selectedGrn); onClose(); } }}
              style={({ pressed }) => [
                gp.footerApply,
                { backgroundColor: accentColor },
                !selectedGrn && gp.footerApplyDisabled,
                pressed && { opacity: 0.85 },
              ]}>
              <MaterialCommunityIcons name="arrow-up-circle-outline" size={15} color="#FFF" />
              <Text style={gp.footerApplyTxt}>Apply Prices</Text>
            </Pressable>
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// Main Stock Adjustment Modal
// ══════════════════════════════════════════════════════════════════════════════

export function StockAdjustmentModal({
  visible,
  onClose,
  onSubmit,
  adjType,
  serialNo,
  itemName,
  itemCode,
  goodsVehicle,
  initialQtyMain       = '',
  initialQtyLose       = '',
  initialMainCostPrice = '',
  initialLoseCostPrice = '',
  initialMainSellPrice = '',
  initialLoseSellPrice = '',
}: Props) {
  const meta = TYPE_META[adjType];

  // ── State ─────────────────────────────────────────────────────────────────
  const [qtyMain,       setQtyMain]       = useState(initialQtyMain);
  const [qtyLose,       setQtyLose]       = useState(initialQtyLose);
  const [mainCostPrice, setMainCostPrice] = useState(initialMainCostPrice);
  const [loseCostPrice, setLoseCostPrice] = useState(initialLoseCostPrice);
  const [mainSellPrice, setMainSellPrice] = useState(initialMainSellPrice);
  const [loseSellPrice, setLoseSellPrice] = useState(initialLoseSellPrice);

  const [appliedGrn,   setAppliedGrn]   = useState<GrnRecord | null>(null);
  const [showPicker,   setShowPicker]   = useState(false);
  const [remarks,      setRemarks]      = useState('');

  // Reset on open
  React.useEffect(() => {
    if (visible) {
      setQtyMain(initialQtyMain);
      setQtyLose(initialQtyLose);
      setMainCostPrice(initialMainCostPrice);
      setLoseCostPrice(initialLoseCostPrice);
      setMainSellPrice(initialMainSellPrice);
      setLoseSellPrice(initialLoseSellPrice);
      setAppliedGrn(null);
      setShowPicker(false);
      setRemarks('');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const pricesLocked = appliedGrn !== null;
  const canSubmit    = qtyMain.trim() !== '' && qtyLose.trim() !== '';

  // ── Handlers ─────────────────────────────────────────────────────────────

  function handleGrnApply(grn: GrnRecord) {
    setMainCostPrice(grn.mainCostPrice);
    setLoseCostPrice(grn.loseCostPrice);
    setMainSellPrice(grn.mainSellPrice);
    setLoseSellPrice(grn.loseSellPrice);
    setAppliedGrn(grn);
  }

  function handleDeleteGrn() {
    setAppliedGrn(null);
    setMainCostPrice('');
    setLoseCostPrice('');
    setMainSellPrice('');
    setLoseSellPrice('');
  }

  function handleSubmit() {
    onSubmit?.({
      qtyMain, qtyLose,
      mainCostPrice, loseCostPrice,
      mainSellPrice, loseSellPrice,
      priceMatchedFromGrn: appliedGrn?.id ?? null,
      selectedGrnId:       appliedGrn?.id ?? null,
      remarks,
    });
    onClose();
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onRequestClose={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={m.overlay}>

          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={onClose}
          />

          <View style={m.card}>
            {/* Top accent bar */}
            <View style={[m.topBar, { backgroundColor: meta.accent }]} />

            {/* Header */}
            <View style={m.header}>
              <View style={[m.headerIcon, { backgroundColor: meta.accent }]}>
                <MaterialCommunityIcons name={meta.icon as any} size={16} color="#FFF" />
              </View>
              <View style={m.headerText}>
                <Text style={m.headerTitle}>Stock Adjustment</Text>
                <View style={[m.typeBadge, { backgroundColor: meta.light }]}>
                  <Text style={[m.typeTxt, { color: meta.accent }]}>{meta.label}</Text>
                </View>
              </View>
              <Pressable onPress={onClose} hitSlop={10} style={m.closeBtn}>
                <MaterialCommunityIcons name="close" size={18} color="#9090A0" />
              </Pressable>
            </View>

            {/* Item context bar */}
            <View style={m.contextBar}>
              {!!serialNo && (
                <View style={m.ctxRow}>
                  <MaterialCommunityIcons name="barcode" size={12} color="#9090A0" />
                  <Text style={m.ctxSub}>{serialNo}</Text>
                </View>
              )}
              <Text style={m.ctxItem} numberOfLines={2}>{itemName}</Text>
              {!!itemCode && <Text style={m.ctxCode}>{itemCode}</Text>}
              {!!goodsVehicle && goodsVehicle !== '—' && (
                <View style={m.ctxRow}>
                  <MaterialCommunityIcons name="truck-outline" size={12} color="#9090A0" />
                  <Text style={m.ctxSub}>{goodsVehicle}</Text>
                </View>
              )}
            </View>

            {/* ── Body ── */}
            <ScrollView
              style={m.body}
              contentContainerStyle={m.bodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">

              {/* ─── 1. Quantities ─────────────────────────── */}
              <SectionHead icon="pencil-ruler" label="Adjustment Quantities" />
              <View style={m.section}>
                <View style={m.colHeaderRow}>
                  <View style={m.colLabel} />
                  <View style={m.colCell}><Text style={m.colHdr}>MAIN  /kg</Text></View>
                  <View style={m.colDiv} />
                  <View style={m.colCell}><Text style={m.colHdr}>LOSE  /g</Text></View>
                </View>
                <View style={m.gridRow}>
                  <View style={m.colLabel} />
                  <View style={m.colCell}>
                    <QtyInput label="Main Qty" value={qtyMain} onChangeText={setQtyMain} placeholder="0" required />
                  </View>
                  <View style={m.colDiv} />
                  <View style={m.colCell}>
                    <QtyInput label="Lose Qty" value={qtyLose} onChangeText={setQtyLose} placeholder="0" required />
                  </View>
                </View>
                {adjType === 'Excess' && (
                  <View style={m.noteRow}>
                    <MaterialCommunityIcons name="information-outline" size={13} color="#1976D2" />
                    <Text style={[m.noteTxt, { color: '#1976D2' }]}>
                      Enter the main quantity on hand and the excess quantity recorded.
                    </Text>
                  </View>
                )}
                {adjType === 'Damage' && (
                  <View style={[m.noteRow, { backgroundColor: 'rgba(229,57,53,0.06)' }]}>
                    <MaterialCommunityIcons name="alert-outline" size={13} color="#E53935" />
                    <Text style={[m.noteTxt, { color: '#E53935' }]}>
                      Enter the total main quantity and the quantity lost due to damage.
                    </Text>
                  </View>
                )}
              </View>

              <View style={m.divider} />

              {/* ─── 2. Pricing ────────────────────────────── */}
              <SectionHead icon="tag-outline" label="Pricing" />
              <View style={m.section}>

                {/* ── Match GRN button  (above price fields) ── */}
                <Pressable
                  onPress={() => setShowPicker(true)}
                  style={({ pressed }) => [
                    m.grnBtn,
                    { borderColor: meta.accent },
                    appliedGrn && { backgroundColor: `${meta.accent}0D`, borderStyle: 'solid' },
                    pressed && { opacity: 0.72 },
                  ]}>
                  <View style={[m.grnBtnIcon, { backgroundColor: `${meta.accent}18` }]}>
                    <MaterialCommunityIcons name="file-clock-outline" size={14} color={meta.accent} />
                  </View>
                  <Text style={[m.grnBtnTxt, { color: meta.accent }]}>
                    {appliedGrn ? 'Match Previous GRN' : 'Match Previous GRN'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-right" size={16} color={meta.accent} />
                </Pressable>

                {/* ── Applied GRN card (shown after applying) ── */}
                {appliedGrn && (
                  <View style={[m.appliedCard, { borderLeftColor: meta.accent }]}>
                    {/* Left accent stripe */}
                    <View style={[m.appliedStripe, { backgroundColor: meta.accent }]} />

                    {/* Check circle */}
                    <View style={[m.appliedCheck, { backgroundColor: meta.accent }]}>
                      <MaterialCommunityIcons name="check" size={11} color="#FFF" />
                    </View>

                    {/* GRN info */}
                    <View style={m.appliedInfo}>
                      <Text style={[m.appliedGrnNo, { color: meta.accent }]}>{appliedGrn.id}</Text>
                      <Text style={m.appliedSupplier} numberOfLines={1}>{appliedGrn.supplier}</Text>
                    </View>

                    {/* Edit + Delete */}
                    <View style={m.appliedActions}>
                      <Pressable
                        onPress={() => setShowPicker(true)}
                        hitSlop={6}
                        style={({ pressed }) => [m.appliedActionBtn, pressed && { opacity: 0.6 }]}>
                        <MaterialCommunityIcons name="pencil-outline" size={14} color={meta.accent} />
                      </Pressable>
                      <View style={m.appliedActionSep} />
                      <Pressable
                        onPress={handleDeleteGrn}
                        hitSlop={6}
                        style={({ pressed }) => [m.appliedActionBtn, pressed && { opacity: 0.6 }]}>
                        <MaterialCommunityIcons name="trash-can-outline" size={14} color="#E53935" />
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* ── Column headers ── */}
                <View style={[m.colHeaderRow, { marginTop: 12 }]}>
                  <View style={m.colLabel} />
                  <View style={m.colCell}><Text style={m.colHdr}>MAIN  /kg</Text></View>
                  <View style={m.colDiv} />
                  <View style={m.colCell}><Text style={m.colHdr}>LOSE  /g</Text></View>
                </View>

                {/* Cost Price row */}
                <View style={m.gridRow}>
                  <View style={m.colLabel}>
                    <Text style={m.rowLbl}>Cost{'\n'}Price</Text>
                  </View>
                  <View style={m.colCell}>
                    <PriceInput
                      value={mainCostPrice}
                      onChangeText={v => { setMainCostPrice(v); setAppliedGrn(null); }}
                      unit="/kg" locked={pricesLocked}
                    />
                  </View>
                  <View style={m.colDiv} />
                  <View style={m.colCell}>
                    <PriceInput
                      value={loseCostPrice}
                      onChangeText={v => { setLoseCostPrice(v); setAppliedGrn(null); }}
                      unit="/g" locked={pricesLocked}
                    />
                  </View>
                </View>

                {/* Sell Price row */}
                <View style={[m.gridRow, { marginTop: 8 }]}>
                  <View style={m.colLabel}>
                    <Text style={m.rowLbl}>Sell{'\n'}Price</Text>
                  </View>
                  <View style={m.colCell}>
                    <PriceInput
                      value={mainSellPrice}
                      onChangeText={v => { setMainSellPrice(v); setAppliedGrn(null); }}
                      unit="/kg" locked={pricesLocked}
                    />
                  </View>
                  <View style={m.colDiv} />
                  <View style={m.colCell}>
                    <PriceInput
                      value={loseSellPrice}
                      onChangeText={v => { setLoseSellPrice(v); setAppliedGrn(null); }}
                      unit="/g" locked={pricesLocked}
                    />
                  </View>
                </View>

              </View>

              <View style={m.divider} />

              {/* ─── 3. Remarks ────────────────────────────── */}
              <SectionHead icon="comment-text-outline" label="Remarks" />
              <View style={m.section}>
                <TextInput
                  value={remarks}
                  onChangeText={setRemarks}
                  placeholder="Add a note or reason for this adjustment…"
                  placeholderTextColor="#C0C0C8"
                  multiline
                  numberOfLines={3}
                  style={m.remarksInput}
                  textAlignVertical="top"
                />
              </View>

            </ScrollView>

            {/* Footer */}
            <View style={m.footer}>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [m.footerCancel, pressed && { opacity: 0.7 }]}>
                <Text style={m.footerCancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSubmit}
                disabled={!canSubmit}
                style={({ pressed }) => [
                  m.footerSubmit,
                  { backgroundColor: meta.accent },
                  !canSubmit && m.footerSubmitDisabled,
                  pressed && { opacity: 0.85 },
                ]}>
                <MaterialCommunityIcons name="check" size={15} color="#FFF" />
                <Text style={m.footerSubmitTxt}>Submit Adjustment</Text>
              </Pressable>
            </View>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── GRN Picker dialog (rendered outside main modal) ── */}
      <GrnPickerModal
        visible={showPicker}
        accentColor={meta.accent}
        appliedGrnId={appliedGrn?.id ?? null}
        onApply={handleGrnApply}
        onClose={() => setShowPicker(false)}
      />
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const m = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  card:     { width: '100%', maxHeight: '92%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden' },

  topBar:      { height: 4 },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  headerIcon:  { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  headerText:  { flex: 1, gap: 4 },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  typeBadge:   { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  typeTxt:     { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F5F7', alignItems: 'center', justifyContent: 'center' },

  contextBar:  { backgroundColor: '#F8F8FC', paddingHorizontal: 16, paddingVertical: 10, gap: 3, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#EBEBF0' },
  ctxRow:      { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ctxItem:     { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#1C1C1E' },
  ctxCode:     { fontFamily: FontFamily.medium, fontSize: 11, color: '#60607A' },
  ctxSub:      { fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },

  body:        { maxHeight: 460 },
  bodyContent: { paddingBottom: 8 },
  section:     { paddingHorizontal: 16, paddingBottom: 14 },
  divider:     { height: 1, backgroundColor: '#F0F0F5', marginVertical: 6 },

  // 3-column grid layout (label | main | divider | lose)
  colHeaderRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 4 },
  colLabel:     { width: 42, justifyContent: 'center' },
  colCell:      { flex: 1 },
  colDiv:       { width: 1, backgroundColor: '#EBEBF0', marginHorizontal: 8, alignSelf: 'stretch' },
  colHdr:       { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.4, textAlign: 'center' },
  gridRow:      { flexDirection: 'row', alignItems: 'center' },
  rowLbl:       { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', color: '#6060A0', lineHeight: 14 },

  noteRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 10, backgroundColor: 'rgba(25,118,210,0.06)', borderRadius: 8, padding: 10 },
  noteTxt:  { flex: 1, fontFamily: FontFamily.regular, fontSize: 11, lineHeight: 16 },

  // GRN trigger button (dashed border)
  grnBtn:       { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, borderStyle: 'dashed', marginBottom: 0 },
  grnBtnIcon:   { width: 26, height: 26, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  grnBtnTxt:    { flex: 1, fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },

  // Applied GRN card
  appliedCard:     { flexDirection: 'row', alignItems: 'center', borderRadius: 10, backgroundColor: '#F8F8FC', borderWidth: 1, borderColor: '#DCDCE0', overflow: 'hidden', marginTop: 8 },
  appliedStripe:   { width: 4, alignSelf: 'stretch' },
  appliedCheck:    { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  appliedInfo:     { flex: 1, paddingVertical: 10, paddingLeft: 9, gap: 2 },
  appliedGrnNo:    { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700' },
  appliedSupplier: { fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },
  appliedActions:  { flexDirection: 'row', alignItems: 'center', paddingRight: 12, gap: 2 },
  appliedActionBtn:{ width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  appliedActionSep:{ width: 1, height: 16, backgroundColor: '#DCDCE0', marginHorizontal: 2 },

  remarksInput: { borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 9, paddingHorizontal: 12, paddingTop: 10, paddingBottom: 10, fontFamily: FontFamily.regular, fontSize: 13, color: '#1C1C1E', minHeight: 72, backgroundColor: '#FAFAFC', marginTop: 10 },

  footer:               { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F0F0F5' },
  footerCancel:         { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F0F0F5', alignItems: 'center', justifyContent: 'center' },
  footerCancelTxt:      { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#595959' },
  footerSubmit:         { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  footerSubmitDisabled: { opacity: 0.45 },
  footerSubmitTxt:      { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
});

const sh = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  label: { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#3C3C43', textTransform: 'uppercase', letterSpacing: 0.5 },
});

const qi = StyleSheet.create({
  wrap:     { flex: 1 },
  label:    { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: '#9090A0', marginBottom: 5 },
  labelFoc: { color: '#1C1C1E' },
  req:      { color: Colors.primaryHighlight },
  input:    { fontFamily: FontFamily.regular, fontSize: 15, color: '#1C1C1E', paddingVertical: 7, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0' },
  inputFoc: { borderBottomColor: '#1C1C1E' },
});

const pi = StyleSheet.create({
  box:       { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 8, backgroundColor: '#FAFAFC' },
  boxFoc:    { borderColor: '#1C1C1E', backgroundColor: '#FFF' },
  boxLocked: { backgroundColor: 'rgba(25,118,210,0.04)', borderColor: '#B3C8E8' },
  input:     { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, color: '#1C1C1E', paddingVertical: 0 },
  unit:      { fontFamily: FontFamily.medium, fontSize: 10, color: '#9090A0', marginLeft: 2 },
  unitLocked:{ color: '#1976D2' },
});

// ── GRN Picker dialog styles ───────────────────────────────────────────────────

const gp = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.60)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 16 },
  dialog:  { width: '100%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden' },

  topBar:      { height: 4 },
  header:      { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  headerIcon:  { width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  headerText:  { flex: 1, gap: 2 },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  headerSub:   { fontFamily: FontFamily.regular, fontSize: 12, color: '#9090A0' },
  closeBtn:    { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5F5F7', alignItems: 'center', justifyContent: 'center' },

  searchWrap:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 8, borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 9, paddingHorizontal: 11, paddingVertical: 9, backgroundColor: '#FAFAFC' },
  searchInput: { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, color: '#1C1C1E', paddingVertical: 0 },

  list:        { },  // maxHeight set inline (~6 rows)
  listContent: { paddingHorizontal: 12, paddingBottom: 8, gap: 5 },
  emptyWrap:   { alignItems: 'center', paddingVertical: 20, gap: 6 },
  emptyTxt:    { fontFamily: FontFamily.regular, fontSize: 12, color: '#9090A0' },

  // GRN row
  row:           { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 9, borderWidth: 1, borderColor: '#EBEBF0', backgroundColor: '#FAFAFC', minHeight: 62 },
  rowSelected:   { backgroundColor: '#F0F7FF', borderWidth: 1.5 },
  radio:         { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#C0C0C8', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioDot:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FFF' },
  rowInfo:       { flex: 1, gap: 3 },
  rowTopLine:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowId:         { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#3C3C43' },
  appliedChip:   { borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  appliedChipTxt:{ fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', letterSpacing: 0.2 },
  rowMeta:       { fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },

  // Price summary badges on each row
  priceSummary: { gap: 4, alignItems: 'flex-end' },
  pricePill:    { borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3, backgroundColor: '#EBEBF0', minWidth: 60, alignItems: 'center' },
  sellPill:     { backgroundColor: '#E8F5E9' },
  pricePillLbl: { fontFamily: FontFamily.bold, fontSize: 8, fontWeight: '700', color: '#9090A0', textTransform: 'uppercase' },
  pricePillVal: { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', color: '#6B6B70' },

  // Selected GRN price breakdown table
  breakdown:       { marginHorizontal: 12, marginTop: 6, borderWidth: 1, borderRadius: 10, backgroundColor: '#F8F8FC', overflow: 'hidden' },
  breakdownHeader: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#EBEBF0' },
  breakdownTitle:  { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700' },
  breakdownSup:    { flex: 1, fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },

  breakdownTable: { flexDirection: 'row', alignItems: 'center' },
  btRow:          { borderTopWidth: 1, borderTopColor: '#EBEBF0', paddingVertical: 7 },
  btRowLast:      { },
  btColLabel:     { width: 60, paddingLeft: 12 },
  btCol:          { flex: 1, alignItems: 'center' },
  btDivider:      { width: 1, backgroundColor: '#EBEBF0', alignSelf: 'stretch' },
  btHdr:          { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.3, paddingVertical: 5 },
  btLbl:          { fontFamily: FontFamily.medium, fontSize: 11, color: '#5C5C7A', fontWeight: '500' },
  btVal:          { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700' },

  footer:              { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#F0F0F5', marginTop: 6 },
  footerCancel:        { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F0F0F5', alignItems: 'center', justifyContent: 'center' },
  footerCancelTxt:     { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#595959' },
  footerApply:         { flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 10 },
  footerApplyDisabled: { opacity: 0.45 },
  footerApplyTxt:      { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
});
