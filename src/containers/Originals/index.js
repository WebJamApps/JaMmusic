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

  render() {
    const { songs } = this.props;
    return (
      <div id="pageContent" className="page-content">
        <div style={{ maxWidth: '5in', margin: 'auto', textAlign: 'center' }}>
          {
            songs !== null && songs.length > 1
              ? (
                <div id="playerAndButtons">
                  <DefaultMusicPlayer filterBy="originals" />
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
