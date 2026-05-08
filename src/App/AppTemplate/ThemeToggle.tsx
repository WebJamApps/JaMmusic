import { useContext } from 'react';
import { ThemeContext } from 'src/providers/Theme.provider';

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    toggleTheme();
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick(e);
  };
  return (
    <div className="menu-item theme-toggle">
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        className={`theme-switch ${isDark ? 'is-dark' : 'is-light'}`}
        onClick={handleClick}
        onKeyPress={handleKeyPress}
      >
        <span className="theme-switch-side theme-switch-light">
          <i className="fas fa-sun" aria-hidden="true" />
          <span className="theme-switch-side-label">Light</span>
        </span>
        <span className="theme-switch-side theme-switch-dark">
          <i className="fas fa-moon" aria-hidden="true" />
          <span className="theme-switch-side-label">Dark</span>
        </span>
        <span className="theme-switch-thumb" aria-hidden="true" />
      </button>
    </div>
  );
}
