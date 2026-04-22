import React, { useState, useMemo, useRef } from 'react';
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
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { MODULES } from '../../constants/modules';
import type { AppModule } from '../../constants/modules';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { Country, Human } from '../../types/hr';

let nextId = 1;
const genId = () => String(nextId++);

const H_PAD = 6;
const GRID_GAP = 10;
const GRID_COLS = 3;

type Tab = 'dashboard' | 'modules' | 'createHuman';
type Filter = 'All' | Country;
const FILTERS: Filter[] = ['All', 'Sri Lanka', 'Japan'];
const AVATAR_COLORS = ['#595959', '#6B6B6B', '#7D7D7D', '#8E8E8E', '#A0A0A0', '#606060'];

//  Action icons
function EyeIcon()  { return <View style={ai.wrap}><View style={ai.eyeOval}/><View style={ai.eyeDot}/></View>; }
function EditIcon() { return <View style={ai.wrap}><View style={ai.penBody}/><View style={ai.penLine}/></View>; }
function TrashIcon(){ return <View style={ai.wrap}><View style={ai.lidBar}/><View style={ai.binBody}/><View style={ai.binL}/><View style={ai.binR}/></View>; }
function RefreshIcon() { return <View style={ai.wrap}><View style={ai.refreshArrow}/></View>; }

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

//  Table row 
function TableRow({ human, index, onView, onEdit, onDelete }: { human: Human; index: number; onView(): void; onEdit(): void; onDelete(): void }) {
  const { colors } = useTheme();
  const initial = human.fullName.charAt(0).toUpperCase();
  const isEven  = index % 2 === 0;
  const isSL    = human.country === 'Sri Lanka';

  return (
    <View style={[tr.row, isEven && tr.rowEven]}>
      <View style={tr.colIdx}><Text style={[tr.idxText, { color: colors.placeholder }]}>{index + 1}</Text></View>

      <View style={tr.colName}>
        <View style={[tr.avatar, { backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }]}>
          <Text style={tr.avatarTxt}>{initial}</Text>
        </View>
        <View style={tr.nameBlock}>
          <Text style={[tr.nameText, { color: colors.primaryText }]} numberOfLines={1}>
            {human.title ? `${human.title} ` : ''}{human.fullName}
          </Text>
          <View style={[tr.countryBadge, isSL ? tr.badgeSL : tr.badgeJP]}>
            <Text style={[tr.countryTxt, isSL ? tr.countryTxtSL : tr.countryTxtJP]}>
              {isSL ? 'SL' : 'JP'}
            </Text>
          </View>
        </View>
      </View>

      <View style={tr.colMeta}>
        <Text style={[tr.metaText, { color: colors.primaryText }]} numberOfLines={1}>
          {isSL ? (human.dateOfBirth ?? '—') : (human.prefecture ?? '—')}
        </Text>
        <Text style={[tr.metaSub, { color: colors.placeholder }]} numberOfLines={1}>
          {isSL ? (human.gender ?? '') : (human.city ?? '')}
        </Text>
      </View>

      <View style={tr.colActions}>
        <Pressable onPress={onView}   style={[tr.btn, tr.btnView]}   hitSlop={6}><EyeIcon /></Pressable>
        <Pressable onPress={onEdit}   style={[tr.btn, tr.btnEdit]}   hitSlop={6}><EditIcon /></Pressable>
        <Pressable onPress={onDelete} style={[tr.btn, tr.btnDelete]} hitSlop={6}><TrashIcon /></Pressable>
      </View>
    </View>
  );
}

