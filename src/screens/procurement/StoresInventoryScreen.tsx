import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { STORES_INVENTORY_ITEMS } from '../../constants/modules';
import { Spacing, FontFamily, FontSize } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';

export function StoresInventoryScreen() {
  const { colors } = useTheme();
  const { navigate } = useNavigation();

  const handleItemPress = (id: string) => {
    if      (id === '1') navigate('ProcStores');
    else if (id === '2') navigate('ProcManageStores');
    else if (id === '3') navigate('ProcStoresReports');
  };

  return (
    <SubModuleLayout parentModuleId="4" title="Stores & Inventory" showBack={true}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.subScroll}>
        <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>Stores & Inventory</Text>
        {STORES_INVENTORY_ITEMS.map(item => (
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
