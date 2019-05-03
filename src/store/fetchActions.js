import request from 'superagent';
import store from '.';

export const fetchImages = () => ({
  type: 'FETCH_IMAGES'
});

export const receiveImages = docs => ({
  type: 'FETCHED_IMAGES',
  data: docs
});

export const receiveError = e => ({
  type: 'RECEIVE_ERROR',
  error: e
});

const getImages = () => (dispatch, getState) => {
  const { images } = getState();
  if (images.length > 0) return Promise.resolve(true);
  store.store.dispatch(fetchImages());
  return request.get('https://api.github.com/users/JoshuaVSherman').set('Accept', 'application/json')
    .then((data) => {
      if (data.body.message === 'Not Found') return dispatch(receiveError(new Error('No such user found!!')));
      return dispatch(receiveImages([data.body]));
    })
    .catch(err => dispatch(receiveError(err)));
};

export default getImages;
