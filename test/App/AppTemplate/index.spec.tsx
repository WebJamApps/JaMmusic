import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import {
  AppTemplate, handleEscapePress, handleKeyMenu, makeDrawerClass,
} from 'src/App/AppTemplate';

describe('AppTemplate', () => {
  it('renders the component', () => {
    const props = {
      dispatch: vi.fn(),
      auth: {
        isAuthenticated: false, token: '', error: '', user: { userType: '', email: '' },
      },
      userCount: 0,
      heartBeat: 'white',
      history: {} as any,
      location: { pathname: '/' } as any,
      match: {} as any,
    };
    const { container } = render(
      <BrowserRouter><AppTemplate {...props}><div id="test-page" /></AppTemplate></BrowserRouter>,
    );
    expect(container).toMatchSnapshot();
  });
  it('makeDrawerClass', () => {
    expect(makeDrawerClass(true)).toBe('home-sidebar open drawer-container');
  });
  it('handleEscapePress', () => {
    const setMenuOpen = vi.fn();
    handleEscapePress({ key: 'Escape' }, setMenuOpen);
    expect(setMenuOpen).toHaveBeenCalledWith(false);
  });
  it('handleKeyMenu', () => {
    const setMenuOpen = vi.fn();
    handleKeyMenu({ key: 'Enter' }, false, setMenuOpen);
    expect(setMenuOpen).toHaveBeenCalledWith(true);
  });
});
