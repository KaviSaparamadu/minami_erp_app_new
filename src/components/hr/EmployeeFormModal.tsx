import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
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
  DEPARTMENTS,
  DESIGNATION_CATEGORIES,
  DESIGNATION_GRADES,
  DESIGNATIONS,
  EMPLOYEE_TYPES,
  ENTITIES,
  PAYROLL_COMPANIES,
  SALARY_BOARDS,
  SECTIONS,
  SUB_DEPARTMENTS,
  SUB_SECTIONS,
  WORK_BRANCHES,
} from '../../constants/employeeData';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { Employee } from '../../types/hr';
import { fetchHumanList } from '../../api/humanApi';

export type EmployeeModalMode = 'create' | 'edit' | 'view';

interface Props {
  visible: boolean;
  mode: EmployeeModalMode;
  employee?: Employee | null;
  onClose: () => void;
  onSave: (data: Omit<Employee, 'id'>) => void;
}

import GPIT_BTN from '../../../assets/images/GPIT Create Module Button.png';

// ─── Progress bar ─────────────────────────────────────────────────────────────
function healthColor(pct: number): string {
  if (pct < 25) return '#E53935';
  if (pct < 50) return '#FB8C00';
  if (pct < 75) return '#FDD835';
  return '#30A84B';
}

