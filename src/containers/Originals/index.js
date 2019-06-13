import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MusicPlayer from '../../components/MusicPlayer';
import getSongs from '../songsActions';

export class Originals extends Component {
  constructor(props) {
    super(props);
    this.allSongs = props.songs.songs;
    this.state = { songs: props.songs.songs.filter(song => song.category === 'originals'), pubState: 'off', missionState: 'off' };
    this.populateSongs = this.populateSongs.bind(this);
    this.setStateAsync = this.setStateAsync.bind(this);
    this.ToggleSongTypes = this.ToggleSongTypes.bind(this);
  }

  componentWillMount() {
    const { songs } = this.state;
    if (songs.length < 2) return this.populateSongs();
    return true;
  }

  componentDidMount() { document.title = 'Original Songs | Web Jam LLC'; }

  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  async populateSongs() {
    const { dispatch } = this.props;
    await dispatch(getSongs());
    const { songs } = this.props;
    await this.setStateAsync({
      songs: songs.songs.filter(song => song.category === 'originals'),
    });
    return true;
  }

  ToggleSongTypes(type) {
    return () => {
      let { songs } = this.state;
      const typeInState = `${type}State`;
      const typeState = this.state[typeInState.toString()]; // eslint-disable-line react/destructuring-assignment

      if (typeState === 'off') {
        songs = [...songs, ...this.allSongs.filter(song => song.category === type)];
      } else {
        songs = songs.filter(song => song.category !== type);
      }

      this.setState({ songs, [typeInState]: typeState === 'off' ? 'on' : 'off' });
    };
  }

  render() {
    const { songs, missionState, pubState } = this.state;
    return (
      <div id="pageContent" className="page-content">
        <div style={{ maxWidth: '5in', margin: 'auto', textAlign: 'center' }}>
          <h4
            style={{
              textAlign: 'center', margin: '20px', fontWeight: 'bold', marginBottom: '0',
            }}
            id="headerTitle"
          >
            Original Songs
          </h4>
          {
            songs.length > 1
              ? (
                <div id="playerAndButtons">
                  <MusicPlayer songs={songs} copy={songs} />
                  <button type="submit" onClick={this.ToggleSongTypes('mission')} className={`mission ${missionState}`}> Mission </button>
                  <button type="submit" onClick={this.ToggleSongTypes('pub')} className={`pub ${pubState}`}> Pub </button>
                </div>
              )
              : null
          }
        </div>
        <div style={{ minHeight: '.5in' }}>&nbsp;</div>
      </div>
    );
  }
}

Originals.propTypes = {
  dispatch: PropTypes.func,
  songs: PropTypes.shape({ songs: PropTypes.arrayOf(PropTypes.shape({})) }),
};
/* istanbul ignore next */
Originals.defaultProps = { dispatch: () => {}, songs: { songs: [{ url: '' }] } };
/* istanbul ignore next */
const mapStoreToProps = store => ({ songs: store.songs });
export default connect(mapStoreToProps)(Originals);
