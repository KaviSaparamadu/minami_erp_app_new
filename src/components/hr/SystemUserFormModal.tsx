import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GPIT_BTN from '../../../assets/images/GPIT Create Module Button.png';
import { SYSTEM_ROLES } from '../../constants/userManagementData';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { SystemUser, UserStatus } from '../../types/hr';

export type SystemUserModalMode = 'create' | 'edit' | 'view';

interface Props {
  visible: boolean;
  mode: SystemUserModalMode;
  user?: SystemUser | null;
  onClose: () => void;
  onSave: (data: Omit<SystemUser, 'id'>) => void;
}

const EMPLOYEE_NAMES = [
  'Amal Perera', 'Nimal Silva', 'Sunil Fernando', 'Kamala Jayawardena',
  'Ruwan Pathak', 'Dilani Wickramasinghe', 'Kasun Mendis', 'Thilini Rajapaksa',
  'Priya Kumari', 'Saman Bandara', 'Gayan Wijesinghe', 'Nadeesha Herath',
];

// ─── Password strength ────────────────────────────────────────────────────────
interface PasswordRule { label: string; test: (p: string) => boolean; }
const PW_RULES: PasswordRule[] = [
  { label: 'At least 6 characters',       test: p => p.length >= 6 },
  { label: 'At least one uppercase letter', test: p => /[A-Z]/.test(p) },
  { label: 'At least one lowercase letter', test: p => /[a-z]/.test(p) },
  { label: 'At least one number',           test: p => /[0-9]/.test(p) },
  { label: 'At least one special character', test: p => /[^A-Za-z0-9]/.test(p) },
];

function strengthPct(pw: string): number {
  if (!pw) return 0;
  return Math.round((PW_RULES.filter(r => r.test(pw)).length / PW_RULES.length) * 100);
}
function strengthColor(pct: number): string {
  if (pct < 40) return '#E53935';
  if (pct < 80) return '#FB8C00';
  return '#30A84B';
}

