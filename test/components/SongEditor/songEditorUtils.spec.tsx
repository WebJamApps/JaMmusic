/* eslint-disable @typescript-eslint/no-explicit-any */
import songEditorUtils from '../../../src/components/SongEditor/songEditorUtils';

describe('songEditorUtils', () => {

  let sa:any = {};
  beforeEach(() => {
    sa = {
      put: jest.fn(() => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 200 }) }) }) })),
      post: jest.fn(() => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 201 }) }) }) })),
    };
    window.location = {
      ...window.location,
      href: 'https://web-jam.com',
      reload: jest.fn(),
      assign: jest.fn(),
    };
  });
  it('updateSongAPI', async () => {
    const songChanges:any = { _id:'id' };
    const res = await songEditorUtils.updateSongAPI(sa, songChanges, {}, jest.fn());
    expect(res).toBe('song updated');
  });
  it('updateSongAPI catches error', async () => {
    const songChanges:any = { _id:'id' };
    sa.put = () => ({ set: () => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }) });
    const res = await songEditorUtils.updateSongAPI(sa, songChanges, {}, jest.fn());
    expect(res).toBe('bad');
  });
  it('updateSongAPI return 400 not updated', async () => {
    const songChanges:any = { _id:'id' };
    sa.put = () => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 400 }) }) }) });
    const res = await songEditorUtils.updateSongAPI(sa, songChanges, {}, jest.fn());
    expect(res).toBe('400 song was not updated');
  });
  it('addSongAPI successfully', async () => {
    const songBody:any = { title:'title' };
    const res = await songEditorUtils.addSongAPI(sa, songBody, { token:'token' }, jest.fn());
    expect(res).toBe('song created');
  });
  it('addSongAPI catches error', async () => {
    const songBody:any = { title:'title' };
    sa.post = () => ({ set: () => ({ set: () => ({ send: () => Promise.reject(new Error('bad')) }) }) });
    const res = await songEditorUtils.addSongAPI(sa, songBody, { token:'token' }, jest.fn());
    expect(res).toBe('bad');
  });
  it('addSongAPI return 400 not updated', async () => {
    const songBody:any = { title:'title' };
    sa.post = () => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 400 }) }) }) });
    const res = await songEditorUtils.addSongAPI(sa, songBody, { token:'token' }, jest.fn());
    expect(res).toBe('400 song was not created');
  });
});
