import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { DashboardView } from '../../components/dashboard/DashboardView';
import { UIIcon } from '../../components/common/UIIcon';
import { HumanFormModal, ModalMode } from '../../components/hr/HumanFormModal';
import { TableIcons } from '../../components/common/DataTable';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { Country, Human } from '../../types/hr';
import { fetchHumanList, HumanRow } from '../../api/humanApi';


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

type Tab = 'dashboard' | 'modules';
type PageTab = 'createHuman' | 'createHuman2';

const PAGE_TABS: { key: PageTab; label: string }[] = [
  { key: 'createHuman',  label: 'Create Human'   },
  { key: 'createHuman2', label: 'Create Human 2'  },
];
type Filter = 'All' | Country;
const FILTERS: Filter[] = ['All', 'Sri Lanka', 'Japan'];
const AVATAR_COLORS = ['#595959', '#6B6B6B', '#7D7D7D', '#8E8E8E', '#A0A0A0', '#606060'];

function calcHumanHealth(human: Human): number {
  const isSL = human.country === 'Sri Lanka';
  const fields = isSL
    ? [human.country, human.nic, human.dateOfBirth, human.gender,
       human.title, human.fullName, human.surname, human.firstName,
       human.province, human.district, human.gnDivision]
    : [human.country, human.title, human.fullName, human.surname,
       human.firstName, human.prefecture, human.city, human.townDistrict];
  return Math.round((fields.filter(Boolean).length / fields.length) * 100);
}

function humanRingColor(pct: number): string {
  if (pct < 25) return '#E53935';
  if (pct < 50) return '#FB8C00';
  if (pct < 75) return '#FDD835';
  return '#30A84B';
}

function humanBadgeBg(pct: number): string {
  if (pct < 25) return 'rgba(229,57,53,0.12)';
  if (pct < 50) return 'rgba(251,140,0,0.12)';
  if (pct < 75) return 'rgba(253,216,53,0.15)';
  return 'rgba(48,168,75,0.12)';
}

function humanTextColor(pct: number): string {
  if (pct < 25) return '#B71C1C';
  if (pct < 50) return '#E65100';
  if (pct < 75) return '#F57F17';
  return '#2E7D32';
}

