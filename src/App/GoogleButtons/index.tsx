import { CodeResponse, useGoogleLogin, googleLogout } from '@react-oauth/google';
import type { AppTemplateProps } from '../AppTemplate';
import type { Dispatch } from 'react';
import { authenticate } from './authenticate';
import { setUser } from './setUser';
import { Button } from '@mui/material';

export const responseGoogleLogin = async (
  response: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>,
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
  googleLogout();
  dispatch({ type: 'LOGOUT' });
  window.location.reload();
  return true;
};

export const GoogleButtons = (
  { type, index, appTemplateProps }: { type: string, index: number, appTemplateProps: AppTemplateProps },
): JSX.Element => {
  const { dispatch } = appTemplateProps;
  const login = useGoogleLogin({
    onSuccess: codeResponse => responseGoogleLogin(codeResponse, appTemplateProps),
    flow: 'auth-code',
  });
  if (type === 'login') {
    return (
      <div key={index} className="menu-item googleLogin">
        <Button variant="contained" size="small" onClick={() => login()}>
          Login
        </Button>
      </div>
    );
  } return (
    <div key={index} className="menu-item googleLogout">
      <Button variant="contained" size="small" onClick={() => { responseGoogleLogout(dispatch); }}>
        Logout
      </Button>
    </div>
  );
};
