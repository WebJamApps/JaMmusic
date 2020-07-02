import React, { Component } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player';
import { FacebookShareButton, FacebookIcon } from 'react-share';
import musicPlayerUtils, { MusicPlayerUtils } from './musicPlayerUtils';
import mapStoreToProps, { Song } from '../../redux/mapStoreToProps';
import musicUtils from './musicUtils';
import commonUtils from '../../lib/commonUtils';

export interface MusicPlayerState {
  missionState: string;
  pageTitle: string;
  pubState: string;
  originalState: string;
  songsState: Song[];
  index: number;
  song: Song|null;
  copy?: string[];
  player: { playing: boolean; shown: boolean; isShuffleOn: boolean; displayCopier: string; displayCopyMessage: boolean; onePlayerMode: boolean };
}

interface MProps {
  songs?: Song[];
  filterBy?: string;
}

export class MusicPlayer extends Component<MProps, MusicPlayerState> {
  navigator: Navigator;

  musicUtils: {
    pageH4: (pageTitle: string) => JSX.Element; setIndex: (songs: Song[], category: string) => Song[];
    textUnderPlayer: (song: string) => JSX.Element; copyRight: () => JSX.Element;
    setPlayerStyle: (playerStyle: Song) => Record<string, unknown>;
  };

  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  musicPlayerUtils: MusicPlayerUtils;

  // static defaultProps: { songs: { url: string; title: string }[] };

  constructor(props: MProps) {
    super(props);
    this.state = {
      pageTitle: 'Original Songs',
      songsState: [],
      song: null,
      index: 0,
      missionState: 'off',
      pubState: 'off',
      originalState: 'on',
      player: {
        playing: false, shown: false, isShuffleOn: false, displayCopier: 'none', displayCopyMessage: false, onePlayerMode: false,
      },
    };
    this.play = this.play.bind(this);
    this.playEnd = this.playEnd.bind(this);
    this.pause = this.pause.bind(this);
    this.shuffle = this.shuffle.bind(this);
    this.next = this.next.bind(this);
    this.prev = this.prev.bind(this);
    this.buttons = this.buttons.bind(this);
    this.setClassOverlay = this.setClassOverlay.bind(this);
    this.playUrl = this.playUrl.bind(this);
    this.navigator = window.navigator;
    this.musicPlayerUtils = musicPlayerUtils;
    this.musicUtils = musicUtils;
    this.commonUtils = commonUtils;
  }

  async componentDidMount(): Promise<boolean> {
    const params = new URLSearchParams(window.location.search);
    const { player } = this.state;
    const { songs, filterBy } = this.props;
    this.commonUtils.setTitleAndScroll('', window.screen.width);
    const newSongs = songs.filter((song: { category?: string }) => song.category === filterBy);
    this.setState({ song: newSongs[0], songsState: newSongs });
    await this.musicPlayerUtils.checkOnePlayer(params, player, this);
    return this.musicPlayerUtils.runIfOnePlayer(this);
  }

  setClassOverlay(): string {
    const { song, player } = this.state;
    let classOverlay = 'mainPlayer';
    if (player.playing === false) {
      if (song !== null && song !== undefined && song.url[8] === 's') classOverlay = 'soundcloudOverlay';
      if (song !== null && song !== undefined && song.url[12] === 'y') classOverlay = 'youtubeOverlay';
    }
    return classOverlay;
  }

  playUrl(): string | null {
    const { song } = this.state;
    if (song && song._id) return `https://web-jam.com/music/songs?oneplayer=true&id=${song._id}`;
    return null;
  }

  reactPlayer(): JSX.Element {
    const { song } = this.state;
    const { player } = this.state;
    return (
      <ReactPlayer
        style={this.musicUtils.setPlayerStyle(song as Song)}
        url={song.url}
        playing={player.playing}
        controls
        onEnded={this.next}
        width="100%"
        height="40vh"
        id="mainPlayer"
        className="audio"
        config={{ youtube: { playerVars: { controls: 0 } }, file: { attributes: { controlsList: 'nodownload' } } }}
      />
    );
  }

  lineTwoButtons(): JSX.Element {
    const {
      missionState, pubState, originalState, player: { onePlayerMode },
    } = this.state;
    return (
      <div id="mAndP" style={{ height: '22px', margin: 'auto' }}>
        <button type="button" onClick={() => this.musicPlayerUtils.toggleSongTypes('Original', this)} className={`original${originalState}`}>
          Original
        </button>
        <button type="button" onClick={() => this.musicPlayerUtils.toggleSongTypes('Mission', this)} className={`mission${missionState}`}>
          Mission
        </button>
        <button type="button" onClick={() => this.musicPlayerUtils.toggleSongTypes('Pub', this)} className={`pub${pubState}`}>
          Pub
        </button>
        {onePlayerMode ? this.musicPlayerUtils.homeButton(onePlayerMode) : null}
      </div>
    );
  }

