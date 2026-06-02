import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

// ── Tab definitions ─────────────────────────────────────────────────────────────

const SISP_TABS = [
  { key: 'stock',     label: 'Stocks' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'history',   label: 'History' },
] as const;

type SISPTabKey = typeof SISP_TABS[number]['key'];

const TAB_ICONS: Record<SISPTabKey, string> = {
  stock:     'tag-multiple-outline',
  inventory: 'clipboard-list-outline',
  history:   'history',
};

const TAB_SUBTITLES: Record<SISPTabKey, string> = {
  stock:     'Set and manage selling prices for stock items and vehicles.',
  inventory: 'Configure inventory selling prices and bulk pricing rules.',
  history:   'Full audit trail of all selling price changes and approvals.',
};

// ── Stock sub-tab definitions ───────────────────────────────────────────────────

const STOCK_SELLING_SUBTABS = [
  { key: 'item',    label: 'Item Selling' },
  { key: 'vehicle', label: 'Vehicle Selling' },
] as const;

type StockSellingSubTabKey = typeof STOCK_SELLING_SUBTABS[number]['key'];

const SUBTAB_META: Record<StockSellingSubTabKey, { icon: string; title: string; subtitle: string }> = {
  item:    {
    icon:     'package-variant-closed-outline',
    title:    'Item Selling Prices',
    subtitle: 'Define and update selling prices for individual stock items across all warehouses.',
  },
  vehicle: {
    icon:     'car-outline',
    title:    'Vehicle Selling Prices',
    subtitle: 'Set and manage selling prices for vehicle parts and vehicle-specific stock.',
  },
};

// ── Item selling types & data ───────────────────────────────────────────────────

interface ItemSellingRecord {
  id:              string;
  itemCode:        string;
  itemName:        string;
  itemDescription: string;
}

const INITIAL_ITEMS: ItemSellingRecord[] = [
  { id: '1', itemCode: 'SP01-HL01-0000', itemName: 'Scoop',            itemDescription: 'Spare Parts Head Light HINO SCOOP (L-h-s) DUTRO – KK BU306M – 1999/05 to 2004-06' },
  { id: '2', itemCode: 'SP01-D01-0002',  itemName: 'Profia',           itemDescription: 'Spare Parts Dashboard HINO PROFIA (Black) TRUCK FN – KL FN2P – 2002/11 to present' },
  { id: '3', itemCode: 'SP01-D01-0003',  itemName: 'Caner Wide',       itemDescription: 'Spare Parts Dashboard MITSUBISHI CANER WIDE (Black) TRUCK FU – U FU415 – 1993/06 to 1995-05' },
  { id: '4', itemCode: 'SP01-D01-0004',  itemName: 'Ranger',           itemDescription: 'Spare Parts Dashboard HINO RANGER (Black) FC RANGER – KK FC1JCDD – 2001/06 to present' },
  { id: '5', itemCode: 'SP01-D01-0005',  itemName: 'I061',             itemDescription: 'Spare Parts Dashboard ISUZU I061 (Black) ELF 250 – U NKR61 – 1984/06 to 1993-06' },
  { id: '6', itemCode: 'SP01-HL01-0006', itemName: 'Wagon R Stingray', itemDescription: 'Spare Parts Vehicle Head Light SUZUKI WAGON R STINGRAY (R-h-s) MR FZ Series – 2013/09 to present' },
];

// ── Selling price mechanism ─────────────────────────────────────────────────────

type Mechanism =
  | 'supplier-fixed-mrp'
  | 'supplier-fixed-profit'
  | 'custom-fixed-mrp'
  | 'custom-fixed-profit'
  | 'pos-seller-rate';

interface SPForm {
  mechanism:             Mechanism | null;
  unitFixedPrice:        string;
  looseUnitFixedPrice:   string;
  unitProfitMargin:      string;
  unitProfitMarkup:      string;
  looseUnitProfitMargin: string;
  looseUnitProfitMarkup: string;
}

const EMPTY_SP_FORM: SPForm = {
  mechanism: null,
  unitFixedPrice: '', looseUnitFixedPrice: '',
  unitProfitMargin: '', unitProfitMarkup: '',
  looseUnitProfitMargin: '', looseUnitProfitMarkup: '',
};

// ── Health helpers ──────────────────────────────────────────────────────────────

const HEALTH_FIELDS: Array<keyof ItemSellingRecord> = ['itemCode', 'itemName', 'itemDescription'];

function calcHealth(r: ItemSellingRecord): number {
  const filled = HEALTH_FIELDS.filter(k => !!r[k]).length;
  return Math.round((filled / HEALTH_FIELDS.length) * 100);
}

function healthColor(pct: number): string {
  return pct < 25 ? '#E53935' : pct < 50 ? '#FB8C00' : pct < 75 ? '#FDD835' : '#30A84B';
}

