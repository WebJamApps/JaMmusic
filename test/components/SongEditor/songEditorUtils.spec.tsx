/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Auth } from 'src/redux/mapStoreToProps';
import songEditorUtils from 'src/components/SongEditor/songEditorUtils';
import fetchSongs from 'src/providers/fetchSongs';
import { Store } from 'react-notifications-component';

describe('songEditorUtils', () => {

  let sa:any = {};
  beforeEach(() => {
    sa = {
      put: jest.fn(() => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 200 }) }) }) })),
      post: jest.fn(() => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 201 }) }) }) })),
    };
  });
  it('is true', ()=>{
    expect(true).toBe(true);
  });
  it('updateSongAPI', async () => {
    Store.addNotification = jest.fn();
    fetchSongs.getSongs = jest.fn();
    const songChanges:any = { _id:'id' };
    await songEditorUtils.updateSongAPI(sa, songChanges, {} as Auth, jest.fn(), jest.fn());
    expect(fetchSongs.getSongs).toHaveBeenCalled();
  });
  it('updateSongAPI catches error', async () => {
    Store.addNotification = jest.fn();
    fetchSongs.getSongs = jest.fn();
    const songChanges:any = { _id:'id' };
    sa.put = () => ({ set: () => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }) });
    await songEditorUtils.updateSongAPI(sa, songChanges, {} as Auth, jest.fn(), jest.fn());
    expect(fetchSongs.getSongs).not.toHaveBeenCalled();
    expect(Store.addNotification).toHaveBeenCalled();
  });
  it('updateSongAPI return 400 not updated', async () => {
    Store.addNotification = jest.fn();
    fetchSongs.getSongs = jest.fn();
    const songChanges:any = { _id:'id' };
    sa.put = () => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 400 }) }) }) });
    await songEditorUtils.updateSongAPI(sa, songChanges, {} as Auth, jest.fn(), jest.fn());
    expect(fetchSongs.getSongs).not.toHaveBeenCalled();
    expect(Store.addNotification).toHaveBeenCalled();
  });
  it('addSongAPI successfully', async () => {
    Store.addNotification = jest.fn();
    fetchSongs.getSongs = jest.fn();
    const songBody:any = { title:'title' };
    await songEditorUtils.addSongAPI(sa, songBody, { token:'token' }, jest.fn(), jest.fn());
    expect(fetchSongs.getSongs).toHaveBeenCalled();
  });
  it('addSongAPI catches error', async () => {
    Store.addNotification = jest.fn();
    fetchSongs.getSongs = jest.fn();
    const songBody:any = { title:'title' };
    sa.post = () => ({ set: () => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }) });
    await songEditorUtils.addSongAPI(sa, songBody, { token:'token' }, jest.fn(), jest.fn());
    expect(fetchSongs.getSongs).not.toHaveBeenCalled();
    expect(Store.addNotification).toHaveBeenCalled();
  });
  it('addSongAPI return 400 not updated', async () => {
    Store.addNotification = jest.fn();
    fetchSongs.getSongs = jest.fn();
    const songBody:any = { title:'title' };
    sa.post = () => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 400 }) }) }) });
    await songEditorUtils.addSongAPI(sa, songBody, { token:'token' }, jest.fn(), jest.fn());
    expect(fetchSongs.getSongs).not.toHaveBeenCalled();
    expect(Store.addNotification).toHaveBeenCalled();
  });
});
