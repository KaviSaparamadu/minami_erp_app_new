import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { Colors, FontFamily, FontSize } from '../../constants/theme';

export function ServiceProviderScreen() {
  return (
    <SubModuleLayout parentModuleId="3" title="Service Provider" showBack={true}>
      <View style={styles.center}>
        <Text style={styles.label}>Service Provider</Text>
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
