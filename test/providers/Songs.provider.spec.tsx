
import { act } from 'react-dom/test-utils';
import ReactDOM from 'react-dom';
import { SongsProvider } from '../../src/providers/Songs.provider';
import fetchSongs from '../../src/providers/fetchSongs';

describe('the songs provider', () => {
  let container: ReactDOM.Container;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('SongsProvider is defined', () => {
    fetchSongs.getSongs = jest.fn();
    act(() => { ReactDOM.render(<SongsProvider><div /></SongsProvider>, container); });
    expect(document.getElementById('play-buttons')).toBeDefined();
  });
});
