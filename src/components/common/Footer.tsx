import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { useSearch } from '../../context/SearchContext';
import { ProfileSheet } from '../dashboard/ProfileSheet';
import { Colors, Spacing, FontFamily, FontSize, FontWeight } from '../../constants/theme';

interface FooterItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  active?: boolean;
}

function FooterTabItem({ icon, label, onPress, active }: FooterItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.tabItem, pressed && styles.tabItemPressed]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={active ? Colors.primaryHighlight : '#8E8E93'}
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

// ── Search result row ──────────────────────────────────────────────────────────
function ResultRow({
  title,
  description,
  onPress,
}: {
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.resultRow, pressed && styles.resultRowPressed]}>
      <View style={styles.resultIcon}>
        <MaterialCommunityIcons name="puzzle-outline" size={18} color={Colors.primaryHighlight} />
      </View>
      <View style={styles.resultText}>
        <Text style={styles.resultTitle} numberOfLines={1}>{title}</Text>
        {!!description && (
          <Text style={styles.resultDesc} numberOfLines={1}>{description}</Text>
        )}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color="#C0C0C8" />
    </Pressable>
  );
}

// ── Search Modal ───────────────────────────────────────────────────────────────
function SearchModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { searchQuery, setSearchQuery, searchResults, isSearching } = useSearch();
  const { navigate } = useNavigation();

  function handleSelect(moduleId?: string) {
    if (moduleId) navigate('ModuleDetail', { moduleId });
    setSearchQuery('');
    onClose();
  }

  function handleClose() {
    setSearchQuery('');
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}>

      <KeyboardAvoidingView
        style={styles.modalWrap}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>

        {/* ── Search container pushed down from the very top ── */}
        <View style={styles.searchContainer}>

        {/* ── Header panel (matches PageHeader style) ── */}
        <View style={styles.searchHeader}>

          {/* Brand row */}
          <View style={styles.brandRow}>
            <View style={styles.brandLogoCircle}>
              <MaterialCommunityIcons name="magnify" size={18} color={Colors.primaryHighlight} />
            </View>
            <View>
              <Text style={styles.brandTitle}>Search</Text>
              <Text style={styles.brandSub}>Find modules, records & more</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
              hitSlop={12}>
              <View style={styles.xL} />
              <View style={styles.xR} />
            </Pressable>
          </View>

          {/* Search input */}
          <View style={styles.inputWrap}>
            <MaterialCommunityIcons name="magnify" size={18} color="rgba(255,255,255,0.6)" style={{ marginLeft: 4 }} />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search everything..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              style={styles.input}
              autoFocus
              returnKeyType="search"
              selectionColor={Colors.primaryHighlight}
            />
            {searchQuery.trim() !== '' && (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={10}>
                <MaterialCommunityIcons name="close-circle" size={16} color="rgba(255,255,255,0.5)" />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Results panel ── */}
        <View style={styles.resultsPanel}>
          {isSearching ? (
            <View style={styles.centred}>
              <ActivityIndicator color={Colors.primaryHighlight} />
            </View>
          ) : searchQuery.trim() === '' ? (
            <View style={styles.centred}>
              <MaterialCommunityIcons name="magnify" size={44} color="#D0D0D8" />
              <Text style={styles.hintTitle}>Start typing to search</Text>
              <Text style={styles.hintSub}>Modules, records and more</Text>
            </View>
          ) : searchResults.length === 0 ? (
            <View style={styles.centred}>
              <MaterialCommunityIcons name="magnify-close" size={44} color="#D0D0D8" />
              <Text style={styles.hintTitle}>No results found</Text>
              <Text style={styles.hintSub}>Try a different keyword</Text>
            </View>
          ) : (
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 24 }}>
              <Text style={styles.countLabel}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
              </Text>
              {searchResults.slice(0, 8).map(r => (
                <ResultRow
                  key={r.id}
                  title={r.title}
                  description={r.description}
                  onPress={() => handleSelect(r.moduleId)}
                />
              ))}
            </ScrollView>
          )}
        </View>

        </View>{/* end searchContainer */}

        {/* Tap-to-dismiss backdrop */}
        <Pressable style={styles.backdrop} onPress={handleClose} />

      </KeyboardAvoidingView>
    </Modal>
  );
}

