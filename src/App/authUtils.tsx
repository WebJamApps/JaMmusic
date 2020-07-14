import superagent from 'superagent';
import jwt from 'jwt-simple';
import { Dispatch } from 'react';
import { GoogleLoginResponseOffline, GoogleLoginResponse } from 'react-google-login';
import type { AppTemplate } from './AppTemplate';

export interface IauthUtils {
  setUser: (view: AppTemplate) => Promise<string>;
  responseGoogleLogin: (response: GoogleLoginResponseOffline | GoogleLoginResponse,
    view: AppTemplate) => Promise<string>;
  responseGoogleFailLogin: (response: unknown) => string;
  responseGoogleLogout: (dispatch: Dispatch<unknown>) => boolean;

}
const setUser = async (view: AppTemplate): Promise<string> => {
  const { auth, dispatch } = view.props;
  let decoded, user;
  try {
    decoded = jwt.decode(auth.token, process.env.HashString || /* istanbul ignore next */'');
  } catch (e) { return `${e.message}`; }
  if (decoded.user) dispatch({ type: 'SET_USER', data: decoded.user });
  else {
    try {
      user = await superagent.get(`${process.env.BackendUrl}/user/${decoded.sub}`)
        .set('Accept', 'application/json').set('Authorization', `Bearer ${auth.token}`);
    } catch (e) { return `${e.message}`; }
    dispatch({ type: 'SET_USER', data: user.body });
    decoded.user = user.body;
    const newToken = jwt.encode(decoded, process.env.HashString || /* istanbul ignore next */'');
    dispatch({ type: 'GOT_TOKEN', data: { token: newToken, email: auth.email } });
  }
  window.location.reload();
  return 'set user';
};
const responseGoogleLogin = async (response: GoogleLoginResponseOffline | GoogleLoginResponse,
  view: AppTemplate): Promise<string> => {
  const uri = window.location.href;
  const baseUri = uri.split('/')[2];
  const body = {
    clientId: process.env.GoogleClientId,
    redirectUri: /* istanbul ignore next */process.env.NODE_ENV === 'production' ? `https://${baseUri}` : `http://${baseUri}`,
    code: `${response.code}`,
    /* istanbul ignore next */state() {
      const rand = Math.random().toString(36).substr(2);
      return encodeURIComponent(rand);
    },
  };
  try { await view.authenticate(body, view.props); } catch (e) {
    return `${e.message}`;
  }
  return setUser(view);
};
const responseGoogleFailLogin = (response: unknown): string => `${response}`;
const responseGoogleLogout = (dispatch: Dispatch<unknown>): boolean => {
  dispatch({ type: 'LOGOUT' });
  window.location.reload();
  return true;
};

export default {
  responseGoogleLogin, responseGoogleLogout, responseGoogleFailLogin, setUser,
};
