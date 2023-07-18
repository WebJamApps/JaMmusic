import AppersonAutomotive from './AppersonAutomotive';
import CollegeLutheran from './CollegeLutheran';
import FacebookFeed from './FacebookFeed';
import { Inquiry } from './Inquiry';

function CurrentProjects(): JSX.Element {
  return (
    <div className="widescreenHomepage" style={{ maxWidth: '17in', margin: 'auto' }}>
      <div className="material-content">
        <div className="container">
          <h3 style={{ marginTop: 0, paddingTop: 0 }}>Our Current Projects</h3>
          <p className="spacer">&nbsp;</p>
          <div className="row">
            <div className="current-projects">
              <CollegeLutheran />
            </div>
            <div className="current-projects">
              <AppersonAutomotive />
            </div>
            <div className="current-projects">
              <FacebookFeed />
            </div>
            <div className="current-projects" style={{ margin: 'auto', marginTop: 0 }}><Inquiry /></div>
          </div>
          <p className="spacer">&nbsp;</p>
        </div>
      </div>
    </div>
  );
}

export default CurrentProjects;

