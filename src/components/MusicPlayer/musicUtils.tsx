import React from 'react';

const pageH4 = (pageTitle) => (
  <h4
    style={{
      textAlign: 'center',
      margin: '20px',
      fontWeight: 'bold',
      marginBottom: '6px',
    }}
    id="headerTitle"
  >
    {pageTitle}
  </h4>
);

const setIndex = (songs, category) => {
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

export default {
  pageH4,
  setIndex,
};
