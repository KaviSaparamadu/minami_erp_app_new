import React from 'react';
import { StyleSheet, View } from 'react-native';

interface Props {
  name?: string;
  color: string;
  size?: number;
}

/**
 * Pure-RN glyphs for sidebar entries.
 * Primary modules get distinct shapes; sub-modules fall back to a dot.
 */
export function SidebarIcon({ name, color, size = 18 }: Props) {
  const Icon = ICON_MAP[name ?? ''] ?? GenericIcon;
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Icon color={color} />
    </View>
  );
}

// ── Primary module icons ────────────────────────────────────────────────────

function DashboardIcon({ color }: { color: string }) {
  return (
    <View style={styles.grid}>
      <View style={[styles.gridCell, { backgroundColor: color }]} />
      <View style={[styles.gridCell, { backgroundColor: color }]} />
      <View style={[styles.gridCell, { backgroundColor: color }]} />
      <View style={[styles.gridCell, { backgroundColor: color }]} />
    </View>
  );
}

function SalesIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.tag, { borderColor: color }]} />
      <View style={[styles.tagDot, { backgroundColor: color }]} />
    </View>
  );
}

function InventoryIcon({ color }: { color: string }) {
  return (
    <View style={styles.stack}>
      <View style={[styles.stackBar, { backgroundColor: color }]} />
      <View style={[styles.stackBar, { backgroundColor: color }]} />
      <View style={[styles.stackBar, { backgroundColor: color }]} />
    </View>
  );
}

function FinanceIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.coin, { borderColor: color }]} />
      <View style={[styles.coinBar, { backgroundColor: color }]} />
    </View>
  );
}

function HRIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.head, { backgroundColor: color }]} />
      <View style={[styles.shoulders, { backgroundColor: color }]} />
    </View>
  );
}

function PurchaseIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.cart, { borderColor: color }]} />
      <View style={[styles.wheel, styles.wheelL, { backgroundColor: color }]} />
      <View style={[styles.wheel, styles.wheelR, { backgroundColor: color }]} />
    </View>
  );
}

function ReportsIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.doc, { borderColor: color }]} />
      <View style={[styles.docLine, { backgroundColor: color, top: 5 }]} />
      <View style={[styles.docLine, { backgroundColor: color, top: 9 }]} />
      <View style={[styles.docLine, { backgroundColor: color, top: 13 }]} />
    </View>
  );
}

// ── Generic fallback for sub-modules ────────────────────────────────────────

function GenericIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.dot, { backgroundColor: color }]} />
    </View>
  );
}

// Human Management — group of people (two silhouettes)
function HumanIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      {/* Back person */}
      <View style={[styles.grpHeadBack, { backgroundColor: color }]} />
      <View style={[styles.grpBodyBack, { backgroundColor: color }]} />
      {/* Front person */}
      <View style={[styles.grpHeadFront, { backgroundColor: color }]} />
      <View style={[styles.grpBodyFront, { backgroundColor: color }]} />
    </View>
  );
}

// Employee Management — ID card with photo + lines
function EmployeeIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.idCard, { borderColor: color }]} />
      <View style={[styles.idPhoto, { backgroundColor: color }]} />
      <View style={[styles.idLine, { backgroundColor: color, top: 6 }]} />
      <View style={[styles.idLine, { backgroundColor: color, top: 10 }]} />
    </View>
  );
}

// User Management — person with cog/gear
function UserIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.umHead, { backgroundColor: color }]} />
      <View style={[styles.umBody, { backgroundColor: color }]} />
      <View style={[styles.umGearOuter, { borderColor: color }]} />
      <View style={[styles.umGearCenter, { backgroundColor: color }]} />
    </View>
  );
}

function UserPlusIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.upHead, { backgroundColor: color }]} />
      <View style={[styles.upBody, { backgroundColor: color }]} />
      <View style={[styles.plusH, { backgroundColor: color }]} />
      <View style={[styles.plusV, { backgroundColor: color }]} />
    </View>
  );
}

function UserKeyIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.upHead, { backgroundColor: color }]} />
      <View style={[styles.upBody, { backgroundColor: color }]} />
      <View style={[styles.keyRing, { borderColor: color }]} />
      <View style={[styles.keyTeeth, { backgroundColor: color }]} />
    </View>
  );
}

function UserRoleIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.personHead, { backgroundColor: color }]} />
      <View style={[styles.personBody, { backgroundColor: color }]} />
      <View style={[styles.crown, { borderBottomColor: color }]} />
    </View>
  );
}

function UserRoleKeyIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.upHead, { backgroundColor: color }]} />
      <View style={[styles.crown, { borderBottomColor: color }]} />
      <View style={[styles.keyRing, { borderColor: color }]} />
      <View style={[styles.keyTeeth, { backgroundColor: color }]} />
    </View>
  );
}

function AdminIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.shield, { borderColor: color }]} />
      <View style={[styles.shieldTick, { borderColor: color }]} />
    </View>
  );
}

function ProcurementIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.cart, { borderColor: color }]} />
      <View style={[styles.wheel, styles.wheelL, { backgroundColor: color }]} />
      <View style={[styles.wheel, styles.wheelR, { backgroundColor: color }]} />
    </View>
  );
}

function OperationIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.gearOuter, { borderColor: color }]} />
      <View style={[styles.gearInner, { backgroundColor: color }]} />
    </View>
  );
}

function MarketingIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.megaBody, { borderColor: color }]} />
      <View style={[styles.megaMouth, { backgroundColor: color }]} />
    </View>
  );
}

function SecurityIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.shieldFilled, { backgroundColor: color }]} />
      <View style={[styles.starDot, { backgroundColor: '#FFFFFF' }]} />
    </View>
  );
}

function LocationIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.pinBody, { backgroundColor: color }]} />
      <View style={[styles.pinTip, { borderTopColor: color }]} />
      <View style={styles.pinHole} />
    </View>
  );
}

function CustomerIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.bubble, { borderColor: color }]} />
      <View style={[styles.bubbleTail, { borderTopColor: color }]} />
      <View style={[styles.bubbleDot, { backgroundColor: color, left: 4 }]} />
      <View style={[styles.bubbleDot, { backgroundColor: color, left: 8 }]} />
      <View style={[styles.bubbleDot, { backgroundColor: color, left: 12 }]} />
    </View>
  );
}

function EnterpriseIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.building, { borderColor: color }]} />
      <View style={[styles.winRow, { top: 4 }]}>
        <View style={[styles.win, { backgroundColor: color }]} />
        <View style={[styles.win, { backgroundColor: color }]} />
      </View>
      <View style={[styles.winRow, { top: 9 }]}>
        <View style={[styles.win, { backgroundColor: color }]} />
        <View style={[styles.win, { backgroundColor: color }]} />
      </View>
    </View>
  );
}

