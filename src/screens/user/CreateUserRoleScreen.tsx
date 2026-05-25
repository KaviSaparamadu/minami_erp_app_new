import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
import { DashboardView } from '../../components/dashboard/DashboardView';
import { UIIcon } from '../../components/common/UIIcon';
import { TableIcons } from '../../components/common/DataTable';
import { PageTabBar, PageTabItem } from '../../components/common/PageTabBar';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { UserRole } from '../../types/hr';

let nextId = 1;
const genId = () => String(nextId++);

type Tab = 'dashboard' | 'modules';
type ModalMode = 'create' | 'edit' | 'view';

const UR_TABS: PageTabItem[] = [
  { key: 'user-roles', label: 'User Roles', color: '#595959' },
];

// ─── Health helpers ───────────────────────────────────────────────────────────
const ROLE_HEALTH_FIELDS: Array<{ key: keyof UserRole; label: string }> = [
  { key: 'roleName',    label: 'Role Name' },
  { key: 'description', label: 'Description' },
];
function calcRoleHealth(r: UserRole): number {
  const filled = ROLE_HEALTH_FIELDS.filter(f => !!r[f.key]).length;
  return Math.round((filled / ROLE_HEALTH_FIELDS.length) * 100);
}
function roleRingColor(pct: number): string {
  return pct < 25 ? '#E53935' : pct < 50 ? '#FB8C00' : pct < 75 ? '#FDD835' : '#30A84B';
}

