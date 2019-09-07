import React from 'react';

const Faqs = () => (
  <div className="faqs">
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
);

export default Faqs;
