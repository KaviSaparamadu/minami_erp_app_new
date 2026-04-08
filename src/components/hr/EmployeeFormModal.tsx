import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  COST_CENTRES,
  DEPARTMENTS,
  DESIGNATION_CATEGORIES,
  DESIGNATION_GRADES,
  DESIGNATIONS,
  EMPLOYEE_TYPES,
  ENTITIES,
  PAYROLL_COMPANIES,
  REPORTING_BRANCHES,
  ROSTER_GROUPS,
  SALARY_BOARDS,
  SECTIONS,
  SHIFT_PATTERNS,
  SUB_DEPARTMENTS,
  SUB_SECTIONS,
  WORK_BRANCHES,
} from '../../constants/employeeData';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { Employee } from '../../types/hr';

export type EmployeeModalMode = 'create' | 'edit' | 'view';

interface Props {
  visible: boolean;
  mode: EmployeeModalMode;
  employee?: Employee | null;
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id'>) => void;
}

// ─── GPIT Create Module Button ────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-require-imports
const GPIT_BTN = require('../../../assets/images/GPIT Create Module Button.png');

// ─── Progress bar ─────────────────────────────────────────────────────────────
function healthColor(pct: number): string {
  if (pct < 25) return '#E53935';
  if (pct < 50) return '#FB8C00';
  if (pct < 75) return '#FDD835';
  return '#30A84B';
}

