import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, FlatList, Modal, Platform, Pressable,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { DEPARTMENTS } from '../../constants/employeeData';
import { SYSTEM_ROLES } from '../../constants/userManagementData';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { SystemUser, UserStatus } from '../../types/hr';

let nextId = 1;
const genId = () => String(nextId++);

const AVATAR_COLORS = ['#1D4ED8', '#1565C0', '#00796B', '#AD1457', '#E65100', '#2E7D32'];
const STATUS_COLORS: Record<UserStatus, string> = { Active: '#30A84B', Inactive: '#E53935' };

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Avatar({ name, idx }: { name: string; idx: number }) {
  return (
    <View style={[av.circle, { backgroundColor: AVATAR_COLORS[idx % AVATAR_COLORS.length] }]}>
      <Text style={av.letter}>{name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

// ─── Dropdown ────────────────────────────────────────────────────────────────
function Dropdown({ label, value, options, onChange, disabled, required }: {
  label: string; value: string; options: string[]; onChange(v: string): void;
  disabled?: boolean; required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={dd.wrap}>
      <Text style={dd.label}>{required && <Text style={dd.req}>*</Text>}{label}</Text>
      <Pressable onPress={() => !disabled && setOpen(o => !o)}
        style={[dd.trigger, open && dd.open, disabled && dd.disabled]}>
        <Text style={[dd.val, !value && dd.ph]}>{value || `Select ${label}`}</Text>
        {!disabled && <View style={[dd.chev, open && dd.chevUp]}><View style={dd.cL} /><View style={dd.cR} /></View>}
      </Pressable>
      {open && (
        <View style={dd.list}>
          <ScrollView style={{ maxHeight: 150 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {options.map(o => (
              <Pressable key={o} onPress={() => { onChange(o); setOpen(false); }}
                style={[dd.opt, value === o && dd.optActive]}>
                <Text style={[dd.optTxt, value === o && dd.optTxtA]}>{o}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, secure, keyboardType, editable = true, required }: {
  label: string; value: string; onChange?(t: string): void;
  placeholder?: string; secure?: boolean; keyboardType?: 'default' | 'email-address';
  editable?: boolean; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fi.wrap}>
      <Text style={[fi.label, focused && fi.labelF]}>{required && <Text style={fi.req}>*</Text>}{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder}
        placeholderTextColor={Colors.placeholder} secureTextEntry={secure}
        keyboardType={keyboardType ?? 'default'} editable={editable}
        autoCapitalize="none"
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        style={[fi.input, focused && fi.inputF, !editable && fi.inputRO]} />
    </View>
  );
}

// ─── Status toggle ────────────────────────────────────────────────────────────
function StatusToggle({ value, onChange, disabled }: { value: UserStatus; onChange(s: UserStatus): void; disabled?: boolean }) {
  return (
    <View style={st.wrap}>
      <Text style={st.label}>Status</Text>
      <View style={st.row}>
        {(['Active', 'Inactive'] as UserStatus[]).map(s => (
          <Pressable key={s} onPress={() => !disabled && onChange(s)}
            style={[st.btn, value === s && { backgroundColor: STATUS_COLORS[s] + '22', borderColor: STATUS_COLORS[s] }]}>
            <View style={[st.dot, { backgroundColor: STATUS_COLORS[s] }]} />
            <Text style={[st.txt, value === s && { color: STATUS_COLORS[s], fontFamily: FontFamily.bold, fontWeight: FontWeight.bold }]}>{s}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

// ─── Section head ─────────────────────────────────────────────────────────────
function SectionHead({ text }: { text: string }) {
  return (
    <View style={sh.row}><View style={sh.bar} /><Text style={sh.txt}>{text}</Text><View style={sh.line} /></View>
  );
}

// ─── User Form Modal ──────────────────────────────────────────────────────────
type Mode = 'create' | 'edit' | 'view';
function UserFormModal({ visible, mode, user, onClose, onSave }: {
  visible: boolean; mode: Mode; user?: SystemUser | null;
  onClose(): void; onSave(d: Omit<SystemUser, 'id'>): void;
}) {
  const isView = mode === 'view';
  const [username,   setUsername]   = useState('');
  const [fullName,   setFullName]   = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [roleName,   setRoleName]   = useState('');
  const [department, setDepartment] = useState('');
  const [status,     setStatus]     = useState<UserStatus>('Active');
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    if (!visible) return;
    if (user) {
      setUsername(user.username); setFullName(user.fullName);
      setEmail(user.email); setPassword('');
      setRoleName(user.roleName ?? ''); setDepartment(user.department ?? '');
      setStatus(user.status);
    } else {
      setUsername(''); setFullName(''); setEmail(''); setPassword('');
      setRoleName(''); setDepartment(''); setStatus('Active');
    }
  }, [visible, user]);

  function save() {
    if (!username.trim()) { Alert.alert('Required', 'Enter a username.'); return; }
    if (!fullName.trim())  { Alert.alert('Required', 'Enter full name.'); return; }
    if (!email.trim())     { Alert.alert('Required', 'Enter email address.'); return; }
    if (mode === 'create' && !password.trim()) { Alert.alert('Required', 'Enter a password.'); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({ username: username.trim(), fullName: fullName.trim(), email: email.trim(),
        roleName: roleName || undefined, department: department || undefined, status });
    }, 700);
  }

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <View style={fm.container}>
        {/* Header */}
        <View style={fm.header}>
          <View style={fm.headerIcon}>
            <View style={fm.hHead} /><View style={fm.hBody} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={fm.title}>{mode === 'edit' ? 'Update User' : mode === 'view' ? 'View User' : 'Create System User'}</Text>
            <Text style={fm.sub}>System access account</Text>
          </View>
          <Pressable onPress={onClose} style={fm.closeBtn} hitSlop={12}>
            <View style={fm.xL} /><View style={fm.xR} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={fm.form} keyboardShouldPersistTaps="handled">
          <SectionHead text="Credentials" />
          <Field label="Username" value={username} onChange={setUsername} placeholder="e.g. john.doe" required editable={!isView} />
          {!isView && <Field label={mode === 'edit' ? 'New Password (leave blank to keep)' : 'Password'} value={password} onChange={setPassword} placeholder="••••••••" secure required={mode === 'create'} />}

          <SectionHead text="Personal Info" />
          <Field label="Full Name" value={fullName} onChange={setFullName} placeholder="Full display name" required editable={!isView} />
          <Field label="Email Address" value={email} onChange={setEmail} placeholder="user@company.com" keyboardType="email-address" required editable={!isView} />

          <SectionHead text="Role & Access" />
          <Dropdown label="Role" value={roleName} options={SYSTEM_ROLES} onChange={setRoleName} disabled={isView} />
          <Dropdown label="Department" value={department} options={DEPARTMENTS} onChange={setDepartment} disabled={isView} />
          <StatusToggle value={status} onChange={setStatus} disabled={isView} />
          <View style={{ height: 24 }} />
        </ScrollView>

        <View style={fm.footer}>
          <Pressable onPress={onClose} style={fm.cancelBtn}><Text style={fm.cancelTxt}>Cancel</Text></Pressable>
          {!isView && (
            <Pressable onPress={save} disabled={saving} style={({ pressed }) => [fm.saveBtn, (pressed || saving) && { opacity: 0.85 }]}>
              {saving
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={fm.saveTxt}>{mode === 'edit' ? 'Update User' : 'Create User'}</Text>}
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function UserRow({ user, index, onView, onEdit, onDelete }: {
  user: SystemUser; index: number;
  onView(): void; onEdit(): void; onDelete(): void;
}) {
  return (
    <View style={[tr.row, index % 2 === 0 && tr.rowEven]}>
      <View style={tr.colIdx}><Text style={tr.idx}>{index + 1}</Text></View>
      <View style={tr.colName}>
        <Avatar name={user.fullName} idx={index} />
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={tr.name} numberOfLines={1}>{user.fullName}</Text>
          <Text style={tr.uname} numberOfLines={1}>@{user.username}</Text>
        </View>
      </View>
      <View style={tr.colMeta}>
        <Text style={tr.role} numberOfLines={1}>{user.roleName ?? '—'}</Text>
        <View style={[tr.statusDot, { backgroundColor: STATUS_COLORS[user.status] }]} />
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
export function CreateSystemUsersScreen() {
  const [users,   setUsers]   = useState<SystemUser[]>([]);
  const [search,  setSearch]  = useState('');
  const [modal,   setModal]   = useState(false);
  const [mode,    setMode]    = useState<Mode>('create');
  const [selected,setSelected]= useState<SystemUser | null>(null);

  const q = search.trim().toLowerCase();
  const filtered = q ? users.filter(u =>
    [u.fullName, u.username, u.email, u.roleName, u.department].some(v => v?.toLowerCase().includes(q))
  ) : users;

  function openCreate() { setSelected(null); setMode('create'); setModal(true); }
  function openEdit(u: SystemUser) { setSelected(u); setMode('edit'); setModal(true); }
  function openView(u: SystemUser) { setSelected(u); setMode('view'); setModal(true); }
  function del(u: SystemUser) {
    Alert.alert('Delete User', `Remove "${u.fullName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setUsers(p => p.filter(x => x.id !== u.id)) },
    ]);
  }
  function save(data: Omit<SystemUser, 'id'>) {
    if (mode === 'create') setUsers(p => [...p, { ...data, id: genId() }]);
    else setUsers(p => p.map(x => x.id === selected?.id ? { ...data, id: x.id } : x));
    setModal(false);
  }

  const active   = users.filter(u => u.status === 'Active').length;
  const inactive = users.filter(u => u.status === 'Inactive').length;

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={s.band}>
        <PageHeader title="System Users" showBack={true} />
        <View style={s.statsRow}>
          {[['Total', users.length], ['Active', active], ['Inactive', inactive]].map(([l, v]) => (
            <View key={l} style={s.chip}><Text style={s.chipV}>{v}</Text><Text style={s.chipL}>{l}</Text></View>
          ))}
        </View>
      </View>

      <View style={s.sheet}>
        {users.length > 0 && (
          <View style={s.sbWrap}>
            <View style={s.sbIcon}><View style={s.sbGlass}/><View style={s.sbHandle}/></View>
            <TextInput value={search} onChangeText={setSearch} placeholder="Search users…"
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
            <View style={s.thName}><Text style={s.thTxt}>User</Text></View>
            <View style={s.thMeta}><Text style={s.thTxt}>Role</Text></View>
            <View style={s.thAct}><Text style={[s.thTxt,{textAlign:'center'}]}>Actions</Text></View>
          </View>
        )}

        {users.length === 0 ? (
          <View style={s.empty}>
            <View style={s.emptyIcon}><View style={s.eHead}/><View style={s.eBody}/><View style={s.ePlus}/><View style={s.ePlusV}/></View>
            <Text style={s.emptyTitle}>No system users yet</Text>
            <Text style={s.emptySub}>Tap + to create the first account</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>No results for "{search}"</Text>
            <Pressable onPress={() => setSearch('')} style={s.emptyBtn}><Text style={s.emptyBtnTxt}>Clear</Text></Pressable>
          </View>
        ) : (
          <FlatList data={filtered} keyExtractor={u => u.id}
            renderItem={({ item, index }) => (
              <UserRow user={item} index={index}
                onView={() => openView(item)} onEdit={() => openEdit(item)} onDelete={() => del(item)} />
            )}
            showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }} />
        )}

        <Pressable onPress={openCreate} style={({ pressed }) => [s.fab, pressed && s.fabP]}>
          <View style={s.fabH}/><View style={s.fabV}/>
        </Pressable>
      </View>

      <UserFormModal visible={modal} mode={mode} user={selected} onClose={() => setModal(false)} onSave={save} />
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
  chip:  { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, alignItems: 'center', minWidth: 64 },
  chipV: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF' },
  chipL: { fontFamily: FontFamily.regular, fontSize: 9, color: 'rgba(255,255,255,0.4)', marginTop: 1 },
  // search
  sbWrap:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 10, gap: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0' },
  sbIcon:   { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  sbGlass:  { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.placeholder, position: 'absolute', top: 0, left: 0 },
  sbHandle: { position: 'absolute', bottom: 0, right: 0, width: 5, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  sbInput:  { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.primaryText, paddingVertical: 0 },
  sbClear:  { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  xA: { position: 'absolute', width: 9, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xB: { position: 'absolute', width: 9, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  // table header
  thRow:  { flexDirection: 'row', paddingHorizontal: Spacing.md, paddingVertical: 8, backgroundColor: '#FFF', borderBottomWidth: 1.5, borderBottomColor: '#E8E8F0' },
  thTxt:  { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: FontWeight.bold, color: Colors.placeholder, textTransform: 'uppercase', letterSpacing: 0.6 },
  thIdx:  { width: 28 }, thName: { flex: 1 }, thMeta: { width: 90 }, thAct: { width: 96 },
  // empty
  empty:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 },
  emptyIcon:  { width: 72, height: 72, borderRadius: 36, backgroundColor: 'rgba(94,53,177,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  eHead:  { position: 'absolute', top: 12, width: 18, height: 18, borderRadius: 9, backgroundColor: 'rgba(94,53,177,0.35)' },
  eBody:  { position: 'absolute', bottom: 14, width: 28, height: 16, borderTopLeftRadius: 14, borderTopRightRadius: 14, backgroundColor: 'rgba(94,53,177,0.35)' },
  ePlus:  { position: 'absolute', bottom: 10, right: 8, width: 14, height: 3, borderRadius: 1.5, backgroundColor: '#1C1C1E' },
  ePlusV: { position: 'absolute', bottom: 4, right: 14, width: 3, height: 14, borderRadius: 1.5, backgroundColor: '#1C1C1E' },
  emptyTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.primaryText },
  emptySub:    { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.placeholder, textAlign: 'center' },
  emptyBtn:    { marginTop: 4, backgroundColor: '#1C1C1E', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12 },
  emptyBtnTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#FFF' },
  // FAB
  fab:  { position: 'absolute', bottom: 28, right: 20, width: 56, height: 56, borderRadius: 28, backgroundColor: ACCENT, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 10 },
  fabP: { transform: [{ scale: 0.93 }], opacity: 0.88 },
  fabH: { position: 'absolute', width: 24, height: 3, borderRadius: 1.5, backgroundColor: '#FFF' },
  fabV: { position: 'absolute', width: 3, height: 24, borderRadius: 1.5, backgroundColor: '#FFF' },
});

const av = StyleSheet.create({
  circle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  letter: { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: FontWeight.bold, color: '#FFF' },
});

const tr = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5', backgroundColor: '#FFF' },
  rowEven:{ backgroundColor: '#FAFAFA' },
  colIdx: { width: 28 }, colName: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  colMeta:{ width: 90, flexDirection: 'row', alignItems: 'center', gap: 6 }, colAct: { width: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  idx:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder },
  name:  { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: Colors.primaryText },
  uname: { fontFamily: FontFamily.regular, fontSize: 10, color: Colors.placeholder },
  role:  { fontFamily: FontFamily.regular, fontSize: 10, color: Colors.placeholder, flex: 1 },
  statusDot: { width: 7, height: 7, borderRadius: 4, flexShrink: 0 },
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'ios' ? 56 : 22, paddingBottom: Spacing.md, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  headerIcon: { width: 38, height: 38, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  hHead: { position: 'absolute', top: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' },
  hBody: { position: 'absolute', bottom: 7, width: 18, height: 10, borderTopLeftRadius: 9, borderTopRightRadius: 9, backgroundColor: '#FFF' },
  title: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: DARK },
  sub:   { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder, marginTop: 2 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F5', alignItems: 'center', justifyContent: 'center' },
  xL: { position: 'absolute', width: 14, height: 2, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR: { position: 'absolute', width: 14, height: 2, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  form: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E5EA', gap: Spacing.sm },
  cancelBtn: { paddingVertical: 12, paddingHorizontal: Spacing.md, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', backgroundColor: '#FFF', minWidth: 80, alignItems: 'center' },
  cancelTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.primaryText },
  saveBtn: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#595959', borderRadius: 10, paddingVertical: 14 },
  saveTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF' },
});

const dd = StyleSheet.create({
  wrap: { marginBottom: Spacing.lg, zIndex: 10 },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  req:  { color: ACCENT },
  trigger: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0' },
  open: { borderBottomColor: Colors.primaryText }, disabled: { opacity: 0.55 },
  val:  { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText },
  ph:   { color: Colors.placeholder },
  chev: { width: 18, height: 10, alignItems: 'center', justifyContent: 'center' }, chevUp: { transform: [{ rotate: '180deg' }] },
  cL: { position: 'absolute', left: 0, width: 9, height: 2, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '35deg' }, { translateY: -1 }] },
  cR: { position: 'absolute', right: 0, width: 9, height: 2, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '-35deg' }, { translateY: -1 }] },
  list: { backgroundColor: '#FFF', borderRadius: 12, marginTop: 4, borderWidth: 1, borderColor: '#E5E5EA', overflow: 'hidden', elevation: 6 },
  opt: { paddingHorizontal: Spacing.lg, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  optActive: { backgroundColor: 'rgba(94,53,177,0.05)' },
  optTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText },
  optTxtA: { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: '#1D4ED8' },
});

const fi = StyleSheet.create({
  wrap: { marginBottom: Spacing.lg },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  labelF: { color: Colors.primaryText }, req: { color: ACCENT },
  input: { fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText, paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0', paddingHorizontal: 0 },
  inputF: { borderBottomColor: Colors.primaryText }, inputRO: { color: Colors.placeholder, borderBottomColor: '#EAEAEA' },
});

const st = StyleSheet.create({
  wrap: { marginBottom: Spacing.lg },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 8 },
  row:  { flexDirection: 'row', gap: 10 },
  btn:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 10, borderWidth: 1.5, borderColor: '#D0D0D8', backgroundColor: '#F8F8FC' },
  dot:  { width: 7, height: 7, borderRadius: 4 },
  txt:  { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.placeholder },
});

const sh = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.xl, marginBottom: Spacing.md },
  bar: { width: 3, height: 13, borderRadius: 2, backgroundColor: Colors.primaryHighlight },
  txt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.placeholder, textTransform: 'uppercase', letterSpacing: 0.8 },
  line: { flex: 1, height: 1, backgroundColor: '#E8E8EE' },
});
