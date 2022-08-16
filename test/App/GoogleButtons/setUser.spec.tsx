import { setUser, setUserRedux } from 'src/App/GoogleButtons/setUser';
import type { Auth } from 'src/redux/mapStoreToProps';
import jwt from 'jsonwebtoken';
import superagent from 'superagent';

describe('setUser', () => {
  // TODO fix in the next branch
  // it('dispatches the user to redux', async () => {
  //   const dispatch = jest.fn();
  //   const verifyMock: any = jest.fn(() => ({ user: 'user' }));
  //   jwt.verify = verifyMock;
  //   window.location.reload = jest.fn();
  //   await setUser(dispatch, '', {} as Auth);
  //   expect(dispatch).toHaveBeenCalled();
  //   expect(window.location.reload).toHaveBeenCalled();
  // });
  // TODO fix in the next branch
  // it('fetches the user then dispatches to redux', async () => {
  //   const dispatch = jest.fn();
  //   window.location.reload = jest.fn();
  //   const getMock: any = jest.fn(() => ({ set: () => ({ set:()=>Promise.resolve({ body: 'user' }) }) }));
  //   superagent.get = getMock;
  //   await setUserRedux(dispatch, { sub:'sub' } as any, '');
  //   expect(dispatch).toHaveBeenCalled();
  //   expect(window.location.reload).toHaveBeenCalled();
  // });
  it('setUserRedux catches error', async () => {
    const dispatch = jest.fn();
    window.location.reload = jest.fn();
    const getMock: any = jest.fn(() => ({ set: () => ({ set:()=>Promise.reject(new Error('failed')) }) }));
    superagent.get = getMock;
    await setUserRedux(dispatch, { sub:'sub' } as any, '');
    expect(window.location.reload).not.toHaveBeenCalled();
  });
});
