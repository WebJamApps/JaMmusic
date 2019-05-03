import React, { Component } from 'react';
import Jsb from './BuyMusic/joshShermanBand';
import Jss from './BuyMusic/joshShermanSolo';

export default class BuyMusic extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

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
