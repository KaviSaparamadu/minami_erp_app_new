import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PageHeader } from '../../components/common/PageHeader';
import { QuickAccessRow } from '../../components/dashboard/QuickAccessRow';
import { ModulesGrid } from '../../components/dashboard/ModulesGrid';
import { ModuleCard } from '../../components/dashboard/ModuleCard';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { UIIcon } from '../../components/common/UIIcon';
import { HumanFormModal, ModalMode } from '../../components/hr/HumanFormModal';
import { DataTable, DataTableColumn, TableIcons } from '../../components/common/DataTable';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { Country, Human } from '../../types/hr';
import { fetchHumanList, dataKeyFor, HumanRow, HumanColumn } from '../../api/humanApi';

let nextId = 1;
const genId = () => String(nextId++);

function mapRowToHuman(row: HumanRow): Human {
  const country: Country = row.t2name === 'Japan' ? 'Japan' : 'Sri Lanka';
  return {
    id: String(row.id),
    country,
    fullName: (row.t1fullname as string) ?? '',
    gender: (row.t1gender as string) ?? undefined,
    dateOfBirth: (row.t1dob as string) ?? undefined,
    nic: (row.t1NIC as string) ?? undefined,
  };
}

const H_PAD = 6;
const GRID_GAP = 10;
const GRID_COLS = 3;

type Tab = 'dashboard' | 'modules' | 'createHuman';
type Filter = 'All' | Country;
const FILTERS: Filter[] = ['All', 'Sri Lanka', 'Japan'];
const AVATAR_COLORS = ['#595959', '#6B6B6B', '#7D7D7D', '#8E8E8E', '#A0A0A0', '#606060'];

// ─── Human table cell renderers 
function IndexCell({ index }: { index: number }) {
  const { colors } = useTheme();
  return <Text style={[cell.idxText, { color: colors.placeholder }]}>{index + 1}</Text>;
}

