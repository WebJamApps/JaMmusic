import React, { Component } from 'react';
// import { connect } from 'react-redux';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';

class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      song: props.songs[0],
      player: {
        playing: false, shown: false, isShuffleOn: false, displayCopier: 'none', displayCopyMessage: 'none',
      },
    };
    this.state.songs = props.songs;
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
    this.updatePlayer = this.updatePlayer.bind(this);
    // this.shown = false;
    this.navigator = navigator;
    // this.isShuffleOn = false;
    // this.first = true;
    // this.urls = props.urls;
    // this.copy = props.copy;
    // this.state.url = this.urls[0];// eslint-disable-line prefer-destructuring
  }

  componentDidMount() {
    this.updatePlayer();
  }

  shouldComponentUpdate() {
    // console.log('shouldComponentUpdate');
    return true;
  }

  get playUrl() {
    const { song } = this.state;
    // const song = data.urls[0];
    return `${document.location.origin}/wj-music/${song.category}?oneplayer=true&id=${song._id}`;
  }

  reactPlayer() {
    const { song } = this.state;
    const { player } = this.state;
    // console.log(this.playing);
    return (
      <ReactPlayer
        style={{ backgroundColor: '#eee', textAlign: 'center' }}
        url={song.url}
        playing={player.playing}
        controls
        onEnded={this.playEnd}
        width="100%"
        id="mainPlayer"
        config={{ file: { attributes: { controlsList: 'nodownload' } } }}
      />
    );
  }

  buttons() {
    const { player } = this.state;
    return (
      <section className="mt-0 col-12 col-md-7" style={{ marginTop: '4px' }}>
        <button type="button" id="play-pause" role="menu" className={player.playing ? 'on' : 'off'} onClick={this.play}>Play/Pause</button>
        <button type="button" role="menu" id="next" onClick={this.next}>Next</button>
        <button type="button" role="menu" id="prev" onClick={this.prev}>Prev</button>
        <button type="button" id="shuffle" role="menu" className={player.isShuffleOn ? 'on' : 'off'} onClick={this.shuffle}>Shuffle</button>
        {/* <button type="button" role="menu" onClick={this.share}>Share</button>
        <button type="button" role="menu"><a id="homeLink" href="/?reload=true">Home</a></button> */}
      </section>
    );
  }

  pressKey() {}// eslint-disable-line class-methods-use-this

  updatePlayer() {
    // look for the id of the song and then filter the song from the rest of the list.
    const { search } = window.location;
    const { index } = this.state;
    const { songs } = this.state;
    // const { first } = this.state;
    const oneplayer = search.includes('oneplayer=true');
    // if it's not in one player mode, then just go on as normal.
    if (!oneplayer) {
      this.state.song = songs[index];// eslint-disable-line security/detect-object-injection
      // console.log(this.url);
    }
    // else if (first) {
    //   const id = search.match(/id=.+/g)[0].slice(3);
    //   this.state.song = songs.filter(song => song.id === id)[0];// eslint-disable-line prefer-destructuring
    //   // console.log(this.url);
    //   this.state.first = false;
    // }
    this.shouldComponentUpdate();
  }

  shuffle() {
    const { player } = this.state;
    const { copy } = this.state;
    const { songs } = this.state;
    if (player.isShuffleOn) {
      this.setState({
        songs: copy,
        player: { isShuffleOn: false },
        song: copy[0],
        index: 0,
      });
      // document.getElementById('shuffle').classList.remove('on');
    } else {
      const shuffled = songs;
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];// eslint-disable-line security/detect-object-injection
      }
      // document.getElementById('shuffle').classList.add('on');
      this.setState({
        songs: shuffled,
        player: { isShuffleOn: true },
        song: shuffled[0],
        index: 0,
      });
    }
    this.updatePlayer();
  }

  playEnd() {
    this.next();
  }

  playTrue() {
    this.updatePlayer();
  }

  prev() {
    // console.log('prev');
    const { index } = this.state;
    const minusIndex = index - 1;
    const { songs } = this.state;
    // console.log(minusIndex);
    if (minusIndex < 0) {
      const newIndex = songs.length - 1;
      // console.log(newIndex);
      this.setState({
        index: newIndex,
        song: songs[newIndex], // eslint-disable-line security/detect-object-injection
      });
      // this.state.index = newIndex;
      // this.state.song = songs[newIndex];// eslint-disable-line security/detect-object-injection
    } else {
      this.setState({
        song: songs[minusIndex], // eslint-disable-line security/detect-object-injection
        index: minusIndex,
      });
      // this.state.song = songs[minusIndex];// eslint-disable-line security/detect-object-injection
      // this.state.index = minusIndex;
    }
    // console.log(this.state.song);
    this.updatePlayer();
  }

  play() {
    const { player } = this.state;
    const isPlaying = !player.playing;
    this.setState({
      player: { playing: isPlaying },
    });
    // this.state.player.playing = !player.playing;
    // if (isPlaying) {
    //   document.getElementById('play-pause').classList.remove('off');
    //   document.getElementById('play-pause').classList.add('on');
    // } else {
    //   document.getElementById('play-pause').classList.remove('on');
    //   document.getElementById('play-pause').classList.add('off');
    // }
    this.updatePlayer();
  }

  pause() {
    this.setState({
      player: { playing: false },
    });
    this.updatePlayer();
  }

  next() {
    this.state.index += 1;
    const { index } = this.state;
    const { songs } = this.state;
    if (index >= songs.length) {
      this.setState({
        index: 0,
        song: songs[0],
      });
      // this.state.index = 0;
      // this.state.song = songs[0];// eslint-disable-line security/detect-object-injection
    } else {
      this.setState({
        song: songs[index], // eslint-disable-line security/detect-object-injection
      });
      // this.url = this.urls[this.index];
    }
    this.updatePlayer();
  }

  share() {
    const { player } = this.state;
    
    if (player.displayCopier === 'none') {
      this.setState({ player: { ...player, displayCopier: 'block' } });
    } else {
      this.setState({ player: { ...player, displayCopier: 'none' } });
    }

    // const el = document.getElementById('copier');
    // if (shown) {
    //   el.classList.add('d-none');
    //   this.state.shown = false;
    // } else {
    //   el.classList.remove('d-none');
    //   this.state.shown = true;
    // }
  }

  copyShare() {
    const { player } = this.state;

    this.navigator.clipboard.writeText(this.playUrl).then(() => {
      this.share();
  
      this.setState({ player: { ...player, displayCopier: 'block' } });
      
      setTimeout(() => {
        this.setState({ player: { ...player, displayCopier: 'none' } });
      }, 1500);
    });
  }

  render() {
    const { song, player } = this.state;
    return (
      <div className="container-fluid">
        <div id="player" className="mb-2 row justify-content-md-center">
          <section id="playSection" className="col-12 mt-2 mr-0 col-md-7" style={{ display: 'inline', textAlign: 'center', marginBottom: '0' }}>
            {this.reactPlayer()}
          </section>
          <section className="col-12 col-md-7 mt-1" style={{ fontSize: '0.8em', marginTop: '-10px', marginBottom: '0' }}>
            <strong>{song.title}</strong>
          </section>
          {this.buttons()}
          <section className="row m-0 mt-2" id="copier" style={{ display: player.displayCopier || 'none' }}>
            <div id="copyInput" className="col-9">
              <input id="copyUrl" disabled value={this.playUrl} style={{ backgroundColor: '#fff' }} className="" />
            </div>
            <div id="copyButton" className="col-3" role="presentation" onClick={this.copyShare} style={{ cursor: 'pointer' }}>
              <span id="inputGroup" style={{ fontSize: '0.8em' }}>Copy URL</span>
            </div>
          </section>
          <section id="copyMessage" className="col-12 col-md-7 m-0">
            <span className="text-success" style={{ fontSize: '0.8em', display: player.displayCopyMessage || 'none' }}>
              Url copied Url to clipboard
            </span>
          </section>
        </div>
        <div id="sectionUnderButtons" style={{ minHeight: '3in' }}>&nbsp;</div>
      </div>
    );
  }
}
MusicPlayer.defaultProps = {
  songs: [{ url: '' }],
  copy: [{ url: '' }],
};

MusicPlayer.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.shape),
  copy: PropTypes.arrayOf(PropTypes.shape),
};

/* istanbul ignore next */
// const mapStoreToProps = store => ({ songs: store.songs.songs });
// export default connect(mapStoreToProps)(MusicPlayer);
export default MusicPlayer;
