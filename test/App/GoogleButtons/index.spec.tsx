/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleButtons, responseGoogleLogin } from 'src/App/AppTemplate/GoogleButtons';
import renderer from 'react-test-renderer';

describe('GoogleButtons', () => {
  it('is defined', ()=>{
    expect(GoogleButtons).toBeDefined();
  });
  // it('renders GoogleLogin and runs events', () => {
  //   const props = {
  //     type: 'login', index: 1, dispatch: jest.fn(),
  //   };
  //   const gb = renderer.create(<GoogleOAuthProvider clientId=""><GoogleButtons {...props} /></GoogleOAuthProvider>).root;
  //   const loginButton: any = gb.findByProps({ className: 'loginButton' });
  //   expect(loginButton.props.onClick()).toBe('loginClicked');
  // });
  // it('renders GoogleLogout and runs events', () => {
  //   const props = {
  //     type: 'logout', index: 1, appTemplateProps: { dispatch: jest.fn() } as any,
  //   };
  //   const gb = renderer.create(<GoogleOAuthProvider clientId=""><GoogleButtons {...props} /></GoogleOAuthProvider>).root;
  //   const logout: any = gb.findByProps({ className: 'logoutButton' });
  //   expect(logout).toBeDefined();
  // });
  it('catches error on responseGoogleLogin', async () => {
    const appTemplateProps = { dispatch: jest.fn() } as any;
    await responseGoogleLogin({} as any, appTemplateProps);
    expect(appTemplateProps.dispatch).not.toHaveBeenCalled();
  });
});
