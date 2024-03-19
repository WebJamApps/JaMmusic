
import {
  CategoryTitle, CopyShare, CopyUrlButtons, MusicPlayer, ShareButton, CategoryButtons,
  TextUnderPlayer, MyButtons, makeHandleEnded,
} from 'src/containers/Songs/MusicPlayer';
import renderer from 'react-test-renderer';
import { render, screen } from '@testing-library/react';
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
      artist: '',
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
      artist: '',
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
  it('does not render the CategoryButtons when isSingle', () => {
    const props = {
      category: 'original', setCategory: jest.fn(), isSingle: true,
    };
    const cb:any = renderer.create(<CategoryButtons {...props} />).toJSON();
    expect(cb).toBe(' ');
  });
  it('renders CategoryButtons and handles events', () => {
    const props = {
      category: 'original', setCategory: jest.fn(), isSingle: false,
    };
    const cb:any = renderer.create(<CategoryButtons {...props} />).root;
    const buttons = cb.findAllByProps({ type: 'button' });
    buttons[0].props.onClick();
    expect(props.setCategory).toHaveBeenCalledWith('original');
    buttons[1].props.onClick();
    expect(props.setCategory).toHaveBeenCalledWith('mission');
    buttons[2].props.onClick();
    expect(props.setCategory).toHaveBeenCalledWith('pub');
  });
  it('renders CategoryButtons when mission is on', () => {
    const props = {
      category: 'mission', setCategory: jest.fn(), isSingle: false,
    };
    const cb:any = renderer.create(<CategoryButtons {...props} />).toJSON();
    expect(cb.children[1].props.className).toBe('missionon');
  });
  it('renders CategoryButtons when pub is on', () => {
    const props = {
      category: 'pub', setCategory: jest.fn(), isSingle: false,
    };
    const cb:any = renderer.create(<CategoryButtons {...props} />).toJSON();
    expect(cb.children[2].props.className).toBe('pubon');
  });
  it('renders TextUnderPlayer when original song', () => {
    const props = { songsState: [{ title: 'title', artist: 'me', album: 'test' } as Isong], index: 0 };
    const tup:any = renderer.create(<TextUnderPlayer {...props} />).toJSON();
    expect(tup.children[0].children[0]).toBe('title');
  });
  it('renders TextUnderPlayer when pub song', () => {
    const props = {
      songsState: [{
        title: undefined, artist: 'artist', album: 'album', composer: 'composer',
      } as any],
      index: 0,
    };
    const tup:any = renderer.create(<TextUnderPlayer {...props} />).toJSON();
    expect(tup.children[0].children[0]).toBe(' - composer');
  });
  it('renders MyButtons when isSingle is false and handles events', () => {
    utils.play = jest.fn();
    utils.next = jest.fn();
    utils.prev = jest.fn();
    const props = {
      playing: true,
      setPlaying: jest.fn(),
      index: 0,
      songsState: [{ title: 'title', artist: 'me', album: 'test' } as Isong],
      setIndex: jest.fn(),
      isSingle: false,
    };
    const mb = renderer.create(<MyButtons {...props} />).root;
    mb.findByProps({ id: 'play-pause' }).props.onClick();
    expect(utils.play).toHaveBeenCalled();
    mb.findByProps({ id: 'next' }).props.onClick();
    expect(utils.next).toHaveBeenCalled();
    mb.findByProps({ id: 'prev' }).props.onClick();
    expect(utils.prev).toHaveBeenCalled();
  });
  it('renders MyButtons when isSingle is true and handles events', () => {
    window.open = jest.fn();
    const props = {
      playing: true,
      setPlaying: jest.fn(),
      index: 0,
      songsState: [{ title: 'title', artist: 'me', album: 'test' } as Isong],
      setIndex: jest.fn(),
      isSingle: true,
    };
    const mb = renderer.create(<MyButtons {...props} />).root;
    mb.findByProps({ id: 'home' }).props.onClick();
    expect(window.open).toHaveBeenCalled();
  });
  it('makeHandleEnded and runs it', () => {
    utils.next = jest.fn();
    const he = makeHandleEnded(0, [{ title: 'title', artist: 'me', album: 'test' } as Isong], jest.fn());
    he();
    expect(utils.next).toHaveBeenCalled();
  });
});

