import React from 'react';
import { StyleSheet, View } from 'react-native';

interface EyeIconProps {
  visible: boolean;
  color?: string;
}

/**
 * Visibility / visibility-off icon built from pure RN Views.
 * Matches the Material Design visibility icon shape.
 */
export function EyeIcon({ visible, color = '#A0A0A0' }: EyeIconProps) {
  return (
    <View style={styles.container}>
      {/* ── Eye outline (lens / almond shape) ── */}
      <View style={[styles.lensOuter, { borderColor: color }]}>
        {/* Pupil */}
        <View style={[styles.pupil, { backgroundColor: color }]}>
          {/* Pupil highlight dot */}
          <View style={styles.highlight} />
        </View>
      </View>

      {/* ── Slash for visibility-off ── */}
      {!visible && (
        <>
          {/* White background bar to "cut" through the eye */}
          <View
            style={[styles.slashBg]}
            pointerEvents="none"
          />
          {/* Colored slash line on top */}
          <View
            style={[styles.slashLine, { backgroundColor: color }]}
            pointerEvents="none"
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Lens shape — wide oval with border only
  lensOuter: {
    width: 20,
    height: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Pupil — solid filled circle
  pupil: {
    width: 5,
    height: 5,
    borderRadius: 3,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },

  // Small specular highlight on pupil
  highlight: {
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    marginTop: 0.5,
    marginRight: 0.5,
  },

  // White bar slightly wider than the slash — gives a "cut-through" look
  slashBg: {
    position: 'absolute',
    width: 24,
    height: 3,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-38deg' }],
  },

  // The visible slash line
  slashLine: {
    position: 'absolute',
    width: 22,
    height: 1.5,
    borderRadius: 1,
    transform: [{ rotate: '-38deg' }],
  },
});
