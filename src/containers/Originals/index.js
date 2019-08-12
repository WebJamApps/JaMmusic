import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DefaultMusicPlayer from '../../components/MusicPlayer';
import mapStoreToProps from '../../redux/mapStoreToProps';

export class Originals extends Component {
  constructor(props) {
    super(props);
    this.state = {};// eslint-disable-line react/state-in-constructor
  }

  componentDidMount() { document.title = 'Originals | Web Jam LLC'; }

  // // eslint-disable-next-line class-methods-use-this
  // setIndex(songs, category) {
  //   let categorySongs = [];
  //   const otherSongs = [];
  //   for (let i = 0; songs.length > i; i += 1) {
  //     // eslint-disable-next-line security/detect-object-injection
  //     if (songs[i].category === category) {
  //       // eslint-disable-next-line security/detect-object-injection
  //       categorySongs.push(songs[i]);
  //     } else {
  //       // eslint-disable-next-line security/detect-object-injection
  //       otherSongs.push(songs[i]);
  //     }
  //   }
  //
  //   categorySongs = categorySongs.concat(otherSongs);
  //   return categorySongs;
  // }

  // ToggleSongTypes(type) {
  //   return () => {
  //     let { songs } = this.state;
  //     const { allSongs } = this.state;
  //     const typeInState = `${type}State`;
  //     const typeState = this.state[typeInState.toString()]; // eslint-disable-line react/destructuring-assignment
  //     if (typeState === 'off') {
  //       songs = [...songs, ...allSongs.filter(song => song.category === type)];
  //     } else {
  //       songs = songs.filter(song => song.category !== type);
  //     }
  //     songs = this.setIndex(songs, type);
  //     this.setState({ songs, [typeInState]: typeState === 'off' ? 'on' : 'off' });
  //   };
  // }

  render() {
    const { songs } = this.props;
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
            songs !== null && songs.length > 1
              ? (
                <div id="playerAndButtons">
                  <DefaultMusicPlayer filterBy="originals" />
                  {/* <div id="mAndP" style={{ height: '22px', margin: 'auto' }}>
                    <button type="button" onClick={this.ToggleSongTypes('mission')} className={`mission ${missionState}`}> Mission </button>
                    <button type="button" onClick={this.ToggleSongTypes('pub')} className={`pub ${pubState}`}> Pub </button>
                  </div> */}
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
  songs: PropTypes.arrayOf(PropTypes.shape({})),
};

Originals.defaultProps = { songs: [{ url: '' }] };

export default connect(mapStoreToProps)(Originals);
