import React, { useState, useRef, useMemo } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
  Modal,
  ScrollView,
  Image,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  Alert,
} from 'react-native';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';

function HomeIcon({ active, iconColor }: { active: boolean; iconColor: string }) {
  return (
    <View style={[icon.base, active && icon.active]}>
      <View style={[icon.homeTop, { borderColor: iconColor }, active && icon.activeColor]} />
      <View style={[icon.homeBottom, { borderColor: iconColor }, active && icon.activeColor]} />
    </View>
  );
}

function BellIcon({ active, iconColor }: { active: boolean; iconColor: string }) {
  return (
    <View style={[icon.base, active && icon.active]}>
      <View style={[icon.bellTop, { borderColor: iconColor }, active && icon.activeColor]} />
      <View style={[icon.bellBody, { borderColor: iconColor }, active && icon.activeColor]} />
      <View style={[icon.bellDot, { backgroundColor: active ? Colors.primaryHighlight : '#E91E63' }]} />
    </View>
  );
}

function GearIcon({ active, iconColor }: { active: boolean; iconColor: string }) {
  return (
    <View style={[icon.base, active && icon.active]}>
      <View style={[icon.gearCenter, { backgroundColor: iconColor }, active && icon.activeColor]} />
      <View style={[icon.gearT1, { backgroundColor: iconColor }, active && icon.activeColor]} />
      <View style={[icon.gearT3, { backgroundColor: iconColor }, active && icon.activeColor]} />
    </View>
  );
}

function CameraIcon({ iconColor }: { iconColor: string }) {
  return (
    <View style={cam.wrap}>
      <View style={[cam.body, { borderColor: iconColor }]} />
      <View style={[cam.lens, { borderColor: iconColor }]} />
    </View>
  );
}

function GalleryIcon({ iconColor }: { iconColor: string }) {
  return (
    <View style={gal.wrap}>
      <View style={[gal.frame, { borderColor: iconColor }]} />
      <View style={[gal.corner1, { backgroundColor: iconColor }]} />
      <View style={[gal.corner2, { backgroundColor: iconColor }]} />
    </View>
  );
}

function SignOutIcon() {
  return (
    <View style={signout.wrap}>
      <View style={signout.door} />
      <View style={signout.handle} />
      <View style={signout.arrow} />
    </View>
  );
}

interface CropperProps {
  visible: boolean;
  imageUri: string | null;
  onClose: () => void;
  onSave: (uri: string) => void;
}

function ImageCropper({ visible, imageUri, onClose, onSave }: CropperProps) {
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        setOffsetX(gestureState.dx);
        setOffsetY(gestureState.dy);
      },
      onPanResponderRelease: () => {
        // Reset offset on release for better UX
      },
    })
  ).current;

  const handleSave = () => {
    if (imageUri) {
      onSave(imageUri);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}>
      <View style={cropperStyles.container}>
        <View style={cropperStyles.header}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [cropperStyles.headerBtn, pressed && cropperStyles.btnPressed]}>
            <Text style={cropperStyles.headerBtnText}>Cancel</Text>
          </Pressable>
          <Text style={cropperStyles.headerTitle}>Crop Image</Text>
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [cropperStyles.headerBtn, pressed && cropperStyles.btnPressed]}>
            <Text style={[cropperStyles.headerBtnText, cropperStyles.saveBtn]}>Save</Text>
          </Pressable>
        </View>

        <View style={cropperStyles.content}>
          <View
            style={cropperStyles.cropFrame}
            {...panResponder.panHandlers}>
            {imageUri && (
              <Image
                source={{ uri: imageUri }}
                style={[
                  cropperStyles.image,
                  {
                    transform: [{ scale }, { translateX: offsetX }, { translateY: offsetY }],
                  },
                ]}
              />
            )}
            <View style={cropperStyles.cropOverlay} />
          </View>
        </View>

        <View style={cropperStyles.footer}>
          <View style={cropperStyles.controls}>
            <Pressable
              onPress={() => setScale(Math.max(0.5, scale - 0.2))}
              style={({ pressed }) => [cropperStyles.controlBtn, pressed && cropperStyles.btnPressed]}>
              <Text style={cropperStyles.controlText}>−</Text>
            </Pressable>
            <Text style={cropperStyles.scaleText}>{Math.round(scale * 100)}%</Text>
            <Pressable
              onPress={() => setScale(Math.min(3, scale + 0.2))}
              style={({ pressed }) => [cropperStyles.controlBtn, pressed && cropperStyles.btnPressed]}>
              <Text style={cropperStyles.controlText}>+</Text>
            </Pressable>
          </View>
          <Text style={cropperStyles.hint}>Drag to position, use +/− to zoom</Text>
        </View>
      </View>
    </Modal>
  );
}

