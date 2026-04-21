import React, { createContext, useCallback, useContext, useState } from 'react';

export type ScreenName =
  | 'Dashboard' | 'HR'
  | 'HumanManagement' | 'EmployeeManagement'
  | 'UserManagement'
  | 'CreateSystemUsers' | 'AssignUserPermission'
  | 'CreateUserRole'    | 'AssignUserRolePermission'
  | 'ModuleDetail';

interface NavigationContextValue {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName, params?: Record<string, any>) => void;
  goBack: () => void;
  canGoBack: boolean;
  navigating: boolean;
  stack: ScreenName[];
  params: Record<string, any> | null;
  navigateTo: (screen: ScreenName) => void;
  sidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

const NAV_DELAY = 500; // ms — page transition loader duration

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack,       setStack]       = useState<ScreenName[]>(['Dashboard']);
  const [navigating,  setNavigating]  = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [params,      setParams]      = useState<Record<string, any> | null>(null);

  const openSidebar  = useCallback(() => setSidebarOpen(true),  []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const navigate = useCallback((screen: ScreenName, navParams?: Record<string, any>) => {
    setNavigating(true);
    setTimeout(() => {
      setStack(prev => [...prev, screen]);
      setParams(navParams || null);
      setNavigating(false);
    }, NAV_DELAY);
  }, []);

  const goBack = useCallback(() => {
    setNavigating(true);
    setTimeout(() => {
      setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setParams(null);
      setNavigating(false);
    }, NAV_DELAY);
  }, []);

  const navigateTo = useCallback((screen: ScreenName) => {
    setNavigating(true);
    setTimeout(() => {
      setStack(prev => {
        const idx = prev.indexOf(screen);
        return idx >= 0 ? prev.slice(0, idx + 1) : prev;
      });
      setNavigating(false);
    }, NAV_DELAY);
  }, []);

  const currentScreen = stack[stack.length - 1];
  const canGoBack = stack.length > 1;

  return (
    <NavigationContext.Provider value={{ currentScreen, navigate, goBack, canGoBack, navigating, stack, params, navigateTo, sidebarOpen, openSidebar, closeSidebar }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) { throw new Error('useNavigation must be used within NavigationProvider'); }
  return ctx;
}
