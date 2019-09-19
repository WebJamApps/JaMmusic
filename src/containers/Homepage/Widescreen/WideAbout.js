import React from 'react';
import Faqs from '../HomepageData';

const WideAboutUs = () => (
  <div className="widescreenHomepage">
    <div className="container-fluid">
      <div className="row">
        <div className="col-md-6" style={{ top: '0', paddingRight: '6px' }}>
          <p style={{ marginTop: '45px', marginBottom: '40px', fontSize: '18px' }}>
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

        <div className="col-md-6" style={{ padding: '1px', paddingRight: '0' }}>
          <div id="slideshow1">
            <img alt="Web Jam Banner Large" src="../static/imgs/banner1.jpg" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default WideAboutUs;
