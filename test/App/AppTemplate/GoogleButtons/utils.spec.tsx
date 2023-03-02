import utils from 'src/App/AppTemplate/GoogleButtons/utils';

describe('GoogleButtons/utils', () => {
  it('responseGoogleLogout', async () => {
    window.location.reload = jest.fn();
    const setAuth = jest.fn();
    await utils.responseGoogleLogout(setAuth);
    expect(window.location.reload).toHaveBeenCalled();
  });
  it('makeState', () => {
    const state = utils.makeState();
    const result = state();
    expect(typeof result).toBe('string');
  });
});