function NameCell({ human, index }: { human: Human; index: number }) {
  const { colors } = useTheme();
  const initial = human.fullName.charAt(0).toUpperCase();
  const isSL = human.country === 'Sri Lanka';

  return (
    <View style={cell.nameRow}>
      <View style={[cell.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
        <Text style={cell.avatarTxt}>{initial}</Text>
      </View>
      <View style={cell.nameBlock}>
        <Text style={[cell.nameText, { color: colors.primaryText }]} numberOfLines={1}>
          {human.title ? `${human.title} ` : ''}{human.fullName}
        </Text>
        <View style={[cell.countryBadge, isSL ? cell.badgeSL : cell.badgeJP]}>
          <Text style={cell.countryTxt}>{isSL ? 'SL' : 'JP'}</Text>
        </View>
      </View>
    </View>
  );
}

function MetaCell({ human }: { human: Human }) {
  const { colors } = useTheme();
  const isSL = human.country === 'Sri Lanka';

  return (
    <View>
      <Text style={[cell.metaText, { color: colors.primaryText }]} numberOfLines={1}>
        {isSL ? (human.dateOfBirth ?? '—') : (human.prefecture ?? '—')}
      </Text>
      <Text style={[cell.metaSub, { color: colors.placeholder }]} numberOfLines={1}>
        {isSL ? (human.gender ?? '') : (human.city ?? '')}
      </Text>
    </View>
  );
}

//  Tab button (Dashboard/Modules style)
function TabButton({ label, active, onPress, dyn, isFirst, isLast }: { label: string; active: boolean; onPress: () => void; dyn: any; isFirst?: boolean; isLast?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, isFirst && styles.tabBtnFirst, isLast && styles.tabBtnLast]}>
      <Text style={[styles.tabLabel, dyn.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
      {active && <View style={styles.tabUnderline} />}
    </Pressable>
  );
}

// ─── Dashboard tab content: Human creates come in here ────────────────────────
function HumanDashboardView({
  counts,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  onOpenCreate,
  onView,
  onEdit,
  onDelete,
  filteredRows,
  apiColumns,
  aliasMap,
  onRefresh,
  loadError,
}: {
  counts: Record<Filter, number>;
  filter: Filter;
  setFilter: (f: Filter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCreate: () => void;
  onView: (r: HumanRow) => void;
  onEdit: (r: HumanRow) => void;
  onDelete: (r: HumanRow) => void;
  filteredRows: HumanRow[];
  apiColumns: HumanColumn[];
  aliasMap: Record<string, string>;
  onRefresh: () => Promise<void> | void;
  loadError: string | null;
}) {
  const { colors, isDarkMode } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={dv.scroll}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#595959"
          />
        }>

        {/* Search with Add button */}
        <View style={dv.searchWrapper}>
          <View style={[dv.searchBar, dyn.searchBar]}>
            <UIIcon name="search" size={16} color="#8E8E93" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search by name, NIC, location…"
              placeholderTextColor="#8E8E93"
              style={[dv.searchInput, dyn.searchInput]}
              autoCapitalize="none"
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={dv.clearBtn} hitSlop={8}>
                <View style={[dv.clearX1, { backgroundColor: colors.placeholder }]} />
                <View style={[dv.clearX2, { backgroundColor: colors.placeholder }]} />
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={onOpenCreate}
            style={({ pressed }) => [dv.addBtn, pressed && dv.addBtnPressed]}
            accessibilityRole="button">
            <View style={dv.addBtnIcon} />
            <View style={dv.addBtnIconV} />
          </Pressable>
        </View>

        {/* Filter pills */}
        <View style={dv.pillRow}>
          {FILTERS.map(f => {
            const active = filter === f;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[dv.pill, active && dv.pillActive]}>
                <Text style={[dv.pillTxt, dyn.pillTxt, active && dv.pillTxtActive]}>{f}</Text>
                <View style={[dv.pillBadge, active && dv.pillBadgeActive]}>
                  <Text style={[dv.pillBadgeTxt, active && dv.pillBadgeTxtActive]}>{counts[f]}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {loadError && (
          <View style={dv.errorBanner}>
            <Text style={dv.errorTxt}>{loadError}</Text>
          </View>
        )}

        {/* Data Table — columns driven by API response */}
        <DataTable<HumanRow>
          data={filteredRows}
          keyExtractor={(r) => String(r.id)}
          columns={[
            {
              key: 'idx',
              header: '#',
              width: 28,
              render: (_item, i) => <IndexCell index={i} />,
            },
            ...apiColumns.map<DataTableColumn<HumanRow>>((c) => {
              const key = dataKeyFor(c, aliasMap);
              return {
                key,
                header: c.label,
                flex: 1,
                render: (row) => {
                  const v = row[key];
                  return (
                    <Text style={[cell.metaText, { color: colors.primaryText }]} numberOfLines={1}>
                      {v == null || v === '' ? '—' : String(v)}
                    </Text>
                  );
                },
              };
            }),
          ]}
          actions={[
            { icon: <TableIcons.Eye />,   variant: 'view',   onPress: onView,   label: 'View' },
            { icon: <TableIcons.Edit />,  variant: 'edit',   onPress: onEdit,   label: 'Edit' },
            { icon: <TableIcons.Trash />, variant: 'delete', onPress: onDelete, label: 'Delete' },
          ]}
          searchQuery={searchQuery}
          onClearSearch={() => setSearchQuery('')}
          emptyTitle={filter === 'All' ? 'No humans yet' : `No ${filter} records`}
          emptySubtitle='Tap the + button or "Create Human" to add your first record'
        />
      </ScrollView>
    </View>
  );
}

// ─── Modules tab content ──────────────────────────────────────────────────────
function ModulesView({ onModulePress, refreshing, onRefresh }: { onModulePress: (module: AppModule) => void; refreshing: boolean; onRefresh: () => void }) {
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const cardWidth = (width - H_PAD * 2 - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS;

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={[{ paddingHorizontal: H_PAD, paddingVertical: Spacing.md, gap: Spacing.md }]}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#595959"
        />
      }>
      <View style={[{ paddingHorizontal: 6 }]}>
        <Text style={[{ fontFamily: FontFamily.bold, fontSize: FontSize.md, fontWeight: '700', color: colors.primaryText, marginBottom: 12 }]}>
          Available Modules
        </Text>
      </View>
      <ModulesGrid
        data={MODULES}
        cardWidth={cardWidth}
        numColumns={GRID_COLS}
        gap={GRID_GAP}
        hPad={0}
        renderItem={(module, width) => (
          <ModuleCard
            key={module.id}
            module={module}
            width={width}
            onPress={() => onModulePress(module)}
          />
        )}
      />
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function HumanManagementScreen() {
  const { colors, isDarkMode } = useTheme();
  const { navigate } = useNavigation();
  const { width } = useWindowDimensions();
  const cardWidth = (width - H_PAD * 2 - (GRID_COLS - 1) * GRID_GAP) / GRID_COLS;

  const [tab,          setTab]          = useState<Tab>('createHuman');
  const [rows,         setRows]         = useState<HumanRow[]>([]);
  const [apiColumns,   setApiColumns]   = useState<HumanColumn[]>([]);
  const [aliasMap,     setAliasMap]     = useState<Record<string, string>>({});
  const [filter,       setFilter]       = useState<Filter>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState<ModalMode>('create');
  const [selected,     setSelected]     = useState<Human | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [loadError,    setLoadError]    = useState<string | null>(null);

  const loadHumans = useCallback(async () => {
    const res = await fetchHumanList(1, 10);
    if (res.ok) {
      setRows(res.data.rows);
      setApiColumns(res.data.columns);
      setAliasMap(res.data.aliasMap);
      setLoadError(null);
    } else {
      setLoadError(res.message);
    }
  }, []);

  useEffect(() => {
    loadHumans();
  }, [loadHumans]);

  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  const countryFiltered = filter === 'All'
    ? rows
    : rows.filter(r => r.t2name === filter);

  const q = searchQuery.trim().toLowerCase();
  const filteredRows = q === ''
    ? countryFiltered
    : countryFiltered.filter(r =>
        Object.values(r).some(v =>
          typeof v === 'string' && v.toLowerCase().includes(q),
        ),
      );

  const counts: Record<Filter, number> = {
    All:         rows.length,
    'Sri Lanka': rows.filter(r => r.t2name === 'Sri Lanka').length,
    Japan:       rows.filter(r => r.t2name === 'Japan').length,
  };

  function openCreate() { setSelected(null); setModalMode('create'); setModalVisible(true); }
  function openEdit(r: HumanRow) { setSelected(mapRowToHuman(r)); setModalMode('edit'); setModalVisible(true); }
  function openView(r: HumanRow) { setSelected(mapRowToHuman(r)); setModalMode('view'); setModalVisible(true); }

  function handleDelete(r: HumanRow) {
    const name = String(r.t1fullname ?? '');
    Alert.alert('Delete Human', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setRows(p => p.filter(x => x.id !== r.id)) },
    ]);
  }

  function handleSave(_data: Omit<Human, 'id'>) {
    setModalVisible(false);
    loadHumans();
  }

  function handleQuickAccess(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  function handleModulePress(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  async function handleDashboardRefresh() {
    setRefreshing(true);
    await loadHumans();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={[styles.safe, dyn.safe]} edges={['top', 'left', 'right']}>
      <PageHeader title="Human Management" showBack={true} />

      <View style={styles.whiteSection}>
        {/* Quick Access — always */}
        <View style={styles.quickWrap}>
          <QuickAccessRow onPress={handleQuickAccess} />
        </View>

        {/* Tabs — Dashboard / Modules / Create Human */}
        <View style={[styles.tabsContainer, dyn.tabsBorder]}>
          <TabButton
            label="Dashboard"
            active={tab === 'dashboard'}
            onPress={() => setTab('dashboard')}
            dyn={dyn}
            isFirst
          />
          <TabButton
            label="Modules"
            active={tab === 'modules'}
            onPress={() => setTab('modules')}
            dyn={dyn}
          />
          <TabButton
            label="Human Create"
            active={tab === 'createHuman'}
            onPress={() => setTab('createHuman')}
            dyn={dyn}
            isLast
          />
        </View>

        {/* Content below the tabs */}
        {tab === 'dashboard' ? (
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentScrollContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleDashboardRefresh}
                tintColor="#595959"
              />
            }>
            <View style={styles.dashboardContent}>
              <DashboardView />
            </View>
          </ScrollView>
        ) : tab === 'modules' ? (
          <ModulesView onModulePress={handleModulePress} refreshing={refreshing} onRefresh={handleDashboardRefresh} />
        ) : (
          <HumanDashboardView
            counts={counts}
            filter={filter}
            setFilter={setFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenCreate={openCreate}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDelete}
            filteredRows={filteredRows}
            apiColumns={apiColumns}
            aliasMap={aliasMap}
            onRefresh={loadHumans}
            loadError={loadError}
          />
        )}

      </View>

      <HumanFormModal
        visible={modalVisible}
        mode={modalMode}
        human={selected}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </SafeAreaView>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    safe: { backgroundColor: '#5A5A5A' },
    searchBar: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#F2F2F7',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    searchInput: { color: colors.primaryText },
    tabLabel: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#8E8E93' },
    tabsBorder: { borderBottomColor: isDarkMode ? '#3A3A3C' : '#E5E5EA' },
    pillTxt: { color: isDarkMode ? 'rgba(255,255,255,0.7)' : '#5A5A62' },
  });
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  whiteSection: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
  },

  quickWrap: {
    paddingHorizontal: H_PAD,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
    backgroundColor: '#FFFFFF',
  },

  // ── Tabs ──
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: H_PAD,
    paddingVertical: 6,
    borderBottomWidth: 1,
    backgroundColor: '#FFFFFF',
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnFirst: {
    alignItems: 'flex-start',
    paddingLeft: 12,
    paddingRight: 4,
  },
  tabBtnLast: {
    alignItems: 'flex-end',
    paddingLeft: 4,
    paddingRight: 12,
  },
  tabLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  tabLabelActive: {
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    color: Colors.primaryHighlight,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -7,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primaryHighlight,
    borderRadius: 2,
  },


  dashboardContent: {
    flex: 1,
  },

  contentScroll: {
    flex: 1,
  },

  contentScrollContent: {
    flexGrow: 1,
  },
});

