import superagent from 'superagent';
import jwt from 'jsonwebtoken';
import type { AppTemplateProps } from './AppTemplate';
import type { Auth } from 'src/redux/mapStoreToProps';

const setUserRedux = async (dispatch: (...args: any) => void, decoded: jwt.JwtPayload, token: string) => {
  if (typeof decoded !== 'string' && decoded.user) {
    dispatch({ type: 'SET_USER', data: decoded.user });
    window.location.reload();
  } else {
    try {
      const user = await superagent.get(`${process.env.BackendUrl}/user/${decoded.sub}`)
        .set('Accept', 'application/json').set('Authorization', `Bearer ${token}`);
      dispatch({ type: 'SET_USER', data: user.body });
      window.location.reload();
    } catch (e) { console.log(e); }
  }
};

export const setUser = async (dispatch: AppTemplateProps['dispatch'], token: string, auth: Auth): Promise<void> => {
  try {
    const decoded = jwt.verify(token, process.env.HashString || /* istanbul ignore next */'') as jwt.JwtPayload;
    console.log(decoded);
    await setUserRedux(dispatch, decoded, token);
  } catch (e) { console.log(e); }
};

