import React from 'react';

const WideFacebookFeed = () => (
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
);

export default WideFacebookFeed;