  lineThreeButtons(url: string): JSX.Element {
    let { song } = this.state, composer = '', quote = '';
    if (!song) {
      song = {
        title: '', artist: '', composer: '', category: '', album: '', year: 0, url: '', _id: '', image: '',
      };
    }
    if (song.composer !== undefined && !song.composer.includes('Josh')) composer = ` by ${song.composer}`;
    quote = `Click the graphic below to hear ${song.artist} performing the song, "${song.title}"${composer}`;
    if (song.category === 'original') quote = quote.replace('performing the song', 'performing their song');
    return (
      <div id="share-buttons" style={{ display: 'inline-block', marginTop: '3px' }}>
        <button type="button" id="share-button" role="menu" onClick={() => this.musicPlayerUtils.share(this)}>Share</button>
        <FacebookShareButton
          resetButtonStyle={false}
          style={{
            backgroundColor: 'white', marginLeft: 0, paddingLeft: '5px', marginBottom: 0,
          }}
          url={url}
          quote={quote}
          hashtag="#JoshAndMariaMusic"
        >
          <FacebookIcon round size={26} />
        </FacebookShareButton>
      </div>
    );
  }

  buttons(): JSX.Element {
    const { player: { playing, isShuffleOn } } = this.state;
    const url = this.playUrl();
    return (
      <section className="mt-0 col-12 col-md-10" style={{ marginTop: '4px', paddingTop: 0 }}>
        <div id="play-buttons">
          <button type="button" id="play-pause" role="menu" className={playing ? 'on' : 'off'} onClick={this.play}>Play/Pause</button>
          <button type="button" role="menu" id="next" onClick={this.next}>Next</button>
          <button type="button" role="menu" id="prev" onClick={this.prev}>Prev</button>
          <button type="button" id="shuffle" role="menu" className={isShuffleOn ? 'on' : 'off'} onClick={this.shuffle}>Shuffle</button>
        </div>
        {this.lineTwoButtons()}
        {this.lineThreeButtons(url)}
      </section>
    );
  }

  shuffle(): void {
    const {
      player, songsState, missionState, pubState,
    } = this.state;
    if (player.isShuffleOn) {
      let reset = songsState;
      if (missionState === 'on') reset = this.musicUtils.setIndex(reset, 'mission');
      if (pubState === 'on') reset = this.musicUtils.setIndex(reset, 'pub');
      this.setState({
        songsState: reset, player: { ...player, isShuffleOn: false }, song: reset[0], index: 0,
      });
    } else {
      const shuffled = this.musicPlayerUtils.shuffleThem(songsState);
      this.setState({
        songsState: shuffled, player: { ...player, isShuffleOn: true }, song: shuffled[0], index: 0,
      });
    }
  }

  playEnd(): void { this.next(); }

  prev(): void {
    const { index, songsState } = this.state;
    const minusIndex = index - 1;
    if (minusIndex < 0 || minusIndex > songsState.length) {
      const newIndex = songsState.length - 1;
      this.setState({ index: newIndex, song: songsState[newIndex] });// eslint-disable-line security/detect-object-injection
    } else this.setState({ song: songsState[minusIndex], index: minusIndex });// eslint-disable-line security/detect-object-injection
  }

  play(): void {
    const { player } = this.state;
    const isPlaying = !player.playing;
    this.setState({ player: { ...player, playing: isPlaying } });
  }

  pause(): void {
    const { player } = this.state;
    this.setState({ player: { ...player, playing: false } });
  }

  next(): void {
    let { index } = this.state;
    index += 1;
    const { songsState } = this.state;
    if (index >= songsState.length) this.setState({ index: 0, song: songsState[0] });
    else this.setState({ song: songsState[index], index });// eslint-disable-line security/detect-object-injection
  }

  copyInput(player: MusicPlayerState['player'], song: Song): JSX.Element {
    return (
      <div id="copyInput" style={{ marginTop: '-20px', marginBottom: '40px' }}>
        {player.displayCopyMessage && <div className="copySuccess"> Url copied Url to clipboard </div>}
        {song !== null ? <input id="copyUrl" disabled value={this.playUrl()} style={{ backgroundColor: '#fff' }} className="form-control" />
          : null}
        <div
          id="copyButton"
          role="presentation"
          onClick={() => this.musicPlayerUtils.copyShare(this)}
        >
          <span className="copy-url">
            Copy URL
          </span>
        </div>
      </div>
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
          <section id="playSection" className="col-12 mt-2 mr-0 col-md-7">
            <div className={classOverlay} />
            {song !== null && song !== undefined && song.url !== undefined ? this.reactPlayer() : null}
          </section>
          {song ? this.musicUtils.textUnderPlayer(song as unknown as string) : null}
          {this.buttons()}
          <section className="mt-1 col-12" id="copier" style={{ display: player.displayCopier, marginTop: '0' }}>
            {this.copyInput(player, song)}
          </section>
        </div>
      </div>
    );
  }
}

export default connect(mapStoreToProps)(MusicPlayer);
