import request from 'superagent';

export const gotToken = (doc) => ({
  type: 'GOT_TOKEN',
  data: doc,
});

export const authError = (e) => ({
  type: 'AUTH_ERROR',
  error: e,
});

export const logout = () => (dispatch) => dispatch({ type: 'LOGOUT' });

const authFunc = (body) => async (dispatch, getState) => {
  const { auth } = getState();
  if (auth.isAuthenticated) return Promise.resolve(true);
  let data;
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
