// import ReactPlayer from 'react-player';
// import type { ISong } from 'src/providers/Data.provider';
// import type { Iplayer } from '.';
// import musicPlayerUtils from './musicPlayerUtils';
// import musicUtils from './musicUtils';

// const PageH4 = ({ pageTitle }: { pageTitle:string }): JSX.Element => (
//   <h4
//     style={{
//       textAlign: 'center',
//       margin: '20px',
//       fontWeight: 'bold',
//       marginBottom: '0px',
//       fontSize: '16pt',
//     }}
//     id="headerTitle"
//   >
//     {pageTitle}
//   </h4>
// );
// interface IwjReactPlayerProps {
//   song:ISong | null, player:any, index:number, songsState:any, setState:(...args:any)=>void
// }
// function WjReactPlayer(props:IwjReactPlayerProps) {
//   const {
//     song, player, index, songsState, setState,
//   } = props;
//   if (!song || !song.url) return null;
//   return (
//     <ReactPlayer
//       style={musicUtils.setPlayerStyle(song)}
//       url={song.url}
//       playing={player.playing}
//       controls
//       onEnded={() => musicPlayerUtils.next(index, songsState, setState)}
//       width="100%"
//       height="40vh"
//       id="mainPlayer"
//       className="audio"
//       config={{ youtube: { playerVars: { controls: 0 } }, file: { attributes: { controlsList: 'nodownload' } } }}
//     />
//   );
// }
// function CopyRight(): JSX.Element { // eslint-disable-line class-methods-use-this
//   return (<span>All Original Songs &copy;2019 &ndash; 2020 Web Jam LLC</span>);
// }
// function TextUnderPlayer({ song }:{ song: ISong | null }) {
//   if (!song) return null;
//   return (
//     <section
//       className="mt-1 textUnderPlayer"
//       style={{
//         fontSize: '0.8em', marginTop: 0, marginBottom: '0', paddingTop: 0, paddingBottom: 0,
//       }}
//     >
//       <strong>
//         {song.title ? song.title : null}
//         {song.composer && song.category !== 'original' ? ` by ${song.composer}` : null}
//         {song.artist ? ` - ${song.artist}` : null}
//       </strong>
//       <p style={{
//         textAlign: 'center', fontSize: '8pt', marginTop: '4px', marginBottom: 0,
//       }}
//       >
//         {song.album ? song.album : null}
//         {song.year ? `, ${song.year}` : null}
//       </p>
//       <p style={{
//         textAlign: 'center', fontSize: '8pt', marginTop: '2px', marginBottom: 0,
//       }}
//       >
//         {song !== null && song.category === 'original' ? <CopyRight /> : null}
//       </p>
//     </section>
//   );
// }

// function ButtonsSection({
//   song, player, index, songsState, setState, missionState, pubState,
// }:any): JSX.Element {
//   const url = musicPlayerUtils.playUrl(song);
//   return (
//     <section className="mt-0 songPlayerButtonsSection" style={{ paddingTop: 0 }}>
//       <div id="play-buttons">
//         <button
//           type="button"
//           id="play-pause"
//           role="menu"
//           className={player.playing ? 'on' : 'off'}
//           onClick={() => musicPlayerUtils.play(player, setState)}
//         >
//           Play/Pause
//         </button>
//         <button
//           type="button"
//           role="menu"
//           id="next"
//           onClick={() => musicPlayerUtils.next(index, songsState, setState)}
//         >
//           Next

//         </button>
//         <button
//           type="button"
//           role="menu"
//           id="prev"
//           onClick={() => musicPlayerUtils.prev(index, songsState, setState)}
//         >
//           Prev
//         </button>
//         <button
//           type="button"
//           id="shuffle"
//           role="menu"
//           className={player.isShuffleOn ? 'on' : 'off'}
//           onClick={() => musicPlayerUtils.shuffle(player, songsState, missionState, pubState, setState)}
//         >
//           Shuffle

//         </button>
//       </div>
//       {this.lineTwoButtons()}
//       {this.lineThreeButtons(url)}
//     </section>
//   );
// }
// interface IcopyInputProps {
//   player: Iplayer, song: ISong | null, writeText:(arg0:string)=>Promise<void>, setState:(...args:any)=>void
// }
// function CopyInput(props:IcopyInputProps): JSX.Element {
//   const {
//     player, song, writeText, setState,
//   } = props;
//   return (
//     <div id="copyInput" style={{ marginTop: '-20px', marginBottom: '40px' }}>
//       {player.displayCopyMessage && <div className="copySuccess"> Url copied Url to clipboard </div>}
//       {song ? <input id="copyUrl" disabled value={musicPlayerUtils.playUrl(song)} style={{ backgroundColor: '#fff' }} className="form-control" />
//         : null}
//       <div
//         id="copyButton"
//         role="presentation"
//         onClick={() => musicPlayerUtils.copyShare(player, song, writeText, setState)}
//       >
//         <span className="copy-url">
//           Copy URL
//         </span>
//       </div>
//     </div>
//   );
// }
// interface IWjSongPlayerProps {
//   pageTitle:string, classOverlay:string, song:ISong | null, player:Iplayer, index:number,
//   songsState:any, setState:(...args:any)=>void, missionState:string, pubState:string, writeText:(arg0:string)=>Promise<void>
// }
// export function WjSongPlayer(props:IWjSongPlayerProps) {
//   const {
//     pageTitle, classOverlay, song, player, index, songsState, setState, missionState, pubState, writeText,
//   } = props;
//   return (
//     <div className="container-fluid">
//       <PageH4 pageTitle={pageTitle} />
//       <div id="player" className="mb-2 row justify-content-md-center">
//         <section id="playSection" className="col-12 mt-2 mr-0 col-md-7">
//           <div className={classOverlay} />
//           <WjReactPlayer song={song} player={player} index={index} songsState={songsState} setState={setState} />
//         </section>
//         <TextUnderPlayer song={song} />
//         <ButtonsSection
//           song={song}
//           player={player}
//           index={index}
//           songState={songsState}
//           setState={setState}
//           missionState={missionState}
//           pubState={pubState}
//         />
//         <section className="mt-1 col-12" id="copier" style={{ display: player.displayCopier, marginTop: '0' }}>
//           <CopyInput player={player} song={song} writeText={writeText} setState={setState} />
//         </section>
//       </div>
//     </div>
//   );
// }
