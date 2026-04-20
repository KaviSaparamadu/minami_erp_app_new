import type { ScreenName } from '../context/NavigationContext';

export type ModuleIconType = string;

export interface AppModule {
  id: string;
  name: string;
  iconType: ModuleIconType;
  screen?: ScreenName;
  value: string;       // comes from DB — hardcoded for now
  valueLabel: string;
}

// Kept in sync with src/constants/navigation.json top-level modules.
// Replace value/valueLabel with real API data when backend is ready.
export const MODULES: AppModule[] = [
  { id: '1',  name: 'Human Resources',         iconType: 'hr',          screen: 'HR', value: '32',   valueLabel: 'Employees' },
  { id: '2',  name: 'System Admin',            iconType: 'admin',       value: '14',   valueLabel: 'Users'     },
  { id: '3',  name: 'Finance',                 iconType: 'finance',     value: '$24.5K', valueLabel: 'Revenue' },
  { id: '4',  name: 'Procurement',             iconType: 'procurement', value: '47',   valueLabel: 'PO Pending'},
  { id: '5',  name: 'Operation',               iconType: 'operation',   value: '128',  valueLabel: 'Tasks'     },
  { id: '6',  name: 'Marketing & Comm.',       iconType: 'marketing',   value: '12',   valueLabel: 'Campaigns' },
  { id: '7',  name: 'Security & Petrol',       iconType: 'security',    value: '8',    valueLabel: 'Shifts'    },
  { id: '8',  name: 'Location',                iconType: 'location',    value: '5',    valueLabel: 'Branches'  },
  { id: '9',  name: 'Customer Care',           iconType: 'customer',    value: '64',   valueLabel: 'Tickets'   },
  { id: '10', name: 'Enterprise Management',   iconType: 'enterprise',  value: '3',    valueLabel: 'Divisions' },
];
