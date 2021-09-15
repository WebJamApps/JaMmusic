/* eslint-disable @typescript-eslint/no-explicit-any */
import Controller from '../../../src/containers/MusicDashboard/MusicDashboardController';

describe('MusicDashboardController', () => {
  const viewStub: any = {
    props: {
      auth: { token: 'token' },
      editPic: { _id: '5' },
      scc: { transmit: jest.fn() },
      showtable: true,
    },
    state: { title: 'title', url: 'url', comments: 'showCaption' },
  };
  it('makes a change picture webform with editPic', () => {
    const controller = new Controller(viewStub);
    const result = controller.changePicDiv();
    expect(result.type).toBe('div');
  });
  it('table is hidden', () => {
    viewStub.props.showtable = false;
    const controller = new Controller(viewStub);
    const result = controller.pictureBlock();
    expect(result.type).toBe('div');
  });
  it('handles click to addPic', () => {
    Object.defineProperty(window, 'location', { value: { assign: jest.fn(), reload: () => { } }, writable: true });
    const controller = new Controller(viewStub);
    controller.addPic();
    expect(window.location.assign).toHaveBeenCalledWith('/music');
  });
  it('handles click to delete data and passes', async () => {
    window.confirm = jest.fn(() => true);
    const controller = new Controller(viewStub);
    expect(controller.deleteData('id', 'deleteImage')).toBe(true);
  });
  it('handles click to delete data and fails', async () => {
    window.confirm = jest.fn(() => false);
    const controller = new Controller(viewStub);
    expect(controller.deleteData('id', 'deleteImage')).toBe(false);
  });
  it('handles click to delete data and fails with undefined', async () => {
    viewStub.props.scc = null;
    viewStub.props.auth = null;
    window.confirm = jest.fn(() => true);
    const controller = new Controller(viewStub);
    expect(controller.deleteData('', 'deleteImage')).toBe(false);
  });
  /* it('handles the editPicAPI', async () => {
    Object.defineProperty(window, 'location', { value: { assign: jest.fn(), reload: () => { } }, writable: true });
    const controller = new Controller(viewStub);
    controller.editPicAPI();
    expect(controller.editPicAPI).toBeCalled();
  }); */
});
