import commonUtils from 'src/lib/utils';
import { useEffect } from 'react';
// import { Inquiry } from './Inquiry';
import AboutUs from './About';
import CurrentProjects from './CurrentProjects';
// import FacebookFeed from './FacebookFeed';

export function About() {
  return (
    <div className="page-content wideHome">
      <div className="anchor"> </div>
      <AboutUs />
      <hr />
      <CurrentProjects />
      {/* <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p> */}
      {/* <FacebookFeed />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
      <Inquiry />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p> */}
    </div>
  );
}

export function NewHomepage(): JSX.Element {
  useEffect(() => commonUtils.setTitleAndScroll('', window.screen.width), []);
  return (
    <div>
      <About />
    </div>
  );
}
