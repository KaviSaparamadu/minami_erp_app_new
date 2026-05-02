import React, { createContext, useCallback, useContext, useState } from 'react';

export type ScreenName =
  | 'Dashboard' | 'HR'
  | 'HumanManagement' | 'EmployeeManagement'
  | 'UserManagement'
  | 'CreateSystemUsers' | 'AssignUserPermission'
  | 'CreateUserRole'    | 'AssignUserRolePermission'
  | 'SystemAdmin'
  | 'SystemSettings' | 'GeneralSettings'
  | 'SystemDefaultSettings' | 'SupportTicket' | 'ActivityLog'
  | 'SystemWorkFlow'
  | 'Finance' | 'FinanceUtilities' | 'LedgerManagement' | 'FinanceOperation'
  | 'FinanceEntities' | 'BusinessStructure' | 'FinanceInstitutesAcc'
  | 'BooksAndAccounts' | 'UtilityService' | 'ServiceProvider'
  | 'TaxSettings' | 'POS' | 'BankCardMachine' | 'LoyaltyPoints'
  | 'ChartOfAccounts' | 'FinanceReportsGenerator'
  | 'LedgerConnectionConsole' | 'OpeningBalanceConsole' | 'JournalEntry'
  | 'ManagePOSPoints' | 'SimpleInvoice' | 'ManageBankCardMachine'
  | 'Procurement' | 'Purchasing' | 'StoresInventory' | 'Logistics'
  | 'ModuleDetail';

export interface RecentPage {
  key: string;                          // unique: screen or 'ModuleDetail:moduleId'
  screen: ScreenName;
  params?: Record<string, any> | null;
}

const EXCLUDED_FROM_RECENT: ScreenName[] = ['Dashboard'];

interface NavigationContextValue {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName, params?: Record<string, any>) => void;
  goBack: () => void;
  canGoBack: boolean;
  navigating: boolean;
  stack: ScreenName[];
  params: Record<string, any> | null;
  paramsStack: Array<Record<string, any> | null>;
  navigateTo: (screen: ScreenName) => void;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  lastModuleId?: string;
  recentPages: RecentPage[];
  removeRecentPage: (key: string) => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

const NAV_DELAY = 500;

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack,        setStack]        = useState<ScreenName[]>(['Dashboard']);
  const [paramsStack,  setParamsStack]  = useState<Array<Record<string, any> | null>>([null]);
  const [navigating,   setNavigating]   = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [lastModuleId, setLastModuleId] = useState<string | undefined>(undefined);
  const [recentPages,  setRecentPages]  = useState<RecentPage[]>([]);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const navigate = useCallback((screen: ScreenName, navParams?: Record<string, any>) => {
    setNavigating(true);
    setTimeout(() => {
      setStack(prev => [...prev, screen]);
      setParamsStack(prev => [...prev, navParams || null]);

      if (screen === 'ModuleDetail' && navParams?.moduleId) {
        setLastModuleId(navParams.moduleId);
      }

      if (!EXCLUDED_FROM_RECENT.includes(screen)) {
        const key = screen === 'ModuleDetail' && navParams?.moduleId
          ? `ModuleDetail:${navParams.moduleId}`
          : screen;

        setRecentPages(prev => {
          const filtered = prev.filter(p => p.key !== key);
          return [{ key, screen, params: navParams || null }, ...filtered].slice(0, 15);
        });
      }

      setNavigating(false);
    }, NAV_DELAY);
  }, []);

  const goBack = useCallback(() => {
    setNavigating(true);
    setTimeout(() => {
      setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setParamsStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setNavigating(false);
    }, NAV_DELAY);
  }, []);

  const navigateTo = useCallback((screen: ScreenName) => {
    setNavigating(true);
    setTimeout(() => {
      setStack(prev => {
        const idx = prev.indexOf(screen);
        if (idx >= 0) {
          setParamsStack(pPrev => pPrev.slice(0, idx + 1));
          return prev.slice(0, idx + 1);
        }
        return prev;
      });
      setNavigating(false);
    }, NAV_DELAY);
  }, []);

  const removeRecentPage = useCallback((key: string) => {
    setRecentPages(prev => prev.filter(p => p.key !== key));
  }, []);

  const currentScreen = stack[stack.length - 1];
  const canGoBack     = stack.length > 1;
  const params        = paramsStack[paramsStack.length - 1];

  return (
    <NavigationContext.Provider value={{
      currentScreen, navigate, goBack, canGoBack, navigating,
      stack, params, paramsStack, navigateTo,
      sidebarOpen, openSidebar, closeSidebar, lastModuleId,
      recentPages, removeRecentPage,
    }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) { throw new Error('useNavigation must be used within NavigationProvider'); }
  return ctx;
}
