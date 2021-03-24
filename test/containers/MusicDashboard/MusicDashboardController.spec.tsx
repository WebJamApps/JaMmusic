/* eslint-disable @typescript-eslint/no-explicit-any */
// import { shallow } from 'enzyme';
import Controller from '../../../src/containers/MusicDashboard/MusicDashboardController';

describe('MusicDashboardController', () => {
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
  // it('renders the submit song button not disabled', () => {
  //   viewStub.state = {
  //     songState: {
  //       url: 'url', artist: 'artist', category: 'original', title: 'title', year: 2020,
  //     },
  //   };
  //   const controller = new Controller(viewStub);
  //   const result = shallow(controller.changeSongDiv());
  //   const sButton = result.find('button').get(0);
  //   expect(sButton.props.disabled).toBe(false);
  // });
  // it('adds song to database', async () => {
  //   const controller = new Controller(viewStub);
  //   const sa:any = { post: jest.fn(() => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 201 }) }) }) })) };
  //   controller.superagent = sa;
  //   const result = await controller.addSong();
  //   expect(result).toBe('song created');
  // });
  // it('catches error when adds song to database', async () => {
  //   const controller = new Controller(viewStub);
  //   const sa:any = { post: jest.fn(() => ({ set: () => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }) })) };
  //   controller.superagent = sa;
  //   const result = await controller.addSong();
  //   expect(result).toBe('bad');
  // });
  // it('handles 300 status when adds song to database', async () => {
  //   const controller = new Controller(viewStub);
  //   const sa:any = { post: jest.fn(() => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 300 }) }) }) })) };
  //   controller.superagent = sa;
  //   const result = await controller.addSong();
  //   expect(result).toBe('300 song was not created');
  // });
});
