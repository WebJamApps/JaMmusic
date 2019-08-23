import React, { Component } from 'react';

// eslint-disable-next-line react/prefer-stateless-function
export default class Home extends Component {
  render() {
    return (
      // Add link-to-top for accessibility
      <div>
        <div className="page-content">
          <div className="widescreenHomepage">
            <div className="container-fluid">
              <div className="row">
                <div className="col-md-6" style={{ top: '0', paddingRight: '6px' }}>
                  <p style={{ marginTop: '45px', marginBottom: '40px', fontSize: '18px' }}>
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

                <div className="col-md-6" style={{ padding: '1px', paddingRight: '0' }}>
                  <div id="slideshow1">
                    <img alt="Web Jam Banner Large" src="../static/imgs/banner1.jpg" />
                  </div>
                </div>
              </div>
            </div>
          </div>
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
          <hr />
          <div className="widescreenHomepage">
            <div className="material-content">
              <div className="container">
                <h3 style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>Our Current Projects</h3>
                <div className="row">
                  <div className="col">
                    <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
                      <h4 style={{ textAlign: 'center' }}><strong>College Lutheran Church</strong></h4>
                      <div style={{ textAlign: 'center' }}>
                        <img
                          alt="College Lutheran Church Homepage"
                          style={{ width: '260px' }}
                          src="https://dl.dropboxusercontent.com/s/354maifx0dkzt9s/Screenshot%20from%202019-02-22%2016-01-50.png?dl=0"
                        />
                        <br />
                        <a
                          href="https://www.collegelutheran.org"
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ textDecoration: 'underline', textAlign: 'center' }}
                        >
                      Collegeluthean.org
                        </a>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
                  <div className="col">
                    <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
                      <h4 style={{ textAlign: 'center' }}><strong>Apperson Automotive</strong></h4>
                      <div style={{ textAlign: 'center' }}>
                        <img
                          alt="Apperson Automotive Home Page"
                          style={{ width: '260px', height: '328px' }}
                          src="../static/imgs/AppersonAutomotive.png"
                        />
                        <br />
                        <a
                          href="https://www.appersonautomotive.com"
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ textDecoration: 'underline', textAlign: 'center' }}
                        >
                      appersonautomotive.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
                <div className="row">
                  <div className="col">
                    <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
                      <h4 style={{ textAlign: 'center' }}>
                        <strong>
                      Our Hands and Feet
                      (
                          <a href="/ohaf">OHAF</a>
                      )
                        </strong>
                      </h4>
                      <p style={{ textAlign: 'center' }}>This app connects volunteers with charity opportunities.</p>
                      <div style={{ textAlign: 'center' }}>
                        <img
                          alt="OHAF Logo"
                          style={{ width: '260px' }}
                          src="https://web-jam.com/static/imgs/ohaf/charitylogo.png"
                        />
                        <br />
                        <a
                          href="http://www.ourhandsandfeet.org"
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ textDecoration: 'underline', textAlign: 'center' }}
                        >
                      ourhandsandfeet.org
                        </a>
                      </div>
                    </div>
                  </div>
                  <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
                  <div className="col">
                    <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
                      <h4 style={{ textAlign: 'center' }}>
                        <strong>
                      Tro Peaks Adventures
                        </strong>
                      </h4>
                      <p style={{ textAlign: 'center' }}>East African Tour &amp; Safari Company</p>
                      <div style={{ textAlign: 'center' }}>
                        <img
                          alt="Tro Peaks Logo"
                          style={{ width: '260px' }}
                          src="../static/imgs/TroPeaks.png"
                        />
                        <br />
                        <a
                          href="https://www.tro-peaks.com"
                          target="_blank"
                          rel="noreferrer noopener"
                          style={{ textDecoration: 'underline', textAlign: 'center' }}
                        >
                      tro-peaks.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* ToDo:Add in css for display none on this and other homepage based on viewport */}
          <div className="notWidescreen">
            <div className="material-content">
              <h3 style={{ textAlign: 'center', marginTop: '15px', marginBottom: '15px' }}>Our Current Projects</h3>
              <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
                <h4 style={{ textAlign: 'center' }}><strong>College Lutheran Church</strong></h4>
                <div style={{ textAlign: 'center' }}>
                  <img
                    alt="College Lutheran Church Homepage"
                    style={{ width: '260px' }}
                    src="https://dl.dropboxusercontent.com/s/354maifx0dkzt9s/Screenshot%20from%202019-02-22%2016-01-50.png?dl=0"
                  />
                  <br />
                  <a
                    href="https://www.collegelutheran.org"
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ textDecoration: 'underline', textAlign: 'center' }}
                  >
                      Collegeluthean.org
                  </a>
                </div>
              </div>
              <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
              <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
                <h4 style={{ textAlign: 'center' }}><strong>Apperson Automotive</strong></h4>
                <div style={{ textAlign: 'center' }}>
                  <img
                    alt="Apperson Automotive Home Page"
                    style={{ width: '260px' }}
                    src="../static/imgs/AppersonAutomotive.png"
                  />
                  <br />
                  <a
                    href="https://www.appersonautomotive.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ textDecoration: 'underline', textAlign: 'center' }}
                  >
                    appersonautomotive.com
                  </a>
                </div>
              </div>
              <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
              <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
                <h4 style={{ textAlign: 'center' }}>
                  <strong>
                      Our Hands and Feet
                      (
                    <a href="/ohaf">OHAF</a>
                      )
                  </strong>
                </h4>
                <p style={{ textAlign: 'center' }}>This app connects volunteers with charity opportunities.</p>
                <div style={{ textAlign: 'center' }}>
                  <img
                    alt="OHAF Logo"
                    style={{ width: '260px' }}
                    src="https://web-jam.com/static/imgs/ohaf/charitylogo.png"
                  />
                  <br />
                  <a
                    href="http://www.ourhandsandfeet.org"
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ textDecoration: 'underline', textAlign: 'center' }}
                  >
                      ourhandsandfeet.org
                  </a>
                </div>
              </div>
              <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
              <div className="elevation2" style={{ padding: '10px', maxWidth: '500px', margin: 'auto' }}>
                <h4 style={{ textAlign: 'center' }}>
                  <strong>
                      Tro Peaks Adventures
                  </strong>
                </h4>
                <p style={{ textAlign: 'center' }}>East African Tour &amp; Safari Company</p>
                <div style={{ textAlign: 'center' }}>
                  <img
                    alt="Tro Peaks Logo"
                    style={{ width: '260px' }}
                    src="../static/imgs/TroPeaks.png"
                  />
                  <br />
                  <a
                    href="https://www.tro-peaks.com"
                    target="_blank"
                    rel="noreferrer noopener"
                    style={{ textDecoration: 'underline', textAlign: 'center' }}
                  >
                      tro-peaks.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '6pt', marginBottom: '0' }}>&nbsp;</p>
        <div className="col-md-6" style={{ maxWidth: '500px', margin: 'auto' }}>
          <iframe
            className="widescreenHomepage"
            // eslint-disable-next-line max-len
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FWebJamLLC%2F&tabs=timeline&width=500&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=2207148322688942"
            width="500"
            height="500"
            style={{ border: 'none', overflow: 'hidden', marginLeft: '-14px' }}
            scrolling="none"
            allow="encrypted-media"
            title="facebook ticker"
          />
        </div>
        {/* ToDo:Add in css for display none on this and other homepage based on viewport */}
        <div className="notWidescreen" style={{ maxWidth: '300px', margin: 'auto' }}>
          <iframe
            className="notWideScreen"
            // eslint-disable-next-line max-len
            src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FWebJamLLC%2F&tabs=timeline&width=300&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=2207148322688942"
            width="300"
            height="300"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="none"
            allow="encrypted-media"
            title="facebook ticker"
          />
        </div>
      </div>
    );
  }
}
