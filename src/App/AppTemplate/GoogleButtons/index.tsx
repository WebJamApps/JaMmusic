import { CodeResponse, useGoogleLogin, googleLogout } from '@react-oauth/google';
import type { AppTemplateProps } from '..';
import type { Dispatch } from 'react';
import { authenticate } from '../authenticate';
import { setUser } from './setUser';
import { Button } from '@mui/material';
import utils from 'src/lib/commonUtils';

export const responseGoogleLogin = async (
  response: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>,
  appTemplateProps: AppTemplateProps,
): Promise<void> => {
  const { dispatch } = appTemplateProps;
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
    const { token } = await authenticate(body, appTemplateProps);
    await setUser(dispatch, token);
  } catch (e) { console.log(e); }
};

const responseGoogleLogout = async (dispatch: Dispatch<unknown>): Promise<boolean> => {
  dispatch({ type: 'LOGOUT' });
  googleLogout();
  await utils.delay(2);
  window.location.assign('/');
  return true;
};

export const GoogleButtons = (
  { type, index, appTemplateProps }: { type: string, index: number, appTemplateProps: AppTemplateProps },
): JSX.Element => {
  const { dispatch } = appTemplateProps;
  const login = useGoogleLogin({
    onSuccess: codeResponse => responseGoogleLogin(codeResponse, appTemplateProps),
    onError: () => console.log('Google login failed'),
    flow: 'auth-code',
  });
  if (type === 'login') {
    return (
      <div key={index} className="menu-item googleLogin">
        <Button variant="contained" className="loginButton" size="small" onClick={() => login()}>
          Login
        </Button>
      </div>
    );
  } return (
    <div key={index} className="menu-item googleLogout">
      <Button className="logoutButton" variant="contained" size="small" onClick={() => { responseGoogleLogout(dispatch); }}>
        Logout
      </Button>
    </div>
  );
};
