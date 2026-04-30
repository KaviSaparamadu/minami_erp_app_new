import React, { useState, useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { ModulesGrid } from '../../components/dashboard/ModulesGrid';
import { ModuleCard } from '../../components/dashboard/ModuleCard';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { UIIcon } from '../../components/common/UIIcon';
import { TableIcons } from '../../components/common/DataTable';
import { EmployeeFormModal, EmployeeModalMode } from '../../components/hr/EmployeeFormModal';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { Employee } from '../../types/hr';

let nextId = 1;
const genId = () => String(nextId++);

const H_PAD = 6;
const GRID_GAP = 10;
const GRID_COLS = 3;

type Tab = 'dashboard' | 'modules' | 'submodules';
type Filter = 'All' | 'Permanent' | 'Contract' | 'Casual';
const FILTERS: Filter[] = ['All', 'Permanent', 'Contract', 'Casual'];
const AVATAR_COLORS = ['#595959', '#6B6B6B', '#7D7D7D', '#8E8E8E', '#A0A0A0', '#606060'];

const HEALTH_FIELDS: (keyof Employee)[] = [
  'employeeName', 'salaryBoard', 'designationCategory', 'designation',
  'designationGrade', 'employeeType', 'entity', 'workBranch', 'department',
];

function calcHealth(emp: Employee): number {
  const filled = HEALTH_FIELDS.filter(f => !!emp[f]).length;
  return Math.round((filled / HEALTH_FIELDS.length) * 100);
}

function healthRingColor(pct: number): string {
  if (pct < 25) return '#E53935';
  if (pct < 50) return '#FB8C00';
  if (pct < 75) return '#FDD835';
  return '#30A84B';
}

// ─── Info chip ────────────────────────────────────────────────────────────────
function InfoChip({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={ec.chip}>
      <Text style={ec.chipLabel}>{label}</Text>
      <Text style={[ec.chipValue, { color: colors.primaryText }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

// ─── Employee card ────────────────────────────────────────────────────────────
function EmployeeCard({
  employee,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  employee: Employee;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const initial = (employee.employeeName || '?').charAt(0).toUpperCase();
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const pct       = calcHealth(employee);
  const ringColor = healthRingColor(pct);

  return (
    <View style={[ec.card, isDarkMode && ec.cardDark]}>
      <View style={[ec.accent, { backgroundColor: '#595959' }]} />
      <View style={ec.inner}>
        {/* Header */}
        <View style={ec.header}>
          <View style={ec.avatarWrap}>
            <View style={[ec.avatarRing, { borderColor: ringColor }]}>
              <View style={[ec.avatar, { backgroundColor: avatarBg }]}>
                <Text style={ec.avatarTxt}>{initial}</Text>
              </View>
            </View>
            <View style={[ec.pctBadge, { backgroundColor: ringColor }]}>
              <Text style={ec.pctTxt}>{pct}%</Text>
            </View>
          </View>
          <View style={ec.nameBlock}>
            <Text style={[ec.name, { color: colors.primaryText }]} numberOfLines={1}>
              {employee.employeeName || '—'}
            </Text>
            {employee.designationGrade ? (
              <View style={ec.badge}>
                <Text style={ec.badgeTxt}>{employee.designationGrade}</Text>
              </View>
            ) : null}
          </View>
          <Text style={[ec.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        <View style={[ec.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* Meta chips */}
        <View style={ec.chips}>
          <InfoChip label="Dept"  value={employee.department     ?? '—'} />
          <View style={[ec.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <InfoChip label="Type"  value={employee.employeeType   ?? '—'} />
          <View style={[ec.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <InfoChip label="Grade" value={employee.designation    ?? '—'} />
        </View>

        {/* Actions */}
        <View style={[ec.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable onPress={onView}   style={({ pressed }) => [ec.btn, ec.btnView,   pressed && ec.btnPressed]} hitSlop={4}>
            <TableIcons.Eye />
            <Text style={ec.btnTxt}>View</Text>
          </Pressable>
          <Pressable onPress={onEdit}   style={({ pressed }) => [ec.btn, ec.btnEdit,   pressed && ec.btnPressed]} hitSlop={4}>
            <TableIcons.Edit />
            <Text style={ec.btnTxt}>Edit</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onDelete} style={({ pressed }) => [ec.btn, ec.btnDelete, pressed && ec.btnPressed]} hitSlop={4}>
            <TableIcons.Trash />
            <Text style={ec.btnDelTxt}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Submodules (list) tab ────────────────────────────────────────────────────
function EmployeeListView({
  counts,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  onOpenCreate,
  onView,
  onEdit,
  onDelete,
  filteredEmployees,
  loading,
  onRefresh,
}: {
  counts: Record<Filter, number>;
  filter: Filter;
  setFilter: (f: Filter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCreate: () => void;
  onView: (e: Employee) => void;
  onEdit: (e: Employee) => void;
  onDelete: (e: Employee) => void;
  filteredEmployees: Employee[];
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

        {/* Section title */}
        <View style={lv.sectionHeader}>
          <Text style={[lv.sectionTitle, { color: colors.primaryText }]}>Employee Records</Text>
        </View>

        {/* Search + filter */}
        <View style={lv.searchFilterContainer}>
          <View style={lv.searchAndFilterRow}>
            <View style={[lv.searchWrapper, dyn.searchWrapper]}>
              <View style={[lv.searchBar, dyn.searchBar]}>
                <UIIcon name="search" size={16} color="#8E8E93" />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name, dept, type…"
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

            {/* Filter pills */}
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

        {/* Card list */}
        {loading ? (
          <View style={ec.emptyWrap}>
            <ActivityIndicator size="large" color={Colors.primaryHighlight} />
            <Text style={[ec.emptySubText, { color: colors.placeholder, marginTop: 12 }]}>
              Loading records…
            </Text>
          </View>
        ) : filteredEmployees.length === 0 ? (
          <View style={ec.emptyWrap}>
            <View style={ec.emptyIcon}>
              <View style={ec.emptyHead} />
              <View style={ec.emptyBody} />
            </View>
            <Text style={[ec.emptyTitle, { color: colors.primaryText }]}>
              {searchQuery.trim() ? 'No matches found'
                : filter === 'All' ? 'No employees yet' : `No ${filter} employees`}
            </Text>
            <Text style={[ec.emptySubText, { color: colors.placeholder }]}>
              {searchQuery.trim()
                ? `Nothing matched "${searchQuery}"`
                : 'Tap + to add your first record'}
            </Text>
            {searchQuery.trim().length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={ec.clearBtn}>
                <Text style={ec.clearBtnTxt}>Clear search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={ec.list}>
            {filteredEmployees.map((emp, idx) => (
              <EmployeeCard
                key={emp.id}
                employee={emp}
                index={idx}
                onView={() => onView(emp)}
                onEdit={() => onEdit(emp)}
                onDelete={() => onDelete(emp)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Modules tab ──────────────────────────────────────────────────────────────
function ModulesView({
  onModulePress,
  refreshing,
  onRefresh,
}: {
  onModulePress: (module: AppModule) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - H_PAD * 2 - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 8, paddingVertical: Spacing.sm, gap: 8 }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#595959" />
      }>
      <View style={{ paddingHorizontal: 8 }}>
        <Text style={{ fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', color: colors.primaryText, marginBottom: 12 }}>
          Available Modules
        </Text>
      </View>
      <ModulesGrid
        data={MODULES}
        cardWidth={cardWidth}
        numColumns={GRID_COLS}
        gap={GRID_GAP}
        hPad={0}
        renderItem={(module, width) => (
          <ModuleCard
            key={module.id}
            module={module}
            width={width}
            onPress={() => onModulePress(module)}
          />
        )}
      />
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function EmployeeManagementScreen() {
  const { navigate } = useNavigation();

  const [tab,          setTab]          = useState<Tab>('submodules');
  const [employees,    setEmployees]    = useState<Employee[]>([]);
  const [loading]                       = useState(false);
  const [filter,       setFilter]       = useState<Filter>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState<EmployeeModalMode>('create');
  const [selected,     setSelected]     = useState<Employee | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);

  const typeFiltered = filter === 'All'
    ? employees
    : employees.filter(e => e.employeeType === filter);

  const q = searchQuery.trim().toLowerCase();
  const filteredEmployees = q === ''
    ? typeFiltered
    : typeFiltered.filter(e =>
        [e.employeeName, e.employeeNumber, e.designation, e.designationCategory,
         e.department, e.subDepartment, e.employeeType, e.salaryBoard,
         e.entity, e.workBranch, e.section]
          .some(v => v?.toLowerCase().includes(q)),
      );

  const counts: Record<Filter, number> = {
    All:       employees.length,
    Permanent: employees.filter(e => e.employeeType === 'Permanent').length,
    Contract:  employees.filter(e => e.employeeType === 'Contract').length,
    Casual:    employees.filter(e => e.employeeType === 'Casual').length,
  };

  function openCreate() { setSelected(null); setModalMode('create'); setModalVisible(true); }
  function openEdit(e: Employee) { setSelected(e); setModalMode('edit'); setModalVisible(true); }
  function openView(e: Employee) { setSelected(e); setModalMode('view'); setModalVisible(true); }

  function handleDelete(e: Employee) {
    Alert.alert('Delete Employee', `Remove "${e.employeeName ?? 'this employee'}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setEmployees(p => p.filter(x => x.id !== e.id)) },
    ]);
  }

  function handleSave(data: Omit<Employee, 'id'>) {
    if (modalMode === 'create') setEmployees(p => [...p, { ...data, id: genId() }]);
    else setEmployees(p => p.map(x => x.id === selected?.id ? { ...data, id: x.id } : x));
    setModalVisible(false);
  }

  function handleQuickAccess(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  function handleModulePress(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  async function handleDashboardRefresh() {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }

  return (
    <>
      <SubModuleLayout parentModuleId="1"
        title="Employee Management"
        showBack={true}
        activeTab={tab}
        onTabChange={setTab}
        onModulePress={handleQuickAccess}
        showSubmodulesTab={false}
        showSubTab={true}
        subTabLabel="Create Employee"
      >
        {tab === 'dashboard' ? (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleDashboardRefresh} tintColor="#595959" />
            }>
            <View style={styles.dashboardContent}>
              <DashboardView />
            </View>
          </ScrollView>
        ) : tab === 'modules' ? (
          <ModulesView onModulePress={handleModulePress} refreshing={refreshing} onRefresh={handleDashboardRefresh} />
        ) : (
          <EmployeeListView
            counts={counts}
            filter={filter}
            setFilter={setFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenCreate={openCreate}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDelete}
            filteredEmployees={filteredEmployees}
            loading={loading}
            onRefresh={handleDashboardRefresh}
          />
        )}
      </SubModuleLayout>

      <EmployeeFormModal
        visible={modalVisible}
        mode={modalMode}
        employee={selected}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
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
  dashboardContent:      { flex: 1 },
  contentScroll:         { flex: 1 },
  contentScrollContent:  { flexGrow: 1 },
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

// ─── Employee card styles ─────────────────────────────────────────────────────
const ec = StyleSheet.create({
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

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 12 },
  avatarWrap: { alignItems: 'center', gap: 4, flexShrink: 0 },
  avatarRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pctBadge:   { borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1, alignItems: 'center', minWidth: 34 },
  pctTxt:     { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', color: '#FFF' },
  avatarTxt: { fontFamily: FontFamily.bold, fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  nameBlock: { flex: 1, gap: 4 },
  name:      { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', lineHeight: 20 },
  badge:     { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(233,30,99,0.10)' },
  badgeTxt:  { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: Colors.primaryHighlight },
  idx:       { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500', alignSelf: 'flex-start', marginTop: 2 },

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
  emptyIcon:    { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyHead:    { position: 'absolute', top: 12, width: 16, height: 16, borderRadius: 8, backgroundColor: 'rgba(89,89,89,0.25)' },
  emptyBody:    { position: 'absolute', bottom: 12, width: 26, height: 14, borderTopLeftRadius: 13, borderTopRightRadius: 13, backgroundColor: 'rgba(89,89,89,0.25)' },
  emptyTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySubText: { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  clearBtn:     { marginTop: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryHighlight },
  clearBtnTxt:  { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryHighlight },
});
