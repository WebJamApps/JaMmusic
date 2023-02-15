
import {
  CategoryTitle, CopyShare, CopyUrlButtons, MusicPlayer, ShareButton,
} from 'src/containers/Songs/MusicPlayer';
import renderer from 'react-test-renderer';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import TSongs from 'test/testSongs';
import { BrowserRouter } from 'react-router-dom';
import utils from 'src/containers/Songs/MusicPlayer/utils';

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
  it('does not render CopyShare when isSingle', () => {
    const song = {
      category: 'original',
      year: 2020,
      title: 'title',
      url: 'url',
      _id: 'songid',
      image: 'http://test.com',
    };
    const cs = renderer.create(<CopyShare isSingle index={0} songsState={[song]} />).toJSON();
    expect(cs).toBe(' ');
  });
  it('renders CopyUrlButtons and handles events', () => {
    utils.copyShare = jest.fn();
    const props = { showCopyUrl: true, setShowCopyUrl: jest.fn(), songUrl: '' };
    const cubs = renderer.create(<CopyUrlButtons {...props} />).root;
    cubs.findByProps({ className: 'copyUrl' }).props.onClick();
    expect(utils.copyShare).toHaveBeenCalled();
    cubs.findByProps({ className: 'cancel' }).props.onClick();
    expect(props.setShowCopyUrl).toHaveBeenCalledWith(false);
  });
  it('does not render ShareButton when showCopyUrl is true', () => {
    const sb = renderer.create(<ShareButton showCopyUrl setShowCopyUrl={jest.fn()} />).toJSON();
    expect(sb).toBe(' ');
  });
  it('renders ShareButton when showCopyUrl is false and handles click', () => {
    const setter = jest.fn();
    const sb = renderer.create(<ShareButton showCopyUrl={false} setShowCopyUrl={setter} />).root;
    sb.findByProps({ size: 'small' }).props.onClick();
    expect(setter).toHaveBeenCalledWith(true);
  });
});
