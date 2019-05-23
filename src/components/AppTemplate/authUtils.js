import authenticate, { logout } from './authActions';

const responseGoogleLogin = (response, dispatch) => { // eslint-disable-line class-methods-use-this
  console.log(response);// eslint-disable-line no-console
  document.getElementsByClassName('googleLogin')[0].style.display = 'none';
  document.getElementsByClassName('googleLogout')[0].style.display = 'block';
  const uri = window.location.href;
  const baseUri = uri.split('/')[2];
  const body = {
    clientId: process.env.GoogleClientId,
    redirectUri: `http://${baseUri}`,
    code: `${response.code}`,
    /* istanbul ignore next */state() {
      const rand = Math.random().toString(36).substr(2);
      return encodeURIComponent(rand);
    },
  };
  return dispatch(authenticate(body));
};

const responseGoogleFailLogin = (response) => { // eslint-disable-line class-methods-use-this
  console.log(response);// eslint-disable-line no-console
  return false;
};

const responseGoogleLogout = (response, dispatch) => { // eslint-disable-line class-methods-use-this
  console.log('logged out');// eslint-disable-line no-console
  console.log(response);// eslint-disable-line no-console
  dispatch(logout());
  window.location.reload();
};

export default { responseGoogleLogin, responseGoogleLogout, responseGoogleFailLogin };
