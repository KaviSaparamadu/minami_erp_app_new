import React, { useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import { SubModuleLayout } from '../../components/layout/SubModuleLayout';
import { SubmoduleDetailCard } from '../../components/dashboard/SubmoduleDetailCard';
import { Colors, FontFamily, FontSize, Spacing } from '../../constants/theme';
import { useTheme } from '../../hooks/useTheme';
import { useNavigation } from '../../context/NavigationContext';
import type { ScreenName } from '../../context/NavigationContext';

type Tab = 'dashboard' | 'modules';

// ─── Sub-module definitions ───────────────────────────────────────────────────
const UM_SUBMODULES: {
  id: string;
  screen: ScreenName;
  name: string;
  value: string;
  valueLabel: string;
  description: string;
  iconType: string;
}[] = [
  {
    id: '1',
    screen: 'CreateSystemUsers',
    name: 'Create System Users',
    value: '24',
    valueLabel: 'Active Users',
    description: 'Add accounts, set credentials and configure login access for staff members.',
    iconType: 'user-add',
  },
  {
    id: '2',
    screen: 'AssignUserPermission',
    name: 'Assign User Permission',
    value: '18',
    valueLabel: 'Configured',
    description: 'Grant or revoke individual module permissions per user.',
    iconType: 'key',
  },
  {
    id: '3',
    screen: 'CreateUserRole',
    name: 'Create User Role',
    value: '7',
    valueLabel: 'Roles',
    description: 'Define reusable role profiles that bundle a set of permissions.',
    iconType: 'badge',
  },
  {
    id: '4',
    screen: 'AssignUserRolePermission',
    name: 'Assign Role Permission',
    value: '12',
    valueLabel: 'Assignments',
    description: 'Map permissions to roles and assign roles to users system-wide.',
    iconType: 'sliders',
  },
];

// ─── Submodules list ──────────────────────────────────────────────────────────
function SubmodulesView({
  onPress,
  refreshing,
  onRefresh,
}: {
  onPress: (screen: ScreenName) => void;
  refreshing: boolean;
  onRefresh: () => void;
}) {
  const { colors } = useTheme();
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.subScroll}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primaryHighlight} />
      }>
      <Text style={[styles.sectionTitle, { color: colors.primaryText }]}>User Management</Text>
      {UM_SUBMODULES.map(mod => (
        <SubmoduleDetailCard
          key={mod.id}
          submodule={{ id: mod.id, name: mod.name, value: mod.value, valueLabel: mod.valueLabel }}
          iconType={mod.iconType}
          description={mod.description}
          onPress={() => onPress(mod.screen)}
        />
      ))}
    </ScrollView>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function UserManagementScreen() {
  const { navigate } = useNavigation();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [refreshing, setRefreshing] = useState(false);

  function handleSubmodulePress(screen: ScreenName) {
    navigate(screen);
  }

  async function handleRefresh() {
    setRefreshing(true);
    await new Promise<void>(resolve => setTimeout(resolve, 800));
    setRefreshing(false);
  }

  return (
    <SubModuleLayout parentModuleId="1"
      title="User Management"
      showBack={true}
      activeTab={tab}
      onTabChange={setTab}
      showSubmodulesTab={false}
      showSubTab={true}
      subTabLabel="Sub Modules"
    >
      <SubmodulesView
        onPress={handleSubmodulePress}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SubModuleLayout>
  );
}

const styles = StyleSheet.create({
  subScroll: {
    paddingTop: Spacing.sm,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.md,
    fontWeight: '700',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
});
