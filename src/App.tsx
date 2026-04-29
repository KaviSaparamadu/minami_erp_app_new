import React, { useState, useEffect } from 'react';
import { ActivityIndicator, StatusBar, StyleSheet, View, Animated } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './context/AuthContext';
import { NavigationProvider, useNavigation } from './context/NavigationContext';
import { ThemeProvider } from './context/ThemeContext';
import { SearchProvider, useSearch } from './context/SearchContext';
import { useAuth } from './hooks/useAuth';
import { useTheme } from './hooks/useTheme';
import { Footer } from './components/common/Footer';
import { Sidebar } from './components/layout/Sidebar';
import { LoginScreen } from './screens/auth/LoginScreen';
import { SplashScreen } from './screens/SplashScreen';
import { DashboardScreen } from './screens/dashboard/DashboardScreen';
import { HRScreen } from './screens/hr/HRScreen';
import { EmployeeManagementScreen } from './screens/hr/EmployeeManagementScreen';
import { HumanManagementScreen } from './screens/hr/HumanManagementScreen';
import { UserManagementScreen } from './screens/hr/UserManagementScreen';
import { CreateSystemUsersScreen } from './screens/user/CreateSystemUsersScreen';
import { AssignUserPermissionScreen } from './screens/user/AssignUserPermissionScreen';
import { CreateUserRoleScreen } from './screens/user/CreateUserRoleScreen';
import { AssignUserRolePermissionScreen } from './screens/user/AssignUserRolePermissionScreen';
import { ModuleDetailScreen } from './screens/dashboard/ModuleDetailScreen';
import { SystemAdminScreen } from './screens/admin/SystemAdminScreen';
import { SystemSettingsScreen } from './screens/admin/SystemSettingsScreen';
import { GeneralSettingsScreen } from './screens/admin/GeneralSettingsScreen';
import { SystemDefaultSettingsScreen } from './screens/admin/SystemDefaultSettingsScreen';
import { SupportTicketScreen } from './screens/admin/SupportTicketScreen';
import { ActivityLogScreen } from './screens/admin/ActivityLogScreen';
import { SystemWorkFlowScreen } from './screens/admin/SystemWorkFlowScreen';
import { FinanceScreen } from './screens/finance/FinanceScreen';
import { FinanceUtilitiesScreen } from './screens/finance/FinanceUtilitiesScreen';
import { LedgerManagementScreen } from './screens/finance/LedgerManagementScreen';
import { FinanceOperationScreen } from './screens/finance/FinanceOperationScreen';
import { FinanceEntitiesScreen } from './screens/finance/FinanceEntitiesScreen';
import { BusinessStructureScreen } from './screens/finance/BusinessStructureScreen';
import { FinanceInstitutesAccScreen } from './screens/finance/FinanceInstitutesAccScreen';
import { BooksAndAccountsScreen } from './screens/finance/BooksAndAccountsScreen';
import { UtilityServiceScreen } from './screens/finance/UtilityServiceScreen';
import { ServiceProviderScreen } from './screens/finance/ServiceProviderScreen';
import { TaxSettingsScreen } from './screens/finance/TaxSettingsScreen';
import { POSScreen } from './screens/finance/POSScreen';
import { BankCardMachineScreen } from './screens/finance/BankCardMachineScreen';
import { LoyaltyPointsScreen } from './screens/finance/LoyaltyPointsScreen';
import { ChartOfAccountsScreen } from './screens/finance/ChartOfAccountsScreen';
import { FinanceReportsGeneratorScreen } from './screens/finance/FinanceReportsGeneratorScreen';
import { LedgerConnectionConsoleScreen } from './screens/finance/LedgerConnectionConsoleScreen';
import { OpeningBalanceConsoleScreen } from './screens/finance/OpeningBalanceConsoleScreen';
import { JournalEntryScreen } from './screens/finance/JournalEntryScreen';
import { ManagePOSPointsScreen } from './screens/finance/ManagePOSPointsScreen';
import { SimpleInvoiceScreen } from './screens/finance/SimpleInvoiceScreen';
import { ManageBankCardMachineScreen } from './screens/finance/ManageBankCardMachineScreen';
import { ProcurementScreen } from './screens/procurement/ProcurementScreen';
import { PurchasingScreen } from './screens/procurement/PurchasingScreen';
import { StoresInventoryScreen } from './screens/procurement/StoresInventoryScreen';
import { LogisticsScreen } from './screens/procurement/LogisticsScreen';

