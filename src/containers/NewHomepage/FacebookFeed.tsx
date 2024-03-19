function FacebookFeed(): JSX.Element {
  return (
    <div
      style={{
        // eslint-disable-next-line max-len
        margin: 'auto', height: '500px', boxShadow: '0 4px 5px 0 rgba(0, 0, 0, 0.14), 0 1px 10px 0 rgba(0, 0, 0, 0.12), 0 2px 4px -1px rgba(0, 0, 0, 0.4)',
      }}
    >
      <iframe
        style={{ height: '100%', width: '100%' }}
        // eslint-disable-next-line max-len
        src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2FWebJamLLC%2F&tabs=timeline&width=500&height=500&small_header=true&adapt_container_width=true&hide_cover=false&show_facepile=true&appId=2207148322688942"
        allow="encrypted-media"
        title="facebook ticker"
      />
    </div>
  );
}

export default FacebookFeed;
