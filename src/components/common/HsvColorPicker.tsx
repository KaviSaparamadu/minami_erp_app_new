import React, { useEffect, useRef, useState } from 'react';
import { PanResponder, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FontFamily, FontSize, FontWeight } from '../../constants/theme';

// ── Color conversion ──────────────────────────────────────────────────────────

export function hsvToRgb(h: number, s: number, v: number): [number, number, number] {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  if      (h < 60)  { r = c; g = x; b = 0; }
  else if (h < 120) { r = x; g = c; b = 0; }
  else if (h < 180) { r = 0; g = c; b = x; }
  else if (h < 240) { r = 0; g = x; b = c; }
  else if (h < 300) { r = x; g = 0; b = c; }
  else              { r = c; g = 0; b = x; }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b]
    .map(n => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0').toUpperCase())
    .join('');
}

export function hexToRgb(hex: string): [number, number, number] | null {
  const m = /^#?([A-Fa-f0-9]{6})$/.exec(hex.trim());
  if (!m) return null;
  const v = m[1];
  return [parseInt(v.slice(0, 2), 16), parseInt(v.slice(2, 4), 16), parseInt(v.slice(4, 6), 16)];
}

export function rgbToHsv(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  let h = 0;
  if (delta !== 0) {
    if      (max === rn) h = 60 * (((gn - bn) / delta) % 6);
    else if (max === gn) h = 60 * (((bn - rn) / delta) + 2);
    else                  h = 60 * (((rn - gn) / delta) + 4);
    if (h < 0) h += 360;
  }
  return [h, max === 0 ? 0 : delta / max, max];
}

function clamp(v: number, lo: number, hi: number) { return Math.max(lo, Math.min(hi, v)); }

// ── Constants ─────────────────────────────────────────────────────────────────

const STRIPS     = 40;
const HUE_STRIPS = 36;
const SV_HEIGHT  = 150;
const HUE_W      = 18;
const ALPHA_W    = 18;
const CURSOR_R   = 8;

// ── Saturation × Value square ─────────────────────────────────────────────────

