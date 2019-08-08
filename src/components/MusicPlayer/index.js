import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';
import musicPlayerUtils from './musicPlayerUtils';
import mapStoreToProps from '../../redux/mapStoreToProps';

class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      song: null,
      player: {
        playing: false,
        shown: false,
        isShuffleOn: false,
        displayCopier: 'none',
        displayCopyMessage: false,
        onePlayerMode: false,
      },
    };
    this.state.songs = [];
    this.state.copy = props.copy;
    this.play = this.play.bind(this);
    this.state.index = 0;
    this.playEnd = this.playEnd.bind(this);
    this.pause = this.pause.bind(this);
    this.shuffle = this.shuffle.bind(this);
    this.share = this.share.bind(this);
    this.copyShare = this.copyShare.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.buttons = this.buttons.bind(this);
    this.navigator = window.navigator;
    this.musicPlayerUtils = musicPlayerUtils;
  }

  componentWillMount() {
    const params = new URLSearchParams(window.location.search);
    const { player } = this.state;
    const { songs, filterBy } = this.props;
    // console.log(songs);// eslint-disable-line
    const newSongs = songs.filter(song => song.category === filterBy);
    console.log(newSongs);//eslint-disable-line
    this.setState({ song: newSongs[0], songs: newSongs });
    // const { songs } = this.props;
    // const { allSongs } = this.props;
    return this.musicPlayerUtils.checkOnePlayer(params, player, this);
  }

  componentDidMount() {
    return this.musicPlayerUtils.runIfOnePlayer(this);
  }

  // componentDidUpdate() {
  //   return this.musicPlayerUtils.resetSongs(this);
  // }

  get playUrl() {
    const { song } = this.state;
    return `${document.location.origin}/music/${window.location.pathname.split('/').pop()}?oneplayer=true&id=${song._id}`;
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

  buttons() { // add the Pub and Mission buttons
    const { player: { playing, isShuffleOn, onePlayerMode } } = this.state;
    return (
      <section className="mt-0 col-12 col-md-10" style={{ marginTop: '4px' }}>
        <button type="button" id="play-pause" role="menu" className={playing ? 'on' : 'off'} onClick={this.play}>Play/Pause</button>
        <button type="button" role="menu" id="next" onClick={this.next}>Next</button>
        <button type="button" role="menu" id="prev" onClick={this.prev}>Prev</button>
        <button type="button" id="shuffle" role="menu" className={isShuffleOn ? 'on' : 'off'} onClick={this.shuffle}>Shuffle</button>
        <button type="button" role="menu" onClick={this.share}>Share</button>
        {this.musicPlayerUtils.homeButton(onePlayerMode)}
      </section>
    );
  }

  shuffle() {
    const { player, copy, songs } = this.state;
    if (player.isShuffleOn) {
      this.setState({
        songs: copy,
        player: { ...player, isShuffleOn: false },
        song: copy[0],
        index: 0,
      });
    } else {
      const shuffled = songs;
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];// eslint-disable-line security/detect-object-injection
      }
      this.setState({
        songs: shuffled,
        player: { ...player, isShuffleOn: true },
        song: shuffled[0],
        index: 0,
      });
    }
  }

  playEnd() { this.next(); }

  prev() {
    const { index } = this.state;
    const minusIndex = index - 1;
    const { songs } = this.state;
    if (minusIndex < 0) {
      const newIndex = songs.length - 1;
      this.setState({
        index: newIndex,
        song: songs[parseInt(newIndex, 0)],
      });
    } else {
      this.setState({
        song: songs[parseInt(minusIndex, 0)],
        index: minusIndex,
      });
    }
  }

  play() {
    const { player } = this.state;
    const isPlaying = !player.playing;
    this.setState({
      player: { ...player, playing: isPlaying },
    });
  }

  pause() {
    const { player } = this.state;
    this.setState({
      player: { ...player, playing: false },
    });
  }

  next() {
    let { index } = this.state;
    index += 1;
    const { songs } = this.state;
    if (index >= songs.length) {
      this.setState({ index: 0, song: songs[0] });
    } else {
      this.setState({ song: songs[parseInt(index, 0)], index });
    }
  }

  share() {
    const { player, player: { displayCopier } } = this.state;
    if (displayCopier === 'none') this.setState({ player: { ...player, displayCopier: 'block' } });
    else this.setState({ player: { ...player, displayCopier: 'none' } });
    this.musicPlayerUtils.showHideButtons('none');
  }

  copyShare() {
    const { player } = this.state;
    this.navigator.clipboard.writeText(this.playUrl).then(() => {
      this.setState({ player: { ...player, displayCopyMessage: true } });
      setTimeout(() => {
        this.musicPlayerUtils.showHideButtons('block');
        this.setState({ player: { ...player, displayCopier: 'none', displayCopyMessage: false } });
      }, 1500);
    });
  }

  render() {
    const { song } = this.state;
    const { player } = this.state;
    return (
      <div className="container-fluid">
        <div id="player" className="mb-2 row justify-content-md-center">
          <section id="playSection" className="col-12 mt-2 mr-0 col-md-7" style={{ display: 'inline', textAlign: 'center', marginBottom: '0' }}>
            {song !== null ? this.reactPlayer() : null}
          </section>
          <section className="col-12 mt-1" style={{ fontSize: '0.8em', marginTop: '15px', marginBottom: '0' }}>
            <strong>{song.title}</strong>
          </section>
          {this.buttons()}
          <section className="mt-1 col-12" id="copier" style={{ display: player.displayCopier, marginTop: '0' }}>
            <div id="copyInput">
              { player.displayCopyMessage && <div className="copySuccess"> Url copied Url to clipboard </div> }
              <input id="copyUrl" disabled value={this.playUrl} style={{ backgroundColor: '#fff' }} className="form-control" />
              <div id="copyButton" role="presentation" onClick={this.copyShare} style={{ cursor: 'pointer', marginTop: '11px' }}>
                <span style={{
                  backgroundColor: '#ccc', padding: '4px 15px', borderRadius: '5px', fontSize: '0.8em',
                }}
                >
                  Copy URL
                </span>
              </div>
            </div>
          </section>
        </div>
      </div>
    );
  }
}
MusicPlayer.defaultProps = {
  songs: [{ url: '', title: '' }],
  copy: [{ url: '' }],
};
MusicPlayer.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
  copy: PropTypes.arrayOf(PropTypes.shape({})),
  filterBy: PropTypes.string.isRequired,
  // allSongs: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
};
export default connect(mapStoreToProps)(MusicPlayer);
