import React, { useEffect, useRef } from 'react';
import { Animated, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { BottomNavBar } from './components/common/BottomNavBar';
import { ThemeProvider } from './context/ThemeContext';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './screens/auth/LoginScreen';
import { DashboardScreen } from './screens/dashboard/DashboardScreen';
import { HRScreen } from './screens/hr/HRScreen';
import { EmployeeManagementScreen } from './screens/hr/EmployeeManagementScreen';
import { HumanManagementScreen } from './screens/hr/HumanManagementScreen';
import { UserManagementScreen } from './screens/hr/UserManagementScreen';
import { CreateSystemUsersScreen } from './screens/user/CreateSystemUsersScreen';
import { AssignUserPermissionScreen } from './screens/user/AssignUserPermissionScreen';
import { CreateUserRoleScreen } from './screens/user/CreateUserRoleScreen';
import { AssignUserRolePermissionScreen } from './screens/user/AssignUserRolePermissionScreen';
import { SystemAdminScreen } from './screens/system-admin/SystemAdminScreen';
import {
  EmployeeSettingsScreen,
  ItemSettingsScreen,
  SupplierSettingsScreen,
  StoresSettingScreen,
  FinanceSettingScreen,
  FinanceInstitutesAccSettingScreen,
  SecurityPostSettingScreen,
  VehicleSettingsScreen,
  ServiceOfferedSettingsScreen,
  DistributionBusinessSettingsScreen,
} from './screens/system-admin/SettingsScreens';

// ─── Animated 3-dot page loader ───────────────────────────────────────────────
function PageLoader() {
  const d0 = useRef(new Animated.Value(0)).current;
  const d1 = useRef(new Animated.Value(0)).current;
  const d2 = useRef(new Animated.Value(0)).current;
  const dots = [d0, d1, d2];

  useEffect(() => {
    const anim = (dot: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(dot, { toValue: 1, duration: 280, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 280, useNativeDriver: true }),
          Animated.delay(560 - delay),
        ]),
      );

    const anims = dots.map((d, i) => anim(d, i * 140));
    Animated.parallel(anims).start();
    return () => anims.forEach(a => a.stop());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={loader.wrap}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            loader.dot,
            {
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.25, 1] }),
              transform: [{
                translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }),
              }],
            },
          ]}
        />
      ))}
    </View>
  );
}

function AppNavigator() {
  const { currentScreen, navigating, stack } = useNavigation();
  const isTopLevel = stack.length === 1;

  const screen = (() => {
    switch (currentScreen) {
      case 'HR':                      return <HRScreen />;
      case 'HumanManagement':         return <HumanManagementScreen />;
      case 'EmployeeManagement':      return <EmployeeManagementScreen />;
      case 'UserManagement':          return <UserManagementScreen />;
      case 'CreateSystemUsers':       return <CreateSystemUsersScreen />;
      case 'AssignUserPermission':    return <AssignUserPermissionScreen />;
      case 'CreateUserRole':          return <CreateUserRoleScreen />;
      case 'AssignUserRolePermission':        return <AssignUserRolePermissionScreen />;
      // System Admin
      case 'SystemAdmin':                     return <SystemAdminScreen />;
      case 'EmployeeSettings':                return <EmployeeSettingsScreen />;
      case 'ItemSettings':                    return <ItemSettingsScreen />;
      case 'SupplierSettings':                return <SupplierSettingsScreen />;
      case 'StoresSetting':                   return <StoresSettingScreen />;
      case 'FinanceSetting':                  return <FinanceSettingScreen />;
      case 'FinanceInstitutesAccSetting':     return <FinanceInstitutesAccSettingScreen />;
      case 'SecurityPostSetting':             return <SecurityPostSettingScreen />;
      case 'VehicleSettings':                 return <VehicleSettingsScreen />;
      case 'ServiceOfferedSettings':          return <ServiceOfferedSettingsScreen />;
      case 'DistributionBusinessSettings':    return <DistributionBusinessSettingsScreen />;
      case 'Dashboard':
      default:                                return <DashboardScreen />;
    }
  })();

  return (
    <View style={styles.root}>
      {screen}

      {/* ── Bottom nav (top-level screens only) ── */}
      {isTopLevel && <BottomNavBar />}

      {/* ── Page transition loader overlay ── */}
      {navigating && (
        <View style={styles.overlay}>
          <PageLoader />
        </View>
      )}
    </View>
  );
}

function RootScreen() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AppNavigator />;
}

function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#1C1C1E" />
      <AuthProvider>
        <ThemeProvider>
          <NavigationProvider>
            <RootScreen />
          </NavigationProvider>
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.38)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
});

const loader = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
});
