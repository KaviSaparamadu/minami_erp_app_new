import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
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
import { PageTabBar, PageTabItem } from '../../components/common/PageTabBar';
import { TableIcons } from '../../components/common/DataTable';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { ENTITIES, WORK_BRANCHES } from '../../constants/employeeData';
import { useNavigation } from '../../context/NavigationContext';
import { useStores, type Store as StoreType } from '../../context/StoresContext';
import { useTheme } from '../../hooks/useTheme';
import type { AppModule } from '../../constants/modules';
import GPIT_BTN from '../../../assets/images/GPIT Create Module Button.png';
import { HsvColorPicker } from '../../components/common/HsvColorPicker';

type Tab       = 'dashboard' | 'modules';
type ModalMode = 'create' | 'edit' | 'view';

// ── Data models ───────────────────────────────────────────────────────────────
type Store = StoreType;

interface StoreItem {
  id: string;
  itemName: string;
  itemCode: string;
  quantity?: string;
  store?: string;
}

// ── Page tabs ─────────────────────────────────────────────────────────────────
const MS_TABS: PageTabItem[] = [
  { key: 'store',               label: 'Store',               color: '#595959' },
  { key: 'manage-stores-items', label: 'Manage Stores Items', color: '#595959' },
];

const DARK = '#595959';

// ── Abbreviation helpers ──────────────────────────────────────────────────────
function wbAbbr(wb: string): string {
  if (!wb.trim()) return '';
  const skip = new Set(['branch', 'office', 'the', 'of', 'and']);
  const letters = wb.split(' ')
    .filter(w => w.length > 0 && !skip.has(w.toLowerCase()))
    .map(w => w[0].toUpperCase())
    .join('');
  return letters + '01';
}

function entAbbr(ent: string): string {
  if (!ent.trim()) return '';
  const skip = new Set(['pvt', 'ltd', 'inc', 'corp', 'solutions', 'corporation',
    'innovations', 'systems', 'global', '(pvt)', 'group']);
  const letters = ent.replace(/[()]/g, '').split(' ')
    .filter(w => w.length > 1 && !skip.has(w.toLowerCase()))
    .map(w => w[0].toUpperCase())
    .join('');
  return letters + '01';
}

function nameAbbr(name: string): string {
  if (!name.trim()) return '';
  return name.trim().slice(0, 2).toUpperCase();
}

function genStoreCode(wb: string, name: string, ent: string): string {
  return `${wbAbbr(wb)} - ${nameAbbr(name)} - ${entAbbr(ent)}`;
}

// ── Progress helpers ──────────────────────────────────────────────────────────
function calcStoreProgress(wb: string, name: string, ent: string, color: string): number {
  let pct = 0;
  if (wb.trim()) pct += 25;
  if (name.trim()) pct += 25;
  if (ent.trim()) pct += 25;
  if (color.trim()) pct += 25;
  return pct;
}

function calcItemProgress(name: string, code: string): number {
  let pct = 0;
  if (name.trim()) pct += 50;
  if (code.trim()) pct += 50;
  return pct;
}

