import React, { useState } from 'react';
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
import { HumanFormModal, ModalMode } from '../../components/hr/HumanFormModal';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { Country, Human } from '../../types/hr';

let nextId = 1;
const genId = () => String(nextId++);

type Filter = 'All' | Country;
const FILTERS: Filter[] = ['All', 'Sri Lanka', 'Japan'];

// ─── Icon components ─────────────────────────────────────────────────────────
function EyeIcon()  { return <View style={ai.wrap}><View style={ai.eyeOval}/><View style={ai.eyeDot}/></View>; }
function EditIcon() { return <View style={ai.wrap}><View style={ai.penBody}/><View style={ai.penLine}/></View>; }
function TrashIcon(){ return <View style={ai.wrap}><View style={ai.lidBar}/><View style={ai.binBody}/><View style={ai.binL}/><View style={ai.binR}/></View>; }

// ─── Filter toggle ────────────────────────────────────────────────────────────
function FilterToggle({ active, counts, onChange }: { active: Filter; counts: Record<Filter, number>; onChange: (f: Filter) => void }) {
  return (
    <View style={ft.wrap}>
      {FILTERS.map(f => (
        <Pressable
          key={f}
          onPress={() => onChange(f)}
          style={[ft.btn, active === f && ft.btnActive]}>
          <Text style={[ft.label, active === f && ft.labelActive]}>{f}</Text>
          <View style={[ft.badge, active === f && ft.badgeActive]}>
            <Text style={[ft.badgeText, active === f && ft.badgeTextActive]}>{counts[f]}</Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Table row ───────────────────────────────────────────────────────────────
function TableRow({ human, index, onView, onEdit, onDelete }: { human: Human; index: number; onView(): void; onEdit(): void; onDelete(): void }) {
  const initial = human.fullName.charAt(0).toUpperCase();
  const isEven  = index % 2 === 0;
  const isSL    = human.country === 'Sri Lanka';

  return (
    <View style={[tr.row, isEven && tr.rowEven]}>
      {/* # */}
      <View style={tr.colIdx}><Text style={tr.idxText}>{index + 1}</Text></View>

      {/* Avatar + name */}
      <View style={tr.colName}>
        <View style={[tr.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
          <Text style={tr.avatarTxt}>{initial}</Text>
        </View>
        <View style={tr.nameBlock}>
          <Text style={tr.nameText} numberOfLines={1}>
            {human.title ? `${human.title} ` : ''}{human.fullName}
          </Text>
          <View style={[tr.countryBadge, isSL ? tr.badgeSL : tr.badgeJP]}>
            <Text style={[tr.countryTxt, isSL ? tr.countryTxtSL : tr.countryTxtJP]}>
              {isSL ? 'SL' : 'JP'}
            </Text>
          </View>
        </View>
      </View>

      {/* DOB / Prefecture */}
      <View style={tr.colMeta}>
        <Text style={tr.metaText} numberOfLines={1}>
          {isSL ? (human.dateOfBirth ?? '—') : (human.prefecture ?? '—')}
        </Text>
        <Text style={tr.metaSub} numberOfLines={1}>
          {isSL ? (human.gender ?? '') : (human.city ?? '')}
        </Text>
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

// ─── No search results ────────────────────────────────────────────────────────
function NoResults({ query, onClear }: { query: string; onClear(): void }) {
  return (
    <View style={nr.wrap}>
      {/* Magnifier icon */}
      <View style={nr.iconWrap}>
        <View style={nr.glass} />
        <View style={nr.handle} />
        <View style={nr.cross1} />
        <View style={nr.cross2} />
      </View>
      <Text style={nr.title}>No results found</Text>
      <Text style={nr.sub}>Nothing matched <Text style={nr.query}>"{query}"</Text></Text>
      <Pressable onPress={onClear} style={({ pressed }) => [nr.btn, pressed && { opacity: 0.8 }]}>
        <Text style={nr.btnTxt}>Clear search</Text>
      </Pressable>
    </View>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ filter, onAdd }: { filter: Filter; onAdd(): void }) {
  return (
    <View style={es.wrap}>
      <View style={es.iconCircle}>
        <View style={es.head}/><View style={es.body}/>
        <View style={es.plusH}/><View style={es.plusV}/>
      </View>
      <Text style={es.title}>{filter === 'All' ? 'No humans yet' : `No ${filter} records`}</Text>
      <Text style={es.sub}>Tap + to add your first record</Text>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export function HumanManagementScreen() {
  const [humans,       setHumans]       = useState<Human[]>([]);
  const [filter,       setFilter]       = useState<Filter>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState<ModalMode>('create');
  const [selected,     setSelected]     = useState<Human | null>(null);

  const countryFiltered = filter === 'All' ? humans : humans.filter(h => h.country === filter);

  const q = searchQuery.trim().toLowerCase();
  const filtered = q === ''
    ? countryFiltered
    : countryFiltered.filter(h =>
        [h.fullName, h.firstName, h.surname, h.otherName, h.title,
         h.nic, h.dateOfBirth, h.gender, h.district, h.gnDivision,
         h.province, h.prefecture, h.city, h.townDistrict]
          .some(v => v?.toLowerCase().includes(q)),
      );

  const counts: Record<Filter, number> = {
    All:         humans.length,
    'Sri Lanka': humans.filter(h => h.country === 'Sri Lanka').length,
    Japan:       humans.filter(h => h.country === 'Japan').length,
  };

  function openCreate() { setSelected(null); setModalMode('create'); setModalVisible(true); }
  function openEdit(h: Human)   { setSelected(h); setModalMode('edit');   setModalVisible(true); }
  function openView(h: Human)   { setSelected(h); setModalMode('view');   setModalVisible(true); }

  function handleDelete(h: Human) {
    Alert.alert('Delete Human', `Remove "${h.fullName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setHumans(p => p.filter(x => x.id !== h.id)) },
    ]);
  }

  function handleSave(data: Omit<Human, 'id'>) {
    if (modalMode === 'create') setHumans(p => [...p, { ...data, id: genId() }]);
    else setHumans(p => p.map(x => x.id === selected?.id ? { ...data, id: x.id } : x));
    setModalVisible(false);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>

      <PageHeader title="Human Management" showBack={true} />

      <View style={styles.sheet}>

        {/* Filter toggle */}
        <FilterToggle active={filter} counts={counts} onChange={setFilter} />

        {/* Search bar */}
        <View style={sb.wrap}>
          <View style={sb.iconWrap}>
            <View style={sb.glass} />
            <View style={sb.handle} />
          </View>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search by name, NIC, location…"
            placeholderTextColor={Colors.placeholder}
            style={sb.input}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={sb.clearBtn} hitSlop={8}>
              <View style={sb.clearX1} />
              <View style={sb.clearX2} />
            </Pressable>
          )}
        </View>

        {/* Table header (shown when there are records) */}
        {filtered.length > 0 && (
          <View style={th.row}>
            <View style={th.colIdx}><Text style={th.txt}>#</Text></View>
            <View style={th.colName}><Text style={th.txt}>Name · Country</Text></View>
            <View style={th.colMeta}><Text style={th.txt}>{filter === 'Japan' ? 'Prefecture' : 'DOB / Gender'}</Text></View>
            <View style={th.colActions}><Text style={[th.txt, { textAlign: 'center' }]}>Actions</Text></View>
          </View>
        )}

        {filtered.length === 0 && humans.length === 0 ? (
          <EmptyState filter={filter} onAdd={openCreate} />
        ) : filtered.length === 0 ? (
          <NoResults query={searchQuery} onClear={() => setSearchQuery('')} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={h => h.id}
            renderItem={({ item, index }) => (
              <TableRow
                human={item} index={index}
                onView={() => openView(item)}
                onEdit={() => openEdit(item)}
                onDelete={() => handleDelete(item)}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 100 }}
          />
        )}

        {/* FAB — mirrors assets/icons/create-button.svg */}
        <Pressable
          onPress={openCreate}
          style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
          accessibilityLabel="Create human"
          accessibilityRole="button">
          <View style={styles.fabH} />
          <View style={styles.fabV} />
        </Pressable>
      </View>

      <HumanFormModal
        visible={modalVisible}
        mode={modalMode}
        human={selected}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const DARK   = '#1C1C1E';
const LIGHT  = '#FFFFFF';
const AVATAR_COLORS = ['#595959'];

const styles = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: '#1C1C1E' },
  sheet: { flex: 1, backgroundColor: LIGHT },
  fab: { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 10 },
  fabPressed: { transform: [{ scale: 0.93 }], opacity: 0.88 },
  fabH: { position: 'absolute', width: 24, height: 3, borderRadius: 1.5, backgroundColor: '#FFF' },
  fabV: { position: 'absolute', width: 3, height: 24, borderRadius: 1.5, backgroundColor: '#FFF' },
});

const ft = StyleSheet.create({
  wrap: { flexDirection: 'row', paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: Spacing.sm, gap: 8 },
  btn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: '#FFF', borderWidth: 1.5, borderColor: '#E5E5EA' },
  btnActive: { backgroundColor: '#595959', borderColor: '#595959' },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder },
  labelActive: { color: '#FFFFFF', fontFamily: FontFamily.bold, fontWeight: FontWeight.bold },
  badge: { backgroundColor: '#F0F0F5', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1 },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeText: { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: FontWeight.bold, color: Colors.placeholder },
  badgeTextActive: { color: '#FFFFFF' },
});

const th = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: '#FFF', borderBottomWidth: 1.5, borderBottomColor: '#E8E8F0' },
  txt: { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: FontWeight.bold, color: Colors.placeholder, textTransform: 'uppercase', letterSpacing: 0.6 },
  colIdx:    { width: 28 },
  colName:   { flex: 1 },
  colMeta:   { width: 80 },
  colActions:{ width: 96 },
});

const tr = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0F0F5', backgroundColor: '#FFF' },
  rowEven: { backgroundColor: '#FAFAFE' },
  colIdx:  { width: 30 },
  colName: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  colMeta: { width: 82 },
  colActions: { width: 100, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 5 },

  idxText: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.placeholder },
  avatar:  { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: FontWeight.bold, color: '#FFF' },
  nameBlock: { flex: 1, gap: 3 },
  nameText: { fontFamily: FontFamily.medium, fontSize: 13, fontWeight: FontWeight.medium, color: Colors.primaryText },
  countryBadge: { alignSelf: 'flex-start', borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeSL: { backgroundColor: 'rgba(233,30,99,0.1)' },
  badgeJP: { backgroundColor: 'rgba(63,81,181,0.1)' },
  countryTxt: { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.5 },
  countryTxtSL: { color: Colors.primaryHighlight },
  countryTxtJP: { color: '#3F51B5' },

  metaText: { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: FontWeight.medium, color: Colors.primaryText },
  metaSub:  { fontFamily: FontFamily.regular, fontSize: 11, color: Colors.placeholder, marginTop: 2 },

  btn: { width: 30, height: 30, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  btnView:   { backgroundColor: 'rgba(63,81,181,0.10)' },
  btnEdit:   { backgroundColor: 'rgba(255,152,0,0.10)' },
  btnDelete: { backgroundColor: 'rgba(211,47,47,0.10)' },
});

const es = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl, paddingBottom: 60, gap: Spacing.md },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(233,30,99,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  head: { position: 'absolute', top: 12, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(233,30,99,0.3)' },
  body: { position: 'absolute', bottom: 14, width: 28, height: 16, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: 'rgba(233,30,99,0.3)' },
  plusH: { position: 'absolute', bottom: 10, right: 8, width: 14, height: 3, borderRadius: 1.5, backgroundColor: Colors.primaryHighlight },
  plusV: { position: 'absolute', bottom: 4, right: 14, width: 3, height: 14, borderRadius: 1.5, backgroundColor: Colors.primaryHighlight },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primaryText },
  sub:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.placeholder, textAlign: 'center', lineHeight: 18 },
  btn:   { marginTop: Spacing.sm, backgroundColor: Colors.primaryHighlight, borderRadius: 12, paddingHorizontal: Spacing.xl, paddingVertical: 12 },
  btnTxt:{ fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#FFF' },
});

const sb = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1.5,
    borderBottomColor: '#D0D0D0',
  },
  iconWrap: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  glass: {
    width: 11, height: 11, borderRadius: 6, borderWidth: 1.5,
    borderColor: Colors.placeholder, position: 'absolute', top: 0, left: 0,
  },
  handle: {
    position: 'absolute', bottom: 0, right: 0,
    width: 5, height: 1.5, backgroundColor: Colors.placeholder,
    borderRadius: 1, transform: [{ rotate: '45deg' }],
  },
  input: {
    flex: 1, fontFamily: FontFamily.regular,
    fontSize: FontSize.sm, color: Colors.primaryText, paddingVertical: 0,
  },
  clearBtn: {
    width: 18, height: 18, borderRadius: 9,
    backgroundColor: '#EBEBEB', alignItems: 'center', justifyContent: 'center',
  },
  clearX1: { position: 'absolute', width: 9, height: 1.5, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2: { position: 'absolute', width: 9, height: 1.5, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
});

const nr = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60, gap: Spacing.md },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0F0F5', alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.sm },
  glass: { width: 26, height: 26, borderRadius: 14, borderWidth: 2.5, borderColor: '#C0C0CC', position: 'absolute', top: 10, left: 10 },
  handle: { position: 'absolute', bottom: 11, right: 10, width: 11, height: 2.5, backgroundColor: '#C0C0CC', borderRadius: 1.5, transform: [{ rotate: '45deg' }] },
  cross1: { position: 'absolute', top: 12, left: 22, width: 10, height: 2, backgroundColor: '#D32F2F', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  cross2: { position: 'absolute', top: 12, left: 22, width: 10, height: 2, backgroundColor: '#D32F2F', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primaryText },
  sub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.placeholder, textAlign: 'center' },
  query: { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: Colors.primaryText },
  btn: { marginTop: 4, paddingHorizontal: Spacing.lg, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryText, backgroundColor: '#FFF' },
  btnTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.primaryText },
});

const ai = StyleSheet.create({
  wrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  eyeOval: { position: 'absolute', width: 14, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: '#3F51B5' },
  eyeDot:  { width: 5, height: 5, borderRadius: 3, backgroundColor: '#3F51B5' },
  penBody: { position: 'absolute', width: 9, height: 3, backgroundColor: '#FF9800', borderRadius: 1, transform: [{ rotate: '-45deg' }], top: 2, left: 1 },
  penLine: { position: 'absolute', bottom: 0, width: 8, height: 1.5, backgroundColor: '#FF9800', borderRadius: 1 },
  lidBar:  { position: 'absolute', top: 0, width: 12, height: 2, borderRadius: 1, backgroundColor: '#D32F2F' },
  binBody: { position: 'absolute', bottom: 0, width: 10, height: 10, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderWidth: 1.5, borderColor: '#D32F2F', borderTopWidth: 0 },
  binL:    { position: 'absolute', bottom: 2, left: 4, width: 1.5, height: 6, backgroundColor: '#D32F2F', borderRadius: 1 },
  binR:    { position: 'absolute', bottom: 2, right: 4, width: 1.5, height: 6, backgroundColor: '#D32F2F', borderRadius: 1 },
});
