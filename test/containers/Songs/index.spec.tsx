import { Player, Songs } from 'src/containers/Songs';
import renderer from 'react-test-renderer';
import { Isong } from 'src/providers/Data.provider';
import { BrowserRouter } from 'react-router-dom';

describe('Songs', () => {
  it('renders correctly', () => {
    const s:any = renderer.create(<Songs />).toJSON();
    expect(s.props.className).toBe('page-content');
  });
  it('renders with isAdmin', () => {
    const isAdmin = true;
    const result: any = renderer.create(<Songs />).toJSON();
    expect(result.children[1].children[0].type).toBe('div');
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
