import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { UIIcon } from '../common/UIIcon';
import { FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

// ─── KPI data ─────────────────────────────────────────────────────────────────

interface Kpi { label: string; value: string; icon: string; color: string; }

const KPIS: Kpi[] = [
  { label: 'Active Customers', value: '1,504',  icon: 'user',      color: '#007AFF' },
  { label: 'Active Suppliers', value: '340',    icon: 'truck',     color: '#FF9500' },
  { label: 'Ongoing Jobs',     value: '28',     icon: 'wrench',    color: '#AF52DE' },
  { label: 'Active Stock',     value: '15,842', icon: 'clipboard', color: '#34C759' },
];

// ─── Chart data ───────────────────────────────────────────────────────────────

const DAILY_SALES = [
  120, 150, 140, 180, 200, 220, 260, 240, 200, 240,
  280, 300, 340, 360, 320, 300, 280, 320, 360, 380,
  400, 420, 440, 420, 380, 360, 400, 430, 440, 420,
];

function seededRand(seed: number) {
  let s = (Math.abs(seed) + 1) & 0x7fffffff;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

function genCustomers(monthIdx: number): number[] {
  const rand = seededRand(monthIdx * 131 + 7);
  const base = 40 + ((monthIdx + 60) % 5) * 15;
  return Array.from({ length: 30 }, (_, i) =>
    Math.max(25, Math.round(base + i * 3.5 + Math.sin(i / 4) * 18 + (rand() - 0.45) * 45))
  );
}

function genStock(monthIdx: number): number[] {
  const rand = seededRand(monthIdx * 97 + 13);
  const base = 180 + ((monthIdx + 60) % 6) * 25;
  return Array.from({ length: 30 }, (_, i) =>
    Math.max(100, Math.round(base + i * 6 + Math.sin(i / 5) * 35 + (rand() - 0.5) * 80))
  );
}

const BASE_MONTH = 5; // June (0-based)

// ─── Constants ────────────────────────────────────────────────────────────────

const CHART_TITLES = ['Daily Sales', 'Daily Customers', 'Daily Stock Movement'] as const;
const CHART_COUNT  = CHART_TITLES.length;

const CHART_H   = 130;
const Y_AXIS_W  = 32;
const DOT_R     = 3;
const LINE_H    = 1.5;
const DASH_LEN  = 5;
const DASH_GAP  = 4;
const CARD_PAD  = 14;
const OUTER_PAD = 12;

// ─── Line segment helpers ─────────────────────────────────────────────────────

function solidSeg(x1: number, y1: number, x2: number, y2: number, color: string, key: string) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.5) return null;
  const angle = `${Math.atan2(dy, dx) * 180 / Math.PI}deg`;
  return (
    <View key={key} style={{
      position: 'absolute',
      left: (x1 + x2) / 2 - len / 2,
      top:  (y1 + y2) / 2 - LINE_H / 2,
      width: len, height: LINE_H,
      backgroundColor: color,
      transform: [{ rotate: angle }],
    }} />
  );
}

function dashedSegs(x1: number, y1: number, x2: number, y2: number, color: string, prefix: string): React.ReactNode[] {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  if (len < 0.5) return [];
  const angle = `${Math.atan2(dy, dx) * 180 / Math.PI}deg`;
  const ux = dx / len, uy = dy / len;
  const pat = DASH_LEN + DASH_GAP;
  const out: React.ReactNode[] = [];
  for (let pos = 0, si = 0; pos < len; pos += pat, si++) {
    const sl = Math.min(DASH_LEN, len - pos);
    if (sl < 1) break;
    const cx = x1 + (pos + sl / 2) * ux, cy = y1 + (pos + sl / 2) * uy;
    out.push(
      <View key={`${prefix}-${si}`} style={{
        position: 'absolute',
        left: cx - sl / 2, top: cy - LINE_H / 2,
        width: sl, height: LINE_H,
        backgroundColor: color,
        transform: [{ rotate: angle }],
      }} />
    );
  }
  return out;
}

// ─── Bar chart ────────────────────────────────────────────────────────────────

