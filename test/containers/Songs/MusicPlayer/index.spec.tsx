
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
});
