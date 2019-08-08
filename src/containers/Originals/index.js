import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MusicPlayer from '../../components/MusicPlayer';
// import getSongs from './songsActions';
import mapStoreToProps from '../../redux/mapStoreToProps';

export class Originals extends Component {
  constructor(props) {
    super(props);
    this.state = {
      songs: props.songs.filter(song => song.category === 'originals'),
      pubState: 'off',
      missionState: 'off',
      allSongs: props.songs.songs,
    };
    // this.populateSongs = this.populateSongs.bind(this);
    this.setStateAsync = this.setStateAsync.bind(this);
    this.ToggleSongTypes = this.ToggleSongTypes.bind(this);
    this.setIndex = this.setIndex.bind(this);
  }

  componentWillMount() {
    // const { songs } = this.state;
    // if (songs.length < 2) return this.populateSongs();
    // return true;
  }

  componentDidMount() { document.title = 'Originals | Web Jam LLC'; }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  setIndex(songs, category) {
    let categorySongs = [];
    const otherSongs = [];
    for (let i = 0; songs.length > i; i += 1) {
      // eslint-disable-next-line security/detect-object-injection
      if (songs[i].category === category) {
        // eslint-disable-next-line security/detect-object-injection
        categorySongs.push(songs[i]);
      } else {
        // eslint-disable-next-line security/detect-object-injection
        otherSongs.push(songs[i]);
      }
    }

    categorySongs = categorySongs.concat(otherSongs);
    return categorySongs;
  }

  // async populateSongs() {
  //   // const { dispatch } = this.props;
  //   // await dispatch(getSongs());
  //   const { songs } = this.props;
  //   await this.setStateAsync({
  //     songs: songs.filter(song => song.category === 'originals'),
  //     allSongs: songs.songs,
  //   });
  //   return true;
  // }

  ToggleSongTypes(type) {
    return () => {
      let { songs } = this.state;
      const { allSongs } = this.state;
      const typeInState = `${type}State`;
      const typeState = this.state[typeInState.toString()]; // eslint-disable-line react/destructuring-assignment
      if (typeState === 'off') {
        songs = [...songs, ...allSongs.filter(song => song.category === type)];
      } else {
        songs = songs.filter(song => song.category !== type);
      }
      songs = this.setIndex(songs, type);
      console.log(songs);// eslint-disable-line no-console
      this.setState({ songs, [typeInState]: typeState === 'off' ? 'on' : 'off' });
    };
  }

  render() {
    const { songs, missionState, pubState } = this.state;
    const allSongs = this.props.songs.songs//eslint-disable-line
    return (
      <div id="pageContent" className="page-content">
        <div style={{ maxWidth: '5in', margin: 'auto', textAlign: 'center' }}>
          <h4
            style={{
              textAlign: 'center', margin: '20px', fontWeight: 'bold', marginBottom: '4px',
            }}
            id="headerTitle"
          >
            Original Songs
          </h4>
          {
            songs.length > 1
              ? (
                <div id="playerAndButtons">
                  <MusicPlayer filterBy="originals" />
                  <div id="mAndP" style={{ height: '22px', margin: 'auto' }}>
                    <button type="button" onClick={this.ToggleSongTypes('mission')} className={`mission ${missionState}`}> Mission </button>
                    <button type="button" onClick={this.ToggleSongTypes('pub')} className={`pub ${pubState}`}> Pub </button>
                  </div>
                </div>
              )
              : null
          }
        </div>
        <div style={{ minHeight: '2.4in' }}>&nbsp;</div>
      </div>
    );
  }
}

Originals.propTypes = {
  // dispatch: PropTypes.func,
  songs: PropTypes.arrayOf(PropTypes.shape({})),
};
/* istanbul ignore next */
Originals.defaultProps = { songs: [{ url: '' }] };

export default connect(mapStoreToProps)(Originals);
