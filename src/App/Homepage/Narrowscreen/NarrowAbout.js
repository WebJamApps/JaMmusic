import React from 'react';
import Faqs from '../HomepageData';

const NarrowAboutUs = () => (
  <div className="notWidescreen" style={{ marginTop: '1px' }}>
    <div id="slideshow">
      <img alt="Web Jam Banner" src="../static/imgs/banner1.jpg" />
    </div>
    <div style={{ padding: '10px', marginBottom: '-20px' }}>
      <p style={{ marginTop: '-5px', marginBottom: '40px', fontSize: '18px' }}>
          Web Jam LLC helps businesses bring their web technologies into the 21st century! Let us
          help make your website mobile-friendly and grow your business by utilizing the power of online services.
          More information is available in our&nbsp;
        <a href="https://www.dropbox.com/s/bzdqp3hr682y9sw/WebJamLLC_FactSheet.pdf?dl=0" target="_blank" rel="noopener noreferrer">Fact Sheet</a>
          .
      </p>
      <Faqs />
    </div>
  </div>
);

export default NarrowAboutUs;
