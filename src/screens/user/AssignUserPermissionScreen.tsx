import React, { useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { ACTIONS, MODULES } from '../../constants/userManagementData';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';

// ─── Demo users list (would come from CreateSystemUsersScreen store in a real app) ──
const DEMO_USERS = [
  { id: '1', name: 'Alice Fernando',  username: 'alice.f',   role: 'HR Manager' },
  { id: '2', name: 'Bob Perera',      username: 'bob.p',     role: 'Finance Officer' },
  { id: '3', name: 'Carol Silva',     username: 'carol.s',   role: 'Sales Manager' },
  { id: '4', name: 'David Wickrama',  username: 'david.w',   role: 'Viewer' },
  { id: '5', name: 'Emma Jayasekara', username: 'emma.j',    role: 'IT Manager' },
];

const AVATAR_COLORS = ['#1D4ED8', '#0891B2', '#059669', '#7C3AED', '#D97706'];

// ─── Permission grid (inline, same as CreateUserRoleScreen) ───────────────────
function PermissionGrid({ selected, onChange }: { selected: string[]; onChange(p: string[]): void }) {
  function toggle(key: string) {
    onChange(selected.includes(key) ? selected.filter(k => k !== key) : [...selected, key]);
  }
  function toggleModule(mod: string) {
    const keys = ACTIONS.map(a => `${mod}:${a}`);
    const allOn = keys.every(k => selected.includes(k));
    onChange(allOn ? selected.filter(k => !keys.includes(k)) : [...new Set([...selected, ...keys])]);
  }
  return (
    <View style={pg.wrap}>
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
              const key = `${mod}:${a}`; const on = selected.includes(key);
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

// ─── Screen ──────────────────────────────────────────────────────────────────
export function AssignUserPermissionScreen() {
  const [search,      setSearch]      = useState('');
  const [selectedUser,setSelectedUser]= useState<typeof DEMO_USERS[0] | null>(null);
  const [saving,      setSaving]      = useState(false);
  // permissions keyed by user id
  const [permMap, setPermMap] = useState<Record<string, string[]>>({});

  const q = search.trim().toLowerCase();
  const filtered = q ? DEMO_USERS.filter(u =>
    u.name.toLowerCase().includes(q) || u.username.toLowerCase().includes(q) || u.role.toLowerCase().includes(q)
  ) : DEMO_USERS;

  function userPerms(uid: string) { return permMap[uid] ?? []; }
  function setUserPerms(uid: string, perms: string[]) {
    setPermMap(m => ({ ...m, [uid]: perms }));
  }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={s.band}>
        <PageHeader title="Assign Permissions" showBack={true} />
        <View style={s.bandContent}>
          <Text style={s.bandTitle}>Assign User Permission</Text>
          <Text style={s.bandSub}>Select a user then configure their module access</Text>
        </View>
      </View>

      <View style={s.sheet}>
        {!selectedUser ? (
          // ── User list ──
          <>
            <View style={s.sbWrap}>
              <View style={s.sbIcon}><View style={s.sbG}/><View style={s.sbH}/></View>
              <TextInput value={search} onChangeText={setSearch} placeholder="Search users…"
                placeholderTextColor={Colors.placeholder} style={s.sbInput} autoCapitalize="none" />
              {search.length > 0 && (
                <Pressable onPress={() => setSearch('')} style={s.sbClear} hitSlop={8}>
                  <View style={s.xA}/><View style={s.xB}/>
                </Pressable>
              )}
            </View>
            <Text style={s.listHint}>Tap a user to manage their permissions</Text>
            <FlatList
              data={filtered}
              keyExtractor={u => u.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item, index }) => {
                const perms = userPerms(item.id);
                return (
                  <Pressable onPress={() => setSelectedUser(item)}
                    style={({ pressed }) => [s.userRow, pressed && s.userRowP]}>
                    <View style={[s.uAvatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
                      <Text style={s.uAvatarTxt}>{item.name.charAt(0)}</Text>
                    </View>
                    <View style={s.uInfo}>
                      <Text style={s.uName}>{item.name}</Text>
                      <Text style={s.uRole}>@{item.username} · {item.role}</Text>
                    </View>
                    <View style={s.uPermBadge}>
                      <Text style={s.uPermNum}>{perms.length}</Text>
                      <Text style={s.uPermLbl}>perms</Text>
                    </View>
                    <View style={s.uArrow}><View style={s.uArrowHead}/></View>
                  </Pressable>
                );
              }}
            />
          </>
        ) : (
          // ── Permission editor ──
          <ScrollView contentContainerStyle={s.editorWrap} keyboardShouldPersistTaps="handled">
            {/* Selected user header */}
            <View style={s.selHeader}>
              <View style={[s.selAvatar, { backgroundColor: AVATAR_COLORS[DEMO_USERS.indexOf(selectedUser) % AVATAR_COLORS.length] }]}>
                <Text style={s.selAvatarTxt}>{selectedUser.name.charAt(0)}</Text>
              </View>
              <View style={s.selInfo}>
                <Text style={s.selName}>{selectedUser.name}</Text>
                <Text style={s.selRole}>@{selectedUser.username} · {selectedUser.role}</Text>
              </View>
              <Pressable onPress={() => setSelectedUser(null)} style={s.selBack}>
                <View style={s.backArrow}/><Text style={s.backTxt}>Back</Text>
              </Pressable>
            </View>

            <View style={s.permHeader}>
              <Text style={s.permTitle}>Module Permissions</Text>
              <View style={s.permBadge}>
                <Text style={s.permBadgeTxt}>{userPerms(selectedUser.id).length} selected</Text>
              </View>
            </View>

            <PermissionGrid
              selected={userPerms(selectedUser.id)}
              onChange={p => setUserPerms(selectedUser.id, p)}
            />

            {/* Save button */}
            <Pressable
              disabled={saving}
              style={({ pressed }) => [s.saveBtn, (pressed || saving) && { opacity: 0.85 }]}
              onPress={() => {
                setSaving(true);
                setTimeout(() => { setSaving(false); setSelectedUser(null); }, 700);
              }}>
              {saving
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={s.saveTxt}>Save Permissions</Text>}
            </Pressable>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const DARK = '#1C1C1E'; const LIGHT = '#F2F2F7'; const ACCENT = '#1C1C1E';

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: DARK },
  band:  { backgroundColor: DARK, paddingBottom: 28 },
  bandContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  bandTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.2 },
  bandSub:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  sheet: { flex: 1, backgroundColor: LIGHT, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -28, overflow: 'hidden' },
  // Search
  sbWrap:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 10, gap: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0' },
  sbIcon:  { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  sbG:     { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.placeholder, position: 'absolute', top: 0, left: 0 },
  sbH:     { position: 'absolute', bottom: 0, right: 0, width: 5, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  sbInput: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.primaryText, paddingVertical: 0 },
  sbClear: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  xA: { position: 'absolute', width: 9, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xB: { position: 'absolute', width: 9, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  listHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder, marginHorizontal: Spacing.lg, marginTop: 10, marginBottom: 4 },
  // User row
  userRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F5', backgroundColor: '#FFF', gap: 12 },
  userRowP: { backgroundColor: '#F5F0FF' },
  uAvatar:  { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  uAvatarTxt: { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: FontWeight.bold, color: '#FFF' },
  uInfo:    { flex: 1, gap: 2 },
  uName:    { fontFamily: FontFamily.medium, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.primaryText },
  uRole:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder },
  uPermBadge: { alignItems: 'center', backgroundColor: 'rgba(21,101,192,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  uPermNum: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: ACCENT },
  uPermLbl: { fontFamily: FontFamily.regular, fontSize: 8, color: Colors.placeholder },
  uArrow:   { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  uArrowHead: { width: 8, height: 8, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#C0C0C8', transform: [{ rotate: '45deg' }, { translateX: -2 }] },
  // Editor
  editorWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  selHeader:  { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.lg, padding: Spacing.md, backgroundColor: '#FFF', borderRadius: 14, borderWidth: 1, borderColor: '#EBEBEB' },
  selAvatar:  { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  selAvatarTxt: { fontFamily: FontFamily.bold, fontSize: 17, fontWeight: FontWeight.bold, color: '#FFF' },
  selInfo:    { flex: 1, gap: 2 },
  selName:    { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primaryText },
  selRole:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder },
  selBack:    { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8' },
  backArrow:  { width: 7, height: 7, borderTopWidth: 2, borderLeftWidth: 2, borderColor: Colors.primaryText, transform: [{ rotate: '-45deg' }, { translateX: 2 }] },
  backTxt:    { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.primaryText },
  permHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  permTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primaryText },
  permBadge:  { backgroundColor: 'rgba(21,101,192,0.1)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  permBadgeTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: ACCENT },
  saveBtn: { marginTop: Spacing.xl, alignItems: 'center', justifyContent: 'center', backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 15 },
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
  ckL:    { position: 'absolute', left: 1, bottom: 3, width: 4, height: 1.5, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  ckR:    { position: 'absolute', right: 1, bottom: 4, width: 7, height: 1.5, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '-50deg' }] },
});
