import React, { RefObject } from 'react';
import { withResizeDetector } from 'react-resize-detector';
import WideAboutUs from './Widescreen/WideAbout';
import WideCurrentProjects from './Widescreen/WideCurrentProjects';
import NarrowAboutUs from './Narrowscreen/NarrowAbout';
import NarrowCurrentProjects from './Narrowscreen/NarrowCurrentProjects';
import FacebookFeed from './Narrowscreen/NarrowFacebookFeed';
import Inquiry from '../../components/Inquiry';
import commonUtils from '../../lib/commonUtils';

interface HomepageProps {
  targetRef: RefObject<HTMLDivElement>;
  width: number;
  height: number;
}
export class Homepage extends React.Component<HomepageProps, unknown> {
  commonUtils: typeof commonUtils;

  constructor(props: HomepageProps) {
    super(props);
    this.commonUtils = commonUtils;
  }

  componentDidMount(): void { this.commonUtils.setTitleAndScroll('', window.screen.width); }

  render(): JSX.Element {
    const { width, targetRef } = this.props;
    return (
      <div ref={targetRef}>
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
      </div>
    );
  }
}

export default withResizeDetector(Homepage);
