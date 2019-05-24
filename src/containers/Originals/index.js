import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import MusicPlayer from '../../components/MusicPlayer';
import getSongs from '../songsActions';

export class Originals extends Component {
  constructor(props) {
    super(props);
    this.state = { songs: props.songs.songs };
    this.populateSongs = this.populateSongs.bind(this);
    this.setStateAsync = this.setStateAsync.bind(this);
  }

  componentWillMount() { return this.populateSongs(); }

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

  render() {
    const { songs } = this.state;
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
