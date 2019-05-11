import request from 'superagent';

// export const fetchImages = () => ({
//   type: 'FETCH_IMAGES',
// });

export const gotToken = doc => ({
  type: 'GOT_TOKEN',
  data: doc,
});

export const authError = e => ({
  type: 'AUTH_ERROR',
  error: e,
});

const authFunc = body => (dispatch, getState) => {
  const { auth } = getState();
  // const type = 'JaMmusic-music';
  if (auth.isAuthenticated) return Promise.resolve(true);
  // dispatch(fetchImages());
  return request.post(`${process.env.BackendUrl}/user/auth/react-google`).set('Accept', 'application/json').send(body)
    .then((data) => {
      if (!data.body) return dispatch(authError(new Error('authentication failed')));
      // console.log(data.body);
      return dispatch(gotToken(data.body));
    })
    .catch(err => dispatch(authError(err)));
};

export default authFunc;
