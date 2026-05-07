import { render, fireEvent } from '@testing-library/react';
import { ThemeToggle } from 'src/App/AppTemplate/ThemeToggle';
import { ThemeContext } from 'src/providers/Theme.provider';

const renderWithTheme = (theme: 'light' | 'dark') => {
  const toggleTheme = jest.fn();
  const setTheme = jest.fn();
  const utils = render(
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      <ThemeToggle />
    </ThemeContext.Provider>,
  );
  return { ...utils, toggleTheme };
};

describe('ThemeToggle', () => {
  it('renders the dark-mode label and moon icon when theme is light', () => {
    const { container } = renderWithTheme('light');
    expect(container.textContent).toContain('Dark Mode');
    expect(container.querySelector('.fa-moon')).not.toBeNull();
    expect(container.querySelector('.fa-sun')).toBeNull();
  });
  it('renders the light-mode label and sun icon when theme is dark', () => {
    const { container } = renderWithTheme('dark');
    expect(container.textContent).toContain('Light Mode');
    expect(container.querySelector('.fa-sun')).not.toBeNull();
    expect(container.querySelector('.fa-moon')).toBeNull();
  });
  it('calls toggleTheme on click', () => {
    const { container, toggleTheme } = renderWithTheme('light');
    const btn = container.querySelector('.theme-toggle-button') as HTMLElement;
    fireEvent.click(btn);
    expect(toggleTheme).toHaveBeenCalled();
  });
  it('toggles when Enter is pressed', () => {
    const { container, toggleTheme } = renderWithTheme('light');
    const btn = container.querySelector('.theme-toggle-button') as HTMLElement;
    fireEvent.keyPress(btn, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(toggleTheme).toHaveBeenCalled();
  });
  it('does not toggle for unrelated keys', () => {
    const { container, toggleTheme } = renderWithTheme('light');
    const btn = container.querySelector('.theme-toggle-button') as HTMLElement;
    fireEvent.keyPress(btn, { key: 'a', code: 'KeyA', charCode: 97 });
    expect(toggleTheme).not.toHaveBeenCalled();
  });
});
