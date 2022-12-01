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
    this.pause = this.pause.bind(this);
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

  pause(): void {
    const { player } = this.state;
    this.setState({ player: { ...player, playing: false } });
  }

  render(): JSX.Element {
    const {
      song, player, pageTitle, index, songsState, missionState, pubState,
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
        missionState={missionState}
        pubState={pubState}
        writeText={this.navigator.clipboard.writeText}
      />
    );
  }
}

export default MusicPlayer;
