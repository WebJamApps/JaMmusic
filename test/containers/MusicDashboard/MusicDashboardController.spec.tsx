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
  it('handles onChangePic', () => {
    const viewStub2: any = {
      props: {
        auth: { token: 'token' },
        editPic: {
          _id: '123',
          title: 'picTitle',
          url: 'picUrl',
          thumbnail: 'string',
          modify: <div />,
        },
        scc: { transmit: jest.fn() },
        showtable: true,
      },
      state: { title: 'title', url: 'url', comments: 'showCaption' },
    };
    const controller = new Controller(viewStub2);
    viewStub2.instance().setState = jest.fn();
    const evt:any = { persist: jest.fn(), target: { id: 'title', value: 'title' } };
    viewStub2.update();
    controller.onChangePic(evt);
    controller.checkPicEdit();
    const s0 = {
      title: 'picTitle', url: 'picUrl',
    };
    expect(viewStub2.instance().setState).toHaveBeenCalledWith(s0);
  });
  it('checks edit when not editPic', () => {
    const viewStub2: any = {
      props: {
        auth: { token: 'token' },
        editPic: {
          _id: '123',
          title: 'picTitle',
          url: 'picUrl',
          thumbnail: 'string',
          modify: <div />,
        },
        scc: { transmit: jest.fn() },
        showtable: true,
      },
      state: { title: 'title', url: 'url', comments: 'showCaption' },
    };
    const controller = new Controller(viewStub2);
    viewStub2.instance().setState = jest.fn();
    const evt:any = { persist: jest.fn(), target: { id: 'title', value: 'title' } };
    viewStub2.update();
    const sO = {
      title: '', url: '',
    };
    controller.onChangePic(evt);
    controller.checkPicEdit();
    expect(viewStub2.instance().setState).toHaveBeenCalledWith(sO);
  });
  it('calls state in handleChangePic', () => {
    const controller = new Controller(viewStub);
    const evt:any = { persist: jest.fn(), target: { id: 'title', value: 'title' } };
    controller.onChangePic(evt);
    controller.checkPicEdit = jest.fn();
    viewStub.instance().setState = jest.fn((obj) => { expect(obj.title).toBe('title'); });
  });
  it('reset editform for pic', () => {
    const controller = new Controller(viewStub);
    viewStub.instance().setState = jest.fn((obj) => expect(obj.title).toBe(''));
    viewStub.update();
    controller.resetEditPic(null);
  });
  it('check state on resetEditPic', () => {
    const viewStub2: any = {
      props: {
        auth: { token: 'token' },
        editPic: {
          _id: '123',
          title: 'picTitle',
          url: 'picUrl',
          thumbnail: 'string',
          modify: <div />,
        },
        scc: { transmit: jest.fn() },
        showtable: true,
      },
      state: { title: 'title', url: 'url', comments: 'showCaption' },
    };
    viewStub2.instance().setState = jest.fn();
    const controller = new Controller(viewStub);
    viewStub2.setState({ title: 'beer garden' });

    const evt:any = { preventDefault: () => { } };
    controller.resetEditPic(evt);
    const sO = {
      title: '', url: '',
    };
    expect(viewStub2.instance().setState).toHaveBeenCalledWith(sO);
  });
});
