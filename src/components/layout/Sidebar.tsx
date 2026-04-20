import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, FontFamily, FontSize, FontWeight, Spacing } from '../../constants/theme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import navigationData from '../../constants/navigation.json';
import { SidebarIcon } from './SidebarIcon';

export interface NavNode {
  id: string;
  name: string;
  icon?: string;
  screen?: string;
  children?: NavNode[];
}

interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const NAV: NavNode[] = (navigationData as { modules: NavNode[] }).modules;
const SIDEBAR_RATIO = 0.78;
const SIDEBAR_MAX = 300;
const ANIM_MS = 240;
const PINK = Colors.primaryHighlight;

export function Sidebar({ visible, onClose }: SidebarProps) {
  const { width } = useWindowDimensions();
  const { currentScreen, navigate } = useNavigation();
  const { user, logout } = useAuth();
  const { colors, isDarkMode } = useTheme();

  const sidebarWidth = Math.min(width * SIDEBAR_RATIO, SIDEBAR_MAX);
  const slide   = useRef(new Animated.Value(-sidebarWidth)).current;
  const overlay = useRef(new Animated.Value(0)).current;

  const [rendered, setRendered] = useState(visible);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    initialExpanded(NAV, currentScreen),
  );

  useEffect(() => {
    if (visible) {
      setRendered(true);
      setExpanded(prev => ({ ...prev, ...initialExpanded(NAV, currentScreen) }));
      Animated.parallel([
        Animated.timing(slide,   { toValue: 0, duration: ANIM_MS, useNativeDriver: true }),
        Animated.timing(overlay, { toValue: 1, duration: ANIM_MS, useNativeDriver: true }),
      ]).start();
    } else if (rendered) {
      Animated.parallel([
        Animated.timing(slide,   { toValue: -sidebarWidth, duration: ANIM_MS, useNativeDriver: true }),
        Animated.timing(overlay, { toValue: 0,             duration: ANIM_MS, useNativeDriver: true }),
      ]).start(({ finished }) => { if (finished) setRendered(false); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, sidebarWidth]);

  // Swipe-left-to-close gesture
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) =>
        Math.abs(g.dx) > 10 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderMove: (_e, g) => {
        const dx = Math.min(0, g.dx); // only allow left drag
        slide.setValue(dx);
        overlay.setValue(1 + dx / sidebarWidth); // fade overlay with drag
      },
      onPanResponderRelease: (_e, g) => {
        const shouldClose = g.dx < -sidebarWidth * 0.3 || g.vx < -0.4;
        if (shouldClose) {
          onClose();
        } else {
          Animated.parallel([
            Animated.timing(slide,   { toValue: 0, duration: 180, useNativeDriver: true }),
            Animated.timing(overlay, { toValue: 1, duration: 180, useNativeDriver: true }),
          ]).start();
        }
      },
      onPanResponderTerminate: () => {
        Animated.parallel([
          Animated.timing(slide,   { toValue: 0, duration: 180, useNativeDriver: true }),
          Animated.timing(overlay, { toValue: 1, duration: 180, useNativeDriver: true }),
        ]).start();
      },
    }),
  ).current;

  const dyn = useMemo(() => createDyn(colors, isDarkMode), [colors, isDarkMode]);

  function toggle(id: string) {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  }

  function handleSelect(node: NavNode) {
    if (node.children?.length) {
      toggle(node.id);
    } else if (node.screen) {
      onClose();
      if (node.screen !== currentScreen) navigate(node.screen as ScreenName);
    }
  }

  function handleLogout() {
    onClose();
    logout();
  }

  if (!rendered) return null;

  const initial = user?.fullName.charAt(0).toUpperCase() ?? '?';

  return (
    <Modal transparent visible={rendered} animationType="none" onRequestClose={onClose}>
      <View style={styles.root}>
        {/* Dim overlay */}
        <Animated.View style={[styles.overlay, { opacity: overlay }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Panel */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.panel,
            dyn.panel,
            { width: sidebarWidth, transform: [{ translateX: slide }] },
          ]}>
          <SafeAreaView edges={['top', 'left', 'bottom']} style={styles.panelInner}>

            {/* Header */}
            <View style={[styles.header, dyn.header]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
              <View style={styles.headerText}>
                <Text style={[styles.userName, dyn.textPrimary]} numberOfLines={1}>
                  {user?.fullName ?? 'Guest'}
                </Text>
                <Text style={[styles.userRole, dyn.textMuted]} numberOfLines={1}>
                  {user?.role ?? 'Administrator'}
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [styles.closeBtn, dyn.closeBtn, pressed && dyn.rowPressed]}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel="Close sidebar">
                <View style={[styles.closeBar, styles.closeBar1, { backgroundColor: dyn.iconColor.color }]} />
                <View style={[styles.closeBar, styles.closeBar2, { backgroundColor: dyn.iconColor.color }]} />
              </Pressable>
            </View>

            {/* Nav */}
            <ScrollView
              contentContainerStyle={styles.nav}
              showsVerticalScrollIndicator={false}>
              {NAV.map(node => (
                <NavItem
                  key={node.id}
                  node={node}
                  depth={0}
                  current={currentScreen}
                  expanded={expanded}
                  onSelect={handleSelect}
                  onToggle={toggle}
                  dyn={dyn}
                />
              ))}
            </ScrollView>

            {/* Footer */}
            <View style={[styles.footer, dyn.footer]}>
              <Pressable
                onPress={handleLogout}
                style={({ pressed }) => [styles.logoutRow, pressed && dyn.rowPressed]}
                accessibilityRole="button"
                accessibilityLabel="Sign out">
                <View style={styles.logoutIcon}>
                  <View style={[styles.logoutBox, { borderColor: PINK }]} />
                  <View style={[styles.logoutStem, { backgroundColor: PINK }]} />
                  <View style={[styles.logoutArrow, { borderColor: PINK }]} />
                </View>
                <Text style={styles.logoutText}>Sign Out</Text>
              </Pressable>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

interface NavItemProps {
  node: NavNode;
  depth: number;
  current: ScreenName;
  expanded: Record<string, boolean>;
  onSelect: (n: NavNode) => void;
  onToggle: (id: string) => void;
  dyn: ReturnType<typeof createDyn>;
}

function NavItem({ node, depth, current, expanded, onSelect, onToggle, dyn }: NavItemProps) {
  const hasChildren = !!node.children?.length;
  const isOpen = !!expanded[node.id];
  const isActive = node.screen === current;
  const iconSize = depth === 0 ? 18 : 14;

  const iconColor = isActive ? PINK : dyn.iconColor.color;

  return (
    <View>
      <Pressable
        onPress={() => onSelect(node)}
        style={({ pressed }) => [
          styles.row,
          { paddingLeft: Spacing.lg + depth * 18 },
          isActive && [styles.rowActive, dyn.rowActive],
          pressed && !isActive && dyn.rowPressed,
        ]}
        accessibilityRole="button"
        accessibilityLabel={node.name}>

        <SidebarIcon name={node.icon} color={iconColor} size={iconSize} />

        <Text
          style={[
            styles.rowText,
            depth > 0 && styles.rowTextChild,
            dyn.textPrimary,
            isActive && styles.rowTextActive,
          ]}
          numberOfLines={1}>
          {node.name}
        </Text>

        {hasChildren && (
          <View
            style={[
              styles.chev,
              isOpen && styles.chevOpen,
              { borderColor: isActive ? PINK : dyn.iconColor.color },
            ]}
          />
        )}
      </Pressable>

      {hasChildren && isOpen && (
        <View style={[styles.childGroup, depth === 0 ? dyn.childGroupL1 : dyn.childGroupL2]}>
          <View style={[styles.childRule, dyn.childRule]} />
          {node.children!.map(child => (
            <NavItem
              key={child.id}
              node={child}
              depth={depth + 1}
              current={current}
              expanded={expanded}
              onSelect={onSelect}
              onToggle={onToggle}
              dyn={dyn}
            />
          ))}
          <View style={[styles.childRule, dyn.childRule]} />
        </View>
      )}
    </View>
  );
}

function initialExpanded(nodes: NavNode[], current: ScreenName): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  const walk = (list: NavNode[]): boolean => {
    let anyMatch = false;
    for (const n of list) {
      const childMatch = n.children ? walk(n.children) : false;
      const selfMatch  = n.screen === current;
      if (childMatch) out[n.id] = true;
      if (childMatch || selfMatch) anyMatch = true;
    }
    return anyMatch;
  };
  walk(nodes);
  return out;
}