export function Footer() {
  const { currentScreen, navigateTo } = useNavigation();
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [cropperVisible, setCropperVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [notifications, setNotifications] = useState(true);
  const [autoUpdate, setAutoUpdate] = useState(true);

  const iconColor = isDarkMode ? '#FFFFFF' : '#1C1C1E';
  const dynamicStyles = useMemo(() => createDynamicFooterStyles(colors, isDarkMode), [colors, isDarkMode]);

  const handleHomePress = () => {
    navigateTo('Dashboard');
  };

  const handleProfilePress = () => {
    setProfileModalVisible(true);
  };

  const handleOpenCamera = () => {
    Alert.alert(
      'Camera',
      'To take a photo, install react-native-image-picker:\nnpm install react-native-image-picker',
      [{ text: 'OK' }]
    );
    // When react-native-image-picker is installed, use:
    // const options = {
    //   mediaType: 'photo',
    //   includeBase64: false,
    //   quality: 0.8,
    // };
    // launchCamera(options, (response) => { ... });
  };

  const handleOpenGallery = () => {
    Alert.alert(
      'Gallery',
      'To select a photo, install react-native-image-picker:\nnpm install react-native-image-picker',
      [{ text: 'OK' }]
    );
    // When react-native-image-picker is installed, use:
    // const options = {
    //   mediaType: 'photo',
    //   includeBase64: false,
    //   quality: 0.8,
    // };
    // launchImageLibrary(options, (response) => { ... });
  };

  const handleCropSave = (croppedImageUri: string) => {
    setProfilePhoto(croppedImageUri);
    setCropperVisible(false);
    setSelectedImage(null);
  };

  const handleLogout = () => {
    setProfileModalVisible(false);
    logout();
  };

  const initial = user?.fullName?.charAt(0).toUpperCase() || '?';

  return (
    <>
      <View style={[styles.footer, dynamicStyles.footer]}>
        <Pressable
          onPress={handleHomePress}
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          hitSlop={8}>
          <HomeIcon active={currentScreen === 'Dashboard'} iconColor={iconColor} />
          <Text style={[styles.label, dynamicStyles.label, currentScreen === 'Dashboard' && styles.labelActive]}>Home</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          hitSlop={8}>
          <BellIcon active={false} iconColor={iconColor} />
          <Text style={[styles.label, dynamicStyles.label]}>Notify</Text>
        </Pressable>

        <Pressable
          onPress={() => setSettingsModalVisible(true)}
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
          hitSlop={8}>
          <GearIcon active={false} iconColor={iconColor} />
          <Text style={[styles.label, dynamicStyles.label]}>Settings</Text>
        </Pressable>

        <Pressable
          onPress={handleProfilePress}
          style={({ pressed }) => [styles.profileItem, pressed && styles.itemPressed]}
          hitSlop={8}>
          {profilePhoto ? (
            <Image source={{ uri: profilePhoto }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
          <Text style={[styles.label, dynamicStyles.label]}>Profile</Text>
        </Pressable>
      </View>

      {/* Profile Modal */}
      <Modal
        visible={profileModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}>
        <View style={[styles.backdrop, dynamicStyles.backdrop]}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
            showsVerticalScrollIndicator={false}>
            <View style={[styles.handle, dynamicStyles.handle]} />

            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarGlow}>
                {profilePhoto ? (
                  <>
                    <Image source={{ uri: profilePhoto }} style={styles.largeAvatarImage} />
                    <Pressable
                      onPress={handleOpenCamera}
                      style={({ pressed }) => [
                        styles.cameraButton,
                        pressed && styles.cameraButtonPressed,
                      ]}>
                      <CameraIcon iconColor={iconColor} />
                    </Pressable>
                  </>
                ) : (
                  <>
                    <View style={styles.largeAvatar}>
                      <Text style={styles.largeAvatarText}>{initial}</Text>
                    </View>
                    <Pressable
                      onPress={handleOpenCamera}
                      style={({ pressed }) => [
                        styles.cameraButton,
                        pressed && styles.cameraButtonPressed,
                      ]}>
                      <CameraIcon iconColor={iconColor} />
                    </Pressable>
                  </>
                )}
              </View>

              <Text style={[styles.fullName, dynamicStyles.profileFullName]}>{user?.fullName}</Text>
              <View style={styles.statusChip}>
                <View style={styles.statusDot} />
                <Text style={[styles.statusText, dynamicStyles.profileStatusText]}>Active</Text>
              </View>
            </View>

            {/* Photo Options */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, dynamicStyles.profileSectionTitle]}>Upload Photo</Text>
              <View style={styles.optionsRow}>
                <Pressable
                  onPress={handleOpenCamera}
                  style={({ pressed }) => [
                    styles.photoOption,
                    pressed && styles.photoOptionPressed,
                  ]}>
                  <View style={styles.photoIcon}>
                    <CameraIcon />
                  </View>
                  <Text style={[styles.photoLabel, dynamicStyles.profilePhotoLabel]}>Camera</Text>
                </Pressable>

                <Pressable
                  onPress={handleOpenGallery}
                  style={({ pressed }) => [
                    styles.photoOption,
                    pressed && styles.photoOptionPressed,
                  ]}>
                  <View style={styles.photoIcon}>
                    <GalleryIcon iconColor={iconColor} />
                  </View>
                  <Text style={[styles.photoLabel, dynamicStyles.profilePhotoLabel]}>Gallery</Text>
                </Pressable>
              </View>
            </View>

            {/* User Info */}
            <View style={[styles.infoSection, dynamicStyles.profileInfoSection]}>
              <View style={[styles.infoRow, dynamicStyles.profileInfoRow]}>
                <Text style={[styles.infoLabel, dynamicStyles.profileInfoLabel]}>Username</Text>
                <Text style={[styles.infoValue, dynamicStyles.profileInfoValue]}>{user?.username}</Text>
              </View>
              <View style={[styles.infoRow, dynamicStyles.profileInfoRow]}>
                <Text style={[styles.infoLabel, dynamicStyles.profileInfoLabel]}>Role</Text>
                <Text style={[styles.infoValue, dynamicStyles.profileInfoValue]}>{user?.role}</Text>
              </View>
              <View style={[styles.infoRow, dynamicStyles.profileInfoRow]}>
                <Text style={[styles.infoLabel, dynamicStyles.profileInfoLabel]}>Access</Text>
                <Text style={[styles.infoValue, styles.accessValue, dynamicStyles.profileInfoValue]}>Full</Text>
              </View>
            </View>

            {/* Sign Out Button */}
            <Pressable
              onPress={handleLogout}
              style={({ pressed }) => [
                styles.logoutButton,
                pressed && styles.logoutButtonPressed,
              ]}>
              <SignOutIcon />
              <Text style={[styles.logoutText, dynamicStyles.profileLogoutText]}>Sign Out</Text>
            </Pressable>

            {/* Close Button */}
            <Pressable
              onPress={() => setProfileModalVisible(false)}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}>
              <Text style={[styles.closeText, dynamicStyles.profileCloseText]}>Close</Text>
            </Pressable>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Image Cropper Modal */}
      <ImageCropper
        visible={cropperVisible}
        imageUri={selectedImage}
        onClose={() => {
          setCropperVisible(false);
          setSelectedImage(null);
        }}
        onSave={handleCropSave}
      />

      {/* Settings Modal */}
      <Modal
        visible={settingsModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsModalVisible(false)}>
        <View style={[styles.backdrop, dynamicStyles.backdrop]}>
          <ScrollView
            contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}
            showsVerticalScrollIndicator={false}>
            <View style={[styles.handle, dynamicStyles.handle]} />

            {/* Settings Header */}
            <View style={settingsStyles.header}>
              <Text style={[settingsStyles.title, dynamicStyles.settingsTitle]}>Settings</Text>
            </View>

            {/* Theme Section */}
            <View style={settingsStyles.section}>
              <Text style={[settingsStyles.sectionTitle, dynamicStyles.settingsSectionTitle]}>Appearance</Text>

              <View style={[settingsStyles.settingRow, dynamicStyles.settingsRow]}>
                <View style={settingsStyles.settingInfo}>
                  <Text style={[settingsStyles.settingLabel, dynamicStyles.settingsLabel]}>Dark Mode</Text>
                  <Text style={[settingsStyles.settingSub, dynamicStyles.settingsSub]}>Change app theme</Text>
                </View>
                <Pressable
                  onPress={toggleTheme}
                  style={[settingsStyles.toggle, isDarkMode && settingsStyles.toggleActive, dynamicStyles.settingsToggleBg]}>
                  <View style={[settingsStyles.toggleDot, isDarkMode && settingsStyles.toggleDotActive, dynamicStyles.toggleDotBg]} />
                </Pressable>
              </View>

              <View style={[settingsStyles.settingRow, dynamicStyles.settingsRow]}>
                <View style={settingsStyles.settingInfo}>
                  <Text style={[settingsStyles.settingLabel, dynamicStyles.settingsLabel]}>Notifications</Text>
                  <Text style={[settingsStyles.settingSub, dynamicStyles.settingsSub]}>Receive app notifications</Text>
                </View>
                <Pressable
                  onPress={() => setNotifications(!notifications)}
                  style={[settingsStyles.toggle, notifications && settingsStyles.toggleActive, dynamicStyles.settingsToggleBg]}>
                  <View style={[settingsStyles.toggleDot, notifications && settingsStyles.toggleDotActive, dynamicStyles.toggleDotBg]} />
                </Pressable>
              </View>
            </View>

            {/* Updates Section */}
            <View style={settingsStyles.section}>
              <Text style={[settingsStyles.sectionTitle, dynamicStyles.settingsSectionTitle]}>Updates</Text>

              <View style={[settingsStyles.settingRow, dynamicStyles.settingsRow]}>
                <View style={settingsStyles.settingInfo}>
                  <Text style={[settingsStyles.settingLabel, dynamicStyles.settingsLabel]}>Auto Update</Text>
                  <Text style={[settingsStyles.settingSub, dynamicStyles.settingsSub]}>Update app automatically</Text>
                </View>
                <Pressable
                  onPress={() => setAutoUpdate(!autoUpdate)}
                  style={[settingsStyles.toggle, autoUpdate && settingsStyles.toggleActive, dynamicStyles.settingsToggleBg]}>
                  <View style={[settingsStyles.toggleDot, autoUpdate && settingsStyles.toggleDotActive, dynamicStyles.toggleDotBg]} />
                </Pressable>
              </View>

              <Pressable
                style={({ pressed }) => [settingsStyles.actionButton, pressed && settingsStyles.buttonPressed, dynamicStyles.settingsActionButton]}>
                <Text style={[settingsStyles.actionButtonText, dynamicStyles.settingsActionButtonText]}>Check for Updates</Text>
              </Pressable>
            </View>

            {/* About Section */}
            <View style={settingsStyles.section}>
              <Text style={[settingsStyles.sectionTitle, dynamicStyles.settingsSectionTitle]}>About</Text>

              <View style={settingsStyles.infoRow}>
                <Text style={[settingsStyles.infoLabel, dynamicStyles.settingsInfoLabel]}>App Version</Text>
                <Text style={[settingsStyles.infoValue, dynamicStyles.settingsInfoValue]}>1.0.0</Text>
              </View>

              <View style={settingsStyles.infoRow}>
                <Text style={[settingsStyles.infoLabel, dynamicStyles.settingsInfoLabel]}>Build</Text>
                <Text style={[settingsStyles.infoValue, dynamicStyles.settingsInfoValue]}>001</Text>
              </View>
            </View>

            {/* Close Button */}
            <Pressable
              onPress={() => setSettingsModalVisible(false)}
              style={({ pressed }) => [
                styles.closeButton,
                pressed && styles.closeButtonPressed,
              ]}>
              <Text style={[styles.closeText, dynamicStyles.profileCloseText]}>Close</Text>
            </Pressable>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </Modal>
    </>
  );
}

