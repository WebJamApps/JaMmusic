
import { CategoryTitle, MusicPlayer } from 'src/containers/Songs/MusicPlayer';
import renderer from 'react-test-renderer';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TSongs from 'test/testSongs';
import { BrowserRouter } from 'react-router-dom';

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
    };
    const mp:any = renderer.create(
      <BrowserRouter>
        <MusicPlayer songs={[song]} filterBy="originals" />
      </BrowserRouter>,
    ).toJSON();
    expect(mp.props.className).toBe('container-fluid');
  });
  it('renders and runs useEffect', () => {
    const song = {
      category: 'original',
      year: 2020,
      title: 'title',
      url: 'url',
      _id: 'songid',
      image: 'http://test.com',
    };
    render(
      <BrowserRouter>
        <MusicPlayer songs={[song]} filterBy="originals" />
      </BrowserRouter>,
    );
    expect(screen.getByText('Play/Pause')).toBeInTheDocument();
  });
  it('does not render categoryTitle when isSingle', () => {
    const ct = renderer.create(<CategoryTitle isSingle category="originals" />).toJSON();
    expect(ct).toBe(' ');
  });
});
