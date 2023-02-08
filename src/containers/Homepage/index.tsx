import { useResizeDetector } from 'react-resize-detector';
import Inquiry from 'src/components/Inquiry';
import commonUtils from 'src/lib/commonUtils';
import { useEffect } from 'react';
import WideAboutUs from './Widescreen/WideAbout';
import WideCurrentProjects from './Widescreen/WideCurrentProjects';
import NarrowAboutUs from './Narrowscreen/NarrowAbout';
import NarrowCurrentProjects from './Narrowscreen/NarrowCurrentProjects';
import FacebookFeed from './Narrowscreen/NarrowFacebookFeed';

export function Homepage(): JSX.Element {
  const { width, ref } = useResizeDetector();
  useEffect(() => commonUtils.setTitleAndScroll('', window.screen.width), []);
  return (
    <div ref={ref}>
      {width && width >= 1004
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

// export default withResizeDetector(Homepage);
