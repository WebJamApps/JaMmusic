/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleButtons, loginConfig } from 'src/App/AppTemplate/GoogleButtons';
import utils from 'src/App/AppTemplate/GoogleButtons/utils';
import renderer from 'react-test-renderer';

describe('GoogleButtons', () => {
  it('is defined', () => {
    expect(GoogleButtons).toBeDefined();
  });
  it('renders GoogleLogin and runs events', () => {
    const props = {
      type: 'login', index: 1, dispatch: jest.fn(),
    };
    const gb = renderer.create(<GoogleButtons {...props} />).root;
    const loginButton: any = gb.findByProps({ className: 'loginButton' });
    expect(loginButton.props.onClick()).toBe('loginClicked');
  });
  it('runs loginConfig onSuccess and onError', ()=>{
    const dispatch = jest.fn();
    utils.responseGoogleLogin = jest.fn();
    const config = loginConfig(dispatch);
    config.onSuccess({ code:'token', scope:'' });
    expect(utils.responseGoogleLogin).toHaveBeenCalled();
    expect(config.onError()).toBe(false);
  });
  // it('renders GoogleLogout and runs events', () => {
  //   const props = {
  //     type: 'logout', index: 1, appTemplateProps: { dispatch: jest.fn() } as any,
  //   };
  //   const gb = renderer.create(<GoogleOAuthProvider clientId=""><GoogleButtons {...props} /></GoogleOAuthProvider>).root;
  //   const logout: any = gb.findByProps({ className: 'logoutButton' });
  //   expect(logout).toBeDefined();
  // });
  // it('catches error on responseGoogleLogin', async () => {
  //   const appTemplateProps = { dispatch: jest.fn() } as any;
  //   await responseGoogleLogin({} as any, appTemplateProps);
  //   expect(appTemplateProps.dispatch).not.toHaveBeenCalled();
  // });
});
