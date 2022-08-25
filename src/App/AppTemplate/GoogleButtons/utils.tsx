import type { CodeResponse } from '@react-oauth/google';
import type { Dispatch } from 'react';
import { authenticate } from './authenticate';
import { setUser } from './setUser';

const responseGoogleLogin = async (
  response: Omit<CodeResponse, 'error' | 'error_description' | 'error_uri'>, dispatch: Dispatch<unknown>,
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

export default { responseGoogleLogin };
