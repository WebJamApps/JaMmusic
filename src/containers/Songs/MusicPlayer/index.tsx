import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { FacebookShareButton, FacebookIcon } from 'react-share';
import type { Isong } from 'src/providers/Data.provider';
import musicPlayerUtils from './musicPlayerUtils';
import musicUtils from './musicUtils';
import commonUtils from '../../../lib/commonUtils';
import './musicPlayer.scss';

// export interface Iplayer {
//   playing: boolean;
//   shown: boolean; isShuffleOn: boolean; displayCopier: string; displayCopyMessage: boolean; onePlayerMode: boolean
// }

// export interface MusicPlayerState {
//   missionState: string;
//   pageTitle: string;
//   pubState: string;
//   originalState: string;
//   songsState: Isong[];
//   index: number;
//   song: Isong | null;
//   copy?: string[];
//   player: Iplayer;
// }

// interface MProps {
//   songs: Isong[];
//   filterBy: string;
// }

// export class MusicPlayer extends Component<MProps, MusicPlayerState> {
//   navigator: Navigator;

//   musicUtils: typeof musicUtils;

//   commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

//   musicPlayerUtils: typeof musicPlayerUtils;

//   constructor(props: MProps) {
//     super(props);
//     this.state = {
//       pageTitle: 'Original Songs',
//       songsState: [],
//       song: null,
//       index: 0,
//       missionState: 'off',
//       pubState: 'off',
//       originalState: 'on',
//       player: {
//         playing: false, shown: false, isShuffleOn: false, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
//       },
//     };
//     this.play = this.play.bind(this);
//     this.playEnd = this.playEnd.bind(this);
//     this.pause = this.pause.bind(this);
//     this.shuffle = this.shuffle.bind(this);
//     this.next = this.next.bind(this);
//     this.prev = this.prev.bind(this);
//     this.buttons = this.buttons.bind(this);
//     this.setClassOverlay = this.setClassOverlay.bind(this);
//     this.playUrl = this.playUrl.bind(this);
//     this.navigator = window.navigator;
//     this.musicPlayerUtils = musicPlayerUtils;
//     this.musicUtils = musicUtils;
//     this.commonUtils = commonUtils;
//   }

//   async componentDidMount(): Promise<boolean> {
//     const params = new URLSearchParams(window.location.search);
//     const { player } = this.state;
//     const { songs, filterBy } = this.props;
//     this.commonUtils.setTitleAndScroll('', window.screen.width);
//     const newSongs = songs.filter((song: { category?: string }) => song.category === filterBy);
//     this.setState({ song: newSongs[0], songsState: newSongs });
//     await this.musicPlayerUtils.checkOnePlayer(params, player, this);
//     return this.musicPlayerUtils.runIfOnePlayer(this);
//   }

function playUrl(song:any): string {
  // const { song } = this.state;
  const url = window.location.href.split('/music')[0];
  if (song && song._id) return `${url}/music/songs?oneplayer=true&output=embed&id=${song._id}`;
  return `${url}/music/songs`;
}

function next(index:number, songsState:any): void {
  // let { index } = this.state;
  const nextIndex = index += 1;
  // const { songsState } = this.state;
  if (nextIndex >= songsState.length) {
  // this.setState({ index: 0, song: songsState[0] });
  }
  else {
    // this.setState({ song: songsState[index], index });
  }// eslint-disable-line security/detect-object-injection
}

function MyReactPlayer({song, player, index, songsState}: any): JSX.Element {
  // const { player } = this.state;
  return (
    <ReactPlayer
      style={musicUtils.setPlayerStyle(song)}
      url={song.url}
      playing={player.playing}
      controls
      onEnded={()=>next(index, songsState)}
      width="100%"
      height="40vh"
      id="mainPlayer"
      className="audio"
      config={{ youtube: { playerVars: { controls: 0 } }, file: { attributes: { controlsList: 'nodownload' } } }}
    />
  );
}

function LineTwoButtons(props:any): JSX.Element {
  const {
    missionState, pubState, originalState, player: { onePlayerMode },
  } = props;
  return (
    <div id="mAndP" style={{ height: '22px', margin: 'auto' }}>
      {/* <button type="button" onClick={() => musicPlayerUtils.toggleSongTypes('Original', this)} className={`original${originalState}`}>
        Original
      </button>
      <button type="button" onClick={() => musicPlayerUtils.toggleSongTypes('Mission', this)} className={`mission${missionState}`}>
        Mission
      </button>
      <button type="button" onClick={() => musicPlayerUtils.toggleSongTypes('Pub', this)} className={`pub${pubState}`}>
        Pub
      </button> */}
      {onePlayerMode ? musicPlayerUtils.homeButton(onePlayerMode) : null}
    </div>
  );
}

