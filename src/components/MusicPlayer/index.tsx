import { Component } from 'react';
import { FacebookShareButton, FacebookIcon } from 'react-share';
import type { ISong } from 'src/providers/Data.provider';
import musicPlayerUtils from './musicPlayerUtils';
import musicUtils from './musicUtils';
import commonUtils from '../../lib/commonUtils';
import { WjSongPlayer } from './WjSongPlayer';
import './musicPlayer.scss';

export interface Iplayer {
  playing: boolean;
  shown: boolean; isShuffleOn: boolean; displayCopier: string; displayCopyMessage: boolean; onePlayerMode: boolean
}

export interface MusicPlayerState {
  missionState: string;
  pageTitle: string;
  pubState: string;
  originalState: string;
  songsState: ISong[];
  index: number;
  song: ISong | null;
  copy?: string[];
  player: Iplayer;
}

interface MProps {
  songs: ISong[];
  filterBy: string;
}

export class MusicPlayer extends Component<MProps, MusicPlayerState> {
  navigator: Navigator;

  musicUtils: typeof musicUtils;

  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  constructor(props: MProps) {
    super(props);
    this.state = {
      pageTitle: 'Original Songs',
      songsState: [],
      song: null,
      index: 0,
      missionState: 'off',
      pubState: 'off',
      originalState: 'on',
      player: {
        playing: false, shown: false, isShuffleOn: false, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
      },
    };
    this.play = this.play.bind(this);
    this.pause = this.pause.bind(this);
    this.shuffle = this.shuffle.bind(this);
    this.next = this.next.bind(this);
    this.buttons = this.buttons.bind(this);
    this.navigator = window.navigator;
    this.musicUtils = musicUtils;
    this.commonUtils = commonUtils;
  }

  async componentDidMount(): Promise<boolean> {
    const params = new URLSearchParams(window.location.search);
    const { player } = this.state;
    const { songs, filterBy } = this.props;
    this.commonUtils.setTitleAndScroll('', window.screen.width);
    const newSongs = songs.filter((song: { category?: string }) => song.category === filterBy);
    this.setState({ song: newSongs[0], songsState: newSongs });
    await musicPlayerUtils.checkOnePlayer(params, player, this);
    return musicPlayerUtils.runIfOnePlayer(this);
  }

  lineTwoButtons(): JSX.Element {
    const {
      missionState, pubState, originalState, player: { onePlayerMode },
    } = this.state;
    return (
      <div id="mAndP" style={{ height: '22px', margin: 'auto' }}>
        <button type="button" onClick={() => musicPlayerUtils.toggleSongTypes('Original', this)} className={`original${originalState}`}>
          Original
        </button>
        <button type="button" onClick={() => musicPlayerUtils.toggleSongTypes('Mission', this)} className={`mission${missionState}`}>
          Mission
        </button>
        <button type="button" onClick={() => musicPlayerUtils.toggleSongTypes('Pub', this)} className={`pub${pubState}`}>
          Pub
        </button>
        {onePlayerMode ? musicPlayerUtils.homeButton(onePlayerMode) : null}
      </div>
    );
  }

  lineThreeButtons(url: string): JSX.Element {
    let { song } = this.state, composer = '', quote = '';
    if (!song) {
      song = {
        title: '', artist: '', composer: '', category: '', album: '', year: 0, url: '', _id: '', image: '',
      };
    }
    if (song.composer !== undefined && !song.composer.includes('Josh')) composer = ` by ${song.composer}`;
    quote = `Click the graphic below to hear ${song.artist} performing the song, "${song.title}"${composer}`;
    if (song.category === 'original') quote = quote.replace('performing the song', 'performing their song');
    return (
      <div id="share-buttons" style={{ display: 'inline-block', marginTop: '3px' }}>
        <button type="button" id="share-button" role="menu" onClick={() => musicPlayerUtils.share(this)}>Share</button>
        <FacebookShareButton
          resetButtonStyle={false}
          style={{
            backgroundColor: 'white', marginLeft: 0, paddingLeft: '5px', marginBottom: 0,
          }}
          url={url}
          quote={quote}
          hashtag="#JoshAndMariaMusic"
        >
          <FacebookIcon round size={26} />
        </FacebookShareButton>
      </div>
    );
  }

  buttons(): JSX.Element {
    const { song, player: { playing, isShuffleOn } } = this.state;
    const url = musicPlayerUtils.playUrl(song);
    return (
      <section className="mt-0 songPlayerButtonsSection" style={{ paddingTop: 0 }}>
        <div id="play-buttons">
          <button type="button" id="play-pause" role="menu" className={playing ? 'on' : 'off'} onClick={this.play}>Play/Pause</button>
          <button type="button" role="menu" id="next" onClick={this.next}>Next</button>
          <button type="button" role="menu" id="prev" onClick={() => musicPlayerUtils.prev(this)}>
            Prev
          </button>
          <button type="button" id="shuffle" role="menu" className={isShuffleOn ? 'on' : 'off'} onClick={this.shuffle}>Shuffle</button>
        </div>
        {this.lineTwoButtons()}
        {this.lineThreeButtons(url)}
      </section>
    );
  }

  shuffle(): void {
    const {
      player, songsState, missionState, pubState,
    } = this.state;
    if (player.isShuffleOn) {
      let reset = songsState;
      if (missionState === 'on') reset = this.musicUtils.setIndex(reset, 'mission');
      if (pubState === 'on') reset = this.musicUtils.setIndex(reset, 'pub');
      this.setState({
        songsState: reset, player: { ...player, isShuffleOn: false }, song: reset[0], index: 0,
      });
    } else {
      const shuffled = musicPlayerUtils.shuffleThem(songsState);
      this.setState({
        songsState: shuffled, player: { ...player, isShuffleOn: true }, song: shuffled[0], index: 0,
      });
    }
  }

  play(): void {
    const { player } = this.state;
    const isPlaying = !player.playing;
    this.setState({ player: { ...player, playing: isPlaying } });
  }

  pause(): void {
    const { player } = this.state;
    this.setState({ player: { ...player, playing: false } });
  }

  next(): void {
    let { index } = this.state;
    index += 1;
    const { songsState } = this.state;
    if (index >= songsState.length) this.setState({ index: 0, song: songsState[0] });
    else this.setState({ song: songsState[index], index });// eslint-disable-line security/detect-object-injection
  }

  copyInput(player: MusicPlayerState['player'], song: ISong | null): JSX.Element {
    return (
      <div id="copyInput" style={{ marginTop: '-20px', marginBottom: '40px' }}>
        {player.displayCopyMessage && <div className="copySuccess"> Url copied Url to clipboard </div>}
        {song ? <input id="copyUrl" disabled value={musicPlayerUtils.playUrl(song)} style={{ backgroundColor: '#fff' }} className="form-control" />
          : null}
        <div
          id="copyButton"
          role="presentation"
          onClick={() => musicPlayerUtils.copyShare(this)}
        >
          <span className="copy-url">
            Copy URL
          </span>
        </div>
      </div>
    );
  }

  render(): JSX.Element {
    const {
      song, player, pageTitle, index, songsState,
    } = this.state;
    const classOverlay = musicPlayerUtils.setClassOverlay(song, player);
    return (
      <WjSongPlayer
        song={song}
        player={player}
        index={index}
        songsState={songsState}
        setState={this.setState}
        pageTitle={pageTitle}
        classOverlay={classOverlay}
      />
    );
  }
}

export default MusicPlayer;