function BarChart({ isDarkMode, mutedColor }: { isDarkMode: boolean; mutedColor: string }) {
  const maxSale = Math.max(...DAILY_SALES);
  return (
    <View>
      <View style={styles.barChartArea}>
        {DAILY_SALES.map((v, i) => (
          <View key={i} style={styles.barCol}>
            <View style={[styles.bar, { height: (v / maxSale) * 90, backgroundColor: isDarkMode ? '#E0E0E0' : '#1C1C1E' }]} />
          </View>
        ))}
      </View>
      <View style={styles.axisRow}>
        {['1', '10', '20', '30'].map(l => (
          <Text key={l} style={[styles.axisText, { color: mutedColor }]}>{l}</Text>
        ))}
      </View>
    </View>
  );
}

// ─── Line chart ───────────────────────────────────────────────────────────────

function LineChart({ currentData, pastData, plotW, currColor, pastColor }: {
  currentData: number[];
  pastData:    number[];
  plotW:       number;
  currColor:   string;
  pastColor:   string;
}) {
  const all    = [...currentData, ...pastData];
  const maxVal = Math.ceil(Math.max(...all) / 40) * 40;
  const N      = currentData.length;

  const toX = (i: number) => (i / (N - 1)) * plotW;
  const toY = (v: number) => CHART_H - (v / maxVal) * CHART_H;

  const yLabels = [maxVal, Math.round(maxVal * 3/4), Math.round(maxVal / 2), Math.round(maxVal / 4), 0];
  const xTicks  = [1, 5, 10, 15, 20, 25, 30];

  const pastSegs: React.ReactNode[] = [];
  const currSegs: React.ReactNode[] = [];
  for (let i = 0; i < N - 1; i++) {
    pastSegs.push(...dashedSegs(toX(i), toY(pastData[i]), toX(i + 1), toY(pastData[i + 1]), pastColor, `p${i}`));
    const seg = solidSeg(toX(i), toY(currentData[i]), toX(i + 1), toY(currentData[i + 1]), currColor, `c${i}`);
    if (seg) currSegs.push(seg);
  }

  return (
    <View>
      <View style={{ flexDirection: 'row', height: CHART_H }}>
        {/* Y axis */}
        <View style={{ width: Y_AXIS_W }}>
          {yLabels.map((v, i) => (
            <Text key={i} style={{
              position: 'absolute', top: (i / 4) * CHART_H - 6,
              right: 3, fontSize: 9, color: '#8E8E93', textAlign: 'right',
            }}>{v}</Text>
          ))}
        </View>
        {/* Plot */}
        <View style={{ width: plotW, overflow: 'hidden' }}>
          {yLabels.map((_, i) => (
            <View key={i} style={{
              position: 'absolute', top: (i / 4) * CHART_H,
              left: 0, right: 0, height: StyleSheet.hairlineWidth,
              backgroundColor: '#DCDCDC',
            }} />
          ))}
          {pastSegs}
          {currSegs}
          {pastData.map((v, i) => (
            <View key={i} style={{
              position: 'absolute',
              left: toX(i) - DOT_R, top: toY(v) - DOT_R,
              width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
              backgroundColor: '#FFF', borderWidth: 1.5, borderColor: pastColor,
            }} />
          ))}
          {currentData.map((v, i) => (
            <View key={i} style={{
              position: 'absolute',
              left: toX(i) - DOT_R, top: toY(v) - DOT_R,
              width: DOT_R * 2, height: DOT_R * 2, borderRadius: DOT_R,
              backgroundColor: currColor,
            }} />
          ))}
        </View>
      </View>
      {/* X axis */}
      <View style={{ marginLeft: Y_AXIS_W, height: 16 }}>
        {xTicks.map(d => (
          <Text key={d} style={{
            position: 'absolute', left: toX(d - 1) - 6,
            fontSize: 9, color: '#8E8E93',
          }}>{d}</Text>
        ))}
      </View>
    </View>
  );
}

// ─── Chart carousel card ──────────────────────────────────────────────────────

