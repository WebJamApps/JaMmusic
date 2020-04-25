import request from 'superagent';

export const gotToken = (doc: any) => ({
  type: 'GOT_TOKEN',
  data: doc,
});

export const authError = (e: any) => ({
  type: 'AUTH_ERROR',
  error: e,
});

export const logout = () => (dispatch: (...args: any) => any) => dispatch({ type: 'LOGOUT' });

const authFunc = (body: any) => async (dispatch: (...args: any) => any, getState: () => any) => {
  const { auth } = getState();
  if (auth.isAuthenticated) return Promise.resolve(true);
  let data: any;
  try {
    data = await request.post(`${process.env.BackendUrl}/user/auth/google`)
      .set({ Accept: 'application/json' }).send(body);
  } catch (e) {
    dispatch(authError(e));
    return Promise.reject(e);
  }
  if (!data.body) {
    dispatch(authError(new Error('authentication failed')));
    return Promise.resolve(false);
  }
  dispatch(gotToken(data.body));
  return Promise.resolve(true);
};

export default authFunc;
