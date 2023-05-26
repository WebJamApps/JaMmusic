import { Player, SongButtons, Songs } from 'src/containers/Songs';
import renderer from 'react-test-renderer';
import { Isong } from 'src/providers/Data.provider';
import { BrowserRouter } from 'react-router-dom';

describe('Songs', () => {
  it('renders correctly', () => {
    const s:any = renderer.create(<Songs />).toJSON();
    expect(s.props.className).toBe('page-content');
  });
  it('renders with SongButtons', () => {
    const isAdmin = true;
    const setShow = jest.fn();
    const result: any = renderer.create(<SongButtons isAdmin={isAdmin} setShowCreateSong={setShow} />).toJSON();
    expect(result.type).toBe('div');
  });
  it('handles onClick', () => {
    const props = { isAdmin: true, setShowCreateSong: jest.fn() };
    const result = renderer.create(<SongButtons {...props} />).root;
    result.findByProps({ className: 'createSongButton' }).props.onClick();
    expect(props.setShowCreateSong).toHaveBeenCalled();
  });
  it('renders Player', () => {
    const songs: any = [{
      category: '1', title: 'a', year: 12, url: 'https://test1.com',
    },
    {
      category: '2', title: 'b', year: 13, url: 'https://test2.com',
    }] as Isong[];
    const result: any = renderer.create(<BrowserRouter><Player songs={songs} /></BrowserRouter>).toJSON();
    expect(result.type).toBe('div');
  });
});
