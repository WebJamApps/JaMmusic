import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MusicPlayer from '../../components/MusicPlayer';
import getSongs from '../songsActions';

export class Originals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      songs: [{ url: '' }],
      // copy: [{ url: '' }],
    };
    this.populateSongs = this.populateSongs.bind(this);
    // /this.sleep = this.sleep.bind(this);
    // this.fixLocalUtube();
    // this.urls = songData.songs.filter(song => song.category === 'originals');
    // this.copy = Array.from(songData.songs.filter(song => song.category === 'originals'));
    // this.populateSongs();
  }

  async componentWillMount() {
    await this.populateSongs();
  }

  componentDidMount() {
    // const { dispatch } = this.props;
    document.title = 'Original Songs | Web Jam LLC';
    // const { songs } = this.state;
    // if (songs.length === 1) return this.populateSongs();
    // return this.shouldComponentUpdate();
    // await dispatch(getSongs());
    // const { songs } = this.props;
    // this.setState({
    //   songs: songs.songs.filter(song => song.category === 'originals'),
    //   copy: Array.from(songs.songs.filter(song => song.category === 'originals')),
    // });
    // console.log(this.state);
    // return this.shouldComponentUpdate();
    // this.setState({
    //   urls: this.urls,
    //   copy: this.copy,
    // });
    // this.fixLocalUtube();
  }

  // shouldComponentUpdate() {
  //   // console.log('shouldComponentUpdate');
  //   return true;
  // }

  async populateSongs() {
    const { dispatch } = this.props;
    await dispatch(getSongs());
    const { songs } = this.props;
    this.setState({
      songs: songs.songs.filter(song => song.category === 'originals'),
      // copy: Array.from(songs.songs.filter(song => song.category === 'originals')),
    });
    // const stateSongs = this.state.songs;// eslint-disable-line react/destructuring-assignment
    // console.log(stateSongs);// eslint-disable-line no-console
    // await this.sleep(2000);
    return Promise.resolve(true);
  }

  // sleep(ms) { // eslint-disable-line class-methods-use-this
  //   console.log('sleep');// eslint-disable-line no-console
  //   return new Promise((resolve) => {
  //     setTimeout(resolve(true), ms);
  //   });
  // }

  // fixLocalUtube() {
  //   const { urls } = this.state;
  //   for (let i = 0; i < urls.length; i += 1) { // eslint-disable-next-line security/detect-object-injection
  //     if (urls[i].url.includes('https://www.youtube')) urls[i].url = urls[i].url.replace('https:', 'http:');
  //   }
  //   console.log(urls);// eslint-disable-line no-console
  //   this.setState({ urls, copy: urls });
  // }

  render() {
    // this.fixLocalUtube();
    const { songs } = this.state;
    // console.log(songs);// eslint-disable-line no-console
    // const originalSongs = songs.songs.filter(song => song.category === 'originals');
    // if (songs.length === 1) return this.populateSongs();
    //   return this
    // console.log(this.copy);
    return (
      <div className="page-content">
        <div style={{ maxWidth: '4in', margin: 'auto', textAlign: 'center' }}>
          <h4 style={{
            textAlign: 'center', margin: '20px', fontWeight: 'bold', marginBottom: '0',
          }}
          >
Original Songs
          </h4>
          {songs.length > 1 ? <MusicPlayer songs={songs} copy={songs} /> : null}
        </div>
        <div style={{ minHeight: '.5in' }}>&nbsp;</div>
      </div>
    );
    // }
  }
}
Originals.propTypes = {
  dispatch: PropTypes.func,
  songs: PropTypes.shape({}),
};
/* istanbul ignore next */
Originals.defaultProps = { dispatch: () => {}, songs: { songs: [{ url: '' }] } };
/* istanbul ignore next */
const mapStoreToProps = store => ({ songs: store.songs });
export default connect(mapStoreToProps)(Originals);
