import React, { Component } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import Jsb from './joshShermanBand';
import Jss from './joshShermanSolo';
import commonUtils from '../../lib/commonUtils';

export default class BuyMusic extends Component {
  constructor(props) {
    super(props);
    this.parentRef = React.createRef();
    this.onResize = this.onResize.bind(this);
    this.state = { width: 320 };
    this.commonUtils = commonUtils;
  }

  componentDidMount() { const { width } = this.state; this.commonUtils.setTitleAndScroll('Buy Music', width); }

  onResize(width) {
    this.setState({ width });
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
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} targetDomEl={this.parentRef.current} />
      </div>
    );
  }
}