function lineThreeButtons(url: string): JSX.Element {
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
      <button type="button" id="share-button" role="menu" onClick={() => this.musicPlayerUtils.share(this)}>Share</button>
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

function buttons(): JSX.Element {
  const { player: { playing, isShuffleOn } } = this.state;
  const url = this.playUrl();
  return (
    <section className="mt-0 songPlayerButtonsSection" style={{ paddingTop: 0 }}>
      <div id="play-buttons">
        <button type="button" id="play-pause" role="menu" className={playing ? 'on' : 'off'} onClick={this.play}>Play/Pause</button>
        <button type="button" role="menu" id="next" onClick={this.next}>Next</button>
        <button type="button" role="menu" id="prev" onClick={this.prev}>Prev</button>
        <button type="button" id="shuffle" role="menu" className={isShuffleOn ? 'on' : 'off'} onClick={this.shuffle}>Shuffle</button>
      </div>
      {this.lineTwoButtons()}
      {this.lineThreeButtons(url)}
    </section>
  );
}

function shuffle(): void {
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
    const shuffled = this.musicPlayerUtils.shuffleThem(songsState);
    this.setState({
      songsState: shuffled, player: { ...player, isShuffleOn: true }, song: shuffled[0], index: 0,
    });
  }
}

function playEnd(): void { this.next(); }

function prev(): void { this.musicPlayerUtils.prev(this); }

function play(): void {
  const { player } = this.state;
  const isPlaying = !player.playing;
  this.setState({ player: { ...player, playing: isPlaying } });
}

function pause(): void {
  const { player } = this.state;
  this.setState({ player: { ...player, playing: false } });
}

function copyInput(player: MusicPlayerState['player'], song: Isong | null): JSX.Element {
  return (
    <div id="copyInput" style={{ marginTop: '-20px', marginBottom: '40px' }}>
      {player.displayCopyMessage && <div className="copySuccess"> Url copied Url to clipboard </div>}
      {song ? <input id="copyUrl" disabled value={this.playUrl()} style={{ backgroundColor: '#fff' }} className="form-control" />
        : null}
      <div
        id="copyButton"
        role="presentation"
        onClick={() => this.musicPlayerUtils.copyShare(this)}
      >
        <span className="copy-url">
          Copy URL
        </span>
      </div>
    </div>
  );
}

function setClassOverlay(song: any, player: any): string {
  // const { song, player } = this.state;
  let classOverlay = 'mainPlayer';
  if (player.playing === false) {
    if (song !== null && song !== undefined && song.url[8] === 's') classOverlay = 'soundcloudOverlay';
    if (song !== null && song !== undefined && song.url[12] === 'y') classOverlay = 'youtubeOverlay';
  }
  return classOverlay;
}

const PageH4 = ({ pageTitle }: { pageTitle: string }): JSX.Element => (
  <h4
    style={{
      textAlign: 'center',
      margin: '20px',
      fontWeight: 'bold',
      marginBottom: '0px',
      fontSize: '16pt',
    }}
    id="headerTitle"
  >
    {pageTitle}
  </h4>
);

// render(): JSX.Element {
//   const {
//     song, player, pageTitle,
//   } = this.state;
//   const classOverlay = this.setClassOverlay();
export function MusicPlayer() {
  const [pageTitle, setPageTitle] = useState('Original Songs')
  const [song, setSong] = useState(null);
  const [player, setPlayer] = useState({
    playing: false, shown: false, isShuffleOn: false, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
  });
  let classOverlay = setClassOverlay(song, player);
  useEffect(() => {
    classOverlay = setClassOverlay(song, player);
  }, [song, player])
  return (
    <div className="container-fluid">
      <PageH4 pageTitle={pageTitle} />
      <div id="player" className="mb-2 row justify-content-md-center">
        <section id="playSection" className="col-12 mt-2 mr-0 col-md-7">
          <div className={classOverlay} />
          {song !== null && song !== undefined && song.url !== undefined ? this.reactPlayer(song) : null}
        </section>
        {song ? this.musicUtils.textUnderPlayer(song) : null}
        {this.buttons()}
        <section className="mt-1 col-12" id="copier" style={{ display: player.displayCopier, marginTop: '0' }}>
          {this.copyInput(player, song)}
        </section>
      </div>
    </div>
  );
}
// }