function createDyn(colors: any, isDark: boolean) {
  const panelBg     = isDark ? '#1C1C1E' : '#FFFFFF';
  const borderCol   = isDark ? 'rgba(255,255,255,0.08)' : '#EEEEF0';
  const textCol     = isDark ? '#E5E5E7' : '#1C1C1E';
  const mutedCol    = isDark ? 'rgba(255,255,255,0.5)' : '#8E8E93';
  const iconCol     = isDark ? 'rgba(255,255,255,0.65)' : '#6E6E73';
  const rowActiveBg = isDark ? 'rgba(233,30,99,0.14)' : 'rgba(233,30,99,0.08)';
  const rowPressed  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const connector   = isDark ? 'rgba(255,255,255,0.18)' : '#E8E8EC';
  const childBgL1   = isDark ? 'rgba(255,255,255,0.04)' : '#F6F6F9';
  const childBgL2   = isDark ? 'rgba(233,30,99,0.07)'   : '#FDF1F5';
  const ruleL2      = isDark ? 'rgba(233,30,99,0.22)'   : '#F3D7E0';

  return StyleSheet.create({
    panel:       { backgroundColor: panelBg },
    header:      { borderBottomColor: borderCol },
    footer:      { borderTopColor: borderCol },
    textPrimary: { color: textCol },
    textMuted:   { color: mutedCol },
    iconColor:   { color: iconCol },
    rowActive:   { backgroundColor: rowActiveBg },
    rowPressed:  { backgroundColor: rowPressed },
    childRule:    { backgroundColor: connector },
    childGroupL1: { backgroundColor: childBgL1 },
    childGroupL2: { backgroundColor: childBgL2, borderTopColor: ruleL2, borderBottomColor: ruleL2 },
    closeBtn:     { borderColor: connector },
  });
}

