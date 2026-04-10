import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { ACTIONS, MODULES, ROLE_PRESETS } from '../../constants/userManagementData';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { UserRole } from '../../types/hr';

let nextId = 1;
const genId = () => String(nextId++);

const ROLE_COLORS = ['#1D4ED8', '#1565C0', '#00796B', '#AD1457', '#E65100', '#2E7D32'];

// ─── Permission grid ──────────────────────────────────────────────────────────
function PermissionGrid({ selected, onChange, disabled }: {
  selected: string[]; onChange(p: string[]): void; disabled?: boolean;
}) {
  function toggle(key: string) {
    if (disabled) return;
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  }
  function toggleModule(mod: string) {
    if (disabled) return;
    const keys = ACTIONS.map(a => `${mod}:${a}`);
    const allOn = keys.every(k => selected.includes(k));
    onChange(allOn ? selected.filter(k => !keys.includes(k)) : [...new Set([...selected, ...keys])]);
  }

  return (
    <View style={pg.wrap}>
      {/* Header row */}
      <View style={pg.hRow}>
        <View style={pg.modCol}><Text style={pg.hTxt}>Module</Text></View>
        {ACTIONS.map(a => <View key={a} style={pg.actCol}><Text style={pg.hTxt}>{a.slice(0,3)}</Text></View>)}
      </View>

      {MODULES.map(mod => {
        const keys = ACTIONS.map(a => `${mod}:${a}`);
        const allOn = keys.every(k => selected.includes(k));
        return (
          <View key={mod} style={pg.row}>
            <Pressable onPress={() => toggleModule(mod)} style={pg.modCol}>
              <Text style={[pg.modTxt, allOn && pg.modTxtOn]}>{mod}</Text>
            </Pressable>
            {ACTIONS.map(a => {
              const key = `${mod}:${a}`;
              const on  = selected.includes(key);
              return (
                <Pressable key={a} onPress={() => toggle(key)} style={pg.actCol} hitSlop={4}>
                  <View style={[pg.cell, on && pg.cellOn]}>
                    {on && <><View style={pg.ckL}/><View style={pg.ckR}/></>}
                  </View>
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </View>
  );
}

// ─── Role Form Modal ──────────────────────────────────────────────────────────
type Mode = 'create' | 'edit' | 'view';
function RoleFormModal({ visible, mode, role, onClose, onSave }: {
  visible: boolean; mode: Mode; role?: UserRole | null;
  onClose(): void; onSave(d: Omit<UserRole, 'id'>): void;
}) {
  const isView = mode === 'view';
  const [roleName,    setRoleName]    = useState('');
  const [description, setDescription]= useState('');
  const [permissions, setPermissions]= useState<string[]>([]);
  const [presetOpen,  setPresetOpen] = useState(false);
  const [saving,      setSaving]     = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (role) { setRoleName(role.roleName); setDescription(role.description ?? ''); setPermissions(role.permissions); }
    else       { setRoleName(''); setDescription(''); setPermissions([]); }
  }, [visible, role]);

  function applyPreset(preset: string) {
    setPermissions(ROLE_PRESETS[preset] ?? []);
    setPresetOpen(false);
  }

  function save() {
    if (!roleName.trim()) { Alert.alert('Required', 'Enter a role name.'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({ roleName: roleName.trim(), description: description.trim() || undefined, permissions });
    }, 700);
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={fm.container}>
        <View style={fm.header}>
          <View style={fm.headerIcon}>
            <View style={fm.badgeOuter}/><View style={fm.badgeClip}/><View style={fm.badgeLine}/>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={fm.title}>{mode === 'edit' ? 'Update Role' : mode === 'view' ? 'View Role' : 'Create User Role'}</Text>
            <Text style={fm.sub}>{permissions.length} permission{permissions.length !== 1 ? 's' : ''} assigned</Text>
          </View>
          <Pressable onPress={onClose} style={fm.closeBtn} hitSlop={12}>
            <View style={fm.xL}/><View style={fm.xR}/>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={fm.form} keyboardShouldPersistTaps="handled">
          {/* Role name */}
          <View style={fm.fieldWrap}>
            <Text style={fm.fieldLabel}><Text style={fm.req}>*</Text>Role Name</Text>
            <TextInput value={roleName} onChangeText={setRoleName} placeholder="e.g. HR Manager"
              placeholderTextColor={Colors.placeholder} editable={!isView}
              style={[fm.fieldInput, !isView && fm.fieldActive]} />
          </View>
          <View style={fm.fieldWrap}>
            <Text style={fm.fieldLabel}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} placeholder="What can this role do?"
              placeholderTextColor={Colors.placeholder} editable={!isView} multiline
              style={[fm.fieldInput, !isView && fm.fieldActive, { minHeight: 56 }]} />
          </View>

          {/* Preset picker */}
          {!isView && (
            <View style={fm.presetWrap}>
              <Text style={fm.presetLbl}>Quick-fill from preset</Text>
              <Pressable onPress={() => setPresetOpen(o => !o)} style={fm.presetTrigger}>
                <Text style={fm.presetVal}>Apply a permission preset…</Text>
                <View style={[fm.chev, presetOpen && fm.chevUp]}><View style={fm.cL}/><View style={fm.cR}/></View>
              </Pressable>
              {presetOpen && (
                <View style={fm.presetList}>
                  <ScrollView style={{ maxHeight: 140 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {Object.keys(ROLE_PRESETS).map(p => (
                      <Pressable key={p} onPress={() => applyPreset(p)} style={fm.presetOpt}>
                        <Text style={fm.presetOptTxt}>{p}</Text>
                        <Text style={fm.presetOptCnt}>{ROLE_PRESETS[p].length} permissions</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          {/* Permission grid */}
          <View style={fm.gridSection}>
            <View style={fm.gridHeader}>
              <Text style={fm.gridTitle}>Permissions</Text>
              {!isView && (
                <View style={fm.gridBadge}><Text style={fm.gridBadgeTxt}>{permissions.length} selected</Text></View>
              )}
            </View>
            <PermissionGrid selected={permissions} onChange={setPermissions} disabled={isView} />
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>

        <View style={fm.footer}>
          <Pressable onPress={onClose} style={fm.cancelBtn}><Text style={fm.cancelTxt}>Cancel</Text></Pressable>
          {!isView && (
            <Pressable onPress={save} disabled={saving} style={({ pressed }) => [fm.saveBtn, (pressed || saving) && { opacity: 0.85 }]}>
              {saving
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={fm.saveTxt}>{mode === 'edit' ? 'Update Role' : 'Create Role'}</Text>}
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Role row ─────────────────────────────────────────────────────────────────
function RoleRow({ role, index, onView, onEdit, onDelete }: {
  role: UserRole; index: number;
  onView(): void; onEdit(): void; onDelete(): void;
}) {
  return (
    <View style={[tr.row, index % 2 === 0 && tr.rowEven]}>
      <View style={tr.colIdx}><Text style={tr.idx}>{index + 1}</Text></View>
      <View style={tr.colName}>
        <View style={[tr.colorDot, { backgroundColor: ROLE_COLORS[index % ROLE_COLORS.length] }]}>
          <Text style={tr.dotTxt}>{role.roleName.charAt(0)}</Text>
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={tr.name} numberOfLines={1}>{role.roleName}</Text>
          {role.description ? <Text style={tr.desc} numberOfLines={1}>{role.description}</Text> : null}
        </View>
      </View>
      <View style={tr.colPerm}>
        <View style={tr.permBadge}><Text style={tr.permTxt}>{role.permissions.length}</Text></View>
        <Text style={tr.permLbl}>perms</Text>
      </View>
      <View style={tr.colAct}>
        <Pressable onPress={onView}   style={[tr.btn, tr.bView]}   hitSlop={6}><View style={tr.eyeO}/><View style={tr.eyeD}/></Pressable>
        <Pressable onPress={onEdit}   style={[tr.btn, tr.bEdit]}   hitSlop={6}><View style={tr.pen}/><View style={tr.penL}/></Pressable>
        <Pressable onPress={onDelete} style={[tr.btn, tr.bDel]}    hitSlop={6}><View style={tr.lid}/><View style={tr.bin}/></Pressable>
      </View>
    </View>
  );
}

// ─── Screen ──────────────────────────────────────────────────────────────────
export function CreateUserRoleScreen() {
  const [roles,    setRoles]    = useState<UserRole[]>([]);
  const [search,   setSearch]   = useState('');
  const [modal,    setModal]    = useState(false);
  const [mode,     setMode]     = useState<Mode>('create');
  const [selected, setSelected] = useState<UserRole | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = q ? roles.filter(r => r.roleName.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q)) : roles;

  function openCreate() { setSelected(null); setMode('create'); setModal(true); }
  function openEdit(r: UserRole)  { setSelected(r); setMode('edit');   setModal(true); }
  function openView(r: UserRole)  { setSelected(r); setMode('view');   setModal(true); }
  function del(r: UserRole) {
    Alert.alert('Delete Role', `Remove "${r.roleName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setRoles(p => p.filter(x => x.id !== r.id)) },
    ]);
  }
  function save(data: Omit<UserRole, 'id'>) {
    if (mode === 'create') setRoles(p => [...p, { ...data, id: genId() }]);
    else setRoles(p => p.map(x => x.id === selected?.id ? { ...data, id: x.id } : x));
    setModal(false);
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={s.band}>
        <PageHeader title="User Roles" showBack={true} />
        <View style={s.statsRow}>
          {[['Total Roles', roles.length], ['Permissions', roles.reduce((a, r) => a + r.permissions.length, 0)]].map(([l, v]) => (
            <View key={l} style={s.chip}><Text style={s.chipV}>{v}</Text><Text style={s.chipL}>{l}</Text></View>
          ))}
        </View>
      </View>

      <View style={s.sheet}>
        {roles.length > 0 && (
          <View style={s.sbWrap}>
            <View style={s.sbIcon}><View style={s.sbG}/><View style={s.sbH}/></View>
            <TextInput value={search} onChangeText={setSearch} placeholder="Search roles…"
              placeholderTextColor={Colors.placeholder} style={s.sbInput} autoCapitalize="none" />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch('')} style={s.sbClear} hitSlop={8}>
                <View style={s.xA}/><View style={s.xB}/>
              </Pressable>
            )}
          </View>
        )}

        {filtered.length > 0 && (
          <View style={s.thRow}>
            <View style={s.thIdx}><Text style={s.thTxt}>#</Text></View>
            <View style={s.thName}><Text style={s.thTxt}>Role</Text></View>
            <View style={s.thPerm}><Text style={s.thTxt}>Perms</Text></View>
            <View style={s.thAct}><Text style={[s.thTxt,{textAlign:'center'}]}>Actions</Text></View>
          </View>
        )}

        {roles.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIcon}><View style={s.eBadge}/><View style={s.eLine1}/><View style={s.eLine2}/></View>
            <Text style={s.emptyTitle}>No roles defined yet</Text>
            <Text style={s.emptySub}>Tap + to create the first role</Text>
            <Pressable onPress={openCreate} style={s.emptyBtn}><Text style={s.emptyBtnTxt}>+ Create Role</Text></Pressable>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No results for "{search}"</Text>
            <Pressable onPress={() => setSearch('')} style={s.emptyBtn}><Text style={s.emptyBtnTxt}>Clear</Text></Pressable>
          </View>
        ) : (
          <FlatList data={filtered} keyExtractor={r => r.id}
            renderItem={({ item, index }) => (
              <RoleRow role={item} index={index}
                onView={() => openView(item)} onEdit={() => openEdit(item)} onDelete={() => del(item)} />
            )}
            showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} />
        )}

        <Pressable onPress={openCreate} style={({ pressed }) => [s.fab, pressed && s.fabP]}>
          <View style={s.fabH}/><View style={s.fabV}/>
        </Pressable>
      </View>

      <RoleFormModal visible={modal} mode={mode} role={selected} onClose={() => setModal(false)} onSave={save} />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK = '#1C1C1E'; const LIGHT = '#F2F2F7'; const ACCENT = Colors.primaryHighlight;

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: DARK },
  band:  { backgroundColor: DARK, paddingBottom: 24 },
  sheet: { flex: 1, backgroundColor: LIGHT, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -28, overflow: 'hidden' },
  statsRow: { flexDirection: 'row', gap: 8, paddingHorizontal: Spacing.lg, paddingTop: 8 },
  chip:  { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', minWidth: 80 },
  chipV: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF' },
  chipL: { fontFamily: FontFamily.regular, fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  sbWrap:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 10, gap: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0' },
  sbIcon:   { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  sbG:  { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.placeholder, position: 'absolute', top: 0, left: 0 },
  sbH:  { position: 'absolute', bottom: 0, right: 0, width: 5, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  sbInput:  { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.primaryText, paddingVertical: 0 },
  sbClear:  { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  xA: { position: 'absolute', width: 9, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xB: { position: 'absolute', width: 9, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  thRow:  { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: '#FFF', borderBottomWidth: 1.5, borderBottomColor: '#E8E8F0' },
  thTxt:  { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: FontWeight.bold, color: Colors.placeholder, textTransform: 'uppercase', letterSpacing: 0.6 },
  thIdx: { width: 28 }, thName: { flex: 1 }, thPerm: { width: 60 }, thAct: { width: 96 },
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 },
  emptyIcon:  { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(94,53,177,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  eBadge: { position: 'absolute', width: 28, height: 34, borderRadius: 6, backgroundColor: 'rgba(94,53,177,0.3)' },
  eLine1: { position: 'absolute', top: 22, width: 16, height: 3, borderRadius: 1.5, backgroundColor: ACCENT },
  eLine2: { position: 'absolute', top: 29, width: 10, height: 3, borderRadius: 1.5, backgroundColor: ACCENT, opacity: 0.5 },
  emptyTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primaryText },
  emptySub:    { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.placeholder },
  emptyBtn:    { marginTop: 4, backgroundColor: ACCENT, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#FFF' },
  fab:  { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 10 },
  fabP: { transform: [{ scale: 0.93 }], opacity: 0.88 },
  fabH: { position: 'absolute', width: 24, height: 3, borderRadius: 1.5, backgroundColor: '#FFF' },
  fabV: { position: 'absolute', width: 3, height: 24, borderRadius: 1.5, backgroundColor: '#FFF' },
});

const tr = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5', backgroundColor: '#FFF' },
  rowEven: { backgroundColor: '#FAFAFA' },
  colIdx:  { width: 28 }, colName: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  colPerm: { width: 60, flexDirection: 'row', alignItems: 'center', gap: 4 }, colAct: { width: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  idx:     { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder },
  colorDot:{ width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  dotTxt:  { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: FontWeight.bold, color: '#FFF' },
  name:    { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.primaryText },
  desc:    { fontFamily: FontFamily.regular, fontSize: 10, color: Colors.placeholder },
  permBadge: { backgroundColor: 'rgba(94,53,177,0.1)', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  permTxt:   { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: FontWeight.bold, color: ACCENT },
  permLbl:   { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  btn:   { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  bView: { backgroundColor: 'rgba(63,81,181,0.1)' }, bEdit: { backgroundColor: 'rgba(255,152,0,0.1)' }, bDel: { backgroundColor: 'rgba(211,47,47,0.1)' },
  eyeO:  { position: 'absolute', width: 14, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: '#3F51B5' },
  eyeD:  { width: 5, height: 5, borderRadius: 3, backgroundColor: '#3F51B5' },
  pen:   { position: 'absolute', width: 9, height: 3, backgroundColor: '#FF9800', borderRadius: 1, transform: [{ rotate: '-45deg' }], top: 4, left: 3 },
  penL:  { position: 'absolute', bottom: 2, width: 8, height: 1.5, backgroundColor: '#FF9800', borderRadius: 1 },
  lid:   { position: 'absolute', top: 2, width: 12, height: 2, borderRadius: 1, backgroundColor: '#D32F2F' },
  bin:   { position: 'absolute', bottom: 2, width: 10, height: 10, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderWidth: 1.5, borderColor: '#D32F2F', borderTopWidth: 0 },
});

const fm = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'ios' ? 56 : 22, paddingBottom: Spacing.md, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  headerIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  badgeOuter: { position: 'absolute', width: 20, height: 24, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.9)' },
  badgeClip:  { position: 'absolute', top: 5, width: 7, height: 4, borderRadius: 2, backgroundColor: 'rgba(94,53,177,0.5)' },
  badgeLine:  { position: 'absolute', bottom: 9, width: 12, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.6)' },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: DARK },
  sub:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F5', alignItems: 'center', justifyContent: 'center' },
  xL: { position: 'absolute', width: 14, height: 2, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR: { position: 'absolute', width: 14, height: 2, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  form: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  fieldWrap:  { marginBottom: Spacing.lg },
  fieldLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  req:        { color: ACCENT },
  fieldInput: { fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText, paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#EAEAEA', paddingHorizontal: 0 },
  fieldActive:{ borderBottomColor: '#D0D0D0' },
  presetWrap: { marginBottom: Spacing.lg, zIndex: 20 },
  presetLbl:  { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  presetTrigger: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0' },
  presetVal:  { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.placeholder },
  chev: { width: 18, height: 10, alignItems: 'center', justifyContent: 'center' }, chevUp: { transform: [{ rotate: '180deg' }] },
  cL: { position: 'absolute', left: 0, width: 9, height: 2, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '35deg' }, { translateY: -1 }] },
  cR: { position: 'absolute', right: 0, width: 9, height: 2, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '-35deg' }, { translateY: -1 }] },
  presetList: { backgroundColor: '#FFF', borderRadius: 12, marginTop: 4, borderWidth: 1, borderColor: '#E5E5EA', overflow: 'hidden', elevation: 6 },
  presetOpt:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  presetOptTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.primaryText },
  presetOptCnt: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder },
  gridSection: { marginTop: Spacing.md },
  gridHeader:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  gridTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primaryText },
  gridBadge:   { backgroundColor: 'rgba(94,53,177,0.1)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  gridBadgeTxt:{ fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: ACCENT },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E5EA', gap: Spacing.sm },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: Spacing.md, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', backgroundColor: '#FFF', minWidth: 80, alignItems: 'center' },
  cancelTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.primaryText },
  saveBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT, borderRadius: 10, paddingVertical: 14 },
  saveTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF' },
});

const pg = StyleSheet.create({
  wrap:   { borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA', overflow: 'hidden' },
  hRow:   { flexDirection: 'row', backgroundColor: '#F5F5F7', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  row:    { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  modCol: { width: 72, justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 10 },
  actCol: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  hTxt:   { fontFamily: FontFamily.bold, fontSize: 8, fontWeight: FontWeight.bold, color: Colors.placeholder, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.4 },
  modTxt: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.primaryText },
  modTxtOn: { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: ACCENT },
  cell:   { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  cellOn: { backgroundColor: ACCENT, borderColor: ACCENT },
  ckL: { position: 'absolute', left: 1, bottom: 3, width: 4, height: 1.5, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  ckR: { position: 'absolute', right: 1, bottom: 4, width: 7, height: 1.5, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '-50deg' }] },
});
