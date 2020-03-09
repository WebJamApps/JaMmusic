import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactResizeDetector from 'react-resize-detector';
import { connect } from 'react-redux';
import DefaultMusicPlayer from '../../components/MusicPlayer';
import mapStoreToProps from '../../redux/mapStoreToProps';
import commonUtils from '../../lib/commonUtils';

export class Originals extends Component {
  constructor(props) {
    super(props);
    this.parentRef = React.createRef();
    this.onResize = this.onResize.bind(this);
    this.state = { width: 320 };
    this.commonUtils = commonUtils;
  }

  componentDidMount() { const { width } = this.state; this.commonUtils.setTitleAndScroll('Originals', width); }

  onResize(width) {
    this.setState({ width });
  }

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
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} targetDomEl={this.parentRef.current} />
      </div>
    );
  }
}

Originals.propTypes = {
  songs: PropTypes.arrayOf(PropTypes.shape({})),
};

Originals.defaultProps = { songs: [{ url: '' }] };

export default connect(mapStoreToProps)(Originals);
