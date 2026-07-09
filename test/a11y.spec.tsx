import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { axe } from 'vitest-axe';
import store from 'src/redux/store/index';
import { AppTemplate } from 'src/App/AppTemplate';
import { ThemeProvider, type Theme } from 'src/providers/Theme.provider';
import { MuiThemeProvider } from 'src/providers/MuiThemeProvider';
import { Homepage } from 'src/containers/Homepage';
import { Music } from 'src/containers/Music';
import BuyMusic from 'src/containers/BuyMusic';
import { Songs } from 'src/containers/Songs';
import { BookUs } from 'src/containers/BookUs';
import { Tipjar } from 'src/containers/Tipjar';
import { AdminUsers } from 'src/containers/AdminUsers';
import { AdminVenues } from 'src/containers/AdminVenues';
import { AdminOutreach } from 'src/containers/AdminOutreach';
import { AdminTemplates } from 'src/containers/AdminTemplates';

// jsdom does not load the app's compiled stylesheets, so axe cannot compute
// real foreground/background colors here — the color-contrast rule is
// disabled rather than faked (see JaMmusic#1188; a browser-based axe pass via
// Playwright would be needed for genuine contrast checks). All structural
// rules (landmarks, roles, names, list semantics, etc.) run as normal.
const axeOptions = {
  rules: { 'color-contrast': { enabled: false } },
  // jsdom iframes (e.g. the Stripe buy-button on BuyMusic) have no real
  // browsing context for axe to message into — scan the top document only.
  iframes: false,
};

// Mirrors the provider stack in src/Main.tsx (Google OAuth + Data/Auth
// providers are exercised elsewhere; their context defaults apply here).
const renderPage = (page: React.ReactNode) => render(
  <ThemeProvider>
    <MuiThemeProvider>
      <Provider store={store.store}>
        <MemoryRouter>
          <AppTemplate>{page}</AppTemplate>
        </MemoryRouter>
      </Provider>
    </MuiThemeProvider>
  </ThemeProvider>,
);

const pages: [string, React.ReactNode][] = [
  ['Homepage (/)', <Homepage key="home" />],
  ['Music (/music)', <Music key="music" />],
  ['BuyMusic (/music/buymusic)', <BuyMusic key="buy" />],
  ['Songs (/music/songs)', <Songs key="songs" />],
  ['BookUs (/music/bookus)', <BookUs key="bookus" />],
  ['Tipjar (/music/tipjar)', <Tipjar key="tipjar" />],
  ['AdminUsers (/admin/users)', <AdminUsers key="au" />],
  ['AdminVenues (/admin/venues)', <AdminVenues key="av" />],
  ['AdminOutreach (/admin/outreach)', <AdminOutreach key="ao" />],
  ['AdminTemplates (/admin/templates)', <AdminTemplates key="at" />],
];

const themes: Theme[] = ['light', 'dark'];

describe.each(themes)('axe accessibility — %s theme', (theme) => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('theme', theme);
    document.documentElement.removeAttribute('data-theme');
  });

  it.each(pages)('%s has no axe violations', async (_name, page) => {
    const { container } = renderPage(page);
    expect(document.documentElement.getAttribute('data-theme')).toBe(theme);
    expect(await axe(container, axeOptions)).toHaveNoViolations();
  });
});
