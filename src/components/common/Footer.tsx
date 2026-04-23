import React, { useMemo, useState } from 'react';
import { View, Pressable, StyleSheet, Image, Text } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { ProfileSheet } from '../dashboard/ProfileSheet';
import { Colors, Spacing, FontFamily, FontSize, FontWeight } from '../../constants/theme';

interface FooterItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  active?: boolean;
}

function FooterTabItem({ icon, label, onPress, active }: FooterItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.tabItem,
        pressed && styles.tabItemPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={active ? '#E91E63' : '#8E8E93'}
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Footer() {
  const { colors } = useTheme();
  const { navigate } = useNavigation();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const dyn = useMemo(() => createDynamicStyles(colors), [colors]);

  return (
    <>
    <View style={[styles.footer, dyn.footer]}>
      {/* Logo Section with Pink Border */}
      <View style={styles.logoContainer}>
        <View style={styles.logoBorder}>
          <Image
            source={require('../../../assets/images/logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* Settings Tab */}
      <FooterTabItem
        icon="cog-outline"
        label="Settings"
        onPress={() => {}}
      />

      {/* Home Tab - Center */}
      <View style={styles.homeCenter}>
        <FooterTabItem
          icon="home-outline"
          label="Home"
          active={true}
          onPress={() => navigate('Dashboard')}
        />
      </View>

      {/* Profile Tab - Opens Profile Modal */}
      <FooterTabItem
        icon="account-circle-outline"
        label="Profile"
        onPress={() => setShowProfile(true)}
      />
    </View>

    {/* Profile Sheet Modal */}
    {user && (
      <ProfileSheet
        visible={showProfile}
        user={user}
        onClose={() => setShowProfile(false)}
        onLogout={logout}
      />
    )}
    </>
  );
}

function createDynamicStyles(colors: any) {
  return StyleSheet.create({
    footer: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
  });
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    width: '100%',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    height: 62,
    backgroundColor: '#FFFFFF',
  },

  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },

  logoBorder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5FA',
  },

  logoImage: {
    width: 32,
    height: 32,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    gap: 3,
    borderRadius: 8,
  },

  tabItemPressed: {
    opacity: 0.6,
    transform: [{ scale: 0.92 }],
  },

  tabLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    color: '#8E8E93',
    letterSpacing: 0.2,
    textAlign: 'center',
  },

  tabLabelActive: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: '#E91E63',
  },

  homeCenter: {
    flex: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
