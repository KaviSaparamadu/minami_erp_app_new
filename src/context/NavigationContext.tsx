import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import type { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';

export type ScreenName =
  | 'Dashboard' | 'HR'
  | 'HumanManagement' | 'EmployeeManagement'
  | 'UserManagement'
  | 'CreateSystemUsers' | 'AssignUserPermission'
  | 'CreateUserRole'    | 'AssignUserRolePermission'
  | 'SystemAdmin'
  | 'SystemSettings' | 'GeneralSettings' | 'EmployeeSettings' | 'ItemSettings' | 'StoresSettings'
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
  | 'ProcStores' | 'ProcManageStores' | 'ProcStoresReports'
  | 'ModuleDetail';

export interface RecentPage {
  key: string;
  screen: ScreenName;
  params?: Record<string, any> | null;
}

const EXCLUDED_FROM_RECENT: ScreenName[] = ['Dashboard'];

interface NavigationContextValue {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName, params?: Record<string, any>) => void;
  navigateInstant: (screen: ScreenName, params?: Record<string, any>) => void;
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
  screenRef: React.RefObject<View | null>;
  screenshots: Record<string, string>;
  saveScreenshot: (key: string) => Promise<void>;
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
  const [screenshots,  setScreenshots]  = useState<Record<string, string>>({});

  const screenRef    = useRef<View | null>(null);
  const currentPageRef = useRef<{ screen: ScreenName; params: Record<string, any> | null }>({
    screen: 'Dashboard',
    params: null,
  });

  // Keep currentPageRef always up-to-date (runs on every render)
  const latestScreen = stack[stack.length - 1];
  const latestParams = paramsStack[paramsStack.length - 1];
  currentPageRef.current = { screen: latestScreen, params: latestParams ?? null };

  // Capture the currently visible screen and store it under `key`
  const captureCurrentPage = useCallback(() => {
    const { screen: fromScreen, params: fromParams } = currentPageRef.current;
    if (EXCLUDED_FROM_RECENT.includes(fromScreen) || !screenRef.current) return;
    const fromKey = fromScreen === 'ModuleDetail' && fromParams?.moduleId
      ? `ModuleDetail:${fromParams.moduleId}`
      : fromScreen;
    captureRef(screenRef, { format: 'jpg', quality: 0.5 })
      .then(uri => setScreenshots(prev => ({ ...prev, [fromKey]: uri })))
      .catch(() => {});
  }, []);

  // Exposed so RecentPageTabs can capture the active tab when opening the modal
  const saveScreenshot = useCallback(async (key: string) => {
    if (!screenRef.current) return;
    try {
      const uri = await captureRef(screenRef, { format: 'jpg', quality: 0.6 });
      setScreenshots(prev => ({ ...prev, [key]: uri }));
    } catch { /* ignore */ }
  }, []);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const navigate = useCallback((screen: ScreenName, navParams?: Record<string, any>) => {
    captureCurrentPage();
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
  }, [captureCurrentPage]);

  const navigateInstant = useCallback((screen: ScreenName, navParams?: Record<string, any>) => {
    captureCurrentPage();
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
  }, [captureCurrentPage]);

  const goBack = useCallback(() => {
    captureCurrentPage();
    setNavigating(true);
    setTimeout(() => {
      setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setParamsStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setNavigating(false);
    }, NAV_DELAY);
  }, [captureCurrentPage]);

  const navigateTo = useCallback((screen: ScreenName) => {
    captureCurrentPage();
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
  }, [captureCurrentPage]);

  const removeRecentPage = useCallback((key: string) => {
    setRecentPages(prev => prev.filter(p => p.key !== key));
  }, []);

  const currentScreen = stack[stack.length - 1];
  const canGoBack     = stack.length > 1;
  const params        = paramsStack[paramsStack.length - 1];

  return (
    <NavigationContext.Provider value={{
      currentScreen, navigate, navigateInstant, goBack, canGoBack, navigating,
      stack, params, paramsStack, navigateTo,
      sidebarOpen, openSidebar, closeSidebar, lastModuleId,
      recentPages, removeRecentPage,
      screenRef, screenshots, saveScreenshot,
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