// ─── Role health modal ────────────────────────────────────────────────────────
function RoleHealthModal({ visible, role, onClose }: {
  visible: boolean; role: UserRole; onClose: () => void;
}) {
  const pct         = calcRoleHealth(role);
  const ringColor   = roleRingColor(pct);
  const isComplete  = pct === 100;
  const filledCount = ROLE_HEALTH_FIELDS.filter(f => !!role[f.key]).length;
  const totalCount  = ROLE_HEALTH_FIELDS.length;
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={rhm.overlay} onPress={onClose}>
        <Pressable style={rhm.card} onPress={() => {}}>
          <View style={[rhm.topBar, { backgroundColor: ringColor }]} />
          <View style={rhm.header}>
            <View style={[rhm.ring, { borderColor: ringColor }]}>
              <Text style={[rhm.ringPct, { color: ringColor }]}>{pct}%</Text>
            </View>
            <View style={rhm.headerText}>
              <Text style={rhm.title}>Form Health</Text>
              <Text style={rhm.sub}>{filledCount} of {totalCount} fields complete</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={18} color="#9090A0" />
            </Pressable>
          </View>
          {isComplete ? (
            <View style={rhm.completeBanner}>
              <MaterialCommunityIcons name="check-decagram" size={15} color="#2E7D32" />
              <Text style={rhm.completeText}>Complete — all required fields are filled</Text>
            </View>
          ) : (
            <View style={rhm.warnBanner}>
              <MaterialCommunityIcons name="alert-outline" size={14} color="#E65100" />
              <Text style={rhm.warnText}>{totalCount - filledCount} field(s) need attention</Text>
            </View>
          )}
          <ScrollView style={rhm.list} showsVerticalScrollIndicator={false}>
            {ROLE_HEALTH_FIELDS.map(({ key, label }) => {
              const filled = !!role[key];
              const val    = role[key];
              return (
                <View key={key} style={rhm.row}>
                  <MaterialCommunityIcons
                    name={filled ? 'check-circle' : 'alert-circle-outline'}
                    size={16} color={filled ? '#30A84B' : '#FB8C00'} />
                  <View style={rhm.rowBody}>
                    <Text style={rhm.rowLabel}>{label}</Text>
                    {filled
                      ? <Text style={rhm.rowValue} numberOfLines={2}>{String(val)}</Text>
                      : <Text style={rhm.rowMissing}>Not filled</Text>}
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

// ─── Role Form Modal ──────────────────────────────────────────────────────────
function RoleFormModal({ visible, mode, role, onClose, onSave }: {
  visible: boolean;
  mode: ModalMode;
  role?: UserRole | null;
  onClose: () => void;
  onSave: (d: Omit<UserRole, 'id'>) => void;
}) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const [roleName,    setRoleName]    = useState('');
  const [description, setDescription] = useState('');
  const [saving,      setSaving]      = useState(false);
  const [showReset,   setShowReset]   = useState(false);

  const scrollRef    = useRef<ScrollView>(null);
  const descRef      = useRef<TextInput>(null);
  const yPos         = useRef<Record<string, number>>({});

  function scrollTo(key: string) {
    const y = yPos.current[key];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
  }

  useEffect(() => {
    if (!visible) return;
    if (role) {
      setRoleName(role.roleName);
      setDescription(role.description ?? '');
    } else {
      setRoleName('');
      setDescription('');
    }
    setShowReset(false);
  }, [visible, role]);

  function doReset() {
    setRoleName('');
    setDescription('');
  }

  function handleSave() {
    if (!roleName.trim()) { Alert.alert('Required', 'Enter a role name.'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({ roleName: roleName.trim(), description: description.trim() || undefined, permissions: role?.permissions ?? [] });
    }, 700);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={ms.overlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={ms.cardWrapper}>
            {/* Floating close */}
            <Pressable onPress={onClose} style={({ pressed }) => [ms.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={16}>
              <View style={ms.xL} /><View style={ms.xR} />
            </Pressable>

            <View style={ms.container}>
              {/* Header */}
              <View style={ms.header}>
                <View style={ms.headerIcon}>
                  <MaterialCommunityIcons name="shield-account" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={ms.titleTxt}>
                    {isEdit ? 'Update User Role' : isView ? 'View User Role' : 'Create User Role'}
                  </Text>
                </View>
                {!isView && (
                  <View style={ms.headerActions}>
                    <Pressable onPress={() => setShowReset(true)} style={({ pressed }) => [ms.resetBtn, pressed && { opacity: 0.75 }]}>
                      <MaterialCommunityIcons name="refresh" size={13} color="#FFF" />
                      <Text style={ms.resetTxt}>Reset Form</Text>
                    </Pressable>
                  </View>
                )}
              </View>

              {/* Form */}
              <ScrollView ref={scrollRef} contentContainerStyle={ms.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                <View onLayout={e => { yPos.current['roleName'] = e.nativeEvent.layout.y; }}>
                  <Text style={ms.fieldLabel}><Text style={ms.req}>*</Text>User Role</Text>
                  <TextInput
                    value={roleName}
                    onChangeText={setRoleName}
                    placeholder="e.g. HR Manager"
                    placeholderTextColor={Colors.placeholder}
                    editable={!isView}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      descRef.current?.focus();
                      scrollTo('description');
                    }}
                    style={[ms.fieldInput, !isView && ms.fieldActive]}
                  />
                </View>

                <View onLayout={e => { yPos.current['description'] = e.nativeEvent.layout.y; }} style={{ marginTop: Spacing.lg }}>
                  <Text style={ms.fieldLabel}>description</Text>
                  <TextInput
                    ref={descRef}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What can this role do?"
                    placeholderTextColor={Colors.placeholder}
                    editable={!isView}
                    multiline
                    textAlignVertical="top"
                    style={[ms.descInput, !isView && ms.descActive]}
                  />
                </View>

                <View style={{ height: 24 }} />
              </ScrollView>

              {/* Footer */}
              {!isView && (
                <View style={ms.footer}>
                  <Pressable
                    onPress={handleSave}
                    disabled={saving}
                    style={({ pressed }) => [ms.saveBtn, (pressed || saving) && { opacity: 0.85 }]}>
                    {saving
                      ? <ActivityIndicator color="#FFF" size="small" />
                      : <Text style={ms.saveTxt}>{isEdit ? 'Update User Role' : 'Create User Role'}</Text>}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Reset confirm */}
        {showReset && (
          <View style={ms.rcOverlay}>
            <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setShowReset(false)} />
            <View style={ms.rcCard}>
              <View style={ms.rcAccent} />
              <Pressable onPress={() => setShowReset(false)} style={({ pressed }) => [ms.rcClose, pressed && { opacity: 0.6 }]} hitSlop={8}>
                <MaterialCommunityIcons name="close" size={13} color="#999" />
              </Pressable>
              <View style={ms.rcIconRing}>
                <View style={ms.rcIconCircle}>
                  <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
                </View>
              </View>
              <Text style={ms.rcTitle}>Reset Form?</Text>
              <Text style={ms.rcDesc}>All entered data will be cleared.{'\n'}This action cannot be undone.</Text>
              <View style={ms.rcDivider} />
              <View style={ms.rcBtnRow}>
                <Pressable onPress={() => setShowReset(false)} style={({ pressed }) => [ms.rcCancel, pressed && { opacity: 0.7 }]}>
                  <Text style={ms.rcCancelTxt}>Keep Editing</Text>
                </Pressable>
                <Pressable onPress={() => { setShowReset(false); doReset(); }} style={({ pressed }) => [ms.rcConfirm, pressed && { opacity: 0.85 }]}>
                  <MaterialCommunityIcons name="refresh" size={14} color="#FFF" />
                  <Text style={ms.rcConfirmTxt}>Yes, Reset</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Role card ────────────────────────────────────────────────────────────────
function RoleCard({
  role,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  role: UserRole;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const pct       = calcRoleHealth(role);
  const ringColor = roleRingColor(pct);
  const [showHealth, setShowHealth] = useState(false);

  return (
    <View style={[rc.card, isDarkMode && rc.cardDark]}>
      <View style={[rc.accent, { backgroundColor: Colors.primaryHighlight }]} />
      <View style={rc.inner}>
        {/* Header */}
        <View style={rc.header}>
          <Pressable onPress={() => setShowHealth(true)} style={rc.avatarWrap} hitSlop={6}>
            <View style={[rc.avatarRing, { borderColor: ringColor }]}>
              <View style={rc.avatar}>
                <Text style={[rc.avatarPct, { color: ringColor }]}>{pct}%</Text>
              </View>
            </View>
          </Pressable>
          <View style={rc.nameBlock}>
            <Text style={[rc.name, { color: colors.primaryText }]} numberOfLines={1}>
              {role.roleName}
            </Text>
            {role.description ? (
              <Text style={[rc.desc, { color: colors.placeholder }]} numberOfLines={1}>
                {role.description}
              </Text>
            ) : null}
          </View>
          <View style={rc.permBadge}>
            <Text style={rc.permCount}>{role.permissions.length}</Text>
            <Text style={[rc.permLabel, { color: colors.placeholder }]}>perms</Text>
          </View>
          <Text style={[rc.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        <View style={[rc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* Actions */}
        <View style={[rc.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable onPress={onView}   style={({ pressed }) => [rc.btn, rc.btnView,   pressed && rc.btnPressed]} hitSlop={4}>
            <TableIcons.Eye />
            <Text style={rc.btnTxt}>View</Text>
          </Pressable>
          <Pressable onPress={onEdit}   style={({ pressed }) => [rc.btn, rc.btnEdit,   pressed && rc.btnPressed]} hitSlop={4}>
            <TableIcons.Edit />
            <Text style={rc.btnTxt}>Edit</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onDelete} style={({ pressed }) => [rc.btn, rc.btnDelete, pressed && rc.btnPressed]} hitSlop={4}>
            <TableIcons.Trash />
            <Text style={rc.btnDelTxt}>Delete</Text>
          </Pressable>
        </View>
      </View>
      <RoleHealthModal visible={showHealth} role={role} onClose={() => setShowHealth(false)} />
    </View>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────
function RolesListView({
  searchQuery,
  setSearchQuery,
  onOpenCreate,
  onView,
  onEdit,
  onDelete,
  filteredRoles,
  loading,
  onRefresh,
}: {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCreate: () => void;
  onView: (r: UserRole) => void;
  onEdit: (r: UserRole) => void;
  onDelete: (r: UserRole) => void;
  filteredRoles: UserRole[];
  loading: boolean;
  onRefresh: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const dyn = { searchBar: { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFF', borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' }, searchInput: { color: colors.primaryText } };

  function handleRefresh() {
    setRefreshing(true);
    onRefresh();
    setTimeout(() => setRefreshing(false), 800);
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={lv.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#595959" />}>

        <View style={lv.sectionHeader}>
          <Text style={[lv.sectionTitle, { color: colors.primaryText }]}>Role Definitions</Text>
        </View>

        <View style={lv.searchFilterContainer}>
          <View style={[lv.searchWrapper]}>
            <View style={[lv.searchBar, dyn.searchBar]}>
              <UIIcon name="search" size={16} color="#8E8E93" />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search roles…"
                placeholderTextColor="#8E8E93"
                style={[lv.searchInput, dyn.searchInput]}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={lv.clearBtn} hitSlop={8}>
                  <View style={[lv.clearX1, { backgroundColor: colors.placeholder }]} />
                  <View style={[lv.clearX2, { backgroundColor: colors.placeholder }]} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={onOpenCreate} style={({ pressed }) => [lv.addBtn, pressed && lv.addBtnPressed]}>
              <View style={lv.addBtnIcon} /><View style={lv.addBtnIconV} />
            </Pressable>
          </View>
        </View>

        {loading ? (
          <View style={rc.emptyWrap}>
            <ActivityIndicator size="large" color={Colors.primaryHighlight} />
          </View>
        ) : filteredRoles.length === 0 ? (
          <View style={rc.emptyWrap}>
            <View style={rc.emptyIcon}>
              <View style={rc.emptyBadge} /><View style={rc.emptyLine1} /><View style={rc.emptyLine2} />
            </View>
            <Text style={[rc.emptyTitle, { color: colors.primaryText }]}>
              {searchQuery.trim() ? 'No matches found' : 'No roles defined yet'}
            </Text>
            <Text style={[rc.emptySubText, { color: colors.placeholder }]}>
              {searchQuery.trim() ? `Nothing matched "${searchQuery}"` : 'Tap + to create the first role'}
            </Text>
            {searchQuery.trim().length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={rc.clearBtn}>
                <Text style={rc.clearBtnTxt}>Clear search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={rc.list}>
            {filteredRoles.map((role, idx) => (
              <RoleCard
                key={role.id}
                role={role}
                index={idx}
                onView={() => onView(role)}
                onEdit={() => onEdit(role)}
                onDelete={() => onDelete(role)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function CreateUserRoleScreen() {
  const { navigate } = useNavigation();

  const [tab,          setTab]          = useState<Tab>('modules');
  const [pageTab,      setPageTab]      = useState<string>('user-roles');
  const [roles,        setRoles]        = useState<UserRole[]>([]);
  const [loading]                       = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState<ModalMode>('create');
  const [selected,     setSelected]     = useState<UserRole | null>(null);
  const [refreshing,        setRefreshing]        = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete,     setPendingDelete]     = useState<UserRole | null>(null);

  const q = searchQuery.trim().toLowerCase();
  const filteredRoles = q === ''
    ? roles
    : roles.filter(r =>
        r.roleName.toLowerCase().includes(q) ||
        (r.description ?? '').toLowerCase().includes(q),
      );

  function openCreate() { setSelected(null); setModalMode('create'); setModalVisible(true); }
  function openEdit(r: UserRole)  { setSelected(r); setModalMode('edit');   setModalVisible(true); }
  function openView(r: UserRole)  { setSelected(r); setModalMode('view');   setModalVisible(true); }

  function handleDelete(r: UserRole) {
    setPendingDelete(r);
    setShowDeleteConfirm(true);
  }

  function doDelete() {
    if (pendingDelete) setRoles(p => p.filter(x => x.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  function handleSave(data: Omit<UserRole, 'id'>) {
    if (modalMode === 'create') setRoles(p => [...p, { ...data, id: genId() }]);
    else setRoles(p => p.map(x => x.id === selected?.id ? { ...data, id: x.id } : x));
    setModalVisible(false);
  }

  function handleQuickAccess(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }

  return (
    <>
      <SubModuleLayout
        parentModuleId="1"
        title="User Roles"
        showBack={true}
        activeTab={tab}
        onTabChange={setTab}
        onModulePress={handleQuickAccess}
        showSubmodulesTab={false}
        showSubTab={true}
        subTabLabel="Create Role"
        selfManagesScroll={true}
      >
        <View style={styles.tabContainer}>
          {tab !== 'dashboard' && (
            <View style={styles.tabBarWrap}>
              <PageTabBar
                tabs={UR_TABS}
                active={pageTab}
                onChange={(t) => { setPageTab(t); setTab('modules'); }}
                variant="segment"
              />
            </View>
          )}
          <View style={[styles.tabPanel, tab !== 'dashboard' && styles.tabPanelOffset]}>
            {tab === 'dashboard' ? (
              <ScrollView
                style={styles.contentScroll}
                contentContainerStyle={styles.contentScrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#595959" />}>
                <View style={styles.dashboardContent}><DashboardView /></View>
              </ScrollView>
            ) : (
              <RolesListView
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenCreate={openCreate}
                onView={openView}
                onEdit={openEdit}
                onDelete={handleDelete}
                filteredRoles={filteredRoles}
                loading={loading}
                onRefresh={handleRefresh}
              />
            )}
          </View>
        </View>
      </SubModuleLayout>

      <RoleFormModal
        visible={modalVisible}
        mode={modalMode}
        role={selected}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />

      {/* Delete confirm */}
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
            <Text style={dc.title}>Delete Role?</Text>
            <Text style={dc.desc} numberOfLines={2}>
              "{pendingDelete?.roleName ?? 'this role'}" will be permanently removed.
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

// ─── Layout styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  dashboardContent:     { flex: 1 },
  contentScroll:        { flex: 1 },
  contentScrollContent: { flexGrow: 1 },
  tabContainer:         { flex: 1, paddingTop: 8 },
  tabBarWrap:           { paddingHorizontal: Spacing.md },
  tabPanel:             { flex: 1 },
  tabPanelOffset:       { marginTop: 8 },
});

// ─── List view styles ─────────────────────────────────────────────────────────
const lv = StyleSheet.create({
  scroll:              { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 100 },
  sectionHeader:       { paddingHorizontal: Spacing.md, paddingTop: 0, paddingBottom: 2 },
  sectionTitle:        { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700' },
  searchFilterContainer: { paddingHorizontal: Spacing.md, paddingVertical: 6 },
  searchWrapper:       { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  searchBar:           { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 40, borderRadius: 10, borderWidth: 1 },
  searchInput:         { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, paddingVertical: 0 },
  clearBtn:            { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  clearX1:             { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2:             { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  addBtn:              { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E91E63', alignItems: 'center', justifyContent: 'center' },
  addBtnPressed:       { opacity: 0.8, transform: [{ scale: 0.95 }] },
  addBtnIcon:          { position: 'absolute', width: 14, height: 2, borderRadius: 1, backgroundColor: '#FFF' },
  addBtnIconV:         { position: 'absolute', width: 2, height: 14, borderRadius: 1, backgroundColor: '#FFF' },
});

// ─── Role card styles ─────────────────────────────────────────────────────────
const rc = StyleSheet.create({
  list: { paddingHorizontal: Spacing.md, paddingTop: 8, paddingBottom: 28, gap: 10 },

  card: {
    flexDirection: 'row', backgroundColor: '#FFFFFF',
    borderRadius: 16, borderWidth: 1, borderColor: '#EAEAF0',
    shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, overflow: 'hidden',
  },
  cardDark: { backgroundColor: '#1C1C1E', borderColor: '#2A2A2C' },
  accent:   { width: 4 },
  inner:    { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 10,
  },
  avatarWrap: { alignItems: 'center', flexShrink: 0 },
  avatarRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFFFFF' },
  avatarPct:  { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },
  nameBlock: { flex: 1, gap: 3 },
  name:      { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  desc:      { fontFamily: FontFamily.regular, fontSize: 11 },
  permBadge: { alignItems: 'center', gap: 1 },
  permCount: { fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', color: '#5E35B1' },
  permLabel: { fontFamily: FontFamily.regular, fontSize: 9 },
  idx:       { fontFamily: FontFamily.regular, fontSize: 11, alignSelf: 'flex-start', marginTop: 2 },

  divider: { height: 1 },

  actions:    { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  btn:        { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnView:    { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnEdit:    { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnDelete:  { backgroundColor: 'rgba(233,30,99,0.08)' },
  btnPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  btnTxt:     { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#595959' },
  btnDelTxt:  { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#E91E63' },

  emptyWrap:    { alignItems: 'center', paddingVertical: 50, paddingHorizontal: Spacing.xl, gap: 8 },
  emptyIcon:    { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(94,53,177,0.10)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyBadge:   { position: 'absolute', width: 24, height: 30, borderRadius: 5, backgroundColor: 'rgba(94,53,177,0.3)' },
  emptyLine1:   { position: 'absolute', top: 22, width: 14, height: 2.5, borderRadius: 1.5, backgroundColor: '#5E35B1' },
  emptyLine2:   { position: 'absolute', top: 28, width: 10, height: 2.5, borderRadius: 1.5, backgroundColor: '#5E35B1', opacity: 0.5 },
  emptyTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySubText: { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  clearBtn:     { marginTop: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryHighlight },
  clearBtnTxt:  { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryHighlight },
});

// ─── Modal styles ─────────────────────────────────────────────────────────────
const ms = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start', paddingTop: 80, paddingHorizontal: 12,
  },
  cardWrapper: { flex: 1, maxHeight: '85%', width: '100%' },
  container:   { flex: 1, backgroundColor: '#F5F5F7', borderRadius: 10, overflow: 'hidden' },

  closeBtn: {
    position: 'absolute', top: -18, right: -5, zIndex: 10,
    width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 8,
  },
  xL: { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR: { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  header: {
    flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap',
    backgroundColor: '#FFF', paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, gap: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
  },
  headerIcon: {
    width: 38, height: 38, borderRadius: 8,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center', justifyContent: 'center',
  },
  titleTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#1C1C1E' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resetBtn:  {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1976D2', borderRadius: 16, paddingHorizontal: 10, paddingVertical: 5,
  },
  resetTxt:  { fontFamily: FontFamily.medium, fontSize: 11, color: '#FFF' },

  form: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

  fieldLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 6 },
  req:        { color: Colors.primaryHighlight },
  fieldInput: {
    fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText,
    paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#EAEAEA', paddingHorizontal: 0,
  },
  fieldActive: { borderBottomColor: '#D0D0D0' },
  descInput: {
    fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText,
    borderWidth: 1.5, borderColor: '#D0D0D0', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, minHeight: 80,
  },
  descActive: { borderColor: '#BDBDBD' },

  footer: {
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E5EA',
  },
  saveBtn: {
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#595959', borderRadius: 10, paddingVertical: 14,
  },
  saveTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.5 },

  // Reset confirm
  rcOverlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44,
  },
  rcCard:    { width: '100%', backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', elevation: 10 },
  rcAccent:  { height: 3, backgroundColor: '#1976D2' },
  rcClose:   { position: 'absolute', top: 8, right: 8, zIndex: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: '#F0F0F4', alignItems: 'center', justifyContent: 'center' },
  rcIconRing: { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  rcIconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1976D2', alignItems: 'center', justifyContent: 'center' },
  rcTitle:   { textAlign: 'center', fontFamily: FontFamily.bold, fontSize: 14, fontWeight: FontWeight.bold, color: '#1C1C1E', marginBottom: 4 },
  rcDesc:    { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 11, color: '#999', lineHeight: 16, paddingHorizontal: 12, marginBottom: 12 },
  rcDivider: { height: 1, backgroundColor: '#F0F0F4' },
  rcBtnRow:  { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  rcCancel:  { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center' },
  rcCancelTxt: { fontFamily: FontFamily.medium, fontSize: 12, color: '#666' },
  rcConfirm: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: '#1976D2' },
  rcConfirmTxt: { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF' },
});

// ─── Delete confirm styles ────────────────────────────────────────────────────
const dc = StyleSheet.create({
  overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  card:     { width: '100%', backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', elevation: 10 },
  topAccent:{ height: 3, backgroundColor: '#E53935' },
  closeBtn: { position: 'absolute', top: 8, right: 8, zIndex: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: '#F0F0F4', alignItems: 'center', justifyContent: 'center' },
  iconRing: { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center' },
  title:    { textAlign: 'center', fontFamily: FontFamily.bold, fontSize: 14, fontWeight: FontWeight.bold, color: '#1C1C1E', marginBottom: 4 },
  desc:     { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 11, color: '#999', lineHeight: 16, paddingHorizontal: 12, marginBottom: 12 },
  divider:  { height: 1, backgroundColor: '#F0F0F4' },
  btnRow:   { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  cancelBtn:{ flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center' },
  cancelTxt:{ fontFamily: FontFamily.medium, fontSize: 12, color: '#666' },
  confirmBtn:{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E53935' },
  confirmTxt:{ fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF' },
});

const rhm = StyleSheet.create({
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
