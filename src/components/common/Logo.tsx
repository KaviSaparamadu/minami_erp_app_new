import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FontFamily, FontWeight } from '../../constants/theme';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

export function Logo({ size = 'medium' }: LogoProps) {
  const sizes = {
    small: { g: 16, p: 12, it: 16, pill: 6, gap: 1 },
    medium: { g: 24, p: 18, it: 24, pill: 8, gap: 2 },
    large: { g: 32, p: 24, it: 32, pill: 10, gap: 3 },
  };

  const s = sizes[size];

  return (
    <View style={styles.container}>
      <View style={[styles.brand, { gap: s.gap }]}>
        <Text style={[styles.brandG, { fontSize: s.g }]}>G</Text>
        <Text style={[styles.brandPink, { fontSize: s.p }]}>P</Text>
        <Text style={[styles.brandIT, { fontSize: s.it }]}>IT</Text>
        <View style={[styles.erpPill, { paddingHorizontal: s.pill }]}>
          <Text style={[styles.erpText, { fontSize: s.pill * 0.8 }]}>ERP</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  brand: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  brandG: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: '#595959',
    letterSpacing: 0.5,
  },

  brandPink: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: '#E91E63',
    letterSpacing: 0.3,
  },

  brandIT: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: '#595959',
    letterSpacing: 0.5,
  },

  erpPill: {
    backgroundColor: 'rgba(233, 30, 99, 0.15)',
    borderRadius: 4,
    paddingVertical: 3,
    marginLeft: 6,
    borderWidth: 0.5,
    borderColor: 'rgba(233, 30, 99, 0.3)',
  },

  erpText: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: '#E91E63',
    letterSpacing: 0.6,
  },
});