function ProgressBar({ pct, outOfMatrix }: { pct: number; outOfMatrix: boolean }) {
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
        <Text style={[pb.labelBadge, meetsRequired ? pb.badgeAvg : pb.badgePct]}>
          {meetsRequired ? 'Average ✓' : `${Math.round(pct)}%`}
        </Text>
        <Text style={[pb.labelBadge, outOfMatrix ? pb.badgeCustomOn : pb.badgeCustomOff]}>
          {outOfMatrix ? 'Custom ✓' : 'Custom ✗'}
        </Text>
      </View>
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
  gpitBtnDisabled?: boolean;
  scrollRef?: React.RefObject<ScrollView | null>;
}
function Dropdown({
  label, value, options, onChange, disabled, placeholder, required,
  showGpitBtn = true, showHelp = true, gpitLabel, gpitBtnDisabled, scrollRef,
}: DDProps) {
  const [open, setOpen] = useState(false);
  const [selfY, setSelfY] = useState(0);

  function handleGpitPress() {
    Alert.alert(
      `Quick Create — ${gpitLabel ?? label}`,
      `Open the quick-create form for "${gpitLabel ?? label}"?`,
      [{ text: 'OK' }],
    );
  }

  function handleTriggerPress() {
    if (disabled) return;
    const next = !open;
    setOpen(next);
    if (next && scrollRef?.current) {
      scrollRef.current.scrollTo({ y: Math.max(0, selfY - 60), animated: true });
    }
  }

  return (
    <View
      style={[dd.wrapper, { zIndex: open ? 100 : 10 }]}
      onLayout={e => setSelfY(e.nativeEvent.layout.y)}>
      <Text style={dd.label}>
        {required && <Text style={dd.req}>*</Text>}{label}
      </Text>
      <View style={dd.row}>
        {/* Trigger */}
        <Pressable
          onPress={handleTriggerPress}
          style={[dd.trigger, open && dd.open, disabled && dd.disabled]}>
          <Text style={[dd.value, !value && dd.placeholder]}>
            {value || placeholder || `Select ${label}`}
          </Text>
          {!disabled && (
            <MaterialCommunityIcons
              name={open ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={Colors.placeholder}
            />
          )}
        </Pressable>

        {/* GPIT Create Module Button */}
        {showGpitBtn && !(gpitBtnDisabled !== undefined ? gpitBtnDisabled : disabled) && (
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
  const scrollRef    = useRef<ScrollView>(null);
  const tabScrollRef = useRef<ScrollView>(null);
  const tabScrollX   = useRef(0);
  const [activeTab,   setActiveTab]  = useState<TabId>('general');
  const [tabAtEnd,    setTabAtEnd]   = useState(false);
  const [tabAtStart,  setTabAtStart] = useState(true);

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

  // ── Company tab ──
  const [companyCode,      setCompanyCode]      = useState('');
  const [payrollCompany,   setPayrollCompany]   = useState('');

  // ── Biometrics tab ──
  const [fingerprintId, setFingerprintId] = useState('');
  const [cardNumber,    setCardNumber]    = useState('');

  // ── Work Branch table rows ──
  const [wbRows, setWbRows] = useState<{
    id: string; branch: string; code: string;
    attendanceOn: string; attendanceOff: string;
    main: boolean; status: 'Active' | 'Inactive';
  }[]>([]);

  const pct = calcProgress({ employeeName, salaryBoard, designationCategory, designation, designationGrade, employeeType, entity, workBranch, department });

  const generalComplete = !!(
    employeeName && salaryBoard && designationCategory &&
    designation && designationGrade && employeeType &&
    entity && workBranch && department
  );

  const [saving, setSaving] = useState(false);
  const [showResetConfirm,    setShowResetConfirm]    = useState(false);
  const [outOfSalaryMatrix,   setOutOfSalaryMatrix]   = useState(false);
  const [humanNames,          setHumanNames]          = useState<string[]>([]);
  const [leavePattern,        setLeavePattern]        = useState<'standard' | 'custom'>('standard');
  const [weeklyOffDay,        setWeeklyOffDay]        = useState('Monday');
  const [weeklyOffDays,       setWeeklyOffDays]       = useState<string[]>(['Monday']);
  const [profilePhotoUri,     setProfilePhotoUri]     = useState<string | null>(null);

  // ── Reset / populate ──
  useEffect(() => {
    if (!visible) return;
    fetchHumanList(1, 500).then(result => {
      if (result.ok && result.data) {
        setHumanNames(
          result.data.rows
            .map(r => String(r.t1fullname ?? ''))
            .filter(Boolean),
        );
      }
    });
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
      setCompanyCode(''); setPayrollCompany('');
      setFingerprintId(''); setCardNumber('');
    }
    setLeavePattern('standard');
    setWeeklyOffDay('Monday');
    setWeeklyOffDays(['Monday']);
  }, [visible, employee]);

  // Cascade resets
  useEffect(() => { setDesignation(''); }, [designationCategory]);
  useEffect(() => { setSubDepartment(''); setSection(''); setSubSection(''); }, [department]);
  useEffect(() => { setSection(''); setSubSection(''); }, [subDepartment]);
  useEffect(() => { setSubSection(''); }, [section]);

  // Auto-generate employee number from entity in create mode
  useEffect(() => {
    if (mode !== 'create') return;
    setEmployeeNumber(entity ? `${entity.charAt(0).toUpperCase()}001` : '');
  }, [entity]);

  function handleReset() { setShowResetConfirm(true); }

  function doReset() {
    setEmployeeNumber(''); setEmployeeName(''); setSalaryBoard('');
    setDesignationCategory(''); setDesignation(''); setDesignationGrade('');
    setEmployeeType(''); setEntity(''); setWorkBranch('');
    setDepartment(''); setSubDepartment(''); setSection(''); setSubSection('');
    setRosterGroup(''); setShiftPattern('');
    setCompanyCode(''); setPayrollCompany('');
    setFingerprintId(''); setCardNumber('');
    setOutOfSalaryMatrix(false);
    setLeavePattern('standard');
    setWeeklyOffDay('Monday');
    setWeeklyOffDays(['Monday']);
    setProfilePhotoUri(null);
  }

  function handleSave() {
    if (!employeeName.trim())   { Alert.alert('Required', 'Select Employee Name.'); return; }
    if (!salaryBoard)           { Alert.alert('Required', 'Select Salary Board.'); return; }
    if (!designationCategory)   { Alert.alert('Required', 'Select Designation Category.'); return; }
    if (!designation)           { Alert.alert('Required', 'Select Designation.'); return; }
    if (!designationGrade)      { Alert.alert('Required', 'Select Designation Grade.'); return; }
    if (!employeeType)          { Alert.alert('Required', 'Select Employee Type.'); return; }
    if (!entity)                { Alert.alert('Required', 'Select Entity (Company).'); return; }
    if (!workBranch)            { Alert.alert('Required', 'Select Work Branch.'); return; }
    if (!department)            { Alert.alert('Required', 'Select Department.'); return; }

    // Step 1 → Rosters (from any other tab)
    if (activeTab !== 'rosters' && activeTab !== 'workbranch') {
      setActiveTab('rosters');
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      return;
    }

    // Final step on Work Branch → save
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({
        employeeNumber: employeeNumber.trim() || undefined,
        employeeName: employeeName.trim(), salaryBoard, designationCategory,
        designation, designationGrade, employeeType, entity, workBranch,
        department, subDepartment: subDepartment || undefined,
        section: section || undefined, subSection: subSection || undefined,
        rosterGroup: rosterGroup || undefined, shiftPattern: shiftPattern || undefined,
        companyCode: companyCode || undefined, payrollCompany: payrollCompany || undefined,
        fingerprintId: fingerprintId.trim() || undefined, cardNumber: cardNumber.trim() || undefined,
      });
    }, 700);
  }

  // ── Tab content ──────────────────────────────────────────────────────────
  function renderGeneral() {
    return (
      <>
        {/* Employee No. + Out of Salary Matrix — single row, display only */}
        <View style={g.identityRow}>
          <View style={g.empNumDisplay}>
            <Text style={g.empNumLarge}>{employeeNumber || '—'}</Text>
            <Text style={g.empNumLabel}>Employee No.</Text>
          </View>
          {!isView ? (
            <Pressable style={g.checkRow} onPress={() => setOutOfSalaryMatrix(v => !v)}>
              <View style={[g.checkbox, outOfSalaryMatrix && g.checkboxOn]}>
                {outOfSalaryMatrix && <MaterialCommunityIcons name="check" size={11} color="#FFF" />}
              </View>
              <Text style={g.checkLabel}>Out of Salary Matrix</Text>
            </Pressable>
          ) : outOfSalaryMatrix ? (
            <View style={g.checkBadge}>
              <Text style={g.checkBadgeTxt}>Out of Salary Matrix</Text>
            </View>
          ) : null}
        </View>

        <SectionHead text="Job Details" />
        <Dropdown
          label="Employee Name" value={employeeName}
          options={humanNames} onChange={setEmployeeName}
          disabled={isView} required showGpitBtn showHelp
          gpitLabel="Employee Name" scrollRef={scrollRef}
        />
        <Dropdown
          label="Salary Board" value={salaryBoard}
          options={SALARY_BOARDS} onChange={setSalaryBoard}
          disabled={isView} required showGpitBtn showHelp scrollRef={scrollRef}
        />
        <Dropdown
          label="Designation Category" value={designationCategory}
          options={DESIGNATION_CATEGORIES} onChange={setDesignationCategory}
          disabled={isView} required showGpitBtn showHelp scrollRef={scrollRef}
        />
        <Dropdown
          label="Designation" value={designation}
          options={designationCategory ? (DESIGNATIONS[designationCategory] ?? []) : []}
          onChange={setDesignation}
          disabled={isView || !designationCategory}
          placeholder={designationCategory ? 'Select Designation' : 'Select Category first'}
          required showGpitBtn showHelp gpitBtnDisabled={isView} scrollRef={scrollRef}
        />
        <Dropdown
          label="Designation Grade" value={designationGrade}
          options={DESIGNATION_GRADES} onChange={setDesignationGrade}
          disabled={isView} required showGpitBtn showHelp scrollRef={scrollRef}
        />
        <Dropdown
          label="Employee Type" value={employeeType}
          options={EMPLOYEE_TYPES} onChange={setEmployeeType}
          disabled={isView} required showGpitBtn showHelp scrollRef={scrollRef}
        />

        <SectionHead text="Organisation" />
        <Dropdown
          label="Entity (Company)" value={entity}
          options={ENTITIES} onChange={setEntity}
          disabled={isView} required showGpitBtn showHelp scrollRef={scrollRef}
        />
        <Dropdown
          label="Work Branch" value={workBranch}
          options={WORK_BRANCHES} onChange={setWorkBranch}
          disabled={isView} required showGpitBtn showHelp scrollRef={scrollRef}
        />
        <Dropdown
          label="Department" value={department}
          options={DEPARTMENTS} onChange={setDepartment}
          disabled={isView} required showGpitBtn showHelp scrollRef={scrollRef}
        />
        <Dropdown
          label="Sub Department" value={subDepartment}
          options={department ? (SUB_DEPARTMENTS[department] ?? []) : []}
          onChange={setSubDepartment}
          disabled={isView || !department}
          placeholder={department ? 'Select Sub Department' : 'Select Department first'}
          showGpitBtn showHelp gpitBtnDisabled={isView} scrollRef={scrollRef}
        />
        <Dropdown
          label="Section" value={section}
          options={subDepartment ? (SECTIONS[subDepartment] ?? []) : []}
          onChange={setSection}
          disabled={isView || !subDepartment}
          placeholder={subDepartment ? 'Select Section' : 'Select Sub Department first'}
          showGpitBtn showHelp gpitBtnDisabled={isView} scrollRef={scrollRef}
        />
        <Dropdown
          label="Sub Section" value={subSection}
          options={section ? (SUB_SECTIONS[section] ?? []) : []}
          onChange={setSubSection}
          disabled={isView || !section}
          placeholder={section ? 'Select Sub Section' : 'Select Section first'}
          showGpitBtn showHelp gpitBtnDisabled={isView} scrollRef={scrollRef}
        />
      </>
    );
  }

  function renderRosters() {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const isCustom = leavePattern === 'custom';

    function isDaySelected(day: string) {
      return isCustom ? weeklyOffDays.includes(day) : weeklyOffDay === day;
    }

    function toggleDay(day: string) {
      if (isView) return;
      if (isCustom) {
        setWeeklyOffDays(prev =>
          prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
        );
      } else {
        setWeeklyOffDay(day);
      }
    }

    return (
      <View style={rs.root}>
        <Text style={rs.title}>Employee Roster Schedule</Text>

        {/* ── Leave Pattern card ── */}
        <View style={rs.card}>
          <Text style={rs.cardLabel}>Select Leave Pattern</Text>
          {([
            { val: 'standard' as const, label: 'Standard Pattern (1 Day Off)' },
            { val: 'custom'   as const, label: 'Custom Pattern (Multiple Days Off)' },
          ]).map(({ val, label }) => (
            <Pressable
              key={val}
              style={[rs.radioRow, val === 'custom' && { marginBottom: 0 }]}
              onPress={() => !isView && setLeavePattern(val)}>
              <View style={[rs.radio, leavePattern === val && rs.radioOn]}>
                {leavePattern === val && <View style={rs.radioDot} />}
              </View>
              <Text style={rs.radioLabel}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {/* ── Off-Days card ── */}
        <View style={rs.card}>
          <Text style={[rs.cardLabel, isCustom ? rs.cardLabelGreen : rs.cardLabelBlue]}>
            {isCustom ? 'Select Custom Off-Days' : 'Select Weekly Off-Day'}
          </Text>
          <View style={rs.daysGrid}>
            {DAYS.map(day => {
              const selected = isDaySelected(day);
              return (
                <Pressable key={day} style={rs.dayCell} onPress={() => toggleDay(day)}>
                  {isCustom ? (
                    <View style={[rs.checkbox, selected && rs.checkboxOn]}>
                      {selected && <MaterialCommunityIcons name="check" size={11} color="#FFF" />}
                    </View>
                  ) : (
                    <View style={[rs.radio, selected && rs.radioOn]}>
                      {selected && <View style={rs.radioDot} />}
                    </View>
                  )}
                  <Text style={rs.dayLabel}>{day}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* ── Add Roster → go to Uploads ── */}
        {!isView && (
          <Pressable
            style={({ pressed }) => [rs.addBtn, pressed && { opacity: 0.85 }]}
            onPress={() => { setActiveTab('uploads'); scrollRef.current?.scrollTo({ y: 0, animated: false }); }}>
            <Text style={rs.addBtnTxt}>Add Roster</Text>
          </Pressable>
        )}
      </View>
    );
  }

  function renderUploads() {
    return (
      <View style={up.root}>
        <Text style={up.title}>Employee Profile Photo</Text>

        {/* Preview + controls card */}
        <View style={up.card}>
          <View style={up.cardRow}>

            {/* Left — photo preview */}
            <View style={up.previewBox}>
              {profilePhotoUri ? (
                <Image source={{ uri: profilePhotoUri }} style={up.previewImg} />
              ) : (
                <MaterialCommunityIcons name="account-circle-outline" size={52} color="#C0C0C8" />
              )}
            </View>

            {/* Vertical divider */}
            <View style={up.vDivider} />

            {/* Right — upload controls */}
            <View style={up.controls}>
              <Text style={up.controlLabel}>Upload Image</Text>
              {!isView && (
                <Pressable
                  style={({ pressed }) => [up.chooseBtn, pressed && { opacity: 0.85 }]}
                  onPress={() =>
                    Alert.alert('Choose File', 'Select PNG, JPG or GIF (Max. 2MB).')
                  }>
                  <MaterialCommunityIcons name="cloud-upload-outline" size={17} color="#FFF" />
                  <Text style={up.chooseBtnTxt}>Choose File</Text>
                </Pressable>
              )}
              <Text style={up.hint}>PNG, JPG or GIF (Max. 2MB)</Text>
            </View>

          </View>
        </View>

        {/* Upload Image → go to Work Branch */}
        {!isView && (
          <Pressable
            style={({ pressed }) => [up.uploadBtn, pressed && { opacity: 0.85 }]}
            onPress={() => { setActiveTab('workbranch'); scrollRef.current?.scrollTo({ y: 0, animated: false }); }}>
            <Text style={up.uploadBtnTxt}>Upload Image</Text>
          </Pressable>
        )}
      </View>
    );
  }

  function handleAddWbRow() {
    const next = String(wbRows.length + 1);
    setWbRows(p => [...p, {
      id: next, branch: '', code: '', attendanceOn: '', attendanceOff: '', main: false, status: 'Active',
    }]);
  }

  function renderWorkBranch() {
    const WB_COLS = [
      { key: 'id',            label: 'ID',             width: 48  },
      { key: 'branch',        label: 'Branch',         width: 130 },
      { key: 'code',          label: 'Code',           width: 80  },
      { key: 'attendanceOn',  label: 'Attendance On',  width: 105 },
      { key: 'attendanceOff', label: 'Attendance Off', width: 105 },
      { key: 'main',          label: 'Main',           width: 52  },
      { key: 'status',        label: 'Status',         width: 72  },
    ] as const;
    const totalWidth = WB_COLS.reduce((s, c) => s + c.width, 0);

    return (
      <>
        {/* ── Work Branches table ── */}
        <View style={wbt.wrap}>
          <View style={wbt.titleRow}>
            <Text style={wbt.title}>Work Branches</Text>
            {!isView && (
              <Pressable onPress={handleAddWbRow} style={({ pressed }) => [wbt.addBtn, pressed && { opacity: 0.8 }]}>
                <View style={wbt.addH} /><View style={wbt.addV} />
              </Pressable>
            )}
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={[wbt.table, { width: totalWidth }]}>
              {/* Header */}
              <View style={wbt.headerRow}>
                {WB_COLS.map((col, i) => (
                  <View key={col.key} style={[wbt.cell, { width: col.width }, i < WB_COLS.length - 1 && wbt.cellRight]}>
                    <Text style={wbt.headerTxt}>{col.label}</Text>
                  </View>
                ))}
              </View>

              {/* Rows */}
              {wbRows.length === 0 ? (
                <View style={wbt.emptyRow}>
                  <Text style={wbt.emptyTxt}>No records</Text>
                </View>
              ) : (
                wbRows.map((row, idx) => (
                  <View key={row.id} style={[wbt.row, idx % 2 === 1 && wbt.rowAlt]}>
                    <View style={[wbt.cell, { width: WB_COLS[0].width }, wbt.cellRight]}>
                      <Text style={wbt.idTxt}>{row.id}</Text>
                    </View>
                    <View style={[wbt.cell, { width: WB_COLS[1].width }, wbt.cellRight]}>
                      <Text style={wbt.cellTxt} numberOfLines={1}>{row.branch || '—'}</Text>
                    </View>
                    <View style={[wbt.cell, { width: WB_COLS[2].width }, wbt.cellRight]}>
                      <Text style={wbt.cellTxt}>{row.code || '—'}</Text>
                    </View>
                    <View style={[wbt.cell, { width: WB_COLS[3].width }, wbt.cellRight]}>
                      <Text style={wbt.cellTxt}>{row.attendanceOn || '—'}</Text>
                    </View>
                    <View style={[wbt.cell, { width: WB_COLS[4].width }, wbt.cellRight]}>
                      <Text style={wbt.cellTxt}>{row.attendanceOff || '—'}</Text>
                    </View>
                    <View style={[wbt.cell, { width: WB_COLS[5].width }, wbt.cellRight]}>
                      <View style={[wbt.dot, row.main ? wbt.dotOn : wbt.dotOff]} />
                    </View>
                    <View style={[wbt.cell, { width: WB_COLS[6].width }]}>
                      <View style={[wbt.badge, row.status === 'Active' ? wbt.badgeOn : wbt.badgeOff]}>
                        <Text style={[wbt.badgeTxt, row.status === 'Active' ? wbt.badgeTxtOn : wbt.badgeTxtOff]}>
                          {row.status}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        </View>
      </>
    );
  }

  function renderCompany() {
    return (
      <>
        <SectionHead text="Company Details" />
        <Dropdown label="Company Code" value={companyCode} options={[]} onChange={setCompanyCode} disabled={isView} showGpitBtn showHelp scrollRef={scrollRef} />
        <Dropdown label="Payroll Company" value={payrollCompany} options={PAYROLL_COMPANIES} onChange={setPayrollCompany} disabled={isView} showGpitBtn showHelp scrollRef={scrollRef} />
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
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={s.cardWrapper}>

            {/* Close button sits centred on the card's top border */}
            <Pressable onPress={onClose} style={({ pressed }) => [s.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={16}>
              <View style={s.xL} /><View style={s.xR} />
            </Pressable>

            {/* Reset button — below close button */}
            {!isView && (
              <Pressable onPress={handleReset} style={({ pressed }) => [s.resetBtn, pressed && { opacity: 0.75 }]} hitSlop={8}>
                <MaterialCommunityIcons name="refresh" size={13} color="#FFF" />
                <Text style={s.resetTxt}>Reset Form</Text>
              </Pressable>
            )}

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
          </View>

          {/* ── Progress bar ── */}
          <ProgressBar pct={pct} outOfMatrix={outOfSalaryMatrix} />

          {/* ── Tab bar ── */}
          <View style={s.tabBarWrap}>
            <ScrollView
              ref={tabScrollRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={s.tabBar}
              scrollEventThrottle={16}
              onScroll={({ nativeEvent: { layoutMeasurement, contentOffset, contentSize } }) => {
                tabScrollX.current = contentOffset.x;
                setTabAtStart(contentOffset.x <= 4);
                setTabAtEnd(contentOffset.x + layoutMeasurement.width >= contentSize.width - 4);
              }}
              onContentSizeChange={(_w, _) => {
                setTabAtStart(true);
                setTabAtEnd(false);
                tabScrollRef.current?.scrollTo({ x: 0, animated: false });
              }}>
              {TABS.map(tab => {
                const active = activeTab === tab.id;
                const locked = tab.id !== 'general' && !generalComplete;
                return (
                  <Pressable
                    key={tab.id}
                    disabled={locked}
                    onPress={() => { setActiveTab(tab.id); scrollRef.current?.scrollTo({ y: 0, animated: false }); }}
                    style={[s.tabBtn, active && s.tabBtnActive, locked && s.tabBtnLocked]}>
                    <tab.Icon active={active} />
                    <Text style={[s.tabLbl, active && s.tabLblActive, locked && s.tabLblLocked]}>{tab.label}</Text>
                    {active && <View style={s.tabUnderline} />}
                    {locked && (
                      <View style={s.tabLockIcon}>
                        <MaterialCommunityIcons name="lock" size={8} color="#C0C0C0" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Left arrow */}
            {!tabAtStart && (
              <Pressable
                style={({ pressed }) => [s.tabArrowLeft, pressed && { opacity: 0.6 }]}
                onPress={() => tabScrollRef.current?.scrollTo({ x: Math.max(0, tabScrollX.current - 90), animated: true })}
                hitSlop={4}>
                <MaterialCommunityIcons name="chevron-left" size={16} color="#555" />
              </Pressable>
            )}

            {/* Right arrow */}
            {!tabAtEnd && (
              <Pressable
                style={({ pressed }) => [s.tabArrowRight, pressed && { opacity: 0.6 }]}
                onPress={() => tabScrollRef.current?.scrollTo({ x: tabScrollX.current + 90, animated: true })}
                hitSlop={4}>
                <MaterialCommunityIcons name="chevron-right" size={16} color="#555" />
              </Pressable>
            )}
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

          {/* ── Footer — hidden on Rosters & Uploads (each has its own action button) ── */}
          {!isView && activeTab !== 'rosters' && activeTab !== 'uploads' && (
            <View style={s.footer}>
              <Pressable onPress={handleSave} disabled={saving} style={({ pressed }) => [s.saveBtn, (pressed || saving) && { opacity: 0.85 }]}>
                {saving
                  ? <ActivityIndicator color="#FFF" size="small" />
                  : <Text style={s.saveTxt}>{isEdit ? 'Update Employee' : 'Create Employee'}</Text>}
              </Pressable>
            </View>
          )}

          </View>
          </View>
        </KeyboardAvoidingView>

        {/* ── Reset confirmation overlay ── */}
        {showResetConfirm && (
          <View style={rc.overlay}>
            <Pressable style={{position:'absolute',top:0,left:0,right:0,bottom:0}} onPress={() => setShowResetConfirm(false)} />
            <View style={rc.card}>
              <View style={rc.topAccent} />
              <Pressable onPress={() => setShowResetConfirm(false)} style={({ pressed }) => [rc.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={8}>
                <MaterialCommunityIcons name="close" size={13} color="#999" />
              </Pressable>
              <View style={rc.iconRing}>
                <View style={rc.iconCircle}>
                  <MaterialCommunityIcons name="refresh" size={20} color="#FFF" />
                </View>
              </View>
              <Text style={rc.title}>Reset Form?</Text>
              <Text style={rc.desc}>All entered data will be cleared.{'\n'}This action cannot be undone.</Text>
              <View style={rc.divider} />
              <View style={rc.btnRow}>
                <Pressable onPress={() => setShowResetConfirm(false)} style={({ pressed }) => [rc.cancelBtn, pressed && { opacity: 0.7 }]}>
                  <Text style={rc.cancelTxt}>Keep Editing</Text>
                </Pressable>
                <Pressable onPress={() => { setShowResetConfirm(false); doReset(); }} style={({ pressed }) => [rc.confirmBtn, pressed && { opacity: 0.85 }]}>
                  <MaterialCommunityIcons name="refresh" size={14} color="#FFF" />
                  <Text style={rc.confirmTxt}>Yes, Reset</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK = '#595959';

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  cardWrapper: {
    flex: 1,
    maxHeight: '95%',
    width: '100%',
  },
  container: { flex: 1, backgroundColor: '#F5F5F7', borderRadius: 10, overflow: 'hidden' },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm,
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
  resetBtn: {
    position: 'absolute', top: 24, right: 6, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#1976D2',
    borderRadius: 20,
    paddingHorizontal: 10, paddingVertical: 5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2, shadowRadius: 3, elevation: 4,
  },
  resetTxt: { fontFamily: FontFamily.medium, fontSize: 11, color: '#FFF' },

  closeBtn: {
    position: 'absolute',
    top: -18,
    right: -5,
    zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4, elevation: 6,
  },
  xL: { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR: { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  // Tab bar
  tabBarWrap: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EBEBEB', position: 'relative' },
  tabBar: { flexDirection: 'row', paddingHorizontal: Spacing.sm },
  tabBtn: {
    alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10, paddingVertical: 10,
    gap: 3, minWidth: 56, position: 'relative',
  },
  tabBtnActive: {},
  tabBtnLocked: { opacity: 0.4 },
  tabLbl: { fontFamily: FontFamily.regular, fontSize: 9, color: '#A0A0A0', textAlign: 'center' },
  tabLblActive: { fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: Colors.primaryHighlight },
  tabLblLocked: { color: '#C0C0C0' },
  tabLockIcon: { position: 'absolute', top: 4, right: 4 },
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

  // Tab bar scroll arrows
  tabArrowLeft: {
    position: 'absolute', top: 0, left: 0, bottom: 0,
    width: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRightWidth: 1, borderRightColor: '#EBEBEB',
  },
  tabArrowRight: {
    position: 'absolute', top: 0, right: 0, bottom: 0,
    width: 28, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 1, borderLeftColor: '#EBEBEB',
  },
});

const pb = StyleSheet.create({
  wrap: { backgroundColor: '#FFFFFF', paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  track: { height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'visible', position: 'relative' },
  fill: { height: 6, borderRadius: 3 },
  marker: { position: 'absolute', top: -3, width: 2, height: 12, backgroundColor: '#595959', borderRadius: 1 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  labelLeft:     { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelMid:      { fontFamily: FontFamily.regular, fontSize: 9, color: Colors.placeholder },
  labelBadge:    { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: FontWeight.bold, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 },
  badgeAvg:      { color: '#30A84B', backgroundColor: 'rgba(48,168,75,0.1)' },
  badgePct:      { color: Colors.placeholder, backgroundColor: 'transparent' },
  badgeCustomOn: { color: '#1976D2', backgroundColor: 'rgba(25,118,210,0.1)' },
  badgeCustomOff:{ color: '#E53935', backgroundColor: 'rgba(229,57,53,0.08)' },
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

const g = StyleSheet.create({
  identityRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFF', borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 8, gap: 12,
    borderWidth: 1, borderColor: '#E8E8EE',
  },
  empNumBox: { flex: 1 },
  empNumDisplay: { flex: 1 },
  empNumLarge: {
    fontFamily: FontFamily.bold, fontSize: 20, fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight, letterSpacing: 0.5,
  },
  empNumPlaceholder: {
    fontFamily: FontFamily.regular, fontSize: 13,
    color: Colors.placeholder, fontStyle: 'italic',
  },
  empNumLabel: {
    fontFamily: FontFamily.regular, fontSize: 9,
    color: Colors.placeholder, marginTop: 2,
  },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#C0C0C8',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  checkboxOn: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
  checkLabel: {
    fontFamily: FontFamily.medium, fontSize: 11,
    color: Colors.primaryText, flexShrink: 1,
  },
  checkBadge: {
    backgroundColor: 'rgba(25,118,210,0.1)', borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  checkBadgeTxt: { fontFamily: FontFamily.medium, fontSize: 10, color: '#1976D2' },
  grid: { flexDirection: 'row', alignItems: 'flex-start' },
  col: { flex: 1 },
  colDivider: { width: 1, backgroundColor: '#E8E8EE', marginTop: 32, alignSelf: 'stretch' },
});

const rc = StyleSheet.create({
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 44,
  },
  card: {
    width: '100%', backgroundColor: '#FFF',
    borderRadius: 14, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15, shadowRadius: 12, elevation: 10,
  },
  topAccent: { height: 3, backgroundColor: '#1976D2' },
  iconRing: { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: '#1976D2',
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    fontFamily: FontFamily.bold, fontSize: 14, fontWeight: FontWeight.bold,
    color: '#1C1C1E', marginBottom: 4,
  },
  desc: {
    textAlign: 'center',
    fontFamily: FontFamily.regular, fontSize: 11,
    color: '#999', lineHeight: 16,
    paddingHorizontal: 12, marginBottom: 12,
  },
  divider: { height: 1, backgroundColor: '#F0F0F4' },
  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: 12, paddingVertical: 10, gap: 8,
  },
  cancelBtn: {
    flex: 1, paddingVertical: 8, borderRadius: 8,
    borderWidth: 1.5, borderColor: '#D0D0D8',
    alignItems: 'center', justifyContent: 'center',
  },
  cancelTxt: { fontFamily: FontFamily.medium, fontSize: 12, color: '#666' },
  confirmBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 4, paddingVertical: 8, borderRadius: 8,
    backgroundColor: '#E53935',
  },
  confirmTxt: {
    fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF',
  },
  closeBtn: {
    position: 'absolute', top: 8, right: 8, zIndex: 10,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: '#F0F0F4',
    alignItems: 'center', justifyContent: 'center',
  },
});

const rs = StyleSheet.create({
  root: { flex: 1 },
  title: {
    fontFamily: FontFamily.bold, fontSize: 17, fontWeight: FontWeight.bold,
    color: DARK, marginBottom: 14, letterSpacing: 0.2,
  },

  // Cards
  card: {
    backgroundColor: '#FFF', borderRadius: 12,
    borderWidth: 1, borderColor: '#E8E8EE',
    paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6,
    marginBottom: 12,
  },
  cardLabel: {
    fontFamily: FontFamily.medium, fontSize: FontSize.sm,
    color: Colors.primaryText, marginBottom: 14,
  },
  cardLabelBlue: {
    fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: '#1976D2',
  },
  cardLabelGreen: {
    fontFamily: FontFamily.bold, fontWeight: FontWeight.bold, color: '#2E7D32',
  },

  // Radio (circle — Standard)
  radioRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  radio: {
    width: 19, height: 19, borderRadius: 10,
    borderWidth: 2, borderColor: '#C0C0C8',
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  radioOn: { borderColor: '#1976D2' },
  radioDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: '#1976D2' },
  radioLabel: {
    fontFamily: FontFamily.regular, fontSize: FontSize.sm,
    color: Colors.primaryText, flex: 1,
  },

  // Checkbox (square — Custom)
  checkbox: {
    width: 18, height: 18, borderRadius: 4,
    borderWidth: 1.5, borderColor: '#C0C0C8',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF', flexShrink: 0,
  },
  checkboxOn: { backgroundColor: '#2E7D32', borderColor: '#2E7D32' },

  // Days grid — 2 columns
  daysGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    flexDirection: 'row', alignItems: 'center',
    gap: 10, width: '50%', marginBottom: 14,
  },
  dayLabel: {
    fontFamily: FontFamily.regular, fontSize: FontSize.sm,
    color: Colors.primaryText,
  },

  // Add Roster button
  addBtn: {
    backgroundColor: '#3D3D3D', borderRadius: 8,
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  addBtnTxt: {
    fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold,
    color: '#FFF', letterSpacing: 0.5,
  },
});

const up = StyleSheet.create({
  root: { flex: 1 },
  title: {
    fontFamily: FontFamily.bold, fontSize: 17, fontWeight: FontWeight.bold,
    color: DARK, marginBottom: 14, letterSpacing: 0.2,
  },

  // Card
  card: {
    backgroundColor: '#F8F8FA', borderRadius: 12,
    borderWidth: 1, borderColor: '#E0E0E8',
    padding: 16, marginBottom: 14,
  },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },

  // Photo preview box
  previewBox: {
    width: 100, height: 100, borderRadius: 10,
    borderWidth: 1.5, borderColor: '#C0C0C8', borderStyle: 'dashed',
    backgroundColor: '#FFF',
    alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
    flexShrink: 0,
  },
  previewImg: { width: '100%', height: '100%' },

  // Vertical divider
  vDivider: { width: 1, height: 100, backgroundColor: '#E0E0E8' },

  // Controls
  controls: { flex: 1, gap: 10 },
  controlLabel: {
    fontFamily: FontFamily.medium, fontSize: FontSize.sm,
    color: Colors.primaryText,
  },
  chooseBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#1976D2', borderRadius: 8,
    paddingHorizontal: 14, paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  chooseBtnTxt: {
    fontFamily: FontFamily.bold, fontSize: FontSize.sm,
    fontWeight: FontWeight.bold, color: '#FFF',
  },
  hint: {
    fontFamily: FontFamily.regular, fontSize: 10, color: Colors.placeholder,
  },

  // Upload button
  uploadBtn: {
    backgroundColor: '#3D3D3D', borderRadius: 8,
    paddingVertical: 15, alignItems: 'center', justifyContent: 'center',
  },
  uploadBtnTxt: {
    fontFamily: FontFamily.bold, fontSize: FontSize.md,
    fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.5,
  },
});

// ─── Work Branch table styles ─────────────────────────────────────────────────
const wbt = StyleSheet.create({
  wrap: { marginTop: Spacing.xl },

  titleRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontFamily: FontFamily.bold, fontSize: FontSize.sm,
    fontWeight: FontWeight.bold, color: Colors.primaryText,
  },
  addBtn: {
    width: 28, height: 28, borderRadius: 7,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center', justifyContent: 'center',
  },
  addH: { position: 'absolute', width: 11, height: 2, borderRadius: 1, backgroundColor: '#FFF' },
  addV: { position: 'absolute', width: 2, height: 11, borderRadius: 1, backgroundColor: '#FFF' },

  table: {
    borderWidth: 1, borderColor: '#D0D0D8', borderRadius: 6, overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F5F5F7',
    borderBottomWidth: 1, borderBottomColor: '#D0D0D8',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1, borderBottomColor: '#EBEBF0',
    backgroundColor: '#FFFFFF',
  },
  rowAlt: { backgroundColor: '#FAFAFA' },

  cell: {
    paddingHorizontal: 8, paddingVertical: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  cellRight: { borderRightWidth: 1, borderRightColor: '#D0D0D8' },

  headerTxt: {
    fontFamily: FontFamily.bold, fontSize: 10,
    fontWeight: '600', color: Colors.placeholder, textAlign: 'center',
  },
  idTxt: {
    fontFamily: FontFamily.regular, fontSize: 11,
    color: Colors.placeholder, textAlign: 'center',
  },
  cellTxt: {
    fontFamily: FontFamily.regular, fontSize: 11,
    color: Colors.primaryText, textAlign: 'center',
  },

  dot: { width: 9, height: 9, borderRadius: 5 },
  dotOn:  { backgroundColor: '#30A84B' },
  dotOff: { backgroundColor: '#C8C8D0' },

  badge: { borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 },
  badgeOn:  { backgroundColor: 'rgba(48,168,75,0.12)' },
  badgeOff: { backgroundColor: 'rgba(229,57,53,0.10)' },
  badgeTxt: { fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '600' },
  badgeTxtOn:  { color: '#2E7D32' },
  badgeTxtOff: { color: '#C62828' },

  emptyRow: { paddingVertical: 20, alignItems: 'center' },
  emptyTxt: { fontFamily: FontFamily.regular, fontSize: 12, color: Colors.placeholder },
});
