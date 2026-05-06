import React from 'react';
import { useWindowDimensions, View } from 'react-native';
import { PreviewProvider } from '../../context/PreviewContext';
import type { RecentPage, ScreenName } from '../../context/NavigationContext';

// Inline require() calls so Metro can bundle them while avoiding circular
// import chains (SubModuleLayout → RecentPageTabs → ScreenPreview → screens
// → SubModuleLayout). require() inside a function is resolved at call-time,
// after all module initialisations have finished.
function resolveScreen(page: RecentPage): React.ComponentType<any> | null {
  const s = page.screen as ScreenName;

  if (s === 'ModuleDetail') {
    const { ModuleDetailScreen } = require('../../screens/dashboard/ModuleDetailScreen');
    const id = page.params?.moduleId ?? '';
    return () => <ModuleDetailScreen moduleId={id} />;
  }

  const map: Partial<Record<ScreenName, () => React.ComponentType<any>>> = {
    HR:                       () => require('../../screens/hr/HRScreen').HRScreen,
    HumanManagement:          () => require('../../screens/hr/HumanManagementScreen').HumanManagementScreen,
    EmployeeManagement:       () => require('../../screens/hr/EmployeeManagementScreen').EmployeeManagementScreen,
    UserManagement:           () => require('../../screens/hr/UserManagementScreen').UserManagementScreen,
    CreateSystemUsers:        () => require('../../screens/user/CreateSystemUsersScreen').CreateSystemUsersScreen,
    AssignUserPermission:     () => require('../../screens/user/AssignUserPermissionScreen').AssignUserPermissionScreen,
    CreateUserRole:           () => require('../../screens/user/CreateUserRoleScreen').CreateUserRoleScreen,
    AssignUserRolePermission: () => require('../../screens/user/AssignUserRolePermissionScreen').AssignUserRolePermissionScreen,
    SystemAdmin:              () => require('../../screens/admin/SystemAdminScreen').SystemAdminScreen,
    SystemSettings:           () => require('../../screens/admin/SystemSettingsScreen').SystemSettingsScreen,
    EmployeeSettings:         () => require('../../screens/admin/EmployeeSettingsScreen').EmployeeSettingsScreen,
    GeneralSettings:          () => require('../../screens/admin/GeneralSettingsScreen').GeneralSettingsScreen,
    SystemDefaultSettings:    () => require('../../screens/admin/SystemDefaultSettingsScreen').SystemDefaultSettingsScreen,
    SupportTicket:            () => require('../../screens/admin/SupportTicketScreen').SupportTicketScreen,
    ActivityLog:              () => require('../../screens/admin/ActivityLogScreen').ActivityLogScreen,
    SystemWorkFlow:           () => require('../../screens/admin/SystemWorkFlowScreen').SystemWorkFlowScreen,
    Finance:                  () => require('../../screens/finance/FinanceScreen').FinanceScreen,
    FinanceUtilities:         () => require('../../screens/finance/FinanceUtilitiesScreen').FinanceUtilitiesScreen,
    LedgerManagement:         () => require('../../screens/finance/LedgerManagementScreen').LedgerManagementScreen,
    FinanceOperation:         () => require('../../screens/finance/FinanceOperationScreen').FinanceOperationScreen,
    FinanceEntities:          () => require('../../screens/finance/FinanceEntitiesScreen').FinanceEntitiesScreen,
    BusinessStructure:        () => require('../../screens/finance/BusinessStructureScreen').BusinessStructureScreen,
    FinanceInstitutesAcc:     () => require('../../screens/finance/FinanceInstitutesAccScreen').FinanceInstitutesAccScreen,
    BooksAndAccounts:         () => require('../../screens/finance/BooksAndAccountsScreen').BooksAndAccountsScreen,
    UtilityService:           () => require('../../screens/finance/UtilityServiceScreen').UtilityServiceScreen,
    ServiceProvider:          () => require('../../screens/finance/ServiceProviderScreen').ServiceProviderScreen,
    TaxSettings:              () => require('../../screens/finance/TaxSettingsScreen').TaxSettingsScreen,
    POS:                      () => require('../../screens/finance/POSScreen').POSScreen,
    BankCardMachine:          () => require('../../screens/finance/BankCardMachineScreen').BankCardMachineScreen,
    LoyaltyPoints:            () => require('../../screens/finance/LoyaltyPointsScreen').LoyaltyPointsScreen,
    ChartOfAccounts:          () => require('../../screens/finance/ChartOfAccountsScreen').ChartOfAccountsScreen,
    FinanceReportsGenerator:  () => require('../../screens/finance/FinanceReportsGeneratorScreen').FinanceReportsGeneratorScreen,
    LedgerConnectionConsole:  () => require('../../screens/finance/LedgerConnectionConsoleScreen').LedgerConnectionConsoleScreen,
    OpeningBalanceConsole:    () => require('../../screens/finance/OpeningBalanceConsoleScreen').OpeningBalanceConsoleScreen,
    JournalEntry:             () => require('../../screens/finance/JournalEntryScreen').JournalEntryScreen,
    ManagePOSPoints:          () => require('../../screens/finance/ManagePOSPointsScreen').ManagePOSPointsScreen,
    SimpleInvoice:            () => require('../../screens/finance/SimpleInvoiceScreen').SimpleInvoiceScreen,
    ManageBankCardMachine:    () => require('../../screens/finance/ManageBankCardMachineScreen').ManageBankCardMachineScreen,
    Procurement:              () => require('../../screens/procurement/ProcurementScreen').ProcurementScreen,
    Purchasing:               () => require('../../screens/procurement/PurchasingScreen').PurchasingScreen,
    StoresInventory:          () => require('../../screens/procurement/StoresInventoryScreen').StoresInventoryScreen,
    Logistics:                () => require('../../screens/procurement/LogisticsScreen').LogisticsScreen,
  };

  return map[s]?.() ?? null;
}

export function LiveScreenPreview({ page, cardWidth }: {
  page: RecentPage;
  cardWidth: number;
}) {
  const { width: screenW, height: screenH } = useWindowDimensions();

  const ScreenComponent = resolveScreen(page);
  if (!ScreenComponent) return null;

  const scale    = cardWidth / screenW;
  // Align top-left of scaled content with container top-left
  const tx       = (cardWidth - screenW) / 2;
  const ty       = (screenH * scale - screenH) / 2;
  const clipH    = cardWidth;   // 1:1 square

  return (
    <View style={{ width: cardWidth, height: clipH, overflow: 'hidden' }} pointerEvents="none">
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          width:  screenW,
          height: screenH,
          transform: [{ translateX: tx }, { translateY: ty }, { scale }],
        }}>
        <PreviewProvider>
          <ScreenComponent />
        </PreviewProvider>
      </View>
    </View>
  );
}
