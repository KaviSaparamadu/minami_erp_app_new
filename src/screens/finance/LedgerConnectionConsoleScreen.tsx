import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { Colors, FontFamily, FontSize } from '../../constants/theme';

export function LedgerConnectionConsoleScreen() {
  return (
    <SubModuleLayout parentModuleId="3" title="Ledger Connection Console" showBack={true}>
      <View style={styles.center}>
        <Text style={styles.label}>Ledger Connection Console</Text>
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
