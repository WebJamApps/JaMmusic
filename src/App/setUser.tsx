import superagent from 'superagent';
import jwt from 'jsonwebtoken';
import type { Dispatch } from 'react';
import type { GoogleLoginResponseOffline, GoogleLoginResponse } from 'react-google-login';
import type { AppTemplate } from './AppTemplate';
import type { Auth } from 'src/redux/mapStoreToProps';

const setUserRedux = async (dispatch: (...args: any) => void, decoded: string | jwt.JwtPayload, auth: Auth) => {
  if (typeof decoded !== 'string' && decoded.user) {
    dispatch({ type: 'SET_USER', data: decoded.user });
    window.location.reload();
  } else {
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
export const setUser = async (props: { auth: any; dispatch: any; }): Promise<void> => {
  const { auth, dispatch } = props;
  try {
    const decoded = jwt.verify(auth.token, process.env.HashString || /* istanbul ignore next */'');
    await setUserRedux(dispatch, decoded, auth);
  } catch (e) { console.log(e); }
};

