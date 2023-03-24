import utils from 'src/containers/Music/Pictures/pictures.utils';
import scc from 'socketcluster-client';
import commonUtils from 'src/lib/utils';

describe('pictures.utils', () => {
  it('createPic successfully', async () => {
    commonUtils.delay = jest.fn();
    const transmit = jest.fn();
    const createMock:any = jest.fn(() => ({ transmit }));
    scc.create = createMock;
    const getPics = jest.fn();
    await utils.createPic(getPics, jest.fn(), {}, { token: 'token' } as any);
    expect(getPics).toHaveBeenCalled();
  });
  it('createPic catches error', async () => {
    commonUtils.delay = jest.fn();
    const transmit = jest.fn(() => { throw new Error('failed'); });
    const createMock:any = jest.fn(() => ({ transmit }));
    scc.create = createMock;
    const getPics = jest.fn();
    await utils.createPic(getPics, jest.fn(), {}, { token: 'token' } as any);
    expect(getPics).not.toHaveBeenCalled();
  });
});
