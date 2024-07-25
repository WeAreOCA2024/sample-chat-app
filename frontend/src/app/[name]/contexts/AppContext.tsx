"use client";
import React, { createContext, useState, useContext } from 'react';

type AppContextType = {
  count: number;
  setCount: React.Dispatch<React.SetStateAction<number>>;
  msg: string;
  setMsg: React.Dispatch<React.SetStateAction<string>>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);
  const [msg, setMsg] = useState("");

  return (
    <AppContext.Provider value={{ count, setCount, msg, setMsg }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};