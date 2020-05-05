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
        <h3 style={{ textAlign: 'center', margin: '20px', fontWeight: 'bold' }}>Buy Music</h3>
        <p>&nbsp;</p>
        <Jsb />
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <Jss />
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
}
