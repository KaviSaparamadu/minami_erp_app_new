import type { ScreenName } from '../context/NavigationContext';

export type ModuleIconType = string;

export interface Submodule {
  id: string;
  name: string;
  value: string;
  valueLabel: string;
  description?: string;
  iconType?: string;
}

export interface AppModule {
  id: string;
  name: string;
  iconType: ModuleIconType;
  screen?: ScreenName;
  value: string;
  valueLabel: string;
  description?: string;
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
      { id: '1-1', name: 'Human Management',    value: '32', valueLabel: 'Active Staff', description: 'Manage workforce policies, org structure, and HR operations',          iconType: 'hr' },
      { id: '1-2', name: 'Employee Management', value: '28', valueLabel: 'Employees',   description: 'Employee profiles, attendance, leave, and performance records',        iconType: 'employee' },
      { id: '1-3', name: 'User Management',     value: '14', valueLabel: 'Users',       description: 'System access, roles, permissions, and account settings',             iconType: 'user-add' },
    ],
  },
  {
    id: '2',
    name: 'System Admin',
    iconType: 'admin',
    screen: 'SystemAdmin',
    value: '5',
    valueLabel: 'Modules',
    submodules: [
      { id: '2-1', name: 'System Settings',         value: '12',  valueLabel: 'Configs',  description: 'Configure system-wide parameters, integrations, and environment options.', iconType: 'settings' },
      { id: '2-2', name: 'General Settings',         value: '8',   valueLabel: 'Options',  description: 'Manage general application preferences, language, and display settings.',  iconType: 'sliders' },
      { id: '2-3', name: 'System Default Settings',  value: '6',   valueLabel: 'Defaults', description: 'Set factory defaults for forms, workflows, and data entry templates.',      iconType: 'defaults' },
      { id: '2-4', name: 'Support Ticket',           value: '34',  valueLabel: 'Open',     description: 'Raise, track, and resolve internal IT and system support requests.',        iconType: 'ticket' },
      { id: '2-5', name: 'Activity Log',             value: '1.2K',valueLabel: 'Events',   description: 'Review a full audit trail of user actions and system events.',              iconType: 'log' },
    ],
  },
  {
    id: '3',
    name: 'Finance',
    iconType: 'finance',
    screen: 'Finance',
    value: '$24.5K',
    valueLabel: 'Revenue',
    submodules: [
      { id: '3-1', name: 'Finance Utilities',  value: '18', valueLabel: 'Tools',   description: 'Currency conversion, tax calculators, and financial utility tools.',         iconType: 'finance-utilities' },
      { id: '3-2', name: 'Ledger Management',  value: '245',valueLabel: 'Entries', description: 'Manage general ledger, chart of accounts, and journal entries.',             iconType: 'ledger' },
      { id: '3-3', name: 'Finance Operation',  value: '64', valueLabel: 'Txns',    description: 'Handle accounts payable, receivable, payments, and day-to-day transactions.', iconType: 'finance-operation' },
    ],
  },
  {
    id: '4',
    name: 'Procurement',
    iconType: 'procurement',
    value: '47',
    valueLabel: 'PO Pending',
    submodules: [
      { id: '4-1', name: 'Purchasing',         value: '47', valueLabel: 'Pending', description: 'Manage purchase orders, supplier quotes, and procurement workflows.', iconType: 'proc-purchasing' },
      { id: '4-2', name: 'Stores & Inventory', value: '23', valueLabel: 'Items',   description: 'Track stock levels, warehouse management, and inventory control.',    iconType: 'proc-stores' },
      { id: '4-3', name: 'Logistics',          value: '15', valueLabel: 'Active',  description: 'Coordinate deliveries, shipments, and supply chain logistics.',       iconType: 'proc-logistics' },
    ],
  },
  {
    id: '5',
    name: 'Operation',
    iconType: 'operation',
    value: '128',
    valueLabel: 'Tasks',
    submodules: [
      { id: '5-1', name: 'Task Management', value: '128', valueLabel: 'Open',    iconType: 'defaults' },
      { id: '5-2', name: 'Projects',        value: '5',   valueLabel: 'Active',  iconType: 'project' },
      { id: '5-3', name: 'Work Orders',     value: '34',  valueLabel: 'Pending', iconType: 'operation' },
    ],
  },
  {
    id: '6',
    name: 'Marketing & Comm.',
    iconType: 'marketing',
    value: '12',
    valueLabel: 'Campaigns',
    submodules: [
      { id: '6-1', name: 'Campaigns',      value: '12', valueLabel: 'Active',    iconType: 'marketing' },
      { id: '6-2', name: 'Email Marketing',value: '8',  valueLabel: 'Scheduled', iconType: 'complaint' },
      { id: '6-3', name: 'Social Media',   value: '6',  valueLabel: 'Posts',     iconType: 'store' },
    ],
  },
  {
    id: '7',
    name: 'Security & Petrol',
    iconType: 'security',
    value: '8',
    valueLabel: 'Shifts',
    submodules: [
      { id: '7-1', name: 'Shift Management', value: '8',   valueLabel: 'Active',    iconType: 'shift' },
      { id: '7-2', name: 'Access Control',   value: '156', valueLabel: 'Employees', iconType: 'key' },
      { id: '7-3', name: 'Incidents',        value: '3',   valueLabel: 'Open',      iconType: 'security' },
    ],
  },
  {
    id: '8',
    name: 'Location',
    iconType: 'location',
    value: '5',
    valueLabel: 'Branches',
    submodules: [
      { id: '8-1', name: 'Branch Management', value: '5',    valueLabel: 'Branches', iconType: 'vendor' },
      { id: '8-2', name: 'Store Locations',   value: '12',   valueLabel: 'Stores',   iconType: 'store' },
      { id: '8-3', name: 'Inventory',         value: '1045', valueLabel: 'Items',    iconType: 'inventory' },
    ],
  },
  {
    id: '9',
    name: 'Customer Care',
    iconType: 'customer',
    value: '64',
    valueLabel: 'Tickets',
    submodules: [
      { id: '9-1', name: 'Support Tickets', value: '64',  valueLabel: 'Open',    iconType: 'ticket' },
      { id: '9-2', name: 'Customers',       value: '248', valueLabel: 'Active',  iconType: 'customer-list' },
      { id: '9-3', name: 'Complaints',      value: '8',   valueLabel: 'Pending', iconType: 'complaint' },
    ],
  },
 
];

