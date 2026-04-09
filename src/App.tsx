import React from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
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

function AppNavigator() {
  const { currentScreen, navigating } = useNavigation();

  const screen = (() => {
    switch (currentScreen) {
      case 'HR':                      return <HRScreen />;
      case 'HumanManagement':         return <HumanManagementScreen />;
      case 'EmployeeManagement':      return <EmployeeManagementScreen />;
      case 'UserManagement':          return <UserManagementScreen />;
      case 'CreateSystemUsers':       return <CreateSystemUsersScreen />;
      case 'AssignUserPermission':    return <AssignUserPermissionScreen />;
      case 'CreateUserRole':          return <CreateUserRoleScreen />;
      case 'AssignUserRolePermission':return <AssignUserRolePermissionScreen />;
      case 'Dashboard':
      default:                        return <DashboardScreen />;
    }
  })();

  return (
    <View style={styles.root}>
      {screen}

      {/* ── Page transition loader overlay ── */}
      {navigating && (
        <View style={styles.overlay}>
          <View style={styles.loaderCard}>
            <ActivityIndicator size="large" color="#E91E63" />
          </View>
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
        <NavigationProvider>
          <RootScreen />
        </NavigationProvider>
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
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  loaderCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
});
