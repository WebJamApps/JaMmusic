import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MuiThemeProvider } from 'src/providers/MuiThemeProvider';
import { ThemeContext } from 'src/providers/Theme.provider';

function renderWithTheme(theme: string) {
  return render(
    <ThemeContext.Provider value={{ theme } as never}>
      <MuiThemeProvider><div data-testid="child" /></MuiThemeProvider>
    </ThemeContext.Provider>,
  );
}

describe('MuiThemeProvider', () => {
  it('renders children under the dark palette', () => {
    renderWithTheme('dark');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('renders children under the light palette', () => {
    renderWithTheme('light');
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });
});