function createDynamicFooterStyles(colors: any, isDarkMode: boolean) {
  const textColor = isDarkMode ? '#FFFFFF' : '#000000';
  const mutedTextColor = isDarkMode ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)';
  const lightMutedTextColor = isDarkMode ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
  const borderColor = isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';
  const bgLight = isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const bgLighter = isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const handleBg = isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)';

  return StyleSheet.create({
    footer: {
      backgroundColor: colors.background,
      borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E5EA',
    },
    label: {
      color: isDarkMode ? 'rgba(255,255,255,0.6)' : '#888',
    },
    backdrop: {
      backgroundColor: isDarkMode ? '#1C1C1E' : '#F2F2F7',
    },
    handle: {
      backgroundColor: handleBg,
    },
    // Profile Modal Styles
    profileFullName: {
      color: textColor,
    },
    profileStatusText: {
      color: textColor,
    },
    profileSectionTitle: {
      color: textColor,
    },
    profilePhotoLabel: {
      color: textColor,
    },
    profileInfoLabel: {
      color: mutedTextColor,
    },
    profileInfoValue: {
      color: textColor,
    },
    profileLogoutText: {
      color: '#FFFFFF',
    },
    profileCloseText: {
      color: mutedTextColor,
    },
    profilePhotoOption: {
      backgroundColor: bgLight,
      borderColor: borderColor,
    },
    profileInfoSection: {
      backgroundColor: bgLight,
      borderColor: borderColor,
    },
    profileInfoRow: {
      borderBottomColor: borderColor,
    },
    // Settings Modal Styles
    settingsTitle: {
      color: textColor,
    },
    settingsSectionTitle: {
      color: mutedTextColor,
    },
    settingsLabel: {
      color: textColor,
    },
    settingsSub: {
      color: lightMutedTextColor,
    },
    settingsRow: {
      backgroundColor: bgLight,
      borderColor: borderColor,
    },
    settingsToggleBg: {
      backgroundColor: bgLight,
      borderColor: borderColor,
    },
    settingsActionButton: {
      backgroundColor: isDarkMode ? 'rgba(233,30,99,0.2)' : 'rgba(233,30,99,0.15)',
      borderColor: Colors.primaryHighlight,
    },
    settingsActionButtonText: {
      color: Colors.primaryHighlight,
    },
    settingsInfoLabel: {
      color: lightMutedTextColor,
    },
    settingsInfoValue: {
      color: textColor,
    },
    // Toggle styles
    toggleDotBg: {
      backgroundColor: isDarkMode ? '#FFFFFF' : '#1C1C1E',
    },
    // Action button background
    actionButtonBg: {
      backgroundColor: isDarkMode ? 'rgba(233,30,99,0.2)' : 'rgba(233,30,99,0.15)',
    },
  });
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    paddingVertical: 8,
    paddingHorizontal: 4,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  profileItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 3,
  },
  itemPressed: {
    opacity: 0.6,
  },
  avatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  label: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
  },
  labelActive: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
  },
  backdrop: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  handle: {
    alignSelf: 'center',
    width: 38,
    height: 4,
    borderRadius: 2,
    marginTop: 12,
    marginBottom: 20,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  avatarGlow: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(233,30,99,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
    overflow: 'hidden',
  },
  largeAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  largeAvatarText: {
    fontFamily: FontFamily.bold,
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  cameraButton: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#1C1C1E',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  cameraButtonPressed: {
    transform: [{ scale: 0.92 }],
    opacity: 0.85,
  },
  fullName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(48,209,88,0.12)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
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
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  photoOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  photoOptionPressed: {
    backgroundColor: 'rgba(233,30,99,0.2)',
    borderColor: Colors.primaryHighlight,
  },
  photoIcon: {
    marginBottom: Spacing.sm,
  },
  photoLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  infoSection: {
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  infoLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  infoValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: 'capitalize',
  },
  accessValue: {
    color: '#30D158',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#C0392B',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logoutButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  logoutText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
  },
  closeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeButtonPressed: {
    opacity: 0.5,
  },
  closeText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
});

