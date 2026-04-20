import React from 'react';
import { StyleSheet, View } from 'react-native';

export type IconName =
  | 'search'
  | 'people'
  | 'user'
  | 'truck'
  | 'wrench'
  | 'clipboard'
  | 'bell'
  | 'home'
  | 'gear'
  | 'shield'
  | 'dollar'
  | 'megaphone'
  | 'lock'
  | 'pin'
  | 'headset'
  | 'building'
  | 'briefcase';

interface Props {
  name: IconName;
  color: string;
  size?: number;
}

export function UIIcon({ name, color, size = 20 }: Props) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      {render(name, color, size)}
    </View>
  );
}

function render(name: IconName, c: string, s: number) {
  switch (name) {
    case 'search':     return <SearchG  color={c} s={s} />;
    case 'people':     return <PeopleG  color={c} s={s} />;
    case 'user':       return <UserG    color={c} s={s} />;
    case 'truck':      return <TruckG   color={c} s={s} />;
    case 'wrench':     return <WrenchG  color={c} s={s} />;
    case 'clipboard':  return <ClipG    color={c} s={s} />;
    case 'bell':       return <BellG    color={c} s={s} />;
    case 'home':       return <HomeG    color={c} s={s} />;
    case 'gear':       return <GearG    color={c} s={s} />;
    case 'shield':     return <ShieldG    color={c} s={s} />;
    case 'dollar':     return <DollarG    color={c} s={s} />;
    case 'megaphone':  return <MegaphoneG color={c} s={s} />;
    case 'lock':       return <LockG      color={c} s={s} />;
    case 'pin':        return <PinG       color={c} s={s} />;
    case 'headset':    return <HeadsetG   color={c} s={s} />;
    case 'building':   return <BuildingG  color={c} s={s} />;
    case 'briefcase':  return <BriefcaseG color={c} s={s} />;
  }
}

function BriefcaseG({ color, s }: { color: string; s: number }) {
  return (
    <>
      {/* Handle */}
      <View style={{
        position: 'absolute', top: s * 0.12, left: s * 0.32,
        width: s * 0.36, height: s * 0.18,
        borderTopLeftRadius: s * 0.08, borderTopRightRadius: s * 0.08,
        borderWidth: 1.6, borderColor: color, borderBottomWidth: 0,
      }} />
      {/* Body */}
      <View style={{
        position: 'absolute', top: s * 0.28, left: s * 0.12,
        width: s * 0.76, height: s * 0.56,
        borderRadius: 3,
        borderWidth: 1.6, borderColor: color,
      }} />
      {/* Latch line */}
      <View style={{
        position: 'absolute', top: s * 0.54, left: s * 0.12,
        width: s * 0.76, height: 1.6,
        backgroundColor: color,
      }} />
    </>
  );
}

function ShieldG({ color, s }: { color: string; s: number }) {
  return (
    <View style={{
      position: 'absolute', top: s * 0.08, left: s * 0.18,
      width: s * 0.64, height: s * 0.78,
      borderTopLeftRadius: s * 0.32, borderTopRightRadius: s * 0.32,
      borderBottomLeftRadius: s * 0.5, borderBottomRightRadius: s * 0.5,
      borderWidth: 1.6, borderColor: color,
    }} />
  );
}

function DollarG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.15, left: s * 0.2,
        width: s * 0.6, height: s * 0.3,
        borderTopLeftRadius: s * 0.3, borderTopRightRadius: s * 0.3,
        borderWidth: 1.6, borderColor: color, borderBottomWidth: 0,
      }} />
      <View style={{
        position: 'absolute', bottom: s * 0.15, left: s * 0.2,
        width: s * 0.6, height: s * 0.3,
        borderBottomLeftRadius: s * 0.3, borderBottomRightRadius: s * 0.3,
        borderWidth: 1.6, borderColor: color, borderTopWidth: 0,
      }} />
      <View style={{
        position: 'absolute', top: s * 0.05, left: s * 0.48,
        width: 1.6, height: s * 0.9, backgroundColor: color,
      }} />
    </>
  );
}

function MegaphoneG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.25, left: s * 0.1,
        width: s * 0.55, height: s * 0.5,
        borderWidth: 1.6, borderColor: color,
        borderTopLeftRadius: 2, borderBottomLeftRadius: 2,
      }} />
      <View style={{
        position: 'absolute', top: s * 0.12, right: s * 0.12,
        width: 0, height: 0,
        borderStyle: 'solid',
        borderLeftWidth: s * 0.3,
        borderTopWidth: s * 0.38,
        borderBottomWidth: s * 0.38,
        borderLeftColor: color,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
      }} />
    </>
  );
}

function LockG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.08, left: s * 0.27,
        width: s * 0.46, height: s * 0.38,
        borderTopLeftRadius: s * 0.23, borderTopRightRadius: s * 0.23,
        borderWidth: 1.6, borderColor: color, borderBottomWidth: 0,
      }} />
      <View style={{
        position: 'absolute', bottom: s * 0.1, left: s * 0.18,
        width: s * 0.64, height: s * 0.46,
        borderRadius: 3,
        borderWidth: 1.6, borderColor: color,
      }} />
    </>
  );
}

