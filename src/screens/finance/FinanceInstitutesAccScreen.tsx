import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { Colors, FontFamily, FontSize } from '../../constants/theme';

export function FinanceInstitutesAccScreen() {
  return (
    <SubModuleLayout title="Finance Institutes & Acc" showBack={true}>
      <View style={styles.center}>
        <Text style={styles.label}>Finance Institutes & Acc</Text>
        <Text style={styles.sub}>Coming soon</Text>
      </View>
    </SubModuleLayout>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, color: Colors.primaryHighlight },
  sub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#8E8E93', marginTop: 6 },
});
