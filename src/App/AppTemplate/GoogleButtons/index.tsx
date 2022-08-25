import { CodeResponse, useGoogleLogin, googleLogout } from '@react-oauth/google';
import type { Dispatch } from 'react';
import { Button } from '@mui/material';
import commonUtils from 'src/lib/commonUtils';
import utils from './utils';

const responseGoogleLogout = async (dispatch: Dispatch<unknown>): Promise<boolean> => {
  dispatch({ type: 'LOGOUT' });
  googleLogout();
  await commonUtils.delay(2);
  window.location.assign('/');
  return true;
};

export const loginConfig = (dispatch: Dispatch<unknown>) => ({
  onSuccess: (codeResponse: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>) => utils.responseGoogleLogin(codeResponse, dispatch),
  onError: () => { console.log('Google login failed'); return false; },
  flow: 'auth-code',
});

export const GoogleButtons = (
  props: { type: string, index: number, dispatch: Dispatch<unknown> },
): JSX.Element => {
  const { type, index, dispatch } = props;
  const login = useGoogleLogin(loginConfig(dispatch) as Record<string, unknown>);
  if (type === 'login') {
    return (
      <div key={index} className="menu-item googleLogin">
        <Button variant="contained" className="loginButton" size="small"
          onClick={() => { login(); return 'loginClicked'; }}
        >
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
