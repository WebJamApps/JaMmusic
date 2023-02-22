import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import {
  AppTemplate, handleEscapePress, handleKeyMenu, makeDrawerClass,
} from 'src/App/AppTemplate';
import { CategoryButtons } from 'src/containers/Songs/MusicPlayer';

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
  it('does not render the CategoryButtons when isSingle', () => {
    const props = {
      category: 'original', setCategory: jest.fn(), isSingle: true,
    };
    const cb:any = renderer.create(<CategoryButtons {...props} />).toJSON();
    expect(cb).toBe(' ');
  });
  it('renders CategoryButtons and handles events', () => {
    const props = {
      category: 'original', setCategory: jest.fn(), isSingle: false,
    };
    const cb:any = renderer.create(<CategoryButtons {...props} />).root;
    const buttons = cb.findAllByProps({ type: 'button' });
    buttons[0].props.onClick();
    expect(props.setCategory).toHaveBeenCalledWith('original');
    buttons[1].props.onClick();
    expect(props.setCategory).toHaveBeenCalledWith('mission');
    buttons[2].props.onClick();
    expect(props.setCategory).toHaveBeenCalledWith('pub');
  });
});
