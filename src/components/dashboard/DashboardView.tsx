import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { UIIcon } from '../common/UIIcon';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

interface Kpi {
  label: string;
  value: string;
  icon: string;
  color: string;
}

const KPIS: Kpi[] = [
  { label: 'Active Customers', value: '1,504',  icon: 'user',      color: '#007AFF' },
  { label: 'Active Suppliers', value: '340',    icon: 'truck',     color: '#FF9500' },
  { label: 'Ongoing Jobs',     value: '28',     icon: 'wrench',    color: '#AF52DE' },
  { label: 'Active Stock',     value: '15,842', icon: 'clipboard', color: '#34C759' },
];

const DAILY_SALES = [
  120, 150, 140, 180, 200, 220, 260, 240, 200, 240,
  280, 300, 340, 360, 320, 300, 280, 320, 360, 380,
  400, 420, 440, 420, 380, 360, 400, 430, 440, 420,
];

export function DashboardView() {
  const { colors, isDarkMode } = useTheme();
  const dyn = useMemo(() => createStyles(colors, isDarkMode), [colors, isDarkMode]);

  const ongoing = 28;
  const completed = 72;
  const total = ongoing + completed;
  const ongoingPct = Math.round((ongoing / total) * 100);

  const maxSale = Math.max(...DAILY_SALES);

  return (
    <View style={styles.root}>
      {/* KPI cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.kpiScroll}>
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
            <View
              style={[
                styles.donutArc,
                {
                  borderTopColor: '#FFC107',
                  borderRightColor: '#FFC107',
                  transform: [{ rotate: `${-45 + (ongoingPct * 3.6) / 2}deg` }],
                },
              ]}
            />
            <View style={styles.donutCenter}>
              <Text style={[styles.donutValue, dyn.text]}>{total}</Text>
              <Text style={[styles.donutLabel, dyn.mutedText]}>Jobs</Text>
            </View>
          </View>
          <View style={styles.legendCol}>
            <LegendItem color="#FFC107" label="Ongoing Jobs" value={ongoing} textStyle={dyn.text} mutedStyle={dyn.mutedText} />
            <LegendItem color="#34C759" label="Completed Jobs" value={completed} textStyle={dyn.text} mutedStyle={dyn.mutedText} />
          </View>
        </View>
      </View>

      {/* Daily Sales */}
      <View style={[styles.card, dyn.card]}>
        <View style={styles.salesHeader}>
          <Text style={[styles.cardTitle, dyn.text]}>Daily Sales</Text>
          <View style={styles.salesLegend}>
            <LegendDot color="#1C1C1E" label="Current" textStyle={dyn.mutedText} />
            <LegendDot color="#9E9E9E" label="Past" textStyle={dyn.mutedText} />
          </View>
        </View>

        <View style={styles.chartArea}>
          {DAILY_SALES.map((v, i) => {
            const h = (v / maxSale) * 90;
            return (
              <View key={i} style={styles.barCol}>
                <View
                  style={[
                    styles.bar,
                    { height: h, backgroundColor: '#1C1C1E' },
                  ]}
                />
              </View>
            );
          })}
        </View>
        <View style={styles.axisRow}>
          <Text style={[styles.axisText, dyn.mutedText]}>1</Text>
          <Text style={[styles.axisText, dyn.mutedText]}>10</Text>
          <Text style={[styles.axisText, dyn.mutedText]}>20</Text>
          <Text style={[styles.axisText, dyn.mutedText]}>30</Text>
        </View>
      </View>
    </View>
  );
}

function LegendItem({
  color, label, value, textStyle, mutedStyle,
}: { color: string; label: string; value: number; textStyle: any; mutedStyle: any }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <View>
        <Text style={[styles.legendLabel, mutedStyle]}>{label}</Text>
        <Text style={[styles.legendValue, textStyle]}>{value}</Text>
      </View>
    </View>
  );
}

function LegendDot({ color, label, textStyle }: { color: string; label: string; textStyle: any }) {
  return (
    <View style={styles.legendDotRow}>
      <View style={[styles.dotSm, { backgroundColor: color }]} />
      <Text style={[styles.legendSmText, textStyle]}>{label}</Text>
    </View>
  );
}

function createStyles(colors: any, isDark: boolean) {
  return StyleSheet.create({
    card: {
      backgroundColor: isDark ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDark ? '#3A3A3C' : '#ECECF0',
    },
    text: { color: colors.primaryText },
    mutedText: { color: isDark ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
  });
}

const styles = StyleSheet.create({
  root: { gap: Spacing.md },

  kpiScroll: { gap: Spacing.sm, paddingRight: Spacing.lg },
  kpiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.md,
    minWidth: 170,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  kpiTextCol: { gap: 2 },
  kpiValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  kpiLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
  },
  kpiIconWrap: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },

  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: Spacing.md,
  },
  cardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.md,
  },

  donutRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.lg },
  donutWrap: {
    width: 110, height: 110,
    alignItems: 'center', justifyContent: 'center',
  },
  donutBg: {
    position: 'absolute',
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 14,
  },
  donutArc: {
    position: 'absolute',
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 14,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  donutCenter: { alignItems: 'center' },
  donutValue: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  donutLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 10,
  },
  legendCol: { gap: Spacing.md, flex: 1 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendLabel: { fontFamily: FontFamily.regular, fontSize: 11 },
  legendValue: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, fontWeight: FontWeight.bold },

  salesHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  salesLegend: { flexDirection: 'row', gap: 8 },
  legendDotRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dotSm: { width: 6, height: 6, borderRadius: 3 },
  legendSmText: { fontFamily: FontFamily.regular, fontSize: 10 },

  chartArea: {
    height: 100,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  barCol: { flex: 1, alignItems: 'center' },
  bar: { width: '100%', borderRadius: 2, opacity: 0.85 },
  axisRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    marginTop: 6,
  },
  axisText: { fontFamily: FontFamily.regular, fontSize: 9 },
});
