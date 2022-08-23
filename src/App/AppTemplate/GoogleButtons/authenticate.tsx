import type { Dispatch } from 'react';
import superagent from 'superagent';
import type { AppTemplateProps } from '..';

export interface GoogleBody {
  clientId?: string,
  redirectUri: string,
  code: string,
  state(): string,
}

export const gotToken = (doc: unknown): { type: string; data: unknown } => ({
  type: 'GOT_TOKEN',
  data: doc,
});

export const authError = (e: unknown): { type: string; error: unknown } => ({
  type: 'AUTH_ERROR',
  error: e,
});

export const authenticate = async (
  googleBody: GoogleBody, dispatch:Dispatch<unknown>,
): Promise<{ token:string, email:string }> => {
  const { body } = await superagent.post(`${process.env.BackendUrl}/user/auth/google`)
    .set({ Accept: 'application/json' }).send(googleBody);
  dispatch(gotToken(body));
  return body;
};