//  Empty state within the table 
function TableEmpty({ query, filter, onClear }: { query: string; filter: Filter; onClear(): void }) {
  const { colors } = useTheme();
  const isSearch = query.trim().length > 0;

  return (
    <View style={es.wrap}>
      <View style={es.iconCircle}>
        <View style={es.head}/>
        <View style={es.body}/>
      </View>
      <Text style={[es.title, { color: colors.primaryText }]}>
        {isSearch
          ? 'No matching records'
          : filter === 'All'
            ? 'No humans yet'
            : `No ${filter} records`}
      </Text>
      <Text style={[es.sub, { color: colors.placeholder }]}>
        {isSearch
          ? `Nothing matched "${query}"`
          : 'Tap the + button or "Create Human" to add your first record'}
      </Text>
      {isSearch && (
        <Pressable onPress={onClear} style={({ pressed }) => [es.clearBtn, pressed && { opacity: 0.75 }]}>
          <Text style={[es.clearTxt, { color: Colors.primaryHighlight }]}>Clear search</Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Dashboard tab content: Human creates come in here ────────────────────────
function HumanDashboardView({
  counts,
  humans,
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  onOpenCreate,
  onView,
  onEdit,
  onDelete,
  filtered,
  onRefresh,
}: {
  counts: Record<Filter, number>;
  humans: Human[];
  filter: Filter;
  setFilter: (f: Filter) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenCreate: () => void;
  onView: (h: Human) => void;
  onEdit: (h: Human) => void;
  onDelete: (h: Human) => void;
  filtered: Human[];
}) {
  const { colors, isDarkMode } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);
  const [refreshing, setRefreshing] = useState(false);
  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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

        {/* Table — always visible with default structure */}
        <View style={dv.tableWrap}>
          <View style={[th.row, dyn.tableHeader]}>
            <View style={th.colIdx}><Text style={[th.txt, dyn.headerTxt]}>#</Text></View>
            <View style={th.colName}><Text style={[th.txt, dyn.headerTxt]}>Name · Country</Text></View>
            <View style={th.colMeta}>
              <Text style={[th.txt, dyn.headerTxt]}>
                {filter === 'Japan' ? 'Prefecture' : 'DOB / Gender'}
              </Text>
            </View>
            <View style={th.colActions}>
              <Text style={[th.txt, dyn.headerTxt, { textAlign: 'center' }]}>Actions</Text>
            </View>
          </View>

          {filtered.length === 0 ? (
            <TableEmpty query={searchQuery} filter={filter} onClear={() => setSearchQuery('')} />
          ) : (
            filtered.map((item, index) => (
              <TableRow
                key={item.id}
                human={item}
                index={index}
                onView={() => onView(item)}
                onEdit={() => onEdit(item)}
                onDelete={() => onDelete(item)}
              />
            ))
          )}
        </View>
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

  const [tab,          setTab]          = useState<Tab>('dashboard');
  const [humans,       setHumans]       = useState<Human[]>([]);
  const [filter,       setFilter]       = useState<Filter>('All');
  const [searchQuery,  setSearchQuery]  = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode,    setModalMode]    = useState<ModalMode>('create');
  const [selected,     setSelected]     = useState<Human | null>(null);
  const [refreshing,   setRefreshing]   = useState(false);

  const dyn = useMemo(() => createDynamicStyles(colors, isDarkMode), [colors, isDarkMode]);

  const countryFiltered = filter === 'All' ? humans : humans.filter(h => h.country === filter);

  const q = searchQuery.trim().toLowerCase();
  const filtered = q === ''
    ? countryFiltered
    : countryFiltered.filter(h =>
        [h.fullName, h.firstName, h.surname, h.otherName, h.title,
         h.nic, h.dateOfBirth, h.gender, h.district, h.gnDivision,
         h.province, h.prefecture, h.city, h.townDistrict]
          .some(v => v?.toLowerCase().includes(q)),
      );

  const counts: Record<Filter, number> = {
    All:         humans.length,
    'Sri Lanka': humans.filter(h => h.country === 'Sri Lanka').length,
    Japan:       humans.filter(h => h.country === 'Japan').length,
  };

  function openCreate() { setSelected(null); setModalMode('create'); setModalVisible(true); }
  function openEdit(h: Human)   { setSelected(h); setModalMode('edit');   setModalVisible(true); }
  function openView(h: Human)   { setSelected(h); setModalMode('view');   setModalVisible(true); }

  function handleDelete(h: Human) {
    Alert.alert('Delete Human', `Remove "${h.fullName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setHumans(p => p.filter(x => x.id !== h.id)) },
    ]);
  }

  function handleSave(data: Omit<Human, 'id'>) {
    if (modalMode === 'create') setHumans(p => [...p, { ...data, id: genId() }]);
    else setHumans(p => p.map(x => x.id === selected?.id ? { ...data, id: x.id } : x));
    setModalVisible(false);
  }

  function handleQuickAccess(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  function handleModulePress(module: AppModule) {
    navigate('ModuleDetail', { moduleId: module.id });
  }

  function handleDashboardRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
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
            humans={humans}
            filter={filter}
            setFilter={setFilter}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onOpenCreate={openCreate}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDelete}
            filtered={filtered}
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
    tableHeader: {
      backgroundColor: isDarkMode ? '#1F1F22' : '#FAFAFC',
      borderBottomColor: isDarkMode ? '#3A3A3C' : '#E8E8F0',
    },
    headerTxt: { color: isDarkMode ? 'rgba(255,255,255,0.55)' : '#6B6B70' },
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

  // Table wrap
  tableWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
});

// ─── Table header ─────────────────────────────────────────────────────────────
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
  colIdx:    { width: 28 },
  colName:   { flex: 1 },
  colMeta:   { width: 80 },
  colActions:{ width: 96 },
});

// ─── Table row ────────────────────────────────────────────────────────────────
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
  colIdx:  { width: 28 },
  colName: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  colMeta: { width: 80 },
  colActions: { width: 96, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4 },

  idxText: { fontFamily: FontFamily.regular, fontSize: FontSize.xs },
  avatar:  { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarTxt: { fontFamily: FontFamily.bold, fontSize: 11, fontWeight: '700', color: '#FFF' },
  nameBlock: { flex: 1, gap: 2 },
  nameText: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, fontWeight: '500' },
  countryBadge: { alignSelf: 'flex-start', borderRadius: 4, paddingHorizontal: 5, paddingVertical: 1 },
  badgeSL: { backgroundColor: 'rgba(89,89,89,0.1)' },
  badgeJP: { backgroundColor: 'rgba(89,89,89,0.08)' },
  countryTxt: { fontFamily: FontFamily.bold, fontSize: 8, fontWeight: '700', letterSpacing: 0.5 },
  countryTxtSL: { color: '#595959' },
  countryTxtJP: { color: '#595959' },

  metaText: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, fontWeight: '500' },
  metaSub:  { fontFamily: FontFamily.regular, fontSize: 9, marginTop: 1 },

  btn: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  btnView:   { backgroundColor: 'rgba(89,89,89,0.1)' },
  btnEdit:   { backgroundColor: 'rgba(89,89,89,0.1)' },
  btnDelete: { backgroundColor: 'rgba(89,89,89,0.12)' },
});

// ─── Empty state in table ─────────────────────────────────────────────────────
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

// ─── Icon primitives ──────────────────────────────────────────────────────────
const ai = StyleSheet.create({
  wrap: { width: 14, height: 14, alignItems: 'center', justifyContent: 'center' },
  eyeOval: { position: 'absolute', width: 14, height: 9, borderRadius: 5, borderWidth: 1.5, borderColor: '#595959' },
  eyeDot:  { width: 5, height: 5, borderRadius: 3, backgroundColor: '#595959' },
  penBody: { position: 'absolute', width: 9, height: 3, backgroundColor: '#595959', borderRadius: 1, transform: [{ rotate: '-45deg' }], top: 2, left: 1 },
  penLine: { position: 'absolute', bottom: 0, width: 8, height: 1.5, backgroundColor: '#595959', borderRadius: 1 },
  lidBar:  { position: 'absolute', top: 0, width: 12, height: 2, borderRadius: 1, backgroundColor: '#595959' },
  binBody: { position: 'absolute', bottom: 0, width: 10, height: 10, borderBottomLeftRadius: 2, borderBottomRightRadius: 2, borderWidth: 1.5, borderColor: '#595959', borderTopWidth: 0 },
  binL:    { position: 'absolute', bottom: 2, left: 4, width: 1.5, height: 6, backgroundColor: '#595959', borderRadius: 1 },
  binR:    { position: 'absolute', bottom: 2, right: 4, width: 1.5, height: 6, backgroundColor: '#595959', borderRadius: 1 },
  refreshArrow: { width: 12, height: 12, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#FFFFFF', borderRadius: 2, transform: [{ rotate: '-45deg' }] },
});
