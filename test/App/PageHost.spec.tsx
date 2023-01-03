/* eslint-disable @typescript-eslint/no-explicit-any */
import { BrowserRouter } from 'react-router-dom';
import renderer from 'react-test-renderer';
import {
  PageHost, makeDrawerClass, handleEscapePress, handleKeyMenu,
} from 'src/App/AppTemplate/PageHost';

describe('PageHost', () => {
  it('renders correctly', () => {
    const props = {
      userCount: 1,
      heartBeat: '',
      auth: {} as any,
      location: { pathname: '' },
      dispatch: jest.fn(),
      children: <div />,
    };
    const ph: any = renderer.create(<BrowserRouter><PageHost {...props} /></BrowserRouter>).toJSON();
    expect(ph.props.className).toBe('page-host');
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
