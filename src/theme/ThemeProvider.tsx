import React, { createContext, useContext, useMemo, useState } from 'react';
import {
  ThemeProvider as MuiThemeProvider,
  createTheme,
  PaletteMode,
} from '@mui/material';

const ThemeContext = createContext<{
  mode: PaletteMode;
  toggleTheme: () => void;
}>({
  mode: 'light',
  toggleTheme: () => {},
});

export const useThemeMode = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<PaletteMode>('light');

  const toggleTheme = () =>
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
        },
      }),
    [mode]
  );

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
