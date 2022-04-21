/* eslint-disable @typescript-eslint/no-explicit-any */

import Controller from '../../../src/containers/MusicDashboard/MusicDashboardController';

describe('MusicDashboardController', () => {
  const viewStub: any = {
    props: {
      dispatch: jest.fn(),
      auth: { token: 'token' },
      editPic: { _id: '5' },
      scc: { transmit: () => { } },
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
  it('handles the editPicAPI', async () => {
    const viewStub2: any = {
      props: {
        dispatch: jest.fn(),
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
      state: { title: 'picTitle', url: 'picUrl', comments: 'showCaption' },
    };
    Object.defineProperty(window, 'location', { value: { assign: jest.fn(), reload: () => { } }, writable: true });
    const controller = new Controller(viewStub2);
    const r = controller.editPicAPI();
    expect(r).toBe(true);
  });
  it('handles the editPicAPI failure', async () => {
    const viewStub2: any = {
      props: {
        dispatch: jest.fn(),
        auth: { token: 'token' },
        editPic: {
          title: 'picTitle',
          url: 'picUrl',
          thumbnail: 'string',
          modify: <div />,
        },
        scc: { transmit: jest.fn() },
        showtable: true,
      },
      state: { title: '', url: '', comments: 'showCaption' },
    };
    Object.defineProperty(window, 'location', { value: { assign: jest.fn(), reload: () => { } }, writable: true });
    const controller = new Controller(viewStub2);
    const r = controller.editPicAPI();
    expect(r).toBe(false);
  });
  it('handles onChangePic', () => {
    const viewStub2: any = {
      props: {
        dispatch: jest.fn(),
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
      state: { title: '', url: '', comments: 'showCaption' },
    };
    const controller = new Controller(viewStub2);
    viewStub2.setState = jest.fn();
    const evt:any = { persist: jest.fn(), target: { id: 'title', value: 'title' } };
    controller.onChangePic(evt);
    controller.checkPicEdit();
    const s0 = {
      title: 'picTitle', url: 'picUrl',
    };
    expect(viewStub2.setState).toHaveBeenCalledWith(s0);
  });
  it('checks edit when not editPic', () => {
    const viewStub2: any = {
      props: {
        dispatch: jest.fn(),
        auth: { token: 'token' },
        editPic: {
          _id: '123',
          title: '',
          url: '',
          thumbnail: 'string',
          modify: <div />,
        },
        scc: { transmit: jest.fn() },
        showtable: true,
      },
      state: { title: '', url: '', comments: 'showCaption' },
    };
    const controller = new Controller(viewStub2);
    viewStub2.setState = jest.fn();
    const evt:any = { persist: jest.fn(), target: { id: 'title', value: '' } };
    const sO = {
      title: '', url: '',
    };
    controller.onChangePic(evt);
    controller.checkPicEdit();
    expect(viewStub2.setState).toHaveBeenCalledWith(sO);
  });
  it('calls state in handleChangePic', () => {
    viewStub.setState = jest.fn();
    const controller = new Controller(viewStub);
    const evt:any = { persist: jest.fn(), target: { id: 'title', value: 'title' } };
    controller.onChangePic(evt);
    controller.checkPicEdit = jest.fn();
    expect(viewStub.setState).toBeCalled();
    viewStub.setState = jest.fn((obj) => { expect(obj.title).toBe('title'); });
  });
  // it('failure to checkPicEdit', () =>{
  //   const viewStub2: any = {
  //     props: {
  //       dispatch: jest.fn(),
  //       auth: { token: 'token' },
  //       editPic: {
  //         _id: '123',
  //         thumbnail: 'string',
  //         modify: <div />,
  //       },
  //       scc: { transmit: jest.fn() },
  //       showtable: true,
  //     },
  //     state: { title: '', url: '', comments: 'showCaption' },
  //   };
  //   viewStub2.setState = jest.fn();
  //   const controller = new Controller(viewStub2);
  //   controller.checkPicEdit();
  // });
  it('set state in handleChangePic', () => {
    viewStub.setState = jest.fn((cb) => cb({}));
    const controller = new Controller(viewStub);
    const evt:any = { persist: jest.fn(), target: { id: 'title', value: 'title' } };
    controller.onChangePic(evt);
    expect(viewStub.setState).toBeCalled();
  });
  it('reset editform for pic', () => {
    viewStub.setState = jest.fn();
    const controller = new Controller(viewStub);
    viewStub.setState = jest.fn((obj) => expect(obj.title).toBe(''));
    controller.resetEditPic(null);
  });
  it('check state on resetEditPic', () => {
    const viewStub2: any = {
      props: {
        dispatch: jest.fn(),
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
    viewStub2.setState = jest.fn();
    const controller = new Controller(viewStub2);
    viewStub2.setState({ title: 'beer garden' });
    const evt:any = { preventDefault: () => { } };
    controller.resetEditPic(evt);
    const sO = {
      title: '', url: '',
    };
    expect(viewStub2.setState).toHaveBeenCalledWith(sO);
  });
});