function PasswordStrength({ password }: { password: string }) {
  const pct = strengthPct(password);
  const color = strengthColor(pct);
  return (
    <View style={pw.wrap}>
      <Text style={pw.label}>Password Status</Text>
      <View style={pw.track}>
        <View style={[pw.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
      </View>
      <View style={pw.rules}>
        {PW_RULES.map(rule => {
          const met = rule.test(password);
          return (
            <Text key={rule.label} style={[pw.rule, { color: met ? '#30A84B' : '#E53935' }]}>
              {rule.label}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

// ─── Dropdown ─────────────────────────────────────────────────────────────────
function Dropdown({ label, value, options, onChange, onAfterChange, disabled, required, showActions }: {
  label: string; value: string; options: string[];
  onChange: (v: string) => void; onAfterChange?: () => void;
  disabled?: boolean; required?: boolean; showActions?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <View style={dd.wrapper}>
      <Text style={dd.label}>{required && <Text style={dd.req}>*</Text>}{label}</Text>
      <View style={dd.row}>
        <Pressable
          onPress={() => !disabled && setOpen(o => !o)}
          style={[dd.trigger, open && dd.open, disabled && dd.disabled]}>
          <Text style={[dd.value, !value && dd.placeholder]}>{value || `Select ${label}`}</Text>
          {!disabled && (
            <MaterialCommunityIcons
              name={open ? 'chevron-up' : 'chevron-down'}
              size={20} color={Colors.placeholder}
            />
          )}
        </Pressable>
        {showActions && !disabled && (
          <View style={dd.actions}>
            <Pressable style={dd.gpitBtn} hitSlop={6}>
              <Image source={GPIT_BTN} style={dd.gpitImg} resizeMode="contain" />
            </Pressable>
            <View style={dd.helpBtn}>
              <Text style={dd.helpTxt}>?</Text>
            </View>
          </View>
        )}
      </View>
      {open && (
        <View style={dd.list}>
          <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {options.map(opt => (
              <Pressable
                key={opt}
                style={[dd.opt, value === opt && dd.optActive]}
                onPress={() => {
                  onChange(opt);
                  setOpen(false);
                  setTimeout(() => onAfterChange?.(), 100);
                }}>
                <Text style={[dd.optTxt, value === opt && dd.optTxtActive]}>{opt}</Text>
                {value === opt && (
                  <View style={dd.chk}>
                    <View style={dd.chkL} /><View style={dd.chkR} />
                  </View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({ label, value, onChangeText, placeholder, secure, keyboardType, editable = true, required, onToggleSecure, showToggle, inputRef, onSubmitEditing, returnKeyType = 'next' }: {
  label: string; value: string; onChangeText?: (t: string) => void;
  placeholder?: string; secure?: boolean; keyboardType?: 'default' | 'email-address';
  editable?: boolean; required?: boolean;
  onToggleSecure?: () => void; showToggle?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
  onSubmitEditing?: () => void;
  returnKeyType?: 'next' | 'done' | 'go';
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fi.wrapper}>
      <Text style={[fi.label, focused && fi.labelFoc]}>{required && <Text style={fi.req}>*</Text>}{label}</Text>
      <View style={fi.inputRow}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.placeholder}
          secureTextEntry={secure}
          keyboardType={keyboardType ?? 'default'}
          editable={editable}
          autoCapitalize="none"
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={[fi.input, focused && fi.inputFoc, !editable && fi.inputRO]}
        />
        {showToggle && (
          <Pressable onPress={onToggleSecure} style={fi.toggle} hitSlop={8}>
            <MaterialCommunityIcons
              name={secure ? 'eye-off-outline' : 'eye-outline'}
              size={18} color={Colors.placeholder}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

// ─── Section head ─────────────────────────────────────────────────────────────
function SectionHead({ text }: { text: string }) {
  return (
    <View style={sec.row}>
      <View style={sec.bar} />
      <Text style={sec.txt}>{text}</Text>
      <View style={sec.line} />
    </View>
  );
}

// ─── Reset confirm overlay ────────────────────────────────────────────────────
function ResetConfirm({ onCancel, onConfirm }: { onCancel(): void; onConfirm(): void }) {
  return (
    <View style={rc.overlay}>
      <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} onPress={onCancel} />
      <View style={rc.card}>
        <View style={rc.topAccent} />
        <Pressable onPress={onCancel} style={({ pressed }) => [rc.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={8}>
          <MaterialCommunityIcons name="close" size={13} color="#999" />
        </Pressable>
        <View style={rc.iconRing}>
          <View style={rc.iconCircle}>
            <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
          </View>
        </View>
        <Text style={rc.title}>Reset Form?</Text>
        <Text style={rc.desc}>All entered data will be cleared.{'\n'}This action cannot be undone.</Text>
        <View style={rc.divider} />
        <View style={rc.btnRow}>
          <Pressable onPress={onCancel} style={({ pressed }) => [rc.cancelBtn, pressed && { opacity: 0.7 }]}>
            <Text style={rc.cancelTxt}>Keep Editing</Text>
          </Pressable>
          <Pressable onPress={onConfirm} style={({ pressed }) => [rc.confirmBtn, pressed && { opacity: 0.85 }]}>
            <MaterialCommunityIcons name="refresh" size={14} color="#FFF" />
            <Text style={rc.confirmTxt}>Yes, Reset</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
export function SystemUserFormModal({ visible, mode, user, onClose, onSave }: Props) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const [employeeName, setEmployeeName] = useState('');
  const [email,        setEmail]        = useState('');
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPw,       setShowPw]       = useState(false);
  const [roleName,     setRoleName]     = useState('');
  const [status,       setStatus]       = useState<UserStatus>('Active');
  const [saving,       setSaving]       = useState(false);
  const [showReset,    setShowReset]    = useState(false);

  // ── Scroll & focus refs ──
  const scrollRef   = useRef<ScrollView>(null);
  const emailRef    = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const yPos        = useRef<Record<string, number>>({});

  function scrollTo(key: string) {
    const y = yPos.current[key];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - 16), animated: true });
  }

  useEffect(() => {
    if (!visible) return;
    if (user) {
      setEmployeeName(user.fullName ?? '');
      setEmail(user.email ?? '');
      setUsername(user.username ?? '');
      setPassword('');
      setRoleName(user.roleName ?? '');
      setStatus(user.status ?? 'Active');
    } else {
      setEmployeeName(''); setEmail(''); setUsername('');
      setPassword(''); setRoleName(''); setStatus('Active');
    }
    setShowPw(false);
    setShowReset(false);
  }, [visible, user]);

  function doReset() {
    setEmployeeName(''); setEmail(''); setUsername('');
    setPassword(''); setRoleName(''); setStatus('Active');
    setShowPw(false);
  }

  function handleSave() {
    if (!employeeName) { Alert.alert('Required', 'Select an employee name.'); return; }
    if (!email.trim()) { Alert.alert('Required', 'Enter an email address.'); return; }
    if (!username.trim()) { Alert.alert('Required', 'Enter a username.'); return; }
    if (mode === 'create' && !password.trim()) { Alert.alert('Required', 'Enter a password.'); return; }
    if (!roleName) { Alert.alert('Required', 'Select a user role.'); return; }

    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({
        fullName: employeeName,
        email: email.trim(),
        username: username.trim(),
        roleName: roleName || undefined,
        status,
      });
    }, 700);
  }

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={s.overlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.cardWrapper}>
            {/* ── Floating close button ── */}
            <Pressable onPress={onClose} style={({ pressed }) => [s.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={16}>
              <View style={s.xL} /><View style={s.xR} />
            </Pressable>

            <View style={s.container}>
              {/* ── Header ── */}
              <View style={s.header}>
                <View style={s.headerIcon}>
                  <MaterialCommunityIcons name="account" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.titleTxt}>
                    {isEdit ? 'Update User' : isView ? 'View User' : 'Create User'}
                  </Text>
                </View>
                {!isView && (
                  <Pressable onPress={() => setShowReset(true)} style={({ pressed }) => [s.resetBtn, pressed && { opacity: 0.75 }]}>
                    <MaterialCommunityIcons name="refresh" size={13} color="#FFF" />
                    <Text style={s.resetTxt}>Reset Form</Text>
                  </Pressable>
                )}
              </View>

              {/* ── Form ── */}
              <ScrollView ref={scrollRef} contentContainerStyle={s.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

                <View onLayout={e => { yPos.current['employee'] = e.nativeEvent.layout.y; }}>
                  <SectionHead text="Employee" />
                  <Dropdown
                    label="Employee Name"
                    value={employeeName}
                    options={EMPLOYEE_NAMES}
                    onChange={setEmployeeName}
                    onAfterChange={() => {
                      scrollTo('accountDetails');
                      setTimeout(() => emailRef.current?.focus(), 200);
                    }}
                    disabled={isView}
                    required
                    showActions
                  />
                </View>

                <View onLayout={e => { yPos.current['accountDetails'] = e.nativeEvent.layout.y; }}>
                  <SectionHead text="Account Details" />
                  <Field
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="user@company.com"
                    keyboardType="email-address"
                    editable={!isView}
                    required
                    inputRef={emailRef}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      usernameRef.current?.focus();
                      scrollTo('username');
                    }}
                  />
                  <View onLayout={e => { yPos.current['username'] = e.nativeEvent.layout.y; }}>
                    <Field
                      label="User Name"
                      value={username}
                      onChangeText={setUsername}
                      placeholder="e.g. john.doe"
                      editable={!isView}
                      required
                      inputRef={usernameRef}
                      returnKeyType="next"
                      onSubmitEditing={() => {
                        passwordRef.current?.focus();
                        scrollTo('password');
                      }}
                    />
                  </View>
                  {!isView && (
                    <>
                      <View onLayout={e => { yPos.current['password'] = e.nativeEvent.layout.y; }}>
                        <Field
                          label="Password"
                          value={password}
                          onChangeText={setPassword}
                          placeholder="••••••••"
                          secure={!showPw}
                          editable
                          required={mode === 'create'}
                          showToggle
                          onToggleSecure={() => setShowPw(v => !v)}
                          inputRef={passwordRef}
                          returnKeyType="done"
                          onSubmitEditing={() => scrollTo('access')}
                        />
                      </View>
                      <PasswordStrength password={password} />
                    </>
                  )}
                </View>

                <View onLayout={e => { yPos.current['access'] = e.nativeEvent.layout.y; }}>
                  <SectionHead text="Access" />
                  <Dropdown
                    label="User Role"
                    value={roleName}
                    options={SYSTEM_ROLES}
                    onChange={setRoleName}
                    onAfterChange={() => scrollTo('bottom')}
                    disabled={isView}
                    required
                    showActions
                  />
                </View>

                <View onLayout={e => { yPos.current['bottom'] = e.nativeEvent.layout.y; }} style={{ height: 24 }} />
              </ScrollView>

              {/* ── Footer ── */}
              {!isView && (
                <View style={s.footer}>
                  <Pressable
                    onPress={handleSave}
                    disabled={saving}
                    style={({ pressed }) => [s.saveBtn, (pressed || saving) && { opacity: 0.85 }]}>
                    {saving
                      ? <ActivityIndicator color="#FFF" size="small" />
                      : <Text style={s.saveTxt}>{isEdit ? 'Update User' : 'Create User'}</Text>}
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </KeyboardAvoidingView>

        {showReset && (
          <ResetConfirm
            onCancel={() => setShowReset(false)}
            onConfirm={() => { setShowReset(false); doReset(); }}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK = '#595959';

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 80,
    paddingHorizontal: 12,
  },
  cardWrapper: {
    flex: 1,
    maxHeight: '94%',
    width: '100%',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    overflow: 'hidden',
  },
  closeBtn: {
    position: 'absolute', top: -18, right: -5, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 8,
  },
  xL: { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR: { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
    flexWrap: 'wrap',
  },
  headerIcon: {
    width: 38, height: 38, borderRadius: 8,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center', justifyContent: 'center',
  },
  titleTxt: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: DARK,
  },
  headerActions: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
  },
  dashLink: {
    flexDirection: 'row', alignItems: 'center', gap: 2,
  },
  dashLinkTxt: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#595959',
    textDecorationLine: 'underline',
  },
  resetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#1976D2',
    borderRadius: 16,
    paddingHorizontal: 10, paddingVertical: 5,
  },
  resetTxt: { fontFamily: FontFamily.medium, fontSize: 11, color: '#FFF' },

  form: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },

  footer: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: '#FFF',
    borderTopWidth: 1, borderTopColor: '#E5E5EA',
    gap: Spacing.sm,
  },
  cancelBtn: {
    paddingVertical: 12, paddingHorizontal: Spacing.md,
    borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8',
    backgroundColor: '#FFF', minWidth: 80, alignItems: 'center',
  },
  cancelTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.primaryText },
  saveBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: DARK, borderRadius: 10, paddingVertical: 14,
  },
  saveTxt: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#FFF',
    letterSpacing: 0.5,
  },
});

const pw = StyleSheet.create({
  wrap: { marginBottom: Spacing.md },
  label: {
    fontFamily: FontFamily.medium, fontSize: FontSize.xs,
    color: Colors.placeholder, marginBottom: 6,
  },
  track: {
    height: 6, backgroundColor: '#EEE', borderRadius: 3,
    overflow: 'hidden', marginBottom: 8,
  },
  fill: { height: 6, borderRadius: 3 },
  rules: { gap: 3 },
  rule: { fontFamily: FontFamily.regular, fontSize: 11, lineHeight: 16 },
});

const sec = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    gap: 8, marginTop: Spacing.md, marginBottom: Spacing.sm,
  },
  bar: { width: 3, height: 13, borderRadius: 2, backgroundColor: Colors.primaryHighlight },
  txt: {
    fontFamily: FontFamily.bold, fontSize: FontSize.xs,
    fontWeight: FontWeight.bold, color: Colors.placeholder,
    textTransform: 'uppercase', letterSpacing: 0.8,
  },
  line: { flex: 1, height: 1, backgroundColor: '#E8E8EE' },
});

const fi = StyleSheet.create({
  wrapper: { marginBottom: Spacing.sm },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  labelFoc: { color: Colors.primaryText },
  req: { color: Colors.primaryHighlight },
  inputRow: { flexDirection: 'row', alignItems: 'center' },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText,
    paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0', paddingHorizontal: 0,
  },
  inputFoc: { borderBottomColor: Colors.primaryText },
  inputRO: { color: Colors.placeholder, borderBottomColor: '#EAEAEA' },
  toggle: { paddingLeft: 8, paddingBottom: 4 },
});

const dd = StyleSheet.create({
  wrapper: { marginBottom: Spacing.lg, zIndex: 10 },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  req: { color: Colors.primaryHighlight },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  trigger: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0',
  },
  open: { borderBottomColor: Colors.primaryText },
  disabled: { opacity: 0.55 },
  value: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText },
  placeholder: { color: Colors.placeholder },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gpitBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  gpitImg: { width: 28, height: 28 },
  helpBtn: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#C0C0C8',
    alignItems: 'center', justifyContent: 'center',
  },
  helpTxt: {
    fontFamily: FontFamily.bold, fontSize: 10,
    fontWeight: FontWeight.bold, color: '#A0A0A8',
  },
  list: {
    backgroundColor: '#FFF', borderRadius: 12, marginTop: 4,
    borderWidth: 1, borderColor: '#E5E5EA', overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 12, elevation: 6,
  },
  opt: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: Spacing.lg, paddingVertical: 13,
    borderBottomWidth: 1, borderBottomColor: '#F5F5F5',
  },
  optActive: { backgroundColor: 'rgba(233,30,99,0.04)' },
  optTxt: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText },
  optTxtActive: { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: Colors.primaryHighlight },
  chk: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  chkL: { position: 'absolute', left: 0, bottom: 3, width: 5, height: 2, backgroundColor: Colors.primaryHighlight, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  chkR: { position: 'absolute', right: 0, bottom: 4, width: 9, height: 2, backgroundColor: Colors.primaryHighlight, borderRadius: 1, transform: [{ rotate: '-50deg' }] },
});

const rc = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 44,
  },
  card: {
    width: '100%', backgroundColor: '#FFF',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
  },
  topAccent: { height: 3, backgroundColor: '#1976D2' },
  closeBtn: {
    position: 'absolute', top: 8, right: 8, zIndex: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#F0F0F4', alignItems: 'center', justifyContent: 'center',
  },
  iconRing: { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1976D2', alignItems: 'center', justifyContent: 'center',
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
    backgroundColor: '#1976D2',
  },
  confirmTxt: { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF' },
});
