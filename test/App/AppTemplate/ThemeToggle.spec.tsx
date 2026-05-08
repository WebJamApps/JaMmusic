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
  it('renders both Light and Dark sides regardless of current theme', () => {
    const { container } = renderWithTheme('light');
    expect(container.querySelector('.fa-sun')).not.toBeNull();
    expect(container.querySelector('.fa-moon')).not.toBeNull();
    expect(container.textContent).toContain('Light');
    expect(container.textContent).toContain('Dark');
  });
  it('marks the switch as unchecked and applies is-light when theme is light', () => {
    const { container } = renderWithTheme('light');
    const sw = container.querySelector('.theme-switch') as HTMLElement;
    expect(sw.getAttribute('aria-checked')).toBe('false');
    expect(sw.className).toContain('is-light');
    expect(sw.getAttribute('aria-label')).toBe('Switch to dark mode');
  });
  it('marks the switch as checked and applies is-dark when theme is dark', () => {
    const { container } = renderWithTheme('dark');
    const sw = container.querySelector('.theme-switch') as HTMLElement;
    expect(sw.getAttribute('aria-checked')).toBe('true');
    expect(sw.className).toContain('is-dark');
    expect(sw.getAttribute('aria-label')).toBe('Switch to light mode');
  });
  it('calls toggleTheme on click', () => {
    const { container, toggleTheme } = renderWithTheme('light');
    const sw = container.querySelector('.theme-switch') as HTMLElement;
    fireEvent.click(sw);
    expect(toggleTheme).toHaveBeenCalled();
  });
  it('toggles when Enter is pressed', () => {
    const { container, toggleTheme } = renderWithTheme('light');
    const sw = container.querySelector('.theme-switch') as HTMLElement;
    fireEvent.keyPress(sw, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(toggleTheme).toHaveBeenCalled();
  });
  it('toggles when Space is pressed', () => {
    const { container, toggleTheme } = renderWithTheme('dark');
    const sw = container.querySelector('.theme-switch') as HTMLElement;
    fireEvent.keyPress(sw, { key: ' ', code: 'Space', charCode: 32 });
    expect(toggleTheme).toHaveBeenCalled();
  });
  it('does not toggle for unrelated keys', () => {
    const { container, toggleTheme } = renderWithTheme('light');
    const sw = container.querySelector('.theme-switch') as HTMLElement;
    fireEvent.keyPress(sw, { key: 'a', code: 'KeyA', charCode: 97 });
    expect(toggleTheme).not.toHaveBeenCalled();
  });
});
