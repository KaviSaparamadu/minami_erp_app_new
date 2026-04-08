export type Country = 'Japan' | 'Sri Lanka';

// ── Employee ──────────────────────────────────────────────────────────────────
export interface Employee {
  id: string;
  // General
  employeeNumber?: string;
  employeeName?: string;
  salaryBoard?: string;
  designationCategory?: string;
  designation?: string;
  designationGrade?: string;
  employeeType?: string;
  entity?: string;
  workBranch?: string;
  department?: string;
  subDepartment?: string;
  section?: string;
  subSection?: string;
  // Rosters
  rosterGroup?: string;
  shiftPattern?: string;
  // Work Branch
  reportingBranch?: string;
  costCentre?: string;
  // Company
  companyCode?: string;
  payrollCompany?: string;
  // Biometrics / ID
  fingerprintId?: string;
  cardNumber?: string;
  biometricEnrolled?: boolean;
}

export interface Human {
  id: string;
  // ── Step 1: Identity ──────────────────────
  country: Country;
  nic?: string;           // Sri Lanka only
  dateOfBirth?: string;   // DD/MM/YYYY — auto-calc from NIC (SL)
  gender?: string;        // auto-calc from NIC (SL)
  title?: string;         // Mr. / Mrs. / Miss. etc.
  fullName: string;
  // ── Step 2: Names ─────────────────────────
  surname?: string;
  firstName?: string;
  otherName?: string;
  // ── Step 3: Address (Sri Lanka) ───────────
  province?: string;
  district?: string;
  gnDivision?: string;
  // ── Step 3: Address (Japan) ───────────────
  prefecture?: string;
  city?: string;
  townDistrict?: string;
}
