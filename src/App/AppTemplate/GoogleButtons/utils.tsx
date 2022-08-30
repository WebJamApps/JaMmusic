import { CodeResponse, googleLogout } from '@react-oauth/google';
import type { Dispatch } from 'react';
import jwt from 'jsonwebtoken';
import superagent from 'superagent';
import commonUtils from 'src/lib/commonUtils';

export interface GoogleBody {
  clientId?: string,
  redirectUri: string,
  code: string,
  state(): string,
}

const setUserRedux = async (dispatch: (...args: any) => void, token: string, userId: string) => {
  try {
    const user = await superagent.get(`${process.env.BackendUrl}/user/${userId}`)
      .set('Accept', 'application/json').set('Authorization', `Bearer ${token}`);
    dispatch({ type: 'SET_USER', data: user.body });
    window.location.reload();
  } catch (e) { console.log(e); }
};

const setUser = async (dispatch: Dispatch<unknown>, token:string): Promise<void> => {
  let userId;
  try {
    const { sub } = jwt.verify(token, process.env.HashString /* istanbul ignore next */|| '') as jwt.JwtPayload;
    userId = sub;
  } catch (e) { console.log(e); }
  await setUserRedux(dispatch, token, userId || '');
};

const gotToken = (doc: unknown): { type: string; data: unknown } => ({
  type: 'GOT_TOKEN',
  data: doc,
});

const authenticate = async (
  googleBody: GoogleBody, dispatch:Dispatch<unknown>,
): Promise<{ token:string, email:string }> => {
  const { body } = await superagent.post(`${process.env.BackendUrl}/user/auth/google`)
    .set({ Accept: 'application/json' }).send(googleBody);
  dispatch(gotToken(body));
  return body;
};

const makeState = () => () => {
  const rand = Math.random().toString(36).substr(2);
  return encodeURIComponent(rand);
};

const responseGoogleLogin = async (
  response: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>, dispatch: Dispatch<unknown>,
): Promise<void> => {
  const uri = window.location.href;
  const baseUri = uri.split('/')[2];
  const body = {
    clientId: process.env.GoogleClientId,
    redirectUri: !baseUri.includes('localhost') 
    && process.env.NODE_ENV === 'production' /* istanbul ignore next */? `https://${baseUri}` 
      : `http://${baseUri}`,
    code: `${response.code}`,
    state: makeState(),
  };
  try {
    const { token } = await authenticate(body, dispatch);
    await setUser(dispatch, token);
  } catch (e) { console.log(e); }
};

const responseGoogleLogout = async (dispatch: Dispatch<unknown>): Promise<void> => {
  dispatch({ type: 'LOGOUT' });
  googleLogout();
  await commonUtils.delay(2);
  window.location.assign('/');
};

export default { responseGoogleLogin, responseGoogleLogout, authenticate, setUser, makeState };
