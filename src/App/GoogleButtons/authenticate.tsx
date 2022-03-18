import superagent from 'superagent';
import type { GoogleBody } from '../AppTypes';
import type { AppTemplateProps } from '../AppTemplate';

export const gotToken = (doc: unknown): { type: string; data: unknown } => ({
  type: 'GOT_TOKEN',
  data: doc,
});

export const authError = (e: unknown): { type: string; error: unknown } => ({
  type: 'AUTH_ERROR',
  error: e,
});

export const authenticate = async (
  body: GoogleBody, props: AppTemplateProps,
): Promise<string> => {
  const { auth, dispatch } = props;
  if (auth.isAuthenticated) return auth.token;
  let data;
  try {
    data = await superagent.post(`${process.env.BackendUrl}/user/auth/google`)
      .set({ Accept: 'application/json' }).send(body);
  } catch (e) {
    dispatch(authError(e));
    return Promise.reject(e);
  }
  if (!data.body) {
    dispatch(authError(new Error('authentication failed')));
    return 'authentication failed';
  }
  dispatch(gotToken(data.body));
  return data.body.token;
};
