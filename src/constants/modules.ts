export type ModuleIconType =
  | 'sales'
  | 'inventory'
  | 'finance'
  | 'hr'
  | 'purchase'
  | 'reports';

export interface AppModule {
  id: string;
  name: string;
  iconType: ModuleIconType;
  value: string;       // comes from DB — hardcoded for now
  valueLabel: string;
}

// Replace value/valueLabel with real API data when backend is ready
export const MODULES: AppModule[] = [
  { id: '1', name: 'Sales',     iconType: 'sales',     value: '128',    valueLabel: 'Orders'    },
  { id: '2', name: 'Inventory', iconType: 'inventory', value: '1,045',  valueLabel: 'Items'     },
  { id: '3', name: 'Finance',   iconType: 'finance',   value: '$24.5K', valueLabel: 'Revenue'   },
  { id: '4', name: 'HR',        iconType: 'hr',        value: '32',     valueLabel: 'Employees' },
  { id: '5', name: 'Purchase',  iconType: 'purchase',  value: '47',     valueLabel: 'PO Pending'},
  { id: '6', name: 'Reports',   iconType: 'reports',   value: '12',     valueLabel: 'Generated' },
];