const icon = StyleSheet.create({
  base: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  active: {},
  activeColor: {},
  homeTop: {
    position: 'absolute',
    top: 2,
    width: 10,
    height: 6,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderTopWidth: 1,
    borderColor: '#1C1C1E',
  },
  homeBottom: {
    position: 'absolute',
    bottom: 2,
    width: 9,
    height: 6,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#1C1C1E',
  },
  bellTop: {
    position: 'absolute',
    top: 1,
    width: 4,
    height: 3,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#1C1C1E',
    borderBottomWidth: 0,
  },
  bellBody: {
    position: 'absolute',
    top: 4,
    width: 9,
    height: 5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 0,
    borderColor: '#1C1C1E',
  },
  bellDot: {
    position: 'absolute',
    top: -1,
    right: -2,
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  gearCenter: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#1C1C1E',
  },
  gearT1: {
    position: 'absolute',
    top: -3,
    width: 2,
    height: 2,
    backgroundColor: '#1C1C1E',
  },
  gearT3: {
    position: 'absolute',
    bottom: -3,
    width: 2,
    height: 2,
    backgroundColor: '#1C1C1E',
  },
});

const cam = StyleSheet.create({
  wrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    position: 'absolute',
    width: 11,
    height: 8,
    borderRadius: 1.5,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  lens: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    borderWidth: 0.8,
    borderColor: '#1C1C1E',
  },
});

