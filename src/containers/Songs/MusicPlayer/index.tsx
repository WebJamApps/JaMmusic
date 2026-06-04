import React, { useEffect, useRef, useState } from 'react';
import { Plyr, type APITypes, type PlyrSource } from 'plyr-react';
import 'plyr-react/plyr.css';
import { Button } from '@mui/material';
import { Share } from '@mui/icons-material';
import { useSearchParams } from 'react-router-dom';
import type { Isong } from 'src/providers/Data.provider';
import utils from './utils';
import './musicPlayer.scss';
import { EditSongDialog } from '../EditSongDialog';
import { defaultSong } from '../songs.utils';

export function makeHandleEnded(index: number, songsState: Isong[], setIndex: (arg0: number) => void) {
  return () => utils.next(index, songsState, setIndex);
}

// A Dropbox share link (?dl=0) serves an HTML preview page, not the file itself.
// Rewrite it to the raw file so an <audio>/<video> element can actually stream it.
export function normalizeUrl(url: string): string {
  if (!/dropbox\.com/i.test(url)) return url;
  let direct = url.replace(/([?&])dl=\d/i, '$1raw=1');
  if (!/[?&]raw=1/i.test(direct)) direct += `${direct.includes('?') ? '&' : '?'}raw=1`;
  return direct;
}

// SoundCloud has no Plyr provider, so those songs render the SoundCloud widget
// iframe (its own controls) instead of the Plyr player.
export function isSoundCloud(url?: string): boolean {
  return /soundcloud\.com/i.test(url || '');
}