function ChartCarousel({ plotW, colors, isDarkMode }: {
  plotW:      number;
  colors:     any;
  isDarkMode: boolean;
}) {
  const [index, setIndex] = useState(0);

  const currColor = isDarkMode ? '#E0E0E0' : '#1C1C1E';
  const pastColor = isDarkMode ? '#777777' : '#ADADAD';
  const mutedClr  = isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93';
  const cardBg    = isDarkMode ? '#2C2C2E' : '#FFFFFF';
  const cardBdr   = isDarkMode ? '#3A3A3C' : '#ECECF0';

  const custCurr = useMemo(() => genCustomers(BASE_MONTH),     []);
  const custPast = useMemo(() => genCustomers(BASE_MONTH - 1), []);
  const stckCurr = useMemo(() => genStock(BASE_MONTH),         []);
  const stckPast = useMemo(() => genStock(BASE_MONTH - 1),     []);

  const isLineChart = index > 0;

  return (
    <View style={[styles.chartCard, { backgroundColor: cardBg, borderColor: cardBdr }]}>
      {/* Header */}
      <View style={styles.chartHeader}>
        <Text style={[styles.chartTitle, { color: colors.primaryText }]}>
          {CHART_TITLES[index]}
        </Text>
        <View style={styles.navRow}>
          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnLeft]}
            onPress={() => setIndex(i => (i - 1 + CHART_COUNT) % CHART_COUNT)}
            activeOpacity={0.75}>
            <Text style={styles.navBtnText}>‹ Prev</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnRight]}
            onPress={() => setIndex(i => (i + 1) % CHART_COUNT)}
            activeOpacity={0.75}>
            <Text style={styles.navBtnText}>Next ›</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Legend — only for line charts */}
      {isLineChart && (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.solidSwatch, { backgroundColor: currColor }]} />
            <Text style={[styles.swatchLabel, { color: mutedClr }]}>Current Month</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={styles.dashedSwatch}>
              {[0, 7, 14].map(x => (
                <View key={x} style={{ position: 'absolute', left: x, top: 3.5, width: 5, height: 1.5, backgroundColor: pastColor }} />
              ))}
            </View>
            <Text style={[styles.swatchLabel, { color: mutedClr }]}>Past Month</Text>
          </View>
        </View>
      )}

      {/* Active chart */}
      {index === 0 && <BarChart isDarkMode={isDarkMode} mutedColor={mutedClr} />}
      {index === 1 && (
        <LineChart currentData={custCurr} pastData={custPast} plotW={plotW} currColor={currColor} pastColor={pastColor} />
      )}
      {index === 2 && (
        <LineChart currentData={stckCurr} pastData={stckPast} plotW={plotW} currColor={currColor} pastColor={pastColor} />
      )}

      {/* Dot indicators */}
      <View style={styles.dotRow}>
        {CHART_TITLES.map((_, i) => (
          <View key={i} style={[styles.dotIndicator, i === index && styles.dotIndicatorActive]} />
        ))}
      </View>
    </View>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function DashboardView() {
  const { colors, isDarkMode } = useTheme();
  const { width: screenW }     = useWindowDimensions();
  const dyn = useMemo(() => createDynStyles(colors, isDarkMode), [colors, isDarkMode]);

  const plotW = screenW - OUTER_PAD * 2 - CARD_PAD * 2 - Y_AXIS_W;

  const ongoing = 28, completed = 72, total = ongoing + completed;
  const ongoingPct = Math.round((ongoing / total) * 100);

  return (
    <View style={styles.root}>
      {/* KPI cards */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
        {KPIS.map(k => (
          <View key={k.label} style={[styles.kpiCard, dyn.card]}>
            <View style={styles.kpiTextCol}>
              <Text style={[styles.kpiValue, dyn.text]}>{k.value}</Text>
              <Text style={[styles.kpiLabel, dyn.mutedText]} numberOfLines={1}>{k.label}</Text>
            </View>
            <View style={[styles.kpiIconWrap, { backgroundColor: `${k.color}22` }]}>
              <UIIcon name={k.icon as any} size={20} color={k.color} />
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Jobs Overview */}
      <View style={[styles.card, dyn.card]}>
        <Text style={[styles.cardTitle, dyn.text]}>Jobs Overview (Today)</Text>
        <View style={styles.donutRow}>
          <View style={styles.donutWrap}>
            <View style={[styles.donutBg, { borderColor: '#34C759' }]} />
            <View style={[styles.donutArc, {
              borderTopColor:   '#FFC107',
              borderRightColor: '#FFC107',
              transform: [{ rotate: `${-45 + (ongoingPct * 3.6) / 2}deg` }],
            }]} />
            <View style={styles.donutCenter}>
              <Text style={[styles.donutValue, dyn.text]}>{total}</Text>
              <Text style={[styles.donutLabel, dyn.mutedText]}>Jobs</Text>
            </View>
          </View>
          <View style={styles.legendCol}>
            <JobLegendItem color="#FFC107" label="Ongoing Jobs"   value={ongoing}   textStyle={dyn.text} mutedStyle={dyn.mutedText} />
            <JobLegendItem color="#34C759" label="Completed Jobs" value={completed} textStyle={dyn.text} mutedStyle={dyn.mutedText} />
          </View>
        </View>
      </View>

      {/* Chart carousel */}
      <ChartCarousel plotW={plotW} colors={colors} isDarkMode={isDarkMode} />
    </View>
  );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function JobLegendItem({ color, label, value, textStyle, mutedStyle }: {
  color: string; label: string; value: number; textStyle: any; mutedStyle: any;
}) {
  return (
    <View style={styles.jobLegendItem}>
      <View style={[styles.jobLegendDot, { backgroundColor: color }]} />
      <View>
        <Text style={[styles.jobLegendLabel, mutedStyle]}>{label}</Text>
        <Text style={[styles.jobLegendValue, textStyle]}>{value}</Text>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

function createDynStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    card:      { backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF', borderColor: isDark ? '#3A3A3C' : '#ECECF0' },
    text:      { color: colors.primaryText },
    mutedText: { color: isDark ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
  });
}

const styles = StyleSheet.create({
  root: { gap: Spacing.md },

  // KPI
  kpiScroll:   { gap: Spacing.sm, paddingRight: Spacing.lg },
  kpiCard:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md, minWidth: 170, borderRadius: 14, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  kpiTextCol:  { gap: 2 },
  kpiValue:    { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  kpiLabel:    { fontFamily: FontFamily.regular, fontSize: 10 },
  kpiIconWrap: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  // Jobs overview
  card:        { borderRadius: 16, borderWidth: 1, padding: Spacing.md },
  cardTitle:   { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold, marginBottom: Spacing.md },
  donutRow:    { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  donutWrap:   { width: 110, height: 110, alignItems: 'center', justifyContent: 'center' },
  donutBg:     { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 14 },
  donutArc:    { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 14, borderLeftColor: 'transparent', borderBottomColor: 'transparent' },
  donutCenter: { alignItems: 'center' },
  donutValue:  { fontFamily: FontFamily.bold, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  donutLabel:  { fontFamily: FontFamily.regular, fontSize: 10 },
  legendCol:   { gap: Spacing.md, flex: 1 },
  jobLegendItem:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  jobLegendDot:   { width: 10, height: 10, borderRadius: 5 },
  jobLegendLabel: { fontFamily: FontFamily.regular, fontSize: 11 },
  jobLegendValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  // Chart carousel card
  chartCard:   { borderRadius: 16, borderWidth: 1, padding: CARD_PAD },
  chartHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  chartTitle:  { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  navRow:      { flexDirection: 'row' },
  navBtn:      { backgroundColor: '#4A4A4A', paddingVertical: 4, paddingHorizontal: 10 },
  navBtnLeft:  { borderTopLeftRadius: 6, borderBottomLeftRadius: 6 },
  navBtnRight: { borderTopRightRadius: 6, borderBottomRightRadius: 6 },
  navBtnText:  { fontFamily: FontFamily.medium, fontSize: 11, color: '#FFF' },

  // Legend
  legend:      { flexDirection: 'row', gap: Spacing.md, marginBottom: 10 },
  legendItem:  { flexDirection: 'row', alignItems: 'center' },
  solidSwatch: { width: 22, height: 2, marginRight: 4 },
  dashedSwatch:{ width: 22, height: 8, marginRight: 4 },
  swatchLabel: { fontFamily: FontFamily.regular, fontSize: 10 },

  // Dot indicators
  dotRow:            { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
  dotIndicator:      { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D0D0D0' },
  dotIndicatorActive:{ width: 18, borderRadius: 3, backgroundColor: '#4A4A4A' },

  // Bar chart
  barChartArea: { height: 100, flexDirection: 'row', alignItems: 'flex-end', gap: 2 },
  barCol:       { flex: 1, alignItems: 'center' },
  bar:          { width: '100%', borderRadius: 2, opacity: 0.85 },
  axisRow:      { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  axisText:     { fontFamily: FontFamily.regular, fontSize: 9 },
});