function SatValSquare({ hue, sat, val, onChange }: {
  hue: number; sat: number; val: number;
  onChange: (s: number, v: number) => void;
}) {
  // Store everything in refs so PanResponder callbacks always see fresh values
  const viewRef = useRef<View>(null);
  const posRef  = useRef({ x: 0, y: 0, w: 0, h: 0 });
  const cbRef   = useRef(onChange);
  cbRef.current = onChange;

  // State only needed for cursor rendering
  const [size, setSize] = useState({ w: 0, h: 0 });

  function measureView() {
    viewRef.current?.measure((_fx, _fy, w, h, px, py) => {
      posRef.current = { x: px, y: py, w, h };
      setSize({ w, h });
    });
  }

  const pan = useRef(PanResponder.create({
    // Capture phase — win over parent ScrollView
    onStartShouldSetPanResponder:         () => true,
    onStartShouldSetPanResponderCapture:  () => true,
    onMoveShouldSetPanResponder:          () => true,
    onMoveShouldSetPanResponderCapture:   () => true,
    onPanResponderGrant: e => {
      const { x, y, w, h } = posRef.current;
      if (w === 0) return;
      cbRef.current(
        clamp((e.nativeEvent.pageX - x) / w, 0, 1),
        clamp(1 - (e.nativeEvent.pageY - y) / h, 0, 1),
      );
    },
    onPanResponderMove: e => {
      const { x, y, w, h } = posRef.current;
      if (w === 0) return;
      cbRef.current(
        clamp((e.nativeEvent.pageX - x) / w, 0, 1),
        clamp(1 - (e.nativeEvent.pageY - y) / h, 0, 1),
      );
    },
  })).current;

  const [r, g, b] = hsvToRgb(hue, 1, 1);
  const cx = sat * size.w;
  const cy = (1 - val) * size.h;

  return (
    <View
      ref={viewRef}
      style={[css.svSquare, { backgroundColor: `rgb(${r},${g},${b})` }]}
      onLayout={measureView}
      {...pan.panHandlers}>

      {/* White left → transparent right (saturation) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: STRIPS }, (_, i) => (
          <View key={i} style={{
            position: 'absolute',
            left: `${(i / STRIPS) * 100}%` as any,
            width: `${100 / STRIPS}%` as any,
            top: 0, bottom: 0,
            backgroundColor: `rgba(255,255,255,${(1 - i / STRIPS).toFixed(3)})`,
          }} />
        ))}
      </View>

      {/* Transparent top → black bottom (value) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {Array.from({ length: STRIPS }, (_, i) => (
          <View key={i} style={{
            position: 'absolute',
            top: `${(i / STRIPS) * 100}%` as any,
            height: `${100 / STRIPS}%` as any,
            left: 0, right: 0,
            backgroundColor: `rgba(0,0,0,${(i / STRIPS).toFixed(3)})`,
          }} />
        ))}
      </View>

      {size.w > 0 && (
        <View pointerEvents="none"
          style={[css.svCursor, { left: cx - CURSOR_R, top: cy - CURSOR_R }]} />
      )}
    </View>
  );
}

// ── Hue slider ────────────────────────────────────────────────────────────────

function HueSlider({ hue, onChange }: { hue: number; onChange: (h: number) => void }) {
  const viewRef = useRef<View>(null);
  const posRef  = useRef({ y: 0, h: 0 });
  const cbRef   = useRef(onChange);
  cbRef.current = onChange;

  const [height, setHeight] = useState(0);

  function measureView() {
    viewRef.current?.measure((_fx, _fy, _w, h, _px, py) => {
      posRef.current = { y: py, h };
      setHeight(h);
    });
  }

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder:        () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder:         () => true,
    onMoveShouldSetPanResponderCapture:  () => true,
    onPanResponderGrant: e => {
      const { y, h } = posRef.current;
      if (h === 0) return;
      cbRef.current(clamp(((e.nativeEvent.pageY - y) / h) * 360, 0, 359.9));
    },
    onPanResponderMove: e => {
      const { y, h } = posRef.current;
      if (h === 0) return;
      cbRef.current(clamp(((e.nativeEvent.pageY - y) / h) * 360, 0, 359.9));
    },
  })).current;

  return (
    <View ref={viewRef} style={css.hueSlider} onLayout={measureView} {...pan.panHandlers}>
      {Array.from({ length: HUE_STRIPS }, (_, i) => {
        const [r, g, b] = hsvToRgb((i / HUE_STRIPS) * 360, 1, 1);
        return (
          <View key={i} style={{
            position: 'absolute',
            top: `${(i / HUE_STRIPS) * 100}%` as any,
            height: `${100 / HUE_STRIPS}%` as any,
            left: 0, right: 0,
            backgroundColor: `rgb(${r},${g},${b})`,
          }} />
        );
      })}
      {height > 0 && (
        <View pointerEvents="none"
          style={[css.sideCursor, { top: (hue / 360) * height - 4 }]} />
      )}
    </View>
  );
}

// ── Alpha slider ──────────────────────────────────────────────────────────────

function AlphaSlider({ alpha, hexColor, onChange }: {
  alpha: number; hexColor: string; onChange: (a: number) => void;
}) {
  const viewRef = useRef<View>(null);
  const posRef  = useRef({ y: 0, h: 0 });
  const cbRef   = useRef(onChange);
  cbRef.current = onChange;

  const [height, setHeight] = useState(0);

  function measureView() {
    viewRef.current?.measure((_fx, _fy, _w, h, _px, py) => {
      posRef.current = { y: py, h };
      setHeight(h);
    });
  }

  const pan = useRef(PanResponder.create({
    onStartShouldSetPanResponder:        () => true,
    onStartShouldSetPanResponderCapture: () => true,
    onMoveShouldSetPanResponder:         () => true,
    onMoveShouldSetPanResponderCapture:  () => true,
    onPanResponderGrant: e => {
      const { y, h } = posRef.current;
      if (h === 0) return;
      cbRef.current(clamp(1 - (e.nativeEvent.pageY - y) / h, 0, 1));
    },
    onPanResponderMove: e => {
      const { y, h } = posRef.current;
      if (h === 0) return;
      cbRef.current(clamp(1 - (e.nativeEvent.pageY - y) / h, 0, 1));
    },
  })).current;

  const rgb = hexToRgb(hexColor) ?? [0, 0, 0];

  return (
    <View ref={viewRef} style={css.alphaSlider} onLayout={measureView} {...pan.panHandlers}>
      {/* Checkerboard base */}
      {Array.from({ length: STRIPS }, (_, i) => (
        <View key={`c${i}`} style={{
          position: 'absolute',
          top: `${(i / STRIPS) * 100}%` as any,
          height: `${100 / STRIPS}%` as any,
          left: 0, right: 0,
          backgroundColor: i % 2 === 0 ? '#CCC' : '#FFF',
        }} />
      ))}
      {/* Color fade (opaque top → transparent bottom) */}
      {Array.from({ length: STRIPS }, (_, i) => (
        <View key={`a${i}`} style={{
          position: 'absolute',
          top: `${(i / STRIPS) * 100}%` as any,
          height: `${100 / STRIPS}%` as any,
          left: 0, right: 0,
          backgroundColor: `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${(1 - i / STRIPS).toFixed(3)})`,
        }} />
      ))}
      {height > 0 && (
        <View pointerEvents="none"
          style={[css.sideCursor, { top: (1 - alpha) * height - 4 }]} />
      )}
    </View>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

interface Props {
  initialColor?: string;
  onSave: (hex: string) => void;
}

export function HsvColorPicker({ initialColor = '#E91E63', onSave }: Props) {
  function parseColor(hex: string): [number, number, number] {
    const rgb = hexToRgb(hex);
    return rgb ? rgbToHsv(...rgb) : [0, 1, 1];
  }

  const init = parseColor(initialColor);
  const [hue,   setHue]   = useState(init[0]);
  const [sat,   setSat]   = useState(init[1]);
  const [val,   setVal]   = useState(init[2]);
  const [alpha, setAlpha] = useState(1);
  const [hexInput, setHexInput] = useState('');

  const rgb        = hsvToRgb(hue, sat, val);
  const currentHex = rgbToHex(...rgb);

  useEffect(() => { setHexInput(currentHex.slice(1)); }, [currentHex]);

  useEffect(() => {
    const [h, s, v] = parseColor(initialColor);
    setHue(h); setSat(s); setVal(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialColor]);

  function handleHexInput(text: string) {
    const clean = text.toUpperCase().replace(/[^0-9A-F]/g, '');
    setHexInput(clean);
    if (clean.length === 6) {
      const parsed = hexToRgb('#' + clean);
      if (parsed) {
        const [h, s, v] = rgbToHsv(...parsed);
        setHue(h); setSat(s); setVal(v);
      }
    }
  }

  return (
    <View style={css.root}>
      <View style={css.pickerRow}>
        <SatValSquare
          hue={hue} sat={sat} val={val}
          onChange={(s, v) => { setSat(s); setVal(v); }} />
        <HueSlider hue={hue} onChange={setHue} />
        <AlphaSlider alpha={alpha} hexColor={currentHex} onChange={setAlpha} />
      </View>

      <View style={css.hexRow}>
        <View style={[css.previewSwatch, { backgroundColor: currentHex }]} />
        <Text style={css.hash}>#</Text>
        <TextInput
          value={hexInput}
          onChangeText={handleHexInput}
          style={css.hexInput}
          autoCapitalize="characters"
          maxLength={6}
          placeholder="000000"
          placeholderTextColor="#CCC"
        />
        <Pressable onPress={() => onSave(currentHex)}
          style={({ pressed }) => [css.saveBtn, pressed && { opacity: 0.8 }]}>
          <Text style={css.saveBtnTxt}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const css = StyleSheet.create({
  root:        { width: '100%' },
  pickerRow:   { flexDirection: 'row', gap: 6, height: SV_HEIGHT },
  svSquare:    { flex: 1, borderRadius: 4, overflow: 'hidden' },
  hueSlider:   { width: HUE_W, borderRadius: 4, overflow: 'hidden' },
  alphaSlider: { width: ALPHA_W, borderRadius: 4, overflow: 'hidden' },

  svCursor: {
    position: 'absolute',
    width: CURSOR_R * 2, height: CURSOR_R * 2,
    borderRadius: CURSOR_R,
    borderWidth: 2.5, borderColor: '#FFFFFF',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5, shadowRadius: 2, elevation: 4,
  },
  sideCursor: {
    position: 'absolute', left: -2, right: -2, height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 1.5, borderColor: 'rgba(0,0,0,0.35)',
    elevation: 3,
  },

  hexRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 10, gap: 6 },
  previewSwatch:{ width: 26, height: 26, borderRadius: 5, borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)' },
  hash:         { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: '#888', fontWeight: FontWeight.bold },
  hexInput:     {
    flex: 1,
    fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: '#1C1C1E',
    borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0',
    paddingVertical: 4, letterSpacing: 1.5,
  },
  saveBtn:    { backgroundColor: '#2E7D32', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 7 },
  saveBtnTxt: { fontFamily: FontFamily.bold, fontSize: 12, color: '#FFF', fontWeight: FontWeight.bold },
});
