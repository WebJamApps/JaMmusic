import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import DefaultMusicPlayer from '../../components/MusicPlayer';
import mapStoreToProps from '../../redux/mapStoreToProps';
import commonUtils from '../../lib/commonUtils';

export class Originals extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.commonUtils = commonUtils;
  }

  componentDidMount() { this.commonUtils.setTitleAndScroll('Originals'); }

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
      </div>
    );
  }
}

Originals.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.shape({})),
};

Originals.defaultProps = { songs: [{ url: '' }] };

export default connect(mapStoreToProps)(Originals);
