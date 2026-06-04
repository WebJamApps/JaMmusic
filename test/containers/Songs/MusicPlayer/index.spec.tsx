
import { vi } from 'vitest';
import {
  // CategoryTitle,
  // CopyShare, CopyUrlButtons,
  MusicPlayer,
  // ShareButton,
  // CategoryButtons,
  // TextUnderPlayer,
  // MyButtons,
  makeHandleEnded,
  buildSource,
  normalizeUrl,
} from 'src/containers/Songs/MusicPlayer';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TSongs from 'test/testSongs';
import { BrowserRouter } from 'react-router-dom';
import utils from 'src/containers/Songs/MusicPlayer/utils';
import type { Isong } from 'src/providers/Data.provider';

describe('MusicPlayer index', () => {
  it('is defined', () => {
    expect(MusicPlayer).toBeDefined();
    expect(TSongs).toBeDefined();
  });
  it('renders', () => {
    const song = {
      category: 'original',
      year: 2020,
      title: 'title',
      url: 'url',
      _id: 'songid',
      image: '',
      artist: '',
    };
    const editDialogState = { setShowEditDialog: vi.fn(), showEditDialog: false };
    const { container } = render(
      <BrowserRouter>
        <MusicPlayer songs={[song]} filterBy="originals" editDialogState={editDialogState} />
      </BrowserRouter>,
    );
    expect(container.firstChild).toHaveClass('container-fluid');
  });
  it('makeHandleEnded and runs it', () => {
    utils.next = vi.fn();
    const he = makeHandleEnded(0, [{ title: 'title', artist: 'me', album: 'test' } as Isong], vi.fn());
    he();
    expect(utils.next).toHaveBeenCalled();
  });
  it('buildSource detects YouTube', () => {
    expect(buildSource('https://youtube.com/watch?v=abc')).toEqual({
      type: 'video', sources: [{ src: 'https://youtube.com/watch?v=abc', provider: 'youtube' }],
    });
  });
  it('buildSource detects a self-hosted video file', () => {
    const src = buildSource('https://example.com/clip.mp4');
    expect(src.type).toBe('video');
    expect(src.sources[0].provider).toBeUndefined();
  });
  it('buildSource defaults to audio', () => {
    expect(buildSource('https://example.com/song.mp3').type).toBe('audio');
  });
  it('buildSource rewrites a Dropbox video link to raw and treats it as video', () => {
    const src = buildSource('https://www.dropbox.com/scl/fi/x/clip.mp4?rlkey=abc&dl=0');
    expect(src.type).toBe('video');
    expect(src.sources[0].src).toContain('raw=1');
    expect(src.sources[0].src).not.toContain('dl=0');
  });
  it('normalizeUrl appends raw=1 when no dl param', () => {
    expect(normalizeUrl('https://www.dropbox.com/s/x/clip.mp4')).toContain('?raw=1');
  });
  it('normalizeUrl leaves non-Dropbox urls untouched', () => {
    expect(normalizeUrl('https://example.com/clip.mp4?dl=0')).toBe('https://example.com/clip.mp4?dl=0');
  });
});
