import { CodeResponse, useGoogleLogin, googleLogout } from '@react-oauth/google';
import type { Dispatch } from 'react';
import { authenticate } from './authenticate';
import { setUser } from './setUser';
import { Button } from '@mui/material';
import utils from 'src/lib/commonUtils';

export const responseGoogleLogin = async (
  response: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>, dispatch:Dispatch<unknown>,
): Promise<void> => {
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
    const { token } = await authenticate(body, dispatch);
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
  props: { type: string, index: number, dispatch:Dispatch<unknown> },
): JSX.Element => {
  const { type, index, dispatch } = props;
  const login = useGoogleLogin({
    onSuccess: codeResponse => responseGoogleLogin(codeResponse, dispatch),
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
