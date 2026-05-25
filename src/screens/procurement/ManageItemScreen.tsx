import React, { useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  useWindowDimensions,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { setItemSellingConfig } from '../../store/itemSellingStore';

// ── Health helpers ────────────────────────────────────────────────────────────
const IS_HEALTH_FIELDS: Array<{ key: keyof ItemSellingRecord; label: string }> = [
  { key: 'itemCode',        label: 'Item Code' },
  { key: 'itemName',        label: 'Item Name' },
  { key: 'itemDescription', label: 'Description' },
];
function calcISHealth(r: ItemSellingRecord): number {
  const filled = IS_HEALTH_FIELDS.filter(f => !!r[f.key]).length;
  return Math.round((filled / IS_HEALTH_FIELDS.length) * 100);
}
function isRingColor(pct: number): string {
  return pct < 25 ? '#E53935' : pct < 50 ? '#FB8C00' : pct < 75 ? '#FDD835' : '#30A84B';
}

// ── Tab definitions ───────────────────────────────────────────────────────────

const MANAGE_ITEM_TABS = [
  { key: 'item-selling',       label: 'Item Selling' },
  { key: 'vehicle-selling',    label: 'Vehicle Selling' },
  { key: 'movement-category',  label: 'Movement Category' },
  { key: 'goods',              label: 'Goods' },
];

const TAB_ICONS: Record<string, string> = {
  'item-selling':      'tag-multiple-outline',
  'vehicle-selling':   'car-arrow-right',
  'movement-category': 'swap-horizontal-circle-outline',
  'goods':             'package-variant-closed-outline',
};

const ARROW_W     = 18;
const ROW_GAP     = 6;
const SCROLL_STEP = 120;

// ── Item Selling types & mock data ────────────────────────────────────────────

interface ItemSellingRecord {
  id: string;
  itemCode: string;
  itemName: string;
  itemDescription: string;
}

type ProfitType = 'fixed' | 'percentage';
type MrpFixed   = 'yes'   | 'no';

interface EditItemSellingForm {
  mrpFixed:      MrpFixed;
  profitType:    ProfitType;
  unit:          string;
  profitMargin:  string;
  profitMarkup:  string;
  fixedPrice:    string;
}

const EMPTY_EDIT_FORM: EditItemSellingForm = {
  mrpFixed: 'no', profitType: 'percentage',
  unit: '', profitMargin: '', profitMarkup: '', fixedPrice: '',
};

const ITEM_SELLING_DATA: ItemSellingRecord[] = [
  { id: '1', itemCode: 'SP01-HL01-0000', itemName: 'Scoop',            itemDescription: 'Spare Parts Head Light HINO SCOOP (L-h-s) DUTRO – KK BU306M – 1999/05 to 2004-06' },
  { id: '2', itemCode: 'SP01-D01-0002',  itemName: 'Profia',           itemDescription: 'Spare Parts Dashboard HINO PROFIA (Black) TRUCK FN – KL FN2P – 2002/11 to present' },
  { id: '3', itemCode: 'SP01-D01-0003',  itemName: 'Caner Wide',       itemDescription: 'Spare Parts Dashboard MITSUBISHI CANER WIDE (Black) TRUCK FU – U FU415 – 1993/06 to 1995-05' },
  { id: '4', itemCode: 'SP01-D01-0004',  itemName: 'Ranger',           itemDescription: 'Spare Parts Dashboard HINO RANGER (Black) FC RANGER – KK FC1JCDD – 2001/06 to present' },
  { id: '5', itemCode: 'SP01-D01-0005',  itemName: 'I061',             itemDescription: 'Spare Parts Dashboard ISUZU I061 (Black) ELF 250 – U NKR61 – 1984/06 to 1993-06' },
  { id: '6', itemCode: 'SP01-HL01-0006', itemName: 'Wagon R Stingray', itemDescription: 'Spare Parts Vehicle Head Light SUZUKI WAGON R STINGRAY (R-h-s) MR FZ Series – 2013/09 to present' },
];

// ── Info chip (mirrors EmployeeManagementScreen InfoChip) ─────────────────────
function ISInfoChip({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={isc.chip}>
      <Text style={isc.chipLabel}>{label}</Text>
      <Text style={[isc.chipValue, { color: colors.primaryText }]} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

// ── Item Selling health modal ─────────────────────────────────────────────────
function SellingHealthModal({ visible, record, onClose }: {
  visible: boolean; record: ItemSellingRecord; onClose: () => void;
}) {
  const pct         = calcISHealth(record);
  const ringColor   = isRingColor(pct);
  const isComplete  = pct === 100;
  const filledCount = IS_HEALTH_FIELDS.filter(f => !!record[f.key]).length;
  const totalCount  = IS_HEALTH_FIELDS.length;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={ism.overlay} onPress={onClose}>
        <Pressable style={ism.card} onPress={() => {}}>
          <View style={[ism.topBar, { backgroundColor: ringColor }]} />
          <View style={ism.header}>
            <View style={[ism.ring, { borderColor: ringColor }]}>
              <Text style={[ism.ringPct, { color: ringColor }]}>{pct}%</Text>
            </View>
            <View style={ism.headerText}>
              <Text style={ism.title}>Form Health</Text>
              <Text style={ism.sub}>{filledCount} of {totalCount} fields complete</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={18} color="#9090A0" />
            </Pressable>
          </View>
          {isComplete ? (
            <View style={ism.completeBanner}>
              <MaterialCommunityIcons name="check-decagram" size={15} color="#2E7D32" />
              <Text style={ism.completeText}>Complete — all required fields are filled</Text>
            </View>
          ) : (
            <View style={ism.warnBanner}>
              <MaterialCommunityIcons name="alert-outline" size={14} color="#E65100" />
              <Text style={ism.warnText}>{totalCount - filledCount} field(s) need attention</Text>
            </View>
          )}
          <ScrollView style={ism.list} showsVerticalScrollIndicator={false}>
            {IS_HEALTH_FIELDS.map(({ key, label }) => {
              const filled = !!record[key];
              const val    = record[key];
              return (
                <View key={key} style={ism.row}>
                  <MaterialCommunityIcons
                    name={filled ? 'check-circle' : 'alert-circle-outline'}
                    size={16} color={filled ? '#30A84B' : '#FB8C00'} />
                  <View style={ism.rowBody}>
                    <Text style={ism.rowLabel}>{label}</Text>
                    {filled
                      ? <Text style={ism.rowValue} numberOfLines={1}>{String(val)}</Text>
                      : <Text style={ism.rowMissing}>Not filled</Text>}
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

// ── Item Selling Card (mirrors EmployeeCard exactly) ──────────────────────────
function ItemSellingCard({
  record, index, onEdit,
}: { record: ItemSellingRecord; index: number; onEdit: () => void }) {
  const { colors, isDarkMode } = useTheme();
  const pct       = calcISHealth(record);
  const ringColor = isRingColor(pct);
  const [showHealth, setShowHealth] = useState(false);

  return (
    <View style={[isc.card, isDarkMode && isc.cardDark]}>
      <View style={[isc.accent, { backgroundColor: Colors.primaryHighlight }]} />
      <View style={isc.inner}>

        {/* Header */}
        <View style={isc.header}>
          <Pressable onPress={() => setShowHealth(true)} style={isc.iconWrap} hitSlop={6}>
            <View style={[isc.iconRing, { borderColor: ringColor }]}>
              <View style={isc.iconInner}>
                <Text style={[isc.iconPct, { color: ringColor }]}>{pct}%</Text>
              </View>
            </View>
          </Pressable>
          <View style={isc.nameBlock}>
            <Text style={[isc.name, { color: colors.primaryText }]} numberOfLines={1}>{record.itemName}</Text>
            <View style={isc.badge}>
              <Text style={isc.badgeTxt}>{record.itemCode}</Text>
            </View>
          </View>
          <Text style={[isc.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        <View style={[isc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* Info chips */}
        <View style={isc.chips}>
          <ISInfoChip label="Code" value={record.itemCode} />
          <View style={[isc.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <ISInfoChip label="Description" value={record.itemDescription} />
        </View>

        {/* Actions */}
        <View style={[isc.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable style={({ pressed }) => [isc.btn, isc.btnView, pressed && isc.btnPressed]} hitSlop={4}>
            <MaterialCommunityIcons name="eye-outline" size={13} color="#595959" />
            <Text style={isc.btnTxt}>View</Text>
          </Pressable>
          <Pressable onPress={onEdit} style={({ pressed }) => [isc.btn, isc.btnEdit, pressed && isc.btnPressed]} hitSlop={4}>
            <MaterialCommunityIcons name="pencil-outline" size={13} color="#595959" />
            <Text style={isc.btnTxt}>Edit</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable style={({ pressed }) => [isc.btn, isc.btnDelete, pressed && isc.btnPressed]} hitSlop={4}>
            <MaterialCommunityIcons name="delete-outline" size={13} color={Colors.primaryHighlight} />
            <Text style={isc.btnDelTxt}>Delete</Text>
          </Pressable>
        </View>
      </View>
      <SellingHealthModal visible={showHealth} record={record} onClose={() => setShowHealth(false)} />
    </View>
  );
}

// ── Edit Item Selling Modal ───────────────────────────────────────────────────

function RadioOption({
  label, selected, onSelect,
}: { label: string; selected: boolean; onSelect: () => void }) {
  return (
    <Pressable onPress={onSelect} style={em.radioWrap} hitSlop={6}>
      <View style={[em.radioOuter, selected && em.radioOuterActive]}>
        {selected && <View style={em.radioDot} />}
      </View>
      <Text style={[em.radioLabel, selected && em.radioLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function EditItemSellingModal({
  item, onClose,
}: { item: ItemSellingRecord; onClose: () => void }) {
  const [form, setForm] = useState<EditItemSellingForm>({ ...EMPTY_EDIT_FORM });

  function setField<K extends keyof EditItemSellingForm>(key: K, val: EditItemSellingForm[K]) {
    setForm(f => ({ ...f, [key]: val }));
  }

  function resetForm() {
    setForm({ ...EMPTY_EDIT_FORM });
  }

  const itemDisplay = `${item.itemName.toUpperCase()} (${item.itemCode})`;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={em.overlay}>
        <View style={em.cardWrapper}>

          {/* Close button — dark circle outside the card */}
          <Pressable
            onPress={onClose}
            hitSlop={8}
            style={({ pressed }) => [em.closeBtn, pressed && { opacity: 0.75 }]}>
            <View style={em.xL} />
            <View style={em.xR} />
          </Pressable>

          <View style={em.container}>

            {/* ── Header ── */}
            <View style={em.header}>
              <View style={em.headerIcon}>
                <MaterialCommunityIcons name="delete-outline" size={18} color="#FFF" />
              </View>
              <Text style={em.headerTitle} numberOfLines={1}>Edit Item Selling</Text>
              <Pressable
                onPress={resetForm}
                hitSlop={6}
                style={({ pressed }) => [em.resetBtn, pressed && { opacity: 0.75 }]}>
                <MaterialCommunityIcons name="refresh" size={12} color="#FFF" />
                <Text style={em.resetTxt}>Reset Form</Text>
              </Pressable>
            </View>

            {/* ── Form body ── */}
            <ScrollView
              style={em.body}
              contentContainerStyle={em.bodyContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled">

              {/* Item display */}
              <View style={em.section}>
                <Text style={em.fieldReq}>*Item</Text>
                <Text style={em.itemDisplay}>{itemDisplay}</Text>
              </View>

              <View style={em.divider} />

              {/* MRP Fixed By Supplier */}
              <View style={em.section}>
                <Text style={em.fieldLabel}>Selling Price (MRP) Fixed By Supplier</Text>
                <View style={em.radioRow}>
                  <RadioOption label="Yes" selected={form.mrpFixed === 'yes'} onSelect={() => setField('mrpFixed', 'yes')} />
                  <RadioOption label="No"  selected={form.mrpFixed === 'no'}  onSelect={() => setField('mrpFixed', 'no')} />
                </View>
              </View>

              <View style={em.divider} />

              {/* Profit Type */}
              <View style={em.section}>
                <Text style={em.fieldReq}>*Profit Type</Text>
                <View style={em.radioRow}>
                  <RadioOption label="Fixed Price" selected={form.profitType === 'fixed'}      onSelect={() => setField('profitType', 'fixed')} />
                  <RadioOption label="Percentage"  selected={form.profitType === 'percentage'} onSelect={() => setField('profitType', 'percentage')} />
                </View>
              </View>

              <View style={em.divider} />

              {/* Unit */}
              <View style={em.section}>
                <Text style={em.fieldReq}>*Unit</Text>
                <View style={em.selectBox}>
                  <Text style={[em.selectVal, !form.unit && em.selectPlaceholder]}>
                    {form.unit || 'Select unit…'}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={15} color="#9090A0" />
                </View>
              </View>

              <View style={em.divider} />

              {/* Conditional profit fields */}
              {form.profitType === 'percentage' ? (
                <View style={em.twoCol}>
                  <View style={em.col}>
                    <Text style={em.fieldLabel}>Profit Margin (%)</Text>
                    <TextInput
                      style={em.lineInput}
                      value={form.profitMargin}
                      onChangeText={v => setField('profitMargin', v)}
                      keyboardType="numeric"
                      placeholder=""
                    />
                  </View>
                  <View style={em.colSep} />
                  <View style={em.col}>
                    <Text style={em.fieldLabel}>Profit Markup (%)</Text>
                    <TextInput
                      style={em.lineInput}
                      value={form.profitMarkup}
                      onChangeText={v => setField('profitMarkup', v)}
                      keyboardType="numeric"
                      placeholder=""
                    />
                  </View>
                </View>
              ) : (
                <View style={em.section}>
                  <Text style={em.fieldLabel}>Fixed Price (null)</Text>
                  <TextInput
                    style={em.lineInput}
                    value={form.fixedPrice}
                    onChangeText={v => setField('fixedPrice', v)}
                    keyboardType="numeric"
                    placeholder=""
                  />
                </View>
              )}

            </ScrollView>

            {/* ── Footer ── */}
            <View style={em.footer}>
              <Pressable
                style={({ pressed }) => [em.saveBtn, pressed && { opacity: 0.8 }]}
                onPress={() => {
                  setItemSellingConfig(item.itemCode, {
                    mrpFixed:     form.mrpFixed,
                    profitType:   form.profitType,
                    profitMargin: parseFloat(form.profitMargin) || 0,
                    profitMarkup: parseFloat(form.profitMarkup) || 0,
                    fixedPrice:   parseFloat(form.fixedPrice)   || 0,
                  });
                  onClose();
                }}>
                <Text style={em.saveTxt}>Save</Text>
              </Pressable>
            </View>

          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Item Selling List (card layout matching EmployeeManagementScreen) ─────────

function ItemSellingTable({ onEdit }: { onEdit: (item: ItemSellingRecord) => void }) {
  const { isDarkMode, colors } = useTheme();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ITEM_SELLING_DATA;
    return ITEM_SELLING_DATA.filter(r =>
      r.itemCode.toLowerCase().includes(q) ||
      r.itemName.toLowerCase().includes(q) ||
      r.itemDescription.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <View>
      {/* Search bar — matches lv.searchBar from EmployeeManagementScreen */}
      <View style={isc.searchWrap}>
        <View style={[isc.searchBar, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF', borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' }]}>
          <MaterialCommunityIcons name="magnify" size={16} color={colors.placeholder} />
          <TextInput
            style={[isc.searchInput, { color: colors.primaryText }]}
            placeholder="Search by name, code or description…"
            placeholderTextColor={colors.placeholder}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8} style={isc.clearBtn}>
              <View style={isc.clearX1} />
              <View style={isc.clearX2} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Card list — matches ec.list from EmployeeManagementScreen */}
      {filtered.length === 0 ? (
        <View style={isc.emptyWrap}>
          <View style={isc.emptyIcon}>
            <MaterialCommunityIcons name="tag-off-outline" size={26} color="rgba(89,89,89,0.3)" />
          </View>
          <Text style={[isc.emptyTitle, { color: colors.primaryText }]}>
            {query.trim() ? 'No matches found' : 'No item selling records'}
          </Text>
          <Text style={[isc.emptySubText, { color: colors.placeholder }]}>
            {query.trim() ? `Nothing matched "${query.trim()}"` : 'Add a new entry to get started'}
          </Text>
          {query.trim().length > 0 && (
            <Pressable onPress={() => setQuery('')} style={isc.clearSearchBtn}>
              <Text style={isc.clearSearchTxt}>Clear search</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <View style={isc.list}>
          {filtered.map((record, idx) => (
            <ItemSellingCard
              key={record.id}
              record={record}
              index={idx}
              onEdit={() => onEdit(record)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

// ── Placeholder content ───────────────────────────────────────────────────────

function TabPlaceholder({ label, tabKey }: { label: string; tabKey: string }) {
  return (
    <View style={ph.wrap}>
      <View style={ph.iconCircle}>
        <MaterialCommunityIcons
          name={(TAB_ICONS[tabKey] ?? 'package-variant-outline') as any}
          size={28}
          color="rgba(89,89,89,0.4)"
        />
      </View>
      <Text style={ph.title}>{label}</Text>
      <Text style={ph.sub}>No records found. Add a new entry to get started.</Text>
    </View>
  );
}

// ── Arrow button ──────────────────────────────────────────────────────────────

function ArrowButton({
  direction, disabled, onPress,
}: {
  direction: 'left' | 'right';
  disabled: boolean;
  onPress: () => void;
}) {
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

// ── Scrollable segment tab bar ────────────────────────────────────────────────

function ScrollableSegmentTabBar({
  tabs, active, onChange,
}: {
  tabs: typeof MANAGE_ITEM_TABS;
  active: string;
  onChange: (key: string) => void;
}) {
  const { width: screenWidth } = useWindowDimensions();
  const scrollRef       = useRef<ScrollView>(null);
  const dropBtnRef      = useRef<any>(null);
  const offsetRef       = useRef(0);
  const contentWidthRef = useRef(0);
  const layoutWidthRef  = useRef(0);
  const tabOffsetsRef   = useRef<Record<string, number>>({});
  const tabWidthsRef    = useRef<Record<string, number>>({});
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);
  const [dropOpen, setDropOpen] = useState(false);
  const [dropPos,  setDropPos]  = useState({ top: 0, right: 0 });

  function scrollTo(x: number) {
    const max     = Math.max(0, contentWidthRef.current - layoutWidthRef.current);
    const clamped = Math.max(0, Math.min(max, x));
    scrollRef.current?.scrollTo({ x: clamped, animated: true });
  }

  function scrollToTab(key: string) {
    const tabX    = tabOffsetsRef.current[key] ?? 0;
    const tabW    = tabWidthsRef.current[key] ?? 0;
    const centerX = tabX - (layoutWidthRef.current - tabW) / 2;
    scrollTo(centerX);
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

  function openDropdown() {
    dropBtnRef.current?.measure(
      (_x: number, _y: number, w: number, h: number, pageX: number, pageY: number) => {
        setDropPos({ top: pageY + h + 6, right: screenWidth - (pageX + w) });
        setDropOpen(true);
      },
    );
  }

  return (
    <>
      <View style={st.row}>
        <ArrowButton direction="left"  disabled={!canLeft}  onPress={() => scrollTo(offsetRef.current - SCROLL_STEP)} />

        <View style={st.strip}>
          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onScroll}
            scrollEventThrottle={16}
            onContentSizeChange={w => { contentWidthRef.current = w; updateArrows(offsetRef.current); }}
            onLayout={e => { layoutWidthRef.current = e.nativeEvent.layout.width; updateArrows(offsetRef.current); }}
            contentContainerStyle={st.scroll}>
            {tabs.map(t => {
              const isActive = active === t.key;
              return (
                <Pressable
                  key={t.key}
                  onPress={() => onChange(t.key)}
                  onLayout={e => {
                    tabOffsetsRef.current[t.key] = e.nativeEvent.layout.x;
                    tabWidthsRef.current[t.key]  = e.nativeEvent.layout.width;
                  }}
                  style={({ pressed }) => [st.tab, isActive && st.tabActive, pressed && st.tabPressed]}>
                  <Text style={[st.label, isActive && st.labelActive]}>{t.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ArrowButton direction="right" disabled={!canRight} onPress={() => scrollTo(offsetRef.current + SCROLL_STEP)} />

        <Pressable
          ref={dropBtnRef}
          onPress={openDropdown}
          hitSlop={6}
          accessibilityRole="button"
          style={({ pressed }) => [st.dropBtn, pressed && st.dropBtnPressed]}>
          <MaterialCommunityIcons name="chevron-down" size={15} color={Colors.primaryHighlight} />
        </Pressable>
      </View>

      <Modal visible={dropOpen} transparent animationType="fade" onRequestClose={() => setDropOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setDropOpen(false)}>
          <View style={{ flex: 1 }}>
            <TouchableWithoutFeedback>
              <View style={[dd.panel, { top: dropPos.top, right: dropPos.right }]}>
                {tabs.map(t => {
                  const isActive = active === t.key;
                  return (
                    <Pressable
                      key={t.key}
                      onPress={() => { onChange(t.key); scrollToTab(t.key); setDropOpen(false); }}
                      style={({ pressed }) => [dd.tabBox, isActive && dd.tabBoxActive, pressed && dd.tabBoxPressed]}>
                      <Text style={[dd.label, isActive && dd.labelActive]} numberOfLines={1}>{t.label}</Text>
                      {isActive && <MaterialCommunityIcons name="check" size={12} color={Colors.primaryHighlight} />}
                    </Pressable>
                  );
                })}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export function ManageItemScreen() {
  const [activeTab,  setActiveTab]  = useState('item-selling');
  const [editItem,   setEditItem]   = useState<ItemSellingRecord | null>(null);
  const activeTabItem = MANAGE_ITEM_TABS.find(t => t.key === activeTab);

  function renderTabContent() {
    if (activeTab === 'item-selling') {
      return <ItemSellingTable onEdit={setEditItem} />;
    }
    return (
      <TabPlaceholder
        label={activeTabItem?.label ?? activeTab}
        tabKey={activeTab}
      />
    );
  }

  return (
    <SubModuleLayout parentModuleId="4" title="Manage Item" showBack={true}>
      <View style={s.container}>
        <View style={s.tabBarWrap}>
          <ScrollableSegmentTabBar
            tabs={MANAGE_ITEM_TABS}
            active={activeTab}
            onChange={setActiveTab}
          />
        </View>
        <View style={s.panel}>
          <ScrollView
            style={s.scroll}
            contentContainerStyle={s.scrollContent}
            showsVerticalScrollIndicator={false}>
            {renderTabContent()}
          </ScrollView>
        </View>
      </View>

      {editItem && (
        <EditItemSellingModal
          item={editItem}
          onClose={() => setEditItem(null)}
        />
      )}
    </SubModuleLayout>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  container:    { flex: 1, paddingTop: 8 },
  tabBarWrap:   { paddingHorizontal: Spacing.md },
  panel:        { flex: 1, marginTop: 8 },
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
  row:           { flexDirection: 'row', alignItems: 'center', gap: ROW_GAP },
  strip:         { flex: 1, backgroundColor: '#F0F0F5', borderRadius: 8, padding: 2, overflow: 'hidden' },
  scroll:        { flexDirection: 'row', gap: 2 },
  tab:           { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  tabActive:     { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.09, shadowRadius: 2, elevation: 2 },
  tabPressed:    { opacity: 0.70 },
  label:         { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: '#9A9A9A', fontWeight: '500' },
  labelActive:   { fontFamily: FontFamily.bold, fontWeight: '600', color: '#1C1C1E' },
  dropBtn:       { width: 28, height: 32, borderRadius: 6, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.primaryHighlight + '18' },
  dropBtnPressed:{ opacity: 0.6 },
});

const dd = StyleSheet.create({
  panel:        { position: 'absolute', minWidth: 180, backgroundColor: '#FFFFFF', borderRadius: 14, paddingVertical: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.14, shadowRadius: 16, elevation: 10, overflow: 'hidden' },
  tabBox:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, marginHorizontal: 6, marginVertical: 1, borderRadius: 7, gap: 6 },
  tabBoxActive: { backgroundColor: Colors.primaryHighlight + '12' },
  tabBoxPressed:{ backgroundColor: '#EAEAF0' },
  label:        { flex: 1, fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '500', color: '#1C1C1E' },
  labelActive:  { fontFamily: FontFamily.bold, fontWeight: '600', color: Colors.primaryHighlight },
});

const ph = StyleSheet.create({
  wrap:       { flex: 1, alignItems: 'center', paddingTop: 60, paddingHorizontal: Spacing.xl, gap: 10 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  title:      { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', color: '#595959', textAlign: 'center' },
  sub:        { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#AAAAAA', textAlign: 'center', lineHeight: 20 },
});

const isc = StyleSheet.create({
  // Card (mirrors ec from EmployeeManagementScreen)
  card:           { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAF0', shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, overflow: 'hidden', marginHorizontal: Spacing.md, marginBottom: 10 },
  cardDark:       { backgroundColor: '#1C1C1E', borderColor: '#2A2A2C' },
  accent:         { width: 4 },
  inner:          { flex: 1 },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 12 },
  iconWrap:       { alignItems: 'center', flexShrink: 0 },
  iconRing:       { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  iconInner:      { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  iconPct:        { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },
  nameBlock:      { flex: 1, gap: 4 },
  name:           { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  badge:          { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(233,30,99,0.10)' },
  badgeTxt:       { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: Colors.primaryHighlight },
  idx:            { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500', alignSelf: 'flex-start', marginTop: 2 },
  divider:        { height: 1 },
  chips:          { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' },
  chip:           { flex: 1, gap: 4 },
  chipLabel:      { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#9090A0' },
  chipValue:      { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600' },
  chipSep:        { width: 1, height: 34, marginHorizontal: 10 },
  actions:        { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  btn:            { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnView:        { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnEdit:        { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnDelete:      { backgroundColor: 'rgba(233,30,99,0.08)' },
  btnPressed:     { opacity: 0.7, transform: [{ scale: 0.97 }] },
  btnTxt:         { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#595959' },
  btnDelTxt:      { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: Colors.primaryHighlight },

  // List & search bar (mirrors lv from EmployeeManagementScreen)
  list:           { paddingTop: 4 },
  searchWrap:     { paddingHorizontal: Spacing.md, paddingBottom: 10 },
  searchBar:      { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 40, borderRadius: 10, borderWidth: 1 },
  searchInput:    { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, paddingVertical: 0 },
  clearBtn:       { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  clearX1:        { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }],  backgroundColor: '#888' },
  clearX2:        { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }], backgroundColor: '#888' },

  // Empty state
  emptyWrap:      { alignItems: 'center', paddingVertical: 50, paddingHorizontal: Spacing.xl, gap: 8 },
  emptyIcon:      { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle:     { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySubText:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#AAAAAA', textAlign: 'center', lineHeight: 20 },
  clearSearchBtn: { marginTop: 8, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, backgroundColor: 'rgba(89,89,89,0.10)' },
  clearSearchTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '600', color: '#595959' },
});

// ── Edit Item Selling Modal styles ────────────────────────────────────────────

const em = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 12 },
  cardWrapper: { flex: 1, maxHeight: '95%', width: '100%' },

  // Close button (dark circle floating above card)
  closeBtn:    { position: 'absolute', top: -18, right: -5, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 6 },
  xL:          { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR:          { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  container:   { flex: 1, backgroundColor: '#F5F5F7', borderRadius: 10, overflow: 'hidden' },

  // Header
  header:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: Spacing.md, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EBEBEB', gap: 10 },
  headerIcon:  { width: 36, height: 36, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  headerTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: '700', color: '#1C1C1E', flex: 1 },
  resetBtn:    { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#1976D2', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5 },
  resetTxt:    { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', color: '#FFF' },

  // Form body
  body:        { flex: 1, backgroundColor: '#FFF' },
  bodyContent: { paddingBottom: 20 },
  section:     { paddingHorizontal: Spacing.lg, paddingVertical: 14 },
  divider:     { height: 1, backgroundColor: '#F0F0F5', marginHorizontal: Spacing.lg },

  // Field labels
  fieldReq:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '600', color: Colors.primaryHighlight, marginBottom: 6 },
  fieldLabel:  { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '500', color: '#595959', marginBottom: 8 },

  // Item display
  itemDisplay: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, fontWeight: '700', color: '#1C1C1E', letterSpacing: 0.2 },

  // Radio buttons
  radioRow:        { flexDirection: 'row', gap: 24 },
  radioWrap:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioOuter:      { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: '#C0C0C8', alignItems: 'center', justifyContent: 'center' },
  radioOuterActive:{ borderColor: '#1976D2' },
  radioDot:        { width: 9, height: 9, borderRadius: 4.5, backgroundColor: '#1976D2' },
  radioLabel:      { fontFamily: FontFamily.regular, fontSize: FontSize.lg, color: '#3A3A3A' },
  radioLabelActive:{ fontFamily: FontFamily.medium, color: '#1C1C1E' },

  // Select box
  selectBox:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 0, paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D8' },
  selectVal:         { fontFamily: FontFamily.medium, fontSize: FontSize.lg, color: '#1C1C1E', flex: 1 },
  selectPlaceholder: { color: '#AAAAAA' },

  // Two-column layout
  twoCol:  { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingVertical: 14, gap: 0 },
  col:     { flex: 1 },
  colSep:  { width: Spacing.lg },

  // Line-only input (matches desktop UI underline style)
  lineInput: { fontFamily: FontFamily.regular, fontSize: FontSize.lg, color: '#1C1C1E', borderBottomWidth: 1.5, borderBottomColor: '#D0D0D8', paddingVertical: 6, paddingHorizontal: 0 },

  // Footer
  footer:  { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EBEBEB' },
  saveBtn: { alignItems: 'center', justifyContent: 'center', backgroundColor: '#595959', borderRadius: 10, paddingVertical: 14 },
  saveTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: '700', color: '#FFF' },
});

const ism = StyleSheet.create({
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
