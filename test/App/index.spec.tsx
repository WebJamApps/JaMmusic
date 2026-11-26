/* eslint-disable @typescript-eslint/no-explicit-any */
import env from 'dotenv';
import { App, checkAppName } from 'src/App';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import store from 'src/redux/store/index';
import { BrowserRouter } from 'react-router';

env.config();
describe('App component', () => {
  it('is defined', () => {
    expect(App).toBeDefined();
  });
  // The test setup replaces window.location, so the address is set on that stand-in.
  it.each(['web-jam.com', 'joshandmariamusic.com'])(
    'shows the privacy policy at /privacy to a signed-out visitor on %s',
    (appName) => {
      const originalAppName = process.env.APP_NAME;
      const originalLocation = window.location;
      process.env.APP_NAME = appName;
      Object.defineProperty(window, 'location', {
        configurable: true,
        writable: true,
        value: {
          ...originalLocation, pathname: '/privacy', search: '', hash: '',
        },
      });
      const { getByRole, unmount } = render(<Provider store={store.store}><App /></Provider>);
      expect(getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument();
      unmount();
      Object.defineProperty(window, 'location', { configurable: true, writable: true, value: originalLocation });
      process.env.APP_NAME = originalAppName;
    },
  );
  it('renders', () => {
    Object.defineProperty(window, 'location', { value: { assign: () => { }, reload: () => { } }, writable: true });
    window.location = {
      ...window.location,
      href: 'https://web-jam.com',
      origin: 'https://web-jam.com',
      reload: vi.fn(),
      assign: vi.fn(),
    } as any;
    const { container } = render(<Provider store={store.store}><App /></Provider>);
    expect(container.firstChild).toHaveClass('App');
  });
  it('checkAppName and return <Music />', () => {
    process.env.APP_NAME = 'joshandmariamusic.com';
    const { container } = render(<BrowserRouter>{checkAppName()}</BrowserRouter>);
    expect(container.firstChild).toHaveClass('music');
  });
});
