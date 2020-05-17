import React, { Component } from 'react';
import { connect } from 'react-redux';
import DefaultMusicPlayer from '../../components/MusicPlayer';
import mapStoreToProps from '../../redux/mapStoreToProps';
import commonUtils from '../../lib/commonUtils';

type oProps = {
  songs: {url: string}[];};
export class Songs extends Component<oProps> {
  o: any;

  commonUtils: any;

  static defaultProps = { songs: [{ url: '' }] };

  constructor(props: any) {
    super(props);
    this.o = React.createRef();
    this.commonUtils = commonUtils;
  }

  componentDidMount() { this.commonUtils.setTitleAndScroll('Songs', window.screen.width); }

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
export default connect(mapStoreToProps)(Songs);
