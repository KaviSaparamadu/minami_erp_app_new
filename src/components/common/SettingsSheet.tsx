import React, { useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontFamily, FontWeight, Spacing } from '../../constants/theme';
import { useTheme } from '../../context/ThemeContext';

interface SettingsSheetProps {
  visible:  boolean;
  onClose:  () => void;
}

// ─── Animated toggle ──────────────────────────────────────────────────────────
function Toggle({ value, onToggle }: { value: boolean; onToggle: () => void }) {
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  function handlePress() {
    Animated.spring(anim, {
      toValue: value ? 0 : 1,
      useNativeDriver: true,
      bounciness: 5,
    }).start();
    onToggle();
  }

  const thumbX = anim.interpolate({ inputRange: [0, 1], outputRange: [3, 24] });
  const trackBg = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.12)', '#E91E63'],
  });

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      hitSlop={8}>
      <Animated.View style={[tog.track, { backgroundColor: trackBg }]}>
        <Animated.View style={[tog.thumb, { transform: [{ translateX: thumbX }] }]} />
      </Animated.View>
    </Pressable>
  );
}

const tog = StyleSheet.create({
  track: {
    width: 50, height: 28, borderRadius: 14,
    justifyContent: 'center',
  },
  thumb: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.20,
    shadowRadius: 3,
    elevation: 3,
  },
});

// ─── Row types ────────────────────────────────────────────────────────────────
function SettingToggleRow({
  icon, label, sublabel, value, onToggle,
}: {
  icon:     React.ReactElement;
  label:    string;
  sublabel: string;
  value:    boolean;
  onToggle: () => void;
}) {
  return (
    <View style={row.wrap}>
      <View style={row.iconBox}>{icon}</View>
      <View style={row.text}>
        <Text style={row.label}>{label}</Text>
        <Text style={row.sub}>{sublabel}</Text>
      </View>
      <Toggle value={value} onToggle={onToggle} />
    </View>
  );
}

function SettingInfoRow({ icon, label, value }: { icon: React.ReactElement; label: string; value: string }) {
  return (
    <View style={row.wrap}>
      <View style={row.iconBox}>{icon}</View>
      <View style={row.text}>
        <Text style={row.label}>{label}</Text>
      </View>
      <Text style={row.value}>{value}</Text>
    </View>
  );
}

const row = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  iconBox: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  text:  { flex: 1, gap: 2 },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: -0.1,
  },
  sub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.40)',
    letterSpacing: 0.1,
  },
  value: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    color: 'rgba(255,255,255,0.35)',
  },
});

// ─── Section header ───────────────────────────────────────────────────────────
function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={sec.wrap}>
      <Text style={sec.label}>{label}</Text>
      <View style={sec.card}>{children}</View>
    </View>
  );
}

const sec = StyleSheet.create({
  wrap:  { gap: 8, paddingHorizontal: Spacing.lg },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    color: 'rgba(255,255,255,0.35)',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingLeft: 4,
  },
  card: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
});

// ─── Separator ────────────────────────────────────────────────────────────────
function Sep() {
  return <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.06)', marginLeft: 66 }} />;
}

// ─── Pure-View icons ──────────────────────────────────────────────────────────
function PaletteIcon() {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: 'rgba(255,255,255,0.80)' }} />
      <View style={{ position: 'absolute', width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#E91E63', top: 1, right: 1 }} />
    </View>
  );
}

