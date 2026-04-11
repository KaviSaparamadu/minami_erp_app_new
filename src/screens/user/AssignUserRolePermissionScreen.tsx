import React, { useState } from 'react';
import {
  ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { ACTIONS, MODULES } from '../../constants/userManagementData';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';

// ─── Demo roles (mirrors CreateUserRoleScreen store in a real app) ────────────
const DEMO_ROLES = [
  { id: '1', roleName: 'Super Admin',      permCount: 54, color: '#1D4ED8' },
  { id: '2', roleName: 'HR Manager',       permCount: 6,  color: '#0891B2' },
  { id: '3', roleName: 'Finance Manager',  permCount: 6,  color: '#059669' },
  { id: '4', roleName: 'Viewer',           permCount: 9,  color: '#7C3AED' },
  { id: '5', roleName: 'Auditor',          permCount: 18, color: '#D97706' },
];

// ─── Permission grid ──────────────────────────────────────────────────────────
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
        const keys = ACTIONS.map(a => `${mod}:${a}`); const allOn = keys.every(k => selected.includes(k));
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
export function AssignUserRolePermissionScreen() {
  const [search,       setSearch]       = useState('');
  const [selectedRole, setSelectedRole] = useState<typeof DEMO_ROLES[0] | null>(null);
  const [saving,       setSaving]       = useState(false);
  const [permMap,      setPermMap]      = useState<Record<string, string[]>>({});

  const q = search.trim().toLowerCase();
  const filtered = q ? DEMO_ROLES.filter(r => r.roleName.toLowerCase().includes(q)) : DEMO_ROLES;

  function rolePerms(rid: string) { return permMap[rid] ?? []; }
  function setRolePerms(rid: string, p: string[]) { setPermMap(m => ({ ...m, [rid]: p })); }

  return (
    <SafeAreaView style={s.safe} edges={['top', 'left', 'right']}>
      <View style={s.band}>
        <PageHeader title="Role Permissions" showBack={true} />
        <View style={s.bandContent}>
          <Text style={s.bandTitle}>Assign Role Permission</Text>
          <Text style={s.bandSub}>Select a role then configure its module access</Text>
        </View>
      </View>

      <View style={s.sheet}>
        {!selectedRole ? (
          <>
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
            <Text style={s.listHint}>Tap a role to manage its permissions</Text>
            <FlatList
              data={filtered} keyExtractor={r => r.id}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const perms   = rolePerms(item.id);
                const current = perms.length > 0 ? perms.length : item.permCount;
                return (
                  <Pressable onPress={() => setSelectedRole(item)}
                    style={({ pressed }) => [s.roleRow, pressed && s.roleRowP]}>
                    <View style={[s.roleDot, { backgroundColor: item.color }]}>
                      <Text style={s.roleDotTxt}>{item.roleName.charAt(0)}</Text>
                    </View>
                    <View style={s.roleInfo}>
                      <Text style={s.roleName}>{item.roleName}</Text>
                      <Text style={s.rolePermTxt}>{current} permission{current !== 1 ? 's' : ''} assigned</Text>
                    </View>
                    {/* Mini module dots */}
                    <View style={s.moduleDots}>
                      {MODULES.slice(0,5).map(m => {
                        const hasAny = ACTIONS.some(a => rolePerms(item.id).includes(`${m}:${a}`));
                        return <View key={m} style={[s.modDot, { backgroundColor: hasAny ? item.color : '#E0E0E8' }]} />;
                      })}
                    </View>
                    <View style={s.rowArrow}><View style={s.rowArrowHead}/></View>
                  </Pressable>
                );
              }}
            />
          </>
        ) : (
          <ScrollView contentContainerStyle={s.editorWrap} keyboardShouldPersistTaps="handled">
            {/* Role header */}
            <View style={[s.selHeader, { borderLeftColor: selectedRole.color }]}>
              <View style={[s.selDot, { backgroundColor: selectedRole.color }]}>
                <Text style={s.selDotTxt}>{selectedRole.roleName.charAt(0)}</Text>
              </View>
              <View style={s.selInfo}>
                <Text style={s.selName}>{selectedRole.roleName}</Text>
                <Text style={s.selSub}>{rolePerms(selectedRole.id).length} permissions configured</Text>
              </View>
              <Pressable onPress={() => setSelectedRole(null)} style={s.backBtn}>
                <View style={s.backArrow}/><Text style={s.backTxt}>Back</Text>
              </Pressable>
            </View>

            <View style={s.permHeader}>
              <Text style={s.permTitle}>Module Access</Text>
              <View style={[s.permBadge, { backgroundColor: selectedRole.color + '18' }]}>
                <Text style={[s.permBadgeTxt, { color: selectedRole.color }]}>{rolePerms(selectedRole.id).length} selected</Text>
              </View>
            </View>

            <PermissionGrid
              selected={rolePerms(selectedRole.id)}
              onChange={p => setRolePerms(selectedRole.id, p)}
            />

            <Pressable
              disabled={saving}
              style={({ pressed }) => [s.saveBtn, { backgroundColor: selectedRole.color }, (pressed || saving) && { opacity: 0.85 }]}
              onPress={() => {
                setSaving(true);
                setTimeout(() => { setSaving(false); setSelectedRole(null); }, 700);
              }}>
              {saving
                ? <ActivityIndicator color="#FFF" size="small" />
                : <Text style={s.saveTxt}>Save Role Permissions</Text>}
            </Pressable>
            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const DARK = '#1C1C1E'; const LIGHT = '#F2F2F7'; const TEAL = '#059669';

const s = StyleSheet.create({
  safe:  { flex: 1, backgroundColor: DARK },
  band:  { backgroundColor: DARK, paddingBottom: 28 },
  bandContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  bandTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.xl, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.2 },
  bandSub:   { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: 'rgba(255,255,255,0.4)', marginTop: 3 },
  sheet: { flex: 1, backgroundColor: LIGHT, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -28, overflow: 'hidden' },
  sbWrap:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 10, gap: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0' },
  sbIcon:  { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  sbG:     { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5, borderColor: Colors.placeholder, position: 'absolute', top: 0, left: 0 },
  sbH:     { position: 'absolute', bottom: 0, right: 0, width: 5, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  sbInput: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.primaryText, paddingVertical: 0 },
  sbClear: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  xA: { position: 'absolute', width: 9, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xB: { position: 'absolute', width: 9, height: 1.5, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  listHint: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder, marginHorizontal: Spacing.lg, marginTop: 10, marginBottom: 4 },
  // Role row
  roleRow:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0F0F5', backgroundColor: '#FFF', gap: 12 },
  roleRowP: { backgroundColor: '#F5FAF8' },
  roleDot:  { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  roleDotTxt: { fontFamily: FontFamily.bold, fontSize: 16, fontWeight: FontWeight.bold, color: '#FFF' },
  roleInfo: { flex: 1, gap: 2 },
  roleName: { fontFamily: FontFamily.medium, fontSize: FontSize.md, fontWeight: FontWeight.medium, color: Colors.primaryText },
  rolePermTxt: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder },
  moduleDots: { flexDirection: 'row', gap: 3 },
  modDot:     { width: 6, height: 6, borderRadius: 3 },
  rowArrow:   { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  rowArrowHead: { width: 8, height: 8, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#C0C0C8', transform: [{ rotate: '45deg' }, { translateX: -2 }] },
  // Editor
  editorWrap: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
  selHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: Spacing.lg, padding: Spacing.md, backgroundColor: '#FFF', borderRadius: 14, borderLeftWidth: 4, borderWidth: 1, borderColor: '#EBEBEB' },
  selDot:    { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  selDotTxt: { fontFamily: FontFamily.bold, fontSize: 18, fontWeight: FontWeight.bold, color: '#FFF' },
  selInfo:   { flex: 1, gap: 2 },
  selName:   { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primaryText },
  selSub:    { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder },
  backBtn:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8' },
  backArrow: { width: 7, height: 7, borderTopWidth: 2, borderLeftWidth: 2, borderColor: Colors.primaryText, transform: [{ rotate: '-45deg' }, { translateX: 2 }] },
  backTxt:   { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.primaryText },
  permHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  permTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: Colors.primaryText },
  permBadge:  { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  permBadgeTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  saveBtn:  { marginTop: Spacing.xl, alignItems: 'center', justifyContent: 'center', borderRadius: 12, paddingVertical: 15 },
  saveTxt:  { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF' },
});

const pg = StyleSheet.create({
  wrap:   { borderRadius: 12, borderWidth: 1, borderColor: '#E5E5EA', overflow: 'hidden' },
  hRow:   { flexDirection: 'row', backgroundColor: '#FFFFFF', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#E5E5EA' },
  row:    { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  modCol: { width: 72, justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 10 },
  actCol: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10 },
  hTxt:   { fontFamily: FontFamily.bold, fontSize: 8, fontWeight: FontWeight.bold, color: Colors.placeholder, textTransform: 'uppercase', textAlign: 'center', letterSpacing: 0.4 },
  modTxt: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.primaryText },
  modTxtOn: { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: TEAL },
  cell:   { width: 18, height: 18, borderRadius: 5, borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  cellOn: { backgroundColor: TEAL, borderColor: TEAL },
  ckL:    { position: 'absolute', left: 1, bottom: 3, width: 4, height: 1.5, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  ckR:    { position: 'absolute', right: 1, bottom: 4, width: 7, height: 1.5, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '-50deg' }] },
});
