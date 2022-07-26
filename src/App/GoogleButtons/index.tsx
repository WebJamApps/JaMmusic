//import { GoogleLogout, GoogleLogin, GoogleLoginResponseOffline, GoogleLoginResponse } from 'react-google-login';
import { useGoogleLogin } from '@react-oauth/google';
import type { AppTemplateProps } from '../AppTemplate';
import type { Dispatch } from 'react';
import { authenticate } from './authenticate';
import { setUser } from './setUser';
import { Button } from '@mui/material';

export const responseGoogleLogin = async (
  response: any,
  appTemplateProps: AppTemplateProps,
): Promise<void> => {
  console.log(response);
  const uri = window.location.href;
  const baseUri = uri.split('/')[2];
  const body = {
    clientId: process.env.GoogleClientId,
    redirectUri: /* istanbul ignore next */!baseUri.includes('localhost')
      && process.env.NODE_ENV === 'production' ? `https://${baseUri}` : `http://${baseUri}`,
    code: `${response.code}`,
    /* istanbul ignore next */state() {
      const rand = Math.random().toString(36).substr(2);
      return encodeURIComponent(rand);
    },
  };
  try {
    const token = await authenticate(body, appTemplateProps);
    await setUser(appTemplateProps.dispatch, token, appTemplateProps.auth);
  } catch (e) { console.log(e); }
};

export const responseGoogleFailLogin = (response: string): string => `${response}`;

const responseGoogleLogout = (dispatch: Dispatch<unknown>): boolean => {
  dispatch({ type: 'LOGOUT' });
  window.location.reload();
  return true;
};

export const GoogleButtons = (
  { type, index, appTemplateProps }: { type: string, index: number, appTemplateProps: AppTemplateProps },
): JSX.Element => {
  // const cId = process.env.GoogleClientId || /* istanbul ignore next */'';
  const { dispatch } = appTemplateProps;
  const login = useGoogleLogin({
    onSuccess: codeResponse => responseGoogleLogin(codeResponse, appTemplateProps),
    flow: 'auth-code',
  });
  if (type === 'login') {
    return (
      <div key={index} className="menu-item googleLogin">
        <Button
          onClick={() => login()}
        // eslint-disable-next-line no-console
        // onAutoLoadFinished={(good) => { console.log(good); return good; }}
        // responseType="code"
        // clientId={cId}
        // buttonText="Login"
        // accessType="offline"
        // onSuccess={(response) => { responseGoogleLogin(response, appTemplateProps); return response; }}
        // onError={() => { const msg = 'login failed'; console.log(msg); return responseGoogleFailLogin(msg); }}
        // // cookiePolicy="single_host_origin"
        >
          Login
        </Button>
      </div>
    );
  } return (
    <div key={index} className="menu-item googleLogout">
      <Button onClick={() => { responseGoogleLogout(dispatch); }}>Logout</Button>
    </div>
  );
};
