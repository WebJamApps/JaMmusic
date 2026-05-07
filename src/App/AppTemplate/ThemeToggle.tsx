import { useContext } from 'react';
import { ThemeContext } from 'src/providers/Theme.provider';

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const iconClass = isDark ? 'fas fa-sun' : 'fas fa-moon';
  const label = isDark ? 'Light Mode' : 'Dark Mode';
  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    toggleTheme();
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') handleClick(e);
  };
  return (
    <div className="menu-item theme-toggle">
      <div
        role="button"
        tabIndex={0}
        aria-label={label}
        aria-pressed={isDark}
        className="nav-link theme-toggle-button"
        onClick={handleClick}
        onKeyPress={handleKeyPress}
      >
        <div style={{ display: 'inline' }}>
          <i className={iconClass} style={{ marginRight: '8px' }} />
          <span className="nav-item">{label}</span>
        </div>
      </div>
    </div>
  );
}
