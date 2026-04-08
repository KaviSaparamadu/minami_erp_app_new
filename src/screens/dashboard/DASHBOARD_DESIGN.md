# Dashboard UI Implementation Plan

## Layout Architecture

```
┌─────────────────────────────────────────────┐
│  SafeAreaView (dark #2B2B2B)                │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  DashboardHeader                    │   │
│  │  [←]   GPIT • ERP    [name] [A 🟢] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  Welcome Card (frosted glass)       │   │
│  │  Good Morning,                      │   │
│  │  Administrator                      │   │
│  │  Monday, April 7, 2026              │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐        │   │
│  │  │ 128  │ │1,045 │ │$24.5K│  → scroll  │
│  │  │Sales │ │Inv.  │ │Fin.  │        │   │
│  │  └──────┘ └──────┘ └──────┘        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  ╔═════════════════════════════════════╗   │
│  ║  Light Sheet (#F2F2F7)  ────────── ║   │
│  ║  borderTopRadius: 24, marginTop:-24║   │
│  ║                                     ║   │
│  ║  QUICK ACCESS  (horizontal scroll)  ║   │
│  ║  [●Sales] [●Inv] [●Fin] [●HR] →   ║   │
│  ║                                     ║   │
│  ║  MODULES  [6]                       ║   │
│  ║  ┌──────────────┐ ┌──────────────┐ ║   │
│  ║  │▌[●] Sales    │ │▌[●] Inventory│ ║   │
│  ║  │   128        │ │   1,045      │ ║   │
│  ║  │   Orders     │ │   Items      │ ║   │
│  ║  └──────────────┘ └──────────────┘ ║   │
│  ║  ┌──────────────┐ ┌──────────────┐ ║   │
│  ║  │▌[●] Finance  │ │▌[●] HR       │ ║   │
│  ║  ...                               ║   │
│  ╚═════════════════════════════════════╝   │
└─────────────────────────────────────────────┘
```

---

## Components

### Preserved (no change)
- `DashboardHeader` — dark bar, logo center, user avatar right
- Welcome card — frosted glass, greeting, name, date, stat chips scroll
- `ModuleIcon` — circular pink icon with white content + glow shadow

### New / Redesigned

#### `QuickAccessRow` (new)
- Horizontal `ScrollView` inside the light sheet
- Each item: small pink circle icon (32px) + module name below
- Tap → navigates to module (stub for now)

#### `ModuleCard` (redesigned — 2-column)
- White card, `borderRadius: 16`
- **Pink left accent bar** (4px × full height)
- Row: pink circle icon (40px) + name/label column (left) | large value column (right)
- Value in `Colors.primaryHighlight` (pink)
- Subtle shadow + press scale

---

## Colors
| Token | Value | Usage |
|---|---|---|
| `DARK_BG` | `#2B2B2B` | Header + dark band |
| `LIGHT_BG` | `#F2F2F7` | Sheet body |
| `primaryHighlight` | `#E91E63` | Icons, values, accents |
| `primaryText` | `#595959` | Card text |
| `placeholder` | `#A0A0A0` | Labels, muted text |
| Card bg | `#FFFFFF` | Module cards |

---

## Grid
- Welcome stat chips: first 3 modules, horizontal scroll
- Quick Access row: all 6 modules, horizontal scroll, compact 32px icons
- Module cards: **2 columns**, `(screenWidth - 32 - 8) / 2` width each

---

## Files Modified
| File | Change |
|---|---|
| `src/screens/dashboard/DashboardScreen.tsx` | Add QuickAccessRow, 2-col FlatList |
| `src/components/dashboard/ModuleCard.tsx` | Redesign: left accent + row layout |
| `src/components/dashboard/QuickAccessRow.tsx` | New component |

---

## Verification
1. `yarn android` / `yarn ios` — login → dashboard renders correctly
2. Dark band + welcome card visible at top
3. Quick Access row scrolls horizontally
4. Module cards show 2 per row with pink accent bar
5. All values and names from `MODULES` constant display correctly
