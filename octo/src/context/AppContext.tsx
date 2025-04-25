// src/context/AppContext.tsx
'use client'
import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextType {
  searchEngine: string;
  setSearchEngine: (engine: string) => void;
  background: string;
  setBackground: (bg: string) => void;
  notes: string;
  setNotes: (text: string) => void;
  watchlist: string[];
  setWatchlist: (items: string[]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [searchEngine, setSearchEngine] = useState('google');
  const [background, setBackground] = useState('');
  const [notes, setNotes] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);

  return (
    <AppContext.Provider value={{
      searchEngine,
      setSearchEngine,
      background,
      setBackground,
      notes,
      setNotes,
      watchlist,
      setWatchlist,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};