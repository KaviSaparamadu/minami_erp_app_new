import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
import { useNavigation } from '../../context/NavigationContext';
import { useTheme } from '../../hooks/useTheme';
import type { AppModule } from '../../constants/modules';

type Tab      = 'dashboard' | 'modules';
type ModalMode = 'create' | 'edit' | 'view';

interface ReOrderStatus {
  id: string;
  statusName: string;
  abbreviation: string;
  description?: string;
}

const SS_TABS: PageTabItem[] = [
  { key: 're-order-status', label: 'Re Order Status', color: '#595959' },
];

const DARK = '#595959';

// ── Progress helpers ──────────────────────────────────────────────────────────
function calcProgress(name: string, abbr: string, desc: string): number {
  let pct = 0;
  if (name.trim()) pct += 34;
  if (abbr.trim()) pct += 33;
  if (desc.trim()) pct += 33;
  return pct;
}

function healthColor(pct: number): string {
  if (pct < 25) return '#E53935';
  if (pct < 50) return '#FB8C00';
  if (pct < 75) return '#FDD835';
  return '#30A84B';
}

// ── Progress bar (matches HumanFormModal exactly) ─────────────────────────────
function ProgressBar({ pct }: { pct: number }) {
  const required  = 67;
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

// ── Re Order Status modal ─────────────────────────────────────────────────────
function ReOrderStatusModal({ visible, mode, item, onClose, onSave }: {
  visible: boolean;
  mode: ModalMode;
  item?: ReOrderStatus | null;
  onClose: () => void;
  onSave: (d: Omit<ReOrderStatus, 'id'>) => void;
}) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const scrollRef = useRef<ScrollView>(null);

  const [statusName, setStatusName] = useState('');
  const [abbr,       setAbbr]       = useState('');
  const [desc,       setDesc]       = useState('');
  const [saving,     setSaving]     = useState(false);
  const [showReset,  setShowReset]  = useState(false);

  const abbrRef = useRef<TextInput>(null);
  const descRef = useRef<TextInput>(null);

  useEffect(() => {
    if (!visible) return;
    if (item) {
      setStatusName(item.statusName);
      setAbbr(item.abbreviation);
      setDesc(item.description ?? '');
    } else {
      setStatusName('');
      setAbbr('');
      setDesc('');
    }
    setShowReset(false);
  }, [visible, item]);

  function doReset() {
    setStatusName('');
    setAbbr('');
    setDesc('');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
  }

  function handleSave() {
    if (!statusName.trim()) { return; }
    if (!abbr.trim())       { return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({
        statusName:   statusName.trim(),
        abbreviation: abbr.trim().toUpperCase(),
        description:  desc.trim() || undefined,
      });
    }, 700);
  }

  const pct = calcProgress(statusName, abbr, desc);

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={ms.overlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={ms.cardWrapper}>

            {/* Close button — dark circle with X */}
            <Pressable onPress={onClose} style={({ pressed }) => [ms.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={16}>
              <View style={ms.xL} /><View style={ms.xR} />
            </Pressable>

            {/* Reset button — blue pill outside card */}
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
                  <MaterialCommunityIcons name="store" size={20} color="#FFF" />
                </View>
                <View style={ms.headerTitle}>
                  <Text style={ms.titleTxt}>
                    {isEdit ? 'Update Re Order Status' : isView ? 'View Re Order Status' : 'Create Re Order Status'}
                  </Text>
                </View>
              </View>

              {/* Progress bar */}
              {!isView && <ProgressBar pct={pct} />}

              {/* View mode — read-only rows */}
              {isView && item && (
                <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
                  <ViewRow label="Status Name"  value={item.statusName} />
                  <ViewRow label="Abbreviation" value={item.abbreviation} />
                  {item.description ? <ViewRow label="Description" value={item.description} /> : null}
                </ScrollView>
              )}

              {/* Form */}
              {!isView && (
                <ScrollView ref={scrollRef} contentContainerStyle={ms.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Re Order Status Name <Text style={fi.req}>*</Text></Text>
                    <TextInput
                      value={statusName}
                      onChangeText={setStatusName}
                      placeholder="Enter status name"
                      placeholderTextColor={Colors.placeholder}
                      autoCapitalize="words"
                      returnKeyType="next"
                      onSubmitEditing={() => abbrRef.current?.focus()}
                      style={fi.input}
                    />
                  </View>

                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Abbreviation (3 Letters) <Text style={fi.req}>*</Text></Text>
                    <TextInput
                      ref={abbrRef}
                      value={abbr}
                      onChangeText={v => setAbbr(v.toUpperCase().slice(0, 3))}
                      placeholder="e.g. ROS"
                      placeholderTextColor={Colors.placeholder}
                      autoCapitalize="characters"
                      maxLength={3}
                      returnKeyType="next"
                      onSubmitEditing={() => descRef.current?.focus()}
                      style={fi.input}
                    />
                  </View>

                  <View style={fi.wrapper}>
                    <Text style={fi.label}>Description</Text>
                    <TextInput
                      ref={descRef}
                      value={desc}
                      onChangeText={setDesc}
                      placeholder="Optional description"
                      placeholderTextColor={Colors.placeholder}
                      multiline
                      numberOfLines={3}
                      returnKeyType="done"
                      style={[fi.input, fi.multiline]}
                    />
                  </View>

                  <View style={{ height: 24 }} />
                </ScrollView>
              )}

              {/* Footer */}
              {!isView && (
                <View style={ms.footer}>
                  <Pressable onPress={handleSave} disabled={saving} style={({ pressed }) => [ms.saveBtn, (pressed || saving) && { opacity: 0.85 }]}>
                    {saving
                      ? <ActivityIndicator color="#FFF" size="small" />
                      : <Text style={ms.saveTxt}>{isEdit ? 'Update' : 'Create Re Order Status'}</Text>}
                  </Pressable>
                </View>
              )}

            </View>{/* container */}
          </View>{/* cardWrapper */}
        </KeyboardAvoidingView>

        {/* Reset confirm overlay */}
        {showReset && (
          <View style={rc.overlay}>
            <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setShowReset(false)} />
            <View style={rc.card}>
              <View style={rc.topAccent} />
              <Pressable onPress={() => setShowReset(false)} style={({ pressed }) => [rc.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={8}>
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
                <Pressable onPress={() => setShowReset(false)} style={({ pressed }) => [rc.cancelBtn, pressed && { opacity: 0.7 }]}>
                  <Text style={rc.cancelTxt}>Keep Editing</Text>
                </Pressable>
                <Pressable onPress={() => { setShowReset(false); doReset(); }} style={({ pressed }) => [rc.confirmBtn, pressed && { opacity: 0.85 }]}>
                  <MaterialCommunityIcons name="refresh" size={14} color="#FFF" />
                  <Text style={rc.confirmTxt}>Yes, Reset</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}

      </View>
    </Modal>
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

// ── Re Order Status card ──────────────────────────────────────────────────────
const AVATAR_COLORS = ['#595959', '#6B6B6B', '#7D7D7D', '#5A5A7A', '#606070', '#5C6060'];

function ReOrderStatusCard({ item, index, onView, onEdit, onDelete }: {
  item: ReOrderStatus;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <View style={[hc.card, isDarkMode && hc.cardDark]}>
      <View style={hc.accent} />
      <View style={hc.inner}>

        {/* Header */}
        <View style={hc.header}>
          <View style={[hc.avatar, { backgroundColor: avatarBg }]}>
            <Text style={hc.avatarTxt}>{item.abbreviation}</Text>
          </View>
          <View style={hc.nameBlock}>
            <Text style={[hc.name, { color: colors.primaryText }]} numberOfLines={1}>{item.statusName}</Text>
            {item.description ? (
              <Text style={[hc.sub, { color: colors.placeholder }]} numberOfLines={1}>{item.description}</Text>
            ) : null}
          </View>
          <Text style={[hc.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        {/* Divider */}
        <View style={[hc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* Actions */}
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
    </View>
  );
}

// ── List view ─────────────────────────────────────────────────────────────────
function ReOrderStatusListView({ items, onAdd, onEdit, onView, onDelete, onRefresh }: {
  items: ReOrderStatus[];
  onAdd: () => void;
  onEdit: (item: ReOrderStatus) => void;
  onView: (item: ReOrderStatus) => void;
  onDelete: (item: ReOrderStatus) => void;
  onRefresh: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const [search,     setSearch]     = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const dyn = {
    searchBar:   { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
    searchInput: { color: colors.primaryText },
    searchWrapper: { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' },
  };

  function handleRefresh() {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  const filtered = items.filter(i =>
    i.statusName.toLowerCase().includes(search.toLowerCase()) ||
    i.abbreviation.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={dv.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={DARK} />}>

        {/* Search + add */}
        <View style={dv.searchFilterContainer}>
          <View style={dv.searchAndFilterRow}>
            <View style={[dv.searchWrapper, dyn.searchWrapper]}>
              <View style={[dv.searchBar, dyn.searchBar]}>
                <MaterialCommunityIcons name="magnify" size={16} color="#8E8E93" />
                <TextInput
                  value={search}
                  onChangeText={setSearch}
                  placeholder="Search by name or abbreviation…"
                  placeholderTextColor="#8E8E93"
                  style={[dv.searchInput, dyn.searchInput]}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
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
        </View>

        {/* Empty state */}
        {filtered.length === 0 ? (
          <View style={hc.emptyWrap}>
            <View style={hc.emptyIcon}>
              <MaterialCommunityIcons name="store-outline" size={28} color="rgba(89,89,89,0.3)" />
            </View>
            <Text style={[hc.emptyTitle, { color: colors.primaryText }]}>
              {search.trim() ? 'No matches found' : 'No statuses yet'}
            </Text>
            <Text style={[hc.emptySubText, { color: colors.placeholder }]}>
              {search.trim() ? `Nothing matched "${search}"` : 'Tap + to add the first re-order status'}
            </Text>
            {search.trim().length > 0 && (
              <Pressable onPress={() => setSearch('')} style={hc.clearBtn}>
                <Text style={hc.clearBtnTxt}>Clear search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={hc.list}>
            {filtered.map((item, idx) => (
              <ReOrderStatusCard
                key={item.id}
                item={item}
                index={idx}
                onView={() => onView(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────
export function StoresSettingScreen() {
  const { navigate } = useNavigation();
  const [tab,     setTab]     = useState<Tab>('modules');
  const [pageTab, setPageTab] = useState('re-order-status');

  const [items,             setItems]            = useState<ReOrderStatus[]>([]);
  const [modalVisible,      setModalVisible]     = useState(false);
  const [modalMode,         setModalMode]        = useState<ModalMode>('create');
  const [selected,          setSelected]         = useState<ReOrderStatus | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete,     setPendingDelete]    = useState<ReOrderStatus | null>(null);

  function handleQuickAccess(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  function openCreate() { setSelected(null); setModalMode('create'); setModalVisible(true); }
  function openEdit(item: ReOrderStatus) { setSelected(item); setModalMode('edit'); setModalVisible(true); }
  function openView(item: ReOrderStatus) { setSelected(item); setModalMode('view'); setModalVisible(true); }
  function openDelete(item: ReOrderStatus) { setPendingDelete(item); setShowDeleteConfirm(true); }

  function handleSave(data: Omit<ReOrderStatus, 'id'>) {
    if (modalMode === 'edit' && selected) {
      setItems(prev => prev.map(i => i.id === selected.id ? { ...i, ...data } : i));
    } else {
      setItems(prev => [...prev, { id: Date.now().toString(), ...data }]);
    }
    setModalVisible(false);
  }

  function doDelete() {
    if (pendingDelete) setItems(prev => prev.filter(i => i.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  return (
    <>
      <SubModuleLayout
        parentModuleId="2"
        title="Stores Setting"
        showBack={true}
        activeTab={tab}
        onTabChange={setTab}
        onModulePress={handleQuickAccess}
        showSubmodulesTab={false}
        showSubTab={true}
        subTabLabel="Create Re Order Status"
        selfManagesScroll={true}>

        <View style={styles.tabContainer}>
          {tab !== 'dashboard' && (
            <View style={styles.tabBarWrap}>
              <PageTabBar
                tabs={SS_TABS}
                active={pageTab}
                onChange={t => { setPageTab(t); setTab('modules'); }}
                variant="segment"
              />
            </View>
          )}
          <View style={[styles.tabPanel, tab !== 'dashboard' && styles.tabPanelOffset]}>
            {tab === 'dashboard' ? (
              <ScrollView style={styles.contentScroll} contentContainerStyle={styles.contentScrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.dashboardContent} />
              </ScrollView>
            ) : (
              <ReOrderStatusListView
                items={items}
                onAdd={openCreate}
                onEdit={openEdit}
                onView={openView}
                onDelete={openDelete}
                onRefresh={() => {}}
              />
            )}
          </View>
        </View>
      </SubModuleLayout>

      <ReOrderStatusModal
        visible={modalVisible}
        mode={modalMode}
        item={selected}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />

      {/* Delete confirm — matches HumanManagementScreen */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade" onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={dc.overlay}>
          <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setShowDeleteConfirm(false)} />
          <View style={dc.card}>
            <View style={dc.topAccent} />
            <Pressable onPress={() => setShowDeleteConfirm(false)} style={({ pressed }) => [dc.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={13} color="#999" />
            </Pressable>
            <View style={dc.iconRing}>
              <View style={dc.iconCircle}>
                <MaterialCommunityIcons name="delete-outline" size={20} color="#FFF" />
              </View>
            </View>
            <Text style={dc.title}>Delete Status?</Text>
            <Text style={dc.desc} numberOfLines={2}>
              "{pendingDelete?.statusName ?? 'this record'}" will be permanently removed.
            </Text>
            <View style={dc.divider} />
            <View style={dc.btnRow}>
              <Pressable onPress={() => setShowDeleteConfirm(false)} style={({ pressed }) => [dc.cancelBtn, pressed && { opacity: 0.7 }]}>
                <Text style={dc.cancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable onPress={() => { setShowDeleteConfirm(false); doDelete(); }} style={({ pressed }) => [dc.confirmBtn, pressed && { opacity: 0.85 }]}>
                <MaterialCommunityIcons name="delete" size={13} color="#FFF" />
                <Text style={dc.confirmTxt}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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

// ── Modal styles (matches HumanFormModal) ─────────────────────────────────────
const ms = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 12,
  },
  cardWrapper: {
    flex: 1,
    maxHeight: '92%',
    width: '100%',
  },
  closeBtn: {
    position: 'absolute', top: -18, right: -5, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 8,
  },
  xL: { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR: { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  resetBtn: {
    position: 'absolute', top: 24, right: 6, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1976D2',
    borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
  },
  resetTxt: { fontFamily: FontFamily.medium, fontSize: 11, color: '#FFF' },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    width: '100%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.sm,
    gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
  },
  headerIcon: {
    width: 38, height: 38, borderRadius: 8,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center', justifyContent: 'center',
  },
  headerTitle: { flex: 1 },
  titleTxt: {
    fontFamily: FontFamily.bold, fontSize: FontSize.lg,
    fontWeight: FontWeight.bold, color: '#1C1C1E', letterSpacing: 0.2,
  },
  form: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1, borderTopColor: '#E5E5EA',
  },
  saveBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: DARK, borderRadius: 10, paddingVertical: 14,
  },
  saveTxt: {
    fontFamily: FontFamily.bold, fontSize: FontSize.md,
    fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.5,
  },
});

// ── Progress bar styles (matches HumanFormModal) ──────────────────────────────
const pb = StyleSheet.create({
  wrap: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  track: { height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'visible', position: 'relative' },
  fill: { height: 6, borderRadius: 3 },
  marker: { position: 'absolute', top: -3, width: 2, height: 12, backgroundColor: '#595959', borderRadius: 1 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  labelLeft:  { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelMid:   { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelRight: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelAvg:   { color: '#30A84B', fontFamily: FontFamily.bold, fontWeight: FontWeight.bold },
});

// ── Field styles (matches HumanFormModal fi) ──────────────────────────────────
const fi = StyleSheet.create({
  wrapper:   { marginBottom: Spacing.sm },
  label:     { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  req:       { color: Colors.primaryHighlight },
  input: {
    fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText,
    paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0', paddingHorizontal: 0,
  },
  multiline: { borderBottomWidth: 0, borderWidth: 1, borderColor: '#D0D0D0', borderRadius: 8, paddingHorizontal: 10, minHeight: 80, textAlignVertical: 'top' },
});

// ── View-mode row styles ──────────────────────────────────────────────────────
const vw = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#E5E5EA',
  },
  label: { width: 110, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#888888' },
  value: { flex: 1, fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: '#1C1C1E' },
});

// ── Reset confirm styles (matches HumanFormModal rc) ─────────────────────────
const rc = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44,
  },
  card: {
    width: '100%', backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
  },
  topAccent:  { height: 3, backgroundColor: '#1976D2' },
  iconRing:   { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1976D2', alignItems: 'center', justifyContent: 'center' },
  title:      { textAlign: 'center', fontFamily: FontFamily.bold, fontSize: 14, fontWeight: FontWeight.bold, color: '#1C1C1E', marginBottom: 4 },
  desc:       { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 11, color: '#999', lineHeight: 16, paddingHorizontal: 12, marginBottom: 12 },
  divider:    { height: 1, backgroundColor: '#F0F0F4' },
  btnRow:     { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  cancelBtn:  { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center' },
  cancelTxt:  { fontFamily: FontFamily.medium, fontSize: 12, color: '#666' },
  confirmBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1976D2' },
  confirmTxt: { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF' },
  closeBtn:   { position: 'absolute', top: 8, right: 8, zIndex: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: '#F0F0F4', alignItems: 'center', justifyContent: 'center' },
});

// ── List view styles (matches HumanManagementScreen dv) ──────────────────────
const dv = StyleSheet.create({
  scroll:               { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 100 },
  searchFilterContainer:{ paddingHorizontal: Spacing.md, paddingVertical: 6 },
  searchAndFilterRow:   { flexDirection: 'column', gap: 6 },
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

// ── Card styles (matches HumanManagementScreen hc) ────────────────────────────
const hc = StyleSheet.create({
  list:   { paddingHorizontal: Spacing.md, paddingTop: 8, paddingBottom: 28, gap: 10 },
  card:   { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAF0', shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  cardDark: { backgroundColor: '#1C1C1E', borderColor: '#2A2A2C' },
  accent: { width: 4, backgroundColor: DARK },
  inner:  { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarTxt: { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  nameBlock: { flex: 1, gap: 3 },
  name:  { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  sub:   { fontFamily: FontFamily.regular, fontSize: 12 },
  idx:   { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500', alignSelf: 'flex-start', marginTop: 2 },
  divider: { height: 1 },
  actions: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  btn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnView:    { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnEdit:    { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnDelete:  { backgroundColor: 'rgba(233,30,99,0.08)' },
  btnPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  btnTxt:    { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#595959' },
  btnDelTxt: { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#E91E63' },
  emptyWrap: { alignItems: 'center', paddingVertical: 50, paddingHorizontal: Spacing.xl, gap: 8 },
  emptyIcon: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySubText: { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  clearBtn:    { marginTop: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryHighlight },
  clearBtnTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryHighlight },
});

// ── Delete confirm styles (matches HumanManagementScreen dc) ─────────────────
const dc = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  card:    { width: '100%', backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 },
  topAccent:  { height: 3, backgroundColor: '#E53935' },
  closeBtn:   { position: 'absolute', top: 8, right: 8, zIndex: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: '#F0F0F4', alignItems: 'center', justifyContent: 'center' },
  iconRing:   { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center' },
  title:   { textAlign: 'center', fontFamily: FontFamily.bold, fontSize: 14, fontWeight: FontWeight.bold, color: '#1C1C1E', marginBottom: 4 },
  desc:    { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 11, color: '#999', lineHeight: 16, paddingHorizontal: 12, marginBottom: 12 },
  divider: { height: 1, backgroundColor: '#F0F0F4' },
  btnRow:    { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  cancelBtn: { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center' },
  cancelTxt: { fontFamily: FontFamily.medium, fontSize: 12, color: '#666' },
  confirmBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E53935' },
  confirmTxt: { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF' },
});
