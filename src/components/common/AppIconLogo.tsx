/**
 * AppIconLogo — pure-RN replica of assets/images/app-icon.svg
 *
 * Layout matches the SVG 1:1:
 *   • Dark #1C1C1E rounded-square card
 *   • Pink accent bar across the top
 *   • Two ghost rings (top-right large / bottom-left small)
 *   • "G" white · "P" pink · "IT" white  (bold, kerned)
 *   • "ERP" pill badge below the wordmark
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, FontFamily, FontWeight } from '../../constants/theme';

interface AppIconLogoProps {
  size?: number; // outer card dimension, default 110
}

export function AppIconLogo({ size = 110 }: AppIconLogoProps) {
  const radius      = size * 0.22;   // ~24 % → matches SVG rx="230/1024"
  const letterSize  = size * 0.32;   // ~35 px @ 110
  const pillH       = size * 0.14;
  const pillW       = size * 0.38;
  const pillRadius  = size * 0.055;

  // Ghost-ring sizes (proportional to SVG values / 1024)
  const ring1 = size * 0.86;   // large ring, top-right
  const ring2 = size * 0.51;   // small ring, bottom-left

  return (
    <View style={[styles.card, { width: size, height: size, borderRadius: radius }]}>

      {/* ── Ghost ring — large, top-right ── */}
      <View
        style={[
          styles.ring,
          {
            width:  ring1,
            height: ring1,
            borderRadius: ring1 / 2,
            top:  -ring1 * 0.28,
            right: -ring1 * 0.28,
          },
        ]}
      />

      {/* ── Ghost ring — small, bottom-left ── */}
      <View
        style={[
          styles.ring,
          styles.ringSmall,
          {
            width:  ring2,
            height: ring2,
            borderRadius: ring2 / 2,
            bottom: -ring2 * 0.22,
            left:   -ring2 * 0.22,
          },
        ]}
      />

      {/* ── Pink accent bar ── */}
      <View style={[styles.accentBar, { borderTopLeftRadius: radius, borderTopRightRadius: radius }]} />

      {/* ── Wordmark: G · P · IT ── */}
      <View style={styles.wordmark}>
        <Text style={[styles.letter, { fontSize: letterSize }]}>G</Text>
        <Text style={[styles.letter, styles.letterPink, { fontSize: letterSize }]}>P</Text>
        <Text style={[styles.letter, { fontSize: letterSize }]}>IT</Text>
      </View>

      {/* ── ERP pill ── */}
      <View
        style={[
          styles.pill,
          {
            height:       pillH,
            width:        pillW,
            borderRadius: pillRadius,
          },
        ]}>
        <Text style={[styles.pillText, { fontSize: size * 0.09 }]}>ERP</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    // shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 14,
  },

  // Ghost rings
  ring: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: Colors.primaryHighlight,
    opacity: 0.1,
  },
  ringSmall: {
    opacity: 0.07,
  },

  // Pink top bar
  accentBar: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 5,
    backgroundColor: Colors.primaryHighlight,
  },

  // G · P · IT
  wordmark: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 4,
    gap: 0,
  },
  letter: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    includeFontPadding: false,
    lineHeight: undefined,
    letterSpacing: -0.5,
  },
  letterPink: {
    color: Colors.primaryHighlight,
  },

  // ERP badge
  pill: {
    backgroundColor: 'rgba(233,30,99,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(233,30,99,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillText: {
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
    letterSpacing: 3,
  },
});
