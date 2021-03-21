/* eslint-disable @typescript-eslint/no-explicit-any */
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
      controller: { superagent: { put: () => ({ set: () => ({ set: () => ({ send: () => Promise.resolve({ status: 200 }) }) }) }) } },
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
});
