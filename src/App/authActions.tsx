import superagent from 'superagent';
import type { GoogleBody } from './AppTypes';
import type { AppTemplateProps } from './AppTemplate';

export const gotToken = (doc: unknown): { type: string; data: unknown } => ({
  type: 'GOT_TOKEN',
  data: doc,
});

export const authError = (e: unknown): { type: string; error: unknown } => ({
  type: 'AUTH_ERROR',
  error: e,
});

async function authFunc(body: GoogleBody, props: AppTemplateProps): Promise<string | Error> {
  const { auth } = props;
  if (auth.isAuthenticated) return 'authenticated';
  let data;
  try {
    data = await superagent.post(`${process.env.BackendUrl}/user/auth/google`)
      .set({ Accept: 'application/json' }).send(body);
  } catch (e) {
    props.dispatch(authError(e));
    return Promise.reject(e);
  }
  if (!data.body) {
    props.dispatch(authError(new Error('authentication failed')));
    return 'authentication failed';
  }
  props.dispatch(gotToken(data.body));
  return 'authenticated';
}

export default authFunc;
