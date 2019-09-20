import React from 'react';

const FacebookFeed = () => (
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
);

export default FacebookFeed;
