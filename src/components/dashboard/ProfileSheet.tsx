import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  Alert,
} from 'react-native';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { AuthUser } from '../../types/auth';

interface ProfileSheetProps {
  visible: boolean;
  user: AuthUser;
  onClose: () => void;
  onLogout: () => void;
}

export function ProfileSheet({ visible, user, onClose, onLogout }: ProfileSheetProps) {
  const initial = user.fullName.charAt(0).toUpperCase();
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);

  function handleLogout() {
    onClose();
    setTimeout(onLogout, 220);
  }

  function handleAddPhoto() {
    Alert.alert(
      'Add Profile Photo',
      'Choose a source for your profile photo',
      [
        { text: 'Camera', onPress: () => {
          Alert.alert('Coming Soon', 'Camera feature will be available soon');
          setShowPhotoOptions(false);
        }},
        { text: 'Gallery', onPress: () => {
          Alert.alert('Coming Soon', 'Gallery feature will be available soon');
          setShowPhotoOptions(false);
        }},
        { text: 'Cancel', style: 'cancel', onPress: () => setShowPhotoOptions(false) },
      ]
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}>

      {/* Backdrop */}
      <Pressable style={styles.backdrop} onPress={onClose} />

      {/* Bottom sheet */}
      <View style={styles.sheet}>

        {/* Drag handle */}
        <View style={styles.handle} />

        {/* ── Avatar + identity ── */}
        <View style={styles.identity}>
          {/* Glow ring */}
          <View style={styles.avatarGlow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
            {/* Camera button */}
            <Pressable
              onPress={handleAddPhoto}
              style={({ pressed }) => [
                styles.cameraButton,
                pressed && styles.cameraButtonPressed,
              ]}
              accessibilityLabel="Add profile photo"
              accessibilityRole="button">
              <CameraIcon />
            </Pressable>
          </View>
          {/* Online badge */}
          <View style={styles.onlineBadge}>
            <View style={styles.onlineDot} />
          </View>

          <Text style={styles.fullName}>{user.fullName}</Text>

          <View style={styles.metaRow}>
            <View style={styles.statusChip}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Active</Text>
            </View>
            <View style={styles.metaDot} />
            <Text style={styles.metaRole}>{user.role}</Text>
          </View>
        </View>

        {/* ── Info chips ── */}
        <View style={styles.infoRow}>
          <InfoChip topLine="Username" bottomLine={user.username} />
          <View style={styles.infoDiv} />
          <InfoChip topLine="Role" bottomLine={user.role} />
          <View style={styles.infoDiv} />
          <InfoChip topLine="Access" bottomLine="Full" accent />
        </View>

        {/* ── Divider ── */}
        <View style={styles.divider} />

        {/* ── Actions ── */}
        <View style={styles.actions}>
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [styles.logoutBtn, pressed && styles.logoutPressed]}
            accessibilityLabel="Sign out"
            accessibilityRole="button">
            <PowerIcon />
            <Text style={styles.logoutLabel}>Sign Out</Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.cancelTap, pressed && styles.cancelTapPressed]}
            accessibilityLabel="Cancel"
            accessibilityRole="button"
            hitSlop={10}>
            <Text style={styles.cancelLabel}>Cancel</Text>
          </Pressable>
        </View>

      </View>
    </Modal>
  );
}

function InfoChip({ topLine, bottomLine, accent }: { topLine: string; bottomLine: string; accent?: boolean }) {
  return (
    <View style={chip.wrap}>
      <Text style={chip.top}>{topLine}</Text>
      <Text style={[chip.bottom, accent && chip.bottomAccent]}>{bottomLine}</Text>
    </View>
  );
}

function PowerIcon() {
  return (
    <View style={pw.wrap}>
      <View style={pw.arc} />
      <View style={pw.bar} />
    </View>
  );
}

function CameraIcon() {
  return (
    <View style={cam.wrap}>
      <View style={cam.body} />
      <View style={cam.lens} />
      <View style={cam.flash} />
    </View>
  );
}

const DARK   = '#1C1C1E';
const DARK2  = '#2C2C2E';
const DARK3  = '#3A3A3C';

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.4,
    shadowRadius: 30,
    elevation: 24,
  },

  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginTop: 12,
    marginBottom: 6,
  },

  // ── Identity block ────────────────────────
  identity: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  avatarGlow: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(233,30,99,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: DARK,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  cameraButtonPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.85,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontFamily: FontFamily.bold,
    fontSize: 26,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  onlineBadge: {
    position: 'absolute',
    top: Spacing.lg + 84 - 14,   // aligns to bottom-right of glow ring
    right: '50%',
    marginRight: -42 + 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: DARK,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: DARK,
  },
  onlineDot: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: '#30D158',
  },
  fullName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.3,
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(48,209,88,0.12)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: 'rgba(48,209,88,0.2)',
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#30D158',
  },
  statusText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#30D158',
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  metaRole: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'capitalize',
  },

  // ── Info chips ────────────────────────────
  infoRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    backgroundColor: DARK2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  infoDiv: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
    marginVertical: Spacing.md,
  },

  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xl,
    marginBottom: Spacing.lg,
  },

  // ── Actions ───────────────────────────────
  actions: {
    paddingHorizontal: Spacing.lg,
    gap: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#C0392B',
    borderRadius: 14,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  logoutPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  logoutLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },

  cancelTap: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  cancelTapPressed: { opacity: 0.5 },
  cancelLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.35)',
  },
});

const chip = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: 3,
  },
  top: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  bottom: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: 'rgba(255,255,255,0.75)',
    textTransform: 'capitalize',
  },
  bottomAccent: {
    color: '#30D158',
  },
});

const pw = StyleSheet.create({
  wrap: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  arc: {
    position: 'absolute',
    width: 12, height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  bar: {
    position: 'absolute',
    top: 0,
    width: 2, height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
});

const cam = StyleSheet.create({
  wrap: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    position: 'absolute',
    width: 13,
    height: 10,
    borderRadius: 2,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  lens: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  flash: {
    position: 'absolute',
    top: 1.5,
    right: 2,
    width: 2.5,
    height: 2.5,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
});