export function buildSoundCloudEmbed(url: string): string {
  const opts = 'auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&visual=false';
  return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&${opts}`;
}

// Build a Plyr source from a song URL: YouTube, a self-hosted video file, or an audio file.
export function buildSource(url: string): PlyrSource {
  const u = (url || '').toLowerCase();
  if (u.includes('youtube') || u.includes('youtu.be')) {
    return { type: 'video', sources: [{ src: url, provider: 'youtube' }] };
  }
  const direct = normalizeUrl(url);
  if (/\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/.test(u)) {
    return { type: 'video', sources: [{ src: direct }] };
  }
  return { type: 'audio', sources: [{ src: direct }] };
}

// Audio: no play button — the under-player Play/Pause drives it (no fullscreen for audio).
const AUDIO_CONTROLS = ['progress', 'current-time', 'mute', 'volume'];
// Video/YouTube: keep play + play-large + fullscreen so the video stays controllable in
// fullscreen, where the under-player buttons aren't visible.
const VIDEO_CONTROLS = ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'fullscreen'];

const tryPlay = (player: any) => {
  try {
    const r = player.play();
    if (r && typeof r.catch === 'function') r.catch(() => { /* autoplay blocked */ });
  } catch { /* noop */ }
};

interface ImyReactPlayerProps {
  playing: boolean, setPlaying: (arg0: boolean) => void,
  index: number, songsState: Isong[], setIndex: (arg0: number) => void,
  playerRef: React.RefObject<APITypes | null>
}
export function MyReactPlayer(props: ImyReactPlayerProps): React.JSX.Element {
  const {
    playing, setPlaying, index, songsState, setIndex, playerRef,
  } = props;
  const playingRef = useRef(playing);
  playingRef.current = playing;
  // eslint-disable-next-line security/detect-object-injection
  const song = songsState[index];
  // Keep the under-player buttons' state in sync, auto-advance when a song ends,
  // and resume playback when the source changes (Next/Prev) while we are playing.
  useEffect(() => {
    const player = playerRef.current?.plyr as any;
    if (!player || typeof player.on !== 'function') return () => { /* noop */ };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onEnded = () => utils.next(index, songsState, setIndex);
    const onLoaded = () => { if (playingRef.current) tryPlay(player); };
    player.on('play', onPlay);
    player.on('pause', onPause);
    player.on('ended', onEnded);
    player.on('ready', onLoaded);
    player.on('loadeddata', onLoaded);
    return () => {
      try {
        player.off('play', onPlay); player.off('pause', onPause);
        player.off('ended', onEnded); player.off('ready', onLoaded);
        player.off('loadeddata', onLoaded);
      } catch { /* noop */ }
    };
  }, [index, songsState, setIndex, setPlaying, playerRef]);
  if (!song) return <> </>;
  if (isSoundCloud(song.url)) {
    return (
      // Distinct key from the Plyr branch so React cleanly unmounts the whole
      // wrapper when crossing the SoundCloud<->Plyr boundary instead of trying to
      // swap inner nodes that Plyr has restructured (which throws removeChild).
      <div key="sc-player" id="mainPlayer" className="audio soundcloud">
        <iframe
          title={song.title || 'SoundCloud player'}
          width="100%"
          height="166"
          scrolling="no"
          frameBorder="no"
          allow="autoplay"
          src={buildSoundCloudEmbed(song.url || '')}
        />
      </div>
    );
  }
  const source = buildSource(song.url || '');
  const isVideo = source.type === 'video';
  // Audio shows the album art behind a chrome-less bar (the buttons below drive it);
  // video renders at its natural size so there is no empty box above the picture.
  const audioBoxStyle: React.CSSProperties = {
    ...(utils.setPlayerStyle(song) as React.CSSProperties),
    minHeight: '40vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
  };
  return (
    // Stable key across all Plyr songs so audio<->video updates in place
    // (no remount); it differs from the SoundCloud branch's key so crossing that
    // boundary forces a clean unmount instead of a removeChild crash.
    <div
      key="plyr-player"
      id="mainPlayer"
      className={isVideo ? 'video' : 'audio'}
      style={isVideo ? undefined : audioBoxStyle}
    >
      <Plyr
        ref={playerRef}
        source={source}
        options={{ controls: isVideo ? VIDEO_CONTROLS : AUDIO_CONTROLS }}
      />
    </div>
  );
}

interface ImyButtonsProps {
  playing: boolean, setPlaying: (arg0: boolean) => void, index: number,
  songsState: Isong[], setIndex: (arg0: number) => void, isSingle: boolean,
  playerRef: React.RefObject<APITypes | null>
}
export function MyButtons(props: ImyButtonsProps): React.JSX.Element {
  const {
    playing, setPlaying, index, songsState, setIndex, isSingle, playerRef,
  } = props;
  // Toggle the player straight from the click so play() runs inside the user
  // gesture (browsers block play() deferred to an effect). The play/pause events
  // keep `playing` (and so the button label) in sync; fall back to state if the
  // player isn't ready yet.
  const togglePlay = () => {
    const player = playerRef.current?.plyr as any;
    if (player && typeof player.togglePlay === 'function') player.togglePlay();
    else utils.play(playing, setPlaying);
  };
  // eslint-disable-next-line security/detect-object-injection
  const currentSong = songsState[index];
  // SoundCloud songs render their own widget (with built-in controls), so hide
  // our Play/Pause for them; Next/Prev still navigate.
  const hidePlayPause = isSoundCloud(currentSong?.url);
  return (
    <div style={{ paddingTop: 0, margin: 'auto' }}>
      <div id="play-buttons">
        {hidePlayPause ? null : (
          <Button
            size="small"
            variant="contained"
            id="play-pause"
            className={playing ? 'on' : 'off'}
            onClick={togglePlay}
          >
            Play/Pause
          </Button>
        )}
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

function CopyRight(): React.JSX.Element {
  const year = new Date().getFullYear();
  return (
    <span>
      All Original Songs &copy;1991 &ndash;
      {' '}
      {year}
      {' '}
      Web Jam LLC
    </span>
  );
}

export function TextUnderPlayer(
  { songsState, index }: { songsState: Isong[], index: number },
): React.JSX.Element {
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
  category: string, setCategory: (arg0: string) => void, isSingle: boolean, setIndex: (arg0: number) => void
}
export function CategoryButtons(props: IcategoryButtonsProps): React.JSX.Element {
  const {
    category, setCategory, isSingle, setIndex,
  } = props;
  if (isSingle) return <> </>;
  return (
    <div className="categoryButtons">
      <button type="button" onClick={() => { setCategory('original'); setIndex(0); }} className={`original${category === 'original' ? 'on' : 'off'}`}>
        Original
      </button>
      <button type="button" onClick={() => { setCategory('mission'); setIndex(0); }} className={`mission${category === 'mission' ? 'on' : 'off'}`}>
        Mission
      </button>
      <button type="button" onClick={() => { setCategory('pub'); setIndex(0); }} className={`pub${category === 'pub' ? 'on' : 'off'}`}>
        Pub
      </button>
    </div>
  );
}

export function ShareButton(
  { showCopyUrl, setShowCopyUrl }: { showCopyUrl: boolean, setShowCopyUrl: (arg0: boolean) => void },
): React.JSX.Element {
  if (showCopyUrl) return <> </>;
  return (
    <Button size="small" onClick={() => setShowCopyUrl(true)} variant="contained" endIcon={<Share />}>
      Share
    </Button>
  );
}

export function CopyUrlButtons(
  { showCopyUrl, setShowCopyUrl, songUrl }: { songUrl: string, showCopyUrl: boolean, setShowCopyUrl: (arg0: boolean) => void },
): React.JSX.Element {
  if (!showCopyUrl) return <> </>;
  return (
    <>
      <input type="text" id="copyUrl" aria-label="Song URL" value={songUrl} disabled />
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
export function CopyShare(props: IcopyInputProps): React.JSX.Element {
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
  editDialogState: { showEditDialog: boolean, setShowEditDialog: (arg0: boolean) => void }
}
export function MusicPlayer({ songs, filterBy, editDialogState }: ImusicPlayerProps) {
  const [index, setIndex] = useState(0);
  const [songsState, setSongsState] = useState(songs);
  const [category, setCategory] = useState(filterBy);
  const [playing, setPlaying] = useState(false);
  const [isSingle, setIsSingle] = useState(false);
  const [editSong, setEditSong] = useState({ ...defaultSong, _id: '' } as Isong);
  // Shared Plyr ref so the under-player buttons drive the (chrome-less) player.
  const playerRef = useRef<APITypes>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    utils.initSongs(songs, category, searchParams, { setSongsState, setIndex, setIsSingle });
  }, [category, searchParams, songs]);
  useEffect(() => { utils.makeSingleSong(isSingle); }, [isSingle]);
  return (
    <div
      className="container-fluid"
      style={{
        maxWidth: '100%', paddingLeft: '15px', paddingRight: '15px', marginLeft: 'auto', marginRight: 'auto',
      }}
    >
      <CategoryTitle isSingle={isSingle} category={category} />
      <div id="player">
        <section id="playSection" className="col-12 mt-2 mr-0 col-md-7">
          <MyReactPlayer
            setIndex={setIndex}
            playing={playing}
            setPlaying={setPlaying}
            index={index}
            songsState={songsState}
            playerRef={playerRef}
          />
        </section>
        <MyButtons
          setIndex={setIndex}
          playing={playing}
          setPlaying={setPlaying}
          index={index}
          songsState={songsState}
          isSingle={isSingle}
          playerRef={playerRef}
        />
        <TextUnderPlayer songsState={songsState} index={index} />
        <CategoryButtons category={category} setCategory={setCategory} isSingle={isSingle} setIndex={setIndex} />
        <CopyShare songsState={songsState} index={index} isSingle={isSingle} />
      </div>
      <EditSongDialog editDialogState={editDialogState} currentSong={songsState[index]} editSongState={{ editSong, setEditSong }} />
    </div>
  );
}
