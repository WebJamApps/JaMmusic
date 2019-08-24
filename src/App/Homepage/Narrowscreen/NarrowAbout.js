import React from 'react';

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
        <a href="WebJamLLC_FactSheet.pdf" target="_blank">Fact Sheet</a>
          .
      </p>
      <h3>FAQs</h3>
      <div className="qAnda">
        <p>
          <span className="qAndaStyle">Q: </span>
            How can I contact you?
        </p>
        <p>
          <span className="qAndaStyle">A: </span>
            Send an email to Josh &amp; Maria Sherman
          <br />
          <a style={{ textDecoration: 'underline', fontSize: '18px' }} href="mailto:web.jam.adm@gmail.com">
            <strong>web.jam.adm@gmail.com</strong>
          </a>
          <br />
            or call&nbsp;
          <a href="tel:5404948035" style={{ textDecoration: 'underline', fontSize: '18px' }}>
            <strong>540-494-8035</strong>
          </a>
        </p>
        <br />
        <p>
          <span className="qAndaStyle">Q: </span>
            What does Web Jam LLC do?
        </p>

        <p>
          <span className="qAndaStyle">A: </span>
            We provide mobile-friendly web technologies and services.
        </p>
        <br />

        <p>
          <span className="qAndaStyle">Q: </span>
            What is your mission statement?
        </p>

        <p>
          <span className="qAndaStyle">A: </span>
            To assist small businesses by refactoring their existing
            websites to be mobile-friendly,
            providing new online services, empowering business owner, and training staff to use these new services
            effectively.
        </p>
      </div>
    </div>
  </div>
);

export default NarrowAboutUs;
