import React, { Component } from 'react';
import Jsb from './joshShermanBand';
import Jss from './joshShermanSolo';
import Jssp from './joshShermanSpotify';
import Jsyt from './joshShermanYoutube';
import commonUtils from '../../lib/commonUtils';

export default class BuyMusic extends Component {
  commonUtils: { setTitleAndScroll: (pageTitle: string, width: number) => void };

  constructor(props: Record<string, unknown>) {
    super(props);
    this.commonUtils = commonUtils;
  }

  componentDidMount(): void { this.commonUtils.setTitleAndScroll('Buy Music', window.screen.width); }

  render(): JSX.Element {
    return (
      <div className="page-content"
        style={{
          paddingRight: '15px', maxWidth: '800px', margin: 'auto', borderRight: 'none',
        }}
      >
        <h3 style={{
          textAlign: 'center', margin: '20px', fontWeight: 'bold', fontSize: '16pt', marginBottom: '10px',
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
        <div style={{ textAlign:'center' }}>
          <Jsyt />
        </div> 
      </div>
    );
  }
}
