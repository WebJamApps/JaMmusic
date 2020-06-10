import React, { Component } from 'react';
import Jsb from './joshShermanBand';
import Jss from './joshShermanSolo';
import Jssp from './joshShermanSpotify';
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
      <div className="page-content" style={{ paddingRight: '15px' }}>
        <h3 style={{
          textAlign: 'center', margin: '20px', fontWeight: 'bold', fontSize: '16pt',
        }}
        >
          Buy Music
        </h3>
        <div className="row">
          <div className="col">
            <Jsb />
          </div>
          <p style={{ fontSize: '8pt' }}>{' '}</p>
          <div className="col">
            <Jss />
          </div>
        </div>
        <p style={{ fontSize: '24pt' }}>{' '}</p>
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <Jssp />
        </div>
      </div>
    );
  }
}
