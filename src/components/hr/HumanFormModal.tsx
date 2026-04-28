import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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
  JP_CITIES,
  JP_DISTRICTS,
  JP_PREFECTURES,
  SL_DISTRICTS,
  SL_GN_DIVISIONS,
  SL_PROVINCES,
  TITLES,
} from '../../constants/locationData';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import type { Country, Human } from '../../types/hr';

export type ModalMode = 'create' | 'edit' | 'view';

interface Props {
  visible: boolean;
  mode: ModalMode;
  human?: Human | null;
  onClose: () => void;
  onSave: (data: Omit<Human, 'id'>) => void;
}

// ─── NIC utilities ────────────────────────────────────────────────────────────
function nicToBirthday(nic: string): string {
  const s = nic.trim().toUpperCase();
  let year: number; let day: number;
  if      (/^\d{9}[VX]$/.test(s)) { const yy = parseInt(s.substring(0,2),10); year = yy<=25?2000+yy:1900+yy; day=parseInt(s.substring(2,5),10); }
  else if (/^\d{12}$/.test(s))     { year=parseInt(s.substring(0,4),10); day=parseInt(s.substring(4,7),10); }
  else return '';
  if (day>500) day-=500;
  if (day<1||day>366) return '';
  const d=new Date(year,0,1); d.setDate(day);
  return `${String(d.getDate()).padStart(2,'0')}-${d.toLocaleString('en',{month:'long'})}-${year}`;
}
function nicToGender(nic: string): string {
  const s=nic.trim().toUpperCase();
  let day: number;
  if      (/^\d{9}[VX]$/.test(s)) day=parseInt(s.substring(2,5),10);
  else if (/^\d{12}$/.test(s))     day=parseInt(s.substring(4,7),10);
  else return '';
  return day>500?'Female':'Male';
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function healthColor(pct: number): string {
  if (pct < 25)  return '#E53935'; // red
  if (pct < 50)  return '#FB8C00'; // orange
  if (pct < 75)  return '#FDD835'; // yellow
  return '#30A84B';                // green
}

function ProgressBar({ pct }: { pct: number }) {
  const required = 15;
  const fillColor = healthColor(pct);
  return (
    <View style={pb.wrap}>
      {/* Bar shell */}
      <View style={pb.track}>
        <View style={[pb.fill, { width: `${pct}%` as any, backgroundColor: fillColor }]} />
        {/* Required threshold marker */}
        <View style={[pb.marker, { left: `${required}%` as any }]} />
      </View>
      <View style={pb.labels}>
        <Text style={pb.labelLeft}>Results Weighted On</Text>
        <Text style={pb.labelMid}>Required — {required}%</Text>
        <Text style={[pb.labelRight, pct >= required && pb.labelAvg]}>
          {pct >= required ? 'Average ✓' : `${Math.round(pct)}%`}
        </Text>
      </View>
    </View>
  );
}

// ─── Dropdown (bottom-border) ─────────────────────────────────────────────────
interface DDProps { label: string; value: string; options: string[]; onChange:(v:string)=>void; disabled?:boolean; placeholder?:string; required?:boolean; }
function Dropdown({ label, value, options, onChange, disabled, placeholder, required }: DDProps) {
  const [open, setOpen] = useState(false);
  return (
    <View style={dd.wrapper}>
      <Text style={dd.label}>{label}{required && <Text style={dd.req}> *</Text>}</Text>
      <Pressable onPress={() => !disabled && setOpen(o=>!o)} style={[dd.trigger, open && dd.open, disabled && dd.disabled]}>
        <Text style={[dd.value, !value && dd.placeholder]}>{value || placeholder || `Select ${label}`}</Text>
        {!disabled && <View style={[dd.chevWrap, open && dd.chevUp]}><View style={dd.cL}/><View style={dd.cR}/></View>}
      </Pressable>
      {open && (
        <View style={dd.list}>
          <ScrollView style={{maxHeight:160}} nestedScrollEnabled keyboardShouldPersistTaps="handled">
            {options.map(opt=>(
              <Pressable key={opt} style={[dd.opt, value===opt && dd.optActive]} onPress={()=>{onChange(opt);setOpen(false);}}>
                <Text style={[dd.optTxt, value===opt && dd.optTxtActive]}>{opt}</Text>
                {value===opt && <View style={dd.chk}><View style={dd.chkL}/><View style={dd.chkR}/></View>}
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

// ─── Field (bottom-border) ────────────────────────────────────────────────────
interface FProps { label:string; value:string; onChangeText?:(t:string)=>void; placeholder?:string; keyboardType?:'default'|'email-address'|'phone-pad'|'numeric'; autoCapitalize?:'none'|'words'|'sentences'|'characters'; editable?:boolean; required?:boolean; hint?:string; }
function Field({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, editable=true, required, hint }: FProps) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={fi.wrapper}>
      <Text style={[fi.label, focused && fi.labelFoc]}>{label}{required && <Text style={fi.req}> *</Text>}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={Colors.placeholder} keyboardType={keyboardType??'default'} autoCapitalize={autoCapitalize??'sentences'} editable={editable} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={[fi.input, focused && fi.inputFoc, !editable && fi.inputRO]} />
      {hint && <Text style={fi.hint}>{hint}</Text>}
    </View>
  );
}

// ─── Surname tag input ────────────────────────────────────────────────────────
function SurnameTagInput({ values, onChange, disabled }: { values: string[]; onChange:(v:string[])=>void; disabled?:boolean }) {
  const [draft, setDraft] = useState('');
  const [focused, setFocused] = useState(false);

  function addTag() {
    const t = draft.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setDraft('');
  }
  function removeTag(i: number) {
    onChange(values.filter((_,idx)=>idx!==i));
  }

  return (
    <View style={tag.wrapper}>
      <Text style={[tag.label, focused && tag.labelFoc]}>Surname <Text style={tag.req}>*</Text></Text>
      <View style={[tag.box, focused && tag.boxFoc]}>
        {values.map((v,i)=>(
          <View key={i} style={tag.chip}>
            <Text style={tag.chipTxt}>{v}</Text>
            {!disabled && (
              <Pressable onPress={()=>removeTag(i)} hitSlop={6} style={tag.chipX}>
                <View style={tag.xL}/><View style={tag.xR}/>
              </Pressable>
            )}
          </View>
        ))}
        {!disabled && (
          <TextInput
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={addTag}
            onBlur={()=>{ addTag(); setFocused(false); }}
            onFocus={()=>setFocused(true)}
            placeholder={values.length===0?'Type & press Enter to add':'Add another…'}
            placeholderTextColor={Colors.placeholder}
            autoCapitalize="words"
            returnKeyType="done"
            blurOnSubmit={false}
            style={tag.input}
          />
        )}
      </View>
    </View>
  );
}

// ─── Dynamic address lines ────────────────────────────────────────────────────
function AddressLines({ lines, onChange, disabled }: { lines:string[]; onChange:(l:string[])=>void; disabled?:boolean }) {
  function update(i:number, v:string) { const n=[...lines]; n[i]=v; onChange(n); }
  function remove(i:number) { onChange(lines.filter((_,idx)=>idx!==i)); }
  function add() { onChange([...lines, '']); }

  return (
    <View>
      {lines.map((line, i)=>(
        <View key={i} style={addr.row}>
          <View style={{flex:1}}>
            <Field
              label={i===0 ? 'Address Line 1' : `Address Line ${i+1}`}
              value={line}
              onChangeText={v=>update(i,v)}
              placeholder="Enter address"
              editable={!disabled}
            />
          </View>
          {i>0 && !disabled && (
            <Pressable onPress={()=>remove(i)} style={addr.removeBtn} hitSlop={8}>
              <View style={addr.removeLine1}/>
              <View style={addr.removeLine2}/>
            </Pressable>
          )}
        </View>
      ))}
      {!disabled && lines.length < 4 && (
        <Pressable onPress={add} style={addr.addBtn}>
          <View style={addr.addIcon}><View style={addr.addH}/><View style={addr.addV}/></View>
          <Text style={addr.addTxt}>Add Address Line</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ text }: { text:string }) {
  return (
    <View style={sec.row}>
      <View style={sec.bar}/>
      <Text style={sec.txt}>{text}</Text>
      <View style={sec.line}/>
    </View>
  );
}

// ─── Progress calculation ─────────────────────────────────────────────────────
function calcProgress(country: string, nic: string, dob: string, title: string, fullName: string, surnames: string[], firstName: string, province: string, district: string, gnDiv: string, prefecture: string, city: string, town: string): number {
  const isSL = country === 'Sri Lanka';
  const required = isSL
    ? [country, nic, dob, title, fullName, surnames.length>0?'ok':'', firstName, province, district, gnDiv]
    : [country, title, fullName, surnames.length>0?'ok':'', firstName, prefecture, city, town];
  const filled = required.filter(Boolean).length;
  return Math.round((filled / required.length) * 100);
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export function HumanFormModal({ visible, mode, human, onClose, onSave }: Props) {
  const isView   = mode === 'view';
  const isEdit   = mode === 'edit';
  const scrollRef = useRef<ScrollView>(null);

  const [saving, setSaving] = useState(false);

  // ── Step ──
  const [step, setStep] = useState(1);

  // ── Step 1 ──
  const [country,  setCountry]  = useState<Country|''>('');
  const [nic,      setNic]      = useState('');
  const [dob,      setDob]      = useState('');
  const [gender,   setGender]   = useState('');
  const [title,    setTitle]    = useState('');
  const [fullName, setFullName] = useState('');

  // ── Step 2 ──
  const [surnames,  setSurnames]  = useState<string[]>([]);
  const [firstName, setFirstName] = useState('');
  const [otherName, setOtherName] = useState('');

  // ── Step 3 SL ──
  const [province,   setProvince]   = useState('');
  const [district,   setDistrict]   = useState('');
  const [gnDivision, setGnDivision] = useState('');
  const [houseNo,    setHouseNo]    = useState('');
  const [addrLines,  setAddrLines]  = useState<string[]>(['']);

  // ── Step 3 JP ──
  const [prefecture,   setPrefecture]   = useState('');
  const [city,         setCity]         = useState('');
  const [townDistrict, setTownDistrict] = useState('');

  const isSL = country === 'Sri Lanka';

  const pct = calcProgress(country, nic, dob, title, fullName, surnames, firstName, province, district, gnDivision, prefecture, city, townDistrict);

  // ── Reset / populate on open ──
  useEffect(()=>{
    if (!visible) return;
    setStep(1);
    if (human) {
      setCountry(human.country??'');
      setNic(human.nic??''); setDob(human.dateOfBirth??''); setGender(human.gender??'');
      setTitle(human.title??''); setFullName(human.fullName??'');
      setSurnames(human.surname ? human.surname.split(',').map(s=>s.trim()) : []);
      setFirstName(human.firstName??''); setOtherName(human.otherName??'');
      setProvince(human.province??''); setDistrict(human.district??''); setGnDivision(human.gnDivision??'');
      setHouseNo(''); setAddrLines(['']);
      setPrefecture(human.prefecture??''); setCity(human.city??''); setTownDistrict(human.townDistrict??'');
    } else {
      setCountry(''); setNic(''); setDob(''); setGender(''); setTitle(''); setFullName('');
      setSurnames([]); setFirstName(''); setOtherName('');
      setProvince(''); setDistrict(''); setGnDivision(''); setHouseNo(''); setAddrLines(['']);
      setPrefecture(''); setCity(''); setTownDistrict('');
    }
  },[visible, human]);

  // ── NIC auto-calc ──
  useEffect(()=>{
    if (isSL && nic) { setDob(nicToBirthday(nic)); setGender(nicToGender(nic)); }
  },[nic, country]);

  useEffect(()=>{
    if (!isSL) { setNic(''); setDob(''); setGender(''); }
    setProvince(''); setDistrict(''); setGnDivision('');
    setPrefecture(''); setCity(''); setTownDistrict('');
  },[country]);

  // ── Auto-parse full name → first/surnames on step advance ──
  function autoParseNames() {
    if (surnames.length===0 && firstName==='' && fullName.trim()) {
      const parts = fullName.trim().split(/\s+/);
      if (parts.length>=2) {
        setSurnames([parts[parts.length-1]]);
        setFirstName(parts[0]);
        if (parts.length>2) setOtherName(parts.slice(1,-1).join(' '));
      } else {
        setFirstName(parts[0]);
      }
    }
  }

  function validateStep(): boolean {
    if (step===1) {
      if (!country)            { Alert.alert('Required','Select a country.'); return false; }
      if (isSL && !nic.trim()) { Alert.alert('Required','Enter NIC number.'); return false; }
      if (isSL && !dob)        { Alert.alert('Invalid NIC','Check format:\nOld: 9 digits + V/X\nNew: 12 digits'); return false; }
      if (!title)              { Alert.alert('Required','Select a title.'); return false; }
      if (!fullName.trim())    { Alert.alert('Required','Enter full name.'); return false; }
    }
    if (step===2) {
      if (surnames.length===0) { Alert.alert('Required','Add at least one surname.'); return false; }
      if (!firstName.trim())   { Alert.alert('Required','Enter first name.'); return false; }
    }
    return true;
  }

  function handleNext() {
    if (!validateStep()) return;
    if (step===1) autoParseNames();
    setStep(s=>Math.min(s+1,3));
    scrollRef.current?.scrollTo({y:0,animated:false});
  }
  function handleBack() {
    setStep(s=>Math.max(s-1,1));
    scrollRef.current?.scrollTo({y:0,animated:false});
  }

  function handleSave() {
    if (!validateStep()) return;
    if (isSL) {
      if (!province)   { Alert.alert('Required','Select a province.'); return; }
      if (!district)   { Alert.alert('Required','Select a district.'); return; }
      if (!gnDivision) { Alert.alert('Required','Select a GN Division.'); return; }
    } else {
      if (!prefecture)   { Alert.alert('Required','Select a prefecture.'); return; }
      if (!city)         { Alert.alert('Required','Select a city.'); return; }
      if (!townDistrict) { Alert.alert('Required','Select a town/district.'); return; }
    }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onSave({
        country: country as Country,
        nic:         isSL ? nic.trim() : undefined,
        dateOfBirth: isSL ? dob        : undefined,
        gender:      isSL ? gender     : undefined,
        title, fullName: fullName.trim(),
        surname:   surnames.join(', '),
        firstName: firstName.trim(),
        otherName: otherName.trim()||undefined,
        ...(isSL ? { province, district, gnDivision } : { prefecture, city, townDistrict }),
      });
    }, 700);
  }

  const stepTitles = ['Identity','Names','Address'];
  const STEP_COUNT = 3;

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
      <View style={s.modalOverlay}>
        <KeyboardAvoidingView style={{flex:1}} behavior={Platform.OS==='ios'?'padding':'height'}>
          <View style={s.cardWrapper}>
            {/* Close button sits centred on the card's top border */}
            <Pressable onPress={onClose} style={({pressed})=>[s.closeBtn,pressed&&{opacity:0.6}]} hitSlop={16}>
              <View style={s.xL}/><View style={s.xR}/>
            </Pressable>

          <View style={s.container}>

          {/* ── Header ── */}
          <View style={s.header}>
            {/* Pink icon square */}
            <View style={s.headerIcon}>
              <View style={s.penBody}/><View style={s.penTip}/>
            </View>
            <View style={s.headerTitle}>
              <Text style={s.titleTxt}>{isEdit ? 'Update Human' : isView ? 'View Human' : 'Create Human'}</Text>
              <Text style={s.stepIndicator}>Step {step} of {STEP_COUNT} — {stepTitles[step-1]}</Text>
            </View>
          </View>

          {/* ── Progress bar ── */}
          <ProgressBar pct={pct} />

          {/* ── Step pills ── */}
          <View style={s.stepRow}>
            {stepTitles.map((label,idx)=>{
              const n=idx+1; const done=n<step; const active=n===step;
              return (
                <React.Fragment key={n}>
                  {idx>0 && <View style={[s.stepLine, (done||active) && s.stepLineDone]}/>}
                  <View style={s.stepCol}>
                    <View style={[s.stepCircle, done&&s.stepDone, active&&s.stepActive]}>
                      {done ? <><View style={s.ckL}/><View style={s.ckR}/></> : <Text style={[s.stepNum, active&&s.stepNumActive]}>{n}</Text>}
                    </View>
                    <Text style={[s.stepLbl, active&&s.stepLblActive, done&&s.stepLblDone]}>{label}</Text>
                  </View>
                </React.Fragment>
              );
            })}
          </View>

          {/* ── Form ── */}
          <ScrollView ref={scrollRef} contentContainerStyle={s.form} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

            {/* ════════════ STEP 1 ════════════ */}
            {step===1 && <>
              <SectionHead text="Country" />
              <Dropdown label="Country" value={country} options={['Japan','Sri Lanka']} onChange={v=>setCountry(v as Country)} disabled={isView} required />

              {isSL && <>
                <SectionHead text="Identity" />
                <Field label="NIC Number" value={nic} onChangeText={setNic} placeholder="e.g. 901234567V or 199012345678" autoCapitalize="characters" editable={!isView} required hint="Old: 9 digits + V/X  ·  New: 12 digits" />
                {dob!=='' && <Field label="Date of Birth" value={dob} editable={false} hint="Auto-calculated from NIC" />}
                {gender!=='' && <Field label="Gender" value={gender} editable={false} hint="Auto-calculated from NIC" />}
              </>}

              <SectionHead text="Personal" />
              <Dropdown label="Title" value={title} options={TITLES} onChange={setTitle} disabled={isView} required />
              <Field label="Full Name" value={fullName} onChangeText={setFullName} placeholder="Enter full name" autoCapitalize="words" editable={!isView} required />
            </>}

            {/* ════════════ STEP 2 ════════════ */}
            {step===2 && <>
              <SectionHead text="Name Details" />
              <SurnameTagInput values={surnames} onChange={setSurnames} disabled={isView} />
              <Field label="First Name" value={firstName} onChangeText={setFirstName} placeholder="First name" autoCapitalize="words" editable={!isView} required hint="Pre-filled from Full Name — edit if needed" />
              <Field label="Other Name" value={otherName} onChangeText={setOtherName} placeholder="Middle / other name (optional)" autoCapitalize="words" editable={!isView} />
            </>}

            {/* ════════════ STEP 3 ════════════ */}
            {step===3 && isSL && <>
              <SectionHead text="Sri Lanka Address" />
              <Dropdown label="Province" value={province} options={SL_PROVINCES} onChange={v=>{setProvince(v);setDistrict('');setGnDivision('');}} disabled={isView} required />
              <Dropdown label="District" value={district} options={province ? SL_DISTRICTS[province]??[] : []} onChange={v=>{setDistrict(v);setGnDivision('');}} disabled={isView||!province} placeholder={province?'Select District':'Select Province first'} required />
              <Dropdown label="GN Division" value={gnDivision} options={district ? SL_GN_DIVISIONS[district]??[] : []} onChange={setGnDivision} disabled={isView||!district} placeholder={district?'Select GN Division':'Select District first'} required />
              <SectionHead text="Street Address" />
              <Field label="House / Building No" value={houseNo} onChangeText={setHouseNo} placeholder="e.g. No 12 / 3A" editable={!isView} />
              <AddressLines lines={addrLines} onChange={setAddrLines} disabled={isView} />
            </>}

            {step===3 && !isSL && <>
              <SectionHead text="Japan Address" />
              <Dropdown label="Prefecture" value={prefecture} options={JP_PREFECTURES} onChange={v=>{setPrefecture(v);setCity('');setTownDistrict('');}} disabled={isView} required />
              <Dropdown label="City / Municipality" value={city} options={prefecture ? JP_CITIES[prefecture]??[] : []} onChange={v=>{setCity(v);setTownDistrict('');}} disabled={isView||!prefecture} placeholder={prefecture?'Select City':'Select Prefecture first'} required />
              <Dropdown label="Town / District" value={townDistrict} options={city ? JP_DISTRICTS[city]??[] : []} onChange={setTownDistrict} disabled={isView||!city} placeholder={city?'Select Town':'Select City first'} required />
              <SectionHead text="Street Address" />
              <Field label="House / Building No" value={houseNo} onChangeText={setHouseNo} placeholder="e.g. 2-3-4" editable={!isView} />
              <AddressLines lines={addrLines} onChange={setAddrLines} disabled={isView} />
            </>}

            <View style={{height:24}}/>
          </ScrollView>

          {/* ── Footer nav ── */}
          <View style={s.footer}>
            {step>1
              ? <Pressable onPress={handleBack} style={({pressed})=>[s.backBtn,pressed&&{opacity:0.7}]}>
                  <View style={s.backArrow}/><Text style={s.backTxt}>Back</Text>
                </Pressable>
              : <View style={s.backBtn}/>}

            {step<STEP_COUNT
              ? <Pressable onPress={handleNext} style={({pressed})=>[s.nextBtn,pressed&&{opacity:0.85}]}>
                  <Text style={s.nextTxt}>Next</Text><View style={s.nextArrow}/>
                </Pressable>
              : !isView
                ? <Pressable onPress={handleSave} disabled={saving} style={({pressed})=>[s.saveBtn,(pressed||saving)&&{opacity:0.85}]}>
                    {saving
                      ? <ActivityIndicator color="#FFF" size="small" />
                      : <Text style={s.saveTxt}>{isEdit ? 'Update' : 'Create Human'}</Text>}
                  </Pressable>
                : null}
          </View>

          </View>{/* container */}
          </View>{/* cardWrapper */}
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const DARK = '#1C1C1E';

const s = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    paddingTop: 100,
    paddingHorizontal: 12,
  },

  cardWrapper: {
    flex: 1,
    maxHeight: '92%',
    width: '100%',
  },

  container: {
    flex: 1,
    backgroundColor: '#F5F5F7',
    borderRadius: 10,
    width: '100%',
    overflow: 'hidden',
  },

  // Header
  header: { flexDirection:'row', alignItems:'center', backgroundColor:'#FFFFFF', paddingHorizontal:Spacing.lg, paddingTop: Spacing.sm, paddingBottom:Spacing.sm, gap:Spacing.md, borderBottomWidth:1, borderBottomColor:'#EBEBEB' },
  headerIcon: { width:38, height:38, borderRadius:8, backgroundColor:Colors.primaryHighlight, alignItems:'center', justifyContent:'center' },
  penBody: { position:'absolute', width:16, height:3, backgroundColor:'#FFF', borderRadius:1.5, transform:[{rotate:'-45deg'},{translateY:-2}] },
  penTip:  { position:'absolute', bottom:8, left:8, width:0, height:0, borderLeftWidth:4, borderRightWidth:4, borderTopWidth:6, borderLeftColor:'transparent', borderRightColor:'transparent', borderTopColor:'#FFF', transform:[{rotate:'-45deg'}] },
  headerTitle: { flex:1 },
  titleTxt: { fontFamily:FontFamily.bold, fontSize:FontSize.lg, fontWeight:FontWeight.bold, color:DARK, letterSpacing:0.2 },
  stepIndicator: { fontFamily:FontFamily.regular, fontSize:FontSize.xs, color:Colors.placeholder, marginTop:2 },
  closeBtn: {
    position: 'absolute', top: -18, right: -5, zIndex: 10,
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#1C1C1E',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25, shadowRadius: 4, elevation: 8,
  },
  xL: { position:'absolute', width:14, height:2, backgroundColor:'#FFFFFF', borderRadius:1, transform:[{rotate:'45deg'}] },
  xR: { position:'absolute', width:14, height:2, backgroundColor:'#FFFFFF', borderRadius:1, transform:[{rotate:'-45deg'}] },

  // Step pills
  stepRow: { flexDirection:'row', alignItems:'flex-start', justifyContent:'center', backgroundColor:'#FFFFFF', paddingHorizontal:Spacing.xl, paddingVertical:Spacing.sm, borderBottomWidth:1, borderBottomColor:'#EBEBEB' },
  stepCol:  { alignItems:'center', gap:4, minWidth:64 },
  stepLine: { flex:1, height:2, backgroundColor:'#E0E0E8', marginTop:13, marginHorizontal:2 },
  stepLineDone: { backgroundColor:Colors.primaryHighlight },
  stepCircle: { width:26, height:26, borderRadius:13, borderWidth:2, borderColor:'#D0D0D8', alignItems:'center', justifyContent:'center', backgroundColor:'#F5F5F7' },
  stepDone: { backgroundColor:Colors.primaryHighlight, borderColor:Colors.primaryHighlight },
  stepActive: { borderColor:Colors.primaryHighlight, backgroundColor:'#FFF' },
  stepNum: { fontFamily:FontFamily.bold, fontSize:10, fontWeight:FontWeight.bold, color:'#B0B0B8' },
  stepNumActive: { color:Colors.primaryHighlight },
  stepLbl: { fontFamily:FontFamily.regular, fontSize:9, color:'#B0B0B8', textAlign:'center' },
  stepLblActive: { color:Colors.primaryHighlight, fontFamily:FontFamily.bold, fontWeight:FontWeight.bold },
  stepLblDone: { color:'#888' },
  ckL: { position:'absolute', left:1, bottom:3, width:5, height:2, backgroundColor:'#FFF', borderRadius:1, transform:[{rotate:'45deg'}] },
  ckR: { position:'absolute', right:1, bottom:4, width:8, height:2, backgroundColor:'#FFF', borderRadius:1, transform:[{rotate:'-50deg'}] },

  form: { paddingHorizontal:Spacing.lg, paddingTop:Spacing.sm },

  // Footer
  footer: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:Spacing.lg, paddingVertical:Spacing.sm, backgroundColor:'#FFFFFF', borderTopWidth:1, borderTopColor:'#E5E5EA', gap:Spacing.sm },
  backBtn: { flexDirection:'row', alignItems:'center', gap:6, paddingVertical:12, paddingHorizontal:Spacing.md, borderRadius:8, borderWidth:1.5, borderColor:'#D0D0D8', backgroundColor:'#FFF', minWidth:80, justifyContent:'center' },
  backTxt: { fontFamily:FontFamily.medium, fontSize:FontSize.sm, color:Colors.primaryText },
  backArrow: { width:7, height:7, borderTopWidth:2, borderLeftWidth:2, borderColor:Colors.primaryText, transform:[{rotate:'-45deg'},{translateX:2}] },
  nextBtn: { flex:1, flexDirection:'row', alignItems:'center', justifyContent:'center', gap:6, backgroundColor:DARK, borderRadius:10, paddingVertical:14 },
  nextTxt: { fontFamily:FontFamily.bold, fontSize:FontSize.md, fontWeight:FontWeight.bold, color:'#FFF' },
  nextArrow: { width:7, height:7, borderTopWidth:2, borderRightWidth:2, borderColor:'#FFF', transform:[{rotate:'45deg'},{translateX:-2}] },
  saveBtn: { flex:1, alignItems:'center', justifyContent:'center', backgroundColor:DARK, borderRadius:10, paddingVertical:14 },
  saveTxt: { fontFamily:FontFamily.bold, fontSize:FontSize.md, fontWeight:FontWeight.bold, color:'#FFF', letterSpacing:0.5 },
});

const pb = StyleSheet.create({
  wrap: { backgroundColor:'#FFFFFF', paddingHorizontal:Spacing.lg, paddingTop:8, paddingBottom:10, borderBottomWidth:1, borderBottomColor:'#EBEBEB' },
  track: { height:6, backgroundColor:'#EEE', borderRadius:3, overflow:'visible', position:'relative' },
  fill: { height:6, backgroundColor:'#30A84B', borderRadius:3 },
  marker: { position:'absolute', top:-3, width:2, height:12, backgroundColor:'#595959', borderRadius:1 },
  labels: { flexDirection:'row', justifyContent:'space-between', marginTop:5 },
  labelLeft: { fontFamily:FontFamily.regular, fontSize:9, color:Colors.placeholder },
  labelMid:  { fontFamily:FontFamily.regular, fontSize:9, color:Colors.placeholder },
  labelRight:{ fontFamily:FontFamily.regular, fontSize:9, color:Colors.placeholder },
  labelAvg:  { color:'#30A84B', fontFamily:FontFamily.bold, fontWeight:FontWeight.bold },
});

const sec = StyleSheet.create({
  row: { flexDirection:'row', alignItems:'center', gap:8, marginTop:Spacing.md, marginBottom:Spacing.sm },
  bar: { width:3, height:13, borderRadius:2, backgroundColor:Colors.primaryHighlight },
  txt: { fontFamily:FontFamily.bold, fontSize:FontSize.xs, fontWeight:FontWeight.bold, color:Colors.placeholder, textTransform:'uppercase', letterSpacing:0.8 },
  line: { flex:1, height:1, backgroundColor:'#E8E8EE' },
});

const fi = StyleSheet.create({
  wrapper: { marginBottom:Spacing.sm },
  label: { fontFamily:FontFamily.medium, fontSize:FontSize.xs, color:Colors.placeholder, marginBottom:5 },
  labelFoc: { color:Colors.primaryText },
  req: { color:Colors.primaryHighlight },
  input: { fontFamily:FontFamily.regular, fontSize:FontSize.md, color:Colors.primaryText, paddingVertical:8, borderBottomWidth:1.5, borderBottomColor:'#D0D0D0', paddingHorizontal:0 },
  inputFoc: { borderBottomColor:Colors.primaryText },
  inputRO: { color:Colors.placeholder, borderBottomColor:'#EAEAEA' },
  hint: { fontFamily:FontFamily.regular, fontSize:9, color:Colors.placeholder, marginTop:3 },
});

const dd = StyleSheet.create({
  wrapper: { marginBottom:Spacing.lg, zIndex:10 },
  label: { fontFamily:FontFamily.medium, fontSize:FontSize.xs, color:Colors.placeholder, marginBottom:5 },
  req: { color:Colors.primaryHighlight },
  trigger: { flexDirection:'row', alignItems:'center', paddingVertical:8, borderBottomWidth:1.5, borderBottomColor:'#D0D0D0' },
  open: { borderBottomColor:Colors.primaryText },
  disabled: { opacity:0.55 },
  value: { flex:1, fontFamily:FontFamily.regular, fontSize:FontSize.md, color:Colors.primaryText },
  placeholder: { color:Colors.placeholder },
  chevWrap: { width:18, height:10, alignItems:'center', justifyContent:'center' },
  chevUp: { transform:[{rotate:'180deg'}] },
  cL: { position:'absolute', left:0, width:9, height:2, backgroundColor:Colors.placeholder, borderRadius:1, transform:[{rotate:'35deg'},{translateY:-1}] },
  cR: { position:'absolute', right:0, width:9, height:2, backgroundColor:Colors.placeholder, borderRadius:1, transform:[{rotate:'-35deg'},{translateY:-1}] },
  list: { backgroundColor:'#FFF', borderRadius:12, marginTop:4, borderWidth:1, borderColor:'#E5E5EA', overflow:'hidden', shadowColor:'#000', shadowOffset:{width:0,height:4}, shadowOpacity:0.08, shadowRadius:12, elevation:6 },
  opt: { flexDirection:'row', alignItems:'center', paddingHorizontal:Spacing.lg, paddingVertical:13, borderBottomWidth:1, borderBottomColor:'#F5F5F5' },
  optActive: { backgroundColor:'rgba(233,30,99,0.04)' },
  optTxt: { flex:1, fontFamily:FontFamily.regular, fontSize:FontSize.md, color:Colors.primaryText },
  optTxtActive: { fontFamily:FontFamily.bold, fontWeight:FontWeight.bold, color:Colors.primaryHighlight },
  chk: { width:16, height:16, alignItems:'center', justifyContent:'center' },
  chkL: { position:'absolute', left:0, bottom:3, width:5, height:2, backgroundColor:Colors.primaryHighlight, borderRadius:1, transform:[{rotate:'45deg'}] },
  chkR: { position:'absolute', right:0, bottom:4, width:9, height:2, backgroundColor:Colors.primaryHighlight, borderRadius:1, transform:[{rotate:'-50deg'}] },
});

const tag = StyleSheet.create({
  wrapper: { marginBottom:Spacing.sm },
  label: { fontFamily:FontFamily.medium, fontSize:FontSize.xs, color:Colors.placeholder, marginBottom:5 },
  labelFoc: { color:Colors.primaryText },
  req: { color:Colors.primaryHighlight },
  box: { flexDirection:'row', flexWrap:'wrap', gap:6, paddingVertical:6, borderBottomWidth:1.5, borderBottomColor:'#D0D0D0', alignItems:'center', minHeight:40 },
  boxFoc: { borderBottomColor:Colors.primaryText },
  chip: { flexDirection:'row', alignItems:'center', backgroundColor:'rgba(233,30,99,0.08)', borderRadius:6, borderWidth:1, borderColor:'rgba(233,30,99,0.25)', paddingHorizontal:8, paddingVertical:4, gap:5 },
  chipTxt: { fontFamily:FontFamily.medium, fontSize:FontSize.sm, color:Colors.primaryHighlight, fontWeight:FontWeight.medium },
  chipX: { width:14, height:14, alignItems:'center', justifyContent:'center' },
  xL: { position:'absolute', width:9, height:1.5, backgroundColor:Colors.primaryHighlight, borderRadius:1, transform:[{rotate:'45deg'}] },
  xR: { position:'absolute', width:9, height:1.5, backgroundColor:Colors.primaryHighlight, borderRadius:1, transform:[{rotate:'-45deg'}] },
  input: { fontFamily:FontFamily.regular, fontSize:FontSize.md, color:Colors.primaryText, minWidth:80, paddingVertical:2 },
});

const addr = StyleSheet.create({
  row: { flexDirection:'row', alignItems:'flex-end', gap:Spacing.sm },
  removeBtn: { width:28, height:28, borderRadius:14, backgroundColor:'rgba(211,47,47,0.1)', alignItems:'center', justifyContent:'center', marginBottom:Spacing.lg },
  removeLine1: { position:'absolute', width:12, height:2, backgroundColor:'#D32F2F', borderRadius:1 },
  removeLine2: { position:'absolute', width:12, height:2, backgroundColor:'#D32F2F', borderRadius:1, transform:[{rotate:'90deg'}] },
  addBtn: { flexDirection:'row', alignItems:'center', gap:6, marginBottom:Spacing.lg },
  addIcon: { width:18, height:18, borderRadius:9, backgroundColor:'rgba(48,168,75,0.12)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'#30A84B' },
  addH: { position:'absolute', width:8, height:1.5, backgroundColor:'#30A84B', borderRadius:1 },
  addV: { position:'absolute', width:1.5, height:8, backgroundColor:'#30A84B', borderRadius:1 },
  addTxt: { fontFamily:FontFamily.medium, fontSize:FontSize.sm, color:'#30A84B', fontWeight:FontWeight.medium },
});