const ICON_MAP: Record<string, React.FC<{ color: string }>> = {
  dashboard:   DashboardIcon,
  sales:       SalesIcon,
  inventory:   InventoryIcon,
  finance:     FinanceIcon,
  hr:              HRIcon,
  human:           HumanIcon,
  employee:        EmployeeIcon,
  user:            UserIcon,
  'user-plus':     UserPlusIcon,
  'user-key':      UserKeyIcon,
  'user-role':     UserRoleIcon,
  'user-role-key': UserRoleKeyIcon,
  purchase:    PurchaseIcon,
  reports:     ReportsIcon,
  admin:       AdminIcon,
  procurement: ProcurementIcon,
  operation:   OperationIcon,
  marketing:   MarketingIcon,
  security:    SecurityIcon,
  location:    LocationIcon,
  customer:    CustomerIcon,
  enterprise:  EnterpriseIcon,
};

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center' },
  center: { width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },

  // Dashboard — 2x2 grid
  grid: {
    width: 16, height: 16,
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'space-between', alignContent: 'space-between',
  },
  gridCell: { width: 7, height: 7, borderRadius: 1.5 },

  // Sales — tag
  tag: {
    width: 14, height: 14,
    borderWidth: 1.5, borderRadius: 3,
    transform: [{ rotate: '-12deg' }],
  },
  tagDot: {
    position: 'absolute',
    width: 3, height: 3, borderRadius: 1.5,
    top: 3, right: 3,
  },

  // Inventory — stacked bars
  stack: { width: 16, height: 16, justifyContent: 'space-between' },
  stackBar: { width: '100%', height: 3, borderRadius: 1 },

  // Finance — coin with bar
  coin: {
    width: 15, height: 15,
    borderWidth: 1.5, borderRadius: 8,
  },
  coinBar: {
    position: 'absolute',
    width: 2, height: 8, borderRadius: 1,
  },

  // HR — person
  head: {
    width: 7, height: 7, borderRadius: 4,
    position: 'absolute', top: 1,
  },
  shoulders: {
    width: 14, height: 7,
    borderTopLeftRadius: 7, borderTopRightRadius: 7,
    position: 'absolute', bottom: 1,
  },

  // Purchase — cart
  cart: {
    width: 14, height: 9,
    borderWidth: 1.5, borderRadius: 2,
    position: 'absolute', top: 2,
  },
  wheel: {
    position: 'absolute',
    width: 3, height: 3, borderRadius: 2,
    bottom: 1,
  },
  wheelL: { left: 3 },
  wheelR: { right: 3 },

  // Reports — document
  doc: {
    width: 12, height: 15,
    borderWidth: 1.5, borderRadius: 2,
  },
  docLine: {
    position: 'absolute',
    left: 5, width: 8, height: 1.5, borderRadius: 1,
  },

  // Generic — dot
  dot: { width: 6, height: 6, borderRadius: 3 },

  // Admin — shield with tick
  shield: {
    width: 13, height: 15,
    borderWidth: 1.5,
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
    borderBottomLeftRadius: 7, borderBottomRightRadius: 7,
  },
  shieldTick: {
    position: 'absolute',
    width: 5, height: 3,
    borderLeftWidth: 1.5, borderBottomWidth: 1.5,
    transform: [{ rotate: '-45deg' }],
    top: 6,
  },

  // Operation — gear
  gearOuter: {
    width: 14, height: 14, borderRadius: 8,
    borderWidth: 1.5,
  },
  gearInner: {
    position: 'absolute',
    width: 4, height: 4, borderRadius: 2,
  },

  // Marketing — megaphone
  megaBody: {
    width: 14, height: 8,
    borderWidth: 1.5,
    borderTopLeftRadius: 2, borderBottomLeftRadius: 2,
    borderTopRightRadius: 6, borderBottomRightRadius: 6,
  },
  megaMouth: {
    position: 'absolute',
    width: 3, height: 4, borderRadius: 1,
    right: 1,
  },

  // Security — filled shield with star dot
  shieldFilled: {
    width: 13, height: 15,
    borderTopLeftRadius: 3, borderTopRightRadius: 3,
    borderBottomLeftRadius: 7, borderBottomRightRadius: 7,
  },
  starDot: {
    position: 'absolute',
    width: 4, height: 4, borderRadius: 2,
    top: 5,
  },

  // Location — map pin
  pinBody: {
    width: 10, height: 10, borderRadius: 5,
    position: 'absolute', top: 1,
  },
  pinTip: {
    position: 'absolute',
    width: 0, height: 0,
    borderLeftWidth: 4, borderRightWidth: 4,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    bottom: 1,
  },
  pinHole: {
    position: 'absolute',
    width: 3, height: 3, borderRadius: 2,
    backgroundColor: '#FFFFFF',
    top: 4,
  },

  // Customer — chat bubble with dots
  bubble: {
    width: 16, height: 12,
    borderWidth: 1.5, borderRadius: 3,
    position: 'absolute', top: 1,
  },
  bubbleTail: {
    position: 'absolute',
    width: 0, height: 0,
    borderLeftWidth: 3, borderRightWidth: 3,
    borderTopWidth: 3,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    left: 4, bottom: 2,
  },
  bubbleDot: {
    position: 'absolute',
    width: 2, height: 2, borderRadius: 1,
    top: 6,
  },

  // Shared person silhouette (still used by sub-sub-icons like user-plus/key/role)
  personHead: {
    width: 7, height: 7, borderRadius: 4,
    position: 'absolute', top: 1,
  },
  personBody: {
    width: 14, height: 7,
    borderTopLeftRadius: 7, borderTopRightRadius: 7,
    position: 'absolute', bottom: 1,
  },

  // Human Management — group of 2 people
  grpHeadBack: {
    position: 'absolute',
    width: 5, height: 5, borderRadius: 3,
    top: 0, left: 2,
  },
  grpBodyBack: {
    position: 'absolute',
    width: 10, height: 5,
    borderTopLeftRadius: 5, borderTopRightRadius: 5,
    top: 6, left: 0,
  },
  grpHeadFront: {
    position: 'absolute',
    width: 6, height: 6, borderRadius: 3,
    top: 2, right: 1,
  },
  grpBodyFront: {
    position: 'absolute',
    width: 12, height: 7,
    borderTopLeftRadius: 6, borderTopRightRadius: 6,
    bottom: 0, right: -1,
  },

  // Employee Management — ID card
  idCard: {
    width: 16, height: 14,
    borderWidth: 1.5, borderRadius: 2,
  },
  idPhoto: {
    position: 'absolute',
    width: 4, height: 4, borderRadius: 1,
    top: 3, left: 3,
  },
  idLine: {
    position: 'absolute',
    width: 6, height: 1.25, borderRadius: 1,
    right: 3,
  },

  // User Management — person with gear
  umHead: {
    position: 'absolute',
    width: 5, height: 5, borderRadius: 3,
    top: 1, left: 2,
  },
  umBody: {
    position: 'absolute',
    width: 10, height: 5,
    borderTopLeftRadius: 5, borderTopRightRadius: 5,
    top: 7, left: 0,
  },
  umGearOuter: {
    position: 'absolute',
    width: 7, height: 7, borderRadius: 4,
    borderWidth: 1.5,
    right: 0, bottom: 0,
  },
  umGearCenter: {
    position: 'absolute',
    width: 1.5, height: 1.5, borderRadius: 1,
    right: 2.75, bottom: 2.75,
  },

  // User + / Key / Role — shared compact person (upper-left) with accessory
  upHead: {
    width: 6, height: 6, borderRadius: 3,
    position: 'absolute', top: 1, left: 2,
  },
  upBody: {
    width: 10, height: 5,
    borderTopLeftRadius: 5, borderTopRightRadius: 5,
    position: 'absolute', top: 7, left: 0,
  },
  plusH: {
    position: 'absolute',
    width: 6, height: 1.5, borderRadius: 1,
    right: 0, bottom: 3,
  },
  plusV: {
    position: 'absolute',
    width: 1.5, height: 6, borderRadius: 1,
    right: 2.25, bottom: 0.75,
  },
  keyRing: {
    position: 'absolute',
    width: 5, height: 5, borderRadius: 3,
    borderWidth: 1.25,
    right: 0, bottom: 1,
  },
  keyTeeth: {
    position: 'absolute',
    width: 4, height: 1.25, borderRadius: 1,
    right: 4.5, bottom: 2.25,
  },
  crown: {
    position: 'absolute',
    width: 0, height: 0,
    borderLeftWidth: 4, borderRightWidth: 4,
    borderBottomWidth: 4,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    top: -1,
  },

  // Enterprise — building
  building: {
    width: 14, height: 16,
    borderWidth: 1.5, borderRadius: 2,
  },
  winRow: {
    position: 'absolute',
    left: 3, right: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  win: {
    width: 3, height: 3, borderRadius: 1,
  },
});
