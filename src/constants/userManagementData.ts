// ─── User Management constants ────────────────────────────────────────────────

export const SYSTEM_ROLES = [
  'Super Admin', 'Admin', 'HR Manager', 'Finance Manager',
  'Sales Manager', 'Operations Manager', 'IT Manager',
  'HR Officer', 'Finance Officer', 'Sales Officer',
  'Viewer', 'Auditor',
];

export const MODULES = [
  'HR', 'Finance', 'Sales', 'Marketing',
  'Operations', 'Inventory', 'Purchasing', 'IT', 'Reports',
];

export const ACTIONS = ['View', 'Create', 'Edit', 'Delete', 'Approve', 'Export'];

/** Returns every module:action pair, e.g. "HR:View" */
export function allPermissions(): string[] {
  const out: string[] = [];
  for (const m of MODULES) for (const a of ACTIONS) out.push(`${m}:${a}`);
  return out;
}

/** Pre-defined permission sets bundled per built-in role */
export const ROLE_PRESETS: Record<string, string[]> = {
  'Super Admin':        allPermissions(),
  'Admin':              allPermissions().filter(p => !p.endsWith(':Delete')),
  'HR Manager':         ACTIONS.map(a => `HR:${a}`),
  'Finance Manager':    ACTIONS.map(a => `Finance:${a}`),
  'Sales Manager':      ACTIONS.map(a => `Sales:${a}`),
  'Operations Manager': ACTIONS.map(a => `Operations:${a}`),
  'IT Manager':         ACTIONS.map(a => `IT:${a}`),
  'Viewer':             MODULES.map(m => `${m}:View`),
  'Auditor':            MODULES.flatMap(m => [`${m}:View`, `${m}:Export`]),
};
