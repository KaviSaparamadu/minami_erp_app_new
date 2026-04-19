import React, { useState, useMemo } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { EmployeeFormModal, EmployeeModalMode } from '../../components/hr/EmployeeFormModal';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import type { Employee } from '../../types/hr';

let nextId = 1;
const genId = () => String(nextId++);

const AVATAR_COLORS = ['#E91E63', '#9C27B0', '#3F51B5', '#009688', '#FF5722', '#607D8B'];

// ─── Row action icons ─────────────────────────────────────────────────────────
function EyeIcon() {
  return (
    <View style={ai.wrap}>
      <View style={ai.eyeOval} /><View style={ai.eyeDot} />
    </View>
  );
}
function EditIcon() {
  return (
    <View style={ai.wrap}>
      <View style={ai.penBody} /><View style={ai.penLine} />
    </View>
  );
}
function TrashIcon() {
  return (
    <View style={ai.wrap}>
      <View style={ai.lidBar} /><View style={ai.binBody} />
      <View style={ai.binL} /><View style={ai.binR} />
    </View>
  );
}

// ─── Table row ────────────────────────────────────────────────────────────────
function TableRow({
  employee, index, onView, onEdit, onDelete,
}: {
  employee: Employee; index: number;
  onView(): void; onEdit(): void; onDelete(): void;
}) {
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);
  const initial = (employee.employeeName ?? 'E').charAt(0).toUpperCase();
  const isEven  = index % 2 === 0;

  return (
    <View style={[tr.row, isEven && tr.rowEven]}>
      {/* # */}
      <View style={tr.colIdx}><Text style={[tr.idxText, dynamicStyles.idxText]}>{index + 1}</Text></View>

      {/* Avatar + name */}
      <View style={tr.colName}>
        <View style={[tr.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
          <Text style={tr.avatarTxt}>{initial}</Text>
        </View>
        <View style={tr.nameBlock}>
          <Text style={[tr.nameText, dynamicStyles.nameText]} numberOfLines={1}>{employee.employeeName ?? '—'}</Text>
          {employee.designationGrade ? (
            <View style={tr.gradeBadge}>
              <Text style={tr.gradeText}>{employee.designationGrade}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Dept / Type */}
      <View style={tr.colMeta}>
        <Text style={[tr.metaText, dynamicStyles.metaText]} numberOfLines={1}>{employee.department ?? '—'}</Text>
        <Text style={[tr.metaSub, dynamicStyles.metaSub]} numberOfLines={1}>{employee.employeeType ?? ''}</Text>
      </View>

      {/* Actions */}
      <View style={tr.colActions}>
        <Pressable onPress={onView}   style={[tr.btn, tr.btnView]}   hitSlop={6}><EyeIcon /></Pressable>
        <Pressable onPress={onEdit}   style={[tr.btn, tr.btnEdit]}   hitSlop={6}><EditIcon /></Pressable>
        <Pressable onPress={onDelete} style={[tr.btn, tr.btnDelete]} hitSlop={6}><TrashIcon /></Pressable>
      </View>
    </View>
  );
}

// ─── No results ───────────────────────────────────────────────────────────────
function NoResults({ query, onClear }: { query: string; onClear(): void }) {
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  return (
    <View style={nr.wrap}>
      <View style={nr.iconWrap}>
        <View style={nr.glass} /><View style={nr.handle} />
        <View style={nr.cross1} /><View style={nr.cross2} />
      </View>
      <Text style={[nr.title, dynamicStyles.noResultsTitle]}>No results found</Text>
      <Text style={[nr.sub, dynamicStyles.noResultsSub]}>Nothing matched <Text style={[nr.query, dynamicStyles.noResultsQuery]}>"{query}"</Text></Text>
      <Pressable onPress={onClear} style={({ pressed }) => [nr.btn, { borderColor: colors.primaryText }, pressed && { opacity: 0.8 }]}>
        <Text style={[nr.btnTxt, dynamicStyles.noResultsBtn]}>Clear search</Text>
      </Pressable>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd(): void }) {
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  return (
    <View style={es.wrap}>
      <View style={es.iconCircle}>
        <View style={es.head} /><View style={es.body} />
        <View style={es.plusH} /><View style={es.plusV} />
      </View>
      <Text style={[es.title, dynamicStyles.emptyTitle]}>No employees yet</Text>
      <Text style={[es.sub, dynamicStyles.emptySub]}>Tap + to add your first employee record</Text>
      <Pressable onPress={onAdd} style={({ pressed }) => [es.btn, pressed && { opacity: 0.85 }]}>
        <Text style={[es.btnTxt, dynamicStyles.emptyBtn]}>+ Create Employee</Text>
      </Pressable>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export function EmployeeManagementScreen() {
  const [employees,    setEmployees]    = useState<Employee[]>([]);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState<EmployeeModalMode>('create');
  const [selected,     setSelected]     = useState<Employee | null>(null);
  const { colors } = useTheme();
  const dynamicStyles = useMemo(() => createDynamicStyles(colors), [colors]);

  const q = searchQuery.trim().toLowerCase();
  const filtered = q === ''
    ? employees
    : employees.filter(e =>
        [e.employeeName, e.employeeNumber, e.designation, e.designationCategory,
         e.department, e.subDepartment, e.employeeType, e.salaryBoard,
         e.entity, e.workBranch, e.section]
          .some(v => v?.toLowerCase().includes(q)),
      );

  function openCreate() { setSelected(null); setModalMode('create'); setModalVisible(true); }
  function openEdit(e: Employee) { setSelected(e); setModalMode('edit');   setModalVisible(true); }
  function openView(e: Employee) { setSelected(e); setModalMode('view');   setModalVisible(true); }

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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

      {/* Dark band */}
      <View style={styles.darkBand}>
        <PageHeader title="Employee Management" showBack={true} />

        {/* Stats chips */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>{employees.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>
              {employees.filter(e => e.employeeType === 'Permanent').length}
            </Text>
            <Text style={styles.statLabel}>Permanent</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={styles.statValue}>
              {employees.filter(e => e.employeeType === 'Contract').length}
            </Text>
            <Text style={styles.statLabel}>Contract</Text>
          </View>
        </View>
      </View>

      {/* Light sheet */}
      <View style={styles.sheet}>

        {/* Search bar */}
        {employees.length > 0 && (
          <View style={sb.wrap}>
            <View style={sb.iconWrap}>
              <View style={[sb.glass, { borderColor: colors.placeholder }]} /><View style={[sb.handle, { backgroundColor: colors.placeholder }]} />
            </View>
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, department, type…"
              placeholderTextColor={colors.placeholder}
              style={[sb.input, { color: colors.primaryText }]}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={sb.clearBtn} hitSlop={8}>
                <View style={[sb.clearX1, { backgroundColor: colors.placeholder }]} /><View style={[sb.clearX2, { backgroundColor: colors.placeholder }]} />
              </Pressable>
            )}
          </View>
        )}

        {/* Table header */}
        {filtered.length > 0 && (
          <View style={th.row}>
            <View style={th.colIdx}><Text style={[th.txt, dynamicStyles.headerTxt]}>#</Text></View>
            <View style={th.colName}><Text style={[th.txt, dynamicStyles.headerTxt]}>Employee</Text></View>
            <View style={th.colMeta}><Text style={[th.txt, dynamicStyles.headerTxt]}>Dept / Type</Text></View>
            <View style={th.colActions}><Text style={[th.txt, dynamicStyles.headerTxt, { textAlign: 'center' }]}>Actions</Text></View>
          </View>
        )}

        {filtered.length === 0 && employees.length === 0 ? (
          <EmptyState onAdd={openCreate} />
        ) : filtered.length === 0 ? (
          <NoResults query={searchQuery} onClear={() => setSearchQuery('')} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={e => e.id}
            renderItem={({ item, index }) => (
              <TableRow
                employee={item} index={index}
                onView={() => openView(item)}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

        {/* FAB */}
        <Pressable
          onPress={openCreate}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          accessibilityLabel="Create employee"
          accessibilityRole="button">
          <View style={styles.fabH} />
          <View style={styles.fabV} />
        </Pressable>
      </View>

      <EmployeeFormModal
        visible={modalVisible}
        mode={modalMode}
        employee={selected}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK  = '#1C1C1E';
const LIGHT = '#F2F2F7';

function createDynamicStyles(colors: any) {
  return StyleSheet.create({
    txt: { color: colors.placeholder },
    idxText: { color: colors.placeholder },
    nameText: { color: colors.primaryText },
    metaText: { color: colors.primaryText },
    metaSub: { color: colors.placeholder },
    sub: { color: colors.placeholder },
    title: { color: colors.primaryText },
    headerTxt: { color: colors.placeholder },
    searchIcon: { borderColor: colors.placeholder, backgroundColor: colors.placeholder },
    searchInput: { color: colors.primaryText },
    clearIcon: { backgroundColor: colors.placeholder },
    noResultsTitle: { color: colors.primaryText },
    noResultsSub: { color: colors.placeholder },
    noResultsQuery: { color: colors.primaryText },
    noResultsBtn: { borderColor: colors.primaryText, color: colors.primaryText },
    emptyTitle: { color: colors.primaryText },
    emptySub: { color: colors.placeholder },
    emptyBtn: { color: '#FFF' },
  });
}

const styles = StyleSheet.create({
  safe:     { flex: 1, backgroundColor: DARK },
  darkBand: { backgroundColor: DARK, paddingBottom: 24 },
  sheet: {
    flex: 1, backgroundColor: LIGHT,
    borderTopLeftRadius: 28, borderTopRightRadius: 28,
    marginTop: -28, overflow: 'hidden',
  },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  statChip: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)', minWidth: 64,
  },
  statValue: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF' },
  statLabel: { fontFamily: FontFamily.regular, fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  fab: {
    position: 'absolute', bottom: 28, right: 20,
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: Colors.primaryHighlight, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 14, elevation: 10,
  },
  fabPressed: { transform: [{ scale: 0.93 }], opacity: 0.88 },
  fabH: { position: 'absolute', width: 24, height: 3, borderRadius: 1.5, backgroundColor: '#FFF' },
  fabV: { position: 'absolute', width: 3, height: 24, borderRadius: 1.5, backgroundColor: '#FFF' },
});

const th = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 8,
    backgroundColor: '#FFF', borderBottomWidth: 1.5, borderBottomColor: '#E8E8F0',
  },
  txt: { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: FontWeight.bold, textTransform: 'uppercase', letterSpacing: 0.6 },
  colIdx:    { width: 28 },
  colName:   { flex: 1 },
  colMeta:   { width: 80 },
  colActions:{ width: 96 },
});

const tr = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.md, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#F0F0F5', backgroundColor: '#FFF',
  },
  rowEven: { backgroundColor: '#FAFAFA' },
  colIdx:     { width: 28 },
  colName:    { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  colMeta:    { width: 80 },
  colActions: { width: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },

  idxText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs },
  avatar:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: FontWeight.bold, color: '#FFF' },
  nameBlock: { flex: 1, gap: 2 },
  nameText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  gradeBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(233,30,99,0.08)', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  gradeText:  { fontFamily: FontFamily.bold, fontSize: 8, fontWeight: FontWeight.bold, color: Colors.primaryHighlight, letterSpacing: 0.5 },
  metaText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  metaSub:  { fontFamily: FontFamily.regular, fontSize: 9, marginTop: 1 },

  btn:       { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnView:   { backgroundColor: 'rgba(63,81,181,0.1)' },
  btnEdit:   { backgroundColor: 'rgba(255,152,0,0.1)' },
  btnDelete: { backgroundColor: 'rgba(211,47,47,0.1)' },
});

const es = StyleSheet.create({
  wrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingBottom: 60, gap: Spacing.md },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(233,30,99,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  head:  { position: 'absolute', top: 12, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(233,30,99,0.3)' },
  body:  { position: 'absolute', bottom: 14, width: 28, height: 16, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: 'rgba(233,30,99,0.3)' },
  plusH: { position: 'absolute', bottom: 10, right: 8, width: 14, height: 3, borderRadius: 1.5, backgroundColor: Colors.primaryHighlight },
  plusV: { position: 'absolute', bottom: 4, right: 14, width: 3, height: 14, borderRadius: 1.5, backgroundColor: Colors.primaryHighlight },
  title:  { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  sub:    { fontFamily: FontFamily.regular, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 18 },
  btn:    { marginTop: Spacing.sm, backgroundColor: Colors.primaryHighlight, borderRadius: 12, paddingHorizontal: Spacing.xl, paddingVertical: 12 },
  btnTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#FFF' },
});

const sb = StyleSheet.create({
  wrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: Spacing.lg, marginTop: Spacing.md, marginBottom: 2,
    paddingBottom: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0', gap: 8,
  },
  iconWrap: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  glass:  { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, position: 'absolute', top: 0, left: 0 },
  handle: { position: 'absolute', bottom: 0, right: 0, width: 5, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  input:  { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, paddingVertical: 0 },
  clearBtn: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  clearX1: { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2: { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
});

const nr = StyleSheet.create({
  wrap:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60, gap: Spacing.md },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F0F5', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  glass:    { width: 26, height: 26, borderRadius: 14, borderWidth: 2.5, borderColor: '#C0C0CC', position: 'absolute', top: 10, left: 10 },
  handle:   { position: 'absolute', bottom: 11, right: 10, width: 11, height: 2.5, backgroundColor: '#C0C0CC', borderRadius: 1.5, transform: [{ rotate: '45deg' }] },
  cross1:   { position: 'absolute', top: 12, left: 22, width: 10, height: 2, backgroundColor: '#D32F2F', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  cross2:   { position: 'absolute', top: 12, left: 22, width: 10, height: 2, backgroundColor: '#D32F2F', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  title:    { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  sub:      { fontFamily: FontFamily.regular, fontSize: FontSize.sm, textAlign: 'center' },
  query:    { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold },
  btn:      { marginTop: 4, paddingHorizontal: Spacing.lg, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, backgroundColor: '#FFF' },
  btnTxt:   { fontFamily: FontFamily.medium, fontSize: FontSize.sm },
});

const ai = StyleSheet.create({
  wrap:    { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  eyeOval: { position: 'absolute', width: 14, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: '#3F51B5' },
  eyeDot:  { width: 5, height: 5, borderRadius: 3, backgroundColor: '#3F51B5' },
  penBody: { position: 'absolute', width: 9, height: 3, backgroundColor: '#FF9800', borderRadius: 1, transform: [{ rotate: '-45deg' }], top: 2, left: 1 },
  penLine: { position: 'absolute', bottom: 0, width: 8, height: 1.5, backgroundColor: '#FF9800', borderRadius: 1 },
  lidBar:  { position: 'absolute', top: 0, width: 12, height: 2, borderRadius: 1, backgroundColor: '#D32F2F' },
  binBody: { position: 'absolute', bottom: 0, width: 10, height: 10, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderWidth: 1.5, borderColor: '#D32F2F', borderTopWidth: 0 },
  binL:    { position: 'absolute', bottom: 2, left: 4, width: 1.5, height: 6, backgroundColor: '#D32F2F', borderRadius: 1 },
  binR:    { position: 'absolute', bottom: 2, right: 4, width: 1.5, height: 6, backgroundColor: '#D32F2F', borderRadius: 1 },
});
