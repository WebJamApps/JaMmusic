import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Button, CircularProgress } from '@mui/material';
// import { FacebookShareButton, FacebookIcon } from 'react-share';
import type { Isong } from 'src/providers/Data.provider';
// import commonUtils from 'src/lib/commonUtils';
// import musicPlayerUtils from './musicPlayerUtils';
import musicUtils from './musicUtils';
import './musicPlayer.scss';

export interface Iplayer {
  // playing: boolean;
  shown: boolean; isShuffleOn: boolean; displayCopier: string; displayCopyMessage: boolean; onePlayerMode: boolean
}

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

// function LineTwoButtons(props: any): JSX.Element {
//   const {
//     missionState, pubState, originalState, player: { onePlayerMode },
//   } = props;
//   return (
//     <div id="mAndP" style={{ height: '22px', margin: 'auto' }}>
//       {/* <button type="button" onClick={() => musicPlayerUtils.toggleSongTypes('Original', this)} className={`original${originalState}`}>
//         Original
//       </button>
//       <button type="button" onClick={() => musicPlayerUtils.toggleSongTypes('Mission', this)} className={`mission${missionState}`}>
//         Mission
//       </button>
//       <button type="button" onClick={() => musicPlayerUtils.toggleSongTypes('Pub', this)} className={`pub${pubState}`}>
//         Pub
//       </button> */}
//       {onePlayerMode ? musicPlayerUtils.homeButton(onePlayerMode) : null}
//     </div>
//   );
// }

// function lineThreeButtons(this: any, url: string): JSX.Element {
//   let { song } = this.state, composer = '', quote = '';
//   if (!song) {
//     song = {
//       title: '', artist: '', composer: '', category: '', album: '', year: 0, url: '', _id: '', image: '',
//     };
//   }
//   if (song.composer !== undefined && !song.composer.includes('Josh')) composer = ` by ${song.composer}`;
//   quote = `Click the graphic below to hear ${song.artist} performing the song, "${song.title}"${composer}`;
//   if (song.category === 'original') quote = quote.replace('performing the song', 'performing their song');
//   return (
//     <div id="share-buttons" style={{ display: 'inline-block', marginTop: '3px' }}>
//       <button type="button" id="share-button" role="menu" onClick={() => this.musicPlayerUtils.share(this)}>Share</button>
//       <FacebookShareButton
//         resetButtonStyle={false}
//         style={{
//           backgroundColor: 'white', marginLeft: 0, paddingLeft: '5px', marginBottom: 0,
//         }}
//         url={url}
//         quote={quote}
//         hashtag="#JoshAndMariaMusic"
//       >
//         <FacebookIcon round size={26} />
//       </FacebookShareButton>
//     </div>
//   );
// }

// function shuffle(this: any): void {
//   const {
//     player, songsState, missionState, pubState,
//   } = this.state;
//   if (player.isShuffleOn) {
//     let reset = songsState;
//     if (missionState === 'on') reset = this.musicUtils.setIndex(reset, 'mission');
//     if (pubState === 'on') reset = this.musicUtils.setIndex(reset, 'pub');
//     this.setState({
//       songsState: reset, player: { ...player, isShuffleOn: false }, song: reset[0], index: 0,
//     });
//   } else {
//     const shuffled = this.musicPlayerUtils.shuffleThem(songsState);
//     this.setState({
//       songsState: shuffled, player: { ...player, isShuffleOn: true }, song: shuffled[0], index: 0,
//     });
//   }
// }

// function playEnd(this: any): void { this.next(); }

// function prev(this: any): void { this.musicPlayerUtils.prev(this); }

// function pause(this: any): void {
//   const { player } = this.state;
//   this.setState({ player: { ...player, playing: false } });
// }

// function playUrl(song: Isong): string {
//   const url = window.location.href.split('/music')[0];
//   if (song && song._id) return `${url}/music/songs?oneplayer=true&output=embed&id=${song._id}`;
//   return `${url}/music/songs`;
// }

// interface IcopyInputProps {
//   player: any, song: any
// }
// function CopyInput(props: IcopyInputProps): JSX.Element {
//   const { player, song } = props;
//   return (
//     <div id="copyInput" style={{ marginTop: '-20px', marginBottom: '40px' }}>
//       {player.displayCopyMessage && <div className="copySuccess"> Url copied Url to clipboard </div>}
//       {song
//         ? (
//           <input
//             id="copyUrl"
//             disabled
//             value={playUrl(song)}
//             style={{ backgroundColor: '#fff' }}
//             className="form-control"
//           />
//         )
//         : null}
//       <div
//         id="copyButton"
//         role="presentation"
//         onClick={
//           () => {
//             console.log('copyButton');
//             // musicPlayerUtils.copyShare();
//           }
//         }
//       >
//         <span className="copy-url">
//           Copy URL
//         </span>
//       </div>
//     </div>
//   );
// }

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

function play(playing: boolean, setPlaying: (arg0: boolean) => void): void {
  // const isPlaying = !player.playing;
  setPlaying(!playing);
}

function next(index: number, songsState: Isong[], setIndex: (arg0: number) => void): void {
  const nextIndex = index + 1;
  if (nextIndex >= songsState.length) {
    setIndex(0);
  } else {
    setIndex(nextIndex);
  }
}

