import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';

export function BrandLogo() {
  return (
    <View style={styles.wrapper}>
      {/* Outer glow ring */}
      <View style={styles.ring}>
        {/* Icon card */}
        <View style={styles.card}>
          {/* Top accent bar */}
          <View style={styles.accentBar} />

          {/* Monogram */}
          <View style={styles.monogramRow}>
            <Text style={styles.monogramLetter}>G</Text>
            <Text style={[styles.monogramLetter, styles.monogramLetterPink]}>P</Text>
          </View>

          {/* Bottom accent dots */}
          <View style={styles.dotsRow}>
            <View style={styles.dot} />
            <View style={[styles.dot, styles.dotPink]} />
            <View style={styles.dot} />
          </View>
        </View>
      </View>
    </View>
  );
}

const CARD_SIZE = 92;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  ring: {
    width: CARD_SIZE + 10,
    height: CARD_SIZE + 10,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
    // Subtle outer shadow
    shadowColor: Colors.primaryHighlight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: Colors.background,
  },
  card: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 22,
    backgroundColor: Colors.buttonBg,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
    backgroundColor: Colors.primaryHighlight,
  },
  monogramRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  monogramLetter: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 40,
    letterSpacing: -1,
  },
  monogramLetterPink: {
    color: Colors.primaryHighlight,
  },
  dotsRow: {
    flexDirection: 'row',
    marginTop: 8,
    gap: 5,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  dotPink: {
    backgroundColor: Colors.primaryHighlight,
  },
});