function BellSettingIcon() {
  return (
    <View style={{ width: 16, height: 17, alignItems: 'center' }}>
      <View style={{ width: 4, height: 4, borderRadius: 2, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.80)', borderBottomWidth: 0, marginBottom: -1, zIndex: 1 }} />
      <View style={{ width: 12, height: 9, borderTopLeftRadius: 6, borderTopRightRadius: 6, backgroundColor: 'rgba(255,255,255,0.80)' }} />
      <View style={{ width: 4, height: 2.5, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, backgroundColor: 'rgba(255,255,255,0.80)', marginTop: -0.5 }} />
    </View>
  );
}

function ShieldIcon() {
  return (
    <View style={{ width: 14, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 14, height: 14, borderRadius: 3, borderWidth: 2, borderColor: 'rgba(255,255,255,0.80)', borderBottomLeftRadius: 7, borderBottomRightRadius: 7, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      <View style={{ position: 'absolute', width: 5, height: 7, borderRadius: 1, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.80)', top: 4 }} />
    </View>
  );
}

function InfoIcon() {
  return (
    <View style={{ width: 16, height: 16, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.80)' }} />
      <View style={{ position: 'absolute', width: 2, height: 5, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.80)', bottom: 2.5 }} />
      <View style={{ position: 'absolute', width: 2, height: 2, borderRadius: 1, backgroundColor: 'rgba(255,255,255,0.80)', top: 2.5 }} />
    </View>
  );
}

// ─── Main sheet ───────────────────────────────────────────────────────────────
export function SettingsSheet({ visible, onClose }: SettingsSheetProps) {
  const { theme, toggleTheme } = useTheme();

  // Local notification preference state (UI only — no backend yet)
  const [notifEnabled, setNotifEnabled] = React.useState(true);
  const [biometricEnabled, setBiometricEnabled] = React.useState(false);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>

      <Pressable style={s.backdrop} onPress={onClose} />

      <View style={s.sheet}>
        {/* Handle */}
        <View style={s.handle} />

        {/* Title */}
        <View style={s.titleRow}>
          <Text style={s.title}>Settings</Text>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [s.closeBtn, pressed && s.closeBtnPressed]}
            hitSlop={10}
            accessibilityLabel="Close settings">
            <View style={s.closeX1} />
            <View style={s.closeX2} />
          </Pressable>
        </View>

        {/* ── Appearance ── */}
        <Section label="Appearance">
          <SettingToggleRow
            icon={<PaletteIcon />}
            label="Dark Mode"
            sublabel={theme.isDark ? 'Dark theme is active' : 'Light theme is active'}
            value={theme.isDark}
            onToggle={toggleTheme}
          />
        </Section>

        {/* ── Notifications ── */}
        <Section label="Notifications">
          <SettingToggleRow
            icon={<BellSettingIcon />}
            label="Push Notifications"
            sublabel={notifEnabled ? 'Enabled for this device' : 'Notifications are off'}
            value={notifEnabled}
            onToggle={() => setNotifEnabled(p => !p)}
          />
        </Section>

        {/* ── Security ── */}
        <Section label="Security">
          <SettingToggleRow
            icon={<ShieldIcon />}
            label="Biometric Lock"
            sublabel={biometricEnabled ? 'Fingerprint / Face ID active' : 'Use PIN only'}
            value={biometricEnabled}
            onToggle={() => setBiometricEnabled(p => !p)}
          />
        </Section>

        {/* ── About ── */}
        <Section label="About">
          <SettingInfoRow icon={<InfoIcon />} label="App Version" value="1.0.0" />
          <Sep />
          <SettingInfoRow icon={<InfoIcon />} label="Build"       value="2025.04" />
        </Section>

      </View>
    </Modal>
  );
}

// ─── Sheet styles ─────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.60)',
  },
  sheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    gap: 20,
    paddingTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 24,
  },
  handle: {
    alignSelf: 'center',
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.14)',
    marginTop: 10,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingBottom: 4,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: -0.4,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.10)',
    alignItems: 'center', justifyContent: 'center',
  },
  closeBtnPressed: { backgroundColor: 'rgba(255,255,255,0.18)', transform: [{ scale: 0.91 }] },
  closeX1: {
    position: 'absolute',
    width: 14, height: 2, borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.70)',
    transform: [{ rotate: '45deg' }],
  },
  closeX2: {
    position: 'absolute',
    width: 14, height: 2, borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.70)',
    transform: [{ rotate: '-45deg' }],
  },
});