function prev(index: number, songsState: Isong[], setIndex: (arg0: number) => void): void {
  const minusIndex = index - 1;
  if (minusIndex < 0 || minusIndex > songsState.length) {
    const newIndex = songsState.length - 1;
    setIndex(newIndex);
  } else setIndex(minusIndex);
}

interface ImyReactPlayerProps {
  playing: boolean,
  index: number, songsState: Isong[], setIndex: (arg0: number) => void
}
function MyReactPlayer(props: ImyReactPlayerProps): JSX.Element {
  const {
    playing, index, songsState, setIndex,
  } = props;
  // eslint-disable-next-line security/detect-object-injection
  const song = songsState[index];
  console.log(song);
  return (
    <ReactPlayer
      muted={!playing}
      style={musicUtils.setPlayerStyle(song)}
      url={song.url}
      playing={playing}
      controls
      onEnded={() => next(index, songsState, setIndex)}
      width="100%"
      height="40vh"
      id="mainPlayer"
      className="audio"
      config={{ youtube: { playerVars: { controls: 0 } }, file: { attributes: { controlsList: 'nodownload' } } }}
    />
  );
}

interface ImyButtonsProps {
  playing: boolean, setPlaying: (arg0: boolean) => void, index: number,
  songsState: Isong[], setIndex: (arg0: number) => void
}
function MyButtons(props: ImyButtonsProps): JSX.Element {
  const {
    playing, setPlaying, index, songsState, setIndex,
  } = props;
  return (
    <div style={{ paddingTop: 0, margin: 'auto' }}>
      <div id="play-buttons">
        <Button
          variant="contained"
          id="play-pause"
          className={playing ? 'on' : 'off'}
          onClick={() => play(playing, setPlaying)}
        >
          Play/Pause
        </Button>
        <Button
          variant="outlined"
          id="next"
          onClick={() => next(index, songsState, setIndex)}
        >
          Next
        </Button>
        <Button variant="outlined" id="prev" onClick={() => prev(index, songsState, setIndex)}>
          Prev
        </Button>
        {/* <button type="button" id="shuffle" role="menu" className={isShuffleOn ? 'on' : 'off'} onClick={this.shuffle}>Shuffle</button> */}
      </div>
      {/* {this.lineTwoButtons()}
      {this.lineThreeButtons(url)} */}
    </div>
  );
}

function CopyRight(): JSX.Element { // eslint-disable-line class-methods-use-this
  return (<span>All Original Songs &copy;2019 &ndash; 2020 Web Jam LLC</span>);
}

function TextUnderPlayer(
  { songsState, index }: { songsState: Isong[], index:number },
): JSX.Element {
  // eslint-disable-next-line security/detect-object-injection
  const song = songsState[index];
  return (
    <section
      className="mt-1 textUnderPlayer"
      style={{
        fontSize: '0.8em', marginTop: 0, marginBottom: '0', paddingTop: 0, paddingBottom: 0,
      }}
    >
      <strong>
        {song.title ? song.title : null}
        {song.composer && song.category !== 'original' ? ` by ${song.composer}` : null}
        {song.artist ? ` - ${song.artist}` : null}
      </strong>
      <p style={{
        textAlign: 'center', fontSize: '8pt', marginTop: '4px', marginBottom: 0,
      }}
      >
        {song.album ? song.album : null}
        {song.year ? `, ${song.year}` : null}
      </p>
      <p style={{
        textAlign: 'center', fontSize: '8pt', marginTop: '2px', marginBottom: 0,
      }}
      >
        {song !== null && song.category === 'original' ? <CopyRight /> : null}
      </p>
    </section>
  );
}

function initSongs(
  songs: Isong[],
  filterBy: string | undefined,
  setSongsState: (arg0: any) => void,
) {
  const newSongs = songs.filter((song: { category?: string }) => song.category === filterBy);
  setSongsState(newSongs);
}

interface ImusicPlayerProps {
  songs: Isong[];
  filterBy: string;
}
export function MusicPlayer({ songs, filterBy }: ImusicPlayerProps) {
  // const [classOverlay, setClassOverlay] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [index, setIndex] = useState(0);
  const [songsState, setSongsState] = useState(songs);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pageTitle, setPageTitle] = useState('Original Songs');
  const [playing, setPlaying] = useState(false);
  // const [player, setPlayer] = useState({
  //   shown: false, isShuffleOn: false, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
  // });
  useEffect(() => {
    initSongs(songs, filterBy, setSongsState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);// initial setup only
  if (!Array.isArray(songsState) || songsState.length === 0) return <CircularProgress />;
  return (
    <div className="container-fluid">
      <PageH4 pageTitle={pageTitle} />
      <div id="player" className="mb-2 row justify-content-md-center">
        <section id="playSection" className="col-12 mt-2 mr-0 col-md-7">
          <MyReactPlayer
            setIndex={setIndex}
            playing={playing}
            index={index}
            songsState={songsState}
          />
        </section>
        <MyButtons
          setIndex={setIndex}
          playing={playing}
          setPlaying={setPlaying}
          index={index}
          songsState={songsState}
        />
        <TextUnderPlayer songsState={songsState} index={index} />
        {/* <section className="mt-1 col-12" id="copier" style={{ display: player.displayCopier, marginTop: '0' }}>
          <CopyInput player={player} song={song} />
        </section> */}
      </div>
    </div>
  );
}