function DottedLoader() {
  const DOT_SIZE = 8;
  const RADIUS = 16;
  const dots = Array.from({ length: 8 });
  const animValues = dots.map(() => new Animated.Value(0));

  useEffect(() => {
    animValues.forEach((anim, idx) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(idx * 75),
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    });
  }, []);

  return (
    <View style={styles.dotContainer}>
      {dots.map((_, idx) => {
        const angle = (idx / dots.length) * Math.PI * 2;
        const x = Math.cos(angle) * RADIUS;
        const y = Math.sin(angle) * RADIUS;

        return (
          <Animated.View
            key={idx}
            style={[
              styles.dot,
              {
                transform: [{ translateX: x }, { translateY: y }],
                opacity: animValues[idx].interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              },
            ]}
          />
        );
      })}
    </View>
  );
}

function AppNavigator() {
  const { currentScreen, navigating, sidebarOpen, closeSidebar, params } = useNavigation();
  useSearch();

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
      case 'SystemAdmin':             return <SystemAdminScreen />;
      case 'SystemSettings':          return <SystemSettingsScreen />;
      case 'GeneralSettings':         return <GeneralSettingsScreen />;
      case 'SystemDefaultSettings':   return <SystemDefaultSettingsScreen />;
      case 'SupportTicket':           return <SupportTicketScreen />;
      case 'ActivityLog':             return <ActivityLogScreen />;
      case 'SystemWorkFlow':          return <SystemWorkFlowScreen />;
      case 'Finance':                 return <FinanceScreen />;
      case 'FinanceUtilities':        return <FinanceUtilitiesScreen />;
      case 'LedgerManagement':        return <LedgerManagementScreen />;
      case 'FinanceOperation':        return <FinanceOperationScreen />;
      case 'FinanceEntities':         return <FinanceEntitiesScreen />;
      case 'BusinessStructure':       return <BusinessStructureScreen />;
      case 'FinanceInstitutesAcc':    return <FinanceInstitutesAccScreen />;
      case 'BooksAndAccounts':        return <BooksAndAccountsScreen />;
      case 'UtilityService':          return <UtilityServiceScreen />;
      case 'ServiceProvider':         return <ServiceProviderScreen />;
      case 'TaxSettings':             return <TaxSettingsScreen />;
      case 'POS':                     return <POSScreen />;
      case 'BankCardMachine':         return <BankCardMachineScreen />;
      case 'LoyaltyPoints':              return <LoyaltyPointsScreen />;
      case 'ChartOfAccounts':            return <ChartOfAccountsScreen />;
      case 'FinanceReportsGenerator':    return <FinanceReportsGeneratorScreen />;
      case 'LedgerConnectionConsole':    return <LedgerConnectionConsoleScreen />;
      case 'OpeningBalanceConsole':      return <OpeningBalanceConsoleScreen />;
      case 'JournalEntry':               return <JournalEntryScreen />;
      case 'ManagePOSPoints':            return <ManagePOSPointsScreen />;
      case 'SimpleInvoice':              return <SimpleInvoiceScreen />;
      case 'ManageBankCardMachine':      return <ManageBankCardMachineScreen />;
      case 'Procurement':                return <ProcurementScreen />;
      case 'Purchasing':                 return <PurchasingScreen />;
      case 'StoresInventory':            return <StoresInventoryScreen />;
      case 'Logistics':                  return <LogisticsScreen />;
      case 'ModuleDetail': {
        const moduleId = params && typeof params === 'object' && 'moduleId' in params ? params.moduleId : '';
        return <ModuleDetailScreen moduleId={moduleId} />;
      }
      case 'Dashboard':
      default:                        return <DashboardScreen />;
    }
  })();

  return (
    <View style={styles.root}>
      <View style={styles.screenContainer}>
        {screen}
      </View>
      <Footer />

      {/* ── Sidebar drawer ── */}
      <Sidebar visible={sidebarOpen} onClose={closeSidebar} />

      {/* ── Page transition loader overlay ── */}
      {navigating && (
        <View style={styles.overlay}>
          <DottedLoader />
        </View>
      )}
    </View>
  );
}

function RootScreen() {
  const { isAuthenticated } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <AppNavigator />;
}

function AppWithTheme() {
  const { isDarkMode } = useTheme();

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#1C1C1E' : '#FFFFFF'}
      />
      <AuthProvider>
        <SearchProvider>
          <NavigationProvider>
            <RootScreen />
          </NavigationProvider>
        </SearchProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppWithTheme />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'column',
  },
  screenContainer: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  dotContainer: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E91E63',
  },
});