function ProgressBar({ pct }: { pct: number }) {
  const required = 15;
  const fillColor = healthColor(pct);
  const meetsRequired = pct >= required;
  return (
    <View style={pb.wrap}>
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${pct}%` as any, backgroundColor: fillColor }]} />
        <View style={[pb.marker, { left: `${required}%` as any }]} />
      </View>
      <View style={pb.labels}>
        <Text style={pb.labelLeft}>Results Weighted On</Text>
        <Text style={pb.labelMid}>Required — {required}%</Text>
        <Text style={[pb.labelRight, meetsRequired && pb.labelAvg]}>
          {meetsRequired ? 'Average ✓' : `${Math.round(pct)}%`}
        </Text>
      </View>
      {!meetsRequired && (
        <Text style={pb.warning}>Please fill out all required fields.</Text>
      )}
    </View>
  );
}

// ─── Dropdown (bottom-border + GPIT button + optional ?) ─────────────────────
interface DDProps {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  required?: boolean;
  showGpitBtn?: boolean;
  showHelp?: boolean;
  gpitLabel?: string;
}
function Dropdown({
  label, value, options, onChange, disabled, placeholder, required,
  showGpitBtn = true, showHelp = true, gpitLabel,
}: DDProps) {
  const [open, setOpen] = useState(false);

  function handleGpitPress() {
    Alert.alert(
      `Quick Create — ${gpitLabel ?? label}`,
      `Open the quick-create form for "${gpitLabel ?? label}"?`,
      [{ text: 'OK' }],
    );
  }

  return (
    <View style={dd.wrapper}>
      <Text style={dd.label}>
        {required && <Text style={dd.req}>*</Text>}{label}
      </Text>
      <View style={dd.row}>
        {/* Trigger */}
        <Pressable
          onPress={() => !disabled && setOpen(o => !o)}
          style={[dd.trigger, open && dd.open, disabled && dd.disabled]}>
          <Text style={[dd.value, !value && dd.placeholder]}>
            {value || placeholder || `Select ${label}`}
          </Text>
          {!disabled && (
            <View style={[dd.chevWrap, open && dd.chevUp]}>
              <View style={dd.cL} /><View style={dd.cR} />
            </View>
          )}
        </Pressable>

        {/* GPIT Create Module Button */}
        {showGpitBtn && !disabled && (
          <Pressable onPress={handleGpitPress} style={dd.gpitBtn} hitSlop={6}>
            <Image source={GPIT_BTN} style={dd.gpitImg} resizeMode="contain" />
          </Pressable>
        )}

        {/* Help button */}
        {showHelp && (
          <View style={dd.helpBtn}>
            <Text style={dd.helpTxt}>?</Text>
          </View>
        )}
      </View>

      {/* Dropdown list */}
      {open && (
        <View style={dd.list}>
          <ScrollView style={{ maxHeight: 160 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {options.map(opt => (
              <Pressable
                key={opt}
                style={[dd.opt, value === opt && dd.optActive]}
                onPress={() => { onChange(opt); setOpen(false); }}>
                <Text style={[dd.optTxt, value === opt && dd.optTxtActive]}>{opt}</Text>
                {value === opt && (
                  <View style={dd.chk}><View style={dd.chkL} /><View style={dd.chkR} /></View>
                )}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Text Field ───────────────────────────────────────────────────────────────
interface FProps {
  label: string; value: string;
  onChangeText?: (t: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  editable?: boolean; required?: boolean; hint?: string;
}
function Field({ label, value, onChangeText, placeholder, keyboardType, editable = true, required, hint }: FProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fi.wrapper}>
      <Text style={[fi.label, focused && fi.labelFoc]}>
        {required && <Text style={fi.req}>*</Text>}{label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.placeholder}
        keyboardType={keyboardType ?? 'default'}
        editable={editable}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[fi.input, focused && fi.inputFoc, !editable && fi.inputRO]}
      />
      {hint && <Text style={fi.hint}>{hint}</Text>}
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ text }: { text: string }) {
  return (
    <View style={sec.row}>
      <View style={sec.bar} />
      <Text style={sec.txt}>{text}</Text>
      <View style={sec.line} />
    </View>
  );
}

// ─── Tab icons (pure RN) ──────────────────────────────────────────────────────
function RosterIcon({ active }: { active: boolean }) {
  const c = active ? Colors.primaryHighlight : '#A0A0A0';
  return (
    <View style={ti.wrap}>
      <View style={[ti.head, { backgroundColor: c }]} />
      <View style={[ti.line1, { backgroundColor: c }]} />
      <View style={[ti.line2, { backgroundColor: c }]} />
      <View style={[ti.line3, { backgroundColor: c }]} />
    </View>
  );
}
function UploadIcon({ active }: { active: boolean }) {
  const c = active ? Colors.primaryHighlight : '#A0A0A0';
  return (
    <View style={ti.wrap}>
      <View style={[ti.docBody, { borderColor: c }]} />
      <View style={[ti.arrowUp, { borderBottomColor: c }]} />
      <View style={[ti.arrowStem, { backgroundColor: c }]} />
    </View>
  );
}
function WorkBranchIcon({ active }: { active: boolean }) {
  const c = active ? Colors.primaryHighlight : '#A0A0A0';
  return (
    <View style={ti.wrap}>
      <View style={[ti.bldBase, { borderColor: c }]} />
      <View style={[ti.bldDoor, { backgroundColor: c }]} />
      <View style={[ti.bldW1, { borderColor: c }]} />
      <View style={[ti.bldW2, { borderColor: c }]} />
    </View>
  );
}
function CompanyIcon({ active }: { active: boolean }) {
  const c = active ? Colors.primaryHighlight : '#A0A0A0';
  return (
    <View style={ti.wrap}>
      <View style={[ti.p1, { backgroundColor: c }]} />
      <View style={[ti.p2, { backgroundColor: c }]} />
      <View style={[ti.p1Body, { backgroundColor: c }]} />
    </View>
  );
}
function BiometricsIcon({ active }: { active: boolean }) {
  const c = active ? Colors.primaryHighlight : '#A0A0A0';
  return (
    <View style={ti.wrap}>
      <View style={[ti.cardRect, { borderColor: c }]} />
      <View style={[ti.cardLine1, { backgroundColor: c }]} />
      <View style={[ti.cardLine2, { backgroundColor: c }]} />
      <View style={[ti.cardCircle, { borderColor: c }]} />
    </View>
  );
}

type TabId = 'general' | 'rosters' | 'uploads' | 'workbranch' | 'company' | 'biometrics';
const TABS: { id: TabId; label: string; Icon: React.FC<{ active: boolean }> }[] = [
  { id: 'general',    label: 'General',    Icon: RosterIcon },
  { id: 'rosters',    label: 'Rosters',    Icon: RosterIcon },
  { id: 'uploads',    label: 'Uploads',    Icon: UploadIcon },
  { id: 'workbranch', label: 'Work Branch',Icon: WorkBranchIcon },
  { id: 'company',    label: 'Company',    Icon: CompanyIcon },
  { id: 'biometrics', label: 'Biometrics', Icon: BiometricsIcon },
];

// ─── Progress calculation ─────────────────────────────────────────────────────
function calcProgress(emp: {
  employeeName: string; salaryBoard: string; designationCategory: string;
  designation: string; designationGrade: string; employeeType: string;
  entity: string; workBranch: string; department: string;
}): number {
  const fields = [
    emp.employeeName, emp.salaryBoard, emp.designationCategory,
    emp.designation, emp.designationGrade, emp.employeeType,
    emp.entity, emp.workBranch, emp.department,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export function EmployeeFormModal({ visible, mode, employee, onClose, onSave }: Props) {
  const isView = mode === 'view';
  const isEdit = mode === 'edit';
  const scrollRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState<TabId>('general');

  // ── General fields ──
  const [employeeNumber,      setEmployeeNumber]      = useState('');
  const [employeeName,        setEmployeeName]        = useState('');
  const [salaryBoard,         setSalaryBoard]         = useState('');
  const [designationCategory, setDesignationCategory] = useState('');
  const [designation,         setDesignation]         = useState('');
  const [designationGrade,    setDesignationGrade]    = useState('');
  const [employeeType,        setEmployeeType]        = useState('');
  const [entity,              setEntity]              = useState('');
  const [workBranch,          setWorkBranch]          = useState('');
  const [department,          setDepartment]          = useState('');
  const [subDepartment,       setSubDepartment]       = useState('');
  const [section,             setSection]             = useState('');
  const [subSection,          setSubSection]          = useState('');

  // ── Rosters ──
  const [rosterGroup,  setRosterGroup]  = useState('');
  const [shiftPattern, setShiftPattern] = useState('');

  // ── Work Branch tab ──
  const [reportingBranch, setReportingBranch] = useState('');
  const [costCentre,      setCostCentre]      = useState('');

  // ── Company tab ──
  const [companyCode,      setCompanyCode]      = useState('');
  const [payrollCompany,   setPayrollCompany]   = useState('');

  // ── Biometrics tab ──
  const [fingerprintId, setFingerprintId] = useState('');
  const [cardNumber,    setCardNumber]    = useState('');

  const pct = calcProgress({ employeeName, salaryBoard, designationCategory, designation, designationGrade, employeeType, entity, workBranch, department });

  // ── Reset / populate ──
  useEffect(() => {
    if (!visible) return;
    setActiveTab('general');
    scrollRef.current?.scrollTo({ y: 0, animated: false });
    if (employee) {
      setEmployeeNumber(employee.employeeNumber ?? '');
      setEmployeeName(employee.employeeName ?? '');
      setSalaryBoard(employee.salaryBoard ?? '');
      setDesignationCategory(employee.designationCategory ?? '');
      setDesignation(employee.designation ?? '');
      setDesignationGrade(employee.designationGrade ?? '');
      setEmployeeType(employee.employeeType ?? '');
      setEntity(employee.entity ?? '');
      setWorkBranch(employee.workBranch ?? '');
      setDepartment(employee.department ?? '');
      setSubDepartment(employee.subDepartment ?? '');
      setSection(employee.section ?? '');
      setSubSection(employee.subSection ?? '');
      setRosterGroup(employee.rosterGroup ?? '');
      setShiftPattern(employee.shiftPattern ?? '');
      setReportingBranch(employee.reportingBranch ?? '');
      setCostCentre(employee.costCentre ?? '');
      setCompanyCode(employee.companyCode ?? '');
      setPayrollCompany(employee.payrollCompany ?? '');
      setFingerprintId(employee.fingerprintId ?? '');
      setCardNumber(employee.cardNumber ?? '');
    } else {
      setEmployeeNumber(''); setEmployeeName(''); setSalaryBoard('');
      setDesignationCategory(''); setDesignation(''); setDesignationGrade('');
      setEmployeeType(''); setEntity(''); setWorkBranch('');
      setDepartment(''); setSubDepartment(''); setSection(''); setSubSection('');
      setRosterGroup(''); setShiftPattern('');
      setReportingBranch(''); setCostCentre('');
      setCompanyCode(''); setPayrollCompany('');
      setFingerprintId(''); setCardNumber('');
    }
  }, [visible, employee]);

  // Cascade resets
  useEffect(() => { setDesignation(''); }, [designationCategory]);
  useEffect(() => { setSubDepartment(''); setSection(''); setSubSection(''); }, [department]);
  useEffect(() => { setSection(''); setSubSection(''); }, [subDepartment]);
  useEffect(() => { setSubSection(''); }, [section]);

  function handleReset() {
    Alert.alert('Reset Form', 'Clear all fields?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset', style: 'destructive', onPress: () => {
          setEmployeeNumber(''); setEmployeeName(''); setSalaryBoard('');
          setDesignationCategory(''); setDesignation(''); setDesignationGrade('');
          setEmployeeType(''); setEntity(''); setWorkBranch('');
          setDepartment(''); setSubDepartment(''); setSection(''); setSubSection('');
          setRosterGroup(''); setShiftPattern('');
          setReportingBranch(''); setCostCentre('');
          setCompanyCode(''); setPayrollCompany('');
          setFingerprintId(''); setCardNumber('');
        },
      },
    ]);
  }

  function handleSave() {
    if (!employeeName.trim())        { Alert.alert('Required', 'Select Employee Name.'); return; }
    if (!salaryBoard)                { Alert.alert('Required', 'Select Salary Board.'); return; }
    if (!designationCategory)        { Alert.alert('Required', 'Select Designation Category.'); return; }
    if (!designation)                { Alert.alert('Required', 'Select Designation.'); return; }
    if (!designationGrade)           { Alert.alert('Required', 'Select Designation Grade.'); return; }
    if (!employeeType)               { Alert.alert('Required', 'Select Employee Type.'); return; }
    if (!entity)                     { Alert.alert('Required', 'Select Entity (Company).'); return; }
    if (!workBranch)                 { Alert.alert('Required', 'Select Work Branch.'); return; }
    if (!department)                 { Alert.alert('Required', 'Select Department.'); return; }
    onSave({
      employeeNumber: employeeNumber.trim() || undefined,
      employeeName: employeeName.trim(), salaryBoard, designationCategory,
      designation, designationGrade, employeeType, entity, workBranch,
      department, subDepartment: subDepartment || undefined,
      section: section || undefined, subSection: subSection || undefined,
      rosterGroup: rosterGroup || undefined, shiftPattern: shiftPattern || undefined,
      reportingBranch: reportingBranch || undefined, costCentre: costCentre || undefined,
      companyCode: companyCode || undefined, payrollCompany: payrollCompany || undefined,
      fingerprintId: fingerprintId.trim() || undefined, cardNumber: cardNumber.trim() || undefined,
    });
  }

  // ── Tab content ──────────────────────────────────────────────────────────
  function renderGeneral() {
    return (
      <>
        {/* Employee Number (no * — optional) */}
        <SectionHead text="Employee Identity" />
        <Field
          label="Employee Number"
          value={employeeNumber}
          onChangeText={setEmployeeNumber}
          placeholder="Auto-generated if blank"
          editable={!isView}
          hint="Leave blank to auto-assign"
        />

        <SectionHead text="Job Details" />
        <Dropdown
          label="Employee Name" value={employeeName}
          options={[]} onChange={setEmployeeName}
          disabled={isView} required showGpitBtn showHelp
          gpitLabel="Employee Name"
        />
        <Dropdown
          label="Salary Board" value={salaryBoard}
          options={SALARY_BOARDS} onChange={setSalaryBoard}
          disabled={isView} required showGpitBtn showHelp
        />
        <Dropdown
          label="Designation Category" value={designationCategory}
          options={DESIGNATION_CATEGORIES} onChange={setDesignationCategory}
          disabled={isView} required showGpitBtn showHelp
        />
        <Dropdown
          label="Designation" value={designation}
          options={designationCategory ? (DESIGNATIONS[designationCategory] ?? []) : []}
          onChange={setDesignation}
          disabled={isView || !designationCategory}
          placeholder={designationCategory ? 'Select Designation' : 'Select Category first'}
          required showGpitBtn showHelp
        />
        <Dropdown
          label="Designation Grade" value={designationGrade}
          options={DESIGNATION_GRADES} onChange={setDesignationGrade}
          disabled={isView} required showGpitBtn showHelp
        />
        <Dropdown
          label="Employee Type" value={employeeType}
          options={EMPLOYEE_TYPES} onChange={setEmployeeType}
          disabled={isView} required showGpitBtn={false} showHelp
        />

        <SectionHead text="Organisation" />
        <Dropdown
          label="Entity (Company)" value={entity}
          options={ENTITIES} onChange={setEntity}
          disabled={isView} required showGpitBtn showHelp
        />
        <Dropdown
          label="Work Branch" value={workBranch}
          options={WORK_BRANCHES} onChange={setWorkBranch}
          disabled={isView} required showGpitBtn showHelp
        />
        <Dropdown
          label="Department" value={department}
          options={DEPARTMENTS} onChange={setDepartment}
          disabled={isView} required showGpitBtn showHelp
        />
        <Dropdown
          label="Sub Department" value={subDepartment}
          options={department ? (SUB_DEPARTMENTS[department] ?? []) : []}
          onChange={setSubDepartment}
          disabled={isView || !department}
          placeholder={department ? 'Select Sub Department' : 'Select Department first'}
          showGpitBtn showHelp
        />
        <Dropdown
          label="Section" value={section}
          options={subDepartment ? (SECTIONS[subDepartment] ?? []) : []}
          onChange={setSection}
          disabled={isView || !subDepartment}
          placeholder={subDepartment ? 'Select Section' : 'Select Sub Department first'}
          showGpitBtn showHelp
        />
        <Dropdown
          label="Sub Section" value={subSection}
          options={section ? (SUB_SECTIONS[section] ?? []) : []}
          onChange={setSubSection}
          disabled={isView || !section}
          placeholder={section ? 'Select Sub Section' : 'Select Section first'}
          showGpitBtn showHelp
        />
      </>
    );
  }

  function renderRosters() {
    return (
      <>
        <SectionHead text="Roster Assignment" />
        <Dropdown label="Roster Group" value={rosterGroup} options={ROSTER_GROUPS} onChange={setRosterGroup} disabled={isView} showGpitBtn showHelp />
        <Dropdown label="Shift Pattern" value={shiftPattern} options={SHIFT_PATTERNS} onChange={setShiftPattern} disabled={isView} showGpitBtn showHelp />
      </>
    );
  }

  function renderUploads() {
    return (
      <>
        <SectionHead text="Document Uploads" />
        <View style={s.placeholderBox}>
          <View style={s.uploadIcon}>
            <View style={s.uploadArrow} />
            <View style={s.uploadStem} />
          </View>
          <Text style={s.placeholderTitle}>No documents uploaded</Text>
          <Text style={s.placeholderSub}>Tap to attach contracts, certificates, or IDs.</Text>
        </View>
      </>
    );
  }

  function renderWorkBranch() {
    return (
      <>
        <SectionHead text="Work Branch Details" />
        <Dropdown label="Reporting Branch" value={reportingBranch} options={REPORTING_BRANCHES} onChange={setReportingBranch} disabled={isView} showGpitBtn showHelp />
        <Dropdown label="Cost Centre" value={costCentre} options={COST_CENTRES} onChange={setCostCentre} disabled={isView} showGpitBtn showHelp />
      </>
    );
  }

  function renderCompany() {
    return (
      <>
        <SectionHead text="Company Details" />
        <Dropdown label="Company Code" value={companyCode} options={[]} onChange={setCompanyCode} disabled={isView} showGpitBtn showHelp />
        <Dropdown label="Payroll Company" value={payrollCompany} options={PAYROLL_COMPANIES} onChange={setPayrollCompany} disabled={isView} showGpitBtn showHelp />
      </>
    );
  }

  function renderBiometrics() {
    return (
      <>
        <SectionHead text="Biometrics / ID" />
        <Field label="Fingerprint ID" value={fingerprintId} onChangeText={setFingerprintId} placeholder="e.g. FP-00123" editable={!isView} hint="Assigned by biometric device" />
        <Field label="Card Number" value={cardNumber} onChangeText={setCardNumber} placeholder="e.g. CARD-9876" editable={!isView} />
        {!isView && (
          <Pressable
            style={({ pressed }) => [s.enrollBtn, pressed && { opacity: 0.8 }]}
            onPress={() => Alert.alert('Biometric Enrolment', 'Connect to biometric device to enrol fingerprint.')}>
            <View style={s.enrollIcon}><View style={s.efL} /><View style={s.efR} /></View>
            <Text style={s.enrollTxt}>Enrol Fingerprint</Text>
          </Pressable>
        )}
      </>
    );
  }

  const tabContent: Record<TabId, () => React.ReactNode> = {
    general:    renderGeneral,
    rosters:    renderRosters,
    uploads:    renderUploads,
    workbranch: renderWorkBranch,
    company:    renderCompany,
    biometrics: renderBiometrics,
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.container}>

          {/* ── Header ── */}
          <View style={s.header}>
            <View style={s.headerIcon}>
              <View style={s.empHead} />
              <View style={s.empBody} />
              <View style={s.empCard} />
            </View>
            <View style={s.headerTitle}>
              <Text style={s.titleTxt}>
                {isEdit ? 'Update Employee' : isView ? 'View Employee' : 'Create Employee'}
              </Text>
              <Text style={s.tabIndicator}>
                {TABS.find(t => t.id === activeTab)?.label ?? 'General'}
              </Text>
            </View>
            {/* Reset Form */}
            {!isView && (
              <Pressable onPress={handleReset} style={({ pressed }) => [s.resetBtn, pressed && { opacity: 0.7 }]}>
                <View style={s.resetIcon}><View style={s.rL} /><View style={s.rR} /></View>
                <Text style={s.resetTxt}>Reset</Text>
              </Pressable>
            )}
            {/* Close */}
            <Pressable onPress={onClose} style={({ pressed }) => [s.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={12}>
              <View style={s.xL} /><View style={s.xR} />
            </Pressable>
          </View>

          {/* ── Progress bar ── */}
          <ProgressBar pct={pct} />

          {/* ── Tab bar ── */}
          <View style={s.tabBarWrap}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.tabBar}>
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                return (
                  <Pressable
                    key={tab.id}
                    onPress={() => { setActiveTab(tab.id); scrollRef.current?.scrollTo({ y: 0, animated: false }); }}
                    style={[s.tabBtn, active && s.tabBtnActive]}>
                    <tab.Icon active={active} />
                    <Text style={[s.tabLbl, active && s.tabLblActive]}>{tab.label}</Text>
                    {active && <View style={s.tabUnderline} />}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* ── Form ── */}
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={s.form}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {tabContent[activeTab]()}
            <View style={{ height: 24 }} />
          </ScrollView>

          {/* ── Footer ── */}
          <View style={s.footer}>
            <Pressable onPress={onClose} style={({ pressed }) => [s.cancelBtn, pressed && { opacity: 0.7 }]}>
              <Text style={s.cancelTxt}>Cancel</Text>
            </Pressable>
            {!isView && (
              <Pressable onPress={handleSave} style={({ pressed }) => [s.saveBtn, pressed && { opacity: 0.85 }]}>
                <Text style={s.saveTxt}>{isEdit ? 'Update Employee' : 'Create Employee'}</Text>
              </Pressable>
            )}
          </View>

        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK = '#1C1C1E';

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F7' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg, paddingTop: Platform.OS === 'ios' ? 56 : 22,
    paddingBottom: Spacing.md, gap: Spacing.md,
    borderBottomWidth: 1, borderBottomColor: '#EBEBEB',
  },
  headerIcon: {
    width: 38, height: 38, borderRadius: 8, backgroundColor: Colors.primaryHighlight,
    alignItems: 'center', justifyContent: 'center',
  },
  // Employee silhouette inside icon
  empHead: { position: 'absolute', top: 6, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFF' },
  empBody: { position: 'absolute', bottom: 8, width: 18, height: 10, borderTopLeftRadius: 9, borderTopRightRadius: 9, backgroundColor: '#FFF' },
  empCard: { position: 'absolute', bottom: 5, right: 5, width: 8, height: 6, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: '#FFF' },

  headerTitle: { flex: 1 },
  titleTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: DARK, letterSpacing: 0.2 },
  tabIndicator: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder, marginTop: 2 },

  // Reset button
  resetBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8' },
  resetIcon: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  rL: { position: 'absolute', width: 10, height: 1.5, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  rR: { position: 'absolute', width: 10, height: 1.5, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  resetTxt: { fontFamily: FontFamily.medium, fontSize: 10, color: Colors.placeholder },

  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F0F0F5', alignItems: 'center', justifyContent: 'center' },
  xL: { position: 'absolute', width: 14, height: 2, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR: { position: 'absolute', width: 14, height: 2, backgroundColor: '#888', borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  // Tab bar
  tabBarWrap: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  tabBar: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  tabBtn: {
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10,
    gap: 3, minWidth: 56, position: 'relative',
  },
  tabBtnActive: {},
  tabLbl: { fontFamily: FontFamily.regular, fontSize: 9, color: '#A0A0A0', textAlign: 'center' },
  tabLblActive: { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: Colors.primaryHighlight },
  tabUnderline: {
    position: 'absolute', bottom: 0, left: 8, right: 8,
    height: 2.5, borderRadius: 2, backgroundColor: Colors.primaryHighlight,
  },

  // Form
  form: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },

  // Placeholder box (Uploads tab)
  placeholderBox: {
    marginTop: Spacing.md, borderRadius: 14, borderWidth: 1.5, borderColor: '#E0E0E8',
    borderStyle: 'dashed', padding: Spacing.xl, alignItems: 'center', gap: Spacing.sm,
    backgroundColor: '#FAFAFA',
  },
  uploadIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  uploadArrow: { width: 0, height: 0, borderLeftWidth: 10, borderRightWidth: 10, borderBottomWidth: 14, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: '#C0C0CC', position: 'absolute', top: 0 },
  uploadStem: { position: 'absolute', bottom: 4, width: 3, height: 14, backgroundColor: '#C0C0CC', borderRadius: 1.5 },
  placeholderTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primaryText },
  placeholderSub: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder, textAlign: 'center', lineHeight: 16 },

  // Biometrics enrol button
  enrollBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.md,
    backgroundColor: '#E8F5E9', borderRadius: 10, paddingHorizontal: Spacing.lg, paddingVertical: 13,
    borderWidth: 1, borderColor: '#30A84B',
  },
  enrollIcon: { width: 18, height: 18, borderRadius: 9, backgroundColor: '#30A84B', alignItems: 'center', justifyContent: 'center' },
  efL: { position: 'absolute', width: 8, height: 1.5, backgroundColor: '#FFF', borderRadius: 1 },
  efR: { position: 'absolute', width: 1.5, height: 8, backgroundColor: '#FFF', borderRadius: 1 },
  enrollTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: '#30A84B' },

  // Footer
  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md,
    backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E5E5EA', gap: Spacing.sm,
  },
  cancelBtn: {
    paddingVertical: 12, paddingHorizontal: Spacing.md, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#D0D0D8', backgroundColor: '#FFF', minWidth: 80, alignItems: 'center',
  },
  cancelTxt: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.primaryText },
  saveBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: DARK, borderRadius: 10, paddingVertical: 14,
  },
  saveTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.5 },
});

const pb = StyleSheet.create({
  wrap: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  track: { height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'visible', position: 'relative' },
  fill: { height: 6, borderRadius: 3 },
  marker: { position: 'absolute', top: -3, width: 2, height: 12, backgroundColor: '#595959', borderRadius: 1 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  labelLeft: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelMid:  { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelRight:{ fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelAvg:  { color: '#30A84B', fontFamily: FontFamily.bold, fontWeight: FontWeight.bold },
  warning:   { fontFamily: FontFamily.regular, fontSize: 9, color: '#E53935', marginTop: 3 },
});

const sec = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.xl, marginBottom: Spacing.md },
  bar: { width: 3, height: 13, borderRadius: 2, backgroundColor: Colors.primaryHighlight },
  txt: { fontFamily: FontFamily.bold, fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.placeholder, textTransform: 'uppercase', letterSpacing: 0.8 },
  line: { flex: 1, height: 1, backgroundColor: '#E8E8EE' },
});

const fi = StyleSheet.create({
  wrapper: { marginBottom: Spacing.lg },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  labelFoc: { color: Colors.primaryText },
  req: { color: Colors.primaryHighlight },
  input: { fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText, paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0', paddingHorizontal: 0 },
  inputFoc: { borderBottomColor: Colors.primaryText },
  inputRO: { color: Colors.placeholder, borderBottomColor: '#EAEAEA' },
  hint: { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder, marginTop: 3 },
});

const dd = StyleSheet.create({
  wrapper: { marginBottom: Spacing.lg, zIndex: 10 },
  label: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.placeholder, marginBottom: 5 },
  req: { color: Colors.primaryHighlight },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trigger: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: '#D0D0D0',
  },
  open: { borderBottomColor: Colors.primaryText },
  disabled: { opacity: 0.55 },
  value: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText },
  placeholder: { color: Colors.placeholder },
  chevWrap: { width: 18, height: 10, alignItems: 'center', justifyContent: 'center' },
  chevUp: { transform: [{ rotate: '180deg' }] },
  cL: { position: 'absolute', left: 0, width: 9, height: 2, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '35deg' }, { translateY: -1 }] },
  cR: { position: 'absolute', right: 0, width: 9, height: 2, backgroundColor: Colors.placeholder, borderRadius: 1, transform: [{ rotate: '-35deg' }, { translateY: -1 }] },
  // GPIT green button
  gpitBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  gpitImg: { width: 28, height: 28 },
  // Help button
  helpBtn: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#C0C0C8', alignItems: 'center', justifyContent: 'center' },
  helpTxt: { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: FontWeight.bold, color: '#A0A0A8' },
  // List
  list: { backgroundColor: '#FFF', borderRadius: 12, marginTop: 4, borderWidth: 1, borderColor: '#E5E5EA', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
  opt: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  optActive: { backgroundColor: 'rgba(233,30,99,0.04)' },
  optTxt: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.md, color: Colors.primaryText },
  optTxtActive: { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: Colors.primaryHighlight },
  chk: { width: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  chkL: { position: 'absolute', left: 0, bottom: 3, width: 5, height: 2, backgroundColor: Colors.primaryHighlight, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  chkR: { position: 'absolute', right: 0, bottom: 4, width: 9, height: 2, backgroundColor: Colors.primaryHighlight, borderRadius: 1, transform: [{ rotate: '-50deg' }] },
});

// Tab icons
const ti = StyleSheet.create({
  wrap: { width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  // Roster (person + lines)
  head: { position: 'absolute', top: 0, width: 6, height: 6, borderRadius: 3, left: 0 },
  line1: { position: 'absolute', top: 1, right: 0, width: 10, height: 1.5, borderRadius: 1 },
  line2: { position: 'absolute', top: 6, right: 0, width: 10, height: 1.5, borderRadius: 1 },
  line3: { position: 'absolute', top: 11, right: 0, width: 10, height: 1.5, borderRadius: 1 },
  // Upload
  docBody: { position: 'absolute', bottom: 0, width: 13, height: 15, borderRadius: 2, borderWidth: 1.5 },
  arrowUp: { position: 'absolute', top: 2, width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent' },
  arrowStem: { position: 'absolute', top: 8, width: 1.5, height: 5, borderRadius: 1 },
  // Work Branch
  bldBase: { position: 'absolute', bottom: 0, width: 16, height: 14, borderRadius: 2, borderWidth: 1.5 },
  bldDoor: { position: 'absolute', bottom: 0, width: 4, height: 6, borderTopLeftRadius: 2, borderTopRightRadius: 2 },
  bldW1: { position: 'absolute', top: 4, left: 2, width: 4, height: 4, borderRadius: 1, borderWidth: 1 },
  bldW2: { position: 'absolute', top: 4, right: 2, width: 4, height: 4, borderRadius: 1, borderWidth: 1 },
  // Company (people)
  p1: { position: 'absolute', top: 0, left: 3, width: 6, height: 6, borderRadius: 3 },
  p2: { position: 'absolute', top: 0, right: 3, width: 6, height: 6, borderRadius: 3, opacity: 0.5 },
  p1Body: { position: 'absolute', bottom: 0, width: 16, height: 9, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  // Biometrics (ID card)
  cardRect: { position: 'absolute', width: 18, height: 13, borderRadius: 2, borderWidth: 1.5 },
  cardLine1: { position: 'absolute', top: 5, left: 5, width: 8, height: 1.5, borderRadius: 1 },
  cardLine2: { position: 'absolute', top: 9, left: 5, width: 5, height: 1.5, borderRadius: 1 },
  cardCircle: { position: 'absolute', top: 3, right: 3, width: 5, height: 5, borderRadius: 3, borderWidth: 1.5 },
});
