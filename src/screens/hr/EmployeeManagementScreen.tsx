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
import { EmployeeFormModal, EmployeeModalMode } from '../../components/hr/EmployeeFormModal';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { Employee, WorkBranch } from '../../types/hr';

let nextId = 1;
const genId = () => String(nextId++);

type Tab = 'dashboard' | 'modules';
type Filter = 'All' | 'Permanent' | 'Contract' | 'Casual';

const EMP_TABS: PageTabItem[] = [
  { key: 'employee',      label: 'Employee',      color: '#595959' },
  { key: 'salary-matrix', label: 'Salary Matrix', color: '#595959' },
];
const FILTERS: Filter[] = ['All', 'Permanent', 'Contract', 'Casual'];

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

// ─── Field labels for health modal ───────────────────────────────────────────
const HEALTH_FIELD_LABELS: Partial<Record<keyof Employee, string>> = {
  employeeName:        'Employee Name',
  salaryBoard:         'Salary Board',
  designationCategory: 'Designation Category',
  designation:         'Designation',
  designationGrade:    'Designation Grade',
  employeeType:        'Employee Type',
  entity:              'Entity',
  workBranch:          'Work Branch',
  department:          'Department',
};

// ─── Health detail modal ──────────────────────────────────────────────────────
function HealthModal({ visible, employee, onClose }: {
  visible: boolean;
  employee: Employee;
  onClose: () => void;
}) {
  const pct         = calcHealth(employee);
  const ringColor   = healthRingColor(pct);
  const isComplete  = pct === 100;
  const filledCount = HEALTH_FIELDS.filter(f => !!employee[f]).length;
  const totalCount  = HEALTH_FIELDS.length;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={hm.overlay} onPress={onClose}>
        <Pressable style={hm.card} onPress={() => {}}>
          {/* Top accent stripe */}
          <View style={[hm.topBar, { backgroundColor: ringColor }]} />

          {/* Header */}
          <View style={hm.header}>
            <View style={[hm.ring, { borderColor: ringColor }]}>
              <Text style={[hm.ringPct, { color: ringColor }]}>{pct}%</Text>
            </View>
            <View style={hm.headerText}>
              <Text style={hm.title}>Form Health</Text>
              <Text style={hm.sub}>{filledCount} of {totalCount} fields complete</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10}>
              <MaterialCommunityIcons name="close" size={18} color="#9090A0" />
            </Pressable>
          </View>

          {/* Status banner */}
          {isComplete ? (
            <View style={hm.completeBanner}>
              <MaterialCommunityIcons name="check-decagram" size={15} color="#2E7D32" />
              <Text style={hm.completeText}>Complete — all required fields are filled</Text>
            </View>
          ) : (
            <View style={hm.warnBanner}>
              <MaterialCommunityIcons name="alert-outline" size={14} color="#E65100" />
              <Text style={hm.warnText}>{totalCount - filledCount} field(s) need attention</Text>
            </View>
          )}

          {/* Field list */}
          <ScrollView style={hm.list} showsVerticalScrollIndicator={false}>
            {HEALTH_FIELDS.map(field => {
              const filled = !!employee[field];
              const val    = employee[field];
              return (
                <View key={field} style={hm.row}>
                  <MaterialCommunityIcons
                    name={filled ? 'check-circle' : 'alert-circle-outline'}
                    size={16}
                    color={filled ? '#30A84B' : '#FB8C00'}
                  />
                  <View style={hm.rowBody}>
                    <Text style={hm.rowLabel}>
                      {HEALTH_FIELD_LABELS[field] ?? String(field)}
                    </Text>
                    {filled ? (
                      <Text style={hm.rowValue} numberOfLines={1}>{String(val)}</Text>
                    ) : (
                      <Text style={hm.rowMissing}>Not filled</Text>
                    )}
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
  const pct       = calcHealth(employee);
  const ringColor = healthRingColor(pct);
  const [showHealth, setShowHealth] = useState(false);

  return (
    <View style={[ec.card, isDarkMode && ec.cardDark]}>
      <View style={[ec.accent, { backgroundColor: '#595959' }]} />
      <View style={ec.inner}>
        {/* Header */}
        <View style={ec.header}>
          {/* Health circle — tap to open detail modal */}
          <Pressable
            onPress={() => setShowHealth(true)}
            style={ec.avatarWrap}
            hitSlop={6}>
            <View style={[ec.avatarRing, { borderColor: ringColor }]}>
              <View style={ec.avatar}>
                <Text style={[ec.avatarPct, { color: ringColor }]}>{pct}%</Text>
              </View>
            </View>
          </Pressable>

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

      <HealthModal
        visible={showHealth}
        employee={employee}
        onClose={() => setShowHealth(false)}
      />
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

// ─── Work Branches table ──────────────────────────────────────────────────────
const WB_COLS = [
  { key: 'id',            label: 'ID',             width: 56  },
  { key: 'branch',        label: 'Branch',         width: 140 },
  { key: 'code',          label: 'Code',           width: 90  },
  { key: 'attendanceOn',  label: 'Attendance On',  width: 110 },
  { key: 'attendanceOff', label: 'Attendance Off', width: 110 },
  { key: 'main',          label: 'Main',           width: 60  },
  { key: 'status',        label: 'Status',         width: 80  },
] as const;

function WorkBranchesView({
  branches,
  onAdd,
  onEdit,
}: {
  branches: WorkBranch[];
  onAdd: () => void;
  onEdit: (b: WorkBranch) => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const totalWidth = WB_COLS.reduce((s, c) => s + c.width, 0) + 2;

  return (
    <View style={{ flex: 1 }}>
      {/* Header row */}
      <View style={[wb.topBar, isDarkMode && { backgroundColor: '#1C1C1E', borderBottomColor: '#2C2C2E' }]}>
        <Text style={[wb.title, { color: colors.primaryText }]}>Work Branches</Text>
        <Pressable onPress={onAdd} style={({ pressed }) => [wb.addBtn, pressed && { opacity: 0.8 }]}>
          <View style={wb.addIcon} />
          <View style={wb.addIconV} />
        </Pressable>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <ScrollView horizontal showsHorizontalScrollIndicator contentContainerStyle={{ paddingHorizontal: Spacing.md }}>
          <View style={[wb.table, { width: totalWidth }, isDarkMode && { borderColor: '#2C2C2E' }]}>

            {/* Table header */}
            <View style={[wb.headerRow, isDarkMode && { backgroundColor: '#2C2C2E' }]}>
              {WB_COLS.map((col, i) => (
                <View key={col.key} style={[wb.cell, { width: col.width }, i < WB_COLS.length - 1 && wb.cellBorder, isDarkMode && wb.cellBorderDark]}>
                  <Text style={[wb.headerTxt, { color: colors.placeholder }]}>{col.label}</Text>
                </View>
              ))}
            </View>

            {/* Rows */}
            {branches.length === 0 ? (
              <View style={wb.emptyRow}>
                <Text style={[wb.emptyTxt, { color: colors.placeholder }]}>No work branches yet. Tap + to add.</Text>
              </View>
            ) : (
              branches.map((b, rowIdx) => (
                <Pressable
                  key={b.id}
                  onLongPress={() => onEdit(b)}
                  style={({ pressed }) => [
                    wb.row,
                    rowIdx % 2 === 1 && (isDarkMode ? wb.rowAltDark : wb.rowAlt),
                    pressed && { opacity: 0.75 },
                    isDarkMode && { borderBottomColor: '#2C2C2E' },
                  ]}>
                  <View style={[wb.cell, { width: WB_COLS[0].width }, wb.cellBorder, isDarkMode && wb.cellBorderDark]}>
                    <Text style={[wb.cellTxt, { color: colors.placeholder }]}>{b.id}</Text>
                  </View>
                  <View style={[wb.cell, { width: WB_COLS[1].width }, wb.cellBorder, isDarkMode && wb.cellBorderDark]}>
                    <Text style={[wb.cellTxt, { color: colors.primaryText }]} numberOfLines={1}>{b.branch}</Text>
                  </View>
                  <View style={[wb.cell, { width: WB_COLS[2].width }, wb.cellBorder, isDarkMode && wb.cellBorderDark]}>
                    <Text style={[wb.cellTxt, { color: colors.primaryText }]}>{b.code}</Text>
                  </View>
                  <View style={[wb.cell, { width: WB_COLS[3].width }, wb.cellBorder, isDarkMode && wb.cellBorderDark]}>
                    <Text style={[wb.cellTxt, { color: colors.primaryText }]}>{b.attendanceOn}</Text>
                  </View>
                  <View style={[wb.cell, { width: WB_COLS[4].width }, wb.cellBorder, isDarkMode && wb.cellBorderDark]}>
                    <Text style={[wb.cellTxt, { color: colors.primaryText }]}>{b.attendanceOff}</Text>
                  </View>
                  <View style={[wb.cell, { width: WB_COLS[5].width }, wb.cellBorder, isDarkMode && wb.cellBorderDark]}>
                    <View style={[wb.mainDot, b.main ? wb.mainDotOn : wb.mainDotOff]} />
                  </View>
                  <View style={[wb.cell, { width: WB_COLS[6].width }]}>
                    <View style={[wb.statusBadge, b.status === 'Active' ? wb.statusActive : wb.statusInactive]}>
                      <Text style={[wb.statusTxt, b.status === 'Active' ? wb.statusTxtActive : wb.statusTxtInactive]}>
                        {b.status}
                      </Text>
                    </View>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

// ─── Salary Matrix placeholder ────────────────────────────────────────────────
function SalaryMatrixView() {
  const { colors } = useTheme();
  return (
    <View style={sm.wrap}>
      <View style={sm.iconCircle}>
        <View style={sm.iconBar} />
        <View style={sm.iconBarShort} />
        <View style={sm.iconBarShorter} />
      </View>
      <Text style={[sm.title, { color: colors.primaryText }]}>Salary Matrix</Text>
      <Text style={[sm.sub, { color: colors.placeholder }]}>
        Salary grade bands and pay scale configuration will appear here.
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function EmployeeManagementScreen() {
  const { navigate } = useNavigation();

  const [tab,          setTab]          = useState<Tab>('modules');
  const [pageTab,      setPageTab]      = useState<string>('employee');
  const [employees,    setEmployees]    = useState<Employee[]>([]);
  const [loading]                       = useState(false);
  const [filter,       setFilter]       = useState<Filter>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState<EmployeeModalMode>('create');
  const [selected,     setSelected]     = useState<Employee | null>(null);
  const [workBranches] = useState<WorkBranch[]>([]);
  const [refreshing,      setRefreshing]      = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete,     setPendingDelete]     = useState<Employee | null>(null);

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
    setPendingDelete(e);
    setShowDeleteConfirm(true);
  }

  function doDelete() {
    if (pendingDelete) setEmployees(p => p.filter(x => x.id !== pendingDelete.id));
    setPendingDelete(null);
  }

  function handleSave(data: Omit<Employee, 'id'>) {
    if (modalMode === 'create') setEmployees(p => [...p, { ...data, id: genId() }]);
    else setEmployees(p => p.map(x => x.id === selected?.id ? { ...data, id: x.id } : x));
    setModalVisible(false);
  }

  function handleQuickAccess(module: AppModule) {
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
        selfManagesScroll={true}
      >
        <View style={styles.tabContainer}>
          {tab !== 'dashboard' && (
            <View style={styles.tabBarWrap}>
              <PageTabBar
                tabs={EMP_TABS}
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
                  <RefreshControl refreshing={refreshing} onRefresh={handleDashboardRefresh} tintColor="#595959" />
                }>
                <View style={styles.dashboardContent}>
                  <DashboardView />
                </View>
              </ScrollView>
            ) : pageTab === 'salary-matrix' ? (
              <SalaryMatrixView />
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
          </View>
        </View>
      </SubModuleLayout>

      <EmployeeFormModal
        visible={modalVisible}
        mode={modalMode}
        employee={selected}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />

      {/* ── Delete confirmation modal ── */}
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
            <Text style={dc.title}>Delete Employee?</Text>
            <Text style={dc.desc} numberOfLines={2}>
              "{pendingDelete?.employeeName ?? 'this employee'}" will be permanently removed.
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

const sm = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: 'rgba(89,89,89,0.08)',
    alignItems: 'center', justifyContent: 'center',
    gap: 5, marginBottom: 8,
  },
  iconBar:       { width: 28, height: 2.5, borderRadius: 2, backgroundColor: 'rgba(89,89,89,0.35)' },
  iconBarShort:  { width: 20, height: 2.5, borderRadius: 2, backgroundColor: 'rgba(89,89,89,0.25)' },
  iconBarShorter:{ width: 14, height: 2.5, borderRadius: 2, backgroundColor: 'rgba(89,89,89,0.15)' },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  sub:   { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
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
  avatarPct:  { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },
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
    backgroundColor: '#F0F0F4',
    alignItems: 'center', justifyContent: 'center',
  },
  iconRing: { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#E53935',
    alignItems: 'center', justifyContent: 'center',
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

// ─── Work Branches styles ─────────────────────────────────────────────────────
const wb = StyleSheet.create({
  topBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBEBF0',
  },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700' },
  addBtn: {
    width: 34, height: 34, borderRadius: 8, backgroundColor: '#E91E63',
    alignItems: 'center', justifyContent: 'center',
  },
  addIcon:  { position: 'absolute', width: 12, height: 2, borderRadius: 1, backgroundColor: '#FFF' },
  addIconV: { position: 'absolute', width: 2, height: 12, borderRadius: 1, backgroundColor: '#FFF' },

  table: {
    borderWidth: 1, borderColor: '#D0D0D8', borderRadius: 8, overflow: 'hidden',
    marginTop: Spacing.md, backgroundColor: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row', backgroundColor: '#F5F5F7',
    borderBottomWidth: 1, borderBottomColor: '#D0D0D8',
  },
  row: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#EBEBF0',
  },
  rowAlt:     { backgroundColor: '#FAFAFA' },
  rowAltDark: { backgroundColor: '#242426' },
  cell: {
    paddingHorizontal: 10, paddingVertical: 10, justifyContent: 'center',
  },
  cellBorder:     { borderRightWidth: 1, borderRightColor: '#D0D0D8' },
  cellBorderDark: { borderRightColor: '#2C2C2E' },
  headerTxt: {
    fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '600',
    textAlign: 'center',
  },
  cellTxt: {
    fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center',
  },
  mainDot: { width: 10, height: 10, borderRadius: 5, alignSelf: 'center' },
  mainDotOn:  { backgroundColor: '#30A84B' },
  mainDotOff: { backgroundColor: '#D0D0D8' },
  statusBadge: {
    alignSelf: 'center', borderRadius: 6,
    paddingHorizontal: 7, paddingVertical: 3,
  },
  statusActive:   { backgroundColor: 'rgba(48,168,75,0.12)' },
  statusInactive: { backgroundColor: 'rgba(229,57,53,0.10)' },
  statusTxt: { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '600' },
  statusTxtActive:   { color: '#2E7D32' },
  statusTxtInactive: { color: '#C62828' },
  emptyRow: {
    paddingVertical: 40, alignItems: 'center', justifyContent: 'center',
  },
  emptyTxt: { fontFamily: FontFamily.regular, fontSize: 13 },
});

// ─── Health modal styles ──────────────────────────────────────────────────────
const hm = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  card:          { width: '100%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden', maxHeight: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 12 },
  topBar:        { height: 4 },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  ring:          { width: 44, height: 44, borderRadius: 22, borderWidth: 3, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  ringPct:       { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700' },
  headerText:    { flex: 1 },
  title:         { fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  sub:           { fontFamily: FontFamily.regular, fontSize: 11, color: '#8E8E93', marginTop: 2 },
  completeBanner:{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(48,168,75,0.08)', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(48,168,75,0.15)' },
  completeText:  { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#2E7D32', flex: 1 },
  warnBanner:    { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(251,140,0,0.08)', paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(251,140,0,0.15)' },
  warnText:      { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#E65100', flex: 1 },
  list:          { maxHeight: 380 },
  row:           { flexDirection: 'row', alignItems: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, gap: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F7' },
  rowBody:       { flex: 1 },
  rowLabel:      { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#3C3C50', marginBottom: 2 },
  rowValue:      { fontFamily: FontFamily.regular, fontSize: 11, color: '#60607A' },
  rowMissing:    { fontFamily: FontFamily.regular, fontSize: 11, color: '#FB8C00', fontStyle: 'italic' },
});
