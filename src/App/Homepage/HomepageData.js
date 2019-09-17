import React from 'react';

const Faqs = () => (
  <div className="faqs">
    <h3>FAQs</h3>
    <div className="qAnda">
      <p>
        <span>Q: </span>
          How can I contact you?
      </p>
      <p>
        <span>A: </span>
          Send an email to Josh &amp; Maria Sherman
        <br />
        <a href="mailto:web.jam.adm@gmail.com">
          <strong>web.jam.adm@gmail.com</strong>
        </a>
        <br />
          or call&nbsp;
        <a href="tel:5404948035">
          <strong>540-494-8035</strong>
        </a>
      </p>
      <br />
      <p>
        <span>Q: </span>
          What does Web Jam LLC do?
      </p>

      <p>
        <span>A: </span>
          We provide mobile-friendly web technologies and services.
      </p>
      <br />

      <p>
        <span>Q: </span>
          What is your mission statement?
      </p>

      <p>
        <span>A: </span>
          To assist small businesses by refactoring their existing
          websites to be mobile-friendly,
          providing new online services, empowering business owner, and training staff to use these new services
          effectively.
      </p>
    </div>
  </div>
);

export default Faqs;
