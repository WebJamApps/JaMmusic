import { CodeResponse, googleLogout } from '@react-oauth/google';
import { defaultAuth, Iauth, setUserAuth } from 'src/providers/Auth.provider';
import 'react-notifications-component/dist/theme.css';
import jwt from 'jwt-simple';
import superagent from 'superagent';
import commonUtils from 'src/lib/utils';

export interface GoogleBody {
  clientId?: string,
  redirectUri: string,
  code: string,
  state(): string,
}

const setUser = async (auth: Iauth, setAuth: (args0: Iauth) => void, token: string): Promise<void> => {
  const { sub } = jwt.decode(token, process.env.HashString as string);
  await setUserAuth(token, sub, setAuth as (arg0: any) => void, 'setAuth');
};

const authenticate = async (
  googleBody: GoogleBody,
): Promise<{ token: string, email: string }> => {
  const { body } = await superagent.post(`${process.env.BackendUrl}/user/auth/google`)
    .set({ Accept: 'application/json' }).send(googleBody);
  return body;
};

const makeState = () => () => {
  const rand = Math.random().toString(36).substr(2);
  return encodeURIComponent(rand);
};

const responseGoogleLogin = async (
  response: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>,
  auth: Iauth,
  setAuth: (arg0: Iauth) => void,
): Promise<void> => {
  try {
    const uri = window.location.href;
    const baseUri = uri.split('/')[2];
    const body = {
      clientId: process.env.GoogleClientId,
      redirectUri: !baseUri.includes('localhost')
        && process.env.NODE_ENV === 'production' ? `https://${baseUri}`
        : `http://${baseUri}`,
      code: `${response.code}`,
      state: makeState(),
    };
    const { token } = await authenticate(body);
    await setUser(auth, setAuth, token);
  } catch (e) {
    const eMessage = (e as Error).message;
    commonUtils.notify('Failed to authenticate', eMessage, 'danger');
    setAuth({ ...defaultAuth, error: eMessage });
  }
};

const responseGoogleLogout = async (setAuth: (arg0: Iauth) => void): Promise<void> => {
  googleLogout();
  setAuth(defaultAuth);
  window.location.reload();
};

export default {
  responseGoogleLogin, responseGoogleLogout, authenticate, setUser, makeState, setUserAuth,
};
