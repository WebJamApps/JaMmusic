import { GoogleButtons, responseGoogleFailLogin, responseGoogleLogin } from 'src/App/GoogleButtons';
import renderer from 'react-test-renderer';

describe('GoogleButtons', () => {
  it('renders GoogleLogin and runs events', () => {
    const props = {
      type: 'login', index: 1,
      appTemplateProps: { dispatch: jest.fn(), auth: { isAuthenticated: true, token: 'token' } } as any,
    };
    const gb = renderer.create(<GoogleButtons {...props} />).root;
    const login: any = gb.findByProps({ accessType: 'offline' });
    expect(login.props.onAutoLoadFinished(true)).toBe(true);
    expect(login.props.onSuccess(true)).toBe(true);
  });
  it('renders GoogleLogout and runs events', () => {
    const props = {
      type: 'logout', index: 1, appTemplateProps: { dispatch: jest.fn() } as any,
    };
    const gb = renderer.create(<GoogleButtons {...props} />).root;
    const logout: any = gb.findByProps({ buttonText: 'Logout' });
    window.location.reload = jest.fn();
    logout.props.onLogoutSuccess();
    expect(window.location.reload).toHaveBeenCalled();
  });
  it('responseGoogleFailLogin', () => {
    expect(responseGoogleFailLogin('failed')).toBe('failed');
  });
  it('catches error on responseGoogleLogin', async ()=>{
    const appTemplateProps = { dispatch:jest.fn() } as any;
    await responseGoogleLogin({} as any, appTemplateProps);
    expect(appTemplateProps.dispatch).not.toHaveBeenCalled();
  });
});
