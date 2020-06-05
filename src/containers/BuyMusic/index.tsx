import React, { Component } from 'react';
import Jsb from './joshShermanBand';
import Jss from './joshShermanSolo';
import commonUtils from '../../lib/commonUtils';

export default class BuyMusic extends Component {
  commonUtils: any;

  constructor(props: any) {
    super(props);
    this.commonUtils = commonUtils;
  }

  componentDidMount() { this.commonUtils.setTitleAndScroll('Buy Music', window.screen.width); }

  render() {
    return (
      <div className="page-content">
        <h3 style={{
          textAlign: 'center', margin: '20px', fontWeight: 'bold', fontSize: '16pt',
        }}
        >
          Buy Music
        </h3>
        <Jsb />
        <p style={{ fontSize: '8pt' }}>{' '}</p>
        <Jss />
        <p style={{ fontSize: '24pt' }}>{' '}</p>
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <h5>Also On Spotify</h5>
          <iframe
            src="https://open.spotify.com/embed/artist/4XGcA7sSHYypVflLH48KCx"
            width="320"
            height="500"
            title="soloAcoustic"
          />
          <p style={{ fontSize: '1pt' }}>{' '}</p>
          <iframe
            src="https://open.spotify.com/embed/artist/5IvBs06z4RksIE1WvqLULs"
            width="320"
            height="500"
            title="soloAcoustic"
          />
        </div>
      </div>
    );
  }
}
