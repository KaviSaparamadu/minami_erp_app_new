import type { ScreenName } from '../context/NavigationContext';

export type ModuleIconType = string;

export interface Submodule {
  id: string;
  name: string;
  value: string;
  valueLabel: string;
  description?: string;
}

export interface AppModule {
  id: string;
  name: string;
  iconType: ModuleIconType;
  screen?: ScreenName;
  value: string;
  valueLabel: string;
  submodules?: Submodule[];
}

export const MODULES: AppModule[] = [
  {
    id: '1',
    name: 'Human Resources',
    iconType: 'hr',
    screen: 'HR',
    value: '32',
    valueLabel: 'Employees',
    submodules: [
      { id: '1-1', name: 'Human Management', value: '32', valueLabel: 'Active Staff', description: 'Manage workforce policies, org structure, and HR operations' },
      { id: '1-2', name: 'Employee Management', value: '28', valueLabel: 'Employees', description: 'Employee profiles, attendance, leave, and performance records' },
      { id: '1-3', name: 'User Management', value: '14', valueLabel: 'Users', description: 'System access, roles, permissions, and account settings' },
    ],
  },
  {
    id: '2',
    name: 'System Admin',
    iconType: 'admin',
    value: '14',
    valueLabel: 'Users',
    submodules: [
      { id: '2-1', name: 'User Management', value: '14', valueLabel: 'Users' },
      { id: '2-2', name: 'Roles & Permissions', value: '8', valueLabel: 'Roles' },
      { id: '2-3', name: 'Audit Logs', value: '245', valueLabel: 'Records' },
    ],
  },
  {
    id: '3',
    name: 'Finance',
    iconType: 'finance',
    value: '$24.5K',
    valueLabel: 'Revenue',
    submodules: [
      { id: '3-1', name: 'Accounts Payable', value: '$12.5K', valueLabel: 'Pending' },
      { id: '3-2', name: 'Accounts Receivable', value: '$12K', valueLabel: 'Due' },
      { id: '3-3', name: 'General Ledger', value: '245', valueLabel: 'Entries' },
    ],
  },
  {
    id: '4',
    name: 'Procurement',
    iconType: 'procurement',
    value: '47',
    valueLabel: 'PO Pending',
    submodules: [
      { id: '4-1', name: 'Purchase Orders', value: '47', valueLabel: 'Pending' },
      { id: '4-2', name: 'Vendors', value: '23', valueLabel: 'Active' },
      { id: '4-3', name: 'Requisitions', value: '15', valueLabel: 'Open' },
    ],
  },
  {
    id: '5',
    name: 'Operation',
    iconType: 'operation',
    value: '128',
    valueLabel: 'Tasks',
    submodules: [
      { id: '5-1', name: 'Task Management', value: '128', valueLabel: 'Open' },
      { id: '5-2', name: 'Projects', value: '5', valueLabel: 'Active' },
      { id: '5-3', name: 'Work Orders', value: '34', valueLabel: 'Pending' },
    ],
  },
  {
    id: '6',
    name: 'Marketing & Comm.',
    iconType: 'marketing',
    value: '12',
    valueLabel: 'Campaigns',
    submodules: [
      { id: '6-1', name: 'Campaigns', value: '12', valueLabel: 'Active' },
      { id: '6-2', name: 'Email Marketing', value: '8', valueLabel: 'Scheduled' },
      { id: '6-3', name: 'Social Media', value: '6', valueLabel: 'Posts' },
    ],
  },
  {
    id: '7',
    name: 'Security & Petrol',
    iconType: 'security',
    value: '8',
    valueLabel: 'Shifts',
    submodules: [
      { id: '7-1', name: 'Shift Management', value: '8', valueLabel: 'Active' },
      { id: '7-2', name: 'Access Control', value: '156', valueLabel: 'Employees' },
      { id: '7-3', name: 'Incidents', value: '3', valueLabel: 'Open' },
    ],
  },
  {
    id: '8',
    name: 'Location',
    iconType: 'location',
    value: '5',
    valueLabel: 'Branches',
    submodules: [
      { id: '8-1', name: 'Branch Management', value: '5', valueLabel: 'Branches' },
      { id: '8-2', name: 'Store Locations', value: '12', valueLabel: 'Stores' },
      { id: '8-3', name: 'Inventory', value: '1045', valueLabel: 'Items' },
    ],
  },
  {
    id: '9',
    name: 'Customer Care',
    iconType: 'customer',
    value: '64',
    valueLabel: 'Tickets',
    submodules: [
      { id: '9-1', name: 'Support Tickets', value: '64', valueLabel: 'Open' },
      { id: '9-2', name: 'Customers', value: '248', valueLabel: 'Active' },
      { id: '9-3', name: 'Complaints', value: '8', valueLabel: 'Pending' },
    ],
  },
 
];
