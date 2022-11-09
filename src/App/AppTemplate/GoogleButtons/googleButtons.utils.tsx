import { CodeResponse, googleLogout } from '@react-oauth/google';
import { defaultAuth, Iauth } from 'src/providers/Auth.provider';
import 'react-notifications-component/dist/theme.css';
import jwt from 'jsonwebtoken';
import superagent from 'superagent';
import commonUtils from 'src/lib/commonUtils';

export interface GoogleBody {
  clientId?: string,
  redirectUri: string,
  code: string,
  state(): string,
}

const setUserAuth = async (
  auth:Iauth,
  setAuth: (arg0:Iauth)=>void,
  token: string,
  userId: string | undefined,
) => {
  const { body } = await superagent.get(`${process.env.BackendUrl}/user/${userId}`)
    .set('Accept', 'application/json').set('Authorization', `Bearer ${token}`);
  setAuth({ ...auth, user: body });
};

const setUser = async (auth:Iauth, setAuth:(args0:Iauth)=>void, token:string): Promise<void> => {
  const { sub } = jwt.verify(token, process.env.HashString as string) as jwt.JwtPayload;
  await setUserAuth(auth, setAuth, token, sub);
};

const authenticate = async (
  googleBody: GoogleBody,
): Promise<{ token:string, email:string }> => {
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
  auth:Iauth,
  setAuth: (arg0:Iauth)=>void,
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
  }
};

const responseGoogleLogout = async (setAuth:(arg0:Iauth)=>void): Promise<void> => {
  setAuth(defaultAuth);
  googleLogout();
  await commonUtils.delay(2);
  window.location.assign('/');
};

export default {
  responseGoogleLogin, responseGoogleLogout, authenticate, setUser, makeState,
};
