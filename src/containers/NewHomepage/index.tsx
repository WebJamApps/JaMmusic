import commonUtils from 'src/lib/utils';
import { useEffect } from 'react';
import AboutUs from './About';
import CurrentProjects from './CurrentProjects';

export function About() {
  return (
    <div className="page-content wideHome">
      <div className="anchor"> </div>
      <AboutUs />
      <hr />
      <br />
      <br />
      <CurrentProjects />
      <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
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
