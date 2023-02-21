import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import {
  AppTemplate, handleEscapePress, handleKeyMenu, makeDrawerClass,
} from 'src/App/AppTemplate';

describe('AppTemplate', () => {
  it('renders the component', () => {
    const props = {
      dispatch: jest.fn(),
      auth: {
        isAuthenticated: false, token: '', error: '', user: { userType: '', email: '' },
      },
      userCount: 0,
      heartBeat: 'white',
      history: {} as any,
      location: { pathname: '/' } as any,
      match: {} as any,
    };
    const at = renderer.create(
      <BrowserRouter><AppTemplate {...props}><div id="test-page" /></AppTemplate></BrowserRouter>,
    ).toJSON();
    expect(at).toMatchSnapshot();
  });
  it('makeDrawerClass', () => {
    expect(makeDrawerClass(true)).toBe('home-sidebar open drawer-container');
  });
  it('handleEscapePress', () => {
    const setMenuOpen = jest.fn();
    handleEscapePress({ key: 'Escape' }, setMenuOpen);
    expect(setMenuOpen).toHaveBeenCalledWith(false);
  });
  it('handleKeyMenu', () => {
    const setMenuOpen = jest.fn();
    handleKeyMenu({ key: 'Enter' }, false, setMenuOpen);
    expect(setMenuOpen).toHaveBeenCalledWith(true);
  });
});
