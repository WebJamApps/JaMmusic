import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import musicPlayerUtils from './musicPlayerUtils';
import mapStoreToProps from '../../redux/mapStoreToProps';
const state = {
  pageTitle: 'Original Songs',
  songsState: [],
  copy: [],
  song: null,
  index: 0,
  missionState: 'off',
  pubState: 'off',
  player: {
    playing: false, shown: false, isShuffleOn: false, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
  },
};
export class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = state;
    this.play = this.play.bind(this);
    this.playEnd = this.playEnd.bind(this);
    this.pause = this.pause.bind(this);
    this.shuffle = this.shuffle.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.buttons = this.buttons.bind(this);
    this.setIndex = this.setIndex.bind(this);
    this.ToggleSongTypes = this.ToggleSongTypes.bind(this);
    this.navigator = window.navigator;
    this.musicPlayerUtils = musicPlayerUtils;
  }
  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const { player } = this.state;
    const { songs, filterBy } = this.props;
    const newSongs = songs.filter((song) => song.category === filterBy);
    this.setState({ song: newSongs[0], songsState: newSongs, copy: newSongs });
    await this.musicPlayerUtils.checkOnePlayer(params, player, this);
    return this.musicPlayerUtils.runIfOnePlayer(this);
  }
  setIndex(songs, category) { // eslint-disable-line class-methods-use-this
    let categorySongs = [];
    const otherSongs = [];
    for (let i = 0; songs.length > i; i += 1) { // eslint-disable-next-line security/detect-object-injection
      (songs[i].category === category) ? categorySongs.push(songs[i]) :  otherSongs.push(songs[i]);
    }
    categorySongs = categorySongs.concat(otherSongs);
    return categorySongs;
  }
  ToggleSongTypes(type) {
    const lcType = type.toLowerCase();
    const { player } = this.state;
    let { songsState, pageTitle } = this.state;
    const { songs } = this.props;
    const typeInState = `${lcType}State`;
    const typeState = this.state[typeInState.toString()]; // eslint-disable-line react/destructuring-assignment
    if (typeState === 'off') {
      songsState = [...songsState, ...songs.filter((song) => song.category === lcType)];
      pageTitle = pageTitle.replace('Songs', '');
      pageTitle += ` & ${type} Songs`;
    } else {
      songsState = songsState.filter((song) => song.category !== lcType);
       pageTitle = pageTitle.replace(` & ${type}`, '');
    }
    songsState = this.setIndex(songsState, lcType);
    this.setState({
      player: { ...player, isShuffleOn: false },
      player: { ...player },
      pageTitle,
      songsState,
      [typeInState]: typeState === 'off' ? 'on' : 'off',
      song: songsState[0],
      index: 0,
    });
  }
  playUrl() {
    const { song } = this.state;
    if (song !== null) return `${document.location.origin}/music/${window.location.pathname.split('/').pop()}?oneplayer=true&id=${song._id}`;
    return null;
  }
  reactPlayer() {
    const { song } = this.state;
    const { player } = this.state;
    return (
      <ReactPlayer
        style={{ backgroundColor: '#eee', textAlign: 'center' }}
        url={song.url}
        playing={player.playing}
        controls
        onEnded={this.playEnd}
        width="100%"
        height="40vh"
        id="mainPlayer"
        config={{ file: { attributes: { controlsList: 'nodownload' } } }}
      />
    );
  }
  buttons() {
    const { missionState, pubState, player: { playing, isShuffleOn, onePlayerMode } } = this.state;
    return (
      <section className="mt-0 col-12 col-md-10" style={{ marginTop: '4px' }}>
        <button type="button" id="play-pause" role="menu" className={playing ? 'on' : 'off'} onClick={this.play}>Play/Pause</button>
        <button type="button" role="menu" id="next" onClick={this.next}>Next</button>
        <button type="button" role="menu" id="prev" onClick={this.prev}>Prev</button>
        <button type="button" id="shuffle" role="menu" className={isShuffleOn ? 'on' : 'off'} onClick={this.shuffle}>Shuffle</button>
        <button type="button" id="share-button" role="menu" onClick={() => this.musicPlayerUtils.share(this)}>Share</button>
        {onePlayerMode ? this.musicPlayerUtils.homeButton(onePlayerMode) : null}
        <div id="mAndP" style={{ height: '22px', margin: 'auto' }}>
          <button type="button" onClick={() => this.ToggleSongTypes('Mission')} className={`mission${missionState}`}> Mission </button>
          <button type="button" onClick={() => this.ToggleSongTypes('Pub')} className={`pub${pubState}`}> Pub </button>
        </div>
      </section>
    );
  }
  shuffle() {
    const { player, copy, songsState } = this.state;
    if (player.isShuffleOn) {
      this.setState({
        songsState: copy, player: { ...player, isShuffleOn: false }, song: copy[0], index: 0,
      });
    } else {
      const shuffled = songsState;
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];// eslint-disable-line security/detect-object-injection
      }
      this.setState({
        songsState: shuffled, player: { ...player, isShuffleOn: true }, song: shuffled[0], index: 0,
      });
    }
  }
  playEnd() { this.next(); }
  prev() {
    const { index, songsState } = this.state;
    const minusIndex = index - 1;
  if (minusIndex < 0 || minusIndex > songsState.length) {
    const newIndex = songsState.length - 1;
    this.setState({ index: newIndex, song: songsState[parseInt(newIndex, 0)] });
  } else this.setState({ song: songsState[parseInt(minusIndex, 0)], index: minusIndex });
}
  play() {
    const { player } = this.state;
    const isPlaying = !player.playing;
    this.setState({ player: { ...player, playing: isPlaying } });
  }
  pause() {
    const { player } = this.state;
    this.setState({ player: { ...player, playing: false } });
  }
  next() {
    let { index } = this.state;
    index += 1;
    const { songsState } = this.state;
     (index >= songsState.length) ? this.setState({ index: 0, song: songsState[0] }) : this.setState({ song: songsState[parseInt(index, 0)], index });
  }
  copyInput(player, song) {
    return (
      <div id="copyInput">
        { player.displayCopyMessage && <div className="copySuccess"> Url copied Url to clipboard </div> }
        {song !== null ? <input id="copyUrl" disabled value={this.playUrl()} style={{ backgroundColor: '#fff' }} className="form-control" />
          : null}
        <div
          id="copyButton"
          role="presentation"
          onClick={() => this.musicPlayerUtils.copyShare(this)}
          style={{ cursor: 'pointer', marginTop: '11px' }}
        >
          <span style={{
            backgroundColor: '#ccc', padding: '4px 15px', borderRadius: '5px', fontSize: '0.8em',
          }}
          >
        Copy URL
          </span>
        </div>
      </div>
    );
  }
  copyRight() { // eslint-disable-line class-methods-use-this
    return (
      <span>All Original Songs &copy;2019 Web Jam LLC</span>
    );
  }
  pageH4(pageTitle) { // eslint-disable-line class-methods-use-this
    return (
      <h4
        style={{
          textAlign: 'center', margin: '20px', fontWeight: 'bold', marginBottom: '6px',
        }}
        id="headerTitle"
      >
        {pageTitle}
      </h4>
    );
  }
  textUnderPlayer(song) {
    return (
      <section className="col-12 mt-1" style={{ fontSize: '0.8em', marginTop: '8px', marginBottom: '0' }}>
        <strong>
          {song !== null ? song.title : null}
          {song !== null && song.composer !== undefined && song.category !== 'originals' ? ` by ${song.composer}` : null}
          {song !== null && song.artist !== undefined ? ` - ${song.artist}` : null}
        </strong>
        <p style={{
          textAlign: 'center', fontSize: '8pt', marginTop: '4px', marginBottom: 0,
        }}
        >
          {song !== null && song.album !== undefined ? song.album : null}
          {song !== null && song.year !== undefined ? `, ${song.year}` : null}
        </p>
        <p style={{
          textAlign: 'center', fontSize: '8pt', marginTop: '2px', marginBottom: 0,
        }}
        >
          {song !== null && song.category === 'originals' ? this.copyRight() : null}
        </p>
      </section>
    );
  }
  render() {
    const { song } = this.state;
    const { player, pageTitle } = this.state;
    return (
      <div className="container-fluid">
        {this.pageH4(pageTitle)}
        <div id="player" className="mb-2 row justify-content-md-center">
          <section id="playSection" className="col-12 mt-2 mr-0 col-md-7" style={{ display: 'inline', textAlign: 'center', marginBottom: '0' }}>
            {song !== null && song !== undefined && song.url !== undefined ? this.reactPlayer() : null}
          </section>
          {this.textUnderPlayer(song)}
          {this.buttons()}
          <section className="mt-1 col-12" id="copier" style={{ display: player.displayCopier, marginTop: '0' }}>
            {this.copyInput(player, song)}
          </section>
        </div>
      </div>
    );
  }
}
MusicPlayer.defaultProps = {   songs: [{ url: '', title: '' }], };
MusicPlayer.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
  filterBy: PropTypes.string.isRequired,
};
export default connect(mapStoreToProps)(MusicPlayer);
