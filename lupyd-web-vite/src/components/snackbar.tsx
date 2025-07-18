'use client';
import { Snackbar } from '@mui/material';
import { createContext, useContext, useState } from 'react';

type Snack = { message: string, key: number };

const SnackbarContext = createContext<(msg: string) => void>(() => {});

export function useSnackbar() {
  return useContext(SnackbarContext);
}

export function SnackbarProvider({ children }: { children: React.ReactNode }) {
  const [snacks, setSnacks] = useState<Snack[]>([]);

  const push = (message: string) => {
    setSnacks(prev => [...prev, { message, key: Date.now() + Math.random() }]);
  };

  const handleClose = (key: number) => () => {
    setSnacks(prev => prev.filter(s => s.key !== key));
  };

  return (
    <SnackbarContext.Provider value={push}>
      {children}
      {snacks.map(({ message, key }) => (
        <Snackbar
          key={key}
          open
          autoHideDuration={3000}
          onClose={handleClose(key)}
          message={message}
        />
      ))}
    </SnackbarContext.Provider>
  );
}
