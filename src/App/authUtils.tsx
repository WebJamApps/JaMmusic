import superagent from 'superagent';
import jwt from 'jsonwebtoken';
import type { Dispatch } from 'react';
import type { GoogleLoginResponseOffline, GoogleLoginResponse } from 'react-google-login';
import type { AppTemplate } from './AppTemplate';
import type { Auth } from 'src/redux/mapStoreToProps';

const setUserRedux = async (dispatch: (...args: any) => void, decoded: string | jwt.JwtPayload, auth: Auth) => {
  if (typeof decoded !== 'string' && decoded.user) dispatch({ type: 'SET_USER', data: decoded.user });
  else {
    try {
      const user = await superagent.get(`${process.env.BackendUrl}/user/${decoded.sub}`)
        .set('Accept', 'application/json').set('Authorization', `Bearer ${auth.token}`);
      dispatch({ type: 'SET_USER', data: user.body });
      window.location.reload();
    } catch (e) { console.log(e); }
  }
};
export interface IauthUtils {
  setUser: (view: AppTemplate) => Promise<string>;
  responseGoogleLogin: (response: GoogleLoginResponseOffline | GoogleLoginResponse,
    view: AppTemplate) => Promise<string>;
  responseGoogleFailLogin: (response: unknown) => string;
  responseGoogleLogout: (dispatch: Dispatch<unknown>) => boolean;
}
const setUser = async (view: AppTemplate): Promise<void> => {
  console.log('setUser');
  const { auth, dispatch } = view.props;
  try {
    const decoded = jwt.verify(auth.token, process.env.HashString || /* istanbul ignore next */'');
    await setUserRedux(dispatch, decoded, auth);
  } catch (e) { console.log(e); }
};
const responseGoogleLogin = async (response: GoogleLoginResponseOffline | GoogleLoginResponse,
  view: AppTemplate): Promise<void> => {
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
    await view.authenticate(body, view.props);
    await setUser(view);
  } catch (e) { console.log(e); }
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
