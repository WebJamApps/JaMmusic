
import CollegeLutheran from '../CollegeLutheran';
import AppersonAutomotive from '../AppersonAutomotive';
import WideFacebookFeed from './WideFacebookFeed';
import { Inquiry } from '../Inquiry';

function WideCurrentProjects(): JSX.Element {
  return (
    <div className="widescreenHomepage" style={{ maxWidth: '17in', margin: 'auto' }}>
      <div className="material-content">
        <div
          className="container"
          style={{
            width: '100%', margin: 'auto', paddingRight: '15px', paddingLeft: '15px',
          }}
        >
          <h3 style={{ marginTop: 0, paddingTop: 0 }}>Our Current Projects</h3>
          <p className="spacer">&nbsp;</p>
          <div
            className="row"
            style={{
              marginLeft: '-15px', marginRight: '-15px', display: 'flex', flexWrap: 'wrap',
            }}
          >
            <div className="col">
              <CollegeLutheran />
            </div>
            <div className="col">
              <AppersonAutomotive />
            </div>
            <div className="col">
              <WideFacebookFeed />
            </div>
            <div className="col" style={{ margin: 'auto', marginTop: 0 }}><Inquiry /></div>
          </div>
          <p className="spacer">&nbsp;</p>
        </div>
      </div>
    </div>
  );
}

export default WideCurrentProjects;
