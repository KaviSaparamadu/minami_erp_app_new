import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { GENERAL_SETTINGS_SUBMODULES } from '../../constants/modules';
import { Colors, Spacing, FontFamily, FontSize } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

export function GeneralSettingsScreen() {
  const { colors } = useTheme();

  const handleSettingPress = (settingName: string) => {
    // Navigate to Standard Settings detail screen
    console.log('Navigate to:', settingName);
  };

  return (
    <SubModuleLayout title="General Settings" showBack={true}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.subScroll}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>General Settings</Text>
        {GENERAL_SETTINGS_SUBMODULES.map((setting) => (
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
