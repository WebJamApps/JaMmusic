import { GoogleLogout, GoogleLogin, GoogleLoginResponseOffline, GoogleLoginResponse } from 'react-google-login';
import type { AppTemplateProps } from '../AppTemplate';
import type { Dispatch } from 'react';
import { authenticate } from './authenticate';
import { setUser } from './setUser';

const responseGoogleLogin = async (
  response: GoogleLoginResponseOffline | GoogleLoginResponse,
  appTemplateProps: AppTemplateProps,
): Promise<void> => {
  const uri = window.location.href;
  const baseUri = uri.split('/')[2];
  const body = {
    clientId: process.env.GoogleClientId,
    redirectUri: /* istanbul ignore next */!baseUri.includes('localhost')
        && process.env.NODE_ENV === 'production' ? `https://${baseUri}` : `http://${baseUri}`,
    code: `${response.code}`,
    /* istanbul ignore next */state() {
      const rand = Math.random().toString(36).substr(2);
      return encodeURIComponent(rand);
    },
  };
  try {
    const token = await authenticate(body, appTemplateProps);
    await setUser(appTemplateProps.dispatch, token, appTemplateProps.auth);
  } catch (e) { console.log(e); }
};

const responseGoogleFailLogin = (response: unknown): string => `${response}`;

const responseGoogleLogout = (dispatch: Dispatch<unknown>): boolean => {
  dispatch({ type: 'LOGOUT' });
  window.location.reload();
  return true;
};

export const GoogleButtons = (
  { type, index, appTemplateProps }:{ type:string, index:number, appTemplateProps: AppTemplateProps },
): JSX.Element => {
  const cId = process.env.GoogleClientId || /* istanbul ignore next */'';
  const { dispatch } = appTemplateProps;
  if (type === 'login') {
    return (
        <div key={index} className="menu-item googleLogin">
          <GoogleLogin
            // eslint-disable-next-line no-console
            onAutoLoadFinished={(good) => { console.log(good); return good; }}
            responseType="code"
            clientId={cId}
            buttonText="Login"
            accessType="offline"
            onSuccess={(response)=>responseGoogleLogin(response, appTemplateProps)}
            onFailure={responseGoogleFailLogin}
            cookiePolicy="single_host_origin"
          />
        </div>
    );
  } return (
      <div key={index} className="menu-item googleLogout">
        <GoogleLogout clientId={cId} buttonText="Logout" onLogoutSuccess={()=>responseGoogleLogout(dispatch)} />
      </div>
  );
};
