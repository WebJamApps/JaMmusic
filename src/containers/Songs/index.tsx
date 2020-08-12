import React, { Component, RefObject } from 'react';
import { connect } from 'react-redux';
import DefaultMusicPlayer from '../../components/MusicPlayer';
import mapStoreToProps, { Song } from '../../redux/mapStoreToProps';
import commonUtils from '../../lib/commonUtils';

type SProps = {
  songs: Song[];
};
export class Songs extends Component<SProps> {
  o: RefObject<unknown>;

  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  constructor(props: SProps) {
    super(props);
    this.o = React.createRef();
    this.commonUtils = commonUtils;
  }

  componentDidMount(): void { this.commonUtils.setTitleAndScroll('Songs', window.screen.width); }

  render(): JSX.Element {
    const { songs } = this.props;
    return (
      <div id="pageContent" className="page-content">
        <div style={{ maxWidth: '5in', margin: 'auto', textAlign: 'center' }}>
          {
            songs !== null && songs.length > 1
              ? (
                <div id="playerAndButtons">
                  <DefaultMusicPlayer filterBy="original" />
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
