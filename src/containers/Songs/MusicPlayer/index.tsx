import { useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { Button } from '@mui/material';
import { Share } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import type { Isong } from 'src/providers/Data.provider';
import utils from './utils';
import './musicPlayer.scss';

export function makeHandleEnded(index: number, songsState: Isong[], setIndex: (arg0: number)=> void) {
  return () => utils.next(index, songsState, setIndex);
}

interface ImyReactPlayerProps {
  playing: boolean,
  index: number, songsState: Isong[], setIndex: (arg0: number) => void
}
export function MyReactPlayer(props: ImyReactPlayerProps): JSX.Element {
  const {
    playing, index, songsState, setIndex,
  } = props;
  // eslint-disable-next-line security/detect-object-injection
  const song = songsState[index];
  if (!song) return <> </>;
  const handleEnded = makeHandleEnded(index, songsState, setIndex);
  return (
    <ReactPlayer
      onError={utils.handlePlayerError}
      onReady={utils.handlePlayerReady}
      muted={!playing}
      style={utils.setPlayerStyle(song)}
      url={song.url}
      playing={playing}
      controls
      onEnded={handleEnded}
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
  songsState: Isong[], setIndex: (arg0: number) => void, isSingle: boolean
}
export function MyButtons(props: ImyButtonsProps): JSX.Element {
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
          onClick={() => utils.play(playing, setPlaying)}
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
                onClick={() => utils.next(index, songsState, setIndex)}
              >
                Next
              </Button>
              <Button
                size="small"
                variant="outlined"
                id="prev"
                onClick={() => utils.prev(index, songsState, setIndex)}
              >
                Prev
              </Button>
            </>
          )}
      </div>
    </div>
  );
}

function CopyRight(): JSX.Element { // eslint-disable-line class-methods-use-this
  return (<span>All Original Songs &copy;2019 &ndash; 2020 Web Jam LLC</span>);
}

export function TextUnderPlayer(
  { songsState, index }: { songsState: Isong[], index: number },
): JSX.Element {
  // eslint-disable-next-line security/detect-object-injection
  const song = songsState[index];
  if (!song) return <> </>;
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
  category: string, setCategory: (arg0: string) => void, isSingle: boolean
}
export function CategoryButtons(props: IcategoryButtonsProps): JSX.Element {
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
    </div>
  );
}

export function ShareButton(
  { showCopyUrl, setShowCopyUrl }: { showCopyUrl: boolean, setShowCopyUrl: (arg0: boolean) => void },
): JSX.Element {
  if (showCopyUrl) return <> </>;
  return (
    <Button size="small" onClick={() => setShowCopyUrl(true)} variant="contained" endIcon={<Share />}>
      Share
    </Button>
  );
}

export function CopyUrlButtons(
  { showCopyUrl, setShowCopyUrl, songUrl }: { songUrl: string, showCopyUrl: boolean, setShowCopyUrl: (arg0: boolean) => void },
): JSX.Element {
  if (!showCopyUrl) return <> </>;
  return (
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
      <Button size="small" className="cancel" onClick={() => setShowCopyUrl(false)}>Cancel</Button>
    </>
  );
}

interface IcopyInputProps {
  index: number, songsState: Isong[], isSingle: boolean
}
export function CopyShare(props: IcopyInputProps): JSX.Element {
  const { index, songsState, isSingle } = props;
  const [showCopyUrl, setShowCopyUrl] = useState(false);
  // eslint-disable-next-line security/detect-object-injection
  const song = songsState[index];
  if (!song) return <> </>;
  const songUrl = `${window.location.href}?id=${song._id}`;
  if (isSingle) return <> </>;
  return (
    <div className="copyShare">
      <ShareButton showCopyUrl={showCopyUrl} setShowCopyUrl={setShowCopyUrl} />
      <CopyUrlButtons songUrl={songUrl} showCopyUrl={showCopyUrl} setShowCopyUrl={setShowCopyUrl} />
    </div>
  );
}

export function CategoryTitle({ isSingle, category }: { isSingle: boolean, category: string }) {
  if (isSingle) return <> </>;
  return (
    <h4 className="categoryTitle">
      {`${category.charAt(0).toUpperCase() + category.slice(1)} Songs`}
    </h4>
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
    utils.initSongs(songs, category, searchParams, { setSongsState, setIndex, setIsSingle });
  }, [category, searchParams, songs]);
  useEffect(() => { utils.makeSingleSong(isSingle); }, [isSingle]);
  return (
    <div className="container-fluid">
      <CategoryTitle isSingle={isSingle} category={category} />
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

