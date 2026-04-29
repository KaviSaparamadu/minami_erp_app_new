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

// System Settings — gear with centre dot
function SysSettingsIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.sysGearOuter, { borderColor: color }]} />
      <View style={[styles.sysGearCenter, { backgroundColor: color }]} />
      <View style={[styles.sysGearTooth, { backgroundColor: color, top: 0, left: 6 }]} />
      <View style={[styles.sysGearTooth, { backgroundColor: color, bottom: 0, left: 6 }]} />
      <View style={[styles.sysGearToothH, { backgroundColor: color, left: 0, top: 6 }]} />
      <View style={[styles.sysGearToothH, { backgroundColor: color, right: 0, top: 6 }]} />
    </View>
  );
}

// General Settings — three horizontal sliders with knobs at different positions
function GenSettingsIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.sliderTrack, { backgroundColor: color, top: 3 }]} />
      <View style={[styles.sliderKnob, { backgroundColor: color, top: 1, left: 10 }]} />
      <View style={[styles.sliderTrack, { backgroundColor: color, top: 8 }]} />
      <View style={[styles.sliderKnob, { backgroundColor: color, top: 6, left: 5 }]} />
      <View style={[styles.sliderTrack, { backgroundColor: color, top: 13 }]} />
      <View style={[styles.sliderKnob, { backgroundColor: color, top: 11, left: 8 }]} />
    </View>
  );
}

// System Default Settings — clipboard with tick
function SysDefaultsIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.defBoard, { borderColor: color }]} />
      <View style={[styles.defClip, { borderColor: color }]} />
      <View style={[styles.defTickH, { borderColor: color }]} />
      <View style={[styles.defTickV, { borderColor: color }]} />
    </View>
  );
}

// Support Ticket — ticket shape split in two halves
function SupportTicketIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.ticketLeft, { borderColor: color }]} />
      <View style={[styles.ticketRight, { borderColor: color }]} />
      <View style={[styles.ticketPerf, { backgroundColor: color, top: 4 }]} />
      <View style={[styles.ticketPerf, { backgroundColor: color, top: 8 }]} />
      <View style={[styles.ticketPerf, { backgroundColor: color, top: 12 }]} />
    </View>
  );
}

// Activity Log — document with bullet lines
function ActivityLogIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.logDoc, { borderColor: color }]} />
      <View style={[styles.logBullet, { backgroundColor: color, top: 5 }]} />
      <View style={[styles.logLine, { backgroundColor: color, top: 6 }]} />
      <View style={[styles.logBullet, { backgroundColor: color, top: 9 }]} />
      <View style={[styles.logLine, { backgroundColor: color, top: 10 }]} />
      <View style={[styles.logBullet, { backgroundColor: color, top: 13 }]} />
      <View style={[styles.logLine, { backgroundColor: color, top: 14 }]} />
    </View>
  );
}

// System Work Flow — two connected nodes with arrow
function WorkflowIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.wfNodeL, { borderColor: color }]} />
      <View style={[styles.wfNodeR, { borderColor: color }]} />
      <View style={[styles.wfLine, { backgroundColor: color }]} />
      <View style={[styles.wfArrow, { borderColor: color }]} />
    </View>
  );
}

// Entities — building with flag
function EntitiesIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.entBuilding, { borderColor: color }]} />
      <View style={[styles.entDoor, { borderColor: color }]} />
      <View style={[styles.entWin, { backgroundColor: color, top: 4, left: 4 }]} />
      <View style={[styles.entWin, { backgroundColor: color, top: 4, right: 4 }]} />
    </View>
  );
}

// Business Structure — org-chart nodes
function BizStructureIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.bsTopNode, { borderColor: color }]} />
      <View style={[styles.bsLine, { backgroundColor: color }]} />
      <View style={[styles.bsRow]}>
        <View style={[styles.bsChildNode, { borderColor: color }]} />
        <View style={[styles.bsChildNode, { borderColor: color }]} />
      </View>
    </View>
  );
}

// Finance Institutes & Acc — bank pillars
function FinInstitutesIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.fiRoof, { backgroundColor: color }]} />
      <View style={[styles.fiPillar, { backgroundColor: color, left: 3 }]} />
      <View style={[styles.fiPillar, { backgroundColor: color, left: 7 }]} />
      <View style={[styles.fiPillar, { backgroundColor: color, left: 11 }]} />
      <View style={[styles.fiBase, { backgroundColor: color }]} />
    </View>
  );
}

