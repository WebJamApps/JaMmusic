import React from 'react';

const pageH4 = (pageTitle: string) => (
  <h4
    style={{
      textAlign: 'center',
      margin: '20px',
      fontWeight: 'bold',
      marginBottom: '0px',
      fontSize: '16pt',
    }}
    id="headerTitle"
  >
    {pageTitle}
  </h4>
);

const setIndex = (songs: any[], category: string) => {
  let categorySongs = [];
  const otherSongs = [];
  for (let i = 0; songs.length > i; i += 1) {
    // eslint-disable-next-line security/detect-object-injection
    if (songs[i].category === category) categorySongs.push(songs[i]);
    else otherSongs.push(songs[i]);// eslint-disable-line security/detect-object-injection
  }
  categorySongs = categorySongs.concat(otherSongs);
  return categorySongs;
};

function copyRight() { // eslint-disable-line class-methods-use-this
  return (<span>All Original Songs &copy;2019 &ndash; 2020 Web Jam LLC</span>);
}

function textUnderPlayer(song: any) {
  return (
    <section
      className="col-12 mt-1"
      style={{
        fontSize: '0.8em', marginTop: 0, marginBottom: '0', paddingTop: 0, paddingBottom: 0,
      }}
    >
      <strong>
        {song !== null ? song.title : null}
        {song !== null && song.composer !== undefined && song.category !== 'original' ? ` by ${song.composer}` : null}
        {song !== null && song.artist !== undefined ? ` - ${song.artist}` : null}
      </strong>
      <p style={{
        textAlign: 'center', fontSize: '8pt', marginTop: '4px', marginBottom: 0,
      }}
      >
        {song !== null && song.album !== undefined ? song.album : null}
        {song !== null && song.year !== undefined ? `, ${song.year}` : null}
      </p>
      <p style={{
        textAlign: 'center', fontSize: '8pt', marginTop: '2px', marginBottom: 0,
      }}
      >
        {song !== null && song.category === 'original' ? copyRight() : null}
      </p>
    </section>
  );
}

export default {
  pageH4,
  setIndex,
  textUnderPlayer,
  copyRight,
};