const gal = StyleSheet.create({
  wrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: {
    position: 'absolute',
    width: 12,
    height: 10,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: '#1C1C1E',
  },
  corner1: {
    position: 'absolute',
    top: 3,
    left: 2,
    width: 3,
    height: 3,
    borderRadius: 1,
    backgroundColor: '#1C1C1E',
  },
  corner2: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 4,
    height: 3,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: '#1C1C1E',
  },
});

const signout = StyleSheet.create({
  wrap: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  door: {
    position: 'absolute',
    width: 8,
    height: 10,
    borderRadius: 1,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  handle: {
    position: 'absolute',
    right: 1,
    width: 1.5,
    height: 1.5,
    borderRadius: 0.75,
    backgroundColor: '#FFFFFF',
  },
  arrow: {
    position: 'absolute',
    right: -4,
    width: 5,
    height: 1.5,
    backgroundColor: '#FFFFFF',
    borderRadius: 0.75,
  },
});

const settingsStyles = StyleSheet.create({
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: Spacing.lg,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderRadius: 12,
    borderWidth: 1,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
  settingSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: 2,
    borderWidth: 1,
  },
  toggleActive: {
    backgroundColor: Colors.primaryHighlight,
    borderColor: Colors.primaryHighlight,
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  toggleDotActive: {
    alignSelf: 'flex-end',
  },
  actionButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 10,
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primaryHighlight,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  infoLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  infoValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
  },
});

const cropperStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  headerBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  btnPressed: {
    opacity: 0.6,
  },
  headerBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: 'rgba(255,255,255,0.6)',
  },
  saveBtn: {
    color: Colors.primaryHighlight,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
  },
  cropFrame: {
    width: 280,
    height: 280,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#000',
    borderWidth: 2,
    borderColor: Colors.primaryHighlight,
  },
  image: {
    width: 280,
    height: 280,
  },
  cropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.3)',
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  controlBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  controlText: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  scaleText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    minWidth: 50,
    textAlign: 'center',
  },
  hint: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
  },
});
