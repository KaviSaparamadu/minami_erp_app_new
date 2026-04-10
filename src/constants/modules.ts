export type ModuleIconType =
  | 'hr'
  | 'employee'
  | 'system-admin';

export interface AppModule {
  id: string;
  name: string;
  iconType: ModuleIconType;
  value: string;       // comes from DB — hardcoded for now
  valueLabel: string;
}

// Replace value/valueLabel with real API data when backend is ready
export const MODULES: AppModule[] = [
  { id: '4', name: 'HR',           iconType: 'hr',           value: '32', valueLabel: 'Employees' },
  { id: '8', name: 'Employee',     iconType: 'employee',     value: '28', valueLabel: 'Records'   },
  { id: '7', name: 'System Admin', iconType: 'system-admin', value: '10', valueLabel: 'Settings'  },
];
