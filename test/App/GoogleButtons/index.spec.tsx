import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleButtons, responseGoogleLogin } from 'src/App/AppTemplate/GoogleButtons';
import renderer from 'react-test-renderer';

describe('GoogleButtons', () => {
  // it('renders GoogleLogin and runs events', () => {
  //   const props = {
  //     type: 'login', index: 1,
  //     appTemplateProps: { dispatch: jest.fn(), auth: { isAuthenticated: true, token: 'token' } } as any,
  //   };
  //   const gb = renderer.create(<GoogleOAuthProvider clientId=""><GoogleButtons {...props} /></GoogleOAuthProvider>).root;
  //   const login: any = gb.findByProps({ className: 'loginButton' });
  //   expect(login).toBeDefined();
  // });
  // it('renders GoogleLogout and runs events', () => {
  //   const props = {
  //     type: 'logout', index: 1, appTemplateProps: { dispatch: jest.fn() } as any,
  //   };
  //   const gb = renderer.create(<GoogleOAuthProvider clientId=""><GoogleButtons {...props} /></GoogleOAuthProvider>).root;
  //   const logout: any = gb.findByProps({ className: 'logoutButton' });
  //   expect(logout).toBeDefined();
  // });
  it('catches error on responseGoogleLogin', async ()=>{
    const appTemplateProps = { dispatch:jest.fn() } as any;
    await responseGoogleLogin({} as any, appTemplateProps);
    expect(appTemplateProps.dispatch).not.toHaveBeenCalled();
  });
});
