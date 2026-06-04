import commonUtils from 'src/lib/utils';
import { useEffect } from 'react';
import AboutUs from './About';
import CurrentProjects from './CurrentProjects';
import FacebookFeed from './FacebookFeed';

export function About() {
  return (
    <div className="page-content wideHome">
      <div className="anchor"> </div>
      <AboutUs />
      <hr />
      <br />
      <br />
      <CurrentProjects />
      <h3 style={{ textAlign: 'center' }}>Find Us on Facebook</h3>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <FacebookFeed />
      </div>
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
    </div>
  );
}

export function Homepage() {
  useEffect(() => commonUtils.setTitleAndScroll('', window.screen.width), []);
  return (
    <div>
      <About />
    </div>
  );
}