function PinG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.05, left: s * 0.2,
        width: s * 0.6, height: s * 0.6, borderRadius: s * 0.3,
        borderWidth: 1.6, borderColor: color,
      }} />
      <View style={{
        position: 'absolute', top: s * 0.3, left: s * 0.4,
        width: s * 0.2, height: s * 0.2, borderRadius: s * 0.1,
        backgroundColor: color,
      }} />
      <View style={{
        position: 'absolute', bottom: s * 0.05, left: s * 0.46,
        width: 2, height: s * 0.25,
        backgroundColor: color,
      }} />
    </>
  );
}

function HeadsetG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.18, left: s * 0.15,
        width: s * 0.7, height: s * 0.45,
        borderTopLeftRadius: s * 0.35, borderTopRightRadius: s * 0.35,
        borderWidth: 1.6, borderColor: color, borderBottomWidth: 0,
      }} />
      <View style={{
        position: 'absolute', top: s * 0.4, left: s * 0.12,
        width: s * 0.18, height: s * 0.35,
        borderRadius: 3,
        backgroundColor: color,
      }} />
      <View style={{
        position: 'absolute', top: s * 0.4, right: s * 0.12,
        width: s * 0.18, height: s * 0.35,
        borderRadius: 3,
        backgroundColor: color,
      }} />
    </>
  );
}

function BuildingG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.1, left: s * 0.2,
        width: s * 0.6, height: s * 0.8,
        borderWidth: 1.6, borderColor: color,
      }} />
      {[0.25, 0.45, 0.65].map((t, i) => (
        <React.Fragment key={i}>
          <View style={{
            position: 'absolute', top: s * t, left: s * 0.3,
            width: s * 0.12, height: s * 0.1,
            backgroundColor: color,
          }} />
          <View style={{
            position: 'absolute', top: s * t, right: s * 0.3,
            width: s * 0.12, height: s * 0.1,
            backgroundColor: color,
          }} />
        </React.Fragment>
      ))}
    </>
  );
}

// Search: circle with diagonal handle
function SearchG({ color, s }: { color: string; s: number }) {
  const r = s * 0.42;
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.1, left: s * 0.1,
        width: r, height: r, borderRadius: r / 2,
        borderWidth: 1.6, borderColor: color,
      }} />
      <View style={{
        position: 'absolute', bottom: s * 0.08, right: s * 0.08,
        width: s * 0.32, height: 1.6, backgroundColor: color,
        transform: [{ rotate: '45deg' }], borderRadius: 1,
      }} />
    </>
  );
}

// People: a clearer team silhouette — one centered figure in front,
// two smaller figures peeking out behind on each side.
function PeopleG({ color, s }: { color: string; s: number }) {
  const mainHead = s * 0.32;
  const sideHead = s * 0.22;
  return (
    <>
      {/* Left side person — head */}
      <View style={{
        position: 'absolute', top: s * 0.12, left: s * 0.02,
        width: sideHead, height: sideHead, borderRadius: sideHead / 2,
        borderWidth: 1.5, borderColor: color,
      }} />
      {/* Left side person — shoulder arc */}
      <View style={{
        position: 'absolute', bottom: s * 0.08, left: -s * 0.04,
        width: s * 0.44, height: s * 0.26,
        borderTopLeftRadius: s * 0.22, borderTopRightRadius: s * 0.22,
        borderWidth: 1.5, borderColor: color, borderBottomWidth: 0,
      }} />

      {/* Right side person — head */}
      <View style={{
        position: 'absolute', top: s * 0.12, right: s * 0.02,
        width: sideHead, height: sideHead, borderRadius: sideHead / 2,
        borderWidth: 1.5, borderColor: color,
      }} />
      {/* Right side person — shoulder arc */}
      <View style={{
        position: 'absolute', bottom: s * 0.08, right: -s * 0.04,
        width: s * 0.44, height: s * 0.26,
        borderTopLeftRadius: s * 0.22, borderTopRightRadius: s * 0.22,
        borderWidth: 1.5, borderColor: color, borderBottomWidth: 0,
      }} />

      {/* Center person — head (larger, on top) */}
      <View style={{
        position: 'absolute', top: s * 0.04, left: (s - mainHead) / 2,
        width: mainHead, height: mainHead, borderRadius: mainHead / 2,
        borderWidth: 1.6, borderColor: color,
        backgroundColor: 'transparent',
      }} />
      {/* Center person — shoulders */}
      <View style={{
        position: 'absolute', bottom: s * 0.04, left: s * 0.18, right: s * 0.18,
        height: s * 0.34,
        borderTopLeftRadius: s * 0.32, borderTopRightRadius: s * 0.32,
        borderWidth: 1.6, borderColor: color, borderBottomWidth: 0,
      }} />
    </>
  );
}

