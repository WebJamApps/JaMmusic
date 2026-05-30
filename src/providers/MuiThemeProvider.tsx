import React, { useContext, useMemo } from 'react';
import { ThemeProvider as MuiProvider, createTheme } from '@mui/material/styles';
import { ThemeContext } from './Theme.provider';

/**
 * Bridges our custom CSS-variable theme (data-theme attribute) into MUI.
 * Without this, MUI components always render with the default LIGHT palette —
 * so in dark mode checkbox boxes, labels, chips and table text stay
 * black-on-dark and are illegible. Syncing palette.mode to our theme makes
 * every MUI component respect dark mode. Surfaces/text are pinned to the same
 * hex values as our --bg/--table-bg/--fg tokens in _theme.scss for consistency.
 */
export function MuiThemeProvider({ children }: { children?: React.ReactNode }): React.JSX.Element {
  const { theme } = useContext(ThemeContext);
  const muiTheme = useMemo(() => createTheme({
    palette: theme === 'dark'
      ? {
        mode: 'dark',
        background: { default: '#121212', paper: '#1c1c1c' },
        text: { primary: '#e8e8e8' },
      }
      : { mode: 'light' },
  }), [theme]);
  return <MuiProvider theme={muiTheme}>{children}</MuiProvider>;
}
