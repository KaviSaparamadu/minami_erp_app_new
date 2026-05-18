import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { PURCHASING_ITEMS } from '../../constants/modules';
import { Spacing, FontFamily, FontSize } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';

export function PurchasingScreen() {
  const { colors } = useTheme();
  const { navigate } = useNavigation();

  const handleItemPress = (id: string) => {
    if (id === '1') navigate('PurchasingGoods');
    if (id === '4') navigate('ManageItem');
  };

  return (
    <SubModuleLayout parentModuleId="4" title="Purchasing" showBack={true}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.subScroll}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Purchasing</Text>
        {PURCHASING_ITEMS.map(item => (
          <SubmoduleDetailCard
            key={item.id}
            submodule={item}
            iconType={item.iconType}
            description={item.description}
            onPress={() => handleItemPress(item.id)}
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
