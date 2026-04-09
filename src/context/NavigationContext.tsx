import React, { createContext, useCallback, useContext, useState } from 'react';

export type ScreenName =
  | 'Dashboard' | 'HR'
  | 'HumanManagement' | 'EmployeeManagement'
  | 'UserManagement'
  | 'CreateSystemUsers' | 'AssignUserPermission'
  | 'CreateUserRole'    | 'AssignUserRolePermission';

interface NavigationContextValue {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  canGoBack: boolean;
  navigating: boolean;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

const NAV_DELAY = 500; // ms — page transition loader duration

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack,      setStack]      = useState<ScreenName[]>(['Dashboard']);
  const [navigating, setNavigating] = useState(false);

  const navigate = useCallback((screen: ScreenName) => {
    setNavigating(true);
    setTimeout(() => {
      setStack(prev => [...prev, screen]);
      setNavigating(false);
    }, NAV_DELAY);
  }, []);

  const goBack = useCallback(() => {
    setNavigating(true);
    setTimeout(() => {
      setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
      setNavigating(false);
    }, NAV_DELAY);
  }, []);

  const currentScreen = stack[stack.length - 1];
  const canGoBack = stack.length > 1;

  return (
    <NavigationContext.Provider value={{ currentScreen, navigate, goBack, canGoBack, navigating }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) { throw new Error('useNavigation must be used within NavigationProvider'); }
  return ctx;
}
