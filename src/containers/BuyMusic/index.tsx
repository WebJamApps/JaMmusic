import React, { Component } from 'react';
import Jsb from './BuyLinks/joshShermanBand';
import Jss from './BuyLinks/joshShermanSolo';
import Jsyt from './MediaLinks/joshShermanYoutube';
import Jssp from './MediaLinks/joshShermanSpotify';
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
          Buy from CD Baby
        </h3>
        <div className="row top-row-style">
          <div className="col">
            <Jsb />
          </div>
          <p style={{ fontSize: '8pt' }}>{' '}</p>
          <div className="col">
            <Jss />
          </div>
        </div>
        <p style={{ fontSize: '24pt' }}>{' '}</p>
        <div style={{ textAlign:'center' }}>
          <Jsyt />
        </div>
        <div style={{ margin: 'auto', textAlign: 'center' }}>
          <Jssp />
        </div>
      </div>
    );
  }
}
