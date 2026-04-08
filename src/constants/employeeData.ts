// ─── Employee dropdown data ───────────────────────────────────────────────────

export const SALARY_BOARDS = [
  'Executive', 'Management', 'Technical', 'Clerical', 'Operational', 'Daily Paid',
];

export const DESIGNATION_CATEGORIES = [
  'Senior Management', 'Middle Management', 'Technical Staff', 'Administrative', 'Support Staff',
];

export const DESIGNATIONS: Record<string, string[]> = {
  'Senior Management':  ['CEO', 'COO', 'CFO', 'CTO', 'General Manager', 'Deputy General Manager'],
  'Middle Management':  ['Manager', 'Senior Manager', 'Assistant Manager', 'Deputy Manager'],
  'Technical Staff':    ['Engineer', 'Senior Engineer', 'Lead Engineer', 'Technical Officer'],
  'Administrative':     ['Administrator', 'Senior Administrator', 'Executive Officer'],
  'Support Staff':      ['Officer', 'Senior Officer', 'Assistant', 'Clerk'],
};

export const DESIGNATION_GRADES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8',
];

export const EMPLOYEE_TYPES = [
  'Permanent', 'Contract', 'Temporary', 'Part-Time', 'Probationary', 'Trainee', 'Casual',
];

export const ENTITIES = [
  'GPIT Solutions (Pvt) Ltd', 'Minami Corporation', 'Tech Innovations Ltd', 'Global Systems Inc',
];

export const WORK_BRANCHES = [
  'Head Office', 'Colombo Branch', 'Kandy Branch', 'Galle Branch', 'Tokyo Branch', 'Osaka Branch',
];

export const DEPARTMENTS = [
  'Human Resources', 'Finance', 'Engineering', 'Sales', 'Marketing', 'Operations', 'IT', 'Legal',
];

export const SUB_DEPARTMENTS: Record<string, string[]> = {
  'Human Resources': ['Recruitment', 'Payroll', 'Training & Development', 'Employee Welfare'],
  'Finance':         ['Accounts', 'Audit', 'Treasury', 'Tax & Compliance'],
  'Engineering':     ['Software', 'Hardware', 'Infrastructure', 'Quality Assurance'],
  'Sales':           ['Local Sales', 'Export Sales', 'Retail', 'Corporate Sales'],
  'Marketing':       ['Digital Marketing', 'Brand Management', 'Market Research'],
  'Operations':      ['Procurement', 'Logistics', 'Facilities Management'],
  'IT':              ['Development', 'Support', 'Cybersecurity', 'Network'],
  'Legal':           ['Corporate Legal', 'Litigation', 'Regulatory Compliance'],
};

export const SECTIONS: Record<string, string[]> = {
  'Recruitment':        ['Local Recruitment', 'Foreign Recruitment', 'Executive Search'],
  'Payroll':            ['Monthly Payroll', 'Daily Payroll', 'Incentives'],
  'Software':           ['Frontend', 'Backend', 'Mobile', 'DevOps', 'Architecture'],
  'Hardware':           ['Assembly', 'Maintenance', 'Testing & QA'],
  'Local Sales':        ['Retail Sales', 'B2B Sales', 'Online Sales'],
  'Digital Marketing':  ['SEO/SEM', 'Social Media', 'Email Marketing'],
  'Development':        ['Web Development', 'App Development', 'API Services'],
  'Accounts':           ['Accounts Payable', 'Accounts Receivable', 'General Ledger'],
};

export const SUB_SECTIONS: Record<string, string[]> = {
  'Frontend':          ['Web UI', 'Mobile Web', 'Design Systems'],
  'Backend':           ['REST API', 'GraphQL', 'Microservices', 'Database'],
  'Mobile':            ['iOS', 'Android', 'Cross-Platform'],
  'DevOps':            ['CI/CD', 'Cloud Infrastructure', 'Monitoring'],
  'SEO/SEM':           ['On-Page SEO', 'Off-Page SEO', 'PPC'],
  'Accounts Payable':  ['Vendor Invoices', 'Expense Claims'],
  'Accounts Receivable':['Customer Invoices', 'Collections'],
};

// Rosters
export const ROSTER_GROUPS = [
  'Group A – Day Shift', 'Group B – Night Shift', 'Group C – Rotating', 'Group D – Flexible',
];
export const SHIFT_PATTERNS = [
  '8h Day (08:00–16:00)', '8h Night (20:00–04:00)', '12h Day (06:00–18:00)', '12h Night (18:00–06:00)',
  'Flexible (core 10:00–15:00)',
];

// Company / Payroll
export const COMPANY_CODES  = ['GPIT-SL', 'GPIT-JP', 'MIN-CORP', 'TIL-001', 'GSI-001'];
export const PAYROLL_COMPANIES = [
  'GPIT Solutions (Pvt) Ltd – Payroll', 'Minami Corp Payroll', 'Tech Innovations Payroll',
];
export const COST_CENTRES  = ['CC-001 Head Office', 'CC-002 Colombo', 'CC-003 Kandy', 'CC-004 Tokyo'];
export const REPORTING_BRANCHES = WORK_BRANCHES;