// ─── Dashboard tab styles (hero, stats, table section) ────────────────────────
const dv = StyleSheet.create({
  scroll: {
    paddingHorizontal: H_PAD + 6,
    paddingTop: Spacing.md,
    paddingBottom: 100,
    gap: Spacing.md,
  },

  // Hero create card
  hero: {
    backgroundColor: '#595959',
    borderRadius: 22,
    paddingVertical: 22,
    paddingHorizontal: 20,
    overflow: 'hidden',
    shadowColor: '#595959',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  heroOrbA: {
    position: 'absolute',
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.12)',
    top: -60, right: -40,
  },
  heroOrbB: {
    position: 'absolute',
    width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.08)',
    bottom: -50, left: -20,
  },
  heroIconOuter: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  heroHead: { position: 'absolute', top: 10, width: 14, height: 14, borderRadius: 7, backgroundColor: '#FFF' },
  heroBody: { position: 'absolute', bottom: 10, width: 24, height: 12, borderTopLeftRadius: 12, borderTopRightRadius: 12, backgroundColor: '#FFF' },
  heroPlus: {
    position: 'absolute',
    bottom: 2, right: 2,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroPlusH: { position: 'absolute', width: 8, height: 2, borderRadius: 1, backgroundColor: Colors.primaryHighlight },
  heroPlusV: { position: 'absolute', width: 2, height: 8, borderRadius: 1, backgroundColor: Colors.primaryHighlight },
  heroTextBlock: { flex: 1 },
  heroTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 3,
  },
  heroSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 15,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  ctaPressed: { opacity: 0.88, transform: [{ scale: 0.97 }] },
  ctaIcon: { width: 12, height: 12, alignItems: 'center', justifyContent: 'center' },
  ctaIconH: { position: 'absolute', width: 10, height: 2, borderRadius: 1, backgroundColor: Colors.primaryHighlight },
  ctaIconV: { position: 'absolute', width: 2, height: 10, borderRadius: 1, backgroundColor: Colors.primaryHighlight },
  ctaTxt: {
    fontFamily: FontFamily.bold,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primaryHighlight,
  },

  // Section header
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: Spacing.xs,
  },
  sectionAccent: {
    width: 3, height: 14, borderRadius: 2,
    backgroundColor: Colors.primaryHighlight,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: '700',
  },
  sectionCount: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },

  // Filter pills
  pillRow: {
    flexDirection: 'row',
    gap: 8,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#FFF',
    borderColor: Colors.primaryHighlight,
  },
  pillTxt: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    fontWeight: '500',
  },
  pillTxtActive: {
    color: Colors.primaryHighlight,
    fontFamily: FontFamily.bold,
    fontWeight: '700',
  },
  pillBadge: {
    backgroundColor: '#E0E0E8',
    borderRadius: 8,
    paddingHorizontal: 5,
    minWidth: 16,
    alignItems: 'center',
  },
  pillBadgeActive: {
    backgroundColor: Colors.primaryHighlight,
  },
  pillBadgeTxt: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
  },
  pillBadgeTxtActive: {
    color: '#FFF',
  },

  // Search wrapper with add button
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    paddingVertical: 0,
  },
  clearBtn: {
    width: 18, height: 18,
    borderRadius: 9,
    backgroundColor: '#E0E0E8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearX1: { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '45deg' }] },
  clearX2: { position: 'absolute', width: 9, height: 1.5, borderRadius: 1, transform: [{ rotate: '-45deg' }] },
  addBtn: {
    width: 36, height: 36, borderRadius: 8,
    backgroundColor: '#595959',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnPressed: { opacity: 0.8, transform: [{ scale: 0.95 }] },
  addBtnIcon: { position: 'absolute', width: 14, height: 2, borderRadius: 1, backgroundColor: '#FFF' },
  addBtnIconV: { position: 'absolute', width: 2, height: 14, borderRadius: 1, backgroundColor: '#FFF' },

  // Refresh button
  refreshBtn: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#595959',
    borderRadius: 20,
    shadowColor: '#595959',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  refreshBtnPressed: {
    opacity: 0.85,
  },
  refreshIcon: {
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshArrow: {
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderColor: '#FFFFFF',
    borderRadius: 2,
    transform: [{ rotate: '-45deg' }],
  },
  refreshText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  errorBanner: {
    backgroundColor: 'rgba(233,30,99,0.08)',
    borderColor: 'rgba(233,30,99,0.25)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  errorTxt: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.primaryHighlight,
  },
});

// ─── Human table cell styles ──────────────────────────────────────────────────
const cell = StyleSheet.create({
  idxText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#FFF' },
  nameBlock: { flex: 1, gap: 2 },
  nameText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '500' },
  countryBadge: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  badgeSL: { backgroundColor: 'rgba(89,89,89,0.1)' },
  badgeJP: { backgroundColor: 'rgba(89,89,89,0.08)' },
  countryTxt: { fontFamily: FontFamily.bold, fontSize: 8, fontWeight: '700', letterSpacing: 0.5, color: '#595959' },

  metaText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, fontWeight: '500' },
  metaSub:  { fontFamily: FontFamily.regular, fontSize: 9, marginTop: 1 },
});