export const SYSTEM_SETTINGS: Submodule[] = [
  { id: '1', name: 'Employee Settings', value: '24', valueLabel: 'Config', description: 'Configure employee-related system parameters and defaults', iconType: 'account-tie' },
  { id: '2', name: 'Item Settings', value: '18', valueLabel: 'Config', description: 'Manage item classification, categories, and inventory settings', iconType: 'package' },
  { id: '3', name: 'Supplier Settings', value: '12', valueLabel: 'Config', description: 'Set supplier defaults, payment terms, and procurement parameters', iconType: 'truck' },
  { id: '4', name: 'Stores Setting', value: '8', valueLabel: 'Config', description: 'Configure store locations, warehouse, and branch settings', iconType: 'store' },
  { id: '5', name: 'Finance Setting', value: '15', valueLabel: 'Config', description: 'Define financial parameters, fiscal years, and accounting rules', iconType: 'calculator' },
  { id: '6', name: 'Finance Institutes & Acc Setting', value: '10', valueLabel: 'Config', description: 'Manage bank accounts and financial institution integrations', iconType: 'bank' },
  { id: '7', name: 'Security Post Setting', value: '6', valueLabel: 'Config', description: 'Configure security shifts and access control parameters', iconType: 'shield-account' },
  { id: '8', name: 'Vehicle Settings', value: '9', valueLabel: 'Config', description: 'Set vehicle categories, maintenance schedules, and fleet parameters', iconType: 'car' },
  { id: '9', name: 'Service Offered Settings', value: '14', valueLabel: 'Config', description: 'Define service types, pricing, and service-related configurations', iconType: 'wrench' },
];

export const STANDARD_SETTINGS: Submodule[] = [
  { id: '1', name: 'Application Preferences', value: '16', valueLabel: 'Settings', description: 'Configure application theme, language, and user interface preferences', iconType: 'palette' },
  { id: '2', name: 'Display Settings', value: '12', valueLabel: 'Options', description: 'Adjust display layout, font sizes, and visual components', iconType: 'monitor-eye' },
  { id: '3', name: 'Date & Time Settings', value: '8', valueLabel: 'Config', description: 'Set date formats, time zones, and calendar preferences', iconType: 'calendar-clock' },
  { id: '4', name: 'Currency & Localization', value: '10', valueLabel: 'Config', description: 'Configure currency symbols, number formats, and localization options', iconType: 'earth' },
  { id: '5', name: 'Email Configuration', value: '7', valueLabel: 'Config', description: 'Setup email servers, SMTP settings, and email templates', iconType: 'email' },
  { id: '6', name: 'Notification Settings', value: '9', valueLabel: 'Alerts', description: 'Manage notification preferences, email alerts, and reminder schedules', iconType: 'bell' },
  { id: '7', name: 'Report Templates', value: '20', valueLabel: 'Templates', description: 'Configure standard report layouts and data export settings', iconType: 'file-document' },
  { id: '8', name: 'System Logs & Backup', value: '11', valueLabel: 'Config', description: 'Configure logging levels, backup schedules, and data retention policies', iconType: 'backup-restore' },
];

export const GENERAL_SETTINGS_SUBMODULES: Submodule[] = [
  { id: '1', name: 'Standard Settings', value: '8', valueLabel: 'Settings', description: 'Configure application preferences, display settings, and system defaults', iconType: 'cog' },
];