// ── Shared constants ────────────────────────────────────────────────────────────

const ARROW_W     = 18;
const ROW_GAP     = 6;
const SCROLL_STEP = 120;

// ── Arrow button ────────────────────────────────────────────────────────────────

function ArrowButton({
  direction, disabled, onPress,
}: { direction: 'left' | 'right'; disabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={8}
      style={({ pressed }) => [
        arr.btn,
        disabled && arr.disabled,
        pressed && !disabled && arr.pressed,
      ]}>
      <View style={[arr.chevron, {
        borderColor: disabled ? '#C8C8CC' : '#6B6B70',
        transform: [{ rotate: direction === 'left' ? '-135deg' : '45deg' }],
      }]} />
    </Pressable>
  );
}

// ── Scrollable segment tab bar (main) ───────────────────────────────────────────

function ScrollableSegmentTabBar({
  tabs, active, onChange,
}: {
  tabs:     typeof SISP_TABS;
  active:   SISPTabKey;
  onChange: (key: SISPTabKey) => void;
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
      <ArrowButton
        direction="right"
        disabled={!canRight}
        onPress={() => scrollTo(offsetRef.current + SCROLL_STEP)}
      />
    </View>
  );
}

// ── Underline sub-tab bar ───────────────────────────────────────────────────────