// ── Footer ─────────────────────────────────────────────────────────────────────
export function Footer() {
  const { colors } = useTheme();
  const { navigate, currentScreen } = useNavigation();
  const { user, logout } = useAuth();
  const { isSearchVisible, setIsSearchVisible } = useSearch();
  const [showProfile, setShowProfile] = useState(false);
  const dyn = useMemo(() => createDynamicStyles(colors), [colors]);

  const isDashboard = currentScreen === 'Dashboard';

  return (
    <>
      <View style={[styles.footer, dyn.footer]}>

        {/* Left side */}
        <View style={styles.footerSide}>
          <FooterTabItem icon="cog-outline" label="Settings" onPress={() => {}} />
          {!isDashboard && (
            <FooterTabItem icon="bell-outline" label="Alerts" onPress={() => {}} />
          )}
        </View>

        {/* Center home button */}
        <Pressable
          style={({ pressed }) => [styles.logoContainer, pressed && styles.logoContainerPressed]}
          onPress={() => navigate('Dashboard')}
          accessibilityRole="button"
          accessibilityLabel="Home">
          <View style={styles.logoBorder}>
            <MaterialCommunityIcons name="home" size={24} color={Colors.primaryHighlight} />
          </View>
        </Pressable>

        {/* Right side */}
        <View style={styles.footerSide}>
          {!isDashboard && (
            <FooterTabItem
              icon="magnify"
              label="Search"
              active={isSearchVisible}
              onPress={() => setIsSearchVisible(true)}
            />
          )}
          <FooterTabItem
            icon="account-circle-outline"
            label="Profile"
            onPress={() => setShowProfile(true)}
          />
        </View>
      </View>

      {/* Search modal */}
      <SearchModal
        visible={isSearchVisible}
        onClose={() => setIsSearchVisible(false)}
      />

      {/* Profile sheet */}
      {user && (
        <ProfileSheet
          visible={showProfile}
          user={user}
          onClose={() => setShowProfile(false)}
          onLogout={logout}
        />
      )}
    </>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
function createDynamicStyles(_colors: any) {
  return StyleSheet.create({
    footer: {
      backgroundColor: '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor: '#EEEEEE',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -3 },
      shadowOpacity: 0.12,
      shadowRadius: 6,
      elevation: 4,
    },
  });
}

const HEADER_BG = 'rgba(62,62,70,0.98)';

const styles = StyleSheet.create({
  // ── Footer bar ──
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    width: '100%',
    height: 50,
    backgroundColor: '#FFFFFF',
  },
  logoContainer: { alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  logoContainerPressed: { opacity: 0.6, transform: [{ scale: 0.92 }] },
  logoBorder: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFF5FA',
    borderWidth: 2, borderColor: Colors.primaryHighlight,
  },
  footerSide: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 6, paddingHorizontal: 4, gap: 3, borderRadius: 8,
  },
  tabItemPressed: { opacity: 0.6, transform: [{ scale: 0.92 }] },
  tabLabel: {
    fontFamily: FontFamily.regular, fontSize: 9,
    color: '#8E8E93', letterSpacing: 0.2, textAlign: 'center',
  },
  tabLabelActive: {
    fontFamily: FontFamily.bold, fontWeight: FontWeight.bold,
    color: Colors.primaryHighlight,
  },

  // ── Modal shell ──
  modalWrap: { flex: 1 },
  searchContainer: { marginTop: 0 },

  backdrop: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    zIndex: -1,
  },

  // ── Header panel ──
  searchHeader: {
    backgroundColor: HEADER_BG,
    paddingTop: Platform.OS === 'ios' ? 54 : 20,
    paddingBottom: 18,
    paddingHorizontal: Spacing.lg,
    gap: 14,
    
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandLogoCircle: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(233,30,99,0.15)',
    borderWidth: 1, borderColor: 'rgba(233,30,99,0.3)',
    alignItems: 'center', justifyContent: 'center',
  },
  brandTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  brandSub: {
    fontFamily: FontFamily.regular,
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginTop: 1,
  },

  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center', justifyContent: 'center',
  },
  xL: { position: 'absolute', width: 13, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '45deg' }] },
  xR: { position: 'absolute', width: 13, height: 2, backgroundColor: '#FFFFFF', borderRadius: 1, transform: [{ rotate: '-45deg' }] },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    color: '#FFFFFF',
    paddingVertical: 0,
  },

  // ── Results panel ──
  resultsPanel: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    maxHeight: 420,
  },

  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  hintTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#1C1C1E',
    marginTop: 4,
  },
  hintSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#8E8E93',
  },

  countLabel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: '#8E8E93',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    letterSpacing: 0.3,
  },

  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: Spacing.lg,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F5',
  },
  resultRowPressed: { backgroundColor: 'rgba(233,30,99,0.05)' },
  resultIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(233,30,99,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  resultText: { flex: 1 },
  resultTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: '#1C1C1E',
  },
  resultDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: '#8E8E93',
    marginTop: 2,
  },
});
