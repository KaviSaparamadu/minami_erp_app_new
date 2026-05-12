import React, { useState, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Modal,
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
import { SystemUserFormModal, SystemUserModalMode } from '../../components/hr/SystemUserFormModal';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { SystemUser, UserStatus } from '../../types/hr';

let nextId = 1;
const genId = () => String(nextId++);

type Tab = 'dashboard' | 'modules';
type Filter = 'All' | 'Active' | 'Inactive';

const SU_TABS: PageTabItem[] = [
  { key: 'system-users', label: 'System Users', color: '#595959' },
];
const FILTERS: Filter[] = ['All', 'Active', 'Inactive'];

const AVATAR_COLORS = ['#5E35B1', '#1565C0', '#00796B', '#AD1457', '#E65100', '#2E7D32'];
const STATUS_COLORS: Record<UserStatus, string> = { Active: '#30A84B', Inactive: '#E53935' };
const STATUS_BG: Record<UserStatus, string> = {
  Active: 'rgba(48,168,75,0.12)',
  Inactive: 'rgba(229,57,53,0.10)',
};

// ─── Info chip ────────────────────────────────────────────────────────────────
function InfoChip({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={uc.chip}>
      <Text style={uc.chipLabel}>{label}</Text>
      <Text style={[uc.chipValue, { color: colors.primaryText }]} numberOfLines={1}>{value}</Text>
    </View>
  );
}

// ─── User card ────────────────────────────────────────────────────────────────
function UserCard({
  user,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  user: SystemUser;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const initial = (user.fullName || '?').charAt(0).toUpperCase();
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];

  return (
    <View style={[uc.card, isDarkMode && uc.cardDark]}>
      <View style={[uc.accent, { backgroundColor: '#5E35B1' }]} />
      <View style={uc.inner}>
        {/* Header */}
        <View style={uc.header}>
          <View style={[uc.avatar, { backgroundColor: avatarBg }]}>
            <Text style={uc.avatarTxt}>{initial}</Text>
          </View>
          <View style={uc.nameBlock}>
            <Text style={[uc.name, { color: colors.primaryText }]} numberOfLines={1}>
              {user.fullName || '—'}
            </Text>
            <Text style={[uc.uname, { color: colors.placeholder }]} numberOfLines={1}>
              @{user.username}
            </Text>
          </View>
          <View style={[uc.statusBadge, { backgroundColor: STATUS_BG[user.status] }]}>
            <View style={[uc.statusDot, { backgroundColor: STATUS_COLORS[user.status] }]} />
            <Text style={[uc.statusTxt, { color: STATUS_COLORS[user.status] }]}>{user.status}</Text>
          </View>
          <Text style={[uc.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        <View style={[uc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* Meta chips */}
        <View style={uc.chips}>
          <InfoChip label="Email"  value={user.email ?? '—'} />
          <View style={[uc.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <InfoChip label="Role"   value={user.roleName ?? '—'} />
        </View>

        {/* Actions */}
        <View style={[uc.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable onPress={onView}   style={({ pressed }) => [uc.btn, uc.btnView,   pressed && uc.btnPressed]} hitSlop={4}>
            <TableIcons.Eye />
            <Text style={uc.btnTxt}>View</Text>
          </Pressable>
          <Pressable onPress={onEdit}   style={({ pressed }) => [uc.btn, uc.btnEdit,   pressed && uc.btnPressed]} hitSlop={4}>
            <TableIcons.Edit />
            <Text style={uc.btnTxt}>Edit</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onDelete} style={({ pressed }) => [uc.btn, uc.btnDelete, pressed && uc.btnPressed]} hitSlop={4}>
            <TableIcons.Trash />
            <Text style={uc.btnDelTxt}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── List view ────────────────────────────────────────────────────────────────
function SystemUsersListView({
  counts,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  onOpenCreate,
  onView,
  onEdit,
  onDelete,
  filteredUsers,
  loading,
  onRefresh,
}: {
  counts: Record<Filter, number>;
  filter: Filter;
  setFilter: (f: Filter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCreate: () => void;
  onView: (u: SystemUser) => void;
  onEdit: (u: SystemUser) => void;
  onDelete: (u: SystemUser) => void;
  filteredUsers: SystemUser[];
  loading: boolean;
  onRefresh: () => Promise<void> | void;
}) {
  const { colors, isDarkMode } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={lv.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#595959" />
        }>

        <View style={lv.sectionHeader}>
          <Text style={[lv.sectionTitle, { color: colors.primaryText }]}>System User Accounts</Text>
        </View>

        <View style={lv.searchFilterContainer}>
          <View style={lv.searchAndFilterRow}>
            <View style={[lv.searchWrapper, dyn.searchWrapper]}>
              <View style={[lv.searchBar, dyn.searchBar]}>
                <UIIcon name="search" size={16} color="#8E8E93" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name, email, role…"
                  placeholderTextColor="#8E8E93"
                  style={[lv.searchInput, dyn.searchInput]}
                  autoCapitalize="none"
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} style={lv.clearBtn} hitSlop={8}>
                    <View style={[lv.clearX1, { backgroundColor: colors.placeholder }]} />
                    <View style={[lv.clearX2, { backgroundColor: colors.placeholder }]} />
                  </Pressable>
                )}
              </View>
              <Pressable
                onPress={onOpenCreate}
                style={({ pressed }) => [lv.addBtn, pressed && lv.addBtnPressed]}
                accessibilityRole="button">
                <View style={lv.addBtnIcon} />
                <View style={lv.addBtnIconV} />
              </Pressable>
            </View>

            <View style={lv.pillRow}>
              {FILTERS.map(f => {
                const active = filter === f;
                return (
                  <Pressable key={f} onPress={() => setFilter(f)} style={[lv.pill, active && lv.pillActive]}>
                    <Text style={[lv.pillTxt, dyn.pillTxt, active && lv.pillTxtActive]}>{f}</Text>
                    <View style={[lv.pillBadge, active && lv.pillBadgeActive]}>
                      <Text style={[lv.pillBadgeTxt, active && lv.pillBadgeTxtActive]}>{counts[f]}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {loading ? (
          <View style={uc.emptyWrap}>
            <ActivityIndicator size="large" color={Colors.primaryHighlight} />
            <Text style={[uc.emptySubText, { color: colors.placeholder, marginTop: 12 }]}>
              Loading records…
            </Text>
          </View>
        ) : filteredUsers.length === 0 ? (
          <View style={uc.emptyWrap}>
            <View style={uc.emptyIcon}>
              <View style={uc.emptyHead} />
              <View style={uc.emptyBody} />
            </View>
            <Text style={[uc.emptyTitle, { color: colors.primaryText }]}>
              {searchQuery.trim() ? 'No matches found'
                : filter === 'All' ? 'No system users yet' : `No ${filter} users`}
            </Text>
            <Text style={[uc.emptySubText, { color: colors.placeholder }]}>
              {searchQuery.trim()
                ? `Nothing matched "${searchQuery}"`
                : 'Tap + to add the first account'}
            </Text>
            {searchQuery.trim().length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={uc.clearBtn}>
                <Text style={uc.clearBtnTxt}>Clear search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={uc.list}>
            {filteredUsers.map((u, idx) => (
              <UserCard
                key={u.id}
                user={u}
                index={idx}
                onView={() => onView(u)}
                onEdit={() => onEdit(u)}
                onDelete={() => onDelete(u)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function CreateSystemUsersScreen() {
  const { navigate } = useNavigation();

  const [tab,          setTab]          = useState<Tab>('modules');
  const [pageTab,      setPageTab]      = useState<string>('system-users');
  const [users,        setUsers]        = useState<SystemUser[]>([]);
  const [loading]                       = useState(false);
  const [filter,       setFilter]       = useState<Filter>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState<SystemUserModalMode>('create');
  const [selected,     setSelected]     = useState<SystemUser | null>(null);
  const [refreshing,        setRefreshing]        = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete,     setPendingDelete]     = useState<SystemUser | null>(null);

  const statusFiltered = filter === 'All'
    ? users
    : users.filter(u => u.status === filter);

  const q = searchQuery.trim().toLowerCase();
  const filteredUsers = q === ''
    ? statusFiltered
    : statusFiltered.filter(u =>
        [u.fullName, u.username, u.email, u.roleName, u.department]
          .some(v => v?.toLowerCase().includes(q)),
      );

  const counts: Record<Filter, number> = {
    All:      users.length,
    Active:   users.filter(u => u.status === 'Active').length,
    Inactive: users.filter(u => u.status === 'Inactive').length,
  };

  function openCreate() { setSelected(null); setModalMode('create'); setModalVisible(true); }
  function openEdit(u: SystemUser) { setSelected(u); setModalMode('edit'); setModalVisible(true); }
  function openView(u: SystemUser) { setSelected(u); setModalMode('view'); setModalVisible(true); }

  function handleDelete(u: SystemUser) {
    setPendingDelete(u);
    setShowDeleteConfirm(true);
  }

  function doDelete() {
    if (pendingDelete) setUsers(p => p.filter(x => x.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  function handleSave(data: Omit<SystemUser, 'id'>) {
    if (modalMode === 'create') setUsers(p => [...p, { ...data, id: genId() }]);
    else setUsers(p => p.map(x => x.id === selected?.id ? { ...data, id: x.id } : x));
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
        title="System Users"
        showBack={true}
        activeTab={tab}
        onTabChange={setTab}
        onModulePress={handleQuickAccess}
        showSubmodulesTab={false}
        showSubTab={true}
        subTabLabel="Create User"
        selfManagesScroll={true}
      >
        <View style={styles.tabContainer}>
          {tab !== 'dashboard' && (
            <View style={styles.tabBarWrap}>
              <PageTabBar
                tabs={SU_TABS}
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
                refreshControl={
                  <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#595959" />
                }>
                <View style={styles.dashboardContent}>
                  <DashboardView />
                </View>
              </ScrollView>
            ) : (
              <SystemUsersListView
                counts={counts}
                filter={filter}
                setFilter={setFilter}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onOpenCreate={openCreate}
                onView={openView}
                onEdit={openEdit}
                onDelete={handleDelete}
                filteredUsers={filteredUsers}
                loading={loading}
                onRefresh={handleRefresh}
              />
            )}
          </View>
        </View>
      </SubModuleLayout>

      <SystemUserFormModal
        visible={modalVisible}
        mode={modalMode}
        user={selected}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />

      {/* ── Delete confirmation ── */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={dc.overlay}>
          <Pressable
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setShowDeleteConfirm(false)}
          />
          <View style={dc.card}>
            <View style={dc.topAccent} />
            <Pressable
              onPress={() => setShowDeleteConfirm(false)}
              style={({ pressed }) => [dc.closeBtn, pressed && { opacity: 0.6 }]}
              hitSlop={8}>
              <MaterialCommunityIcons name="close" size={13} color="#999" />
            </Pressable>
            <View style={dc.iconRing}>
              <View style={dc.iconCircle}>
                <MaterialCommunityIcons name="delete-outline" size={20} color="#FFF" />
              </View>
            </View>
            <Text style={dc.title}>Delete User?</Text>
            <Text style={dc.desc} numberOfLines={2}>
              "{pendingDelete?.fullName ?? 'this user'}" will be permanently removed.
            </Text>
            <View style={dc.divider} />
            <View style={dc.btnRow}>
              <Pressable
                onPress={() => setShowDeleteConfirm(false)}
                style={({ pressed }) => [dc.cancelBtn, pressed && { opacity: 0.7 }]}>
                <Text style={dc.cancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={() => { setShowDeleteConfirm(false); doDelete(); }}
                style={({ pressed }) => [dc.confirmBtn, pressed && { opacity: 0.85 }]}>
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

// ─── Dynamic styles ───────────────────────────────────────────────────────────
function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    searchBar:    { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF', borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
    searchInput:  { color: colors.primaryText },
    searchWrapper:{ backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' },
    pillTxt:      { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#5A5A62' },
  });
}

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
  scroll: { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 100, gap: 0 },

  sectionHeader: { paddingHorizontal: Spacing.md, paddingTop: 0, paddingBottom: 2 },
  sectionTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700' },

  searchFilterContainer: { paddingHorizontal: Spacing.md, paddingVertical: 6 },
  searchAndFilterRow:    { flexDirection: 'column', gap: 6 },

  searchWrapper: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 4, backgroundColor: 'transparent',
  },
  searchBar: {
    flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 12, height: 40, borderRadius: 10,
    borderWidth: 1, borderColor: '#E5E5E5',
  },
  searchInput: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, paddingVertical: 0 },
  clearBtn:    { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  clearX1:     { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2:     { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  addBtn:        { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E91E63', alignItems: 'center', justifyContent: 'center' },
  addBtnPressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  addBtnIcon:    { position: 'absolute', width: 14, height: 2, borderRadius: 1, backgroundColor: '#FFF' },
  addBtnIconV:   { position: 'absolute', width: 2, height: 14, borderRadius: 1, backgroundColor: '#FFF' },

  pillRow:         { flexDirection: 'row', gap: 6 },
  pill:            { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#E0E0E0' },
  pillActive:      { backgroundColor: '#E91E63', borderColor: 'transparent' },
  pillTxt:         { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500' },
  pillTxtActive:   { color: '#FFFFFF', fontFamily: FontFamily.bold, fontWeight: '600' },
  pillBadge:       { backgroundColor: '#D0D0D0', borderRadius: 8, paddingHorizontal: 5, minWidth: 16, alignItems: 'center' },
  pillBadgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  pillBadgeTxt:    { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', color: '#666666' },
  pillBadgeTxtActive: { color: '#FFF', fontWeight: '700' },
});

// ─── User card styles ─────────────────────────────────────────────────────────
const uc = StyleSheet.create({
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

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontFamily: FontFamily.bold, fontSize: 18, fontWeight: '700', color: '#FFF' },
  nameBlock: { flex: 1, gap: 3 },
  name:  { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  uname: { fontFamily: FontFamily.regular, fontSize: 11 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  statusDot:   { width: 6, height: 6, borderRadius: 3 },
  statusTxt:   { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '600' },
  idx: { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500', alignSelf: 'flex-start', marginTop: 2 },

  divider:  { height: 1 },
  chips:    { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' },
  chip:     { flex: 1, gap: 4 },
  chipLabel: { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#9090A0' },
  chipValue: { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600' },
  chipSep:   { width: 1, height: 34, marginHorizontal: 10 },

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
  emptyHead:    { position: 'absolute', top: 12, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(94,53,177,0.30)' },
  emptyBody:    { position: 'absolute', bottom: 12, width: 26, height: 14, borderTopLeftRadius: 13, borderTopRightRadius: 13, backgroundColor: 'rgba(94,53,177,0.30)' },
  emptyTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySubText: { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  clearBtn:     { marginTop: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryHighlight },
  clearBtnTxt:  { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryHighlight },
});

// ─── Delete confirm styles ────────────────────────────────────────────────────
const dc = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 44,
  },
  card: {
    width: '100%', backgroundColor: '#FFF',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
  },
  topAccent: { height: 3, backgroundColor: '#E53935' },
  closeBtn: {
    position: 'absolute', top: 8, right: 8, zIndex: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#F0F0F4', alignItems: 'center', justifyContent: 'center',
  },
  iconRing: { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontFamily: FontFamily.bold, fontSize: 14, fontWeight: FontWeight.bold,
    color: '#1C1C1E', marginBottom: 4,
  },
  desc: {
    textAlign: 'center',
    fontFamily: FontFamily.regular, fontSize: 11,
    color: '#999', lineHeight: 16,
    paddingHorizontal: 12, marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: '#F0F0F4' },
  btnRow: { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  cancelBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#D0D0D8',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelTxt: { fontFamily: FontFamily.medium, fontSize: 12, color: '#666' },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#E53935',
  },
  confirmTxt: { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF' },
});
