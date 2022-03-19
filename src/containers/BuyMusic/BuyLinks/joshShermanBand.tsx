import React from 'react';

const JoshShermanBand = (): JSX.Element => (
  <div className="material-content elevation2" style={{ maxWidth: '3in', margin: 'auto', height: '3in' }}>
    <h5 style={{ textAlign: 'center' }}>Josh Sherman Band</h5>
    <div style={{ textAlign: 'center' }}>
      <a
        href="https://www.amazon.com/Live-Central-Florida-2001-Explicit/dp/B0015HGSEO/ref=ntt_mus_dp_dpt_1"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          background: 'url(https://m.media-amazon.com/images/I/81hDicJieTL._SS500_.jpg) 18px 2px no-repeat, '
            + 'url(http://content.cdbaby.com/img/links/link-artwork-cart-dark-buy-now.png) 0px 0px no-repeat',
          backgroundSize: '175px, 211px',
          height: '233px',
          width: '211px',
        }}
        title="Josh Sherman Band: live from central Florida, 2001 - 2005"
      >
        <span style={{ display: 'none' }}>Buy Josh Sherman Band</span>
      </a>
    </div>
  </div>
);

export default JoshShermanBand;