// Books & Accounts — open book
function BooksIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.bookL, { borderColor: color }]} />
      <View style={[styles.bookR, { borderColor: color }]} />
      <View style={[styles.bookSp, { backgroundColor: color }]} />
      <View style={[styles.bookLn, { backgroundColor: color, top: 6 }]} />
      <View style={[styles.bookLn, { backgroundColor: color, top: 10 }]} />
    </View>
  );
}

// Utility Service — lightning bolt
function UtilityIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.boltTop, { borderBottomColor: color, borderLeftColor: color }]} />
      <View style={[styles.boltMid, { backgroundColor: color }]} />
      <View style={[styles.boltBot, { borderTopColor: color, borderRightColor: color }]} />
    </View>
  );
}

// Service Provider — handshake (two overlapping hands)
function ProviderIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.handL, { borderColor: color }]} />
      <View style={[styles.handR, { borderColor: color }]} />
      <View style={[styles.handBar, { backgroundColor: color }]} />
    </View>
  );
}

// Tax — percent symbol
function TaxIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.pctDotT, { backgroundColor: color }]} />
      <View style={[styles.pctDotB, { backgroundColor: color }]} />
      <View style={[styles.pctSlash, { backgroundColor: color }]} />
    </View>
  );
}

// POS — cash register body + screen
function POSIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.posBody, { borderColor: color }]} />
      <View style={[styles.posScreen, { backgroundColor: color }]} />
      <View style={[styles.posBase, { backgroundColor: color }]} />
    </View>
  );
}

// Bank Card Machine — card with chip
function BankCardIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.cardBody, { borderColor: color }]} />
      <View style={[styles.cardChip, { borderColor: color }]} />
      <View style={[styles.cardStripe, { backgroundColor: color }]} />
    </View>
  );
}

// Loyalty Points — star
function LoyaltyIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.starOuter, { borderColor: color }]} />
      <View style={[styles.starInner, { backgroundColor: color }]} />
      <View style={[styles.starTop, { borderBottomColor: color }]} />
    </View>
  );
}

// Chart of Accounts — list with account lines
function ChartOfAccountsIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.coaDoc, { borderColor: color }]} />
      <View style={[styles.coaLine, { backgroundColor: color, top: 5, left: 5, width: 8 }]} />
      <View style={[styles.coaLine, { backgroundColor: color, top: 8, left: 7, width: 5 }]} />
      <View style={[styles.coaLine, { backgroundColor: color, top: 11, left: 5, width: 8 }]} />
      <View style={[styles.coaLine, { backgroundColor: color, top: 14, left: 7, width: 5 }]} />
    </View>
  );
}

// Finance Reports Generator — bar chart with magnifier
function FinReportsIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.frBar, { backgroundColor: color, height: 6, left: 2, bottom: 2 }]} />
      <View style={[styles.frBar, { backgroundColor: color, height: 10, left: 7, bottom: 2 }]} />
      <View style={[styles.frBar, { backgroundColor: color, height: 8, left: 12, bottom: 2 }]} />
      <View style={[styles.frLens, { borderColor: color }]} />
      <View style={[styles.frHandle, { backgroundColor: color }]} />
    </View>
  );
}

// Ledger Connection Console — two nodes with double arrow
function LedgerConnectIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.lcNodeL, { borderColor: color }]} />
      <View style={[styles.lcNodeR, { borderColor: color }]} />
      <View style={[styles.lcLine, { backgroundColor: color }]} />
      <View style={[styles.lcArrR, { borderColor: color }]} />
      <View style={[styles.lcArrL, { borderColor: color }]} />
    </View>
  );
}

// Opening Balance Console — scale / balance beam
function OpeningBalanceIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.obBeam, { backgroundColor: color }]} />
      <View style={[styles.obPole, { backgroundColor: color }]} />
      <View style={[styles.obBase, { backgroundColor: color }]} />
      <View style={[styles.obPan, { borderColor: color, left: 1 }]} />
      <View style={[styles.obPan, { borderColor: color, right: 1 }]} />
    </View>
  );
}

// Journal Entry — pencil writing on lines
function JournalEntryIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.jeLine, { backgroundColor: color, top: 5 }]} />
      <View style={[styles.jeLine, { backgroundColor: color, top: 9 }]} />
      <View style={[styles.jeLine, { backgroundColor: color, top: 13 }]} />
      <View style={[styles.jePencilBody, { borderColor: color }]} />
      <View style={[styles.jePencilTip, { borderBottomColor: color }]} />
    </View>
  );
}

