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

const DEFAULT_STORES: Store[] = [
  {
    id: 'store-001',
    storeNo: '01',
    storeCode: 'H01 - GL - G01',
    workBranch: 'Head Office',
    storeName: 'Glitz Top Store',
    entity: 'GPIT Solutions (Pvt) Ltd',
    storeColor: '#A8D5A2',
    description: 'Primary head office store',
  },
  {
    id: 'store-002',
    storeNo: '02',
    storeCode: 'C01 - YA - M01',
    workBranch: 'Colombo Branch',
    storeName: 'Yakkala Store',
    entity: 'Minami Corporation',
    storeColor: '#A8D0F0',
    description: 'Yakkala branch store',
  },
  {
    id: 'store-003',
    storeNo: '03',
    storeCode: 'K01 - MA - T01',
    workBranch: 'Kandy Branch',
    storeName: 'Main Store',
    entity: 'Tech Innovations Ltd',
    storeColor: '#F4ABBC',
    description: 'Kandy main store',
  },
];

export function StoresProvider({ children }: { children: React.ReactNode }) {
  const [stores, setStores] = useState<Store[]>(DEFAULT_STORES);
  return (
    <StoresContext.Provider value={{ stores, setStores }}>
      {children}
    </StoresContext.Provider>
  );
}

export function useStores() {
  return useContext(StoresContext);
}
