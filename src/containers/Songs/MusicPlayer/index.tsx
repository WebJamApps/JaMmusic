import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@mui/material';
import { Share } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
// import { FacebookShareButton, FacebookIcon } from 'react-share';
import type { Isong } from 'src/providers/Data.provider';
// import commonUtils from 'src/lib/commonUtils';
// import musicPlayerUtils from './musicPlayerUtils';
import utils from './utils';
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

function play(playing: boolean, setPlaying: (arg0: boolean) => void): void {
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
  return (
    <ReactPlayer
      onError={(err) => {
        // eslint-disable-next-line no-console
        console.log('Something went wroung...');
        console.log(err);
      }}
      // eslint-disable-next-line no-console
      onReady={(player) => console.log(player)}
      muted={!playing}
      style={utils.setPlayerStyle(song)}
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
  songsState: Isong[], setIndex: (arg0: number) => void, isSingle:boolean
}
function MyButtons(props: ImyButtonsProps): JSX.Element {
  const {
    playing, setPlaying, index, songsState, setIndex, isSingle,
  } = props;
  return (
    <div style={{ paddingTop: 0, margin: 'auto' }}>
      <div id="play-buttons">
        <Button
          size="small"
          variant="contained"
          id="play-pause"
          className={playing ? 'on' : 'off'}
          onClick={() => play(playing, setPlaying)}
        >
          Play/Pause
        </Button>
        {!isSingle ? null : (
          <Button
            size="small"
            variant="outlined"
            id="home"
            onClick={() => window.open('https://web-jam.com/music/songs', '_blank')}
          >
            More Songs
          </Button>
        )}
        {isSingle ? null
          : (
            <>
              <Button
                size="small"
                variant="outlined"
                id="next"
                onClick={() => next(index, songsState, setIndex)}
              >
                Next
              </Button>
              <Button
                size="small"
                variant="outlined"
                id="prev"
                onClick={() => prev(index, songsState, setIndex)}
              >
                Prev
              </Button>
            </>
          )}
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
  { songsState, index }: { songsState: Isong[], index: number },
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
        {song.composer && song.category !== 'original' ? ` - ${song.composer}` : null}
        {song.category === 'original' ? ` - ${song.artist}` : (
          <>
            <br />
            {song.artist}
          </>
        )}
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

interface IcategoryButtonsProps {
  category: string, setCategory: (arg0: string) => void, isSingle:boolean
}
function CategoryButtons(props: IcategoryButtonsProps): JSX.Element {
  const {
    category, setCategory, isSingle,
  } = props;
  if (isSingle) return <> </>;
  return (
    <div className="categoryButtons">
      <button type="button" onClick={() => setCategory('original')} className={`original${category === 'original' ? 'on' : 'off'}`}>
        Original
      </button>
      <button type="button" onClick={() => setCategory('mission')} className={`mission${category === 'mission' ? 'on' : 'off'}`}>
        Mission
      </button>
      <button type="button" onClick={() => setCategory('pub')} className={`pub${category === 'pub' ? 'on' : 'off'}`}>
        Pub
      </button>
      {/* {onePlayerMode ? musicPlayerUtils.homeButton(onePlayerMode) : null} */}
    </div>
  );
}

interface IcopyInputProps {
  index: number, songsState: Isong[], isSingle:boolean
}
function CopyShare(props: IcopyInputProps): JSX.Element {
  const { index, songsState, isSingle } = props;
  const [showCopyUrl, setShowCopyUrl] = useState(false);
  // eslint-disable-next-line security/detect-object-injection
  const songUrl = `${window.location.href}?id=${songsState[index]._id}`;
  if (isSingle) return <> </>;
  return (
    <div className="copyShare">
      {showCopyUrl ? null
        : (
          <Button size="small" onClick={() => setShowCopyUrl(true)} variant="contained" endIcon={<Share />}>
            Share
          </Button>
        )}
      {!showCopyUrl ? null : (
        <>
          <input type="text" id="copyUrl" value={songUrl} disabled />
          <Button
            size="small"
            variant="contained"
            className="copyUrl"
            onClick={() => utils.copyShare()}
          >
            Copy URL
          </Button>
          <Button size="small" onClick={() => setShowCopyUrl(false)}>Cancel</Button>
        </>
      )}
    </div>
  );
}

interface ImusicPlayerProps {
  songs: Isong[];
  filterBy: string;
}
export function MusicPlayer({ songs, filterBy }: ImusicPlayerProps) {
  const [index, setIndex] = useState(0);
  const [songsState, setSongsState] = useState(songs);
  const [category, setCategory] = useState(filterBy);
  const [playing, setPlaying] = useState(false);
  const [isSingle, setIsSingle] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    utils.initSongs(songs, category, setSongsState, searchParams, setPlaying, setIndex, setIsSingle);
  }, [category, searchParams, songs]);
  useEffect(() => { utils.makeSingleSong(isSingle); }, [isSingle]);
  return (
    <div className="container-fluid">
      {isSingle ? null
        : (
          <h4 className="categoryTitle">
            {`${category.charAt(0).toUpperCase() + category.slice(1)} Songs`}
          </h4>
        )}
      <div id="player">
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
          isSingle={isSingle}
        />
        <TextUnderPlayer songsState={songsState} index={index} />
        <CategoryButtons category={category} setCategory={setCategory} isSingle={isSingle} />
        <CopyShare songsState={songsState} index={index} isSingle={isSingle} />
      </div>
    </div>
  );
}

