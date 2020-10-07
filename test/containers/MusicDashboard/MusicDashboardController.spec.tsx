import Controller from '../../../src/containers/MusicDashboard/MusicDashboardController';

describe('MusicDashboardController', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewStub: any = {
    props: { auth: { token: 'token' }, editPic: { _id: '5' }, scc: { transmit: jest.fn() } }, state: { picTitle: 'Title', picUrl: 'url' },
  };
  it('makes a change picture webform with editPic', () => {
    const controller = new Controller(viewStub);
    const result = controller.changePicDiv();
    expect(result.type).toBe('div');
  });
  it('handles click to addPic', () => {
    Object.defineProperty(window, 'location', { value: { assign: jest.fn(), reload: () => { } }, writable: true });
    const controller = new Controller(viewStub);
    controller.addPic();
    expect(window.location.assign).toHaveBeenCalledWith('/music');
  });
});
