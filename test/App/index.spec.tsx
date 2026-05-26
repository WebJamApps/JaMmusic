/* eslint-disable @typescript-eslint/no-explicit-any */
import env from 'dotenv';
import { App, checkAppName } from 'src/App';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import store from 'src/redux/store/index';
import { BrowserRouter } from 'react-router-dom';

env.config();
describe('App component', () => {
  it('is defined', () => {
    expect(App).toBeDefined();
  });
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
