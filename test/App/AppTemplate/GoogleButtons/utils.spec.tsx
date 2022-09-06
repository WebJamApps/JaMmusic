import utils from 'src/App/AppTemplate/GoogleButtons/utils';
import commonUtils from 'src/lib/commonUtils';
import superagent from 'superagent';
import jwt from 'jsonwebtoken';

describe('GoogleButtons/utils', () => {
  it('responseGoogleLogout', async () => {
    commonUtils.delay = jest.fn();
    window.location.assign = jest.fn();
    const dispatch = jest.fn();
    await utils.responseGoogleLogout(dispatch);
    expect(window.location.assign).toHaveBeenCalledWith('/');
  });
  it('responseGoogleLogin', async () => {
    window.location.reload = jest.fn();
    const dispatch = jest.fn();
    const vMock:any = jest.fn(() => ({ sub: '' }));
    jwt.verify = vMock;
    const getMock:any = jest.fn(() => ({ set: () => ({ set: () => Promise.resolve({ body: {} }) }) }));
    const postMock:any = jest.fn(() => ({ set: () => ({ send: () => Promise.resolve({ body: { token: '', email: '' } }) }) }));
    superagent.post = postMock;
    superagent.get = getMock;
    await utils.responseGoogleLogin({ code: '' } as any, dispatch);
    expect(window.location.reload).toHaveBeenCalled();
  });
  it('makeState', () => {
    const state = utils.makeState();
    const result = state();
    expect(typeof result).toBe('string');
  });
});
