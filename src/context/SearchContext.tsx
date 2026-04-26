import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { MODULES } from '../constants/modules';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'module' | 'record';
  moduleId?: string;
}

interface SearchContextType {
  searchQuery: string;
  searchResults: SearchResult[];
  isSearchVisible: boolean;
  isSearching: boolean;
  setSearchQuery: (query: string) => void;
  setIsSearchVisible: (visible: boolean) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const query = searchQuery.toLowerCase();

    // Search through all modules
    const moduleResults = MODULES.filter(
      module =>
        module.name.toLowerCase().includes(query) ||
        (module.description && module.description.toLowerCase().includes(query))
    ).map(module => ({
      id: module.id,
      title: module.name,
      description: module.description || '',
      type: 'module' as const,
      moduleId: module.id,
    }));

    // Add other searchable content here
    const allResults: SearchResult[] = [...moduleResults];

    setSearchResults(allResults);
    setIsSearching(false);
  }, [searchQuery]);

  const handleSetSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isSearchVisible,
        isSearching,
        setSearchQuery: handleSetSearchQuery,
        setIsSearchVisible,
      }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
}