function healthColor(pct: number): string {
  if (pct < 25) return '#E53935';
  if (pct < 50) return '#FB8C00';
  if (pct < 75) return '#FDD835';
  return '#30A84B';
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ pct, required = 67 }: { pct: number; required?: number }) {
  const fillColor = healthColor(pct);
  return (
    <View style={pb.wrap}>
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${pct}%` as any, backgroundColor: fillColor }]} />
        <View style={[pb.marker, { left: `${required}%` as any }]} />
      </View>
      <View style={pb.labels}>
        <Text style={pb.labelLeft}>Results Weighted On</Text>
        <Text style={pb.labelMid}>Required — {required}%</Text>
        <Text style={[pb.labelRight, pct >= required && pb.labelAvg]}>
          {pct >= required ? 'Average ✓' : `${Math.round(pct)}%`}
        </Text>
      </View>
    </View>
  );
}

// ── View row (read-only) ──────────────────────────────────────────────────────
function ViewRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <View style={vw.row}>
      <Text style={vw.label}>{label}:</Text>
      <Text style={vw.value}>{value}</Text>
    </View>
  );
}

// ── Reset confirm dialog ──────────────────────────────────────────────────────
function ResetConfirm({ visible, onCancel, onConfirm }: { visible: boolean; onCancel: () => void; onConfirm: () => void }) {
  if (!visible) return null;
  return (
    <View style={rc.overlay}>
      <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onCancel} />
      <View style={rc.card}>
        <View style={rc.topAccent} />
        <Pressable onPress={onCancel} style={({ pressed }) => [rc.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={13} color="#999" />
        </Pressable>
        <View style={rc.iconRing}>
          <View style={rc.iconCircle}>
            <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
          </View>
        </View>
        <Text style={rc.title}>Reset Form?</Text>
        <Text style={rc.desc}>All entered data will be cleared.{'\n'}This action cannot be undone.</Text>
        <View style={rc.divider} />
        <View style={rc.btnRow}>
          <Pressable onPress={onCancel} style={({ pressed }) => [rc.cancelBtn, pressed && { opacity: 0.7 }]}>
            <Text style={rc.cancelTxt}>Keep Editing</Text>
          </Pressable>
          <Pressable onPress={onConfirm} style={({ pressed }) => [rc.confirmBtn, pressed && { opacity: 0.85 }]}>
            <MaterialCommunityIcons name="refresh" size={14} color="#FFF" />
            <Text style={rc.confirmTxt}>Yes, Reset</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── Store dropdown with GPIT button ──────────────────────────────────────────
interface StoreDropProps {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}

function StoreDropdown({ label, options, value, onChange, required }: StoreDropProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={[sdd.wrapper, { zIndex: open ? 200 : 1 }]}>
      <Text style={fi.label}>{label}{required ? <Text style={fi.req}> *</Text> : null}</Text>
      <View style={sdd.row}>
        <Pressable onPress={() => setOpen(o => !o)} style={[fi.input, sdd.trigger]}>
          <Text style={[sdd.triggerTxt, !value && sdd.placeholder]} numberOfLines={1}>
            {value || `Select ${label}`}
          </Text>
          <MaterialCommunityIcons name={open ? 'chevron-up' : 'chevron-down'} size={18} color="#888" />
        </Pressable>
        <Pressable style={sdd.gpitBtn} hitSlop={4}>
          <Image source={GPIT_BTN} style={sdd.gpitImg} resizeMode="contain" />
        </Pressable>
      </View>
      {open && (
        <ScrollView style={sdd.dropdown} keyboardShouldPersistTaps="handled" nestedScrollEnabled showsVerticalScrollIndicator={false}>
          {options.map(opt => (
            <Pressable key={opt} onPress={() => { onChange(opt); setOpen(false); }}
              style={({ pressed }) => [sdd.option, opt === value && sdd.optionSelected, pressed && { opacity: 0.7 }]}>
              <Text style={[sdd.optionTxt, opt === value && sdd.optionSelectedTxt]} numberOfLines={1}>{opt}</Text>
              {opt === value && <MaterialCommunityIcons name="check" size={14} color={Colors.primaryHighlight} />}
            </Pressable>
          ))}
        </ScrollView>
      )}
    </View>
  );
}

// ── Store modal ───────────────────────────────────────────────────────────────
function StoreModal({ visible, mode, item, stores, onClose, onSave }: {
  visible: boolean;
  mode: ModalMode;
  item?: Store | null;
  stores: Store[];
  onClose: () => void;
  onSave: (d: Omit<Store, 'id'>) => void;
}) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const scrollRef = useRef<ScrollView>(null);

  const [workBranch,      setWorkBranch]      = useState('');
  const [storeName,       setStoreName]       = useState('');
  const [entity,          setEntity]          = useState('');
  const [storeColor,      setStoreColor]      = useState('');
  const [description,     setDescription]     = useState('');
  const [storeCodeInput,  setStoreCodeInput]  = useState('');
  const [codeIsManual,    setCodeIsManual]    = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [showReset,       setShowReset]       = useState(false);

  const descRef     = useRef<TextInput>(null);
  const codeRef     = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;
    if (item) {
      setWorkBranch(item.workBranch);
      setStoreName(item.storeName);
      setEntity(item.entity);
      setStoreColor(item.storeColor);
      setDescription(item.description ?? '');
      setStoreCodeInput(item.storeCode);
      setCodeIsManual(true);
    } else {
      setWorkBranch(''); setStoreName(''); setEntity('');
      setStoreColor(''); setDescription('');
      setStoreCodeInput(''); setCodeIsManual(false);
    }
    setShowReset(false);
    setShowColorPicker(false);
  }, [visible, item]);

  useEffect(() => {
    if (!codeIsManual) {
      setStoreCodeInput(genStoreCode(workBranch, storeName, entity));
    }
  }, [workBranch, storeName, entity, codeIsManual]);

  function doReset() {
    setWorkBranch(''); setStoreName(''); setEntity('');
    setStoreColor(''); setDescription('');
    setStoreCodeInput(''); setCodeIsManual(false);
    setShowColorPicker(false);
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  const storeNo = String(stores.length + (isEdit ? 0 : 1)).padStart(2, '0');

  function handleSave() {
    if (!workBranch || !storeName.trim() || !entity) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({
        storeNo,
        storeCode: storeCodeInput.trim() || genStoreCode(workBranch, storeName, entity),
        workBranch,
        storeName: storeName.trim(),
        entity,
        storeColor: storeColor || '#595959',
        description: description.trim() || undefined,
      });
    }, 700);
  }

  const pct = calcStoreProgress(workBranch, storeName, entity, storeColor);

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={ms.overlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={ms.cardWrapper}>

            {/* Dark circle close */}
            <Pressable onPress={onClose} style={({ pressed }) => [ms.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={16}>
              <View style={ms.xL} /><View style={ms.xR} />
            </Pressable>

            {/* Blue reset pill */}
            {!isView && (
              <Pressable onPress={() => setShowReset(true)} style={({ pressed }) => [ms.resetBtn, pressed && { opacity: 0.75 }]} hitSlop={8}>
                <MaterialCommunityIcons name="refresh" size={13} color="#FFF" />
                <Text style={ms.resetTxt}>Reset Form</Text>
              </Pressable>
            )}

            <View style={ms.container}>

              {/* Header */}
              <View style={ms.header}>
                <View style={ms.headerIcon}>
                  <MaterialCommunityIcons name="store" size={18} color="#FFF" />
                </View>
                <View style={ms.headerTitle}>
                  <Text style={ms.titleTxt}>
                    {isEdit ? 'Update Store' : isView ? 'Store Details' : 'Create Stores'}
                  </Text>
                </View>
              </View>

              {/* Store no + name + auto code */}
              {!isView && (
                <View style={ms.storeInfo}>
                  <Text style={ms.storeNoTxt}>
                    You are creating store no: <Text style={ms.storeNoNum}>{storeNo}</Text>
                  </Text>
                  {storeName.trim() ? (
                    <Text style={ms.storeNameTxt} numberOfLines={1}>{storeName.trim()}</Text>
                  ) : (
                    <Text style={ms.storeNamePlaceholder}>Store name will appear here</Text>
                  )}
                  <Text style={ms.storeCodeTxt}>{storeCodeInput}</Text>
                </View>
              )}

              {!isView && <ProgressBar pct={pct} required={100} />}

              {/* View mode */}
              {isView && item && (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                  <ViewRow label="Store No"    value={item.storeNo} />
                  <ViewRow label="Store Code"  value={item.storeCode} />
                  <ViewRow label="Work Branch" value={item.workBranch} />
                  <ViewRow label="Store Name"  value={item.storeName} />
                  <ViewRow label="Entity"      value={item.entity} />
                  <ViewRow label="Store Color" value={item.storeColor} />
                  <ViewRow label="Description" value={item.description} />
                </ScrollView>
              )}

              {/* Create / Edit form */}
              {!isView && (
                <ScrollView ref={scrollRef} contentContainerStyle={ms.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                  <StoreDropdown
                    label="Work Branch" options={WORK_BRANCHES}
                    value={workBranch} onChange={setWorkBranch} required />

                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Store Name <Text style={fi.req}>*</Text></Text>
                    <TextInput
                      value={storeName} onChangeText={setStoreName}
                      placeholder="Enter store name" placeholderTextColor={Colors.placeholder}
                      autoCapitalize="words" returnKeyType="next"
                      onSubmitEditing={() => codeRef.current?.focus()} style={fi.input} />
                  </View>

                  <View style={fi.wrapper}>
                    <View style={fi.codeRow}>
                      <Text style={fi.label}>Store Code <Text style={fi.req}>*</Text></Text>
                      {codeIsManual && (
                        <Pressable onPress={() => setCodeIsManual(false)} hitSlop={8}>
                          <Text style={fi.codeSync}>↺ Auto</Text>
                        </Pressable>
                      )}
                    </View>
                    <TextInput
                      ref={codeRef}
                      value={storeCodeInput}
                      onChangeText={v => { setStoreCodeInput(v); setCodeIsManual(true); }}
                      placeholder="e.g. HO - MA - GP01" placeholderTextColor={Colors.placeholder}
                      autoCapitalize="characters" returnKeyType="next"
                      onSubmitEditing={() => descRef.current?.focus()} style={fi.input} />
                  </View>

                  <StoreDropdown
                    label="Entity (Company)" options={ENTITIES}
                    value={entity} onChange={setEntity} required />

                  {/* Color picker */}
                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Select Store Color <Text style={fi.req}>*</Text></Text>
                    <Pressable onPress={() => setShowColorPicker(o => !o)} style={cp.trigger}>
                      <View style={[cp.swatch, { backgroundColor: storeColor || '#E0E0E0' }]} />
                      <Text style={[cp.triggerTxt, !storeColor && cp.placeholderTxt]}>
                        {storeColor || 'Tap to select color'}
                      </Text>
                      <MaterialCommunityIcons name={showColorPicker ? 'chevron-up' : 'chevron-down'} size={16} color="#888" />
                    </Pressable>
                    {showColorPicker && (
                      <View style={cp.panel}>
                        <HsvColorPicker
                          initialColor={storeColor || '#E91E63'}
                          onSave={hex => { setStoreColor(hex); setShowColorPicker(false); }}
                        />
                      </View>
                    )}
                  </View>

                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Description</Text>
                    <TextInput
                      ref={descRef} value={description} onChangeText={setDescription}
                      placeholder="Optional description" placeholderTextColor={Colors.placeholder}
                      multiline numberOfLines={3} returnKeyType="done"
                      style={[fi.input, fi.multiline]} />
                  </View>

                  <View style={{ height: 24 }} />
                </ScrollView>
              )}

              {!isView && (
                <View style={ms.footer}>
                  <Pressable onPress={handleSave} disabled={saving} style={({ pressed }) => [ms.saveBtn, (pressed || saving) && { opacity: 0.85 }]}>
                    {saving
                      ? <ActivityIndicator color="#FFF" size="small" />
                      : <Text style={ms.saveTxt}>{isEdit ? 'Update Store' : 'Save'}</Text>}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

        <ResetConfirm visible={showReset} onCancel={() => setShowReset(false)} onConfirm={() => { setShowReset(false); doReset(); }} />
      </View>
    </Modal>
  );
}

// ── Store Item modal ──────────────────────────────────────────────────────────
function StoreItemModal({ visible, mode, item, onClose, onSave }: {
  visible: boolean;
  mode: ModalMode;
  item?: StoreItem | null;
  onClose: () => void;
  onSave: (d: Omit<StoreItem, 'id'>) => void;
}) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const scrollRef = useRef<ScrollView>(null);

  const [itemName, setItemName] = useState('');
  const [itemCode, setItemCode] = useState('');
  const [quantity, setQuantity] = useState('');
  const [store,    setStore]    = useState('');
  const [saving,   setSaving]   = useState(false);
  const [showReset, setShowReset] = useState(false);

  const codeRef  = useRef<TextInput>(null);
  const qtyRef   = useRef<TextInput>(null);
  const storeRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;
    if (item) {
      setItemName(item.itemName);
      setItemCode(item.itemCode);
      setQuantity(item.quantity ?? '');
      setStore(item.store ?? '');
    } else {
      setItemName(''); setItemCode(''); setQuantity(''); setStore('');
    }
    setShowReset(false);
  }, [visible, item]);

  function doReset() {
    setItemName(''); setItemCode(''); setQuantity(''); setStore('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function handleSave() {
    if (!itemName.trim() || !itemCode.trim()) return;
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({
        itemName: itemName.trim(),
        itemCode: itemCode.trim().toUpperCase(),
        quantity: quantity.trim() || undefined,
        store:    store.trim() || undefined,
      });
    }, 700);
  }

  const pct = calcItemProgress(itemName, itemCode);

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={ms.overlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={ms.cardWrapper}>

            <Pressable onPress={onClose} style={({ pressed }) => [ms.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={16}>
              <View style={ms.xL} /><View style={ms.xR} />
            </Pressable>

            {!isView && (
              <Pressable onPress={() => setShowReset(true)} style={({ pressed }) => [ms.resetBtn, pressed && { opacity: 0.75 }]} hitSlop={8}>
                <MaterialCommunityIcons name="refresh" size={13} color="#FFF" />
                <Text style={ms.resetTxt}>Reset Form</Text>
              </Pressable>
            )}

            <View style={ms.container}>
              <View style={ms.header}>
                <View style={ms.headerIcon}>
                  <MaterialCommunityIcons name="package-variant-closed" size={18} color="#FFF" />
                </View>
                <Text style={ms.titleTxt}>
                  {isEdit ? 'Update Store Item' : isView ? 'View Store Item' : 'Create Store Item'}
                </Text>
              </View>

              {!isView && <ProgressBar pct={pct} required={100} />}

              {isView && item && (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                  <ViewRow label="Item Name" value={item.itemName} />
                  <ViewRow label="Item Code" value={item.itemCode} />
                  <ViewRow label="Quantity"  value={item.quantity} />
                  <ViewRow label="Store"     value={item.store} />
                </ScrollView>
              )}

              {!isView && (
                <ScrollView ref={scrollRef} contentContainerStyle={ms.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Item Name <Text style={fi.req}>*</Text></Text>
                    <TextInput value={itemName} onChangeText={setItemName} placeholder="Enter item name"
                      placeholderTextColor={Colors.placeholder} autoCapitalize="words" returnKeyType="next"
                      onSubmitEditing={() => codeRef.current?.focus()} style={fi.input} />
                  </View>
                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Item Code <Text style={fi.req}>*</Text></Text>
                    <TextInput ref={codeRef} value={itemCode} onChangeText={v => setItemCode(v.toUpperCase())}
                      placeholder="e.g. ITM001" placeholderTextColor={Colors.placeholder}
                      autoCapitalize="characters" returnKeyType="next"
                      onSubmitEditing={() => qtyRef.current?.focus()} style={fi.input} />
                  </View>
                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Quantity</Text>
                    <TextInput ref={qtyRef} value={quantity} onChangeText={setQuantity}
                      placeholder="Enter quantity" placeholderTextColor={Colors.placeholder}
                      keyboardType="numeric" returnKeyType="next"
                      onSubmitEditing={() => storeRef.current?.focus()} style={fi.input} />
                  </View>
                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Store</Text>
                    <TextInput ref={storeRef} value={store} onChangeText={setStore}
                      placeholder="Assign to store" placeholderTextColor={Colors.placeholder}
                      returnKeyType="done" style={fi.input} />
                  </View>
                  <View style={{ height: 24 }} />
                </ScrollView>
              )}

              {!isView && (
                <View style={ms.footer}>
                  <Pressable onPress={handleSave} disabled={saving} style={({ pressed }) => [ms.saveBtn, (pressed || saving) && { opacity: 0.85 }]}>
                    {saving
                      ? <ActivityIndicator color="#FFF" size="small" />
                      : <Text style={ms.saveTxt}>{isEdit ? 'Update Store Item' : 'Create Store Item'}</Text>}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

        <ResetConfirm visible={showReset} onCancel={() => setShowReset(false)} onConfirm={() => { setShowReset(false); doReset(); }} />
      </View>
    </Modal>
  );
}

// ── Generic card ──────────────────────────────────────────────────────────────
// ── Health helpers ────────────────────────────────────────────────────────────
function calcCardHealth(code: string, title: string, subtitle?: string): number {
  const fields = [code, title, subtitle];
  const filled = fields.filter(f => !!f?.trim()).length;
  return Math.round((filled / fields.length) * 100);
}
function cardRingColor(pct: number): string {
  return pct < 25 ? '#E53935' : pct < 50 ? '#FB8C00' : pct < 75 ? '#FDD835' : '#30A84B';
}

// ── Store item health modal ────────────────────────────────────────────────────
function StoreItemHealthModal({ visible, code, title, subtitle, onClose }: {
  visible: boolean; code: string; title: string; subtitle?: string; onClose: () => void;
}) {
  const fields = [
    { label: 'Code',     value: code },
    { label: 'Name',     value: title },
    { label: 'Location', value: subtitle },
  ];
  const pct         = calcCardHealth(code, title, subtitle);
  const ringColor   = cardRingColor(pct);
  const isComplete  = pct === 100;
  const filledCount = fields.filter(f => !!f.value?.trim()).length;
  const totalCount  = fields.length;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={shm.overlay} onPress={onClose}>
        <Pressable style={shm.card} onPress={() => {}}>
          <View style={[shm.topBar, { backgroundColor: ringColor }]} />
          <View style={shm.header}>
            <View style={[shm.ring, { borderColor: ringColor }]}>
              <Text style={[shm.ringPct, { color: ringColor }]}>{pct}%</Text>
            </View>
            <View style={shm.headerText}>
              <Text style={shm.title}>Form Health</Text>
              <Text style={shm.sub}>{filledCount} of {totalCount} fields complete</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={18} color="#9090A0" />
            </Pressable>
          </View>
          {isComplete ? (
            <View style={shm.completeBanner}>
              <MaterialCommunityIcons name="check-decagram" size={15} color="#2E7D32" />
              <Text style={shm.completeText}>Complete — all required fields are filled</Text>
            </View>
          ) : (
            <View style={shm.warnBanner}>
              <MaterialCommunityIcons name="alert-outline" size={14} color="#E65100" />
              <Text style={shm.warnText}>{totalCount - filledCount} field(s) need attention</Text>
            </View>
          )}
          <ScrollView style={shm.list} showsVerticalScrollIndicator={false}>
            {fields.map(({ label, value }) => {
              const filled = !!value?.trim();
              return (
                <View key={label} style={shm.row}>
                  <MaterialCommunityIcons
                    name={filled ? 'check-circle' : 'alert-circle-outline'}
                    size={16} color={filled ? '#30A84B' : '#FB8C00'} />
                  <View style={shm.rowBody}>
                    <Text style={shm.rowLabel}>{label}</Text>
                    {filled
                      ? <Text style={shm.rowValue} numberOfLines={1}>{value}</Text>
                      : <Text style={shm.rowMissing}>Not filled</Text>}
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

function ItemCard({ code, title, subtitle, index, onView, onEdit, onDelete }: {
  code: string; title: string; subtitle?: string; index: number;
  onView: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const pct       = calcCardHealth(code, title, subtitle);
  const ringColor = cardRingColor(pct);
  const [showHealth, setShowHealth] = useState(false);
  return (
    <View style={[hc.card, isDarkMode && hc.cardDark]}>
      <View style={hc.accent} />
      <View style={hc.inner}>
        <View style={hc.header}>
          <Pressable onPress={() => setShowHealth(true)} style={hc.avatarWrap} hitSlop={6}>
            <View style={[hc.avatarRing, { borderColor: ringColor }]}>
              <View style={hc.avatar}>
                <Text style={[hc.avatarPct, { color: ringColor }]}>{pct}%</Text>
              </View>
            </View>
          </Pressable>
          <View style={hc.nameBlock}>
            <Text style={hc.code} numberOfLines={1}>{code}</Text>
            <Text style={[hc.name, { color: colors.primaryText }]} numberOfLines={1}>{title}</Text>
            {subtitle ? <Text style={[hc.sub, { color: colors.placeholder }]} numberOfLines={1}>{subtitle}</Text> : null}
          </View>
          <Text style={[hc.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>
        <View style={[hc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />
        <View style={[hc.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable onPress={onView}   style={({ pressed }) => [hc.btn, hc.btnView,   pressed && hc.btnPressed]} hitSlop={4}>
            <TableIcons.Eye /><Text style={hc.btnTxt}>View</Text>
          </Pressable>
          <Pressable onPress={onEdit}   style={({ pressed }) => [hc.btn, hc.btnEdit,   pressed && hc.btnPressed]} hitSlop={4}>
            <TableIcons.Edit /><Text style={hc.btnTxt}>Edit</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onDelete} style={({ pressed }) => [hc.btn, hc.btnDelete, pressed && hc.btnPressed]} hitSlop={4}>
            <TableIcons.Trash /><Text style={hc.btnDelTxt}>Delete</Text>
          </Pressable>
        </View>
      </View>
      <StoreItemHealthModal visible={showHealth} code={code} title={title} subtitle={subtitle} onClose={() => setShowHealth(false)} />
    </View>
  );
}

// ── Generic list view ─────────────────────────────────────────────────────────
function ListView<T extends { id: string }>({
  items, onAdd, onRefresh, searchKey, renderCard,
  emptyIcon, emptyLabel, emptyHint,
}: {
  items: T[];
  onAdd: () => void;
  onRefresh: () => void;
  searchKey: (item: T) => string;
  renderCard: (item: T, index: number) => React.ReactNode;
  emptyIcon: string;
  emptyLabel: string;
  emptyHint: string;
}) {
  const { colors, isDarkMode } = useTheme();
  const [search,     setSearch]     = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const dyn = {
    searchBar:   { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
    searchInput: { color: colors.primaryText },
  };

  function handleRefresh() {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  const filtered = items.filter(i => searchKey(i).toLowerCase().includes(search.toLowerCase()));

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={dv.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={DARK} />}>

        <View style={dv.searchFilterContainer}>
          <View style={dv.searchWrapper}>
            <View style={[dv.searchBar, dyn.searchBar]}>
              <MaterialCommunityIcons name="magnify" size={16} color="#8E8E93" />
              <TextInput
                value={search} onChangeText={setSearch}
                placeholder="Search…" placeholderTextColor="#8E8E93"
                style={[dv.searchInput, dyn.searchInput]}
                autoCapitalize="none" returnKeyType="search" />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} style={dv.clearBtn} hitSlop={8}>
                  <View style={[dv.clearX1, { backgroundColor: colors.placeholder }]} />
                  <View style={[dv.clearX2, { backgroundColor: colors.placeholder }]} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={onAdd} style={({ pressed }) => [dv.addBtn, pressed && dv.addBtnPressed]}>
              <View style={dv.addBtnIcon} />
              <View style={dv.addBtnIconV} />
            </Pressable>
          </View>
        </View>

        {filtered.length === 0 ? (
          <View style={hc.emptyWrap}>
            <View style={hc.emptyIcon}>
              <MaterialCommunityIcons name={emptyIcon as any} size={28} color="rgba(89,89,89,0.3)" />
            </View>
            <Text style={[hc.emptyTitle, { color: colors.primaryText }]}>
              {search.trim() ? 'No matches found' : emptyLabel}
            </Text>
            <Text style={[hc.emptySubText, { color: colors.placeholder }]}>
              {search.trim() ? `Nothing matched "${search}"` : emptyHint}
            </Text>
            {search.trim().length > 0 && (
              <Pressable onPress={() => setSearch('')} style={hc.clearBtn}>
                <Text style={hc.clearBtnTxt}>Clear search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={hc.list}>
            {filtered.map((item, idx) => renderCard(item, idx))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Delete confirm modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ visible, label, onCancel, onConfirm }: {
  visible: boolean; label: string; onCancel: () => void; onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={dc.overlay}>
        <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onCancel} />
        <View style={dc.card}>
          <View style={dc.topAccent} />
          <Pressable onPress={onCancel} style={({ pressed }) => [dc.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={8}>
            <MaterialCommunityIcons name="close" size={13} color="#999" />
          </Pressable>
          <View style={dc.iconRing}>
            <View style={dc.iconCircle}>
              <MaterialCommunityIcons name="delete-outline" size={20} color="#FFF" />
            </View>
          </View>
          <Text style={dc.title}>Delete Record?</Text>
          <Text style={dc.desc} numberOfLines={2}>"{label}" will be permanently removed.</Text>
          <View style={dc.divider} />
          <View style={dc.btnRow}>
            <Pressable onPress={onCancel} style={({ pressed }) => [dc.cancelBtn, pressed && { opacity: 0.7 }]}>
              <Text style={dc.cancelTxt}>Cancel</Text>
            </Pressable>
            <Pressable onPress={onConfirm} style={({ pressed }) => [dc.confirmBtn, pressed && { opacity: 0.85 }]}>
              <MaterialCommunityIcons name="delete" size={13} color="#FFF" />
              <Text style={dc.confirmTxt}>Delete</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export function ProcManageStoresScreen() {
  const { navigate } = useNavigation();
  const [tab,     setTab]     = useState<Tab>('dashboard');
  const [pageTab, setPageTab] = useState('store');

  // Store tab state — shared via context so ProcStoresScreen can read them
  const { stores, setStores } = useStores();
  const [storeModal,         setStoreModal]         = useState(false);
  const [storeMode,          setStoreMode]          = useState<ModalMode>('create');
  const [selectedStore,      setSelectedStore]      = useState<Store | null>(null);
  const [storeDeleteShow,    setStoreDeleteShow]    = useState(false);
  const [storeDeletePending, setStoreDeletePending] = useState<Store | null>(null);

  // Manage Stores Items tab state
  const [storeItems,         setStoreItems]         = useState<StoreItem[]>([]);
  const [itemModal,          setItemModal]          = useState(false);
  const [itemMode,           setItemMode]           = useState<ModalMode>('create');
  const [selectedItem,       setSelectedItem]       = useState<StoreItem | null>(null);
  const [itemDeleteShow,     setItemDeleteShow]     = useState(false);
  const [itemDeletePending,  setItemDeletePending]  = useState<StoreItem | null>(null);

  function handleQuickAccess(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  // Store tab handlers
  function openCreateStore()         { setSelectedStore(null); setStoreMode('create'); setStoreModal(true); }
  function openEditStore(s: Store)   { setSelectedStore(s);    setStoreMode('edit');   setStoreModal(true); }
  function openViewStore(s: Store)   { setSelectedStore(s);    setStoreMode('view');   setStoreModal(true); }
  function openDeleteStore(s: Store) { setStoreDeletePending(s); setStoreDeleteShow(true); }

  function handleSaveStore(data: Omit<Store, 'id'>) {
    if (storeMode === 'edit' && selectedStore) {
      setStores(p => p.map(s => s.id === selectedStore.id ? { ...s, ...data } : s));
    } else {
      setStores(p => [...p, { id: Date.now().toString(), ...data }]);
    }
    setStoreModal(false);
  }

  function doDeleteStore() {
    if (storeDeletePending) setStores(p => p.filter(s => s.id !== storeDeletePending.id));
    setStoreDeletePending(null);
  }

  // Manage Stores Items tab handlers
  function openCreateItem()            { setSelectedItem(null); setItemMode('create'); setItemModal(true); }
  function openEditItem(i: StoreItem)  { setSelectedItem(i);    setItemMode('edit');   setItemModal(true); }
  function openViewItem(i: StoreItem)  { setSelectedItem(i);    setItemMode('view');   setItemModal(true); }
  function openDeleteItem(i: StoreItem){ setItemDeletePending(i); setItemDeleteShow(true); }

  function handleSaveItem(data: Omit<StoreItem, 'id'>) {
    if (itemMode === 'edit' && selectedItem) {
      setStoreItems(p => p.map(i => i.id === selectedItem.id ? { ...i, ...data } : i));
    } else {
      setStoreItems(p => [...p, { id: Date.now().toString(), ...data }]);
    }
    setItemModal(false);
  }

  function doDeleteItem() {
    if (itemDeletePending) setStoreItems(p => p.filter(i => i.id !== itemDeletePending.id));
    setItemDeletePending(null);
  }

  const subTabLabel = pageTab === 'store' ? 'Create Store' : 'Create Store Item';

  return (
    <>
      <SubModuleLayout
        parentModuleId="4"
        title="Manage Stores"
        showBack={true}
        activeTab={tab}
        onTabChange={setTab}
        onModulePress={handleQuickAccess}
        showSubmodulesTab={false}
        showSubTab={true}
        subTabLabel={subTabLabel}
        selfManagesScroll={true}>

        <View style={styles.tabContainer}>
          <View style={styles.tabBarWrap}>
            <PageTabBar
              tabs={MS_TABS}
              active={pageTab}
              onChange={setPageTab}
              variant="segment"
            />
          </View>
          <View style={[styles.tabPanel, styles.tabPanelOffset]}>
            {pageTab === 'store' ? (
              <ListView
                items={stores}
                onAdd={openCreateStore}
                onRefresh={() => {}}
                searchKey={s => `${s.storeName} ${s.storeCode}`}
                renderCard={(s, idx) => (
                  <ItemCard key={s.id} code={s.storeCode || s.storeNo} title={s.storeName} subtitle={s.workBranch}
                    index={idx} onView={() => openViewStore(s)} onEdit={() => openEditStore(s)} onDelete={() => openDeleteStore(s)} />
                )}
                emptyIcon="store-outline"
                emptyLabel="No stores yet"
                emptyHint="Tap + to add the first store"
              />
            ) : (
              <ListView
                items={storeItems}
                onAdd={openCreateItem}
                onRefresh={() => {}}
                searchKey={i => `${i.itemName} ${i.itemCode}`}
                renderCard={(i, idx) => (
                  <ItemCard key={i.id} code={i.itemCode} title={i.itemName} subtitle={i.store}
                    index={idx} onView={() => openViewItem(i)} onEdit={() => openEditItem(i)} onDelete={() => openDeleteItem(i)} />
                )}
                emptyIcon="package-variant-closed"
                emptyLabel="No items yet"
                emptyHint="Tap + to add the first store item"
              />
            )}
          </View>
        </View>
      </SubModuleLayout>

      <StoreModal
        visible={storeModal} mode={storeMode} item={selectedStore}
        stores={stores}
        onClose={() => setStoreModal(false)}
        onSave={handleSaveStore} />

      <StoreItemModal
        visible={itemModal} mode={itemMode} item={selectedItem}
        onClose={() => setItemModal(false)} onSave={handleSaveItem} />

      <DeleteConfirmModal
        visible={storeDeleteShow}
        label={storeDeletePending?.storeName ?? 'this record'}
        onCancel={() => setStoreDeleteShow(false)}
        onConfirm={() => { setStoreDeleteShow(false); doDeleteStore(); }} />

      <DeleteConfirmModal
        visible={itemDeleteShow}
        label={itemDeletePending?.itemName ?? 'this record'}
        onCancel={() => setItemDeleteShow(false)}
        onConfirm={() => { setItemDeleteShow(false); doDeleteItem(); }} />
    </>
  );
}

// ── Screen styles ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  tabContainer:         { flex: 1, paddingTop: 8 },
  tabBarWrap:           { paddingHorizontal: Spacing.md },
  tabPanel:             { flex: 1 },
  tabPanelOffset:       { marginTop: 8 },
  contentScroll:        { flex: 1 },
  contentScrollContent: { flexGrow: 1, paddingBottom: 80 },
  dashboardContent:     { flex: 1 },
});

// ── Modal styles ──────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 100, paddingHorizontal: 12 },
  cardWrapper: { flex: 1, maxHeight: '92%', width: '100%' },
  closeBtn:    { position: 'absolute', top: -18, right: -5, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 8 },
  xL:          { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR:          { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  resetBtn:    { position: 'absolute', top: 24, right: 6, zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1976D2', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  resetTxt:    { fontFamily: FontFamily.medium, fontSize: 11, color: '#FFF' },
  container:   { flex: 1, backgroundColor: '#F5F5F7', borderRadius: 10, width: '100%', overflow: 'hidden' },
  header:      { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, gap: 8, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  headerIcon:  { width: 38, height: 38, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1 },
  titleTxt:    { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#1C1C1E', letterSpacing: 0.2 },
  storeInfo:   { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.lg, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  storeNoTxt:  { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#595959' },
  storeNoNum:  { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: '#1C1C1E' },
  storeNameTxt:        { fontFamily: FontFamily.bold, fontSize: 16, fontWeight: FontWeight.bold, color: '#1C1C1E', marginTop: 4 },
  storeNamePlaceholder:{ fontFamily: FontFamily.regular, fontSize: 13, color: '#B0B0B8', fontStyle: 'italic', marginTop: 4 },
  storeCodeTxt:{ fontFamily: FontFamily.bold, fontSize: 20, fontWeight: FontWeight.bold, color: '#1C1C1E', marginTop: 2, letterSpacing: 1 },
  form:        { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  footer:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E5EA' },
  saveBtn:     { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: DARK, borderRadius: 10, paddingVertical: 14 },
  saveTxt:     { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.5 },
});

// ── Progress bar styles ───────────────────────────────────────────────────────
const pb = StyleSheet.create({
  wrap:      { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  track:     { height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'visible', position: 'relative' },
  fill:      { height: 6, borderRadius: 3 },
  marker:    { position: 'absolute', top: -3, width: 2, height: 12, backgroundColor: '#595959', borderRadius: 1 },
  labels:    { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  labelLeft: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelMid:  { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelRight:{ fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelAvg:  { color: '#30A84B', fontFamily: FontFamily.bold, fontWeight: FontWeight.bold },
});

// ── Field styles ──────────────────────────────────────────────────────────────
const fi = StyleSheet.create({
  wrapper:  { marginBottom: Spacing.sm },
  label:    { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  req:      { color: Colors.primaryHighlight },
  input:    { fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText, paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0', paddingHorizontal: 0 },
  multiline:{ borderBottomWidth: 0, borderWidth: 1, borderColor: '#D0D0D0', borderRadius: 8, paddingHorizontal: 10, minHeight: 80, textAlignVertical: 'top' },
  codeRow:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 },
  codeSync: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.primaryHighlight },
});

// ── Store dropdown styles ─────────────────────────────────────────────────────
const sdd = StyleSheet.create({
  wrapper:          { marginBottom: Spacing.sm },
  row:              { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  trigger:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingRight: 4 },
  triggerTxt:       { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText },
  placeholder:      { color: Colors.placeholder },
  gpitBtn:          { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  gpitImg:          { width: 28, height: 28 },
  dropdown:         { maxHeight: 190, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E8', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5, marginTop: 4 },
  option:           { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#F0F0F5' },
  optionSelected:   { backgroundColor: 'rgba(233,30,99,0.04)' },
  optionTxt:        { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.primaryText, flex: 1 },
  optionSelectedTxt:{ color: Colors.primaryHighlight, fontFamily: FontFamily.bold, fontWeight: FontWeight.bold },
});

// ── Color picker trigger styles ───────────────────────────────────────────────
const cp = StyleSheet.create({
  trigger:       { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0' },
  swatch:        { width: 24, height: 24, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  triggerTxt:    { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText },
  placeholderTxt:{ color: Colors.placeholder },
  panel:         { marginTop: 10, backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, borderColor: '#E5E5EA', padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 },
});

// ── View-mode row styles ──────────────────────────────────────────────────────
const vw = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA' },
  label: { width: 110, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#888888' },
  value: { flex: 1, fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: '#1C1C1E' },
});

// ── List view styles ──────────────────────────────────────────────────────────
const dv = StyleSheet.create({
  scroll:               { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 100 },
  searchFilterContainer:{ paddingHorizontal: Spacing.md, paddingVertical: 6 },
  searchWrapper:        { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  searchBar:            { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, height: 40, borderRadius: 10, borderWidth: 1 },
  searchInput:          { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, paddingVertical: 0 },
  clearBtn:             { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  clearX1:              { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2:              { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  addBtn:               { width: 40, height: 40, borderRadius: 10, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  addBtnPressed:        { opacity: 0.8, transform: [{ scale: 0.95 }] },
  addBtnIcon:           { position: 'absolute', width: 14, height: 2, borderRadius: 1, backgroundColor: '#FFF' },
  addBtnIconV:          { position: 'absolute', width: 2, height: 14, borderRadius: 1, backgroundColor: '#FFF' },
});

// ── Card styles ───────────────────────────────────────────────────────────────
const hc = StyleSheet.create({
  list:        { paddingHorizontal: Spacing.md, paddingTop: 8, paddingBottom: 28, gap: 10 },
  card:        { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAF0', shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  cardDark:    { backgroundColor: '#1C1C1E', borderColor: '#2A2A2C' },
  accent:      { width: 4, backgroundColor: DARK },
  inner:       { flex: 1 },
  header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 12 },
  avatarWrap:  { alignItems: 'center', flexShrink: 0 },
  avatarRing:  { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  avatar:      { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  avatarPct:   { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },
  nameBlock:   { flex: 1, gap: 2 },
  code:        { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#E91E63', letterSpacing: 0.3 },
  name:        { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  sub:         { fontFamily: FontFamily.regular, fontSize: 12 },
  idx:         { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500', alignSelf: 'flex-start', marginTop: 2 },
  divider:     { height: 1 },
  actions:     { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  btn:         { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnView:     { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnEdit:     { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnDelete:   { backgroundColor: 'rgba(233,30,99,0.08)' },
  btnPressed:  { opacity: 0.7, transform: [{ scale: 0.97 }] },
  btnTxt:      { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#595959' },
  btnDelTxt:   { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#E91E63' },
  emptyWrap:   { alignItems: 'center', paddingVertical: 50, paddingHorizontal: Spacing.xl, gap: 8 },
  emptyIcon:   { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySubText:{ fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  clearBtn:    { marginTop: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryHighlight },
  clearBtnTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryHighlight },
});

// ── Reset confirm styles ──────────────────────────────────────────────────────
const rc = StyleSheet.create({
  overlay:   { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  card:      { width: '100%', backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 },
  topAccent: { height: 3, backgroundColor: '#1976D2' },
  iconRing:  { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle:{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#1976D2', alignItems: 'center', justifyContent: 'center' },
  title:     { textAlign: 'center', fontFamily: FontFamily.bold, fontSize: 14, fontWeight: FontWeight.bold, color: '#1C1C1E', marginBottom: 4 },
  desc:      { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 11, color: '#999', lineHeight: 16, paddingHorizontal: 12, marginBottom: 12 },
  divider:   { height: 1, backgroundColor: '#F0F0F4' },
  btnRow:    { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  cancelBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { fontFamily: FontFamily.medium, fontSize: 12, color: '#666' },
  confirmBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1976D2' },
  confirmTxt:{ fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF' },
  closeBtn:  { position: 'absolute', top: 8, right: 8, zIndex: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: '#F0F0F4', alignItems: 'center', justifyContent: 'center' },
});

// ── Delete confirm styles ─────────────────────────────────────────────────────
const dc = StyleSheet.create({
  overlay:   { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  card:      { width: '100%', backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 },
  topAccent: { height: 3, backgroundColor: '#E53935' },
  closeBtn:  { position: 'absolute', top: 8, right: 8, zIndex: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: '#F0F0F4', alignItems: 'center', justifyContent: 'center' },
  iconRing:  { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle:{ width: 38, height: 38, borderRadius: 19, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center' },
  title:     { textAlign: 'center', fontFamily: FontFamily.bold, fontSize: 14, fontWeight: FontWeight.bold, color: '#1C1C1E', marginBottom: 4 },
  desc:      { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 11, color: '#999', lineHeight: 16, paddingHorizontal: 12, marginBottom: 12 },
  divider:   { height: 1, backgroundColor: '#F0F0F4' },
  btnRow:    { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  cancelBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { fontFamily: FontFamily.medium, fontSize: 12, color: '#666' },
  confirmBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E53935' },
  confirmTxt:{ fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF' },
});

const shm = StyleSheet.create({
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
