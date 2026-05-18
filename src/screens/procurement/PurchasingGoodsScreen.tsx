import React, { useState, useMemo } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GPIT_BTN from '../../../assets/images/GPIT Create Module Button.png';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { PageTabBar } from '../../components/common/PageTabBar';
import type { PageTabItem } from '../../components/common/PageTabBar';
import { TableIcons } from '../../components/common/DataTable';
import { UIIcon } from '../../components/common/UIIcon';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

// ── Types ─────────────────────────────────────────────────────────────────────

type GoodsTab  = 'items' | 'grn' | 'reports';
type ItemFilter = 'All' | 'Spare Parts' | 'Electronics' | 'Consumables';
type ItemMode   = 'create' | 'view' | 'edit';
type SerialType = 'auto' | 'manufacture' | 'none';

interface GoodItem {
  id:            string;
  code:          string;
  description:   string;
  compatibility: string;
  category:      string;
  subCategory:   string;
  brand:         string;
  itemName:      string;
  groupName:     string;
  stockQty:      number;
  costPrice:     string;
  sellPrice:     string;
  serialType:    SerialType;
  status:        'Active' | 'Inactive';
}

interface SearchableItem {
  code:          string;
  description:   string;
  compatibility: string;
}

interface CreateItemForm {
  category:    string;
  subCategory: string;
  brand:       string;
  itemName:    string;
  groupName:   string;
  packLength:  string;
  packBreadth: string;
  packHeight:  string;
  variantType: string;
  variantAttr: string;
  itemGeneric: string;
  serialType:  SerialType;
  sameAsDesc:  boolean;
  salesName:   string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

let nextId = 10;
const genId = () => String(nextId++);

const INITIAL_GOODS: GoodItem[] = [
  { id: '1', code: 'SP01-HL01-0000', description: 'Spare Parts Head Light HINO SCOOP (L-h-s)',          compatibility: 'DUTRO – KK BU306M – 1999/05 to 2004-06',             category: 'Spare Parts',  subCategory: 'Head Light',  brand: 'HINO',       itemName: 'Head Light HINO SCOOP',        groupName: 'Lighting',    stockQty: 15, costPrice: '1,250.00', sellPrice: '1,450.00', serialType: 'auto',         status: 'Active'   },
  { id: '2', code: 'SP01-D01-0002',  description: 'Spare Parts Dashboard HINO PROFIA (Black)',           compatibility: 'TRUCK FN – KL FN2P – 2002/11 to present',             category: 'Spare Parts',  subCategory: 'Dashboard',   brand: 'HINO',       itemName: 'Dashboard HINO PROFIA',        groupName: 'Interior',    stockQty: 2,  costPrice: '2,935.74', sellPrice: '3,522.89', serialType: 'manufacture',  status: 'Active'   },
  { id: '3', code: 'SP01-D01-0003',  description: 'Spare Parts Dashboard MITSUBISHI CANER WIDE (Black)', compatibility: 'TRUCK FU – U FU415 – 1993/06 to 1995-05',             category: 'Spare Parts',  subCategory: 'Dashboard',   brand: 'MITSUBISHI', itemName: 'Dashboard CANER WIDE',         groupName: 'Interior',    stockQty: 0,  costPrice: '1,100.00', sellPrice: '1,300.00', serialType: 'auto',         status: 'Inactive' },
  { id: '4', code: 'SP01-D01-0004',  description: 'Spare Parts Dashboard HINO RANGER (Black)',           compatibility: 'FC RANGER – KK FC1JCDD – 2001/06 to present',         category: 'Spare Parts',  subCategory: 'Dashboard',   brand: 'HINO',       itemName: 'Dashboard HINO RANGER',        groupName: 'Interior',    stockQty: 0,  costPrice: '',         sellPrice: '',         serialType: 'none',         status: 'Inactive' },
  { id: '5', code: 'SP01-D01-0005',  description: 'Spare Parts Dashboard ISUZU I061 (Black)',            compatibility: 'ELF 250 – U NKR61 – 1984/06 to 1993-06',             category: 'Spare Parts',  subCategory: 'Dashboard',   brand: 'ISUZU',      itemName: 'Dashboard ISUZU I061',         groupName: 'Interior',    stockQty: 0,  costPrice: '1,050.00', sellPrice: '1,250.00', serialType: 'auto',         status: 'Inactive' },
  { id: '6', code: 'SP01-HL01-0006', description: 'Spare Parts Vehicle Fog Light Kit',                   compatibility: 'Universal fitment, multi-vehicle compatible',         category: 'Spare Parts',  subCategory: 'Head Light',  brand: 'Universal',  itemName: 'Fog Light Kit',                groupName: 'Lighting',    stockQty: 15, costPrice: '1,180.00', sellPrice: '1,380.00', serialType: 'manufacture',  status: 'Active'   },
];

const SEARCH_ITEMS: SearchableItem[] = INITIAL_GOODS.map(g => ({
  code:          g.code,
  description:   g.description,
  compatibility: g.compatibility,
}));

const EMPTY_FORM: CreateItemForm = {
  category: '', subCategory: '', brand: '', itemName: '', groupName: '',
  packLength: '', packBreadth: '', packHeight: '',
  variantType: '', variantAttr: '', itemGeneric: '',
  serialType: 'auto', sameAsDesc: true, salesName: '',
};

const GOODS_TABS: PageTabItem[] = [
  { key: 'items',   label: 'Items',   color: '#595959' },
  { key: 'grn',     label: 'GRN',     color: '#595959' },
  { key: 'reports', label: 'Reports', color: '#595959' },
];

const ITEM_FILTERS: ItemFilter[] = ['All', 'Spare Parts', 'Electronics', 'Consumables'];
const ICON_COLORS = ['#595959', '#6B6B6B', '#7D7D7D', '#8E8E8E', '#A0A0A0', '#606060'];

const HEALTH_FIELDS: (keyof GoodItem)[] = [
  'code', 'description', 'category', 'subCategory', 'brand',
  'itemName', 'costPrice', 'sellPrice',
];

function calcHealth(item: GoodItem): number {
  const filled = HEALTH_FIELDS.filter(f => !!item[f]).length;
  return Math.round((filled / HEALTH_FIELDS.length) * 100);
}
function healthRing(pct: number)  { return pct < 25 ? '#E53935' : pct < 50 ? '#FB8C00' : pct < 75 ? '#FDD835' : '#30A84B'; }
function healthBg(pct: number)    { return pct < 25 ? 'rgba(229,57,53,0.12)' : pct < 50 ? 'rgba(251,140,0,0.12)' : pct < 75 ? 'rgba(253,216,53,0.15)' : 'rgba(48,168,75,0.12)'; }
function healthColor(pct: number) { return pct < 25 ? '#B71C1C' : pct < 50 ? '#E65100' : pct < 75 ? '#F57F17' : '#2E7D32'; }

// ── Styles (before components) ────────────────────────────────────────────────

const ic = StyleSheet.create({
  chip:      { flex: 1, gap: 4 },
  chipLabel: { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, color: '#9090A0' },
  chipValue: { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600' },
});

const gc = StyleSheet.create({
  list:     { paddingHorizontal: Spacing.md, paddingTop: 8, paddingBottom: 100, gap: 10 },
  card:     { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: '#EAEAF0', shadowColor: '#8888AA', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3, overflow: 'hidden' },
  cardDark: { backgroundColor: '#1C1C1E', borderColor: '#2A2A2C' },
  accent:   { width: 4 },
  inner:    { flex: 1 },
  header:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10, gap: 12 },
  iconWrap: { alignItems: 'center', gap: 4, flexShrink: 0 },
  iconRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  iconInner:{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pctBadge: { flexDirection: 'row', alignItems: 'center', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2 },
  pctTxt:   { fontFamily: FontFamily.bold, fontSize: 7, fontWeight: '700' },
  pctLabel: { fontStyle: 'italic', fontWeight: '400' },
  nameBlock:{ flex: 1, gap: 4 },
  code:     { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#60607A' },
  name:     { fontFamily: FontFamily.bold, fontSize: 14, fontWeight: '700', lineHeight: 19 },
  badge:    { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, backgroundColor: 'rgba(233,30,99,0.10)' },
  badgeTxt: { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: Colors.primaryHighlight },
  idx:      { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500', alignSelf: 'flex-start', marginTop: 2 },
  divider:  { height: 1 },
  chips:    { flexDirection: 'row', paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center' },
  chipSep:  { width: 1, height: 34, marginHorizontal: 10 },
  actions:  { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, paddingHorizontal: 10, paddingVertical: 8, gap: 6 },
  btn:      { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  btnView:  { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnEdit:  { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnDel:   { backgroundColor: 'rgba(233,30,99,0.08)' },
  btnPrs:   { opacity: 0.7, transform: [{ scale: 0.97 }] },
  btnTxt:   { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#595959' },
  btnDelTxt:{ fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#E91E63' },
  emptyWrap:{ alignItems: 'center', paddingVertical: 50, paddingHorizontal: Spacing.xl, gap: 8 },
  emptyIcon:{ width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTtl: { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', textAlign: 'center' },
  emptySub: { fontFamily: FontFamily.regular, fontSize: 12, textAlign: 'center', lineHeight: 18 },
  clearBtn: { marginTop: 8, paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: Colors.primaryHighlight },
  clearTxt: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: '700', color: Colors.primaryHighlight },
});

const lv = StyleSheet.create({
  scroll:         { paddingBottom: 100 },
  sectionHeader:  { paddingHorizontal: Spacing.md, paddingTop: 0, paddingBottom: 2 },
  sectionTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700' },
  searchWrap:     { paddingHorizontal: Spacing.md, paddingVertical: 6, gap: 6 },
  searchRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  searchBar:      { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, height: 40, borderRadius: 10, borderWidth: 1, borderColor: '#E5E5E5', backgroundColor: '#FFF' },
  searchInput:    { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, paddingVertical: 0 },
  clearX:         { width: 18, height: 18, borderRadius: 9, backgroundColor: '#E0E0E8', alignItems: 'center', justifyContent: 'center' },
  clearX1:        { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }], backgroundColor: '#888' },
  clearX2:        { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }], backgroundColor: '#888' },
  addBtn:         { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E91E63', alignItems: 'center', justifyContent: 'center' },
  addBtnPrs:      { opacity: 0.8, transform: [{ scale: 0.95 }] },
  addBtnH:        { position: 'absolute', width: 14, height: 2, borderRadius: 1, backgroundColor: '#FFF' },
  addBtnV:        { position: 'absolute', width: 2, height: 14, borderRadius: 1, backgroundColor: '#FFF' },
  pillRow:        { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  pill:           { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, backgroundColor: '#F8F8F8', borderWidth: 1, borderColor: '#E0E0E0' },
  pillActive:     { backgroundColor: '#E91E63', borderColor: 'transparent' },
  pillTxt:        { fontFamily: FontFamily.regular, fontSize: 11, fontWeight: '500', color: '#5A5A62' },
  pillTxtActive:  { color: '#FFF', fontFamily: FontFamily.bold, fontWeight: '600' },
  pillBadge:      { backgroundColor: '#D0D0D0', borderRadius: 8, paddingHorizontal: 5, minWidth: 16, alignItems: 'center' },
  pillBadgeActive:{ backgroundColor: 'rgba(255,255,255,0.25)' },
  pillBadgeTxt:   { fontFamily: FontFamily.regular, fontSize: 9, fontWeight: '600', color: '#666' },
  pillBadgeTxtA:  { color: '#FFF', fontWeight: '700' },
});

const ci = StyleSheet.create({
  overlay:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  kav:              { flex: 1, justifyContent: 'flex-end' },
  sheet:            { backgroundColor: '#FFF', borderTopLeftRadius: 18, borderTopRightRadius: 18, height: '92%', overflow: 'hidden' },
  header:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  headerLeft:       { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  headerIconBox:    { width: 30, height: 30, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  headerTitle:      { fontFamily: FontFamily.bold, fontSize: 15, fontWeight: '700', color: '#1C1C1E' },
  headerRight:      { flexDirection: 'row', alignItems: 'center', gap: 7 },
  outlineBtn:       { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6, borderWidth: 1, borderColor: '#007AFF' },
  outlineBtnTxt:    { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#007AFF' },
  fillBtn:          { flexDirection: 'row', alignItems: 'center', gap: 3, paddingVertical: 5, paddingHorizontal: 9, borderRadius: 6, backgroundColor: '#007AFF' },
  fillBtnTxt:       { fontFamily: FontFamily.medium, fontSize: 10, fontWeight: '600', color: '#FFF' },
  searchSection:    { paddingHorizontal: 14, paddingTop: 14, paddingBottom: 10 },
  fieldLbl:         { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#1C1C1E', marginBottom: 7 },
  searchBox:        { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 7, paddingHorizontal: 11, backgroundColor: '#FFF' },
  searchInput:      { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, color: '#1C1C1E', paddingVertical: 10 },
  resultList:       { flex: 1 },
  resultRow:        { paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#FAFAFA' },
  resultRowBorder:  { borderBottomWidth: 1, borderBottomColor: '#EDEDF0' },
  resultRowPressed: { backgroundColor: '#F0F0F5' },
  resultTitle:      { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1C1C1E', marginBottom: 3 },
  resultSub:        { fontFamily: FontFamily.regular, fontSize: 10, color: '#9090A0', lineHeight: 15 },
  noResultsRow:     { flexDirection: 'row', alignItems: 'center', margin: 14, padding: 14, backgroundColor: '#F5F5F7', borderRadius: 10, gap: 12 },
  noResultsTxt:     { fontFamily: FontFamily.regular, fontSize: 12, color: '#3C3C50', flex: 1, lineHeight: 18 },
  noResultsLink:    { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#007AFF' },
  emptySearch:      { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 32 },
  emptySearchTxt:   { fontFamily: FontFamily.medium, fontSize: 13, fontWeight: '600', color: '#6C6C80', textAlign: 'center' },
  emptySearchSub:   { fontFamily: FontFamily.regular, fontSize: 11, color: '#A0A0B0', textAlign: 'center', lineHeight: 17 },
  gpitBtn:          { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  gpitImg:          { width: 28, height: 28 },
  helpBtn:          { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#C0C0C8', alignItems: 'center', justifyContent: 'center' },
  helpTxt:          { fontFamily: FontFamily.bold, fontSize: 10, fontWeight: '700', color: '#A0A0A8' },
  backBtn:          { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  backBtnTxt:       { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: Colors.primaryHighlight },
  progressWrap:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0F0F5' },
  progressBg:       { flex: 1, height: 5, backgroundColor: '#E0E0E8', borderRadius: 3 },
  progressFill:     { height: 5, backgroundColor: '#E53935', borderRadius: 3 },
  progressFillAvg:  { height: 5, backgroundColor: '#30A84B', borderRadius: 3 },
  progressLbl:      { fontFamily: FontFamily.regular, fontSize: 9, color: '#E53935' },
  progressAvg:      { fontFamily: FontFamily.medium, fontSize: 9, fontWeight: '600', color: '#30A84B' },
  formScroll:       { flex: 1 },
  formGroup:        { paddingHorizontal: 14, marginBottom: 10 },
  formLbl:          { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#3C3C50', marginBottom: 5 },
  textInput:        { borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 9, fontFamily: FontFamily.regular, fontSize: 13, color: '#1C1C1E' },
  selectBox:        { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 7, paddingHorizontal: 12, paddingVertical: 10, marginHorizontal: 14, backgroundColor: '#FAFAFA' },
  selectPlaceholder:{ flex: 1, fontFamily: FontFamily.regular, fontSize: 13, color: '#BBBBC0' },
  selectVal:        { flex: 1, fontFamily: FontFamily.regular, fontSize: 13, color: '#1C1C1E' },
  sectionLbl:       { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#3C3C50', paddingHorizontal: 14, marginBottom: 6, marginTop: 4 },
  packRow:          { flexDirection: 'row', paddingHorizontal: 14, marginBottom: 10 },
  packField:        { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#DCDCE0', borderRadius: 7, paddingHorizontal: 8, backgroundColor: '#FAFAFA' },
  packInput:        { flex: 1, fontFamily: FontFamily.regular, fontSize: 12, color: '#1C1C1E', paddingVertical: 8 },
  packUnit:         { fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0' },
  sectionCard:      { marginHorizontal: 14, marginBottom: 10, borderWidth: 1, borderColor: '#EDEDF2', borderRadius: 9, padding: 12 },
  sectionTitle:     { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: '700', color: '#1C1C1E', marginBottom: 10 },
  radioRow:         { flexDirection: 'row', gap: 14, flexWrap: 'wrap' },
  radioOpt:         { flexDirection: 'row', alignItems: 'center', gap: 6 },
  radioDot:         { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#DCDCE0' },
  radioDotActive:   { borderColor: Colors.primaryHighlight, backgroundColor: Colors.primaryHighlight },
  radioLbl:         { fontFamily: FontFamily.regular, fontSize: 12, color: '#3C3C50' },
  addMoreBtn:       { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 10, borderWidth: 1, borderColor: '#30A84B', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, alignSelf: 'flex-start' },
  addMoreTxt:       { fontFamily: FontFamily.medium, fontSize: 11, fontWeight: '600', color: '#30A84B' },
  imgScroll:        { paddingHorizontal: 14, marginBottom: 10 },
  imgScrollContent: { gap: 8, paddingVertical: 4 },
  imgPlaceholder:   { width: 75, height: 75, borderRadius: 8, borderWidth: 1, borderColor: '#DCDCE0', backgroundColor: '#F5F5F7', alignItems: 'center', justifyContent: 'center' },
  salesQ:           { fontFamily: FontFamily.regular, fontSize: 11, color: '#E53935', marginBottom: 8 },
  salesRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  salesRowLbl:      { fontFamily: FontFamily.regular, fontSize: 11, color: '#9090A0', width: 110 },
  salesRowVal:      { fontFamily: FontFamily.medium, fontSize: 12, fontWeight: '600', color: '#3C3C50', flex: 1 },
  salesInput:       { flex: 1, borderBottomWidth: 1, borderBottomColor: '#DCDCE0', fontFamily: FontFamily.regular, fontSize: 12, color: '#1C1C1E', paddingVertical: 4 },
  formFooter:       { flexDirection: 'row', gap: 10, padding: 14, borderTopWidth: 1, borderTopColor: '#F0F0F5' },
  nextBtn:          { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 8, backgroundColor: '#595959' },
  saveBtn:          { flex: 1, alignItems: 'center', paddingVertical: 13, borderRadius: 8, backgroundColor: Colors.primaryHighlight },
  footerBtnTxt:     { fontFamily: FontFamily.bold, fontSize: 13, fontWeight: '700', color: '#FFF' },
});

const dc = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 44 },
  card:       { width: '100%', backgroundColor: '#FFF', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 10 },
  topAccent:  { height: 3, backgroundColor: '#E53935' },
  closeBtn:   { position: 'absolute', top: 8, right: 8, zIndex: 10, width: 22, height: 22, borderRadius: 11, backgroundColor: '#F0F0F4', alignItems: 'center', justifyContent: 'center' },
  iconRing:   { marginTop: 14, marginBottom: 8, alignItems: 'center' },
  iconCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#E53935', alignItems: 'center', justifyContent: 'center' },
  title:      { textAlign: 'center', fontFamily: FontFamily.bold, fontSize: 14, fontWeight: FontWeight.bold, color: '#1C1C1E', marginBottom: 4 },
  desc:       { textAlign: 'center', fontFamily: FontFamily.regular, fontSize: 11, color: '#999', lineHeight: 16, paddingHorizontal: 12, marginBottom: 12 },
  divider:    { height: 1, backgroundColor: '#F0F0F4' },
  btnRow:     { flexDirection: 'row', paddingHorizontal: 12, paddingVertical: 10, gap: 8 },
  cancelBtn:  { flex: 1, paddingVertical: 8, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', alignItems: 'center', justifyContent: 'center' },
  cancelTxt:  { fontFamily: FontFamily.medium, fontSize: 12, color: '#666' },
  confirmBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, paddingVertical: 8, borderRadius: 8, backgroundColor: '#E53935' },
  confirmTxt: { fontFamily: FontFamily.bold, fontSize: 12, fontWeight: FontWeight.bold, color: '#FFF' },
});

// ── Create-Item modal wrapper — mirrors EmployeeFormModal structure ────────────

const cm = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-start', paddingTop: 60, paddingBottom: 20, paddingHorizontal: 12 },
  cardWrapper:  { flex: 1, maxHeight: '95%', width: '100%' },
  container:    { flex: 1, backgroundColor: '#F5F5F7', borderRadius: 10, overflow: 'hidden' },
  closeBtn:     { position: 'absolute', top: -18, right: -5, zIndex: 10, width: 36, height: 36, borderRadius: 18, backgroundColor: '#1C1C1E', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 6 },
  xL:           { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR:           { position: 'absolute', width: 14, height: 2, backgroundColor: '#FFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  resetBtn:     { position: 'absolute', top: 24, right: 6, zIndex: 10, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#1976D2', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 3, elevation: 4 },
  resetTxt:     { fontFamily: FontFamily.medium, fontSize: 11, color: '#FFF' },
  header:       { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: Spacing.md, gap: Spacing.md, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  headerIcon:   { width: 38, height: 38, borderRadius: 8, backgroundColor: Colors.primaryHighlight, alignItems: 'center', justifyContent: 'center' },
  headerTitle:  { flex: 1 },
  titleTxt:     { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#595959', letterSpacing: 0.2 },
  subTxt:       { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder, marginTop: 2 },
  progressWrap: { backgroundColor: '#FFF', paddingHorizontal: Spacing.lg, paddingTop: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#EBEBEB' },
  progressRow:  { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressBg:   { flex: 1, height: 6, backgroundColor: '#EEE', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: '#E53935' },
  progressAvg:  { height: 6, borderRadius: 3, backgroundColor: '#30A84B' },
  progressLbl:  { fontFamily: FontFamily.regular, fontSize: 9, color: '#E53935' },
  progressBadge:{ fontFamily: FontFamily.bold, fontSize: 9, fontWeight: '700', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4, color: '#30A84B', backgroundColor: 'rgba(48,168,75,0.1)' },
  footer:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E5E5EA', gap: Spacing.sm },
  backBtn:      { paddingVertical: 13, paddingHorizontal: Spacing.md, borderRadius: 8, borderWidth: 1.5, borderColor: '#D0D0D8', backgroundColor: '#FFF', minWidth: 80, alignItems: 'center' },
  backBtnTxt:   { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.primaryText },
  saveBtn:      { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#595959', borderRadius: 10, paddingVertical: 14 },
  saveTxt:      { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: '#FFF', letterSpacing: 0.5 },
});

// ── Info chip ─────────────────────────────────────────────────────────────────

function ItemInfoChip({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={ic.chip}>
      <Text style={ic.chipLabel}>{label}</Text>
      <Text style={[ic.chipValue, { color: colors.primaryText }]} numberOfLines={1}>{value || '—'}</Text>
    </View>
  );
}

// ── Item card ─────────────────────────────────────────────────────────────────

function ItemCard({
  item, index, onView, onEdit, onDelete,
}: {
  item: GoodItem; index: number;
  onView: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const pct       = calcHealth(item);
  const ringColor = healthRing(pct);
  const iconBg    = ICON_COLORS[index % ICON_COLORS.length];

  return (
    <View style={[gc.card, isDarkMode && gc.cardDark]}>
      <View style={[gc.accent, { backgroundColor: Colors.primaryHighlight }]} />
      <View style={gc.inner}>
        {/* Header */}
        <View style={gc.header}>
          <View style={gc.iconWrap}>
            <View style={[gc.iconRing, { borderColor: ringColor }]}>
              <View style={[gc.iconInner, { backgroundColor: iconBg }]}>
                <MaterialCommunityIcons name="package-variant-closed" size={20} color="#FFF" />
              </View>
            </View>
            <View style={[gc.pctBadge, { backgroundColor: healthBg(pct) }]}>
              <Text style={[gc.pctTxt, gc.pctLabel, { color: healthColor(pct) }]}>Fill </Text>
              <Text style={[gc.pctTxt, { color: healthColor(pct) }]}>{pct}%</Text>
            </View>
          </View>
          <View style={gc.nameBlock}>
            <Text style={gc.code}>{item.code}</Text>
            <Text style={[gc.name, { color: colors.primaryText }]} numberOfLines={2}>
              {item.description}
            </Text>
            <View style={gc.badge}>
              <Text style={gc.badgeTxt}>{item.status}</Text>
            </View>
          </View>
          <Text style={[gc.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        <View style={[gc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* Chips */}
        <View style={gc.chips}>
          <ItemInfoChip label="Category"  value={item.category} />
          <View style={[gc.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <ItemInfoChip label="Sub Cat."  value={item.subCategory} />
          <View style={[gc.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <ItemInfoChip label="Brand"     value={item.brand} />
        </View>

        {/* Actions */}
        <View style={[gc.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable onPress={onView}   style={({ pressed }) => [gc.btn, gc.btnView, pressed && gc.btnPrs]} hitSlop={4}>
            <TableIcons.Eye />
            <Text style={gc.btnTxt}>View</Text>
          </Pressable>
          <Pressable onPress={onEdit}   style={({ pressed }) => [gc.btn, gc.btnEdit, pressed && gc.btnPrs]} hitSlop={4}>
            <TableIcons.Edit />
            <Text style={gc.btnTxt}>Edit</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onDelete} style={({ pressed }) => [gc.btn, gc.btnDel, pressed && gc.btnPrs]} hitSlop={4}>
            <TableIcons.Trash />
            <Text style={gc.btnDelTxt}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ── Item form modal helpers ───────────────────────────────────────────────────

function CiFieldInput({ label, value, onChangeText, editable = true }: {
  label: string; value: string; onChangeText?: (v: string) => void; editable?: boolean;
}) {
  return (
    <View style={ci.formGroup}>
      <Text style={ci.formLbl}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} editable={editable}
        style={[ci.textInput, !editable && { backgroundColor: '#F5F5F7', color: '#9090A0' }]}
        placeholderTextColor="#BBBBC0" />
    </View>
  );
}

function CiFieldSelect({ label, value, placeholder, showGpit = false }: {
  label: string; value: string; placeholder: string; showGpit?: boolean;
}) {
  return (
    <View style={ci.formGroup}>
      <Text style={ci.formLbl}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={[ci.selectBox, { flex: 1, marginHorizontal: 0 }]}>
          <Text style={value ? ci.selectVal : ci.selectPlaceholder} numberOfLines={1}>
            {value || placeholder}
          </Text>
          <MaterialCommunityIcons name="chevron-down" size={15} color="#9090A0" />
        </View>
        {showGpit && (
          <Pressable style={ci.gpitBtn} hitSlop={6}>
            <Image source={GPIT_BTN} style={ci.gpitImg} resizeMode="contain" />
          </Pressable>
        )}
        {showGpit && (
          <View style={ci.helpBtn}>
            <Text style={ci.helpTxt}>?</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ── Item view/edit modal ──────────────────────────────────────────────────────

function ItemFormModal({ visible, mode, item, onClose, onSave }: {
  visible: boolean;
  mode: ItemMode;
  item: GoodItem | null;
  onClose: () => void;
  onSave: (data: Omit<GoodItem, 'id'>) => void;
}) {
  const isView = mode === 'view';
  const [form, setForm] = useState<Omit<GoodItem, 'id'>>({
    code: '', description: '', compatibility: '', category: '', subCategory: '',
    brand: '', itemName: '', groupName: '', stockQty: 0, costPrice: '',
    sellPrice: '', serialType: 'auto', status: 'Active',
  });

  React.useEffect(() => {
    if (item) {
      const { id: _id, ...rest } = item;
      setForm(rest);
    } else {
      setForm({ code: '', description: '', compatibility: '', category: '', subCategory: '', brand: '', itemName: '', groupName: '', stockQty: 0, costPrice: '', sellPrice: '', serialType: 'auto', status: 'Active' });
    }
  }, [item, visible]);

  function field<K extends keyof typeof form>(key: K) {
    return (v: (typeof form)[K]) => setForm(f => ({ ...f, [key]: v }));
  }

  const titleMap = { create: 'Create Item', edit: 'Edit Item', view: 'View Item' };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={ci.overlay}>
        <KeyboardAvoidingView style={ci.kav} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={ci.sheet}>

            {/* Header */}
            <View style={ci.header}>
              <View style={ci.headerLeft}>
                <View style={ci.headerIconBox}>
                  <MaterialCommunityIcons name="package-variant-closed" size={16} color="#FFF" />
                </View>
                <Text style={ci.headerTitle}>{titleMap[mode]}</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10} style={{ paddingLeft: 4 }}>
                <MaterialCommunityIcons name="close" size={20} color="#60607A" />
              </Pressable>
            </View>

            <ScrollView style={ci.formScroll} keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>

              <CiFieldInput label="Item Code"       value={form.code}          onChangeText={field('code')}          editable={!isView} />
              <CiFieldInput label="*Item Name"      value={form.itemName}      onChangeText={field('itemName')}      editable={!isView} />
              <CiFieldInput label="Description"     value={form.description}   onChangeText={field('description')}   editable={!isView} />
              <CiFieldInput label="Compatibility"   value={form.compatibility} onChangeText={field('compatibility')} editable={!isView} />

              <CiFieldSelect label="Category"    value={form.category}    placeholder="Select category" />
              <CiFieldSelect label="Sub Category" value={form.subCategory} placeholder="Select sub category" />
              <CiFieldSelect label="Brand"       value={form.brand}       placeholder="Select brand" />
              <CiFieldSelect label="Group Name"  value={form.groupName}   placeholder="Select group" />

              {/* Pricing */}
              <View style={ci.sectionCard}>
                <Text style={ci.sectionTitle}>Pricing</Text>
                <CiFieldInput label="Cost Price"  value={form.costPrice}  onChangeText={field('costPrice')}  editable={!isView} />
                <CiFieldInput label="Sell Price"  value={form.sellPrice}  onChangeText={field('sellPrice')}  editable={!isView} />
                <CiFieldInput label="Stock Qty"   value={String(form.stockQty)} onChangeText={v => field('stockQty')(parseInt(v || '0', 10))} editable={!isView} />
              </View>

              {/* Serial Number */}
              <View style={ci.sectionCard}>
                <Text style={ci.sectionTitle}>Serial Number</Text>
                <View style={ci.radioRow}>
                  {(['auto', 'manufacture', 'none'] as SerialType[]).map(t => (
                    <Pressable key={t} style={ci.radioOpt} onPress={() => !isView && field('serialType')(t)}>
                      <View style={[ci.radioDot, form.serialType === t && ci.radioDotActive]} />
                      <Text style={ci.radioLbl}>
                        {t === 'auto' ? 'Auto Generate' : t === 'manufacture' ? 'Enter Manufacture Serial' : 'No Serial'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Status */}
              <View style={ci.sectionCard}>
                <Text style={ci.sectionTitle}>Status</Text>
                <View style={ci.radioRow}>
                  {(['Active', 'Inactive'] as const).map(s => (
                    <Pressable key={s} style={ci.radioOpt} onPress={() => !isView && field('status')(s)}>
                      <View style={[ci.radioDot, form.status === s && ci.radioDotActive]} />
                      <Text style={ci.radioLbl}>{s}</Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            {!isView && (
              <View style={ci.formFooter}>
                <Pressable style={ci.nextBtn} onPress={onClose}>
                  <Text style={ci.footerBtnTxt}>Cancel</Text>
                </Pressable>
                <Pressable style={ci.saveBtn} onPress={() => onSave(form)}>
                  <Text style={ci.footerBtnTxt}>Save</Text>
                </Pressable>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Create Item modal — mirrors EmployeeFormModal structure ───────────────────

function CreateItemModal({ visible, onClose, onCreated }: {
  visible: boolean; onClose: () => void;
  onCreated: (data: Omit<GoodItem, 'id'>) => void;
}) {
  const [phase, setPhase] = useState<'search' | 'create'>('search');
  const [query, setQuery] = useState('');
  const [form,  setForm]  = useState<CreateItemForm>(EMPTY_FORM);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return SEARCH_ITEMS.filter(i =>
      i.code.toLowerCase().includes(q) || i.description.toLowerCase().includes(q),
    );
  }, [query]);

  function resetAll() { setPhase('search'); setQuery(''); setForm(EMPTY_FORM); }

  function field<K extends keyof CreateItemForm>(key: K) {
    return (v: CreateItemForm[K]) => setForm(f => ({ ...f, [key]: v }));
  }

  function handleClose() { resetAll(); onClose(); }

  function handleSave() {
    onCreated({
      code: form.subCategory.toUpperCase().replace(/\s+/g, '-') || 'NEW-ITEM',
      description: form.itemName || form.subCategory,
      compatibility: '',
      category: form.category || 'Spare Parts',
      subCategory: form.subCategory,
      brand: form.brand,
      itemName: form.itemName,
      groupName: form.groupName,
      stockQty: 0,
      costPrice: '',
      sellPrice: form.sameAsDesc ? form.itemName : form.salesName,
      serialType: form.serialType,
      status: 'Active',
    });
    resetAll();
    onClose();
  }

  return (
    <Modal visible={visible} animationType="fade" transparent statusBarTranslucent onRequestClose={handleClose}>
      <View style={cm.overlay}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={cm.cardWrapper}>

            {/* Close button — sits on card's top border, same as EmployeeFormModal */}
            <Pressable onPress={handleClose} style={({ pressed }) => [cm.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={16}>
              <View style={cm.xL} /><View style={cm.xR} />
            </Pressable>

            {/* Reset Form button */}
            {phase === 'create' && (
              <Pressable onPress={resetAll} style={({ pressed }) => [cm.resetBtn, pressed && { opacity: 0.75 }]} hitSlop={8}>
                <MaterialCommunityIcons name="refresh" size={13} color="#FFF" />
                <Text style={cm.resetTxt}>Reset Form</Text>
              </Pressable>
            )}

            <View style={cm.container}>

              {/* Header */}
              <View style={cm.header}>
                <View style={cm.headerIcon}>
                  <MaterialCommunityIcons name="package-variant-closed" size={20} color="#FFF" />
                </View>
                <View style={cm.headerTitle}>
                  <Text style={cm.titleTxt}>{phase === 'search' ? 'Create Items' : 'New Item'}</Text>
                  {phase === 'create' && <Text style={cm.subTxt}>Item Details</Text>}
                </View>
              </View>

              {/* Progress bar — Phase 2 only */}
              {phase === 'create' && (
                <View style={cm.progressWrap}>
                  <View style={cm.progressRow}>
                    <Text style={cm.progressLbl}>Required ~24%</Text>
                    <View style={cm.progressBg}><View style={[cm.progressFill, { width: '35%' }]} /></View>
                    <View style={cm.progressBg}><View style={[cm.progressAvg,  { width: '55%' }]} /></View>
                    <Text style={cm.progressBadge}>Average ✓</Text>
                  </View>
                </View>
              )}

              {/* ── Phase 1 — Search ── */}
              {phase === 'search' && (
                <View style={{ flex: 1, backgroundColor: '#FFF' }}>
                  <View style={ci.searchSection}>
                    <Text style={ci.fieldLbl}>*Item Description</Text>
                    <View style={ci.searchBox}>
                      <MaterialCommunityIcons name="magnify" size={16} color="#9090A0" style={{ marginRight: 4 }} />
                      <TextInput value={query} onChangeText={setQuery} style={ci.searchInput}
                        placeholder="Search existing items…" placeholderTextColor="#BBBBC0"
                        autoCapitalize="none" autoFocus />
                      {query.length > 0 && (
                        <Pressable onPress={() => setQuery('')} hitSlop={8}>
                          <MaterialCommunityIcons name="close-circle" size={16} color="#C0C0CC" />
                        </Pressable>
                      )}
                    </View>
                  </View>

                  {filtered.length > 0 ? (
                    <ScrollView style={ci.resultList} keyboardShouldPersistTaps="handled">
                      {filtered.map((it, idx) => (
                        <Pressable key={it.code}
                          style={({ pressed }) => [ci.resultRow, idx < filtered.length - 1 && ci.resultRowBorder, pressed && ci.resultRowPressed]}
                          onPress={handleClose}>
                          <Text style={ci.resultTitle}>{it.code} — {it.description}</Text>
                          <Text style={ci.resultSub} numberOfLines={2}>{it.compatibility}</Text>
                        </Pressable>
                      ))}
                    </ScrollView>
                  ) : query.length > 0 ? (
                    <View style={ci.noResultsRow}>
                      <Text style={ci.noResultsTxt}>
                        {'No results found. '}
                        <Text style={ci.noResultsLink} onPress={() => setPhase('create')}>Create a new item</Text>
                      </Text>
                      {/* GPIT Create button — same image used in EmployeeFormModal dropdowns */}
                      <Pressable style={({ pressed }) => [ci.gpitBtn, { width: 40, height: 40 }, pressed && { opacity: 0.75 }]}
                        onPress={() => setPhase('create')}>
                        <Image source={GPIT_BTN} style={{ width: 38, height: 38 }} resizeMode="contain" />
                      </Pressable>
                    </View>
                  ) : (
                    <View style={ci.emptySearch}>
                      <MaterialCommunityIcons name="text-search" size={36} color="#C8C8D4" />
                      <Text style={ci.emptySearchTxt}>Type to search existing items</Text>
                      <Text style={ci.emptySearchSub}>If no match found, you can create a new one</Text>
                    </View>
                  )}
                </View>
              )}

              {/* ── Phase 2 — Create form ── */}
              {phase === 'create' && (
                <>
                  <ScrollView style={ci.formScroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <CiFieldSelect label="Item Category"  value={form.category}    placeholder="Spare Parts"       showGpit />
                    <View style={ci.formGroup}>
                      <Text style={ci.formLbl}>*Item Sub Category</Text>
                      <TextInput value={form.subCategory} onChangeText={field('subCategory')} style={ci.textInput} placeholderTextColor="#BBBBC0" />
                    </View>
                    <CiFieldSelect label="*Item Brand"    value={form.brand}       placeholder="Search and select" showGpit />
                    <View style={ci.formGroup}>
                      <Text style={ci.formLbl}>*Item Name</Text>
                      <TextInput value={form.itemName} onChangeText={field('itemName')} style={ci.textInput} placeholderTextColor="#BBBBC0" />
                    </View>
                    <CiFieldSelect label="Group Name"     value={form.groupName}   placeholder="Search and select" showGpit />

                    {/* Packing Size */}
                    <Text style={ci.sectionLbl}>Item Packing Size</Text>
                    <View style={ci.packRow}>
                      {(['packLength', 'packBreadth', 'packHeight'] as const).map((k, i) => (
                        <View key={k} style={[ci.packField, i < 2 && { marginRight: 6 }]}>
                          <TextInput value={form[k]} onChangeText={field(k)} style={ci.packInput}
                            keyboardType="numeric" placeholder={['Length', 'Breadth', 'Height'][i]} placeholderTextColor="#BBBBC0" />
                          <Text style={ci.packUnit}>mm</Text>
                        </View>
                      ))}
                    </View>

                    {/* Item Variance */}
                    <View style={ci.sectionCard}>
                      <Text style={ci.sectionTitle}>Item Variance 1</Text>
                      <Text style={ci.formLbl}>Type</Text>
                      <View style={[ci.selectBox, { marginHorizontal: 0, marginBottom: 8 }]}>
                        <Text style={ci.selectPlaceholder}>Select Item Variance</Text>
                        <MaterialCommunityIcons name="chevron-down" size={15} color="#9090A0" />
                      </View>
                      <Text style={ci.formLbl}>Attribute</Text>
                      <View style={[ci.selectBox, { marginHorizontal: 0 }]}>
                        <Text style={ci.selectPlaceholder}>Select Item Variance Attribute</Text>
                        <MaterialCommunityIcons name="chevron-down" size={15} color="#9090A0" />
                      </View>
                      <Pressable style={ci.addMoreBtn}>
                        <MaterialCommunityIcons name="plus-circle-outline" size={14} color="#30A84B" />
                        <Text style={ci.addMoreTxt}>Add More</Text>
                      </Pressable>
                    </View>

                    {/* Special Parameters */}
                    <View style={ci.sectionCard}>
                      <Text style={ci.sectionTitle}>Special Item Parameters</Text>
                      <CiFieldSelect label="*Item Generic" value={form.itemGeneric} placeholder="Search and select" showGpit />
                      <Text style={[ci.formLbl, { marginTop: 8, paddingHorizontal: 0 }]}>*Serial Number</Text>
                      <View style={ci.radioRow}>
                        {(['auto', 'manufacture', 'none'] as SerialType[]).map(t => (
                          <Pressable key={t} style={ci.radioOpt} onPress={() => field('serialType')(t)}>
                            <View style={[ci.radioDot, form.serialType === t && ci.radioDotActive]} />
                            <Text style={ci.radioLbl}>
                              {t === 'auto' ? 'Auto Generate' : t === 'manufacture' ? 'Enter Manufacture Serial' : 'No Serial'}
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    </View>

                    {/* Upload Images */}
                    <Text style={ci.sectionLbl}>Upload Common Item Image</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ci.imgScroll} contentContainerStyle={ci.imgScrollContent}>
                      {[1, 2, 3, 4, 5].map(n => (
                        <View key={n} style={ci.imgPlaceholder}>
                          <MaterialCommunityIcons name="image-outline" size={26} color="#C8C8D4" />
                        </View>
                      ))}
                    </ScrollView>

                    {/* Upload Video */}
                    <Text style={[ci.sectionLbl, { marginTop: 4 }]}>Upload Video</Text>
                    <View style={[ci.radioRow, { paddingHorizontal: 14, marginBottom: 10 }]}>
                      {(['Upload File', 'URL'] as const).map(t => (
                        <Pressable key={t} style={ci.radioOpt}>
                          <View style={ci.radioDot} />
                          <Text style={ci.radioLbl}>{t}</Text>
                        </Pressable>
                      ))}
                    </View>

                    {/* Sales Item Name */}
                    <View style={ci.sectionCard}>
                      <Text style={ci.sectionTitle}>Sales Item Name</Text>
                      <Text style={ci.salesQ}>Do you use same as Item description?</Text>
                      <View style={[ci.radioRow, { paddingHorizontal: 0, marginBottom: 10 }]}>
                        {([true, false] as const).map(v => (
                          <Pressable key={String(v)} style={ci.radioOpt} onPress={() => field('sameAsDesc')(v)}>
                            <View style={[ci.radioDot, form.sameAsDesc === v && ci.radioDotActive]} />
                            <Text style={ci.radioLbl}>{v ? 'Yes' : 'No'}</Text>
                          </Pressable>
                        ))}
                      </View>
                      <View style={ci.salesRow}>
                        <Text style={ci.salesRowLbl}>Item Description:</Text>
                        <Text style={ci.salesRowVal} numberOfLines={1}>{form.itemName || 'Spare Parts Vehicle Head Light'}</Text>
                      </View>
                      <View style={[ci.salesRow, { marginTop: 6 }]}>
                        <Text style={ci.salesRowLbl}>Sales Name</Text>
                        <TextInput
                          value={form.sameAsDesc ? (form.itemName || 'Spare Parts Vehicle Head Light') : form.salesName}
                          onChangeText={field('salesName')} editable={!form.sameAsDesc} style={ci.salesInput} />
                      </View>
                    </View>

                    <View style={{ height: 20 }} />
                  </ScrollView>

                  {/* Footer — matches EmployeeFormModal footer */}
                  <View style={cm.footer}>
                    <Pressable style={({ pressed }) => [cm.backBtn, pressed && { opacity: 0.8 }]} onPress={() => setPhase('search')}>
                      <Text style={cm.backBtnTxt}>Back</Text>
                    </Pressable>
                    <Pressable style={({ pressed }) => [cm.saveBtn, pressed && { opacity: 0.85 }]} onPress={handleSave}>
                      <Text style={cm.saveTxt}>Save Item</Text>
                    </Pressable>
                  </View>
                </>
              )}

            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

// ── Items list view ───────────────────────────────────────────────────────────

function ItemsListView({
  items, filter, setFilter, searchQuery, setSearchQuery,
  onOpenCreate, onView, onEdit, onDelete,
}: {
  items: GoodItem[]; filter: ItemFilter; setFilter: (f: ItemFilter) => void;
  searchQuery: string; setSearchQuery: (q: string) => void;
  onOpenCreate: () => void; onView: (i: GoodItem) => void;
  onEdit: (i: GoodItem) => void; onDelete: (i: GoodItem) => void;
}) {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const counts: Record<ItemFilter, number> = useMemo(() => ({
    All:         items.length,
    'Spare Parts':  items.filter(i => i.category === 'Spare Parts').length,
    Electronics:    items.filter(i => i.category === 'Electronics').length,
    Consumables:    items.filter(i => i.category === 'Consumables').length,
  }), [items]);

  const catFiltered  = filter === 'All' ? items : items.filter(i => i.category === filter);
  const q            = searchQuery.trim().toLowerCase();
  const displayItems = q === '' ? catFiltered : catFiltered.filter(i =>
    [i.code, i.description, i.brand, i.subCategory, i.itemName]
      .some(v => v?.toLowerCase().includes(q)),
  );

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={lv.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing}
          onRefresh={async () => { setRefreshing(true); await new Promise<void>(r => setTimeout(r, 600)); setRefreshing(false); }}
          tintColor="#595959" />}>

        <View style={lv.sectionHeader}>
          <Text style={[lv.sectionTitle, { color: colors.primaryText }]}>Item Records</Text>
        </View>

        {/* Search + add */}
        <View style={lv.searchWrap}>
          <View style={lv.searchRow}>
            <View style={lv.searchBar}>
              <UIIcon name="search" size={16} color="#8E8E93" />
              <TextInput value={searchQuery} onChangeText={setSearchQuery}
                placeholder="Search by code, name, brand…" placeholderTextColor="#8E8E93"
                style={lv.searchInput} autoCapitalize="none" returnKeyType="search" />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={lv.clearX} hitSlop={8}>
                  <View style={lv.clearX1} /><View style={lv.clearX2} />
                </Pressable>
              )}
            </View>
            <Pressable onPress={onOpenCreate}
              style={({ pressed }) => [lv.addBtn, pressed && lv.addBtnPrs]}>
              <View style={lv.addBtnH} /><View style={lv.addBtnV} />
            </Pressable>
          </View>

          {/* Filter pills */}
          <View style={lv.pillRow}>
            {ITEM_FILTERS.map(f => {
              const active = filter === f;
              return (
                <Pressable key={f} onPress={() => setFilter(f)} style={[lv.pill, active && lv.pillActive]}>
                  <Text style={[lv.pillTxt, active && lv.pillTxtActive]}>{f}</Text>
                  <View style={[lv.pillBadge, active && lv.pillBadgeActive]}>
                    <Text style={[lv.pillBadgeTxt, active && lv.pillBadgeTxtA]}>{counts[f]}</Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Cards */}
        {displayItems.length === 0 ? (
          <View style={gc.emptyWrap}>
            <View style={gc.emptyIcon}>
              <MaterialCommunityIcons name="package-variant-closed-remove" size={28} color="rgba(89,89,89,0.35)" />
            </View>
            <Text style={[gc.emptyTtl, { color: colors.primaryText }]}>
              {q ? 'No matches found' : filter === 'All' ? 'No items yet' : `No ${filter} items`}
            </Text>
            <Text style={[gc.emptySub, { color: colors.placeholder }]}>
              {q ? `Nothing matched "${searchQuery}"` : 'Tap + to add your first item'}
            </Text>
            {q.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={gc.clearBtn}>
                <Text style={gc.clearTxt}>Clear search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={gc.list}>
            {displayItems.map((item, idx) => (
              <ItemCard key={item.id} item={item} index={idx}
                onView={() => onView(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ── Placeholder for GRN / Reports tabs ───────────────────────────────────────

function TabPlaceholder({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  const { colors } = useTheme();
  return (
    <View style={ph.wrap}>
      <View style={ph.iconCircle}>
        <MaterialCommunityIcons name={icon as any} size={28} color="rgba(89,89,89,0.4)" />
      </View>
      <Text style={[ph.title, { color: colors.primaryText }]}>{title}</Text>
      <Text style={[ph.sub, { color: colors.placeholder }]}>{subtitle}</Text>
    </View>
  );
}

const ph = StyleSheet.create({
  wrap:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(89,89,89,0.08)', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  title:      { fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', marginBottom: 6 },
  sub:        { fontFamily: FontFamily.regular, fontSize: FontSize.sm, textAlign: 'center', lineHeight: 20 },
});

// ── Main screen ───────────────────────────────────────────────────────────────

export function PurchasingGoodsScreen() {
  const [goodsTab,          setGoodsTab]          = useState<GoodsTab>('items');
  const [items,             setItems]             = useState<GoodItem[]>(INITIAL_GOODS);
  const [filter,            setFilter]            = useState<ItemFilter>('All');
  const [searchQuery,       setSearchQuery]       = useState('');
  const [showCreate,        setShowCreate]        = useState(false);
  const [showForm,          setShowForm]          = useState(false);
  const [formMode,          setFormMode]          = useState<ItemMode>('create');
  const [selected,          setSelected]          = useState<GoodItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDelete,     setPendingDelete]     = useState<GoodItem | null>(null);

  function openView(i: GoodItem)   { setSelected(i); setFormMode('view');   setShowForm(true); }
  function openEdit(i: GoodItem)   { setSelected(i); setFormMode('edit');   setShowForm(true); }
  function openDelete(i: GoodItem) { setPendingDelete(i); setShowDeleteConfirm(true); }

  function handleSave(data: Omit<GoodItem, 'id'>) {
    if (formMode === 'edit' && selected) {
      setItems(p => p.map(x => x.id === selected.id ? { ...data, id: x.id } : x));
    }
    setShowForm(false);
  }

  function handleCreated(data: Omit<GoodItem, 'id'>) {
    setItems(p => [...p, { ...data, id: genId() }]);
  }

  function confirmDelete() {
    if (pendingDelete) setItems(p => p.filter(x => x.id !== pendingDelete.id));
    setPendingDelete(null);
    setShowDeleteConfirm(false);
  }

  return (
    <>
      <SubModuleLayout parentModuleId="4" title="Goods" showBack={true}>
        <View style={scr.container}>
          <View style={scr.tabBarWrap}>
            <PageTabBar tabs={GOODS_TABS} active={goodsTab}
              onChange={t => setGoodsTab(t as GoodsTab)} variant="segment" />
          </View>
          <View style={scr.panel}>
            {goodsTab === 'items' ? (
              <ItemsListView
                items={items} filter={filter} setFilter={setFilter}
                searchQuery={searchQuery} setSearchQuery={setSearchQuery}
                onOpenCreate={() => setShowCreate(true)}
                onView={openView} onEdit={openEdit} onDelete={openDelete}
              />
            ) : goodsTab === 'grn' ? (
              <TabPlaceholder icon="clipboard-list-outline" title="GRN"
                subtitle="Goods Received Notes for purchasing will appear here." />
            ) : (
              <TabPlaceholder icon="chart-bar" title="Reports"
                subtitle="Purchasing goods reports and analytics will appear here." />
            )}
          </View>
        </View>
      </SubModuleLayout>

      {/* Create (search + form) modal */}
      <CreateItemModal visible={showCreate} onClose={() => setShowCreate(false)} onCreated={handleCreated} />

      {/* View / Edit modal */}
      <ItemFormModal visible={showForm} mode={formMode} item={selected}
        onClose={() => setShowForm(false)} onSave={handleSave} />

      {/* Delete confirmation */}
      <Modal visible={showDeleteConfirm} transparent animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}>
        <View style={dc.overlay}>
          <Pressable style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
            onPress={() => setShowDeleteConfirm(false)} />
          <View style={dc.card}>
            <View style={dc.topAccent} />
            <Pressable onPress={() => setShowDeleteConfirm(false)}
              style={({ pressed }) => [dc.closeBtn, pressed && { opacity: 0.6 }]} hitSlop={8}>
              <MaterialCommunityIcons name="close" size={13} color="#999" />
            </Pressable>
            <View style={dc.iconRing}>
              <View style={dc.iconCircle}>
                <MaterialCommunityIcons name="delete-outline" size={20} color="#FFF" />
              </View>
            </View>
            <Text style={dc.title}>Delete Item?</Text>
            <Text style={dc.desc} numberOfLines={2}>
              "{pendingDelete?.description ?? 'this item'}" will be permanently removed.
            </Text>
            <View style={dc.divider} />
            <View style={dc.btnRow}>
              <Pressable onPress={() => setShowDeleteConfirm(false)}
                style={({ pressed }) => [dc.cancelBtn, pressed && { opacity: 0.7 }]}>
                <Text style={dc.cancelTxt}>Cancel</Text>
              </Pressable>
              <Pressable onPress={confirmDelete}
                style={({ pressed }) => [dc.confirmBtn, pressed && { opacity: 0.85 }]}>
                <MaterialCommunityIcons name="delete" size={13} color="#FFF" />
                <Text style={dc.confirmTxt}>Delete</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const scr = StyleSheet.create({
  container:  { flex: 1, paddingTop: 8 },
  tabBarWrap: { paddingHorizontal: Spacing.md },
  panel:      { flex: 1, marginTop: 8 },
});
