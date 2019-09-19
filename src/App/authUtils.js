import request from 'superagent';
import jwt from 'jwt-simple';
import authenticate, { logout } from './authActions';

const setUser = async (controller) => {
  const { auth, dispatch } = controller.props;
  const decoded = jwt.decode(auth.token, process.env.HashString);
  console.log(decoded);// eslint-disable-line no-console
  let user;
  try {
    user = await request.get(`${process.env.BackendUrl}/user/${decoded.sub}`)
      .set('Accept', 'application/json').set('Authorization', `Bearer ${auth.token}`);
  } catch (e) { return console.log(e.message); } // eslint-disable-line no-console
  console.log(user.body);// eslint-disable-line no-console
  dispatch({ type: 'SET_USER', data: user.body });
  if (!decoded.user) {
    decoded.user = user.body;
    const newToken = jwt.encode(decoded, process.env.HashString);
    dispatch({ type: 'GOT_TOKEN', data: { token: newToken, email: auth.email } });
  }
  return window.location.reload();
};
const responseGoogleLogin = async (response, controller) => {
  const { dispatch } = controller.props;
  const uri = window.location.href;
  const baseUri = uri.split('/')[2];
  const body = {
    clientId: process.env.GoogleClientId,
    redirectUri: process.env.NODE_ENV === 'production' ? /* istanbul ignore next */`https://${baseUri}` : `http://${baseUri}`,
    code: `${response.code}`,
    /* istanbul ignore next */state() {
      const rand = Math.random().toString(36).substr(2);
      return encodeURIComponent(rand);
    },
  };
  await dispatch(authenticate(body));
  return setUser(controller);
};

const responseGoogleFailLogin = (response) => {
  console.log(response);// eslint-disable-line no-console
  return false;
};

const responseGoogleLogout = (response, dispatch) => {
  console.log('logged out');// eslint-disable-line no-console
  console.log(response);// eslint-disable-line no-console
  dispatch(logout());
  if (window.location.href.includes('/dashboard')) window.location.assign('/music');
};

export default { responseGoogleLogin, responseGoogleLogout, responseGoogleFailLogin };
