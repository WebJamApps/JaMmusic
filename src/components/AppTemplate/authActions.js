import request from 'superagent';

export const gotToken = doc => ({
  type: 'GOT_TOKEN',
  data: doc,
});

export const authError = e => ({
  type: 'AUTH_ERROR',
  error: e,
});

export const logout = () => dispatch => dispatch({ type: 'LOGOUT' });

const authFunc = body => (dispatch, getState) => {
  const { auth } = getState();
  if (auth.isAuthenticated) return Promise.resolve(true);
  return request.post(`${process.env.BackendUrl}/user/auth/google`)
    .set({ Accept: 'application/json' }).send(body)
    .then((data) => {
      if (!data.body) return dispatch(authError(new Error('authentication failed')));
      // console.log(data.body);
      return dispatch(gotToken(data.body));
    })
    .catch(err => dispatch(authError(err)));
};

export default authFunc;
