/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleButtons, loginConfig } from 'src/App/AppTemplate/GoogleButtons';
import utils from 'src/App/AppTemplate/GoogleButtons/utils';
import renderer from 'react-test-renderer';

describe('GoogleButtons', () => {
  it('is defined', () => {
    expect(GoogleButtons).toBeDefined();
  });
  it('renders GoogleLogin button and runs events', () => {
    const props = {
      type: 'login', index: 1, dispatch: jest.fn(),
    };
    const gb = renderer.create(<GoogleButtons {...props} />).root;
    const loginButton: any = gb.findByProps({ className: 'loginButton' });
    expect(loginButton.props.onClick()).toBe('loginClicked');
  });
  it('runs loginConfig onSuccess and onError', () => {
    const setAuth = jest.fn();
    utils.responseGoogleLogin = jest.fn();
    const config = loginConfig({} as any, setAuth);
    config.onSuccess({ code: 'token', scope: '' });
    expect(utils.responseGoogleLogin).toHaveBeenCalled();
    expect(config.onError()).toBe(false);
  });
  it('renders GoogleLogout button and handles click', () => {
    utils.responseGoogleLogout = jest.fn();
    const props = {
      type: 'logout', index: 1, dispatch: jest.fn(),
    };
    const gb = renderer.create(<GoogleButtons {...props} />).root;
    const logout: any = gb.findByProps({ className: 'logoutButton' });
    logout.props.onClick();
    expect(utils.responseGoogleLogout).toHaveBeenCalled();
  });
});
