import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { Colors, FontFamily, FontSize } from '../../constants/theme';

export function StockInventorySellingPriceScreen() {
  return (
    <SubModuleLayout parentModuleId="3" title="Stock And Inventory Selling Price" showBack={true}>
      <View style={styles.center}>
        <Text style={styles.label}>Stock And Inventory Selling Price</Text>
        <Text style={styles.sub}>Coming soon</Text>
      </View>
    </SubModuleLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label:  { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.primaryHighlight, textAlign: 'center', paddingHorizontal: 24 },
  sub:    { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#8E8E93', marginTop: 6 },
});
