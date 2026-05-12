import React, { createContext, useContext, useState } from 'react';

export interface Store {
  id: string;
  storeNo: string;
  storeCode: string;
  workBranch: string;
  storeName: string;
  entity: string;
  storeColor: string;
  description?: string;
}

interface StoresContextValue {
  stores: Store[];
  setStores: React.Dispatch<React.SetStateAction<Store[]>>;
}

const StoresContext = createContext<StoresContextValue>({
  stores: [],
  setStores: () => {},
});

export function StoresProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>([]);
  return (
    <StoresContext.Provider value={{ stores, setStores }}>
      {children}
    </StoresContext.Provider>
  );
}

export function useStores() {
  return useContext(StoresContext);
}
