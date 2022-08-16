import superagent from 'superagent';
import jwt from 'jsonwebtoken';
import type { AppTemplateProps } from '../AppTemplate';

export const setUserRedux = async (dispatch: (...args: any) => void, token: string, userId: string) => {
  try {
    const user = await superagent.get(`${process.env.BackendUrl}/user/${userId}`)
      .set('Accept', 'application/json').set('Authorization', `Bearer ${token}`);
    dispatch({ type: 'SET_USER', data: user.body });
    window.location.reload();
  } catch (e) { console.log(e); }
};

export const setUser = async (dispatch: AppTemplateProps['dispatch'], token:string): Promise<void> => {
  let userId;
  try {
    const { sub } = jwt.verify(token, process.env.HashString || /* istanbul ignore next */'') as jwt.JwtPayload;
    userId = sub;
  } catch (e) { console.log(e); }
  await setUserRedux(dispatch, token, userId || '');
};

