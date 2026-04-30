import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { SYSTEM_SETTINGS } from '../../constants/modules';
import { Colors, Spacing, FontFamily, FontSize } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export function SystemSettingsScreen() {
  const { colors } = useTheme();

  const handleSettingPress = (settingName: string) => {
    // Navigate to specific setting screen or show a modal
    console.log('Navigate to:', settingName);
  };

  return (
    <SubModuleLayout parentModuleId="2" title="System Settings" showBack={true}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.subScroll}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>System Settings</Text>
        {SYSTEM_SETTINGS.map((setting) => (
          <SubmoduleDetailCard
            key={setting.id}
            submodule={setting}
            iconType={setting.iconType}
            description={setting.description}
            onPress={() => handleSettingPress(setting.name)}
          />
        ))}
      </ScrollView>
    </SubModuleLayout>
  );
}

const styles = StyleSheet.create({
  subScroll: {
    paddingTop: Spacing.sm,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: '700',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
});
