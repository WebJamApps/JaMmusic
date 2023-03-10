import { useResizeDetector } from 'react-resize-detector';
import Inquiry from 'src/containers/Homepage/Inquiry';
import commonUtils from 'src/lib/utils';
import { useEffect } from 'react';
import WideAboutUs from './Widescreen/WideAbout';
import WideCurrentProjects from './Widescreen/WideCurrentProjects';
import NarrowAboutUs from './Narrowscreen/NarrowAbout';
import NarrowCurrentProjects from './Narrowscreen/NarrowCurrentProjects';
import FacebookFeed from './Narrowscreen/NarrowFacebookFeed';

export function WideOrNarrow({ width }: { width?: number }) {
  if (width && width >= 1004) {
    return (
      <div className="page-content wideHome">
        <div className="anchor"> </div>
        <WideAboutUs />
        <hr />
        <WideCurrentProjects />
        <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      </div>
    );
  }
  return (
    <div className="page-content narrowHome">
      <NarrowAboutUs />
      <hr />
      <NarrowCurrentProjects />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      <FacebookFeed />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      <Inquiry />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
    </div>
  );
}

export function Homepage(): JSX.Element {
  const { width, ref } = useResizeDetector();
  useEffect(() => commonUtils.setTitleAndScroll('', window.screen.width), []);
  return (
    <div ref={ref}>
      <WideOrNarrow width={width} />
    </div>
  );
}
