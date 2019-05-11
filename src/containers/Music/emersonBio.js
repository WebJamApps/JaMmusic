import React from 'react';

const EmersonBio = () => (
  <div className="emersonBio">
    <h4 id="emersonbio" style={{ marginBottom: '4px' }}>Emerson Harvey</h4>
    <img
      alt="emerson"
      src="../static/imgs/emerson.jpg"
      style={{
        width: '288px', display: 'block', margin: 'auto', textAlign: 'center',
      }}
    />
    <p className="bioText">
        In 1969, I was 12 years old, I heard Jimi Hendrix on the radio and decided I had to learn to play guitar. Self taught for
        48 years now. Play lead and rhythm guitar. Favorite axe is
        still a Fender Stratocaster!
        Influences: Jimi Hendrix, Rolling Stones, Sex Pistols, Ramones, X, Talking Heads, BB King, Buddy Guy, Neil Young…….
        Can work a harmonica and acoustic guitar on demand.
    </p>
    <img
      alt="young emerson"
      src="../static/imgs/emersonY.jpg"
      style={{
        width: '288px', display: 'block', margin: 'auto', textAlign: 'center',
      }}
    />
  </div>
);

export default EmersonBio;