// Finance Utilities — calculator grid
function FinanceUtilitiesIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.calcBody, { borderColor: color }]} />
      <View style={[styles.calcScreen, { backgroundColor: color }]} />
      <View style={[styles.calcDot, { backgroundColor: color, left: 4, bottom: 4 }]} />
      <View style={[styles.calcDot, { backgroundColor: color, left: 8, bottom: 4 }]} />
      <View style={[styles.calcDot, { backgroundColor: color, left: 12, bottom: 4 }]} />
    </View>
  );
}

// Ledger Management — open book with horizontal lines
function LedgerIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.bookLeft, { borderColor: color }]} />
      <View style={[styles.bookRight, { borderColor: color }]} />
      <View style={[styles.bookSpine, { backgroundColor: color }]} />
      <View style={[styles.bookLine, { backgroundColor: color, top: 5 }]} />
      <View style={[styles.bookLine, { backgroundColor: color, top: 9 }]} />
      <View style={[styles.bookLine, { backgroundColor: color, top: 13 }]} />
    </View>
  );
}

// Finance Operation — two arrows forming a cycle
function FinanceOperationIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.opBox, { borderColor: color }]} />
      <View style={[styles.opArrowR, { borderColor: color }]} />
      <View style={[styles.opArrowL, { borderColor: color }]} />
    </View>
  );
}

// Finance Operation — POS terminal with display
function FoPosIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.foTermBody, { borderColor: color }]} />
      <View style={[styles.foTermScreen, { backgroundColor: color }]} />
      <View style={[styles.foTermKeypad, { borderColor: color }]} />
      <View style={[styles.foTermBase, { backgroundColor: color }]} />
    </View>
  );
}

// Manage POS Points — coin with star burst
function FoPosPointsIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.foPtCoin, { borderColor: color }]} />
      <View style={[styles.foPtBar, { backgroundColor: color }]} />
      <View style={[styles.foPtRay, { backgroundColor: color, transform: [{ rotate: '0deg' }] }]} />
      <View style={[styles.foPtRay, { backgroundColor: color, transform: [{ rotate: '60deg' }] }]} />
      <View style={[styles.foPtRay, { backgroundColor: color, transform: [{ rotate: '120deg' }] }]} />
    </View>
  );
}

// Simple Invoice — document with dollar sign
function FoInvoiceIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.foInvDoc, { borderColor: color }]} />
      <View style={[styles.foInvLine, { backgroundColor: color, top: 5 }]} />
      <View style={[styles.foInvLine, { backgroundColor: color, top: 9 }]} />
      <View style={[styles.foInvDollar, { borderColor: color }]} />
    </View>
  );
}

// Manage Bank Card Machine — card reader with slot
function FoBankCardIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.foBcrBody, { borderColor: color }]} />
      <View style={[styles.foBcrSlot, { backgroundColor: color }]} />
      <View style={[styles.foBcrScreen, { backgroundColor: color }]} />
      <View style={[styles.foBcrBtn, { backgroundColor: color }]} />
    </View>
  );
}

// Purchasing — shopping cart with tick
function PurchasingIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.cart, { borderColor: color }]} />
      <View style={[styles.wheel, styles.wheelL, { backgroundColor: color }]} />
      <View style={[styles.wheel, styles.wheelR, { backgroundColor: color }]} />
      <View style={[styles.procTickH, { borderColor: color }]} />
      <View style={[styles.procTickV, { borderColor: color }]} />
    </View>
  );
}

// Stores & Inventory — warehouse shelves
function StoresInventoryIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.siShelf, { backgroundColor: color, top: 3 }]} />
      <View style={[styles.siShelf, { backgroundColor: color, top: 9 }]} />
      <View style={[styles.siShelf, { backgroundColor: color, top: 15 }]} />
      <View style={[styles.siPost, { backgroundColor: color, left: 1 }]} />
      <View style={[styles.siPost, { backgroundColor: color, right: 1 }]} />
    </View>
  );
}