// ─── Human card components ───────────────────────────────────────────────────
function InfoChip({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={hc.chip}>
      <Text style={hc.chipLabel}>{label}</Text>
      <Text style={[hc.chipValue, { color: colors.primaryText }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function HumanCard({
  row,
  index,
  onView,
  onEdit,
  onDelete,
}: {
  row: HumanRow;
  index: number;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { colors, isDarkMode } = useTheme();
  const human = mapRowToHuman(row);
  const initial = (human.fullName || '?').charAt(0).toUpperCase();
  const isSL = human.country === 'Sri Lanka';
  const avatarBg = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const pct       = calcHumanHealth(human);
  const ringColor = humanRingColor(pct);
  const dob = human.dateOfBirth
    ? human.dateOfBirth.split('T')[0].split(' ')[0]
    : '—';

  return (
    <View style={[hc.card, isDarkMode && hc.cardDark]}>
      {/* Left accent bar */}
      <View style={[hc.accent, { backgroundColor: '#595959' }]} />

      <View style={hc.inner}>
        {/* Header row */}
        <View style={hc.header}>
          <View style={hc.avatarWrap}>
            <View style={[hc.avatarRing, { borderColor: ringColor }]}>
              <View style={[hc.avatar, { backgroundColor: avatarBg }]}>
                <Text style={hc.avatarTxt}>{initial}</Text>
              </View>
            </View>
            <View style={[hc.pctBadge, { backgroundColor: humanBadgeBg(pct) }]}>
              <Text style={[hc.pctTxt, hc.pctLabel, { color: humanTextColor(pct) }]}>Health </Text>
              <Text style={[hc.pctTxt, { color: humanTextColor(pct) }]}>{pct}%</Text>
            </View>
          </View>
          <View style={hc.nameBlock}>
            <Text style={[hc.name, { color: colors.primaryText }]} numberOfLines={1}>
              {human.fullName || '—'}
            </Text>
            <View style={[hc.badge, isSL ? hc.badgeSL : hc.badgeJP]}>
              <Text style={[hc.badgeTxt, { color: isSL ? '#2E7D32' : '#B71C1C' }]}>
                {isSL ? 'Sri Lanka' : 'Japan'}
              </Text>
            </View>
          </View>
          <Text style={[hc.idx, { color: colors.placeholder }]}>#{index + 1}</Text>
        </View>

        {/* Divider */}
        <View style={[hc.divider, { backgroundColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]} />

        {/* Meta chips row */}
        <View style={hc.chips}>
          <InfoChip label="Gender"  value={human.gender ?? '—'} />
          <View style={[hc.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <InfoChip label="DOB"     value={dob} />
          <View style={[hc.chipSep, { backgroundColor: isDarkMode ? '#2C2C2E' : '#EBEBF0' }]} />
          <InfoChip label="NIC"     value={human.nic ?? '—'} />
        </View>

        {/* Actions */}
        <View style={[hc.actions, { borderTopColor: isDarkMode ? '#2C2C2E' : '#F0F0F5' }]}>
          <Pressable onPress={onView}   style={({ pressed }) => [hc.btn, hc.btnView,   pressed && hc.btnPressed]} hitSlop={4}>
            <TableIcons.Eye />
            <Text style={hc.btnTxt}>View</Text>
          </Pressable>
          <Pressable onPress={onEdit}   style={({ pressed }) => [hc.btn, hc.btnEdit,   pressed && hc.btnPressed]} hitSlop={4}>
            <TableIcons.Edit />
            <Text style={hc.btnTxt}>Edit</Text>
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable onPress={onDelete} style={({ pressed }) => [hc.btn, hc.btnDelete, pressed && hc.btnPressed]} hitSlop={4}>
            <TableIcons.Trash />
            <Text style={hc.btnDelTxt}>Delete</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ─── Page tab bar ────────────────────────────────────────────────────────────
function PageTabBar({ active, onChange }: { active: PageTab; onChange: (t: PageTab) => void }) {
  return (
    <View style={pt.bar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={pt.barContent}>
        {PAGE_TABS.map(({ key, label }, idx) => {
          const isActive = active === key;
          return (
            <Pressable
              key={key}
              onPress={() => onChange(key)}
              style={({ pressed }) => [pt.tab, pressed && pt.tabPressed]}>
              <View style={pt.tabInner}>
                <Text style={[pt.label, isActive && pt.labelActive]}>{label}</Text>
                <View style={[pt.badge, isActive && pt.badgeActive]}>
                  <Text style={[pt.badgeText, isActive && pt.badgeTextActive]}>
                    {idx + 1}
                  </Text>
                </View>
              </View>
              {isActive && <View style={pt.indicator} />}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─── Create Human 2 placeholder ──────────────────────────────────────────────
function CreateHuman2View() {
  const { colors } = useTheme();
  return (
    <View style={ph.wrap}>
      <View style={ph.iconCircle}>
        <View style={ph.iconHead} />
        <View style={ph.iconBody} />
        <View style={ph.iconPlus}>
          <View style={ph.plusH} />
          <View style={ph.plusV} />
        </View>
      </View>
      <Text style={[ph.title, { color: colors.primaryText }]}>Create Human 2</Text>
      <Text style={[ph.sub, { color: colors.placeholder }]}>This section is under construction.</Text>
    </View>
  );
}

// ─── Dashboard tab content ────────────────────────────────────────────────────
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
  loading,
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
  loading: boolean;
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

        {/* Section Title */}
        <View style={dv.sectionHeader}>
          <Text style={[dv.sectionTitle, { color: colors.primaryText }]}>Create Human</Text>
        </View>

        {/* Search and Filters Container */}
        <View style={dv.searchFilterContainer}>
          {/* Search with Add button and Filters */}
          <View style={dv.searchAndFilterRow}>
            {/* Search with Add button */}
            <View style={[dv.searchWrapper, dyn.searchWrapper]}>
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
          </View>
        </View>

        {loadError && (
          <View style={dv.errorBanner}>
            <Text style={dv.errorTxt}>{loadError}</Text>
          </View>
        )}

        {/* Card list */}
        {loading ? (
          <View style={hc.emptyWrap}>
            <ActivityIndicator size="large" color={Colors.primaryHighlight} />
            <Text style={[hc.emptySubText, { color: colors.placeholder, marginTop: 12 }]}>
              Loading records…
            </Text>
          </View>
        ) : filteredRows.length === 0 ? (
          <View style={hc.emptyWrap}>
            <View style={hc.emptyIcon}>
              <View style={hc.emptyHead} />
              <View style={hc.emptyBody} />
            </View>
            <Text style={[hc.emptyTitle, { color: colors.primaryText }]}>
              {searchQuery.trim() ? 'No matches found'
                : filter === 'All' ? 'No humans yet' : `No ${filter} records`}
            </Text>
            <Text style={[hc.emptySubText, { color: colors.placeholder }]}>
              {searchQuery.trim()
                ? `Nothing matched "${searchQuery}"`
                : 'Tap + to add your first record'}
            </Text>
            {searchQuery.trim().length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={hc.clearBtn}>
                <Text style={hc.clearBtnTxt}>Clear search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <View style={hc.list}>
            {filteredRows.map((row, idx) => (
              <HumanCard
                key={String(row.id)}
                row={row}
                index={idx}
                onView={() => onView(row)}
                onEdit={() => onEdit(row)}
                onDelete={() => onDelete(row)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function HumanManagementScreen() {
  const { colors, isDarkMode } = useTheme();
  const { navigate } = useNavigation();

  const [tab,          setTab]          = useState<Tab>('modules');
  const [pageTab,      setPageTab]      = useState<PageTab>('createHuman');
  const [rows,         setRows]         = useState<HumanRow[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState<Filter>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState<ModalMode>('create');
  const [selected,     setSelected]     = useState<Human | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);
  const [loadError,    setLoadError]    = useState<string | null>(null);

  const loadHumans = useCallback(async () => {
    setLoading(true);
    const res = await fetchHumanList(1, 100);
    if (res.ok) {
      setRows(res.data.rows);
      setLoadError(null);
    } else {
      setLoadError(res.message);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadHumans();
  }, [loadHumans]);

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


  async function handleDashboardRefresh() {
    setRefreshing(true);
    await loadHumans();
    setRefreshing(false);
  }

  return (
    <>
      <SubModuleLayout parentModuleId="1"
        title="Human Management"
        showBack={true}
        activeTab={tab}
        onTabChange={setTab}
        onModulePress={handleQuickAccess}
        showSubmodulesTab={false}
        showSubTab={true}
        subTabLabel="Create Human"
      >
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
        ) : (
          <View style={{ flex: 1 }}>
            <PageTabBar active={pageTab} onChange={setPageTab} />
            {pageTab === 'createHuman' ? (
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
                loading={loading}
                onRefresh={loadHumans}
                loadError={loadError}
              />
            ) : (
              <CreateHuman2View />
            )}
          </View>
        )}
      </SubModuleLayout>

      <HumanFormModal
        visible={modalVisible}
        mode={modalMode}
        human={selected}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
      />
    </>
  );
}

function createDynamicStyles(colors: any, isDarkMode: boolean) {
  return StyleSheet.create({
    safe: { backgroundColor: '#5A5A5A' },
    searchBar: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      borderColor: isDarkMode ? '#3A3A3C' : '#E5E5EA',
    },
    searchInput: { color: colors.primaryText },
    searchWrapper: {
      backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    },
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
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 100,
    gap: 0,
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

  // Section header with title
  sectionHeader: {
    paddingHorizontal: Spacing.md,
    paddingTop: 0,
    paddingBottom: 2,
  },

  // Search and Filter Container
  searchFilterContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    gap: 0,
    backgroundColor: 'transparent',
    marginHorizontal: 0,
    marginVertical: 0,
  },

  // Search and Filter Row - combine on same line
  searchAndFilterRow: {
    flexDirection: 'column',
    gap: 6,
  },

  // Filter pills
  pillRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 0,
    paddingVertical: 0,
    marginBottom: 0,
    marginTop: 0,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: 'transparent',
  },
  pillActive: {
    backgroundColor: '#E91E63',
    borderColor: 'transparent',
  },
  pillTxt: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    fontWeight: '500',
  },
  pillTxtActive: {
    color: '#FFFFFF',
    fontFamily: FontFamily.bold,
    fontWeight: '600',
  },
  pillBadge: {
    backgroundColor: '#D0D0D0',
    borderRadius: 8,
    paddingHorizontal: 5,
    minWidth: 16,
    alignItems: 'center',
  },
  pillBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  pillBadgeTxt: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    fontWeight: '600',
    color: '#666666',
  },
  pillBadgeTxtActive: {
    color: '#FFF',
    fontWeight: '700',
  },

  // Search wrapper with add button
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 0,
    marginHorizontal: 0,
    marginTop: 0,
    paddingVertical: 4,
    paddingHorizontal: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 0,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: 'transparent',
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
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: '#E91E63',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 0,
    shadowColor: 'transparent',
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
    marginHorizontal: Spacing.md,
    marginBottom: 2,
    marginTop: 2,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  errorTxt: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.primaryHighlight,
  },
});

// ─── Human card styles ────────────────────────────────────────────────────────
const hc = StyleSheet.create({
  // Card list
  list: {
    paddingHorizontal: Spacing.md,
    paddingTop: 8,
    paddingBottom: 28,
    gap: 10,
  },

  // Card shell
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EAEAF0',
    shadowColor: '#8888AA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  cardDark: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2A2A2C',
  },
  accent: { width: 4 },
  inner:  { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 10,
    gap: 12,
  },
  avatarWrap: { alignItems: 'center', gap: 4, flexShrink: 0 },
  avatarRing: { width: 52, height: 52, borderRadius: 26, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  avatar:     { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pctBadge:   { flexDirection: 'row', alignItems: 'center', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 2, backgroundColor: 'rgba(48,168,75,0.12)' },
  pctTxt:     { fontFamily: FontFamily.bold, fontSize: 7, fontWeight: '700', color: '#2E7D32' },
  pctLabel:   { fontStyle: 'italic', fontWeight: '400' },
  avatarTxt: {
    fontFamily: FontFamily.bold,
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameBlock: { flex: 1, gap: 4 },
  name: {
    fontFamily: FontFamily.bold,
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 20,
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeSL: { backgroundColor: 'rgba(56,142,60,0.12)' },
  badgeJP: { backgroundColor: 'rgba(198,40,40,0.10)' },
  badgeTxt: {
    fontFamily: FontFamily.medium,
    fontSize: 10,
    fontWeight: '600',
  },
  idx: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginTop: 2,
  },

  // Divider
  divider: { height: 1 },

  // Meta chips
  chips: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  chip: { flex: 1, gap: 4 },
  chipLabel: {
    fontFamily: FontFamily.regular,
    fontSize: 9,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    color: '#9090A0',
  },
  chipValue: {
    fontFamily: FontFamily.medium,
    fontSize: 12,
    fontWeight: '600',
  },
  chipSep: { width: 1, height: 34, marginHorizontal: 10 },

  // Actions footer
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  btnView:    { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnEdit:    { backgroundColor: 'rgba(89,89,89,0.08)' },
  btnDelete:  { backgroundColor: 'rgba(233,30,99,0.08)' },
  btnPressed: { opacity: 0.7, transform: [{ scale: 0.97 }] },
  btnTxt: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    fontWeight: '600',
    color: '#595959',
  },
  btnDelTxt: {
    fontFamily: FontFamily.medium,
    fontSize: 11,
    fontWeight: '600',
    color: '#E91E63',
  },

  // Empty / loading state
  emptyWrap: {
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: Spacing.xl,
    gap: 8,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(89,89,89,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyHead: {
    position: 'absolute',
    top: 12,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(89,89,89,0.25)',
  },
  emptyBody: {
    position: 'absolute',
    bottom: 12,
    width: 26,
    height: 14,
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    backgroundColor: 'rgba(89,89,89,0.25)',
  },
  emptyTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubText: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  clearBtn: {
    marginTop: 8,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primaryHighlight,
  },
  clearBtnTxt: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    fontWeight: '700',
    color: Colors.primaryHighlight,
  },
});

// ─── Page tab bar styles ──────────────────────────────────────────────────────
const pt = StyleSheet.create({
  bar: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
    flexShrink: 0,
  },
  barContent: {
    flexDirection: 'row',
    paddingHorizontal: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    alignItems: 'center',
    position: 'relative',
  },
  tabPressed: {
    opacity: 0.55,
  },
  tabInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#ACACB8',
  },
  labelActive: {
    fontFamily: FontFamily.bold,
    fontWeight: '700',
    color: Colors.primaryHighlight,
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EBEBF0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  badgeActive: {
    backgroundColor: 'rgba(233,30,99,0.12)',
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    fontWeight: '700',
    color: '#ACACB8',
  },
  badgeTextActive: {
    color: Colors.primaryHighlight,
  },
  indicator: {
    position: 'absolute',
    bottom: 0,
    left: 10,
    right: 10,
    height: 3,
    borderRadius: 3,
    backgroundColor: Colors.primaryHighlight,
  },
});

// ─── Create Human 2 placeholder styles ───────────────────────────────────────
const ph = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
    gap: 10,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(233,30,99,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconHead: {
    position: 'absolute',
    top: 14,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(233,30,99,0.35)',
  },
  iconBody: {
    position: 'absolute',
    bottom: 14,
    width: 28,
    height: 14,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: 'rgba(233,30,99,0.35)',
  },
  iconPlus: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.primaryHighlight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusH: {
    position: 'absolute',
    width: 9,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  plusV: {
    position: 'absolute',
    width: 2,
    height: 9,
    borderRadius: 1,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: '700',
    textAlign: 'center',
  },
  sub: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});
