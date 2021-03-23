/* eslint-disable @typescript-eslint/no-explicit-any */
import { shallow } from 'enzyme';
// import React from 'react';
import songEditorUtils from '../../../src/components/SongEditor/songEditorUtils';

describe('songEditorUtils', () => {
  let compStub:any = {};
  beforeEach(() => {
    window.location = {
      ...window.location,
      href: 'https://web-jam.com',
      reload: jest.fn(),
      assign: jest.fn(),
    };
    compStub = {
      state: { songState: {} },
      props: { editSong: {}, auth: {}, dispatch: jest.fn() },
      controller: {
        superagent: {
          put: () => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 200 }) }) }) }),
          post: jest.fn(() => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 201 }) }) }) })),
        },
      },
      setState: jest.fn(),
    };
  });
  it('updateSongAPI', async () => {
    const res = await songEditorUtils.updateSongAPI(compStub);
    expect(res).toBe('song updated');
  });
  it('updateSongAPI catches error', async () => {
    compStub.controller.superagent.put = () => ({ set: () => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }) });
    const res = await songEditorUtils.updateSongAPI(compStub);
    expect(res).toBe('bad');
  });
  it('updateSongAPI return 400 not updated', async () => {
    compStub.controller.superagent.put = () => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 400 }) }) }) });
    const res = await songEditorUtils.updateSongAPI(compStub);
    expect(res).toBe('400 song was not updated');
  });
  it('resetSongForm', () => {
    songEditorUtils.resetSongForm(compStub);
    expect(window.location.reload).toHaveBeenCalled();
  });
  it('Click Cancel resets SongForm', () => {
    songEditorUtils.editSongButtons(compStub, compStub.state.songState);
    songEditorUtils.resetSongForm(compStub);
    expect(window.location.reload).toHaveBeenCalled();
  });
  it('Click Edit updates SongState', async () => {
    songEditorUtils.editSongButtons(compStub, compStub.props.editSong);
    const res = await songEditorUtils.updateSongAPI(compStub);
    expect(res).toBe('song updated');
  });
  it('addSongAPI successfully', async () => {
    compStub.controller.superagent.post = () => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 201 }) }) }) });
    const res = await songEditorUtils.addSongAPI(compStub.props.editSong, compStub.props.auth, compStub.controller);
    expect(res).toBe('song created');
  });
  it('addSongAPI catches error', async () => {
    compStub.controller.superagent.post = () => ({ set: () => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }) });
    const res = await songEditorUtils.addSongAPI(compStub.props.editSong, compStub.props.auth, compStub.controller);
    expect(res).toBe('bad');
  });
  it('addSongAPI return 400 not updated', async () => {
    compStub.controller.superagent.post = () => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 400 }) }) }) });
    const res = await songEditorUtils.addSongAPI(compStub.props.editSong, compStub.props.auth, compStub.controller);
    expect(res).toBe('400 song was not created');
  });
  it('SongButtons calls addSongAPI', () => {
    compStub.props.editSong = undefined;
    compStub.state.songState = {
      year: 2021, title: 'title', url: 'url', artist: 'artist', category: 'category',
    };
    const wrapper = shallow(songEditorUtils.songButtons(compStub.state.songState, compStub, compStub.props.editSong));
    wrapper.find('button#add-song-button').simulate('click');
    expect(compStub.controller.superagent.post).toHaveBeenCalled();
  });
});
