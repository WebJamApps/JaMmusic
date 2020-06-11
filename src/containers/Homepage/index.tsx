import React, { Component } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import WideAboutUs from './Widescreen/WideAbout';
import WideCurrentProjects from './Widescreen/WideCurrentProjects';
import NarrowAboutUs from './Narrowscreen/NarrowAbout';
import NarrowCurrentProjects from './Narrowscreen/NarrowCurrentProjects';
import FacebookFeed from './Narrowscreen/NarrowFacebookFeed';
import Inquiry from '../../components/inquiry';
import commonUtils from '../../lib/commonUtils';

interface HomepageState { width: number }

export default class Home extends Component<any, HomepageState> {
  parentRef: any;

  commonUtils: any;

  constructor(props: any) {
    super(props);
    this.parentRef = React.createRef();
    this.onResize = this.onResize.bind(this);
    this.state = { width: 320 };
    this.commonUtils = commonUtils;
  }

  componentDidMount() { this.commonUtils.setTitleAndScroll('', window.screen.width); }

  onResize(width: number) {
    this.setState({ width });
  }

  render() {
    const { width } = this.state;
    return (
      <div>
        {width >= 1004
          ? (
            <div className="page-content">
              <div className="anchor"> </div>
              <WideAboutUs />
              <hr />
              <WideCurrentProjects />
              <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
            </div>
          )
          : (
            <div className="page-content">
              <NarrowAboutUs />
              <hr />
              <NarrowCurrentProjects />
              <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
              <FacebookFeed />
              <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
              <Inquiry />
              <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
            </div>
          )}
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} targetDomEl={this.parentRef.current} />
      </div>
    );
  }
}
