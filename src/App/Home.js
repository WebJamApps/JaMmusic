/* eslint-disable consistent-return */
import React, { Component } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import WideAboutUs from './Homepage/Widescreen/WideAbout';
import WideCurrentProjects from './Homepage/Widescreen/WideCurrentProjects';
import WideFacebookFeed from './Homepage/Widescreen/WideFacebookFeed';
import NarrowAboutUs from './Homepage/Narrowscreen/NarrowAbout';
import NarrowCurrentProjects from './Homepage/Narrowscreen/NarrowCurrentProjects';
import FacebookFeed from './Homepage/Narrowscreen/NarrowFacebookFeed';

// eslint-disable-next-line react/prefer-stateless-function
export default class Home extends Component {
  constructor(props) {
    super(props);
    this.parentRef = React.createRef();
    this.onResize = this.onResize.bind(this);
    this.state = { width: 100 };
  }

  onResize(width) {
    this.setState({ width });
  }

  render() {
    const { width } = this.state;
    return (
    // Add link-to-top for accessibility
      <div>
        {width >= 1004
          ? (
            <div className="page-content">
              <WideAboutUs />
              <hr />
              <WideCurrentProjects />
              <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
              <WideFacebookFeed />
            </div>
          )
          : (
            <div className="page-content">
              <NarrowAboutUs />
              <hr />
              <NarrowCurrentProjects />
              <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
              <FacebookFeed />
            </div>
          )}
        {/* <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
        <div className="widescreenHomepage">
          <WideFacebookFeed />
        </div>
        <div className="notWidescreen">
          <FacebookFeed />
        </div> */}
        <ReactResizeDetector handleWidth handleHeight onResize={this.onResize} targetDomEl={this.parentRef.current} />
      </div>
    );
  }
}
