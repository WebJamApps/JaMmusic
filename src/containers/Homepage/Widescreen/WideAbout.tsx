
import Faqs from '../HomepageData';

function WideAboutUs(): JSX.Element {
  const colStyle = {
    msFlex: '0 0 50%',
    flex: '0 0 50%',
    maxWidth: '50%',
    top: '0',
    paddingRight: '6px',
    paddingLeft: '10px',
  };
  return (
    <div className="widescreenHomepage">
      <div
        className="container-fluid"
        style={{
          maxWidth: '100%', margin: 'auto', paddingLeft: '15px', paddingRight: '15px',
        }}
      >
        <div
          className="row"
          style={{
            marginLeft: '-15px', marginRight: '-15px', display: 'flex', flexWrap: 'wrap',
          }}
        >
          {/* <div className="col-md-6" style={{ top: '0', paddingRight: '6px', paddingLeft: '10px' }}> */}
          <div className="col-md-6" style={colStyle}>

            <p style={{ marginTop: '32px', marginBottom: '40px', fontSize: '18px' }}>
              Web Jam LLC helps businesses bring their web technologies into the 21st century! Let us
              help make your website mobile-friendly and grow your business by utilizing the power of online services.
              More information is available in our&nbsp;
              <a
                href="https://www.dropbox.com/s/bzdqp3hr682y9sw/WebJamLLC_FactSheet.pdf?dl=0"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fact Sheet
              </a>
              .
            </p>
            <Faqs />
          </div>

          <div className="col-md-6 wideSlideshow" style={colStyle}>
            <div id="slideshow1">
              <img alt="Web Jam Banner Large" src="../static/imgs/banner1.jpg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WideAboutUs;
