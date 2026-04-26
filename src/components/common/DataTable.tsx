import React from 'react';
import { Pressable, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';

// ─── Column Definition ────────────────────────────────────────────────────────
export interface DataTableColumn<T> {
  key: string;
  header: string;
  width?: number;       // Fixed width in pixels
  flex?: number;        // Flex grow value
  align?: 'left' | 'center' | 'right';
  render: (item: T, index: number) => React.ReactNode;
}

// ─── Action Definition ────────────────────────────────────────────────────────
export type ActionVariant = 'view' | 'edit' | 'delete' | 'primary';

export interface DataTableAction<T> {
  icon: React.ReactNode;
  variant?: ActionVariant;
  onPress: (item: T) => void;
  label?: string;
}

// ─── Table Props ──────────────────────────────────────────────────────────────
interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  actions?: DataTableAction<T>[];
  keyExtractor: (item: T) => string;
  emptyTitle?: string;
  emptySubtitle?: string;
  searchQuery?: string;
  onClearSearch?: () => void;
  searchEmptyTitle?: string;
  actionsWidth?: number;
  containerStyle?: ViewStyle;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function TableEmpty({ title, subtitle, query, onClear }: { title: string; subtitle: string; query?: string; onClear?: () => void }) {
  const { colors } = useTheme();
  const isSearch = query ? query.trim().length > 0 : false;

  return (
    <View style={es.wrap}>
      <View style={es.iconCircle}>
        <View style={es.head}/>
        <View style={es.body}/>
      </View>
      <Text style={[es.title, { color: colors.primaryText }]}>{title}</Text>
      <Text style={[es.sub, { color: colors.placeholder }]}>
        {isSearch ? `Nothing matched "${query}"` : subtitle}
      </Text>
      {isSearch && onClear && (
        <Pressable onPress={onClear} style={({ pressed }) => [es.clearBtn, pressed && { opacity: 0.75 }]}>
          <Text style={[es.clearTxt, { color: Colors.primaryHighlight }]}>Clear search</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Action Button ────────────────────────────────────────────────────────────
function getActionStyle(variant?: ActionVariant) {
  switch (variant) {
    case 'view':    return ab.btnView;
    case 'edit':    return ab.btnEdit;
    case 'delete':  return ab.btnDelete;
    case 'primary': return ab.btnPrimary;
    default:        return ab.btnView;
  }
}

// ─── Main DataTable ───────────────────────────────────────────────────────────
export function DataTable<T>({
  data,
  columns,
  actions,
  keyExtractor,
  emptyTitle = 'No records yet',
  emptySubtitle = 'Start by adding your first record',
  searchEmptyTitle = 'No matching records',
  searchQuery,
  onClearSearch,
  actionsWidth = 96,
  containerStyle,
}: DataTableProps<T>) {
  const { isDarkMode } = useTheme();

  const headerBg = isDarkMode ? '#1F1F22' : '#FAFAFC';
  const headerBorder = isDarkMode ? '#3A3A3C' : '#E8E8F0';
  const headerTxtColor = isDarkMode ? 'rgba(255,255,255,0.55)' : '#6B6B70';

  const isSearching = searchQuery ? searchQuery.trim().length > 0 : false;

  return (
    <View style={[tw.tableWrap, containerStyle]}>
      {/* Header */}
      <View style={[th.row, { backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
        {columns.map(col => (
          <View
            key={col.key}
            style={[
              col.width !== undefined ? { width: col.width } : { flex: col.flex ?? 1 },
              col.align === 'center' && { alignItems: 'center' },
              col.align === 'right' && { alignItems: 'flex-end' },
            ]}>
            <Text style={[th.txt, { color: headerTxtColor }]}>{col.header}</Text>
          </View>
        ))}
        {actions && actions.length > 0 && (
          <View style={{ width: actionsWidth }}>
            <Text style={[th.txt, { color: headerTxtColor, textAlign: 'center' }]}>Actions</Text>
          </View>
        )}
      </View>

      {/* Body */}
      {data.length === 0 ? (
        <TableEmpty
          title={isSearching ? searchEmptyTitle : emptyTitle}
          subtitle={emptySubtitle}
          query={searchQuery}
          onClear={onClearSearch}
        />
      ) : (
        data.map((item, index) => (
          <DataTableRow
            key={keyExtractor(item)}
            item={item}
            index={index}
            columns={columns}
            actions={actions}
            actionsWidth={actionsWidth}
          />
        ))
      )}
    </View>
  );
}

// ─── Row ──────────────────────────────────────────────────────────────────────
function DataTableRow<T>({ item, index, columns, actions, actionsWidth }: { item: T; index: number; columns: DataTableColumn<T>[]; actions?: DataTableAction<T>[]; actionsWidth: number }) {
  const isEven = index % 2 === 0;

  return (
    <View style={[tr.row, isEven && tr.rowEven]}>
      {columns.map(col => (
        <View
          key={col.key}
          style={[
            col.width !== undefined ? { width: col.width } : { flex: col.flex ?? 1 },
            col.align === 'center' && { alignItems: 'center' },
            col.align === 'right' && { alignItems: 'flex-end' },
          ]}>
          {col.render(item, index)}
        </View>
      ))}
      {actions && actions.length > 0 && (
        <View style={[tr.actions, { width: actionsWidth }]}>
          {actions.map((action, i) => (
            <Pressable
              key={i}
              onPress={() => action.onPress(item)}
              style={[ab.btn, getActionStyle(action.variant)]}
              hitSlop={6}
              accessibilityLabel={action.label}>
              {action.icon}
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const tw = StyleSheet.create({
  tableWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginHorizontal: Spacing.md,
  },
});

const th = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  txt: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});

const tr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
    backgroundColor: '#FFF',
  },
  rowEven: { backgroundColor: '#FAFAFA' },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
});

const ab = StyleSheet.create({
  btn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnView:    { backgroundColor: 'rgba(89,89,89,0.1)' },
  btnEdit:    { backgroundColor: 'rgba(89,89,89,0.1)' },
  btnDelete:  { backgroundColor: 'rgba(89,89,89,0.12)' },
  btnPrimary: { backgroundColor: 'rgba(233,30,99,0.12)' },
});

const es = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    gap: Spacing.xs,
  },
  iconCircle: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: 'rgba(89,89,89,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  head: { position: 'absolute', top: 10, width: 13, height: 13, borderRadius: 6.5, backgroundColor: 'rgba(89,89,89,0.3)' },
  body: { position: 'absolute', bottom: 12, width: 20, height: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10, backgroundColor: 'rgba(89,89,89,0.3)' },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    paddingHorizontal: Spacing.md,
  },
  clearBtn: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primaryHighlight,
    backgroundColor: '#FFF',
  },
  clearTxt: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
});

// ─── Shared action icon primitives (exported for convenience) ─────────────────
export const TableIcons = {
  Eye:   () => <View style={icon.wrap}><View style={icon.eyeOval}/><View style={icon.eyeDot}/></View>,
  Edit:  () => <View style={icon.wrap}><View style={icon.penBody}/><View style={icon.penLine}/></View>,
  Trash: () => <View style={icon.wrap}><View style={icon.lidBar}/><View style={icon.binBody}/><View style={icon.binL}/><View style={icon.binR}/></View>,
};

const icon = StyleSheet.create({
  wrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  eyeOval: { position: 'absolute', width: 14, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: '#595959' },
  eyeDot:  { width: 5, height: 5, borderRadius: 3, backgroundColor: '#595959' },
  penBody: { position: 'absolute', width: 9, height: 3, backgroundColor: '#595959', borderRadius: 1, transform: [{ rotate: '-45deg' }], top: 2, left: 1 },
  penLine: { position: 'absolute', bottom: 0, width: 8, height: 1.5, backgroundColor: '#595959', borderRadius: 1 },
  lidBar:  { position: 'absolute', top: 0, width: 12, height: 2, borderRadius: 1, backgroundColor: '#595959' },
  binBody: { position: 'absolute', bottom: 0, width: 10, height: 10, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderWidth: 1.5, borderColor: '#595959', borderTopWidth: 0 },
  binL:    { position: 'absolute', bottom: 2, left: 4, width: 1.5, height: 6, backgroundColor: '#595959', borderRadius: 1 },
  binR:    { position: 'absolute', bottom: 2, right: 4, width: 1.5, height: 6, backgroundColor: '#595959', borderRadius: 1 },
});
