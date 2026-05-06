import React, { createContext, useContext } from 'react';

const PreviewContext = createContext(false);

export const useIsPreview = () => useContext(PreviewContext);

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  return (
    <PreviewContext.Provider value={true}>
      {children}
    </PreviewContext.Provider>
  );
}
