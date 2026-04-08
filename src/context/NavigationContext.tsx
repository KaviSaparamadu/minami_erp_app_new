import React, { createContext, useCallback, useContext, useState } from 'react';

export type ScreenName = 'Dashboard' | 'HR' | 'HumanManagement' | 'EmployeeManagement' | 'UserManagement';

interface NavigationContextValue {
  currentScreen: ScreenName;
  navigate: (screen: ScreenName) => void;
  goBack: () => void;
  canGoBack: boolean;
}

const NavigationContext = createContext<NavigationContextValue | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<ScreenName[]>(['Dashboard']);

  const navigate = useCallback((screen: ScreenName) => {
    setStack(prev => [...prev, screen]);
  }, []);

  const goBack = useCallback(() => {
    setStack(prev => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const currentScreen = stack[stack.length - 1];
  const canGoBack = stack.length > 1;

  return (
    <NavigationContext.Provider value={{ currentScreen, navigate, goBack, canGoBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation(): NavigationContextValue {
  const ctx = useContext(NavigationContext);
  if (!ctx) { throw new Error('useNavigation must be used within NavigationProvider'); }
  return ctx;
}
