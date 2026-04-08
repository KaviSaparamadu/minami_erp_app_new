import React from 'react';
import { StatusBar } from 'react-native';
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

function AppNavigator() {
  const { currentScreen } = useNavigation();

  switch (currentScreen) {
    case 'HR':
      return <HRScreen />;
    case 'HumanManagement':
      return <HumanManagementScreen />;
    case 'EmployeeManagement':
      return <EmployeeManagementScreen />;
    case 'UserManagement':
      return <UserManagementScreen />;
    case 'Dashboard':
    default:
      return <DashboardScreen />;
  }
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
