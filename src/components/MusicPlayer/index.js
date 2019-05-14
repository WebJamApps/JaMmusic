import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types';

class MusicPlayer extends Component {
  constructor(props) {
    super(props);
    this.state = { data: {} };
    this.play = this.play.bind(this);
    this.index = 0;
    this.state.playing = false;
    this.state.playEnd = this.playEnd.bind(this);
    this.pause = this.pause.bind(this);
    this.shuffle = this.shuffle.bind(this);
    this.share = this.share.bind(this);
    this.copyShare = this.copyShare.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.updatePlayer = this.updatePlayer.bind(this);
    this.shown = false;
    this.navigator = navigator;
    this.isShuffleOn = false;
    this.first = true;
    // this.urls = props.urls;
    // this.copy = props.copy;
    // this.state.url = this.urls[0];// eslint-disable-line prefer-destructuring
  }

  componentDidMount() {
    this.updatePlayer();
  }

  shouldComponentUpdate() {
    console.log('shouldComponentUpdate');
    return true;
  }

  get playUrl() {
    const { data } = this.state;
    const song = data.urls[0];
    return `${document.location.origin}/wj-music/${song.category}?oneplayer=true&id=${song.id}`;
  }

  reactPlayer() {
    console.log(this.playing);
    return (
      <ReactPlayer
        style={{ backgroundColor: '#eee', textAlign: 'center' }}
        url={this.state.url.url}
        playing={this.state.playing}
        controls
        onEnded={this.state.playEnd}
        width="100%"
        id="mainPlayer"
        config={{ file: { attributes: { controlsList: 'nodownload' } } }}
      />
    );
  }

  buttons() {
    return (
      <section className="mt-0 col-12 col-md-7">
        <button type="button" id="play-pause" role="menu" onClick={this.play}>Play/Pause</button>
        <button type="button" role="menu" onClick={this.next}>Next</button>
        <button type="button" role="menu" onClick={this.prev}>Prev</button>
        <button type="button" id="shuffle" role="menu" onClick={this.shuffle}>Shuffle</button>
        <button type="button" role="menu" onClick={this.share}>Share</button>
        <button type="button" role="menu"><a id="homeLink" href="/?reload=true">Home</a></button>
      </section>
    );
  }

  pressKey() {}// eslint-disable-line class-methods-use-this

  shuffle() {
    if (this.isShuffleOn) {
      this.urls = this.copy;
      this.isShuffleOn = false;
      document.getElementById('shuffle').classList.remove('on');
    } else {
      this.urls = this.urls.slice();
      for (let i = this.urls.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.urls[i], this.urls[j]] = [this.urls[j], this.urls[i]];// eslint-disable-line security/detect-object-injection
      }
      document.getElementById('shuffle').classList.add('on');
      this.isShuffleOn = true;
    }
    this.index = 0;
    this.url = this.urls[this.index];
    this.updatePlayer();
  }

  playEnd() {
    this.next();
  }

  playTrue() {
    this.updatePlayer();
  }

  prev() {
    this.index -= 1;
    if (this.index < 0) {
      this.index = this.urls.length - 1;
      this.url = this.urls[this.index];
    } else {
      this.url = this.urls[this.index];
    }
    this.playTrue();
  }

  play() {
    this.playing = !this.playing;
    if (this.playing) {
      document.getElementById('play-pause').classList.remove('off');
      document.getElementById('play-pause').classList.add('on');
    } else {
      document.getElementById('play-pause').classList.remove('on');
      document.getElementById('play-pause').classList.add('off');
    }
    this.updatePlayer();
  }

  pause() {
    this.playing = false;
    this.updatePlayer();
  }

  next() {
    this.index += 1;
    if (this.index >= this.urls.length) {
      this.index = 0;
      this.url = this.urls[this.index];
    } else {
      this.url = this.urls[this.index];
    }
    this.playTrue();
  }

  share() {
    const el = document.getElementById('copier');
    if (this.shown) {
      el.classList.add('d-none');
      this.shown = false;
    } else {
      el.classList.remove('d-none');
      this.shown = true;
    }
  }

  copyShare() {
    this.navigator.clipboard.writeText(this.playUrl).then(() => {
      this.share();
      const el = document.getElementById('copyMessage');
      el.classList.remove('d-none');
      setTimeout(() => {
        el.classList.add('d-none');
      }, 1500);
    });
  }

  updatePlayer() {
    // look for the id of the song and then filter the song from the rest of the list.
    const { search } = window.location;
    const oneplayer = search.includes('oneplayer=true');
    // if it's not in one player mode, then just go on as normal.
    if (!oneplayer) {
      this.state.url = this.urls[this.index];
      console.log(this.url);
    } else if (this.first) {
      const id = search.match(/id=.+/g)[0].slice(3);
      this.state.url = this.urls.filter(song => song.id === id)[0];// eslint-disable-line prefer-destructuring
      console.log(this.url);
      this.first = false;
    }
    this.shouldComponentUpdate();
  }

  render() {
    console.log('render');
    return (
      <div className="container-fluid">
        <div id="player" className="mb-2 row justify-content-md-center">
          <section id="playSection" className="col-12 mt-2 mr-0 col-md-7" style={{ display: 'inline', textAlign: 'center' }}>
            {this.reactPlayer()}
          </section>
          <section className="col-12 row col-md-7 m-0 mt-2 d-none" id="copier">
            <div id="copyInput">
              <input id="copyUrl" disabled value={this.playUrl} style={{ backgroundColor: '#fff' }} className="" />
            </div>
            <div id="copyButton" onKeyPress={this.pressKey} role="presentation" onClick={this.copyShare} style={{ cursor: 'pointer' }}>
              <span id="inputGroup" style={{ fontSize: '0.8em' }}>Copy URL</span>
            </div>
          </section>
          <section id="copyMessage" className="col-12 col-md-7 d-none m-0">
            <span className="text-success" style={{ fontSize: '0.8em' }}>Url copied Url to clipboard</span>
          </section>
          <section className="col-12 col-md-7 mt-1" style={{ fontSize: '0.8em' }}>
            {this.state.url.title}
          </section>
          {this.buttons()}
        </div>
      </div>
    );
  }
}
MusicPlayer.defaultProps = {
  urls: [{ url: '' }],
  copy: [{ url: '' }],
};

MusicPlayer.propTypes = {
  urls: PropTypes.arrayOf(PropTypes.shape),
  copy: PropTypes.arrayOf(PropTypes.shape),
};

/* istanbul ignore next */
const mapStateToProps = state => ({ data: state });
export default connect(mapStateToProps)(MusicPlayer);