// Logistics — truck with arrow
function LogisticsIcon({ color }: { color: string }) {
  return (
    <View style={styles.center}>
      <View style={[styles.lgBody, { borderColor: color }]} />
      <View style={[styles.lgCab, { borderColor: color }]} />
      <View style={[styles.lgWheelL, { borderColor: color }]} />
      <View style={[styles.lgWheelR, { borderColor: color }]} />
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
  admin:               AdminIcon,
  'sys-settings':      SysSettingsIcon,
  'gen-settings':      GenSettingsIcon,
  'sys-defaults':      SysDefaultsIcon,
  'support-ticket':    SupportTicketIcon,
  'activity-log':      ActivityLogIcon,
  workflow:            WorkflowIcon,
  'lm-coa':            ChartOfAccountsIcon,
  'lm-reports':        FinReportsIcon,
  'lm-connect':        LedgerConnectIcon,
  'lm-opening-bal':    OpeningBalanceIcon,
  'lm-journal':        JournalEntryIcon,
  'finance-utilities': FinanceUtilitiesIcon,
  ledger:              LedgerIcon,
  'finance-operation': FinanceOperationIcon,
  'fu-entities':       EntitiesIcon,
  'fu-biz-structure':  BizStructureIcon,
  'fu-fin-institutes': FinInstitutesIcon,
  'fu-books':          BooksIcon,
  'fu-utility':        UtilityIcon,
  'fu-provider':       ProviderIcon,
  'fu-tax':            TaxIcon,
  'fu-pos':            POSIcon,
  'fu-bank-card':      BankCardIcon,
  'fu-loyalty':        LoyaltyIcon,
  'fo-pos':            FoPosIcon,
  'fo-pos-points':     FoPosPointsIcon,
  'fo-invoice':        FoInvoiceIcon,
  'fo-bank-card':      FoBankCardIcon,
  'proc-purchasing':   PurchasingIcon,
  'proc-stores':       StoresInventoryIcon,
  'proc-logistics':    LogisticsIcon,
  procurement:         ProcurementIcon,
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

  // Finance Utilities — calculator
  calcBody: {
    width: 14, height: 16, borderWidth: 1.5, borderRadius: 2,
  },
  calcScreen: {
    position: 'absolute', top: 3, left: 3,
    width: 8, height: 4, borderRadius: 1,
  },
  calcDot: {
    position: 'absolute',
    width: 2, height: 2, borderRadius: 1,
  },

  // Ledger Management — open book
  bookLeft: {
    position: 'absolute', left: 1, top: 2,
    width: 7, height: 14,
    borderWidth: 1.5, borderRadius: 1,
    borderRightWidth: 0,
  },
  bookRight: {
    position: 'absolute', right: 1, top: 2,
    width: 7, height: 14,
    borderWidth: 1.5, borderRadius: 1,
    borderLeftWidth: 0,
  },
  bookSpine: {
    position: 'absolute', left: 8,
    width: 1.5, height: 14, top: 2,
  },
  bookLine: {
    position: 'absolute', right: 3,
    width: 4, height: 1.25, borderRadius: 1,
  },

  // Finance Operation — process box with arrows
  opBox: {
    width: 10, height: 10,
    borderWidth: 1.5, borderRadius: 2,
  },
  opArrowR: {
    position: 'absolute', top: 3, right: 0,
    width: 5, height: 5,
    borderTopWidth: 1.5, borderRightWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },
  opArrowL: {
    position: 'absolute', bottom: 3, left: 0,
    width: 5, height: 5,
    borderBottomWidth: 1.5, borderLeftWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },

  // System Settings — gear ring + teeth + centre dot
  sysGearOuter: {
    width: 12, height: 12, borderRadius: 6,
    borderWidth: 1.5,
  },
  sysGearCenter: {
    position: 'absolute',
    width: 3, height: 3, borderRadius: 1.5,
  },
  sysGearTooth: {
    position: 'absolute',
    width: 3, height: 3, borderRadius: 0.5,
  },
  sysGearToothH: {
    position: 'absolute',
    width: 3, height: 3, borderRadius: 0.5,
  },

  // General Settings — slider tracks + knobs
  sliderTrack: {
    position: 'absolute', left: 1, right: 1,
    height: 1.5, borderRadius: 1, opacity: 0.4,
  },
  sliderKnob: {
    position: 'absolute',
    width: 4, height: 4, borderRadius: 2,
  },

  // System Default Settings — clipboard + tick
  defBoard: {
    width: 13, height: 15,
    borderWidth: 1.5, borderRadius: 2,
  },
  defClip: {
    position: 'absolute', top: -1, left: 4,
    width: 5, height: 3,
    borderWidth: 1.5, borderRadius: 1,
  },
  defTickH: {
    position: 'absolute', top: 9, left: 3,
    width: 4, height: 0,
    borderBottomWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },
  defTickV: {
    position: 'absolute', top: 7, left: 5,
    width: 6, height: 0,
    borderBottomWidth: 1.5,
    transform: [{ rotate: '-45deg' }],
  },

  // Support Ticket — two halves with perforation
  ticketLeft: {
    position: 'absolute', top: 3, left: 1,
    width: 7, height: 12,
    borderTopLeftRadius: 2, borderBottomLeftRadius: 2,
    borderWidth: 1.5, borderRightWidth: 0,
  },
  ticketRight: {
    position: 'absolute', top: 3, right: 1,
    width: 7, height: 12,
    borderTopRightRadius: 2, borderBottomRightRadius: 2,
    borderWidth: 1.5, borderLeftWidth: 0,
  },
  ticketPerf: {
    position: 'absolute', left: 8,
    width: 2, height: 2, borderRadius: 1,
  },

  // Activity Log — document + bullet rows
  logDoc: {
    width: 13, height: 16,
    borderWidth: 1.5, borderRadius: 2,
  },
  logBullet: {
    position: 'absolute', left: 3,
    width: 2, height: 2, borderRadius: 1,
  },
  logLine: {
    position: 'absolute', left: 7, right: 3,
    height: 1.5, borderRadius: 1,
  },

  // Workflow — two nodes connected by line + arrowhead
  wfNodeL: {
    position: 'absolute', top: 5, left: 0,
    width: 6, height: 6, borderRadius: 3,
    borderWidth: 1.5,
  },
  wfNodeR: {
    position: 'absolute', top: 5, right: 0,
    width: 6, height: 6, borderRadius: 3,
    borderWidth: 1.5,
  },
  wfLine: {
    position: 'absolute', top: 7, left: 6, right: 6,
    height: 1.5, borderRadius: 1,
  },
  wfArrow: {
    position: 'absolute', top: 5, right: 4,
    width: 4, height: 4,
    borderTopWidth: 1.5, borderRightWidth: 1.5,
    transform: [{ rotate: '45deg' }],
  },

  // Entities — building outline + door + windows
  entBuilding: { width: 14, height: 14, borderWidth: 1.5, borderRadius: 1 },
  entDoor:     { position: 'absolute', bottom: 0, left: 5, width: 4, height: 5, borderWidth: 1.5, borderBottomWidth: 0, borderRadius: 1 },
  entWin:      { position: 'absolute', width: 3, height: 3, borderRadius: 1 },

  // Business Structure — top node + vertical line + two child nodes
  bsTopNode:   { position: 'absolute', top: 0, width: 6, height: 6, borderRadius: 3, borderWidth: 1.5 },
  bsLine:      { position: 'absolute', top: 6, width: 1.5, height: 4, borderRadius: 1 },
  bsRow:       { position: 'absolute', bottom: 0, width: 18, flexDirection: 'row', justifyContent: 'space-between' },
  bsChildNode: { width: 6, height: 6, borderRadius: 3, borderWidth: 1.5 },

  // Finance Institutes — roof + 3 pillars + base
  fiRoof:   { position: 'absolute', top: 1, left: 1, right: 1, height: 2, borderRadius: 1 },
  fiPillar: { position: 'absolute', top: 4, width: 2, height: 8, borderRadius: 1 },
  fiBase:   { position: 'absolute', bottom: 1, left: 1, right: 1, height: 2, borderRadius: 1 },

  // Books — open book left/right pages + spine + lines
  bookL:  { position: 'absolute', top: 2, left: 0, width: 7, height: 14, borderWidth: 1.5, borderRightWidth: 0, borderTopLeftRadius: 1, borderBottomLeftRadius: 1 },
  bookR:  { position: 'absolute', top: 2, right: 0, width: 7, height: 14, borderWidth: 1.5, borderLeftWidth: 0, borderTopRightRadius: 1, borderBottomRightRadius: 1 },
  bookSp: { position: 'absolute', top: 2, left: 7, width: 1.5, height: 14 },
  bookLn: { position: 'absolute', right: 2, width: 4, height: 1.5, borderRadius: 1 },

  // Utility — lightning bolt (top triangle + mid bar + bottom triangle)
  boltTop: { position: 'absolute', top: 0, left: 5, width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderBottomWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  boltMid: { position: 'absolute', top: 5, left: 4, width: 9, height: 2, borderRadius: 1 },
  boltBot: { position: 'absolute', bottom: 0, left: 4, width: 0, height: 0, borderLeftWidth: 4, borderRightWidth: 4, borderTopWidth: 7, borderLeftColor: 'transparent', borderRightColor: 'transparent' },

  // Service Provider — two arcs (hands)
  handL:   { position: 'absolute', left: 1, top: 4, width: 10, height: 8, borderTopLeftRadius: 8, borderTopRightRadius: 4, borderWidth: 1.5, borderBottomWidth: 0 },
  handR:   { position: 'absolute', right: 1, top: 6, width: 10, height: 8, borderTopLeftRadius: 4, borderTopRightRadius: 8, borderWidth: 1.5, borderBottomWidth: 0 },
  handBar: { position: 'absolute', top: 8, left: 3, right: 3, height: 1.5, borderRadius: 1 },

  // Tax — percent: two dots + diagonal slash
  pctDotT:  { position: 'absolute', top: 2, left: 3, width: 4, height: 4, borderRadius: 2, opacity: 0.9 },
  pctDotB:  { position: 'absolute', bottom: 2, right: 3, width: 4, height: 4, borderRadius: 2, opacity: 0.9 },
  pctSlash: { position: 'absolute', width: 14, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  // POS — body + screen + base
  posBody:   { position: 'absolute', top: 0, width: 14, height: 12, borderWidth: 1.5, borderRadius: 2 },
  posScreen: { position: 'absolute', top: 2, left: 3, width: 8, height: 5, borderRadius: 1 },
  posBase:   { position: 'absolute', bottom: 0, left: 4, width: 6, height: 2, borderRadius: 1 },

  // Bank Card — card outline + chip + stripe
  cardBody:   { width: 16, height: 11, borderWidth: 1.5, borderRadius: 2 },
  cardChip:   { position: 'absolute', top: 3, left: 3, width: 4, height: 3, borderWidth: 1.5, borderRadius: 1 },
  cardStripe: { position: 'absolute', top: 2, left: 0, right: 0, height: 2 },

  // Loyalty — star ring + inner dot + top point
  starOuter: { width: 12, height: 12, borderRadius: 6, borderWidth: 1.5 },
  starInner: { position: 'absolute', width: 3, height: 3, borderRadius: 1.5 },
  starTop:   { position: 'absolute', top: -3, width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderBottomWidth: 5, borderLeftColor: 'transparent', borderRightColor: 'transparent' },

  // Chart of Accounts
  coaDoc:  { width: 14, height: 16, borderWidth: 1.5, borderRadius: 2 },
  coaLine: { position: 'absolute', height: 1.5, borderRadius: 1 },

  // Finance Reports Generator
  frBar:    { position: 'absolute', width: 4, borderTopLeftRadius: 1, borderTopRightRadius: 1 },
  frLens:   { position: 'absolute', top: 1, right: 1, width: 7, height: 7, borderRadius: 4, borderWidth: 1.5 },
  frHandle: { position: 'absolute', top: 7, right: 0, width: 1.5, height: 4, borderRadius: 1, transform: [{ rotate: '45deg' }] },

  // Ledger Connection Console
  lcNodeL:  { position: 'absolute', top: 5, left: 0, width: 6, height: 6, borderRadius: 3, borderWidth: 1.5 },
  lcNodeR:  { position: 'absolute', top: 5, right: 0, width: 6, height: 6, borderRadius: 3, borderWidth: 1.5 },
  lcLine:   { position: 'absolute', top: 7, left: 6, right: 6, height: 1.5, borderRadius: 1 },
  lcArrR:   { position: 'absolute', top: 4, right: 5, width: 4, height: 4, borderTopWidth: 1.5, borderRightWidth: 1.5, transform: [{ rotate: '45deg' }] },
  lcArrL:   { position: 'absolute', top: 8, left: 5, width: 4, height: 4, borderBottomWidth: 1.5, borderLeftWidth: 1.5, transform: [{ rotate: '45deg' }] },

  // Opening Balance Console
  obBeam:   { position: 'absolute', top: 4, left: 0, right: 0, height: 1.5, borderRadius: 1 },
  obPole:   { position: 'absolute', top: 4, left: 8, width: 1.5, height: 10, borderRadius: 1 },
  obBase:   { position: 'absolute', bottom: 1, left: 4, right: 4, height: 1.5, borderRadius: 1 },
  obPan:    { position: 'absolute', top: 6, width: 7, height: 4, borderBottomWidth: 1.5, borderLeftWidth: 1.5, borderRightWidth: 1.5, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },

  // Journal Entry
  jeLine:       { position: 'absolute', left: 2, right: 9, height: 1.5, borderRadius: 1 },
  jePencilBody: { position: 'absolute', top: 2, right: 1, width: 5, height: 11, borderWidth: 1.5, borderRadius: 1, transform: [{ rotate: '15deg' }] },
  jePencilTip:  { position: 'absolute', bottom: 1, right: 2, width: 0, height: 0, borderLeftWidth: 2, borderRightWidth: 2, borderBottomWidth: 3, borderLeftColor: 'transparent', borderRightColor: 'transparent', transform: [{ rotate: '15deg' }] },

  // FO — POS terminal
  foTermBody:   { position: 'absolute', top: 0, width: 14, height: 11, borderWidth: 1.5, borderRadius: 2 },
  foTermScreen: { position: 'absolute', top: 2, left: 3, width: 8, height: 4, borderRadius: 1 },
  foTermKeypad: { position: 'absolute', top: 8, left: 3, width: 8, height: 4, borderWidth: 1, borderRadius: 1 },
  foTermBase:   { position: 'absolute', bottom: 0, left: 5, width: 4, height: 2, borderRadius: 1 },

  // FO — POS Points coin
  foPtCoin:  { width: 11, height: 11, borderRadius: 6, borderWidth: 1.5 },
  foPtBar:   { position: 'absolute', width: 1.5, height: 6, borderRadius: 1 },
  foPtRay:   { position: 'absolute', width: 1.5, height: 14, borderRadius: 1, opacity: 0.35 },

  // FO — Simple Invoice
  foInvDoc:    { position: 'absolute', top: 0, left: 1, width: 12, height: 16, borderWidth: 1.5, borderRadius: 2 },
  foInvLine:   { position: 'absolute', left: 4, right: 4, height: 1.5, borderRadius: 1 },
  foInvDollar: { position: 'absolute', bottom: 1, right: 1, width: 7, height: 7, borderRadius: 4, borderWidth: 1.5 },

  // Purchasing — cart tick overlay
  procTickH: { position: 'absolute', top: 7, right: 1, width: 3, height: 0, borderBottomWidth: 1.5, transform: [{ rotate: '45deg' }] },
  procTickV: { position: 'absolute', top: 5, right: 2, width: 5, height: 0, borderBottomWidth: 1.5, transform: [{ rotate: '-45deg' }] },

  // Stores & Inventory — horizontal shelves + vertical posts
  siShelf: { position: 'absolute', left: 3, right: 3, height: 1.5, borderRadius: 1 },
  siPost:  { position: 'absolute', top: 2, bottom: 0, width: 1.5, borderRadius: 1 },

  // Logistics — truck body + cab + wheels
  lgBody:   { position: 'absolute', top: 3, left: 0, width: 11, height: 9, borderWidth: 1.5, borderRadius: 1 },
  lgCab:    { position: 'absolute', top: 3, right: 0, width: 6, height: 7, borderWidth: 1.5, borderTopRightRadius: 2, borderBottomRightRadius: 1 },
  lgWheelL: { position: 'absolute', bottom: 1, left: 2, width: 4, height: 4, borderRadius: 2, borderWidth: 1.5 },
  lgWheelR: { position: 'absolute', bottom: 1, right: 2, width: 4, height: 4, borderRadius: 2, borderWidth: 1.5 },

  // FO — Bank Card Machine reader
  foBcrBody:   { position: 'absolute', top: 1, width: 12, height: 15, borderWidth: 1.5, borderRadius: 2 },
  foBcrSlot:   { position: 'absolute', top: 3, left: 3, right: 3, height: 2, borderRadius: 1 },
  foBcrScreen: { position: 'absolute', top: 7, left: 3, right: 3, height: 3, borderRadius: 1 },
  foBcrBtn:    { position: 'absolute', bottom: 3, left: 5, width: 2, height: 2, borderRadius: 1 },
});