// User: single head + rounded shoulders with a small heart accent
function UserG({ color, s }: { color: string; s: number }) {
  const head = s * 0.38;
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.06, left: (s - head) / 2,
        width: head, height: head, borderRadius: head / 2,
        borderWidth: 1.6, borderColor: color,
      }} />
      <View style={{
        position: 'absolute', bottom: s * 0.08, left: s * 0.12, right: s * 0.12,
        height: s * 0.4,
        borderTopLeftRadius: s * 0.4, borderTopRightRadius: s * 0.4,
        borderWidth: 1.6, borderColor: color, borderBottomWidth: 0,
      }} />
    </>
  );
}

// Truck: cab + box + wheels
function TruckG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', left: s * 0.05, top: s * 0.28,
        width: s * 0.5, height: s * 0.4,
        borderWidth: 1.5, borderColor: color, borderRadius: 1.5,
      }} />
      <View style={{
        position: 'absolute', right: s * 0.05, top: s * 0.4,
        width: s * 0.35, height: s * 0.28,
        borderWidth: 1.5, borderColor: color, borderRadius: 1.5,
      }} />
      <View style={{
        position: 'absolute', left: s * 0.18, bottom: s * 0.05,
        width: s * 0.16, height: s * 0.16, borderRadius: s * 0.08,
        borderWidth: 1.5, borderColor: color,
      }} />
      <View style={{
        position: 'absolute', right: s * 0.1, bottom: s * 0.05,
        width: s * 0.16, height: s * 0.16, borderRadius: s * 0.08,
        borderWidth: 1.5, borderColor: color,
      }} />
    </>
  );
}

// Wrench: angled handle with open head
function WrenchG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.08, left: s * 0.08,
        width: s * 0.3, height: s * 0.3, borderRadius: s * 0.15,
        borderWidth: 2, borderColor: color,
      }} />
      <View style={{
        position: 'absolute', bottom: s * 0.1, right: s * 0.08,
        width: s * 0.55, height: 2.2,
        backgroundColor: color,
        transform: [{ rotate: '45deg' }], borderRadius: 1,
      }} />
    </>
  );
}

// Clipboard: board + clip
function ClipG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', left: s * 0.15, top: s * 0.18,
        width: s * 0.7, height: s * 0.7,
        borderWidth: 1.5, borderColor: color, borderRadius: 2,
      }} />
      <View style={{
        position: 'absolute', top: s * 0.08, left: s * 0.3,
        width: s * 0.4, height: s * 0.2,
        borderWidth: 1.5, borderColor: color, borderRadius: 2,
        backgroundColor: color,
      }} />
    </>
  );
}

// Bell: dome + base + clapper
function BellG({ color, s }: { color: string; s: number }) {
  return (
    <>
      <View style={{
        position: 'absolute', top: s * 0.1, left: s * 0.15,
        width: s * 0.7, height: s * 0.55,
        borderTopLeftRadius: s * 0.35, borderTopRightRadius: s * 0.35,
        borderWidth: 1.5, borderColor: color, borderBottomWidth: 0,
      }} />
      <View style={{
        position: 'absolute', top: s * 0.63, left: s * 0.08,
        width: s * 0.84, height: 1.8, backgroundColor: color, borderRadius: 1,
      }} />
      <View style={{
        position: 'absolute', bottom: s * 0.08, left: s * 0.42,
        width: s * 0.16, height: s * 0.16, borderRadius: s * 0.08,
        backgroundColor: color,
      }} />
    </>
  );
}

// Home: roof triangle + body
function HomeG({ color, s }: { color: string; s: number }) {
  return (
    <>
      {/* Roof — rotated square, clipped visually by body */}
      <View style={{
        position: 'absolute', top: s * 0.14, left: s * 0.25,
        width: s * 0.5, height: s * 0.5,
        borderTopWidth: 1.6, borderLeftWidth: 1.6,
        borderColor: color,
        transform: [{ rotate: '45deg' }],
      }} />
      {/* Body */}
      <View style={{
        position: 'absolute', bottom: s * 0.1, left: s * 0.2,
        width: s * 0.6, height: s * 0.42,
        borderWidth: 1.6, borderColor: color, borderTopWidth: 0,
      }} />
      {/* Door */}
      <View style={{
        position: 'absolute', bottom: s * 0.1, left: s * 0.42,
        width: s * 0.16, height: s * 0.22,
        borderWidth: 1.3, borderColor: color, borderBottomWidth: 0,
      }} />
    </>
  );
}

// Gear: outer ring, 8 teeth, center hole
function GearG({ color, s }: { color: string; s: number }) {
  const teeth = Array.from({ length: 8 });
  return (
    <>
      {teeth.map((_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            width: s * 0.12, height: s * 0.12,
            borderRadius: 1,
            backgroundColor: color,
            transform: [{ rotate: `${i * 45}deg` }, { translateY: -s * 0.42 }],
          }}
        />
      ))}
      <View style={{
        position: 'absolute',
        width: s * 0.65, height: s * 0.65, borderRadius: s * 0.325,
        borderWidth: 2, borderColor: color,
      }} />
      <View style={{
        position: 'absolute',
        width: s * 0.22, height: s * 0.22, borderRadius: s * 0.11,
        borderWidth: 1.3, borderColor: color,
      }} />
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
});
