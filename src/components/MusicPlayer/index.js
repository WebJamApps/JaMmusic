import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import musicPlayerUtils from './musicPlayerUtils';
import mapStoreToProps from '../../redux/mapStoreToProps';
import musicUtils from './musicUtils';
import commonUtils from '../../lib/commonUtils';

const state = {
  pageTitle: 'Original Songs',
  songsState: [],
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
    this.setClassOverlay = this.setClassOverlay.bind(this);
    this.navigator = window.navigator;
    this.musicPlayerUtils = musicPlayerUtils;
    this.musicUtils = musicUtils;
    this.commonUtils = commonUtils;
  }

  async componentDidMount() {
    const params = new URLSearchParams(window.location.search);
    const { player } = this.state;
    const { songs, filterBy } = this.props;
    const newSongs = songs.filter((song) => song.category === filterBy);
    this.setState({ song: newSongs[0], songsState: newSongs });
    await this.musicPlayerUtils.checkOnePlayer(params, player, this);
    return this.musicPlayerUtils.runIfOnePlayer(this);
  }

  setClassOverlay() {
    const { song, player } = this.state;
    let classOverlay = 'mainPlayer';
    if (player.playing === false) {
      if (song !== null && song !== undefined && song.url[8] === 's') {
        classOverlay = 'soundcloudOverlay';
      }
      if (song !== null && song !== undefined && song.url[12] === 'y') {
        classOverlay = 'youtubeOverlay';
      }
    }
    return classOverlay;
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
        config={{
          youtube: {
            playerVars: { controls: 0 },
          },
          file: { attributes: { controlsList: 'nodownload' } },
        }}
      />
    );
  }

  buttons() {
    const { missionState, pubState, player: { playing, isShuffleOn, onePlayerMode } } = this.state;
    return (
      <section className="mt-0 col-12 col-md-10" style={{ marginTop: '4px', paddingTop: 0 }}>
        <button type="button" id="play-pause" role="menu" className={playing ? 'on' : 'off'} onClick={this.play}>Play/Pause</button>
        <button type="button" role="menu" id="next" onClick={this.next}>Next</button>
        <button type="button" role="menu" id="prev" onClick={this.prev}>Prev</button>
        <button type="button" id="shuffle" role="menu" className={isShuffleOn ? 'on' : 'off'} onClick={this.shuffle}>Shuffle</button>
        <button type="button" id="share-button" role="menu" onClick={() => this.musicPlayerUtils.share(this)}>Share</button>
        {onePlayerMode ? this.musicPlayerUtils.homeButton(onePlayerMode) : null}
        <div id="mAndP" style={{ height: '22px', margin: 'auto' }}>
          <button type="button" onClick={() => this.musicPlayerUtils.toggleSongTypes('Mission', this)} className={`mission${missionState}`}>
            Mission
          </button>
          <button type="button" onClick={() => this.musicPlayerUtils.toggleSongTypes('Pub', this)} className={`pub${pubState}`}> Pub </button>
        </div>
      </section>
    );
  }

  shuffle() {
    const {
      player, songsState, missionState, pubState,
    } = this.state;
    if (player.isShuffleOn) {
      let reset = songsState;
      if (missionState === 'on') {
        reset = this.musicUtils.setIndex(reset, 'mission');
      }
      if (pubState === 'on') {
        reset = this.musicUtils.setIndex(reset, 'pub');
      }
      this.setState({
        songsState: reset, player: { ...player, isShuffleOn: false }, song: reset[0], index: 0,
      });
    } else {
      const shuffled = this.musicPlayerUtils.shuffleThem(songsState);
      // const shuffled = songsState;
      // for (let i = shuffled.length - 1; i > 0; i -= 1) {
      //   const j = Math.floor(Math.random() * (i + 1));
      //   [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];// eslint-disable-line security/detect-object-injection
      // }
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
    if (index >= songsState.length) this.setState({ index: 0, song: songsState[0] });
    else this.setState({ song: songsState[parseInt(index, 0)], index });
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

  textUnderPlayer(song) {
    return (
      <section
        className="col-12 mt-1"
        style={{
          fontSize: '0.8em', marginTop: 0, marginBottom: '0', paddingTop: 0, paddingBottom: 0,
        }}
      >
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
    const {
      song, player, pageTitle,
    } = this.state;
    const classOverlay = this.setClassOverlay();
    return (
      <div className="container-fluid">
        {this.musicUtils.pageH4(pageTitle)}
        <div id="player" className="mb-2 row justify-content-md-center">
          <section id="playSection" className="col-12 mt-2 mr-0 col-md-7" style={{ display: 'inline', textAlign: 'center', marginBottom: '0' }}>
            <div className={classOverlay} />
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

MusicPlayer.defaultProps = {
  songs: [{ url: '', title: '' }],
};
MusicPlayer.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
  filterBy: PropTypes.string.isRequired,
};
export default connect(mapStoreToProps)(MusicPlayer);
