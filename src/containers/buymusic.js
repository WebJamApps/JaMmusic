
import React, { Component } from 'react';


export default class BuyMusic extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <div className="page-content">
        <h3 style={{ textAlign: 'center', margin: '20px', fontWeight: 'bold' }}>Buy Music</h3>
        <p>&nbsp;</p>
        <div className="material-content elevation2" style={{ maxWidth: '4in', margin: 'auto' }}>
          <h4 style={{ textAlign: 'center' }}>Josh Sherman Band</h4>
          <div style={{ textAlign: 'center' }}>
            <a
              href="http://store.cdbaby.com/cd/jshermanband"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: 'url(http://CDBaby.name/j/s/jshermanband.jpg) 18px 2px no-repeat, '
                + 'url(http://content.cdbaby.com/img/links/link-artwork-cart-dark-buy-now.png) 0px 0px no-repeat',
                backgroundSize: '175px, 211px',
                height: '233px',
                width: '211px'
              }}
              title="Josh Sherman Band: live from central Florida, 2001 - 2005"
            />
          </div>
        </div>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
        <div className="material-content elevation2" style={{ margin: 'auto', maxWidth: '4in' }}>
          <h4 style={{ textAlign: 'center' }}>Josh Sherman Solo Acoustic</h4>
          <div style={{ textAlign: 'center' }}>
            <a
              href="http://store.cdbaby.com/cd/shermanjosh"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                textAlign: 'center',
                display: 'inline-block',
                background: 'url(http://CDBaby.name/s/h/shermanjosh.jpg) 18px 2px no-repeat, '
                + 'url(http://content.cdbaby.com/img/links/link-artwork-cart-light-buy-now.png) 0px 0px no-repeat',
                backgroundSize: '175px, 211px',
                height: '233px',
                width: '211px'
              }}
              title="Josh Sherman: Solo Acoustic"
              >
            </a>
          </div>
        </div>
        <p>&nbsp;</p>
        <p>&nbsp;</p>
      </div>
    );
  }
}