function StockSellingSubTabBar({
  active, onChange,
}: { active: StockSellingSubTabKey; onChange: (key: StockSellingSubTabKey) => void }) {
  const { isDarkMode } = useTheme();
  return (
    <View style={[sub.wrap, { borderBottomColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]}>
      {STOCK_SELLING_SUBTABS.map(tab => {
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
    </View>
  );
}

// ── Tab placeholder ─────────────────────────────────────────────────────────────

function TabPlaceholder({
  icon, title, subtitle,
}: { icon: string; title: string; subtitle: string }) {
  const { colors, isDarkMode } = useTheme();
  return (
    <View style={ph.wrap}>
      <View style={[ph.iconCircle, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(89,89,89,0.07)' }]}>
        <MaterialCommunityIcons name={icon} size={30} color={isDarkMode ? '#8E8E93' : '#9A9A9A'} />
      </View>
      <Text style={[ph.title, { color: colors.primaryText }]}>{title}</Text>
      <Text style={[ph.sub, { color: '#8E8E93' }]}>{subtitle}</Text>
      <View style={ph.badge}>
        <MaterialCommunityIcons name="clock-outline" size={11} color="#D97706" />
        <Text style={ph.badgeTxt}>Coming Soon</Text>
      </View>
    </View>
  );
}

// ── Info chip ───────────────────────────────────────────────────────────────────

function InfoChip({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={isp.chip}>
      <Text style={isp.chipLabel}>{label}</Text>
      <Text style={[isp.chipValue, { color: colors.primaryText }]} numberOfLines={2}>
        {value || '—'}
      </Text>
    </View>
  );
}

// ── Item selling card ───────────────────────────────────────────────────────────

function ItemSellingCard({
  record, index, onEdit, onDelete,
}: {
  record:   ItemSellingRecord;
  index:    number;
  onEdit:   () => void;
  onDelete: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const pct   = calcHealth(record);
  const color = healthColor(pct);

  return (
    <View style={[isp.card, isDarkMode && isp.cardDark]}>
      {/* Left accent stripe */}
      <View style={[isp.accent, { backgroundColor: Colors.primaryHighlight }]} />

      <View style={isp.inner}>
        {/* ── Header ── */}
        <View style={isp.header}>
          {/* Health ring */}
          <View style={[isp.ring, { borderColor: color }]}>
            <View style={[isp.ringInner, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF' }]}>
              <Text style={[isp.ringPct, { color }]}>{pct}%</Text>
            </View>
          </View>

          {/* Name + code badge */}
          <View style={isp.nameBlock}>
            <Text style={[isp.name, { color: colors.primaryText }]} numberOfLines={1}>
              {record.itemName}
            </Text>
            <View style={isp.codeBadge}>
              <Text style={isp.codeBadgeTxt}>{record.itemCode}</Text>
            </View>
          </View>

          {/* Index */}
          <Text style={[isp.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        <View style={[isp.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* ── Info chips: Code | Description ── */}
        <View style={isp.chips}>
          <InfoChip label="Code" value={record.itemCode} />
          <View style={[isp.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <InfoChip label="Description" value={record.itemDescription} />
        </View>

        {/* ── Actions ── */}
        <View style={[isp.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable
            onPress={onEdit}
            style={({ pressed }) => [isp.btn, isp.btnEdit, pressed && isp.btnPressed]}
            hitSlop={4}>
            <MaterialCommunityIcons name="pencil-outline" size={13} color="#595959" />
            <Text style={isp.btnTxt}>Edit</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={onDelete}
            style={({ pressed }) => [isp.btn, isp.btnDelete, pressed && isp.btnPressed]}
            hitSlop={4}>
            <MaterialCommunityIcons name="delete-outline" size={13} color={Colors.primaryHighlight} />
            <Text style={isp.btnDelTxt}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── Item selling table ──────────────────────────────────────────────────────────

function ItemSellingTable({
  items,
  onEdit,
  onDelete,
}: {
  items:    ItemSellingRecord[];
  onEdit:   (item: ItemSellingRecord) => void;
  onDelete: (id: string) => void;
}) {
  const { isDarkMode, colors } = useTheme();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(r =>
      r.itemCode.toLowerCase().includes(q) ||
      r.itemName.toLowerCase().includes(q) ||
      r.itemDescription.toLowerCase().includes(q),
    );
  }, [query, items]);

  return (
    <View>
      {/* Search bar */}
      <View style={isp.searchWrap}>
        <View style={[
          isp.searchBar,
          { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF', borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
        ]}>
          <MaterialCommunityIcons name="magnify" size={16} color={colors.placeholder} />
          <TextInput
            style={[isp.searchInput, { color: colors.primaryText }]}
            placeholder="Search by name, code or description…"
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8} style={isp.clearBtn}>
              <View style={isp.clearX1} />
              <View style={isp.clearX2} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Count badge */}
      {filtered.length > 0 && (
        <View style={isp.countRow}>
          <Text style={[isp.countTxt, { color: colors.placeholder }]}>
            {filtered.length} item{filtered.length !== 1 ? 's' : ''}
            {query.trim() ? ' found' : ' total'}
          </Text>
        </View>
      )}

      {/* List or empty state */}
      {filtered.length === 0 ? (
        <View style={isp.emptyWrap}>
          <View style={isp.emptyIcon}>
            <MaterialCommunityIcons name="tag-off-outline" size={26} color="rgba(89,89,89,0.3)" />
          </View>
          <Text style={[isp.emptyTitle, { color: colors.primaryText }]}>
            {query.trim() ? 'No matches found' : 'No item selling records'}
          </Text>
          <Text style={[isp.emptySubText, { color: colors.placeholder }]}>
            {query.trim()
              ? `Nothing matched "${query.trim()}"`
              : 'Add a new entry to get started'}
          </Text>
          {query.trim().length > 0 && (
            <Pressable onPress={() => setQuery('')} style={isp.clearSearchBtn}>
              <Text style={isp.clearSearchTxt}>Clear search</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={isp.list}>
          {filtered.map((record, idx) => (
            <ItemSellingCard
              key={record.id}
              record={record}
              index={idx}
              onEdit={() => onEdit(record)}
              onDelete={() => onDelete(record.id)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Price / percent input (underline style) ─────────────────────────────────────

function PriceInput({
  label, value, onChange, placeholder = '0.00', isDark,
}: {
  label:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  isDark:      boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={sp.inputWrap}>
      <Text style={sp.inputLabel}>{label}</Text>
      <View style={[sp.inputUnderline, { borderBottomColor: isDark ? '#555566' : '#C0C0CC' }]}>
        <TextInput
          style={[sp.inputTxt, { color: colors.primaryText }]}
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          placeholderTextColor={isDark ? '#505060' : '#C8C8D0'}
          keyboardType="decimal-pad"
        />
      </View>
    </View>
  );
}

// ── Setup Default Selling Price Modal ───────────────────────────────────────────

function SetupSellingPriceModal({
  item, onClose, onSave,
}: {
  item:    ItemSellingRecord;
  onClose: () => void;
  onSave:  (item: ItemSellingRecord, form: SPForm) => void;
}) {
  const { isDarkMode, colors } = useTheme();
  const { height: screenH }   = useWindowDimensions();
  const [form, setForm]         = useState<SPForm>({ ...EMPTY_SP_FORM });
  const [contentH, setContentH] = useState(0);
  // Each group wrapper is a direct ScrollView child, so onLayout.y == scroll offset
  const scrollRef = useRef<ScrollView>(null);
  const groupYRef = useRef({ supplier: 0, custom: 0, pos: 0 });

  const card = isDarkMode ? '#1C1C1E' : '#FFFFFF';
  const bg   = isDarkMode ? '#111113' : '#F5F5F7';
  const div  = isDarkMode ? '#2C2C2E' : '#F0F0F5';
  const brd  = isDarkMode ? '#3A3A3C' : '#EBEBF0';

  const CHROME_H   = 4 + 56 + 74;
  const MAX_BODY_H = screenH * 0.82 - CHROME_H;
  const bodyH      = Math.min(contentH, MAX_BODY_H);

  function selectMechanism(m: Mechanism) {
    setForm({ ...EMPTY_SP_FORM, mechanism: m });
  }

  const isMrp              = form.mechanism === 'supplier-fixed-mrp'    || form.mechanism === 'custom-fixed-mrp';
  const isProfit           = form.mechanism === 'supplier-fixed-profit' || form.mechanism === 'custom-fixed-profit';
  const isPOS              = form.mechanism === 'pos-seller-rate';
  const isSupplierSelected = form.mechanism === 'supplier-fixed-mrp'    || form.mechanism === 'supplier-fixed-profit';
  const isCustomSelected   = form.mechanism === 'custom-fixed-mrp'      || form.mechanism === 'custom-fixed-profit';

  // When a mechanism is chosen, scroll to bring its group card (and new fields) into view
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!form.mechanism) return;
    const key: keyof typeof groupYRef.current =
      form.mechanism.startsWith('supplier') ? 'supplier' :
      form.mechanism.startsWith('custom')   ? 'custom'   : 'pos';
    setTimeout(() =>
      scrollRef.current?.scrollTo({ y: groupYRef.current[key], animated: true })
    , 200);
  }, [form.mechanism]);

  function canSave(): boolean {
    if (!form.mechanism) return false;
    if (isPOS)    return true;
    if (isMrp)    return form.unitFixedPrice.trim() !== '';
    if (isProfit) return form.unitProfitMargin.trim() !== '' || form.unitProfitMarkup.trim() !== '';
    return false;
  }

  function RadioRow({ value, label }: { value: Mechanism; label: string }) {
    const on = form.mechanism === value;
    return (
      <Pressable
        onPress={() => selectMechanism(value)}
        hitSlop={6}
        style={({ pressed }) => [sp.radioRow, pressed && { opacity: 0.7 }]}>
        <View style={[sp.radioOuter, on && { borderColor: Colors.primaryHighlight }]}>
          {on && <View style={sp.radioDot} />}
        </View>
        <Text style={[
          sp.radioLabel,
          { color: colors.primaryText },
          on && { fontFamily: FontFamily.medium, color: Colors.primaryHighlight },
        ]}>
          {label}
        </Text>
      </Pressable>
    );
  }

  // Called as plain functions (not JSX components) to avoid re-mount issues
  function mrpFields() {
    return (
      <>
        <View style={sp.inlineFieldSection}>
          <View style={sp.fieldSectionHeader}>
            <MaterialCommunityIcons name="cube-outline" size={12} color={Colors.primaryHighlight} />
            <Text style={[sp.fieldSectionTitle, { color: colors.primaryText }]}>
              <Text style={{ color: Colors.primaryHighlight }}>*</Text>Unit
            </Text>
          </View>
          <PriceInput label="Fixed Price (LKR)" value={form.unitFixedPrice}
            onChange={v => setForm(f => ({ ...f, unitFixedPrice: v }))} isDark={isDarkMode} />
        </View>
        <View style={[sp.inlineDivider, { backgroundColor: div }]} />
        <View style={sp.inlineFieldSection}>
          <View style={sp.fieldSectionHeader}>
            <MaterialCommunityIcons name="cube-unfolded" size={12} color={colors.placeholder} />
            <Text style={[sp.fieldSectionTitle, { color: colors.primaryText }]}>
              <Text style={{ color: Colors.primaryHighlight }}>*</Text>Loose Unit
            </Text>
          </View>
          <PriceInput label="Fixed Price (LKR)" value={form.looseUnitFixedPrice}
            onChange={v => setForm(f => ({ ...f, looseUnitFixedPrice: v }))} isDark={isDarkMode} />
        </View>
      </>
    );
  }

  function profitFields() {
    return (
      <>
        <View style={sp.inlineFieldSection}>
          <View style={sp.fieldSectionHeader}>
            <MaterialCommunityIcons name="cube-outline" size={12} color={Colors.primaryHighlight} />
            <Text style={[sp.fieldSectionTitle, { color: colors.primaryText }]}>
              <Text style={{ color: Colors.primaryHighlight }}>*</Text>Unit
            </Text>
          </View>
          <View style={sp.twoCol}>
            <PriceInput label="Profit Margin (%)" value={form.unitProfitMargin}
              onChange={v => setForm(f => ({ ...f, unitProfitMargin: v }))} isDark={isDarkMode} />
            <View style={sp.colSep} />
            <PriceInput label="Profit Markup (%)" value={form.unitProfitMarkup}
              onChange={v => setForm(f => ({ ...f, unitProfitMarkup: v }))} isDark={isDarkMode} />
          </View>
        </View>
        <View style={[sp.inlineDivider, { backgroundColor: div }]} />
        <View style={sp.inlineFieldSection}>
          <View style={sp.fieldSectionHeader}>
            <MaterialCommunityIcons name="cube-unfolded" size={12} color={colors.placeholder} />
            <Text style={[sp.fieldSectionTitle, { color: colors.primaryText }]}>
              <Text style={{ color: Colors.primaryHighlight }}>*</Text>Loose Unit
            </Text>
          </View>
          <View style={sp.twoCol}>
            <PriceInput label="Profit Margin (%)" value={form.looseUnitProfitMargin}
              onChange={v => setForm(f => ({ ...f, looseUnitProfitMargin: v }))} isDark={isDarkMode} />
            <View style={sp.colSep} />
            <PriceInput label="Profit Markup (%)" value={form.looseUnitProfitMarkup}
              onChange={v => setForm(f => ({ ...f, looseUnitProfitMarkup: v }))} isDark={isDarkMode} />
          </View>
        </View>
      </>
    );
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      {/* Centered overlay */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={sp.overlay}>

        {/* Dimmed backdrop — tap to dismiss */}
        <Pressable style={sp.backdrop} onPress={onClose} />

        {/* Wrapper for card + floating close button */}
        <View style={sp.cardWrap}>

          {/* Floating close × */}
          <Pressable
            onPress={onClose}
            hitSlop={10}
            style={({ pressed }) => [sp.floatClose, pressed && { opacity: 0.7 }]}>
            <View style={sp.xL} />
            <View style={sp.xR} />
          </Pressable>

          {/* Dialog card — no fixed height, grows with content */}
          <View style={[sp.card, isDarkMode && sp.cardDark]}>

            {/* Pink top stripe */}
            <View style={sp.topAccent} />

            {/* Header */}
            <View style={[sp.header, { backgroundColor: card, borderBottomColor: brd }]}>
              <View style={sp.headerIcon}>
                <MaterialCommunityIcons name="tag-edit-outline" size={17} color="#FFF" />
              </View>
              <Text style={[sp.headerTitle, { color: colors.primaryText }]}>
                Setup Default Selling Price
              </Text>
            </View>

            {/* Body — height = min(content, MAX_BODY_H) → scrolls when full */}
            <View style={{ height: bodyH > 0 ? bodyH : undefined }}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                scrollEnabled={contentH > MAX_BODY_H}
                onContentSizeChange={(_, h) => setContentH(h)}>

                {/* Item display */}
                <View style={[sp.itemBanner, { backgroundColor: bg, borderBottomColor: div }]}>
                  <Text style={sp.itemMetaLbl}>Item</Text>
                  <Text style={[sp.itemName, { color: colors.primaryText }]}>
                    {item.itemName.toUpperCase()}
                  </Text>
                  <Text style={[sp.itemCode, { color: Colors.primaryHighlight }]}>
                    ({item.itemCode})
                  </Text>
                </View>

                {/* Mechanism groups */}
                <View style={sp.mechanismSection}>
                  <Text style={[sp.mechanismTitle, { color: colors.primaryText }]}>
                    <Text style={{ color: Colors.primaryHighlight }}>* </Text>
                    Select Mechanism
                  </Text>

<View
                    style={[sp.groupCard, { backgroundColor: bg, borderColor: brd }]}
                    onLayout={e => { groupYRef.current.supplier = e.nativeEvent.layout.y; }}>
                    <View style={sp.groupLabelRow}>
                      <View style={[sp.groupDot, { backgroundColor: '#1565C0' }]} />
                      <Text style={sp.groupLabel}>Supplier Controlled</Text>
                    </View>
                    <RadioRow value="supplier-fixed-mrp"    label="Fixed MRP" />
                    <RadioRow value="supplier-fixed-profit" label="Fixed Profit (Over Cost)" />
                    {isSupplierSelected && (
                      <View style={[sp.groupDetails, { borderTopColor: div, backgroundColor: card }]}>   
                        {isMrp ? mrpFields() : profitFields()}
                      </View>
                    )}
                  </View>

                  <View
                    style={[sp.groupCard, { backgroundColor: bg, borderColor: brd }]}
                    onLayout={e => { groupYRef.current.custom = e.nativeEvent.layout.y; }}>
                    <View style={sp.groupLabelRow}>
                      <View style={[sp.groupDot, { backgroundColor: '#6A1B9A' }]} />
                      <Text style={sp.groupLabel}>Custom Controlled</Text>
                    </View>
                    <RadioRow value="custom-fixed-mrp"    label="Fixed MRP" />
                    <RadioRow value="custom-fixed-profit" label="Fixed Profit (Over Cost)" />
                    {isCustomSelected && (
                      <View style={[sp.groupDetails, { borderTopColor: div, backgroundColor: card }]}>   
                        {isMrp ? mrpFields() : profitFields()}
                      </View>
                    )}
                  </View>

                  <View
                    style={[sp.groupCard, { backgroundColor: bg, borderColor: brd }]}
                    onLayout={e => { groupYRef.current.pos = e.nativeEvent.layout.y; }}>
                    <View style={sp.groupLabelRow}>
                      <View style={[sp.groupDot, { backgroundColor: '#D97706' }]} />
                      <Text style={sp.groupLabel}>Non-Controlled</Text>
                    </View>
                    <RadioRow value="pos-seller-rate" label="Seller Rate Decided At POS" />
                    {isPOS && (
                      <View style={[sp.posInside, { borderTopColor: div }]}>    
                        <MaterialCommunityIcons name="alert-outline" size={22} color="#D97706" style={{ flexShrink: 0, marginTop: 1 }} />
                        <Text style={sp.posTxt}>
                          Item has no selling price. Please set the price in POS before proceeding.
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

              </ScrollView>
            </View>

            {/* Footer — always at the bottom of the card */}
            <View style={[sp.footer, { borderTopColor: brd, backgroundColor: card }]}>
              <Pressable
                disabled={!canSave()}
                onPress={() => { onSave(item, form); onClose(); }}
                style={({ pressed }) => [
                  sp.saveBtn,
                  canSave() ? sp.saveBtnActive : sp.saveBtnDisabled,
                  canSave() && pressed && { opacity: 0.82 },
                ]}>
                <MaterialCommunityIcons name="content-save-outline" size={16} color="#FFF" />
                <Text style={sp.saveBtnTxt}>Save</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Main screen ─────────────────────────────────────────────────────────────────

export function StockInventorySellingPriceScreen() {
  const [activeTab,   setActiveTab]   = useState<SISPTabKey>('stock');
  const [stockSubTab, setStockSubTab] = useState<StockSellingSubTabKey>('item');
  const [refreshing,  setRefreshing]  = useState(false);
  const [items,       setItems]       = useState<ItemSellingRecord[]>(INITIAL_ITEMS);
  const [editItem,    setEditItem]    = useState<ItemSellingRecord | null>(null);

  function handleMainTabChange(key: SISPTabKey) {
    setActiveTab(key);
    if (key === 'stock') setStockSubTab('item');
  }

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise<void>(r => setTimeout(r, 700));
    setRefreshing(false);
  }

  function handleEdit(item: ItemSellingRecord) {
    setEditItem(item);
  }

  function handleSave(_item: ItemSellingRecord, _form: SPForm) {
    // persist to store / API here
  }

  function handleDelete(id: string) {
    const item = items.find(r => r.id === id);
    if (!item) return;
    Alert.alert(
      'Delete Item',
      `Remove "${item.itemName}" (${item.itemCode}) from the selling price list?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setItems(prev => prev.filter(r => r.id !== id)),
        },
      ],
    );
  }

  // Resolve placeholder content for non-table tabs
  let placeholderIcon: string;
  let placeholderTitle: string;
  let placeholderSubtitle: string;

  if (activeTab === 'stock' && stockSubTab === 'vehicle') {
    const meta          = SUBTAB_META['vehicle'];
    placeholderIcon     = meta.icon;
    placeholderTitle    = meta.title;
    placeholderSubtitle = meta.subtitle;
  } else {
    placeholderIcon     = TAB_ICONS[activeTab as Exclude<SISPTabKey, 'stock'>] ?? 'tag-multiple-outline';
    placeholderTitle    = SISP_TABS.find(t => t.key === activeTab)!.label;
    placeholderSubtitle = TAB_SUBTITLES[activeTab];
  }

  const showItemTable = activeTab === 'stock' && stockSubTab === 'item';

  return (
    <SubModuleLayout
      parentModuleId="3"
      title="Stock And Inventory Selling Price"
      showBack={true}
      selfManagesScroll={true}>
      <View style={s.container}>

        {/* ── Main tab bar ── */}
        <View style={s.tabBarWrap}>
          <ScrollableSegmentTabBar
            tabs={SISP_TABS}
            active={activeTab}
            onChange={handleMainTabChange}
          />
        </View>

        {/* ── Stock sub-tab bar ── */}
        {activeTab === 'stock' && (
          <View style={s.subTabWrap}>
            <StockSellingSubTabBar active={stockSubTab} onChange={setStockSubTab} />
          </View>
        )}

        {/* ── Content panel ── */}
        <View style={s.panel}>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primaryHighlight}
              />
            }>
            {showItemTable ? (
              <ItemSellingTable
                items={items}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ) : (
              <TabPlaceholder
                icon={placeholderIcon}
                title={placeholderTitle}
                subtitle={placeholderSubtitle}
              />
            )}
          </ScrollView>
        </View>

      </View>

      {/* ── Edit selling price modal ── */}
      {editItem && (
        <SetupSellingPriceModal
          item={editItem}
          onClose={() => setEditItem(null)}
          onSave={handleSave}
        />
      )}

    </SubModuleLayout>
  );
}

// ── Layout styles ───────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:    { flex: 1, paddingTop: 8 },
  tabBarWrap:   { paddingHorizontal: Spacing.md },
  subTabWrap:   { marginTop: 4, paddingHorizontal: Spacing.md },
  panel:        { flex: 1, marginTop: 4 },
  scroll:       { flex: 1 },
  scrollContent:{ flexGrow: 1, paddingBottom: 80 },
});

// ── Arrow button styles ─────────────────────────────────────────────────────────

const arr = StyleSheet.create({
  btn:     { width: ARROW_W, height: 32, alignItems: 'center', justifyContent: 'center' },
  disabled:{ opacity: 0.35 },
  pressed: { opacity: 0.55, transform: [{ scale: 0.9 }] },
  chevron: { width: 7, height: 7, borderTopWidth: 2, borderRightWidth: 2 },
});

// ── Main tab bar styles ─────────────────────────────────────────────────────────

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

// ── Sub-tab bar styles ──────────────────────────────────────────────────────────

const sub = StyleSheet.create({
  wrap:       { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1 },
  tab:        { paddingVertical: 9, paddingHorizontal: 16, alignItems: 'center', position: 'relative' },
  label:      { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: '#9A9A9A', fontWeight: '500' },
  labelActive:{ fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: '600', color: Colors.primaryHighlight },
  indicator:  { position: 'absolute', bottom: 0, left: 16, right: 16, height: 2, borderRadius: 1, backgroundColor: Colors.primaryHighlight },
});

// ── Placeholder styles ──────────────────────────────────────────────────────────

const ph = StyleSheet.create({
  wrap:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, paddingTop: 70, gap: 0 },
  iconCircle:{ width: 68, height: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center', marginBottom: 18 },
  title:     { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center', marginBottom: 8 },
  sub:       { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#8E8E93', textAlign: 'center', lineHeight: 21, maxWidth: 280, marginBottom: 20 },
  badge:     { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(245,158,11,0.10)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: 'rgba(245,158,11,0.20)' },
  badgeTxt:  { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#D97706' },
});

// ── Item selling card & table styles ───────────────────────────────────────────

const isp = StyleSheet.create({
  // Card — mirrors isc from ManageItemScreen
  card:          { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAF0', shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, overflow: 'hidden', marginHorizontal: Spacing.md, marginBottom: 10 },
  cardDark:      { backgroundColor: '#1C1C1E', borderColor: '#2A2A2C' },
  accent:        { width: 4 },
  inner:         { flex: 1 },

  // Header
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 12 },
  ring:          { width: 50, height: 50, borderRadius: 25, borderWidth: 3, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ringInner:     { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center' },
  ringPct:       { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700' },
  nameBlock:     { flex: 1, gap: 4 },
  name:          { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  codeBadge:     { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(233,30,99,0.10)' },
  codeBadgeTxt:  { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: Colors.primaryHighlight },
  idx:           { fontFamily: FontFamily.regular, fontSize: 11, alignSelf: 'flex-start', marginTop: 2 },
  divider:       { height: 1 },

  // Info chips
  chips:         { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, alignItems: 'flex-start' },
  chip:          { flex: 1, gap: 4 },
  chipLabel:     { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#9090A0' },
  chipValue:     { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', lineHeight: 17 },
  chipSep:       { width: 1, minHeight: 34, marginHorizontal: 10, marginTop: 4 },

  // Actions
  actions:       { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  btn:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnEdit:       { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnDelete:     { backgroundColor: 'rgba(233,30,99,0.08)' },
  btnPressed:    { opacity: 0.7, transform: [{ scale: 0.97 }] },
  btnTxt:        { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#595959' },
  btnDelTxt:     { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: Colors.primaryHighlight },

  // List & search
  list:          { paddingTop: 4 },
  searchWrap:    { paddingHorizontal: Spacing.md, paddingBottom: 6 },
  searchBar:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 40, borderRadius: 10, borderWidth: 1 },
  searchInput:   { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, paddingVertical: 0 },
  clearBtn:      { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  clearX1:       { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }],  backgroundColor: '#888' },
  clearX2:       { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }], backgroundColor: '#888' },

  // Count row
  countRow:      { paddingHorizontal: Spacing.md, paddingBottom: 8 },
  countTxt:      { fontFamily: FontFamily.regular, fontSize: FontSize.xs },

  // Empty state
  emptyWrap:     { alignItems: 'center', paddingVertical: 50, paddingHorizontal: Spacing.xl, gap: 8 },
  emptyIcon:     { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle:    { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySubText:  { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#AAAAAA', textAlign: 'center', lineHeight: 20 },
  clearSearchBtn:{ marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(89,89,89,0.10)' },
  clearSearchTxt:{ fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '600', color: '#595959' },
});

// ── Setup Selling Price Modal styles ────────────────────────────────────────────

const sp = StyleSheet.create({
  // Centered overlay (fills screen, centers dialog)
  overlay:          { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  backdrop:         { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.52)' },

  // Card wrapper — holds the floating close button + the dialog card
  cardWrap:         { width: '100%' },

  // Floating close × button (sits above the card's top-right corner)
  floatClose:       { position: 'absolute', top: -15, right: -4, zIndex: 20, width: 32, height: 32, borderRadius: 16, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.28, shadowRadius: 4, elevation: 8 },
  xL:               { position: 'absolute', width: 13, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '45deg'  }] },
  xR:               { position: 'absolute', width: 13, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  // Dialog card — full border radius, grows to content
  card:             { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.22, shadowRadius: 28, elevation: 18 },
  cardDark:         { backgroundColor: '#1C1C1E' },

  // Top accent bar
  topAccent:        { height: 4, backgroundColor: Colors.primaryHighlight },

  // Header (fixed height ~56 px)
  header:           { flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: Spacing.md, paddingVertical: 13, borderBottomWidth: 1 },
  headerIcon:       { width: 36, height: 36, borderRadius: 10, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headerTitle:      { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: '700', flex: 1 },

  // bodyContent padding (applied to ScrollView contentContainerStyle)
  bodyContent:      { paddingBottom: 16 },

  // Item banner
  itemBanner:       { paddingHorizontal: Spacing.md, paddingVertical: 14, borderBottomWidth: 1, gap: 2 },
  itemMetaLbl:      { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.6 },
  itemName:         { fontFamily: FontFamily.bold, fontSize: 17, fontWeight: '700', lineHeight: 22 },
  itemCode:         { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600' },

  // Mechanism section
  mechanismSection: { paddingHorizontal: Spacing.md, paddingTop: 16, paddingBottom: 8, gap: 10 },
  mechanismTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', marginBottom: 2 },

  // Group card
  groupCard:        { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 10 },
  groupLabelRow:    { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 2 },
  groupDot:         { width: 8, height: 8, borderRadius: 4 },
  groupLabel:       { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#9090A0', textTransform: 'uppercase', letterSpacing: 0.5 },
  groupDetails:     { marginTop: 16, marginHorizontal: -14, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 8, gap: 14, borderTopWidth: 1 },
  posInside:        { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 16, marginHorizontal: -14, paddingHorizontal: 18, paddingTop: 16, paddingBottom: 14, borderTopWidth: 1 },

  // Radio button
  radioRow:         { flexDirection: 'row', alignItems: 'center', gap: 10 },
  radioOuter:       { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: '#C0C0CC', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  radioDot:         { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.primaryHighlight },
  radioLabel:       { fontFamily: FontFamily.regular, fontSize: FontSize.sm },

  // Fields card
  fieldsCard:       { marginHorizontal: Spacing.md, marginTop: 4, borderRadius: 14, borderWidth: 1, overflow: 'hidden' },
  fieldSection:     { paddingHorizontal: 14, paddingVertical: 14 },
  fieldSectionHeader:{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 14 },
  fieldSectionTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700' },
  fieldsDivider:    { height: 1 },

  // Price / percent input
  inputWrap:        { flex: 1, gap: 6 },
  inputLabel:       { fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },
  inputUnderline:   { borderBottomWidth: 1.5, paddingBottom: 6 },
  inputTxt:         { fontFamily: FontFamily.bold, fontSize: 16, fontWeight: '700', paddingVertical: 0 },

  // Two-column layout for profit fields
  twoCol:           { flexDirection: 'row', alignItems: 'flex-end' },
  colSep:           { width: 16 },

  // POS warning card
  posCard:          { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginHorizontal: Spacing.md, marginTop: 8, padding: 16, borderRadius: 14, backgroundColor: 'rgba(245,158,11,0.10)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.28)' },
  posTxt:           { flex: 1, fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: '#D97706', lineHeight: 21, fontWeight: '500' },

  // Footer
  footer:           { paddingHorizontal: Spacing.md, paddingTop: 12, paddingBottom: 28, borderTopWidth: 1 },
  saveBtn:          { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 15 },
  saveBtnDisabled:  { backgroundColor: '#A8A8AE' },
  saveBtnActive:    { backgroundColor: Colors.primaryHighlight, shadowColor: Colors.primaryHighlight, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.38, shadowRadius: 10, elevation: 8 },
  saveBtnTxt:       { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: '#FFF' },

  // Inline field section inside groupDetails (inherits groupDetails padding)
  inlineFieldSection: { gap: 10 },
  // Full-width divider spanning edge-to-edge within groupDetails
  inlineDivider:    { height: 1, marginHorizontal: -18 },
});