const styles = StyleSheet.create({
  root: { flex: 1, flexDirection: 'row' },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 16,
  },
  panelInner: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: PINK,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
  },
  headerText: { flex: 1 },
  userName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  userRole: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  closeBar: {
    position: 'absolute',
    width: 14, height: 1.5, borderRadius: 1,
  },
  closeBar1: { transform: [{ rotate: '45deg' }] },
  closeBar2: { transform: [{ rotate: '-45deg' }] },

  // Nav
  nav: {
    paddingVertical: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 11,
    paddingRight: Spacing.lg,
    marginHorizontal: Spacing.sm,
    borderRadius: 10,
  },
  rowActive: {},
  childGroup: {},
  childRule: {
    height: 1,
  },
  rowText: {
    flex: 1,
    fontFamily: FontFamily.medium,
    fontSize: FontSize.lg,
    letterSpacing: 0.1,
  },
  rowTextChild: {
    fontSize: FontSize.md,
    fontFamily: FontFamily.regular,
  },
  rowTextActive: {
    color: PINK,
    fontFamily: FontFamily.bold,
    fontWeight: FontWeight.bold,
  },
  chev: {
    width: 6, height: 6,
    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    transform: [{ rotate: '-45deg' }],
  },
  chevOpen: {
    transform: [{ rotate: '45deg' }],
  },

  // Footer
  footer: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: 11,
    paddingHorizontal: Spacing.md,
    borderRadius: 10,
  },
  logoutIcon: {
    width: 18, height: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  logoutBox: {
    width: 11, height: 13,
    borderWidth: 1.5, borderRadius: 2,
    position: 'absolute', left: 0,
  },
  logoutStem: {
    width: 7, height: 1.5,
    borderRadius: 1,
    position: 'absolute', right: 0,
  },
  logoutArrow: {
    width: 5, height: 5,
    borderTopWidth: 1.5, borderRightWidth: 1.5,
    transform: [{ rotate: '45deg' }],
    position: 'absolute', right: 0,
  },
  logoutText: {
    flex: 1,
    fontFamily: FontFamily.bold,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: PINK,
  },
});
