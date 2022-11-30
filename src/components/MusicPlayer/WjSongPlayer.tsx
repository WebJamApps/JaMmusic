import ReactPlayer from 'react-player';
import type { ISong } from 'src/providers/Data.provider';
import musicUtils from './musicUtils';

const PageH4 = ({ pageTitle }: { pageTitle:string }): JSX.Element => (
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
interface IwjReactPlayerProps {
  song:ISong | null, player:any, index:number, songsState:any, setState:(...args:any)=>void
}
function WjReactPlayer(props:IwjReactPlayerProps) {
  const {
    song, player, index, songsState, setState,
  } = props;
  if (!song || !song.url) return null;
  return (
    <ReactPlayer
      style={musicUtils.setPlayerStyle(song)}
      url={song.url}
      playing={player.playing}
      controls
      onEnded={() => musicUtils.next(index, songsState, setState)}
      width="100%"
      height="40vh"
      id="mainPlayer"
      className="audio"
      config={{ youtube: { playerVars: { controls: 0 } }, file: { attributes: { controlsList: 'nodownload' } } }}
    />
  );
}
function CopyRight(): JSX.Element { // eslint-disable-line class-methods-use-this
  return (<span>All Original Songs &copy;2019 &ndash; 2020 Web Jam LLC</span>);
}
function TextUnderPlayer({ song }:{ song: ISong | null }) {
  if (!song) return null;
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
interface IWjSongPlayerProps {
  pageTitle:string, classOverlay:string, song:ISong | null, player:any, index:number,
  songsState:any, setState:(...args:any)=>void
}
export function WjSongPlayer(props:IWjSongPlayerProps) {
  const {
    pageTitle, classOverlay, song, player, index, songsState, setState,
  } = props;
  return (
    <div className="container-fluid">
      <PageH4 pageTitle={pageTitle} />
      <div id="player" className="mb-2 row justify-content-md-center">
        <section id="playSection" className="col-12 mt-2 mr-0 col-md-7">
          <div className={classOverlay} />
          <WjReactPlayer song={song} player={player} index={index} songsState={songsState} setState={setState} />
        </section>
        <TextUnderPlayer song={song} />
        {this.buttons()}
        <section className="mt-1 col-12" id="copier" style={{ display: player.displayCopier, marginTop: '0' }}>
          {this.copyInput(player, song)}
        </section>
      </div>
    </div>
  );
}
